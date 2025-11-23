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

	// Vicsek simulation
	let vicsekCanvas;
	let vicsekCtx;
	let particles = [];
	let vicsekAnimationId;
	let particleCount = 100;
	let speed = 2.0;
	let noiseStrength = 0.3;
	let neighborRadius = 50;
	let showVectors = false;
	let vicsekFps = 0;
	let vicsekLastTime = 0;
	let avgAlignment = 0;

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
			currentFrame = (currentFrame + 1) % 38;
		}, 250);

		// Konami code listener
		window.addEventListener('keydown', handleKonami);

		// Initialize Vicsek simulation
		if (vicsekCanvas) {
			vicsekCtx = vicsekCanvas.getContext('2d');
			vicsekCanvas.width = 800;
			vicsekCanvas.height = 400;
			initVicsekSimulation();
			vicsekAnimationId = requestAnimationFrame(animateVicsek);
		}
	});

	onDestroy(() => {
		if (animationInterval) {
			clearInterval(animationInterval);
		}
		if (matrixInterval) {
			clearInterval(matrixInterval);
		}
		if (vicsekAnimationId) {
			cancelAnimationFrame(vicsekAnimationId);
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

	// Vicsek simulation classes and functions
	class Particle {
		constructor(width, height) {
			this.x = Math.random() * width;
			this.y = Math.random() * height;
			this.angle = Math.random() * Math.PI * 2;
			this.vx = Math.cos(this.angle) * speed;
			this.vy = Math.sin(this.angle) * speed;
		}

		update(neighbors, width, height) {
			let avgAngle = this.angle;

			if (neighbors.length > 0) {
				let sumSin = Math.sin(this.angle);
				let sumCos = Math.cos(this.angle);

				neighbors.forEach(p => {
					sumSin += Math.sin(p.angle);
					sumCos += Math.cos(p.angle);
				});

				avgAngle = Math.atan2(sumSin, sumCos);
			}

			avgAngle += (Math.random() - 0.5) * noiseStrength * Math.PI;

			this.angle = avgAngle;
			this.vx = Math.cos(this.angle) * speed;
			this.vy = Math.sin(this.angle) * speed;

			this.x += this.vx;
			this.y += this.vy;

			if (this.x < 0) this.x += width;
			if (this.x > width) this.x -= width;
			if (this.y < 0) this.y += height;
			if (this.y > height) this.y -= height;
		}

		draw(ctx) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.angle);

			ctx.font = '16px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('🐔', 0, 0);

			ctx.restore();

			if (showVectors) {
				ctx.strokeStyle = '#00FFFF';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x + this.vx * 5, this.y + this.vy * 5);
				ctx.stroke();
			}
		}

		distanceTo(other, width, height) {
			let dx = Math.abs(this.x - other.x);
			let dy = Math.abs(this.y - other.y);

			if (dx > width / 2) dx = width - dx;
			if (dy > height / 2) dy = height - dy;

			return Math.sqrt(dx * dx + dy * dy);
		}
	}

	function initVicsekSimulation() {
		if (!vicsekCanvas) return;

		const width = vicsekCanvas.width;
		const height = vicsekCanvas.height;

		particles = [];
		for (let i = 0; i < particleCount; i++) {
			particles.push(new Particle(width, height));
		}
	}

	function animateVicsek(timestamp) {
		if (vicsekLastTime) {
			vicsekFps = Math.round(1000 / (timestamp - vicsekLastTime));
		}
		vicsekLastTime = timestamp;

		const width = vicsekCanvas.width;
		const height = vicsekCanvas.height;

		vicsekCtx.fillStyle = '#FFFACD';
		vicsekCtx.fillRect(0, 0, width, height);

		vicsekCtx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
		vicsekCtx.lineWidth = 1;
		for (let i = 0; i < width; i += 50) {
			vicsekCtx.beginPath();
			vicsekCtx.moveTo(i, 0);
			vicsekCtx.lineTo(i, height);
			vicsekCtx.stroke();
		}
		for (let i = 0; i < height; i += 50) {
			vicsekCtx.beginPath();
			vicsekCtx.moveTo(0, i);
			vicsekCtx.lineTo(width, i);
			vicsekCtx.stroke();
		}

		let totalAlignment = 0;
		particles.forEach(p => {
			const neighbors = particles.filter(other => {
				if (p === other) return false;
				return p.distanceTo(other, width, height) < neighborRadius;
			});

			p.update(neighbors, width, height);
			totalAlignment += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
		});

		avgAlignment = totalAlignment / (particles.length * speed);

		particles.forEach(p => p.draw(vicsekCtx));

		vicsekAnimationId = requestAnimationFrame(animateVicsek);
	}

	function resetVicsek() {
		initVicsekSimulation();
	}

	function handleParticleCountChange() {
		initVicsekSimulation();
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

	<div class="vicsek-container">
		<h2 class="vicsek-title">🐔 Chicken Flocking</h2>
		<div class="vicsek-content">
			<div class="vicsek-canvas-container">
				<canvas bind:this={vicsekCanvas} class="vicsek-canvas"></canvas>
				<div class="vicsek-stats">
					<span>FPS: {vicsekFps}</span>
					<span>Chickens: {particles.length}</span>
					<span>Flockiness: {avgAlignment.toFixed(3)}</span>
				</div>
			</div>
			<div class="vicsek-controls">
				<button on:click={resetVicsek} class="vicsek-btn">🔄 Reset</button>

				<label class="vicsek-control">
					<span>Flock Size: {particleCount}</span>
					<input
						type="range"
						bind:value={particleCount}
						min="10"
						max="300"
						step="10"
						on:change={handleParticleCountChange}
					/>
				</label>

				<label class="vicsek-control">
					<span>Chicken Speed: {speed.toFixed(1)}</span>
					<input
						type="range"
						bind:value={speed}
						min="0.5"
						max="5"
						step="0.1"
					/>
				</label>

				<label class="vicsek-control">
					<span>Chicken Chaos: {noiseStrength.toFixed(2)}</span>
					<input
						type="range"
						bind:value={noiseStrength}
						min="0"
						max="2"
						step="0.05"
					/>
				</label>

				<label class="vicsek-control">
					<span>Chicken Vision: {neighborRadius}</span>
					<input
						type="range"
						bind:value={neighborRadius}
						min="10"
						max="150"
						step="5"
					/>
				</label>

				<label class="vicsek-checkbox">
					<input type="checkbox" bind:checked={showVectors} />
					Show <span class="vector-text">chicken</span>
				</label>
			</div>
		</div>
	</div>

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
		height: 250px;
		width: 500px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
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
		margin: 0;
		max-width: 100%;
		max-height: 100%;
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

	/* Vicsek Simulation Styles */
	.vicsek-container {
		width: 100%;
		max-width: 900px;
		background: rgba(255, 255, 255, 0.8);
		border: 4px solid #FF6600;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 8px 8px 0 #FF6600;
	}

	.vicsek-title {
		font-size: 2rem;
		color: #FF6600;
		text-align: center;
		margin: 0 0 1.5rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.vicsek-content {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.vicsek-canvas-container {
		flex: 1;
		min-width: 300px;
	}

	.vicsek-canvas {
		width: 100%;
		height: auto;
		border: 3px solid #CC5500;
		border-radius: 8px;
		background: #FFFACD;
		display: block;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.vicsek-stats {
		display: flex;
		justify-content: space-around;
		margin-top: 1rem;
		padding: 0.5rem;
		background: rgba(255, 215, 0, 0.3);
		border-radius: 4px;
		border: 2px solid #FFD700;
	}

	.vicsek-stats span {
		font-weight: bold;
		color: #CC5500;
		font-size: 0.9rem;
	}

	.vicsek-controls {
		flex: 0 0 200px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.vicsek-btn {
		background: #FF6600;
		color: white;
		border: 3px solid #CC5500;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: bold;
		transition: all 0.2s;
		box-shadow: 4px 4px 0 #CC5500;
	}

	.vicsek-btn:hover {
		background: #FF8800;
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 #CC5500;
	}

	.vicsek-btn:active {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 #CC5500;
	}

	.vicsek-control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.vicsek-control span {
		font-weight: bold;
		color: #CC5500;
		font-size: 0.9rem;
	}

	.vicsek-control input[type="range"] {
		width: 100%;
		accent-color: #FF6600;
	}

	.vicsek-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #4A3A20;
	}

	.vicsek-checkbox input[type="checkbox"] {
		accent-color: #FF6600;
	}

	.vector-text {
		position: relative;
		display: inline-block;
		font-weight: bold;
	}

	.vector-text::after {
		content: '→';
		position: absolute;
		top: -8px;
		left: 50%;
		transform: translateX(-50%) rotate(0deg);
		font-size: 1.2em;
		color: #FF6600;
	}

	@media (max-width: 768px) {
		.vicsek-content {
			flex-direction: column;
		}

		.vicsek-controls {
			flex: 1;
		}
	}
</style>
