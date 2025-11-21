import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateChickens } from '$lib/chickens';
import { recordChickenRequest } from '$lib/leaderboard';

/**
 * GET /chicken
 * Returns the sacred word "chicken" repeated 1000 times
 */
export const GET: RequestHandler = async ({ request }) => {
	const clientId = request.headers.get('x-forwarded-for') || 'anonymous-chicken-lover';
	recordChickenRequest(clientId, 1000);

	return text(generateChickens(1000), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'X-Chicken-Count': '1000',
			'X-Enterprise-Poultry': 'true'
		}
	});
};
