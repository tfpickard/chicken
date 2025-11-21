import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CHICKEN_FRAMES } from '$lib/chickens';

/**
 * GET /ascii/rave
 * Returns all ASCII chicken frames for client-side rave animation
 * Recommended: animate at 4 fps (250ms per frame) for optimal poultry experience
 */
export const GET: RequestHandler = async () => {
	return json({
		frames: CHICKEN_FRAMES.slice(0, 8), // First 8 frames for rave mode
		fps: 4,
		intervalMs: 250,
		instructions: 'Loop through frames array every intervalMs for maximum chicken energy'
	});
};
