<script>
	import { onMount, onDestroy } from 'svelte';
	import { CHICKEN_FRAMES, SCREAMING_CHICKEN } from '$lib/chickens';

	let currentFrame = 0;
	let chickenOutput = '';
	let isLoading = false;
	let animationInterval;
	let konamiActivated = false;
	let chickenCount = Math.floor(Math.random() * 1000);
	let matrixMode = false;
	let canvas;
	let ctx;
	let matrixInterval;

	// Konami code sequence
	const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
	let konamiIndex = 0;

	// Chicken matrix characters
	const CHICKEN_CHARS = [
		'c', 'h', 'i', 'k', 'e', 'n',
		'🐔', '🐓', '🐤', '🐥', '🐣', '🍗',
		'鸡', '鷄', '雞', '鶏', '계', '닭',
		'公鸡', '母鸡', '小鸡', '雏鸡',
		'蛋', '卵', '🥚',
		'♈', '⚡', '☄', '✨'
	];

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
		if (matrixInterval) {
			clearInterval(matrixInterval);
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

	function toggleMatrixMode() {
		matrixMode = !matrixMode;

		if (matrixMode) {
			// Start matrix animation
			setTimeout(() => {
				if (canvas) {
					initMatrix();
				}
			}, 50);
		} else {
			// Stop matrix animation
			if (matrixInterval) {
				clearInterval(matrixInterval);
				matrixInterval = null;
			}
		}
	}

	function initMatrix() {
		ctx = canvas.getContext('2d');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const fontSize = 16;
		const columns = Math.floor(canvas.width / fontSize);
		const drops = Array(columns).fill(0);

		function drawMatrix() {
			// Semi-transparent black to create fading effect
			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.font = fontSize + 'px monospace';

			for (let i = 0; i < drops.length; i++) {
				// Pick a random chicken character
				const char = CHICKEN_CHARS[Math.floor(Math.random() * CHICKEN_CHARS.length)];

				// Chicken matrix colors: green, yellow, orange
				const colors = ['#00FF00', '#FFFF00', '#FF6600', '#00FFFF'];
				ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

				const x = i * fontSize;
				const y = drops[i] * fontSize;

				ctx.fillText(char, x, y);

				// Reset drop to top randomly
				if (y > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}

				drops[i]++;
			}
		}

		matrixInterval = setInterval(drawMatrix, 50);
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

{#if matrixMode}
	<div
		class="matrix-overlay"
		on:click={toggleMatrixMode}
		on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && toggleMatrixMode()}
		role="button"
		tabindex="0"
		aria-label="Exit chicken matrix mode"
	>
		<canvas bind:this={canvas}></canvas>
		<button class="matrix-exit-button glitch-exit" on:click|stopPropagation={toggleMatrixMode} data-text="CHICKEN">
			CHICKEN
		</button>
	</div>
{/if}

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
		<div
			class="chicken-display clickable-chicken"
			on:click={unleashChickens}
			on:keydown={(e) => e.key === 'Enter' && unleashChickens()}
			role="button"
			tabindex="0"
		>
			<pre class="ascii-chicken">{CHICKEN_FRAMES[currentFrame]}</pre>
			{#if isLoading}
				<div class="loading-text">cluck cluck...</div>
			{/if}
		</div>
	{/if}

	<div class="button-row">
		<button
			class="matrix-button glitch"
			on:click={toggleMatrixMode}
			data-text="CHICKEN"
		>
			CHICKEN
		</button>
	</div>

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
		position: relative;
	}

	.clickable-chicken {
		cursor: pointer;
		transition: all 0.2s ease;
		user-select: none;
	}

	.clickable-chicken:hover {
		background-color: #4A4A35;
		border-color: #FF6600;
		box-shadow: 10px 10px 0 #FF6600;
		transform: translate(-2px, -2px);
	}

	.clickable-chicken:active {
		transform: translate(4px, 4px);
		box-shadow: 4px 4px 0 #CC5500;
	}

	.clickable-chicken:hover .ascii-chicken {
		color: #FFFF00;
		animation: chicken-bounce 0.5s ease-in-out infinite;
	}

	@keyframes chicken-bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-5px); }
	}

	.loading-text {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		color: #FF6600;
		font-weight: bold;
		font-size: 1.2rem;
		animation: pulse-loading 1s ease-in-out infinite;
	}

	@keyframes pulse-loading {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.ascii-chicken {
		font-size: 1.5rem;
		line-height: 1.2;
		color: #CCCCCC;
		white-space: pre;
		font-family: 'Courier New', Courier, monospace;
		transition: color 0.2s ease;
	}

	.button-row {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.matrix-button {
		font-size: 1.5rem;
		font-weight: bold;
		padding: 1rem 2rem;
		background-color: #00FF00;
		color: #000000;
		border: 4px solid #008000;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		box-shadow: 6px 6px 0 #008000;
		transition: all 0.1s ease;
		animation: matrix-pulse 2s ease-in-out infinite;
		position: relative;
	}

	.matrix-button:hover {
		background-color: #00FFFF;
		border-color: #008080;
		box-shadow: 4px 4px 0 #008080;
		transform: translate(2px, 2px);
	}

	.matrix-button:active {
		transform: translate(4px, 4px);
		box-shadow: 2px 2px 0 #008000;
	}

	.glitch {
		animation: matrix-pulse 2s ease-in-out infinite, glitch 1s infinite;
	}

	.glitch::before,
	.glitch::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 2rem;
	}

	.glitch::before {
		animation: glitch-top 0.3s infinite;
		clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
		-webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
	}

	.glitch::after {
		animation: glitch-bottom 0.4s infinite;
		clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
		-webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
	}

	@keyframes matrix-pulse {
		0%, 100% {
			box-shadow: 6px 6px 0 #008000, 0 0 10px #00FF00;
		}
		50% {
			box-shadow: 6px 6px 0 #008000, 0 0 20px #00FF00, 0 0 30px #00FF00;
		}
	}

	@keyframes glitch {
		0% {
			text-shadow: 2px 0 #FF00FF, -2px 0 #00FFFF;
		}
		25% {
			text-shadow: -2px 0 #FF00FF, 2px 0 #00FFFF;
		}
		50% {
			text-shadow: 2px 2px #FF00FF, -2px -2px #00FFFF;
		}
		75% {
			text-shadow: -2px 2px #FF00FF, 2px -2px #00FFFF;
		}
		100% {
			text-shadow: 2px 0 #FF00FF, -2px 0 #00FFFF;
		}
	}

	@keyframes glitch-top {
		0%, 100% {
			transform: translateX(0);
		}
		33% {
			transform: translateX(-4px);
			color: #FF00FF;
		}
		66% {
			transform: translateX(4px);
			color: #00FFFF;
		}
	}

	@keyframes glitch-bottom {
		0%, 100% {
			transform: translateX(0);
		}
		33% {
			transform: translateX(4px);
			color: #00FFFF;
		}
		66% {
			transform: translateX(-4px);
			color: #FFFF00;
		}
	}

	.matrix-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999;
		background-color: #000000;
		cursor: pointer;
	}

	.matrix-overlay canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.matrix-exit-button {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 10000;
		font-size: 1.5rem;
		font-weight: bold;
		padding: 1rem 2rem;
		background-color: #FF0000;
		color: #FFFFFF;
		border: 4px solid #8B0000;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		box-shadow: 6px 6px 0 #8B0000;
		transition: all 0.1s ease;
		animation: exit-pulse 1.5s ease-in-out infinite;
	}

	.matrix-exit-button:hover {
		background-color: #FF4500;
		transform: translate(2px, 2px);
		box-shadow: 4px 4px 0 #8B0000;
	}

	.matrix-exit-button:active {
		transform: translate(4px, 4px);
		box-shadow: 2px 2px 0 #8B0000;
	}

	.glitch-exit {
		animation: exit-pulse 1.5s ease-in-out infinite, glitch-exit-anim 0.5s infinite;
		position: relative;
	}

	.glitch-exit::before,
	.glitch-exit::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 2rem;
	}

	.glitch-exit::before {
		animation: glitch-exit-top 0.35s infinite;
		clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
		-webkit-clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
	}

	.glitch-exit::after {
		animation: glitch-exit-bottom 0.45s infinite;
		clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
		-webkit-clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
	}

	@keyframes exit-pulse {
		0%, 100% {
			box-shadow: 6px 6px 0 #8B0000, 0 0 10px #FF0000;
		}
		50% {
			box-shadow: 6px 6px 0 #8B0000, 0 0 20px #FF0000, 0 0 30px #FF0000;
		}
	}

	@keyframes glitch-exit-anim {
		0% {
			text-shadow: 3px 0 #00FF00, -3px 0 #FF00FF;
		}
		25% {
			text-shadow: -3px 0 #00FF00, 3px 0 #FFFF00;
		}
		50% {
			text-shadow: 3px 3px #FF00FF, -3px -3px #00FFFF;
		}
		75% {
			text-shadow: -3px 3px #FFFF00, 3px -3px #00FF00;
		}
		100% {
			text-shadow: 3px 0 #00FF00, -3px 0 #FF00FF;
		}
	}

	@keyframes glitch-exit-top {
		0%, 100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-5px);
			color: #00FF00;
		}
		40% {
			transform: translateX(5px);
			color: #FF00FF;
		}
		60% {
			transform: translateX(-3px);
			color: #FFFF00;
		}
		80% {
			transform: translateX(3px);
			color: #00FFFF;
		}
	}

	@keyframes glitch-exit-bottom {
		0%, 100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(5px);
			color: #FFFF00;
		}
		50% {
			transform: translateX(-5px);
			color: #00FFFF;
		}
		75% {
			transform: translateX(3px);
			color: #FF00FF;
		}
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
