<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Simulation state
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let particles: Particle[] = [];
  let animationId: number;

  // Simulation parameters
  let particleCount = 150;
  let speed = 2.0;
  let noiseStrength = 0.3;
  let neighborRadius = 50;
  let showVectors = false;
  let showNeighbors = false;

  // Stats
  let avgAlignment = 0;
  let fps = 0;
  let lastTime = 0;

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;

    constructor(width: number, height: number) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(this.angle) * speed;
      this.vy = Math.sin(this.angle) * speed;
    }

    update(neighbors: Particle[], width: number, height: number) {
      // Calculate average direction of neighbors
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

      // Add noise
      avgAngle += (Math.random() - 0.5) * noiseStrength * Math.PI;

      this.angle = avgAngle;
      this.vx = Math.cos(this.angle) * speed;
      this.vy = Math.sin(this.angle) * speed;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Periodic boundary conditions (wrap around)
      if (this.x < 0) this.x += width;
      if (this.x > width) this.x -= width;
      if (this.y < 0) this.y += height;
      if (this.y > height) this.y -= height;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      // Draw Egyptian hieroglyph: U+133F1 baby chick
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('𓅱', 0, 0);

      ctx.restore();

      // Draw velocity vector if enabled
      if (showVectors) {
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vx * 5, this.y + this.vy * 5);
        ctx.stroke();
      }
    }

    drawNeighborRadius(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = 'rgba(255, 0, 128, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, neighborRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    distanceTo(other: Particle, width: number, height: number): number {
      // Calculate distance with periodic boundary conditions
      let dx = Math.abs(this.x - other.x);
      let dy = Math.abs(this.y - other.y);

      if (dx > width / 2) dx = width - dx;
      if (dy > height / 2) dy = height - dy;

      return Math.sqrt(dx * dx + dy * dy);
    }
  }

  function initSimulation() {
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(width, height));
    }
  }

  function animate(timestamp: number) {
    // Calculate FPS
    if (lastTime) {
      fps = Math.round(1000 / (timestamp - lastTime));
    }
    lastTime = timestamp;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#FFFACD';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Update particles
    let totalAlignment = 0;
    particles.forEach(p => {
      // Find neighbors
      const neighbors = particles.filter(other => {
        if (p === other) return false;
        return p.distanceTo(other, width, height) < neighborRadius;
      });

      p.update(neighbors, width, height);

      // Calculate alignment contribution
      totalAlignment += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    });

    // Calculate average alignment (order parameter)
    avgAlignment = totalAlignment / (particles.length * speed);

    // Draw neighbor radius if enabled
    if (showNeighbors && particles.length > 0) {
      particles[0].drawNeighborRadius(ctx);
    }

    // Draw particles
    particles.forEach(p => p.draw(ctx));

    animationId = requestAnimationFrame(animate);
  }

  function reset() {
    initSimulation();
  }

  function handleParticleCountChange() {
    initSimulation();
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;
    initSimulation();
    animationId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<svelte:head>
  <title>Vicsek Simulation - Chicken</title>
</svelte:head>

<main class="container">
  <h1>𓅢 𓅱 Flocking Simulation</h1>

  <div class="content">
    <div class="canvas-container">
      <canvas bind:this={canvas}></canvas>
      <div class="stats">
        <span>FPS: {fps}</span>
        <span>𓅱𓅱: {particles.length}</span>
        <span>Flockiness: {avgAlignment.toFixed(3)}</span>
      </div>
    </div>

    <div class="controls">
      <h2>𓅢 Controls</h2>

      <div class="control-group">
        <button on:click={reset} class="btn">🔄 Reset 𓅱𓅱</button>
      </div>

      <div class="control-group">
        <label>
          <span>Flock Size: {particleCount}</span>
          <input
            type="range"
            bind:value={particleCount}
            min="10"
            max="500"
            step="10"
            on:change={handleParticleCountChange}
          />
        </label>
      </div>

      <div class="control-group">
        <label>
          <span>𓅱 Speed: {speed.toFixed(1)}</span>
          <input
            type="range"
            bind:value={speed}
            min="0.5"
            max="5"
            step="0.1"
          />
        </label>
      </div>

      <div class="control-group">
        <label>
          <span>𓅱 Chaos: {noiseStrength.toFixed(2)}</span>
          <input
            type="range"
            bind:value={noiseStrength}
            min="0"
            max="2"
            step="0.05"
          />
        </label>
      </div>

      <div class="control-group">
        <label>
          <span>𓅱 Vision: {neighborRadius}</span>
          <input
            type="range"
            bind:value={neighborRadius}
            min="10"
            max="150"
            step="5"
          />
        </label>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" bind:checked={showVectors} />
          Show <span class="vector-text">𓅱</span>
        </label>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" bind:checked={showNeighbors} />
          Show Vision Range
        </label>
      </div>
    </div>
  </div>

  <div class="back-link">
    <a href="/">← Back to 𓅱𓅱</a>
  </div>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #FFFF00 0%, #FFD700 100%);
    min-height: 100vh;
  }

  h1 {
    font-size: 2.5rem;
    color: #FF6600;
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .content {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .canvas-container {
    position: relative;
    flex: 1;
    min-width: 300px;
  }

  canvas {
    border: 4px solid #FF6600;
    border-radius: 8px;
    background: #FFFACD;
    display: block;
    width: 100%;
    height: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    border: 2px solid #FF6600;
  }

  .stats span {
    font-weight: bold;
    color: #CC5500;
  }

  .controls {
    flex: 0 0 300px;
    background: rgba(255, 255, 255, 0.9);
    padding: 1.5rem;
    border-radius: 8px;
    border: 3px solid #FF6600;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .controls h2 {
    margin-top: 0;
    color: #FF6600;
    border-bottom: 2px solid #FF6600;
    padding-bottom: 0.5rem;
  }

  .control-group {
    margin: 1rem 0;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.5rem;
  }

  .control-group span {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
    color: #CC5500;
  }

  input[type="range"] {
    width: 100%;
    accent-color: #FF6600;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
    accent-color: #FF6600;
  }

  .btn {
    background: #FF6600;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    transition: background 0.2s;
  }

  .btn:hover {
    background: #CC5500;
  }

  .btn:active {
    transform: translateY(2px);
  }

  .vector-text {
    position: relative;
    display: inline-block;
    font-weight: bold;
  }

  .vector-text::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 0;
    right: 0;
    height: 0;
    border-top: 2px solid #FF6600;
  }

  .vector-text::after {
    content: '→';
    position: absolute;
    top: -14px;
    right: -8px;
    font-size: 1.2em;
    color: #FF6600;
    line-height: 1;
  }

  .back-link {
    text-align: center;
    margin-top: 2rem;
  }

  .back-link a {
    color: #CC5500;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    border: 2px solid #CC5500;
    border-radius: 4px;
    display: inline-block;
    transition: all 0.2s;
  }

  .back-link a:hover {
    background: #CC5500;
    color: white;
  }

  @media (max-width: 768px) {
    .content {
      flex-direction: column;
    }

    .controls {
      flex: 1;
    }
  }
</style>
