// start-all.cjs — launches all ACM sub-app dev servers
// This script starts the 7 sub-apps. The root shell (port 3001) is started
// automatically by npm run dev:all via package.json "dev:all" script.
//
// Run: npm run dev:all   (from d:\acm-website\acm-root)

const { concurrently } = require('concurrently');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Sub-apps only — ROOT is started separately by npm run dev:all
const servers = [
  { name: 'FRONTVIEW', color: 'magenta', dir: path.join(root, 'acm-frontview', 'Earth Spinning Animation', 'ACM-Website-main') },
  { name: 'HOMEPAGE',  color: 'green',   dir: path.join(root, 'acm homepage', 'ACM CITY 2') },
  { name: 'EVENTS',    color: 'yellow',  dir: path.join(root, 'acm-events', 'acm-events') },
  { name: 'EDITORIAL', color: 'blue',    dir: path.join(root, 'editorial page', 'events-acm') },
  { name: 'RESEARCH',  color: 'red',     dir: path.join(root, 'acm-research', 'acm-research-v3_7_4-mesh-field') },
  { name: 'TEAM',      color: 'white',   dir: path.join(root, 'acm-team') },
  { name: 'CONNECT',   color: 'gray',    dir: path.join(root, 'acm connect us') },
];

console.log('\n\x1b[36m========================================================\x1b[0m');
console.log('\x1b[36m  ACM WEBSITE — All Development Servers Starting\x1b[0m');
console.log('\x1b[36m========================================================\x1b[0m');
console.log('\x1b[32m  ★  Open: http://localhost:3001  ★\x1b[0m');
console.log('');
console.log('  ROOT      → http://localhost:3001  (this terminal)');
console.log('  FRONTVIEW → http://localhost:8080');
console.log('  HOMEPAGE  → http://localhost:5173');
console.log('  EVENTS    → http://localhost:5174');
console.log('  EDITORIAL → http://localhost:5175');
console.log('  RESEARCH  → http://localhost:5176');
console.log('  TEAM      → http://localhost:5177');
console.log('  CONNECT   → http://localhost:5178');
console.log('\x1b[36m========================================================\x1b[0m\n');

const commands = servers.map((s) => ({
  command: 'npm run dev',
  cwd: s.dir,
  name: s.name,
  prefixColor: s.color,
}));

const { result } = concurrently(commands, {
  killOthers: ['failure'],
  restartTries: 0,
  prefix: 'name',
});

result.then(
  () => process.exit(0),
  () => process.exit(1)
);
