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

	// AVANT-GARDE FEATURES
	let particleCanvas;
	let particleCtx;
	let particles = [];
	let particleAnimationFrame;
	let audioContext;
	let generativeMode = false;
	let generativeCanvas;
	let generativeCtx;
	let generativeInterval;
	let cursorTrail = [];
	let chaosIntensity = 0.7; // 0 to 1
	let voiceRecognition;
	let isListening = false;

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

		// Initialize particle canvas
		if (particleCanvas) {
			particleCtx = particleCanvas.getContext('2d');
			particleCanvas.width = window.innerWidth;
			particleCanvas.height = window.innerHeight;
			animateParticles();
		}

		// Initialize audio context (requires user interaction)
		window.addEventListener('click', initAudio, { once: true });

		// Track cursor for distortion effects
		window.addEventListener('mousemove', handleCursorMove);

		// Initialize voice recognition
		initVoiceRecognition();
	});

	onDestroy(() => {
		if (animationInterval) {
			clearInterval(animationInterval);
		}
		if (matrixInterval) {
			clearInterval(matrixInterval);
		}
		if (generativeInterval) {
			clearInterval(generativeInterval);
		}
		if (particleAnimationFrame) {
			cancelAnimationFrame(particleAnimationFrame);
		}
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKonami);
			window.removeEventListener('mousemove', handleCursorMove);
		}
		if (voiceRecognition) {
			voiceRecognition.stop();
		}
		if (audioContext) {
			audioContext.close();
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

	// ===== AVANT-GARDE FEATURES =====

	// Particle explosion system
	function createParticleExplosion(x, y) {
		const chickenEmojis = ['🐔', '🐓', '🐤', '🐥', '🐣', '🍗', '🥚'];
		const particleCount = Math.floor(20 * chaosIntensity);

		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x,
				y,
				vx: (Math.random() - 0.5) * 10 * chaosIntensity,
				vy: (Math.random() - 0.5) * 10 * chaosIntensity - 2,
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.2,
				life: 1,
				decay: 0.01 + Math.random() * 0.01,
				char: chickenEmojis[Math.floor(Math.random() * chickenEmojis.length)],
				size: 20 + Math.random() * 20
			});
		}

		// Play chicken sound
		playChickenSound();
	}

	function animateParticles() {
		if (!particleCtx) return;

		particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

		// Draw cursor trail with distortion
		cursorTrail.forEach((point, i) => {
			const alpha = (i / cursorTrail.length) * 0.3 * chaosIntensity;
			const radius = 30 * (1 - i / cursorTrail.length) * chaosIntensity;

			particleCtx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
			particleCtx.beginPath();
			particleCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
			particleCtx.fill();
		});

		// Update and draw particles
		particles = particles.filter(p => {
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.3; // gravity
			p.rotation += p.rotationSpeed;
			p.life -= p.decay;

			if (p.life > 0) {
				particleCtx.save();
				particleCtx.translate(p.x, p.y);
				particleCtx.rotate(p.rotation);
				particleCtx.globalAlpha = p.life;
				particleCtx.font = `${p.size}px monospace`;
				particleCtx.fillText(p.char, 0, 0);
				particleCtx.restore();
				return true;
			}
			return false;
		});

		particleAnimationFrame = requestAnimationFrame(animateParticles);
	}

	function handlePageClick(e) {
		if (!matrixMode && !generativeMode) {
			createParticleExplosion(e.clientX, e.clientY);
		}
	}

	function handleCursorMove(e) {
		cursorTrail.push({ x: e.clientX, y: e.clientY });
		if (cursorTrail.length > 10) {
			cursorTrail.shift();
		}
	}

	// Web Audio API - Generative chicken sounds
	function initAudio() {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}
	}

	function playChickenSound() {
		if (!audioContext) return;

		const now = audioContext.currentTime;
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		const filter = audioContext.createBiquadFilter();

		// Glitchy chicken sound parameters
		const baseFreq = 200 + Math.random() * 400;
		oscillator.frequency.setValueAtTime(baseFreq, now);
		oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.1);

		// Add chaos with filter
		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(1000 + Math.random() * 2000 * chaosIntensity, now);
		filter.Q.setValueAtTime(10 * chaosIntensity, now);

		// Glitch envelope
		gainNode.gain.setValueAtTime(0.3 * chaosIntensity, now);
		gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

		oscillator.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
		oscillator.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.start(now);
		oscillator.stop(now + 0.15);
	}

	// Generative chicken art
	function toggleGenerativeMode() {
		generativeMode = !generativeMode;

		if (generativeMode) {
			setTimeout(() => {
				if (generativeCanvas) {
					generativeCtx = generativeCanvas.getContext('2d');
					generativeCanvas.width = window.innerWidth;
					generativeCanvas.height = window.innerHeight;
					startGenerativeArt();
				}
			}, 50);
		} else {
			if (generativeInterval) {
				clearInterval(generativeInterval);
				generativeInterval = null;
			}
		}
	}

	function startGenerativeArt() {
		const colors = ['#FFFF00', '#FF6600', '#00FFFF', '#FF00FF', '#00FF00'];

		function drawGenerativeFrame() {
			// Fade effect
			generativeCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			generativeCtx.fillRect(0, 0, generativeCanvas.width, generativeCanvas.height);

			// Draw abstract chicken forms
			const complexity = 5 + Math.floor(10 * chaosIntensity);
			for (let i = 0; i < complexity; i++) {
				const x = Math.random() * generativeCanvas.width;
				const y = Math.random() * generativeCanvas.height;
				const size = 50 + Math.random() * 200 * chaosIntensity;
				const color = colors[Math.floor(Math.random() * colors.length)];

				generativeCtx.fillStyle = color;
				generativeCtx.globalAlpha = 0.1 + Math.random() * 0.3;

				// Random shapes
				const shape = Math.floor(Math.random() * 3);
				if (shape === 0) {
					// Circle
					generativeCtx.beginPath();
					generativeCtx.arc(x, y, size, 0, Math.PI * 2);
					generativeCtx.fill();
				} else if (shape === 1) {
					// Triangle
					generativeCtx.beginPath();
					generativeCtx.moveTo(x, y - size);
					generativeCtx.lineTo(x - size, y + size);
					generativeCtx.lineTo(x + size, y + size);
					generativeCtx.closePath();
					generativeCtx.fill();
				} else {
					// Rectangle
					generativeCtx.fillRect(x - size/2, y - size/2, size, size);
				}

				// Add chicken emoji occasionally
				if (Math.random() > 0.7) {
					generativeCtx.globalAlpha = 0.5;
					generativeCtx.font = `${size}px monospace`;
					generativeCtx.fillText('🐔', x, y);
				}
			}

			generativeCtx.globalAlpha = 1;
		}

		generativeInterval = setInterval(drawGenerativeFrame, 100);
	}

	// Voice recognition
	function initVoiceRecognition() {
		if (typeof window === 'undefined') return;

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) return;

		voiceRecognition = new SpeechRecognition();
		voiceRecognition.continuous = true;
		voiceRecognition.interimResults = false;

		voiceRecognition.onresult = (event) => {
			const last = event.results.length - 1;
			const text = event.results[last][0].transcript.toLowerCase();

			if (text.includes('chicken')) {
				// Trigger random chicken effect
				const effects = [toggleMatrixMode, toggleGenerativeMode, unleashChickens];
				const randomEffect = effects[Math.floor(Math.random() * effects.length)];
				randomEffect();
				playChickenSound();
			}
		};

		voiceRecognition.onerror = () => {
			isListening = false;
		};

		voiceRecognition.onend = () => {
			if (isListening) {
				voiceRecognition.start();
			}
		};
	}

	function toggleVoiceControl() {
		if (!voiceRecognition) {
			initVoiceRecognition();
			return;
		}

		isListening = !isListening;
		if (isListening) {
			try {
				voiceRecognition.start();
			} catch (e) {
				// Already started
			}
		} else {
			voiceRecognition.stop();
		}
	}
