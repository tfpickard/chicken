import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /health
 * Enterprise health check endpoint
 * Always returns chicken because chicken is always healthy
 */
export const GET: RequestHandler = async () => {
	return json({ status: 'chicken' });
};
