import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateChickenArray } from '$lib/chickens';
import { recordChickenRequest } from '$lib/leaderboard';

/**
 * GET /chicken/json
 * Returns an array of chickens because sometimes you need structured poultry
 */
export const GET: RequestHandler = async ({ request, url }) => {
	const countParam = url.searchParams.get('count');
	const count = countParam ? parseInt(countParam, 10) : 1000;

	if (isNaN(count)) {
		return json({ cluck: 'nope' }, { status: 400 });
	}

	const clientId = request.headers.get('x-forwarded-for') || 'anonymous-chicken-lover';
	const safeCount = Math.min(Math.max(1, count), 50000);
	recordChickenRequest(clientId, safeCount);

	return json({
		chickens: generateChickenArray(safeCount),
		count: safeCount,
		enterprise: true
	});
};
