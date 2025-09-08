import { createServer, getServerPort } from '@devvit/web/server';
import { app } from './server';

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
