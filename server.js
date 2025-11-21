import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

const CHICKEN_WORD = 'chicken';
const DEFAULT_COUNT = 1000;
const MAX_COUNT = 50000;

const asciiFrames = [
`   _
 __(.)<
 \___)`,
`  _
>(.)__
 (___/`,
`    _
 __(.)>
 \___)`,
`  _
<(.)__
 (___/`,
`   _
 (.)__>
 (___/`,
`   _
 >(.)__
  (___/`,
`   _
 __(.)-
 \___)`,
`   _
 (.)__
 (___)>`
];

const leaderboard = new Map();

const getClientKey = (req) => {
  return req.headers['x-chicken-client'] || req.ip || 'mystery-chicken';
};

const addToLeaderboard = (req, count) => {
  const key = getClientKey(req);
  const total = leaderboard.get(key) || 0;
  leaderboard.set(key, total + count);
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'chicken' });
});

app.get('/chicken', (req, res) => {
  const body = Array.from({ length: DEFAULT_COUNT }, () => CHICKEN_WORD).join(' ');
  addToLeaderboard(req, DEFAULT_COUNT);
  res.type('text/plain').send(body);
});

app.get('/chicken/json', (req, res) => {
  addToLeaderboard(req, DEFAULT_COUNT);
  res.json(Array(DEFAULT_COUNT).fill(CHICKEN_WORD));
});

app.get('/chicken/:count', (req, res) => {
  const raw = req.params.count;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return res.status(400).json({ cluck: 'nope' });
  }
  const safeCount = Math.max(0, Math.min(MAX_COUNT, Math.floor(parsed)));
  addToLeaderboard(req, safeCount);
  const payload = Array.from({ length: safeCount }, () => CHICKEN_WORD).join(' ');
  res.type('text/plain').send(payload);
});

app.get('/ascii/rave', (_req, res) => {
  res.json({ frames: asciiFrames, fps: 4 });
});

app.get('/leaderboard', (_req, res) => {
  const ranking = Array.from(leaderboard.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([client, total]) => ({ client, total }));
  res.json({ chickens: ranking });
});

app.use((req, res, next) => {
  if (req.path === '/') return next();
  next();
});

app.listen(PORT, () => {
  console.log(`CaaS listening on port ${PORT}`);
});
