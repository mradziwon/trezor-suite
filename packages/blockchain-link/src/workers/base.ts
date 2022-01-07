// Abstract class extended by WorkerModule (see /src/workers/*/index.ts)
// Provides an interface of WorkerGlobalScope to behave as regular WebWorker (see /src/index.ts)
// Goal is to Make no difference from the implementation point of view between:
// new BlockchainLink({ worker: () => new Worker('path-to-file.js') });
// and
// new BlockchainLink({ worker: () => new BlockchainLinkModule() });

import { CustomError } from '../constants/errors';
import { WorkerState } from './state';
import { MESSAGES, RESPONSES } from '../constants';
import type { Message, Response } from '../types';

// declare worker types locally
// tsconfig is using "dom" in compilerOptions.
declare const WorkerGlobalScope: ObjectConstructor | undefined;
declare const self: { postMessage: (...args: any[]) => any };
declare const importScripts: any;

// detect if script is running in worker context
export const CONTEXT =
    (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ||
    typeof importScripts !== 'undefined'
        ? 'worker'
        : 'main';

export type ContextType<API> = {
    connect: () => Promise<API>;
    post: (r: Response) => void;
    state: WorkerState;
};

export class BaseWorker<API> {
    api: API | undefined;
    endpoints: string[] = [];
    state: WorkerState;
    post: (data: Response) => void;

    constructor() {
        if (CONTEXT === 'worker') {
            // post will be processed by WorkerGlobalScope interface
            this.post = (data: Response) => self.postMessage(data);
        } else {
            // post will be processed in handler provided by src/index
            this.post = (data: Response) => this.onmessage({ data });
        }

        this.state = new WorkerState();

        // send handshake to src/index
        // timeout is required, onmessage handler is set after initialization
        setTimeout(() => {
            this.post({ id: -1, type: MESSAGES.HANDSHAKE });
        }, 10);
    }

    cleanup() {
        this.api = undefined;
        this.endpoints = [];

        this.state.removeAccounts(this.state.getAccounts());
        this.state.removeAddresses(this.state.getAddresses());
        this.state.clearSubscriptions();
    }

    connect(): Promise<API> {
        // override by src/workers/*/index
        return Promise.reject();
    }

    shuffleEndpoints(a: string[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    disconnect() {
        // override by src/workers/*/index
    }

    // handle common messages and return true if processed.
    // other messages are handled by each WorkerModule separately
    async messageHandler(event: { data: Message }) {
        if (!event.data) return true;
        const { data } = event;
        const { id } = data;

        this.state.debug('onmessage', data);

        if (data.type === MESSAGES.HANDSHAKE) {
            this.state.setSettings(data.settings);
            return true;
        }
        if (data.type === MESSAGES.CONNECT) {
            await this.connect();
            this.post({ id, type: RESPONSES.CONNECT, payload: true });
            return true;
        }
        if (data.type === MESSAGES.DISCONNECT) {
            this.disconnect();
            this.post({ id, type: RESPONSES.DISCONNECTED, payload: true });
            return true;
        }
        if (data.type === MESSAGES.TERMINATE) {
            this.cleanup();
            return true;
        }
    }

    errorResponse(id: number, error: unknown) {
        const payload = { code: '', message: '' };
        if (error instanceof Error) {
            payload.message = error.message;
            payload.code = error instanceof CustomError && error.code ? error.code : '';
        }
        this.post({
            id,
            type: RESPONSES.ERROR,
            payload,
        });
    }

    // WorkerGlobalScope interface methods used ONLY in module context
    postMessage(data: Message) {
        this.messageHandler({ data });
    }

    onmessage(_evt: { data: Response }) {
        // override by src/index
    }
    onmessageerror(_error: Error) {
        // override by src/index
    }
    onerror(_error: Error) {
        // override by src/index
    }

    terminate() {
        this.postMessage({ id: -1, type: MESSAGES.TERMINATE });
    }
}
