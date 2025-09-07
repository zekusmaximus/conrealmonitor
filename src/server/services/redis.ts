import { redis } from '@devvit/web/server';

export async function getCount(): Promise<string | undefined> {
  return await redis.get('count');
}

export async function incrByCount(amount: number): Promise<number> {
  return await redis.incrBy('count', amount);
}

export async function setLogs(groupId: string, date: string, logs: string[]): Promise<void> {
  await redis.set(`logs:${groupId}:${date}`, JSON.stringify(logs));
}

export async function getLogs(groupId: string, date: string): Promise<string[] | null> {
  const data = await redis.get(`logs:${groupId}:${date}`);
  return data ? JSON.parse(data) : null;
}

export async function addDateToGroup(groupId: string, date: string): Promise<void> {
  // @ts-expect-error redis.sadd is not typed but available
  await redis.sadd(`dates:${groupId}`, date);
}

export async function getDatesForGroup(groupId: string): Promise<string[]> {
  // @ts-expect-error redis.smembers is not typed but available
  return await redis.smembers(`dates:${groupId}`);
}

export async function addGroup(groupId: string): Promise<void> {
  // @ts-expect-error redis.sadd is not typed but available
  await redis.sadd('groups', groupId);
}

export async function getGroups(): Promise<string[]> {
  // @ts-expect-error redis.smembers is not typed but available
  return await redis.smembers('groups');
}

export async function setLog(logId: string, data: string): Promise<void> {
  await redis.set(`log:${logId}`, JSON.stringify(data));
}

export async function getLog(logId: string): Promise<string | null> {
  const data = await redis.get(`log:${logId}`);
  return data ? JSON.parse(data) : null;
}

export async function isDateInGroup(groupId: string, date: string): Promise<boolean> {
  // @ts-expect-error redis.sismember is not typed but available
  const result = await redis.sismember(`dates:${groupId}`, date);
  return result === 1;
}

export async function scanGroups(cursor: number, count: number): Promise<{ cursor: number; groups: string[] }> {
  // @ts-expect-error redis.sscan is not typed but available
  const result = await redis.sscan('groups', cursor, 'COUNT', count);
  return {
    cursor: parseInt(result[0]),
    groups: result[1] as string[],
  };
}
