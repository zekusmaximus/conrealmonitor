import { Devvit } from '@devvit/public-api';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import * as redisService from './services/redis';

Devvit.configure({
  http: true,
  redis: true,
});


export { router } from './routes';
