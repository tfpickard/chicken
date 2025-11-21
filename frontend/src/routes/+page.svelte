<script lang="ts">
  import { onMount } from 'svelte';
  import { defaultFrameDuration, fallbackFrames } from '$lib/chickenFrames';

  const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

  let frames = fallbackFrames;
  let frameDuration = defaultFrameDuration;
  let frameIndex = 0;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let waterfall = '';
  let statusMessage = '';
  let leaders: { client: string; chickens: number }[] = [];
  let showMegaChicken = false;

  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ];
  let konamiBuffer: string[] = [];

  const megaChicken = `  .~.    .~.    .~.    .~.    .~.\n ( C )  ( H )  ( I )  ( C )  ( K )\n  \\ \\    \\ \\    \\ \\    \\ \\    \\ \\
   ) )    ) )    ) )    ) )    ) )\n  /_/    /_/    /_/    /_/    /_/`;

  function startAnimation() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
    }, frameDuration);
  }

  async function loadFrames() {
    try {
      const response = await fetch(`${API_BASE}/ascii/rave`);
      if (response.ok) {
        const payload = await response.json();
        frames = payload.frames ?? fallbackFrames;
        frameDuration = payload.frameDurationMs ?? defaultFrameDuration;
      }
    } catch (error) {
      console.error('Using fallback frames because rave endpoint was shy.', error);
    } finally {
      startAnimation();
    }
  }

  async function fetchChicken() {
    const response = await fetch(`${API_BASE}/chicken`);
    const birdText = await response.text();
    waterfall = birdText;
    statusMessage = `Served ${birdText.split(' ').length} chickens.`;
    await loadLeaderboard();
  }

  async function loadLeaderboard() {
    try {
      const response = await fetch(`${API_BASE}/leaderboard`);
      if (response.ok) {
        const payload = await response.json();
        leaders = payload.leaders ?? [];
      }
    } catch (error) {
      console.warn('Leaderboard taking a nap.', error);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    konamiBuffer.push(event.key);
    if (konamiBuffer.length > konamiCode.length) {
      konamiBuffer.shift();
    }
    if (konamiBuffer.join(',') === konamiCode.join(',')) {
      showMegaChicken = true;
      setTimeout(() => (showMegaChicken = false), 3000);
    }
  }

  onMount(() => {
    loadFrames();
    loadLeaderboard();
    window.addEventListener('keydown', handleKeydown);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>chicken</title>
</svelte:head>

<main>
  <section class="hero">
    <div class="titles">
      <h1>chicken</h1>
      <p class="subtitle">CaaC: Chicken as a CaaC</p>
    </div>
    <pre class="ascii" aria-live="polite">{frames[frameIndex]}</pre>
    <button class="cluck-button" on:click={fetchChicken}>CHICKEN</button>
    {#if statusMessage}
      <p class="status">{statusMessage}</p>
    {/if}
  </section>

  <section class="waterfall" aria-label="Chicken waterfall">
    <div class="dump" tabindex="-1" role="region" aria-label="Chicken waterfall log">{waterfall}</div>
  </section>

  <section class="leaderboard" aria-label="Chicken leaderboard">
    <h2>Chicken Leaderboard</h2>
    {#if leaders.length === 0}
      <p>No clucks counted yet.</p>
    {:else}
      <ol>
        {#each leaders as leader}
          <li>{leader.client}: {leader.chickens}</li>
        {/each}
      </ol>
    {/if}
  </section>

  {#if showMegaChicken}
    <pre class="mega">{megaChicken}</pre>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Courier New', monospace;
    background: #ff0;
    color: #111;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    gap: 1.5rem;
  }

  .hero {
    text-align: center;
  }

  h1 {
    font-size: 3rem;
    margin: 0.2rem 0;
  }

  .subtitle {
    margin: 0 0 1rem;
    font-size: 1.2rem;
  }

  .ascii {
    font-size: 1.5rem;
    border: 3px solid #111;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.5);
    min-width: 8ch;
    min-height: 6ch;
  }

  .cluck-button {
    margin-top: 1rem;
    padding: 0.8rem 1.6rem;
    font-size: 1.2rem;
    font-weight: bold;
    border: 3px solid #111;
    background: #fffbe6;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
  }

  .cluck-button:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #111;
  }

  .status {
    margin-top: 0.5rem;
  }

  .waterfall {
    width: 100%;
  }

  .dump {
    max-height: 240px;
    overflow-y: auto;
    border: 3px solid #111;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.7);
    white-space: pre-wrap;
    line-height: 1.4;
  }

  .leaderboard {
    width: 100%;
    max-width: 500px;
    border: 3px solid #111;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.75);
  }

  .leaderboard h2 {
    margin-top: 0;
  }

  .mega {
    font-size: 1.3rem;
    white-space: pre;
    border: 4px dashed #111;
    padding: 1rem;
    background: #fff0f0;
  }
</style>
