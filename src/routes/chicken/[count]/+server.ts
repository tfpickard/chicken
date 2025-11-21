import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateChickens } from '$lib/chickens';
import { recordChickenRequest } from '$lib/leaderboard';

/**
 * GET /chicken/:count
 * Returns "chicken" repeated count times (max 50k to protect the universe)
 */
export const GET: RequestHandler = async ({ params, request }) => {
	const countParam = params.count;
	const count = parseInt(countParam, 10);

	// If not a valid number, return the sacred error
	if (isNaN(count)) {
		return json({ cluck: 'nope' }, { status: 400 });
	}

	const clientId = request.headers.get('x-forwarded-for') || 'anonymous-chicken-lover';
	const safeCount = Math.min(Math.max(1, count), 50000);
	recordChickenRequest(clientId, safeCount);

	return text(generateChickens(safeCount), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'X-Chicken-Count': String(safeCount),
			'X-Enterprise-Poultry': 'true'
		}
	});
};
