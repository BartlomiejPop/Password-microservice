import { pathToFileURL } from 'node:url';
import { startServer } from './app.js';

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  void startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
