import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaderboard } from '$lib/leaderboard';

/**
 * GET /leaderboard
 * Returns the top 10 chicken requesters
 * Who's the biggest poultry enthusiast?
 */
export const GET: RequestHandler = async () => {
	return json({
		title: 'Top Chicken Consumers',
		entries: getLeaderboard()
	});
};
