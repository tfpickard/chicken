<script>
	import { onMount, onDestroy } from 'svelte';
	import { CHICKEN_FRAMES, SCREAMING_CHICKEN } from '$lib/chickens';

	let currentFrame = 0;
	let chickenOutput = '';
	let isLoading = false;
	let animationInterval;
	let konamiActivated = false;
	let chickenCount = Math.floor(Math.random() * 1000);

	// Konami code sequence
	const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
	let konamiIndex = 0;

	onMount(() => {
		// Start the chicken animation at 4 fps (250ms)
		animationInterval = setInterval(() => {
			currentFrame = (currentFrame + 1) % 18;
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
		<p class="subtitle">
			CccC: Chicken chicken chicken CHICKEN<br/>
			Chickensite: <a href="https://chicken.ainot.io" class="chicken-link">https://ccc.chicken.ainot.io</a>
		</p>
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
		{isLoading ? 'cluck cluck...' : 'CHICKEN'}
	</button>

	{#if chickenOutput}
		<div class="chicken-output">
			<div class="output-header">
				<span class="obnoxious-title">C H I C K E N</span>
				<span class="count">({chickenCount} chickens)</span>
			</div>
			<div class="output-scroll">
				{chickenOutput}
			</div>
		</div>
	{/if}

	<footer>
		<p>Chicen Agents for Enterprise Chickentic Solutions since 1974</p>
		<p class="hint">cluck... chicken chicken chicken try chicken konami chicken chicken code</p>
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
		color: #000000;
		text-shadow: 3px 3px 0 #FF6600, -1px -1px 0 #00FFFF;
		letter-spacing: 0.2em;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #000000;
		margin-top: 0.5rem;
		font-weight: bold;
	}

	.chicken-link {
		color: #FF0080;
		text-decoration: none;
		font-weight: bold;
		text-shadow: 1px 1px 2px #00FFFF;
		transition: all 0.3s ease;
	}

	.chicken-link:hover {
		color: #00FFFF;
		text-shadow: 2px 2px 4px #FF0080;
		transform: scale(1.1);
		display: inline-block;
	}

	.chicken-display {
		background-color: #3D3D2B;
		border: 4px solid #CC5500;
		border-radius: 12px;
		padding: 1.5rem 2rem;
		box-shadow: 8px 8px 0 #CC5500;
	}

	.ascii-chicken {
		font-size: 1.5rem;
		line-height: 1.2;
		color: #CCCCCC;
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
		background-color: #4A3A20;
		border: 4px solid #CC5500;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 8px 8px 0 #CC5500;
	}

	.output-header {
		background-color: #FF6600;
		color: #FFFF00;
		padding: 0.5rem 1rem;
		display: flex;
		justify-content: space-between;
		font-weight: bold;
		border-bottom: 4px solid #FF0080;
	}

	.obnoxious-title {
		animation: rainbow-pulse 2s ease-in-out infinite, wobble 0.5s ease-in-out infinite;
		font-size: 1.3rem;
		letter-spacing: 0.3em;
		text-shadow:
			2px 2px 0 #FF0080,
			-2px -2px 0 #00FFFF,
			2px -2px 0 #00FF00,
			-2px 2px 0 #FF00FF;
	}

	@keyframes rainbow-pulse {
		0%, 100% { color: #FFFF00; }
		25% { color: #00FFFF; }
		50% { color: #FF00FF; }
		75% { color: #00FF00; }
	}

	@keyframes wobble {
		0%, 100% { transform: rotate(-2deg); }
		50% { transform: rotate(2deg); }
	}

	.count {
		color: #FFFFFF;
		font-size: 1.1rem;
		animation: pulse-count 1.5s ease-in-out infinite;
	}

	@keyframes pulse-count {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.output-scroll {
		height: 300px;
		overflow-y: auto;
		padding: 1rem;
		font-size: 1rem;
		line-height: 1.6;
		word-wrap: break-word;
		color: #C8B896;
		background-color: #2E2416;
	}

	footer {
		margin-top: auto;
		text-align: center;
		color: #000000;
		font-size: 0.9rem;
		font-weight: bold;
	}

	.hint {
		font-size: 0.7rem;
		color: #663399;
		margin-top: 0.5rem;
		opacity: 0.9;
	}
</style>
