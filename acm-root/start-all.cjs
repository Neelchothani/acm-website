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
  { name: 'FRONTVIEW', port: 8080, color: 'magenta', dir: path.join(root, 'acm-frontview', 'Earth Spinning Animation', 'ACM-Website-main') },
  { name: 'HOMEPAGE',  port: 5173, color: 'green',   dir: path.join(root, 'acm homepage', 'ACM CITY 2') },
  { name: 'EVENTS',    port: 5174, color: 'yellow',  dir: path.join(root, 'acm-events', 'acm-events') },
  { name: 'EDITORIAL', port: 5175, color: 'blue',    dir: path.join(root, 'editorial page', 'events-acm') },
  { name: 'RESEARCH',  port: 5176, color: 'red',     dir: path.join(root, 'acm-research', 'acm-research-v3_7_4-mesh-field') },
  { name: 'TEAM',      port: 5177, color: 'white',   dir: path.join(root, 'acm-team') },
  { name: 'CONNECT',   port: 5178, color: 'gray',    dir: path.join(root, 'acm connect us') },
];

const fs = require('fs');

console.log('\n\x1b[36m========================================================\x1b[0m');
console.log('\x1b[36m  ACM WEBSITE — All Development Servers Starting\x1b[0m');
console.log('\x1b[36m========================================================\x1b[0m');
console.log('\x1b[32m  ★  Open: http://localhost:3001  ★\x1b[0m');
console.log('');
console.log('  ROOT      → http://localhost:3001  (this terminal)');

const activeServers = [];
servers.forEach((s) => {
  const pkgPath = path.join(s.dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    console.log(`  ${s.name.padEnd(9)} → http://localhost:${s.port}`);
    activeServers.push(s);
  } else {
    console.log(`\x1b[33m  ${s.name.padEnd(9)} → [SKIPPED - empty or missing package.json]\x1b[0m`);
  }
});
console.log('\x1b[36m========================================================\x1b[0m\n');

const commands = activeServers.map((s) => ({
  command: 'npm run dev',
  cwd: s.dir,
  name: s.name,
  prefixColor: s.color,
}));

if (commands.length === 0) {
  console.log('\x1b[31mNo sub-apps found to run!\x1b[0m');
  process.exit(0);
}

const { result } = concurrently(commands, {
  restartTries: 0,
  prefix: 'name',
});

result.then(
  () => process.exit(0),
  () => process.exit(1)
);
