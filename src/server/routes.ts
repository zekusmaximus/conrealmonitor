import express from 'express';
import { randomUUID } from 'crypto';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { createPost } from './core/post';
import dayjs from 'dayjs';
import rateLimit from 'express-rate-limit';
import { calculateFragmentation } from './calc';
import * as redisService from './services/redis';
import * as redditService from './services/reddit';
import { context } from '@devvit/web/server';

// Quantum flair synchronization function - bridging user reality with subreddit cosmos
async function setFlairForGroup(groupId: string): Promise<void> {
  console.log(`INFO: Initiating flair sync for group ${groupId}`);
  try {
    const allStrings: string[] = [];
    const dates = await redisService.getDatesForGroup(groupId);
    for (const date of dates) {
      const logs = await redisService.getLogs(groupId, date);
      if (logs) {
        allStrings.push(...logs);
      }
    }
    if (allStrings.length === 0) {
      console.log('WARN: No logs found for group');
      return;
    }
    const fragmentation = calculateFragmentation(allStrings);
    const index = fragmentation.toFixed(2);
    let color: string;
    if (fragmentation < 0.3) {
      color = '#22C55E'; // Green for stable realities
    } else if (fragmentation <= 0.7) {
      color = '#FBBF24'; // Yellow for fluctuating dimensions
    } else {
      color = '#EF4444'; // Red for chaotic multiverses
    }
    const username = await redditService.getCurrentUsername();
    if (!username) {
      console.log('WARN: No user detected');
      return;
    }
    const subreddit = redditService.getSubredditName() || 'conrealmonitor_dev';
    await redditService.setUserFlair({
      subredditName: subreddit,
      username,
      text: `Reality Index: ${index}`,
      backgroundColor: color,
    });
    console.log(`INFO: Flair synced successfully for ${username} in ${subreddit}`);
    console.log(`INFO: Flair details: fragmentation = ${fragmentation}, color = ${color}, text = "Reality Index: ${index}"`);
  } catch (error) {
    console.error(`ERROR: Flair sync failed: ${error}`);
    throw error; // Re-throw for endpoint handling
  }
}

const router = express.Router();

