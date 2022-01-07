import { WorkerState } from '../../src/workers/state';
import fixtures from './fixtures/state';

const state = new WorkerState();

describe('Add and remove address in sequence', () => {
    fixtures.addAddresses.forEach(f => {
        it('add address', () => {
            try {
                // @ts-expect-error invalid param
                const unique = state.addAddresses(f.input);
                expect(unique).toEqual(f.unique);
                expect(state.getAddresses()).toEqual(f.subscribed);
            } catch (error) {
                expect(error.message).toEqual(f.error);
            }
        });
    });

    fixtures.removeAddresses.forEach(f => {
        it('remove address', () => {
            try {
                // @ts-expect-error invalid param
                const unique = state.removeAddresses(f.input);
                expect(unique).toEqual(f.subscribed);
                expect(state.getAddresses()).toEqual(f.subscribed);
            } catch (error) {
                expect(error.message).toEqual(f.error);
            }
        });
    });
});

describe('Add and remove account in sequence', () => {
    fixtures.addAccounts.forEach(f => {
        it('add account', () => {
            // @ts-expect-error invalid param
            state.addAccounts(f.input);
            expect(state.getAccounts()).toEqual(f.subscribedAccounts);
            expect(state.getAddresses()).toEqual(f.subscribedAddresses);
        });
    });

    fixtures.removeAccounts.forEach(f => {
        it('remove account', () => {
            state.removeAccounts(f.input);
            expect(state.getAccounts()).toEqual(f.subscribedAccounts);
            expect(state.getAddresses()).toEqual(f.subscribedAddresses);
        });
    });
});

describe('Debug', () => {
    it('logs', () => {
        state.setSettings({
            name: 'Test',
            debug: true,
            worker: 'foo.js',
            server: [],
        });
        const spyLog = jest.spyOn(console, 'log').mockImplementation();
        const spyWarn = jest.spyOn(console, 'warn').mockImplementation();
        const spyError = jest.spyOn(console, 'error').mockImplementation();
        state.debug('Debug log message');
        state.debug('warn', 'Debug warning message');
        state.debug('error', 'Debug error message');
        expect(spyLog).toHaveBeenCalledTimes(1);
        expect(spyWarn).toHaveBeenCalledTimes(1);
        expect(spyError).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });
});
