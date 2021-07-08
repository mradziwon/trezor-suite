/**
 * Local web server for handling requests to app
 */
import { app, ipcMain } from 'electron';

import { buyRedirectHandler } from '@desktop-electron/libs/buy';
import { sellRedirectHandler } from '@desktop-electron/libs/sell';
import { HttpReceiver } from '@desktop-electron/libs/http-receiver';

// External request handler
const httpReceiver = new HttpReceiver();

const init = ({ mainWindow, spendWindow, src }: Dependencies) => {
    const { logger } = global;

    // wait for httpReceiver to start accepting connections then register event handlers
    httpReceiver.on('server/listening', () => {
        // when httpReceiver accepted oauth response
        httpReceiver.on('oauth/response', message => {
            mainWindow.webContents.send('oauth/response', message);
            app.focus();
        });

        httpReceiver.on('invity/buy-redirect', url => {
            buyRedirectHandler(url, mainWindow, src);
        });

        httpReceiver.on('invity/sell-redirect', url => {
            sellRedirectHandler(url, mainWindow, src);
        });

        httpReceiver.on('invity/spend-message', event => {
            mainWindow.webContents.send('invity/spend-message', event);
            spendWindow?.minimize();
        });

        // when httpReceiver was asked to provide current address for given pathname
        ipcMain.handle('server/request-address', (_, pathname) =>
            httpReceiver.getRouteAddress(pathname),
        );
    });

    logger.info('http-receiver', 'Starting server');
    httpReceiver.start();
    app.on('before-quit', () => {
        logger.info('http-receiver', 'Stopping server (app quit)');
        httpReceiver.stop();
    });
};

export default init;
