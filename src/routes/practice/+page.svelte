<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let input = '';
	let n = 0; // Number of successful "chicken" typings
	let startTime: number | null = null;
	let currentTime = 0;
	let timerInterval: number;
	let dBchicken = 0;
	let highScore = 0;
	let isGameStarted = false;

	const TARGET = 'chicken';
	let expectedIndex = 0;

	// Load high score from localStorage
	onMount(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('chickenPracticeHighScore');
			if (saved) highScore = parseFloat(saved);
		}
	});

	function startGame() {
		if (!isGameStarted) {
			isGameStarted = true;
			startTime = Date.now();
			timerInterval = window.setInterval(() => {
				if (startTime) {
					currentTime = (Date.now() - startTime) / 1000;
					updateScore();
				}
			}, 10);
		}
	}

	function updateScore() {
		if (currentTime > 0) {
			dBchicken = (n / currentTime) * 100;
			if (dBchicken > highScore) {
				highScore = dBchicken;
				if (typeof window !== 'undefined') {
					localStorage.setItem('chickenPracticeHighScore', highScore.toString());
				}
			}
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newChar = target.value[target.value.length - 1];

		if (!isGameStarted) {
			startGame();
		}

		// Check if the new character matches the expected character
		if (newChar === TARGET[expectedIndex]) {
			expectedIndex++;

			// If we've completed the word "chicken"
			if (expectedIndex === TARGET.length) {
				n++;
				expectedIndex = 0;
				input = '';
				target.value = '';
				updateScore();
			} else {
				input = target.value;
			}
		} else {
			// Mistake! Reset everything
			reset();
			target.value = '';
		}
	}

	function reset() {
		n = 0;
		startTime = null;
		currentTime = 0;
		dBchicken = 0;
		expectedIndex = 0;
		input = '';
		isGameStarted = false;
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	}

	onDestroy(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});

	$: progress = input.length;
	$: nextChar = TARGET[expectedIndex] || '';
	$: remainingChars = TARGET.slice(expectedIndex);
</script>

<svelte:head>
	<title>Chicken Practice - CaaS</title>
</svelte:head>

<main>
	<div class="container">
		<h1>🐔 CHICKEN PRACTICE 🐔</h1>

		<div class="instructions">
			<p>Peck "chicken" as chick chickens as you cluck without clucking a mischicken!</p>
			<p class="warning">⚠️ ONE DEFORMED CHICKEN = NO CHICKEN ⚠️</p>
		</div>

		<div class="stats">
			<div class="stat-box">
				<div class="stat-label">CHICKENS PECKED</div>
				<div class="stat-value">{n}</div>
			</div>

			<div class="stat-box">
				<div class="stat-label">TIME (seconds)</div>
				<div class="stat-value">{currentTime.toFixed(2)}</div>
			</div>

			<div class="stat-box highlight">
				<div class="stat-label">CHICKENS</div>
				<div class="stat-value score">{dBchicken.toFixed(2)} dBchicken</div>
			</div>

			<div class="stat-box">
				<div class="stat-label">HIGH SCORE</div>
				<div class="stat-value">{highScore.toFixed(2)} dBchicken</div>
			</div>
		</div>

		<div class="game-area">
			<div class="target-word">
				<span class="completed">{input}</span><span class="remaining">{remainingChars}</span>
			</div>

			<input
				type="text"
				class="typing-input"
				on:input={handleInput}
				placeholder={isGameStarted ? 'Keep pecking...' : 'Cluck pecking "chicken"...'}
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
			/>

			<button class="reset-btn" on:click={reset}>RECHICK</button>
		</div>

		<div class="formula">
			<p>Score Formula: (n / t) × 100 dBchicken</p>
			<p class="formula-detail">where n = chickens typed, t = time in seconds</p>
		</div>

		<div class="navigation">
			<a href="/">← Back to Home</a>
		</div>
	</div>
</main>

<style>
	:global(body) {
		background-color: #000;
		color: #ffff00;
		font-family: 'Courier New', monospace;
		margin: 0;
		padding: 0;
	}

	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: linear-gradient(45deg, #000 25%, #111 25%, #111 50%, #000 50%, #000 75%, #111 75%, #111);
		background-size: 40px 40px;
	}

	.container {
		max-width: 800px;
		width: 100%;
		text-align: center;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 2rem;
		text-shadow: 3px 3px 0 #ff6600, 6px 6px 0 #00ffff;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.instructions {
		background: #ffff00;
		color: #000;
		padding: 1.5rem;
		border: 5px solid #ff6600;
		margin-bottom: 2rem;
		font-weight: bold;
	}

	.instructions p {
		margin: 0.5rem 0;
	}

	.warning {
		color: #ff0000;
		font-size: 1.2rem;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%,
		50%,
		100% {
			opacity: 1;
		}
		25%,
		75% {
			opacity: 0.3;
		}
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-box {
		background: #222;
		border: 3px solid #ffff00;
		padding: 1rem;
	}

	.stat-box.highlight {
		background: #ff6600;
		border-color: #00ffff;
		transform: scale(1.05);
	}

	.stat-label {
		font-size: 0.8rem;
		margin-bottom: 0.5rem;
		opacity: 0.8;
	}

	.stat-value {
		font-size: 1.8rem;
		font-weight: bold;
	}

	.stat-value.score {
		color: #000;
		font-size: 1.5rem;
	}

	.game-area {
		background: #1a1a1a;
		border: 5px solid #00ffff;
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.target-word {
		font-size: 3rem;
		margin-bottom: 1.5rem;
		font-weight: bold;
		min-height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.completed {
		color: #00ff00;
		text-shadow: 0 0 10px #00ff00;
	}

	.remaining {
		color: #666;
	}

	.typing-input {
		width: 100%;
		font-size: 2rem;
		padding: 1rem;
		background: #000;
		color: #ffff00;
		border: 3px solid #ffff00;
		font-family: 'Courier New', monospace;
		text-align: center;
		margin-bottom: 1rem;
	}

	.typing-input:focus {
		outline: none;
		border-color: #00ffff;
		box-shadow: 0 0 20px #00ffff;
	}

	.typing-input::placeholder {
		color: #666;
	}

	.reset-btn {
		background: #ff0000;
		color: #fff;
		border: 3px solid #fff;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		font-family: 'Courier New', monospace;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		background: #fff;
		color: #ff0000;
		transform: scale(1.1);
	}

	.reset-btn:active {
		transform: scale(0.95);
	}

	.formula {
		background: #2a2a2a;
		border: 2px dashed #666;
		padding: 1rem;
		margin-bottom: 2rem;
		font-size: 0.9rem;
	}

	.formula-detail {
		color: #999;
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	.navigation {
		margin-top: 2rem;
	}

	.navigation a {
		color: #00ffff;
		text-decoration: none;
		font-size: 1.2rem;
		border: 2px solid #00ffff;
		padding: 0.5rem 1rem;
		display: inline-block;
		transition: all 0.2s;
	}

	.navigation a:hover {
		background: #00ffff;
		color: #000;
		transform: scale(1.05);
	}
</style>
