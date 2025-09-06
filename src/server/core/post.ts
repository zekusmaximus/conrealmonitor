import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitPost({
    subredditName: subredditName,
    title: `conrealmonitor - ${new Date().toISOString()}`,
    text: 'Monitoring reality fragments',
  });
};
