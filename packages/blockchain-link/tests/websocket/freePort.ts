import * as net from 'net';

// using a free port instead of a constant port enables parallelization
export const getFreePort = () =>
    new Promise<number>((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, () => {
            const { port } = server.address() as net.AddressInfo;
            server.close(() => {
                resolve(port);
            });
        });
    });
