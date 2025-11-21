<script>
	import { onMount, onDestroy } from 'svelte';
	import { CHICKEN_FRAMES, SCREAMING_CHICKEN } from '$lib/chickens';

	let currentFrame = 0;
	let chickenOutput = '';
	let isLoading = false;
	let animationInterval;
	let konamiActivated = false;

	// Konami code sequence
	const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
	let konamiIndex = 0;

	onMount(() => {
		// Start the chicken animation at 4 fps (250ms)
		animationInterval = setInterval(() => {
			currentFrame = (currentFrame + 1) % 8;
		}, 250);

		// Konami code listener
		window.addEventListener('keydown', handleKonami);
	});

	onDestroy(() => {
		if (animationInterval) {
			clearInterval(animationInterval);
		}
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKonami);
		}
	});

	function handleKonami(e) {
		if (e.code === konamiCode[konamiIndex]) {
			konamiIndex++;
			if (konamiIndex === konamiCode.length) {
				konamiActivated = true;
				konamiIndex = 0;
				// Reset after 5 seconds
				setTimeout(() => {
					konamiActivated = false;
				}, 5000);
			}
		} else {
			konamiIndex = 0;
		}
	}

	async function unleashChickens() {
		isLoading = true;
		chickenOutput = '';

		try {
			const response = await fetch('/chicken');
			const text = await response.text();
			chickenOutput = text;
		} catch (error) {
			chickenOutput = 'cluck cluck... error... cluck';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>chicken</title>
	<meta name="description" content="CaaC: Chicken as a CaaC - Enterprise-grade poultry delivery" />
</svelte:head>

<main class="container">
	<header>
		<h1 class="title">chicken</h1>
		<p class="subtitle">CaaC: Chicken as a CaaC</p>
	</header>

	{#if konamiActivated}
		<div class="screaming-chicken">
			<pre>{SCREAMING_CHICKEN}</pre>
		</div>
	{:else}
		<div class="chicken-display">
			<pre class="ascii-chicken">{CHICKEN_FRAMES[currentFrame]}</pre>
		</div>
	{/if}

	<button
		class="chicken-button"
		on:click={unleashChickens}
		disabled={isLoading}
	>
		{isLoading ? 'CLUCKING...' : 'CHICKEN'}
	</button>

	{#if chickenOutput}
		<div class="chicken-output">
			<div class="output-header">
				<span>POULTRY NIAGARA FALLS</span>
				<span class="count">(1000 chickens)</span>
			</div>
			<div class="output-scroll">
				{chickenOutput}
			</div>
		</div>
	{/if}

	<footer>
		<p>Enterprise Poultry Solutions since 2024</p>
		<p class="hint">psst... try the konami code</p>
	</footer>
</main>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		gap: 1.5rem;
	}

	header {
		text-align: center;
	}

	.title {
		font-size: 4rem;
		font-weight: bold;
		text-transform: lowercase;
		color: #8B4513;
		text-shadow: 3px 3px 0 #FF6600;
		letter-spacing: 0.2em;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #654321;
		margin-top: 0.5rem;
	}

	.chicken-display {
		background-color: #FFFACD;
		border: 4px solid #8B4513;
		border-radius: 12px;
		padding: 1.5rem 2rem;
		box-shadow: 8px 8px 0 #FF6600;
	}

	.ascii-chicken {
		font-size: 1.5rem;
		line-height: 1.2;
		color: #8B4513;
		white-space: pre;
		font-family: 'Courier New', Courier, monospace;
	}

	.screaming-chicken {
		background-color: #FF4500;
		border: 4px solid #8B0000;
		border-radius: 12px;
		padding: 1rem;
		animation: shake 0.1s infinite;
	}

	.screaming-chicken pre {
		font-size: 0.8rem;
		color: #FFFF00;
		white-space: pre;
		font-family: 'Courier New', Courier, monospace;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px) rotate(-1deg); }
		75% { transform: translateX(5px) rotate(1deg); }
	}

	.chicken-button {
		font-size: 2rem;
		font-weight: bold;
		padding: 1rem 3rem;
		background-color: #FF6600;
		color: white;
		border: 4px solid #8B4513;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		box-shadow: 6px 6px 0 #8B4513;
		transition: all 0.1s ease;
	}

	.chicken-button:hover:not(:disabled) {
		background-color: #FF4500;
		transform: translate(2px, 2px);
		box-shadow: 4px 4px 0 #8B4513;
	}

	.chicken-button:active:not(:disabled) {
		transform: translate(4px, 4px);
		box-shadow: 2px 2px 0 #8B4513;
	}

	.chicken-button:disabled {
		background-color: #CCC;
		cursor: not-allowed;
	}

	.chicken-output {
		width: 100%;
		max-width: 800px;
		background-color: #FFFACD;
		border: 4px solid #8B4513;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 8px 8px 0 #FF6600;
	}

	.output-header {
		background-color: #8B4513;
		color: #FFFF00;
		padding: 0.5rem 1rem;
		display: flex;
		justify-content: space-between;
		font-weight: bold;
	}

	.count {
		color: #FFD700;
	}

	.output-scroll {
		height: 300px;
		overflow-y: auto;
		padding: 1rem;
		font-size: 1rem;
		line-height: 1.6;
		word-wrap: break-word;
		color: #654321;
	}

	footer {
		margin-top: auto;
		text-align: center;
		color: #8B4513;
		font-size: 0.9rem;
	}

	.hint {
		font-size: 0.7rem;
		color: #B8860B;
		margin-top: 0.5rem;
		opacity: 0.7;
	}
</style>
