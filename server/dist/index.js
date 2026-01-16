"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const http_1 = __importDefault(require("http"));
require("dotenv/config");
const server_js_1 = require("./server.js");
const PORT = Number(process.env.PORT || 8000);
function getWorkerCount() {
    //   if (process.env.NODE_ENV !== 'production') return 1;
    //   if (process.env.WEB_CONCURRENCY) {
    //     return Number(process.env.WEB_CONCURRENCY);
    //   }
    return os_1.default.cpus().length;
}
if (cluster_1.default.isPrimary) {
    console.log(`Primary ${process.pid} started`);
    const WORKERS = getWorkerCount();
    console.log(`Starting ${WORKERS - 1} workers`);
    for (let i = 0; i < WORKERS - 1; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.error(`Worker ${worker.process.pid} exited (code=${code}, signal=${signal}})`);
        if (process.env.NODE_ENV === 'production') {
            console.log('Respawning worker...');
            cluster_1.default.fork();
        }
    });
    const shutdown = () => {
        console.log('Primary shutting down...');
        for (const id in cluster_1.default.workers) {
            cluster_1.default.workers[id]?.process.kill('SIGTERM');
        }
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
else {
    const app = (0, server_js_1.createServer)();
    const server = http_1.default.createServer(app);
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on ${PORT}, memory=${JSON.stringify(process.memoryUsage())}`);
    });
    const shutdownWorker = () => {
        console.log(`Worker ${process.pid} shutting down...`);
        server.close(() => {
            process.exit(0);
        });
        setTimeout(() => {
            console.error('Force exiting worker');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', shutdownWorker);
    process.on('SIGINT', shutdownWorker);
}
//# sourceMappingURL=index.js.map