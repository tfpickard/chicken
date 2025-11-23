<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Canvas and context
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	// Simulation state
	let isRunning = false;
	let animationFrameId: number | null = null;

	// Parameters
	let numChickens = 20;
	let meanRunDuration = 2.0; // seconds
	let speed = 100; // pixels per second
	let boundaryType: 'reflecting' | 'periodic' = 'reflecting';
	let showTrails = true;
	let trailLength = 50;

	// Chickens
	interface Chicken {
		x: number;
		y: number;
		angle: number; // in radians
		runTimeRemaining: number; // seconds
		trail: { x: number; y: number }[];
		color: string;
	}

	let chickens: Chicken[] = [];
	let lastTime = 0;

	// Chicken colors (matching the obnoxious theme)
	const CHICKEN_COLORS = [
		'#FF6600', '#FFFF00', '#00FFFF', '#FF00FF',
		'#00FF00', '#FF0080', '#FFA500', '#00FF80'
	];

	// Generate exponentially distributed random number
	function exponentialRandom(lambda: number): number {
		return -Math.log(1 - Math.random()) / lambda;
	}

	// Initialize a single chicken
	function createChicken(): Chicken {
		const width = canvas?.width || 800;
		const height = canvas?.height || 600;

		return {
			x: Math.random() * width,
			y: Math.random() * height,
			angle: Math.random() * 2 * Math.PI,
			runTimeRemaining: exponentialRandom(1 / meanRunDuration),
			trail: [],
			color: CHICKEN_COLORS[Math.floor(Math.random() * CHICKEN_COLORS.length)]
		};
	}

	// Initialize all chickens
	function initializeChickens() {
		chickens = Array.from({ length: numChickens }, () => createChicken());
	}

	// Tumble: change direction randomly
	function tumble(chicken: Chicken) {
		chicken.angle = Math.random() * 2 * Math.PI;
		chicken.runTimeRemaining = exponentialRandom(1 / meanRunDuration);
	}

	// Update chicken position
	function updateChicken(chicken: Chicken, deltaTime: number) {
		const width = canvas.width;
		const height = canvas.height;

		// Update run timer
		chicken.runTimeRemaining -= deltaTime;

		// Tumble if run time is over
		if (chicken.runTimeRemaining <= 0) {
			tumble(chicken);
		}

		// Add current position to trail
		if (showTrails) {
			chicken.trail.push({ x: chicken.x, y: chicken.y });
			if (chicken.trail.length > trailLength) {
				chicken.trail.shift();
			}
		} else {
			chicken.trail = [];
		}

		// Calculate new position
		const dx = Math.cos(chicken.angle) * speed * deltaTime;
		const dy = Math.sin(chicken.angle) * speed * deltaTime;

		chicken.x += dx;
		chicken.y += dy;

		// Handle boundaries
		if (boundaryType === 'reflecting') {
			// Reflect off walls
			if (chicken.x < 0 || chicken.x > width) {
				chicken.angle = Math.PI - chicken.angle;
				chicken.x = Math.max(0, Math.min(width, chicken.x));
				tumble(chicken); // Tumble on collision
			}
			if (chicken.y < 0 || chicken.y > height) {
				chicken.angle = -chicken.angle;
				chicken.y = Math.max(0, Math.min(height, chicken.y));
				tumble(chicken); // Tumble on collision
			}
		} else {
			// Periodic boundaries (wrap around)
			if (chicken.x < 0) chicken.x += width;
			if (chicken.x > width) chicken.x -= width;
			if (chicken.y < 0) chicken.y += height;
			if (chicken.y > height) chicken.y -= height;
		}
	}

	// Draw chicken
	function drawChicken(chicken: Chicken) {
		// Draw trail
		if (showTrails && chicken.trail.length > 1) {
			ctx.strokeStyle = chicken.color;
			ctx.lineWidth = 2;
			ctx.globalAlpha = 0.3;
			ctx.beginPath();
			ctx.moveTo(chicken.trail[0].x, chicken.trail[0].y);
			for (let i = 1; i < chicken.trail.length; i++) {
				ctx.lineTo(chicken.trail[i].x, chicken.trail[i].y);
			}
			ctx.stroke();
			ctx.globalAlpha = 1.0;
		}

		// Draw chicken body (circle)
		ctx.fillStyle = chicken.color;
		ctx.beginPath();
		ctx.arc(chicken.x, chicken.y, 8, 0, 2 * Math.PI);
		ctx.fill();

		// Draw direction indicator (line)
		ctx.strokeStyle = chicken.color;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(chicken.x, chicken.y);
		ctx.lineTo(
			chicken.x + Math.cos(chicken.angle) * 15,
			chicken.y + Math.sin(chicken.angle) * 15
		);
		ctx.stroke();

		// Draw chicken eye
		ctx.fillStyle = '#000000';
		ctx.beginPath();
		ctx.arc(
			chicken.x + Math.cos(chicken.angle) * 5,
			chicken.y + Math.sin(chicken.angle) * 5,
			2,
			0,
			2 * Math.PI
		);
		ctx.fill();
	}

	// Main animation loop
	function animate(currentTime: number) {
		if (!isRunning) return;

		const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
		lastTime = currentTime;

		// Clear canvas with slight fade for trail effect
		ctx.fillStyle = 'rgba(61, 61, 43, 0.1)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Update and draw chickens
		chickens.forEach(chicken => {
			updateChicken(chicken, deltaTime);
			drawChicken(chicken);
		});

		animationFrameId = requestAnimationFrame(animate);
	}

	// Start simulation
	function start() {
		if (!ctx) return;
		isRunning = true;
		lastTime = 0;
		animationFrameId = requestAnimationFrame(animate);
	}

	// Stop simulation
	function stop() {
		isRunning = false;
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	// Reset simulation
	function reset() {
		stop();
		initializeChickens();
		if (ctx) {
			ctx.fillStyle = '#3D3D2B';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			chickens.forEach(drawChicken);
		}
	}

	// Handle parameter changes
	function handleChickenCountChange() {
		const wasRunning = isRunning;
		stop();
		initializeChickens();
		if (wasRunning) start();
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = 800;
		canvas.height = 600;

		// Initial setup
		ctx.fillStyle = '#3D3D2B';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		initializeChickens();
		chickens.forEach(drawChicken);
	});

	onDestroy(() => {
		stop();
	});
