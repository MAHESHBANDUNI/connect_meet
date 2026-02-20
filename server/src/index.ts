import cluster from 'cluster';
import os from 'os';
import http from 'http';
import 'dotenv/config';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT || 8000);

function getWorkerCount(): number {
  return os.cpus().length;
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} started`);

  const WORKERS = getWorkerCount();
  console.log(`Starting ${WORKERS-1} workers`);

  for (let i = 0; i < WORKERS-1; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} exited (code=${code}, signal=${signal}})`
    );

    if (process.env.NODE_ENV === 'production') {
      console.log('Respawning worker...');
      cluster.fork();
    }
  });

  const shutdown = () => {
    console.log('Primary shutting down...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.process.kill('SIGTERM');
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

} else {
  const app = createServer();
  const server = http.createServer(app);

  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

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
    }, 10_000);
  };

  process.on('SIGTERM', shutdownWorker);
  process.on('SIGINT', shutdownWorker);
}