</script>

<svelte:head>
	<title>chicken</title>
	<meta name="description" content="CaaC: Chicken as a CaaC - Enterprise-grade poultry delivery" />
</svelte:head>

<!-- Particle canvas overlay -->
<canvas bind:this={particleCanvas} class="particle-canvas" on:click={handlePageClick}></canvas>

{#if generativeMode}
	<div
		class="generative-overlay"
		on:click={toggleGenerativeMode}
		on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && toggleGenerativeMode()}
		role="button"
		tabindex="0"
		aria-label="Exit generative art mode"
	>
		<canvas bind:this={generativeCanvas}></canvas>
		<button class="generative-exit-button glitch-exit" on:click|stopPropagation={toggleGenerativeMode} data-text="CHICKEN">
			CHICKEN
		</button>
	</div>
{/if}

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
		<button
			class="generative-button glitch"
			on:click={toggleGenerativeMode}
			data-text="CHICKEN"
		>
			CHICKEN
		</button>
		<button
			class="voice-button glitch"
			class:active={isListening}
			on:click={toggleVoiceControl}
			data-text="CHICKEN"
		>
			{isListening ? '🎤 CHICKEN' : 'CHICKEN'}
		</button>
	</div>

	<!-- Chaos intensity slider -->
	<div class="chaos-control">
		<label for="chaos-slider" class="chaos-label">
			CHAOS: {Math.floor(chaosIntensity * 100)}%
		</label>
		<input
			id="chaos-slider"
			type="range"
			min="0"
			max="100"
			bind:value={chaosIntensity}
			on:input={(e) => chaosIntensity = e.target.value / 100}
			class="chaos-slider"
		/>
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

	/* ===== AVANT-GARDE STYLES ===== */

	.particle-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: all;
		z-index: 1;
	}

	.generative-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999;
		background-color: #000000;
		cursor: pointer;
	}

	.generative-overlay canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.generative-exit-button {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 10000;
		font-size: 1.5rem;
		font-weight: bold;
		padding: 1rem 2rem;
		background-color: #FF00FF;
		color: #FFFFFF;
		border: 4px solid #8B008B;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		box-shadow: 6px 6px 0 #8B008B;
		transition: all 0.1s ease;
		animation: generative-pulse 1.5s ease-in-out infinite;
	}

	.generative-exit-button:hover {
		background-color: #FF00AA;
		transform: translate(2px, 2px);
		box-shadow: 4px 4px 0 #8B008B;
	}

	@keyframes generative-pulse {
		0%, 100% {
			box-shadow: 6px 6px 0 #8B008B, 0 0 10px #FF00FF;
		}
		50% {
			box-shadow: 6px 6px 0 #8B008B, 0 0 20px #FF00FF, 0 0 30px #FF00FF;
		}
	}

	.generative-button {
		font-size: 1.5rem;
		font-weight: bold;
		padding: 1rem 2rem;
		background-color: #FF00FF;
		color: #000000;
		border: 4px solid #8B008B;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		box-shadow: 6px 6px 0 #8B008B;
		transition: all 0.1s ease;
		animation: generative-pulse 2s ease-in-out infinite;
		position: relative;
	}

	.generative-button:hover {
		background-color: #FF00AA;
		border-color: #660066;
		box-shadow: 4px 4px 0 #660066;
		transform: translate(2px, 2px);
	}

	.generative-button:active {
		transform: translate(4px, 4px);
		box-shadow: 2px 2px 0 #8B008B;
	}

	.voice-button {
		font-size: 1.5rem;
		font-weight: bold;
		padding: 1rem 2rem;
		background-color: #00FFFF;
		color: #000000;
		border: 4px solid #008B8B;
		border-radius: 12px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		box-shadow: 6px 6px 0 #008B8B;
		transition: all 0.1s ease;
		animation: voice-pulse 2s ease-in-out infinite;
		position: relative;
	}

	.voice-button:hover {
		background-color: #00CCCC;
		border-color: #006666;
		box-shadow: 4px 4px 0 #006666;
		transform: translate(2px, 2px);
	}

	.voice-button:active {
		transform: translate(4px, 4px);
		box-shadow: 2px 2px 0 #008B8B;
	}

	.voice-button.active {
		background-color: #FF0000;
		border-color: #8B0000;
		animation: recording-pulse 0.5s ease-in-out infinite;
	}

	@keyframes voice-pulse {
		0%, 100% {
			box-shadow: 6px 6px 0 #008B8B, 0 0 10px #00FFFF;
		}
		50% {
			box-shadow: 6px 6px 0 #008B8B, 0 0 20px #00FFFF, 0 0 30px #00FFFF;
		}
	}

	@keyframes recording-pulse {
		0%, 100% {
			box-shadow: 6px 6px 0 #8B0000, 0 0 20px #FF0000;
		}
		50% {
			box-shadow: 6px 6px 0 #8B0000, 0 0 40px #FF0000, 0 0 60px #FF0000;
		}
	}

	.chaos-control {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background-color: #2E2416;
		border: 4px solid #FF6600;
		border-radius: 12px;
		box-shadow: 6px 6px 0 #FF6600;
		width: 100%;
		max-width: 400px;
	}

	.chaos-label {
		font-size: 1.5rem;
		font-weight: bold;
		color: #FFFF00;
		text-shadow: 2px 2px 0 #FF00FF, -2px -2px 0 #00FFFF;
		letter-spacing: 0.2em;
		animation: glitch 1s infinite;
	}

	.chaos-slider {
		width: 100%;
		height: 8px;
		-webkit-appearance: none;
		appearance: none;
		background: linear-gradient(to right, #00FF00, #FFFF00, #FF6600, #FF0000, #FF00FF);
		outline: none;
		border-radius: 4px;
		cursor: pointer;
		border: 2px solid #000000;
	}

	.chaos-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 30px;
		height: 30px;
		background: #FFFF00;
		border: 4px solid #000000;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px #FFFF00;
		transition: all 0.2s ease;
	}

	.chaos-slider::-webkit-slider-thumb:hover {
		background: #00FFFF;
		box-shadow: 0 0 20px #00FFFF;
		transform: scale(1.2);
	}

	.chaos-slider::-moz-range-thumb {
		width: 30px;
		height: 30px;
		background: #FFFF00;
		border: 4px solid #000000;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px #FFFF00;
		transition: all 0.2s ease;
	}

	.chaos-slider::-moz-range-thumb:hover {
		background: #00FFFF;
		box-shadow: 0 0 20px #00FFFF;
		transform: scale(1.2);
	}
</style>
