/**
 * Chicken Leaderboard
 * Tracking poultry consumption across the enterprise
 */

interface LeaderboardEntry {
	clientId: string;
	totalChickens: number;
	lastRequest: Date;
}

// In-memory store (resets on server restart, as intended)
const leaderboard: Map<string, LeaderboardEntry> = new Map();

export function recordChickenRequest(clientId: string, count: number): void {
	const existing = leaderboard.get(clientId);
	if (existing) {
		existing.totalChickens += count;
		existing.lastRequest = new Date();
	} else {
		leaderboard.set(clientId, {
			clientId,
			totalChickens: count,
			lastRequest: new Date()
		});
	}
}

export function getLeaderboard(): LeaderboardEntry[] {
	return Array.from(leaderboard.values())
		.sort((a, b) => b.totalChickens - a.totalChickens)
		.slice(0, 10); // Top 10 chicken consumers
}

export function getClientStats(clientId: string): LeaderboardEntry | undefined {
	return leaderboard.get(clientId);
}
