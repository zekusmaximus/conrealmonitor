import express from 'express';
import { router } from './routes';

export const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));

// Use router middleware
app.use(router);
