import fs from 'fs';
import { app } from 'electron';

export const save = async (directory: string, name: string, content: string) => {
    const dir = `${app.getPath('userData')}${directory}`;
    const file = `${dir}/${name}`;

    try {
        try {
            await fs.promises.access(dir, fs.constants.R_OK);
        } catch {
            await fs.promises.mkdir(dir);
        }

        await fs.promises.writeFile(file, content, 'utf-8');
        return { success: true };
    } catch (error) {
        global.logger.error('user-data', `Save failed: ${error.message}`);
        return { success: false, error };
    }
};

export const read = async (directory: string, name: string) => {
    const dir = `${app.getPath('userData')}${directory}`;
    const file = `${dir}/${name}`;

    try {
        await fs.promises.access(file, fs.constants.R_OK);
    } catch {
        return { success: true, payload: undefined };
    }

    try {
        const payload = await fs.promises.readFile(file, 'utf-8');
        return { success: true, payload };
    } catch (error) {
        global.logger.error('user-data', `Read failed: ${error.message}`);
        return { success: false, error };
    }
};

export const clear = async () => {
    const dir = app.getPath('userData');
    try {
        await fs.promises.rm(dir, { recursive: true, force: true });
        return { success: true };
    } catch (error) {
        global.logger.error('user-data', `Remove dir failed: ${error.message}`);
        return { success: false, error };
    }
};

export const getInfo = () => {
    const dir = app.getPath('userData');
    try {
        return {
            success: true,
            payload: {
                dir,
                // possibly more info can be returned (size, last modified,...)
            },
        };
    } catch (error) {
        global.logger.error('user-data', `getInfo failed: ${error.message}`);
        return { success: false, error };
    }
};
