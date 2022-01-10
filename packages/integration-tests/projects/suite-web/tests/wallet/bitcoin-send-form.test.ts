// @group:wallet
// @retry=2

const ADDRESS_INDEX_1 = 'bcrt1qkvwu9g3k2pdxewfqr7syz89r3gj557l374sg5v';

describe('Send form for bitcoin', () => {
    beforeEach(() => {
        cy.task('startEmu', { version: Cypress.env('emuVersionT2'), wipe: true });
        cy.task('setupEmu', {
            needs_backup: true,
            mnemonic: 'all all all all all all all all all all all all',
        });
        cy.task('startBridge');

        cy.viewport(1080, 1440).resetDb();

        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
    });

    it('add and remove output in send form', () => {
        // when graph becomes visible, discovery was finished
        cy.discoveryShouldFinish();

        cy.enableRegtestAndGetCoins({
            payments: [
                {
                    address: ADDRESS_INDEX_1,
                    amount: 1,
                },
            ],
        });

        cy.getTestElement('@suite/menu/wallet-index').click();

        cy.getTestElement('@account-menu/regtest/normal/0/label').click();
        cy.getTestElement('@wallet/menu/wallet-send').click();

        // todo: missing validators for currency REGTEST
        // cy.getTestElement('outputs[0].address').type(ADDRESS_INDEX_1, {});

        // test adding and removing outputs
        cy.getTestElement('outputs[0].amount', { scrollBehavior: 'center' }).type(0.3);
        cy.getTestElement('add-output').click();
        cy.getTestElement('outputs[1].amount', { scrollBehavior: false }).type(0.6);
        cy.getTestElement('outputs[0].remove').click();
        cy.wait(10); // wait for animation
        cy.getTestElement('outputs[0].amount').should('be.visible'); // 1 output is visible

    });
});
