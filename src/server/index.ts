// Checkpoint: Test with devvit playtest in private sub. Verify server initialization and endpoint responses.
import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import compareTwoStrings from 'string-similarity-js';

export function calculateFragmentation(strings: string[]): number {
  console.log('🧩 Calculating fragmentation like a puzzle master!');
  const validStrings = strings.filter(s => typeof s === 'string' && s.length > 0);
  if (validStrings.length < 2) {
    console.log('🤏 Not enough valid strings for fragmentation analysis');
    return 0;
  }
  let totalSimilarity = 0;
  let pairs = 0;
  for (let i = 0; i < validStrings.length; i++) {
    for (let j = i + 1; j < validStrings.length; j++) {
      const similarity = compareTwoStrings(validStrings[i]!, validStrings[j]!);
      totalSimilarity += similarity;
      pairs++;
      console.log(`🔍 Comparing "${validStrings[i]}" and "${validStrings[j]}": ${similarity}`);
    }
  }
  const avgSimilarity = totalSimilarity / pairs;
  const fragmentation = 1 - avgSimilarity;
  console.log(`🎯 Average similarity: ${avgSimilarity}, Fragmentation: ${fragmentation}`);
  return fragmentation;
}

// Quantum flair synchronization function - bridging user reality with subreddit cosmos
async function setFlairForGroup(groupId: string): Promise<void> {
  console.log(`🚀 Initiating flair sync for group ${groupId} in the multiverse`);
  try {
    const data = await redis.get(`group:${groupId}`);
    if (!data) {
      console.log('🌌 No data found for this reality fragment');
      return;
    }
    const strings: string[] = JSON.parse(data);
    const fragmentation = calculateFragmentation(strings);
    const index = fragmentation.toFixed(2);
    let color: string;
    if (fragmentation < 0.3) {
      color = '#22C55E'; // Green for stable realities
    } else if (fragmentation <= 0.7) {
      color = '#FBBF24'; // Yellow for fluctuating dimensions
    } else {
      color = '#EF4444'; // Red for chaotic multiverses
    }
    const username = await reddit.getCurrentUsername();
    if (!username) {
      console.log('👤 No user detected in this timeline');
      return;
    }
    const subreddit = context.subredditName || 'conrealmonitor_dev';
    // Syncing flair to the multiverse
    await reddit.setUserFlair({
      subredditName: subreddit,
      username,
      text: `Reality Index: ${index}`,
      backgroundColor: color,
    });
    console.log(`✨ Flair synced successfully for ${username} in ${subreddit}`);
    console.log(`🔍 Flair details: fragmentation ${fragmentation}, color ${color}, text "Reality Index: ${index}"`);
  } catch (error) {
    console.error(`💥 Flair sync failed: ${error}`);
    throw error; // Re-throw for endpoint handling
  }
}

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/groups', async (req, res): Promise<void> => {
  try {
    const { groupId, strings } = req.body;
    if (!groupId || !Array.isArray(strings)) {
      console.error('🚫 Invalid request: groupId and strings array required');
      res.status(400).json({
        status: 'error',
        message: 'groupId and strings array are required',
      });
      return;
    }
    console.log(`📝 Storing group ${groupId} with ${strings.length} strings`);
    await redis.set(`group:${groupId}`, JSON.stringify(strings));
    console.log('✅ Group stored successfully');
    res.json({
      status: 'success',
      message: `Group ${groupId} stored`,
    });
  } catch (error) {
    console.error(`💥 Error storing group: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to store group',
    });
  }
});

router.post('/internal/logs', async (req, res): Promise<void> => {
  try {
    const { logId, data, groupId } = req.body;
    if (!logId || !data) {
      console.error('🚫 Invalid request: logId and data required');
      res.status(400).json({
        status: 'error',
        message: 'logId and data are required',
      });
      return;
    }
    console.log(`📝 Storing log ${logId}`);
    await redis.set(`log:${logId}`, JSON.stringify(data));
    console.log('✅ Log stored successfully');
    res.json({
      status: 'success',
      message: `Log ${logId} stored`,
    });
    // Trigger flair update if groupId provided - syncing reality after log entry
    if (groupId) {
      try {
        console.log(`🔄 Auto-triggering flair update for group ${groupId} post-log`);
        await setFlairForGroup(groupId);
        console.log('✅ Flair auto-updated after log submission');
      } catch (flairError) {
        console.error(`💥 Failed to auto-update flair: ${flairError}`);
        // Don't fail the log submission due to flair error
      }
    }
  } catch (error) {
    console.error(`💥 Error storing log: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to store log',
    });
  }
});

router.get('/internal/group-data/:groupId', async (req, res): Promise<void> => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      console.error('🚫 Invalid request: groupId required');
      res.status(400).json({
        status: 'error',
        message: 'groupId is required',
      });
      return;
    }
    console.log(`🔍 Fetching group data for ${groupId}`);
    const data = await redis.get(`group:${groupId}`);
    if (!data) {
      console.error('🚫 Group not found');
      res.status(404).json({
        status: 'error',
        message: 'Group not found',
      });
      return;
    }
    const strings: string[] = JSON.parse(data);
    console.log(`📊 Calculating fragmentation for ${strings.length} strings`);
    const fragmentation = calculateFragmentation(strings);
    console.log('✅ Fragmentation calculated successfully');
    res.json({
      status: 'success',
      groupId,
      fragmentation,
      stringCount: strings.length,
    });
  } catch (error) {
    console.error(`💥 Error fetching group data: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch group data',
    });
  }
});

router.post('/internal/set-flair/:groupId', async (req, res): Promise<void> => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      console.error('🚫 Invalid request: groupId required for flair sync');
      res.status(400).json({ error: 'groupId required' });
      return;
    }
    console.log(`🔮 Triggering flair update for group ${groupId}`);
    await setFlairForGroup(groupId);
    console.log('✅ Flair update completed');
    res.json({ status: 'success', message: 'Flair updated successfully' });
  } catch (error) {
    console.error(`💥 Error in flair endpoint: ${error}`);
    res.status(500).json({ error: 'Flair update failed - check mod permissions' });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