</script>

<svelte:head>
	<title>Chicken Run-and-Tumble Simulation</title>
	<meta name="description" content="Run-and-tumble motion simulation with chickens - Lévy walk foraging behavior" />
</svelte:head>

<main class="container">
	<header>
		<h1 class="title">🐔 Run-and-Tumble 🐔</h1>
		<p class="subtitle">
			Lévy-Walk Foraging Behavior<br/>
			<span class="science">Originally from bacterial dynamics, now with 100% more chicken</span>
		</p>
	</header>

	<div class="simulation-container">
		<canvas bind:this={canvas} class="simulation-canvas"></canvas>
	</div>

	<div class="controls">
		<div class="control-row">
			<button
				class="control-button start-button"
				on:click={start}
				disabled={isRunning}
			>
				▶ Start
			</button>
			<button
				class="control-button stop-button"
				on:click={stop}
				disabled={!isRunning}
			>
				⏸ Pause
			</button>
			<button
				class="control-button reset-button"
				on:click={reset}
			>
				↻ Reset
			</button>
		</div>

		<div class="parameters">
			<h3>Parameters</h3>

			<div class="parameter">
				<label for="numChickens">
					Number of Chickens: <span class="value">{numChickens}</span>
				</label>
				<input
					type="range"
					id="numChickens"
					bind:value={numChickens}
					on:input={handleChickenCountChange}
					min="1"
					max="100"
					step="1"
				/>
			</div>

			<div class="parameter">
				<label for="meanRunDuration">
					Mean Run Duration: <span class="value">{meanRunDuration.toFixed(1)}s</span>
				</label>
				<input
					type="range"
					id="meanRunDuration"
					bind:value={meanRunDuration}
					min="0.1"
					max="5.0"
					step="0.1"
				/>
			</div>

			<div class="parameter">
				<label for="speed">
					Speed: <span class="value">{speed} px/s</span>
				</label>
				<input
					type="range"
					id="speed"
					bind:value={speed}
					min="10"
					max="300"
					step="10"
				/>
			</div>

			<div class="parameter">
				<label for="trailLength">
					Trail Length: <span class="value">{trailLength}</span>
				</label>
				<input
					type="range"
					id="trailLength"
					bind:value={trailLength}
					min="10"
					max="200"
					step="10"
				/>
			</div>

			<div class="parameter checkbox">
				<label>
					<input type="checkbox" bind:checked={showTrails} />
					Show Trails
				</label>
			</div>

			<div class="parameter">
				<label for="boundaryType">Boundary Type:</label>
				<select id="boundaryType" bind:value={boundaryType}>
					<option value="reflecting">Reflecting</option>
					<option value="periodic">Periodic</option>
				</select>
			</div>
		</div>
	</div>

	<div class="info-box">
		<h3>About Run-and-Tumble Motion</h3>
		<p>
			Run-and-tumble is a movement pattern originally observed in bacteria like <em>E. coli</em>,
			but appears throughout nature in foraging behavior. The pattern consists of:
		</p>
		<ul>
			<li><strong>Run phase:</strong> Straight-line movement for exponentially distributed times</li>
			<li><strong>Tumble phase:</strong> Instantaneous random reorientation</li>
			<li><strong>Result:</strong> Lévy-walk-like trajectories that are optimal for searching</li>
		</ul>
		<p>
			Chickens, like many foraging animals, exhibit similar patterns when searching for food.
			The exponential distribution of run times creates a scale-free search pattern that's
			more efficient than pure random walks!
		</p>
	</div>

	<footer>
		<a href="/" class="home-link">← Back to Chicken Home</a>
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
		font-size: 3rem;
		font-weight: bold;
		color: #000000;
		text-shadow: 3px 3px 0 #FF6600, -1px -1px 0 #00FFFF;
		letter-spacing: 0.2em;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #000000;
		font-weight: bold;
	}

	.science {
		font-size: 0.9rem;
		color: #663399;
		font-style: italic;
	}

	.simulation-container {
		background-color: #3D3D2B;
		border: 4px solid #CC5500;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 8px 8px 0 #CC5500;
	}

	.simulation-canvas {
		display: block;
		border: 2px solid #FF6600;
		border-radius: 4px;
		background-color: #3D3D2B;
	}

	.controls {
		width: 100%;
		max-width: 800px;
		background-color: #4A3A20;
		border: 4px solid #CC5500;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 6px 6px 0 #CC5500;
	}

	.control-row {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.control-button {
		font-size: 1.2rem;
		font-weight: bold;
		padding: 0.75rem 1.5rem;
		border: 3px solid;
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		transition: all 0.2s ease;
		box-shadow: 4px 4px 0;
		text-transform: uppercase;
	}

	.start-button {
		background-color: #00FF00;
		color: #000000;
		border-color: #008000;
		box-shadow: 4px 4px 0 #008000;
	}

	.start-button:hover:not(:disabled) {
		background-color: #00FFFF;
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 #008000;
	}

	.start-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.stop-button {
		background-color: #FFFF00;
		color: #000000;
		border-color: #CC9900;
		box-shadow: 4px 4px 0 #CC9900;
	}

	.stop-button:hover:not(:disabled) {
		background-color: #FFA500;
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 #CC9900;
	}

	.stop-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.reset-button {
		background-color: #FF6600;
		color: #FFFFFF;
		border-color: #CC5500;
		box-shadow: 4px 4px 0 #CC5500;
	}

	.reset-button:hover {
		background-color: #FF8800;
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 #CC5500;
	}

	.parameters {
		color: #FFFFFF;
	}

	.parameters h3 {
		color: #FFFF00;
		text-align: center;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		text-shadow: 2px 2px 0 #FF6600;
	}

	.parameter {
		margin-bottom: 1rem;
	}

	.parameter label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: #FFD700;
	}

	.parameter .value {
		color: #00FFFF;
		font-size: 1.1rem;
	}

	.parameter input[type="range"] {
		width: 100%;
		height: 8px;
		border-radius: 5px;
		background: #663399;
		outline: none;
		cursor: pointer;
	}

	.parameter input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #FF6600;
		cursor: pointer;
		border: 2px solid #FFFF00;
	}

	.parameter input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #FF6600;
		cursor: pointer;
		border: 2px solid #FFFF00;
	}

	.parameter select {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
		font-family: 'Courier New', Courier, monospace;
		background-color: #663399;
		color: #FFFFFF;
		border: 2px solid #FF6600;
		border-radius: 4px;
		cursor: pointer;
	}

	.parameter.checkbox {
		display: flex;
		align-items: center;
	}

	.parameter.checkbox label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.parameter input[type="checkbox"] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.info-box {
		width: 100%;
		max-width: 800px;
		background-color: #2E2416;
		border: 4px solid #CC5500;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 6px 6px 0 #CC5500;
		color: #C8B896;
	}

	.info-box h3 {
		color: #FFFF00;
		margin-bottom: 1rem;
		font-size: 1.5rem;
		text-shadow: 2px 2px 0 #FF6600;
	}

	.info-box p {
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.info-box ul {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
	}

	.info-box li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.info-box strong {
		color: #FFD700;
	}

	.info-box em {
		color: #00FFFF;
	}

	footer {
		margin-top: 1rem;
	}

	.home-link {
		color: #FF0080;
		text-decoration: none;
		font-weight: bold;
		font-size: 1.2rem;
		text-shadow: 1px 1px 2px #00FFFF;
		transition: all 0.3s ease;
		display: inline-block;
	}

	.home-link:hover {
		color: #00FFFF;
		text-shadow: 2px 2px 4px #FF0080;
		transform: scale(1.1);
	}
</style>
