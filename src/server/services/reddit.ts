import { reddit, context } from '@devvit/web/server';

export async function getCurrentUsername(): Promise<string | undefined> {
  return await reddit.getCurrentUsername();
}

export async function getModerators(subredditName: string) {
  return await reddit.getModerators({ subredditName });
}

export async function setUserFlair(options: { subredditName: string; username: string; text: string; backgroundColor: string }): Promise<void> {
  await reddit.setUserFlair(options);
}

export async function submitPost(options: { subredditName: string; title: string; text: string }) {
  return await reddit.submitPost(options);
}

export async function getHotPosts(options: { subredditName: string; limit: number }) {
  return await reddit.getHotPosts(options);
}

export function getSubredditName(): string | undefined {
  return context.subredditName;
}
