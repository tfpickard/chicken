<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Canvas and rendering
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationId: number;
	let isRunning = false;

	// Simulation parameters
	let numParticles = 100;
	let particleRadius = 8;
	let selfPropulsionSpeed = 2.0; // v₀
	let rotationalDiffusion = 0.5; // D_r
	let interactionProbability = 0.7; // Probability of excluded volume interaction
	let dt = 0.1; // time step

	// Particle system
	interface Particle {
		x: number;
		y: number;
		theta: number; // orientation angle
		color: string;
	}

	let particles: Particle[] = [];

	// Chicken colors for particles
	const chickenColors = [
		'#FF6600', '#FFFF00', '#FF0080', '#00FFFF',
		'#00FF00', '#FF00FF', '#FFD700', '#FF4500'
	];

	onMount(() => {
		initCanvas();
		initParticles();
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	});

	function initCanvas() {
		ctx = canvas.getContext('2d')!;
		canvas.width = 800;
		canvas.height = 600;
	}

	function initParticles() {
		particles = [];
		for (let i = 0; i < numParticles; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				theta: Math.random() * 2 * Math.PI,
				color: chickenColors[Math.floor(Math.random() * chickenColors.length)]
			});
		}
	}

	function resetSimulation() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		isRunning = false;
		initParticles();
		draw();
	}

	function toggleSimulation() {
		isRunning = !isRunning;
		if (isRunning) {
			animate();
		} else {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		}
	}

	// Box-Muller transform for Gaussian random numbers
	function gaussianRandom(): number {
		let u1 = Math.random();
		let u2 = Math.random();
		return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	}

	function updateParticle(p: Particle) {
		// Active Brownian Particle dynamics

		// Self-propulsion
		let vx = selfPropulsionSpeed * Math.cos(p.theta);
		let vy = selfPropulsionSpeed * Math.sin(p.theta);

		p.x += vx * dt;
		p.y += vy * dt;

		// Rotational diffusion (Brownian rotation)
		let dtheta = Math.sqrt(2 * rotationalDiffusion * dt) * gaussianRandom();
		p.theta += dtheta;

		// Hard boundary reflections
		if (p.x - particleRadius < 0) {
			p.x = particleRadius;
			p.theta = Math.PI - p.theta; // reflect angle
		}
		if (p.x + particleRadius > canvas.width) {
			p.x = canvas.width - particleRadius;
			p.theta = Math.PI - p.theta;
		}
		if (p.y - particleRadius < 0) {
			p.y = particleRadius;
			p.theta = -p.theta; // reflect angle
		}
		if (p.y + particleRadius > canvas.height) {
			p.y = canvas.height - particleRadius;
			p.theta = -p.theta;
		}

		// Normalize angle to [0, 2π)
		p.theta = ((p.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
	}

	function handleExcludedVolume() {
		// Excluded volume interactions (chickens avoiding each other)
		// Using a simple pairwise check (O(N²) - fine for small N)

		for (let i = 0; i < particles.length; i++) {
			for (let j = i + 1; j < particles.length; j++) {
				let p1 = particles[i];
				let p2 = particles[j];

				let dx = p2.x - p1.x;
				let dy = p2.y - p1.y;
				let distSq = dx * dx + dy * dy;
				let minDist = 2 * particleRadius;

				if (distSq < minDist * minDist) {
					// Particles overlap - apply excluded volume (sometimes)
					if (Math.random() < interactionProbability) {
						// Push particles apart
						let dist = Math.sqrt(distSq);
						if (dist < 0.01) dist = 0.01; // avoid division by zero

						let overlap = minDist - dist;
						let nx = dx / dist;
						let ny = dy / dist;

						// Push each particle half the overlap distance
						p1.x -= nx * overlap * 0.5;
						p1.y -= ny * overlap * 0.5;
						p2.x += nx * overlap * 0.5;
						p2.y += ny * overlap * 0.5;

						// Randomize orientation on collision (for extra chaos)
						if (Math.random() < 0.3) {
							p1.theta += (Math.random() - 0.5) * Math.PI;
							p2.theta += (Math.random() - 0.5) * Math.PI;
						}
					}
					// else: randomly ignore the interaction (chaos!)
				}
			}
		}
	}

	function update() {
		// Update all particles
		particles.forEach(updateParticle);

		// Handle excluded volume interactions
		handleExcludedVolume();
	}

	function draw() {
		// Clear canvas with chicken background
		ctx.fillStyle = '#3D3D2B';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw particles as circles with direction indicator
		particles.forEach(p => {
			// Draw particle body
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(p.x, p.y, particleRadius, 0, 2 * Math.PI);
			ctx.fill();

			// Draw direction indicator (beak!)
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(
				p.x + particleRadius * 1.5 * Math.cos(p.theta),
				p.y + particleRadius * 1.5 * Math.sin(p.theta)
			);
			ctx.stroke();

			// Draw eye
			let eyeX = p.x + particleRadius * 0.3 * Math.cos(p.theta + 0.3);
			let eyeY = p.y + particleRadius * 0.3 * Math.sin(p.theta + 0.3);
			ctx.fillStyle = '#FFFFFF';
			ctx.beginPath();
			ctx.arc(eyeX, eyeY, 2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.arc(eyeX, eyeY, 1, 0, 2 * Math.PI);
			ctx.fill();
		});
	}

	function animate() {
		if (!isRunning) return;

		update();
		draw();

		animationId = requestAnimationFrame(animate);
	}
</script>

<svelte:head>
	<title>Chicken Particle Physics - Active Brownian Motion</title>
	<meta name="description" content="Watch chickens exhibit Active Brownian Particle behavior" />
</svelte:head>

<nav class="navbar">
	<a href="/" class="nav-link">🏠 Home</a>
	<a href="/particles" class="nav-link active">🐔 Particle Physics</a>
</nav>

<main class="container">
	<header>
		<h1 class="title">chicken particle physics</h1>
		<p class="subtitle">Active Brownian Particles • Self-Propelled Chaos • Non-Equilibrium Phase Transitions</p>
	</header>

	<div class="content-wrapper">
		<div class="canvas-container">
			<canvas bind:this={canvas}></canvas>
		</div>

		<div class="controls-panel">
			<h2 class="controls-title">PHYSICS CONTROLS</h2>

			<div class="control-group">
				<label>
					<span class="label-text">Chicken Count: <strong>{numParticles}</strong></span>
					<input
						type="range"
						min="10"
						max="300"
						bind:value={numParticles}
						on:change={resetSimulation}
					/>
				</label>
			</div>

			<div class="control-group">
				<label>
					<span class="label-text">Self-Propulsion Speed (v₀): <strong>{selfPropulsionSpeed.toFixed(1)}</strong></span>
					<input
						type="range"
						min="0.5"
						max="5"
						step="0.1"
						bind:value={selfPropulsionSpeed}
					/>
				</label>
			</div>

			<div class="control-group">
				<label>
					<span class="label-text">Rotational Diffusion (D_r): <strong>{rotationalDiffusion.toFixed(2)}</strong></span>
					<input
						type="range"
						min="0"
						max="2"
						step="0.05"
						bind:value={rotationalDiffusion}
					/>
				</label>
			</div>

			<div class="control-group">
				<label>
					<span class="label-text">Interaction Probability: <strong>{(interactionProbability * 100).toFixed(0)}%</strong></span>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={interactionProbability}
					/>
				</label>
			</div>

			<div class="control-group">
				<label>
					<span class="label-text">Chicken Size: <strong>{particleRadius}</strong></span>
					<input
						type="range"
						min="4"
						max="20"
						step="1"
						bind:value={particleRadius}
						on:change={draw}
					/>
				</label>
			</div>

			<div class="button-group">
				<button class="control-button start-button" on:click={toggleSimulation}>
					{isRunning ? '⏸ PAUSE' : '▶ START'}
				</button>
				<button class="control-button reset-button" on:click={resetSimulation}>
					🔄 RESET
				</button>
			</div>

			<div class="physics-info">
				<h3>The Physics:</h3>
				<ul>
					<li><strong>Self-Propulsion:</strong> Each chicken walks at constant speed v₀</li>
					<li><strong>Rotational Diffusion:</strong> Random direction changes (thermal noise)</li>
					<li><strong>Hard Boundaries:</strong> Elastic reflections at walls</li>
					<li><strong>Excluded Volume:</strong> Chickens avoid each other (sometimes!)</li>
					<li><strong>Phase Transition:</strong> At high density → spontaneous clustering</li>
					<li><strong>Chaos:</strong> Deterministic + stochastic = unpredictable patterns!</li>
				</ul>
			</div>
		</div>
	</div>

	<footer>
		<p>Active Brownian Particle Simulation • Non-Equilibrium Statistical Mechanics</p>
		<p class="hint">Try increasing chicken density to see phase transitions! 🐔</p>
	</footer>
</main>

<style>
	.navbar {
		position: sticky;
		top: 0;
		width: 100%;
		background-color: #FF6600;
		border-bottom: 4px solid #CC5500;
		padding: 1rem 2rem;
		display: flex;
		gap: 2rem;
		z-index: 100;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.nav-link {
		color: #FFFF00;
		text-decoration: none;
		font-weight: bold;
		font-size: 1.2rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		transition: all 0.2s ease;
		text-shadow: 2px 2px 0 #000000;
	}

	.nav-link:hover {
		background-color: #FF8800;
		transform: translateY(-2px);
		box-shadow: 0 4px 0 #CC5500;
	}

	.nav-link.active {
		background-color: #FFFF00;
		color: #000000;
		text-shadow: 1px 1px 0 #FF6600;
	}

	.container {
		min-height: calc(100vh - 80px);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		gap: 2rem;
	}

	header {
		text-align: center;
	}

	.title {
		font-size: 3rem;
		font-weight: bold;
		text-transform: lowercase;
		color: #000000;
		text-shadow: 3px 3px 0 #FF6600, -1px -1px 0 #00FFFF;
		letter-spacing: 0.2em;
	}

	.subtitle {
		font-size: 1rem;
		color: #000000;
		margin-top: 0.5rem;
		font-weight: bold;
	}

	.content-wrapper {
		display: flex;
		gap: 2rem;
		width: 100%;
		max-width: 1400px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.canvas-container {
		background-color: #3D3D2B;
		border: 4px solid #CC5500;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 8px 8px 0 #CC5500;
	}

	canvas {
		display: block;
		border: 2px solid #FF6600;
		border-radius: 4px;
	}

	.controls-panel {
		background-color: #3D3D2B;
		border: 4px solid #CC5500;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 8px 8px 0 #CC5500;
		max-width: 400px;
		flex: 1;
		min-width: 300px;
	}

	.controls-title {
		font-size: 1.5rem;
		color: #FFFF00;
		text-align: center;
		margin-bottom: 1.5rem;
		text-shadow: 2px 2px 0 #FF6600;
		letter-spacing: 0.1em;
	}

	.control-group {
		margin-bottom: 1.5rem;
	}

	.label-text {
		display: block;
		color: #FFFF00;
		font-weight: bold;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	input[type="range"] {
		width: 100%;
		height: 8px;
		background: #FF6600;
		border-radius: 5px;
		outline: none;
		-webkit-appearance: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: #FFFF00;
		border: 2px solid #000000;
		border-radius: 50%;
		cursor: pointer;
	}

	input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: #FFFF00;
		border: 2px solid #000000;
		border-radius: 50%;
		cursor: pointer;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.control-button {
		flex: 1;
		font-size: 1.2rem;
		font-weight: bold;
		padding: 0.8rem;
		border: 3px solid #000000;
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		text-transform: uppercase;
		transition: all 0.1s ease;
		box-shadow: 4px 4px 0 #000000;
	}

	.start-button {
		background-color: #00FF00;
		color: #000000;
	}

	.start-button:hover {
		background-color: #00FFFF;
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 #000000;
	}

	.reset-button {
		background-color: #FF0080;
		color: #FFFFFF;
	}

	.reset-button:hover {
		background-color: #FF00FF;
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 #000000;
	}

	.physics-info {
		background-color: #4A4A35;
		border: 2px solid #FF6600;
		border-radius: 8px;
		padding: 1rem;
		color: #CCCCCC;
		font-size: 0.85rem;
		line-height: 1.6;
	}

	.physics-info h3 {
		color: #FFFF00;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.physics-info ul {
		list-style-position: inside;
		margin-left: 0.5rem;
	}

	.physics-info li {
		margin-bottom: 0.3rem;
	}

	.physics-info strong {
		color: #FF6600;
	}

	footer {
		margin-top: auto;
		text-align: center;
		color: #000000;
		font-size: 0.9rem;
		font-weight: bold;
	}

	.hint {
		font-size: 0.8rem;
		color: #663399;
		margin-top: 0.5rem;
	}

	@media (max-width: 1200px) {
		.content-wrapper {
			flex-direction: column;
			align-items: center;
		}

		.controls-panel {
			max-width: 800px;
		}
	}
</style>
