declare module 'tiny-worker' {
    namespace Worker {}
    class Worker {
        constructor(type: string | (() => any));
        onerror: () => any | undefined;
        onmessage: () => any | undefined;
        addEventListener(event: string, fn: () => any): void;
        postMessage(event: string, fn: () => any): void;
        terminate(event: string, fn: () => any): void;
        setRange(event: string, fn: () => any): boolean;
    }
    export = Worker;
}