// Authentication middleware
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Check for Devvit origin via signed header
    const devvitToken = req.headers['x-devvit-token'];
    if (!devvitToken) {
      return res.status(401).json({ error: 'Unauthorized: Missing Devvit token' });
    }
    // TODO: Verify token signature (implement actual verification)
    const username = await redditService.getCurrentUsername();
    if (!username) {
      return res.status(401).json({ error: 'Unauthorized: No user' });
    }
    const subreddit = redditService.getSubredditName() || 'conrealmonitor_dev';
    const moderators = await redditService.getModerators(subreddit);
    let isMod = false;
    for await (const mod of moderators) {
      if (mod.username === username) {
        isMod = true;
        break;
      }
    }
    if (!isMod) {
      return res.status(403).json({ error: 'Forbidden: Moderator access required' });
    }
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply middleware to /internal routes
router.use('/internal', authMiddleware, limiter);

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (req, res): Promise<void> => {
    const postId = req.params.postId || req.query.postId as string || randomUUID();

    if (!postId) {
      console.error('ERROR: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redisService.getCount(),
        redditService.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`ERROR: Initialization failed for post ${postId}:`, error);
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
    const postId = context.postId;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redisService.incrByCount(1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const postId = context.postId;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redisService.incrByCount(-1),
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
      message: `Post created in subreddit ${redditService.getSubredditName()} with id ${post.id}`,
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
      navigateTo: `https://reddit.com/r/${redditService.getSubredditName()}/comments/${post.id}`,
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
    const { strings } = req.body;
    if (!Array.isArray(strings)) {
      console.error('🚫 Invalid request: strings array required');
      res.status(400).json({
        status: 'error',
        message: 'strings array is required',
      });
      return;
    }
    const groupId = randomUUID();
    const date = dayjs().toISOString().split('T')[0]!;
    console.log(`📝 Creating new group ${groupId} with ${strings.length} strings`);
    await redisService.setLogs(groupId, date, strings);
    await redisService.addDateToGroup(groupId, date);
    await redisService.addGroup(groupId);
    console.log('✅ Group stored successfully');
    res.json({
      status: 'success',
      uuid: groupId,
      alert: `New group created with UUID: ${groupId}`,
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
    const body = req.body;
    let logId = body.logId;
    const data = body.data;
    const groupId = body.groupId;
    if (!data) {
      console.error('🚫 Invalid request: data required');
      res.status(400).json({
        status: 'error',
        message: 'data is required',
      });
      return;
    }
    if (!logId) {
      logId = randomUUID();
    }
    console.log(`📝 Storing log ${logId}`);
    if (groupId) {
      const date = dayjs().toISOString().split('T')[0]!;
      const existingLogs = await redisService.getLogs(groupId, date) || [];
      existingLogs.push(data);
      await redisService.setLogs(groupId, date, existingLogs);
      const isMember = await redisService.isDateInGroup(groupId, date);
      if (!isMember) {
        await redisService.addDateToGroup(groupId, date);
      }
    } else {
      await redisService.setLog(logId, data);
    }
    console.log('✅ Log stored successfully');
    res.json({
      status: 'success',
      message: `Log ${logId} stored`,
      logId,
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
    const allStrings: string[] = [];
    const dates = await redisService.getDatesForGroup(groupId);
    for (const date of dates) {
      const logs = await redisService.getLogs(groupId, date);
      if (logs) {
        allStrings.push(...logs);
      }
    }
    if (allStrings.length === 0) {
      console.error('🚫 No logs found for group');
      res.status(404).json({
        status: 'error',
        message: 'Group not found',
      });
      return;
    }
    console.log(`📊 Calculating fragmentation for ${allStrings.length} strings`);
    const fragmentation = calculateFragmentation(allStrings);
    console.log('✅ Fragmentation calculated successfully');
    // Determine consensus reality text (most frequent string)
    const countMap = new Map<string, number>();
    for (const str of allStrings) {
      countMap.set(str, (countMap.get(str) || 0) + 1);
    }
    let consensusRealityText = '';
    let maxCount = 0;
    for (const [str, count] of countMap) {
      if (count > maxCount) {
        maxCount = count;
        consensusRealityText = str;
      }
    }
    // Fragmented realities: up to 3 strings
    const fragmentedRealities = allStrings.slice(0, 3);
    res.json({
      status: 'success',
      groupId,
      fragmentation,
      consensusRealityText,
      fragmentedRealities,
      stringCount: allStrings.length,
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

router.post('/internal/share-group/:groupId', async (req, res): Promise<void> => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      console.error('🚫 Invalid request: groupId required for share');
      res.status(400).json({ error: 'groupId required' });
      return;
    }
    console.log(`📢 Sharing group ${groupId} on Reddit`);
    const post = await redditService.submitPost({
      subredditName: redditService.getSubredditName() || 'conrealmonitor_dev',
      title: 'Join our Reality Monitoring Group!',
      text: `Join our reality monitoring group with UUID: ${groupId}`,
    });
    console.log('✅ Share post created successfully');
    res.json({ status: 'success', postId: post.id });
  } catch (error) {
    console.error(`💥 Error creating share post: ${error}`);
    res.status(500).json({ error: 'Failed to create share post' });
  }
});

router.post('/internal/daily-report', async (_req, res): Promise<void> => {
  try {
    const date = dayjs().toISOString().split('T')[0]!;
    const allStrings: string[] = [];
    let cursor = 0;
    do {
      const result = await redisService.scanGroups(cursor, 100);
      cursor = result.cursor;
      for (const groupId of result.groups) {
        const logs = await redisService.getLogs(groupId, date);
        if (logs) {
          allStrings.push(...logs);
        }
      }
    } while (cursor !== 0);
    if (allStrings.length === 0) {
      console.log('No logs for today, skipping report.');
      res.json({ status: 'success', message: 'No data to report' });
      return;
    }
    const fragmentation = calculateFragmentation(allStrings);
    // Find most common reality
    const countMap = new Map<string, number>();
    for (const str of allStrings) {
      countMap.set(str, (countMap.get(str) || 0) + 1);
    }
    let consensus = '';
    let maxCount = 0;
    for (const [str, count] of countMap) {
      if (count > maxCount) {
        maxCount = count;
        consensus = str;
      }
    }
    const title = `Daily Reality Report: ${date}`;
    const body = `The multiverse stabilized at index ${fragmentation.toFixed(2)}! Consensus: ${consensus}. 🌌 Reality fragments are aligning nicely today!`;
    await redditService.submitPost({
      subredditName: 'conrealmonitor_dev',
      title,
      text: body,
    });
    console.log('Daily report posted successfully.');
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Report lost in hyperspace.', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate report' });
  }
});

router.get('/internal/reports', async (_req, res): Promise<void> => {
  try {
    const posts = await redditService.getHotPosts({ subredditName: 'conrealmonitor_dev', limit: 50 });
    res.json({ status: 'success', reports: posts });
  } catch (error) {
    console.error('Failed to fetch reports', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
});

export { router };
