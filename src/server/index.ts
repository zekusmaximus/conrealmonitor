import { Devvit } from '@devvit/public-api';
import express from 'express';
import { createServer, getServerPort } from '@devvit/server';
import { redis } from '@devvit/web/server';
import dayjs from 'dayjs';  // For date handling
import crypto from 'crypto';  // For UUID

console.log('Configuring Devvit...');

// Diagnostic logs for debugging
console.log('Redis methods:', Object.getOwnPropertyNames(redis));
console.log('Devvit properties:', Object.getOwnPropertyNames(Devvit));
try {
  console.log('Devvit.Blocks properties:', Object.getOwnPropertyNames((Devvit as any).Blocks));
} catch (e) {
  console.log('Devvit.Blocks is not accessible:', String(e));
}

Devvit.configure({
  http: true,  // Required to enable custom endpoints
  redis: true   // For storage
});

// Create Express app
const app = express();

console.log('Express app created');

// Middleware for JSON body parsing (if needed for POSTs)
app.use(express.json());

console.log('Defining POST /internal/groups route');

// POST /internal/groups: Create group with UUID
app.post('/internal/groups', async (_req, res) => {
  console.log('Groups endpoint hit');
  try {
    const groupId = crypto.randomUUID();
    await redis.set(`group:${groupId}`, 'active');  // Store in Redis
    res.status(200).json({ groupId });
  } catch (error) {
    console.error('Failed to create group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

console.log('Defining POST /internal/logs route');

// POST /internal/logs: Log a reality
app.post('/internal/logs', async (_req, res) => {
  console.log('Logs endpoint hit');
  const { userId, groupId, reality } = _req.body;
  try {
    if (!userId || !groupId || !reality) {
      return res.status(400).json({ error: 'Invalid log' });
    }
    const date = dayjs().toISOString().split('T')[0];
    await redis.lpush(`logs:${groupId}:${date}`, JSON.stringify({ userId, reality }));  // Append to list
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Failed to log reality:', error);
    res.status(500).json({ error: 'Invalid log' });
  }
});

console.log('Defining GET /internal/ping route');

app.get('/internal/ping', (_req, res) => {
  console.log('Ping endpoint hit');
  res.status(200).json({ status: 'ok' });
});

// Add other endpoints as needed (e.g., GET /internal/group-data/:groupId)

// Define custom post type for rendering the app
console.log('Adding custom post type RenderPostContent');
Devvit.addCustomPostType({
  name: 'RenderPostContent',
  render: () => {
    return Devvit.Blocks.WebView({
      url: 'index.html',
      height: 'tall'
    });
  }
});

// Create and start the server
const server = createServer(app);
server.listen(getServerPort(), () => {
  console.log(`Server listening on port ${getServerPort()}`);
});

export default Devvit;
