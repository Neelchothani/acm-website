# ACM Website — Root Integration Shell

This is the **integration hub** for the full ACM DJSCE website.

## Architecture

```
Browser (localhost:3000)
  └── acm-root (root shell, port 3000)
        ├── [FRONTVIEW]  acm-frontview  (port 8080)  ← Globe + Hyperspace intro
        ├── [HOMEPAGE]   ACM CITY 2     (port 5173)  ← Cinematic city scroll
        └── [SECTIONS — loaded on building click]
              ├── Events       port 5174   (acm-events)
              ├── Editorial    port 5175   (editorial page)
              ├── Research     port 5176   (acm-research)
              ├── Our Team     port 5177   (acm-team)
              └── Connect      port 5178   (acm connect us)
```

## How to Run

### Option 1: Double-click (Windows)
Double-click `start.bat` — opens each sub-app in its own PowerShell window, then starts the root shell.

### Option 2: PowerShell
```powershell
cd d:\acm-website\acm-root
.\dev-start.ps1
```

### Option 3: Manual (if you only want specific pages)
Start the root + whichever sub-apps you need:
```powershell
# Terminal 1 — Root shell (required)
cd d:\acm-website\acm-root && npm run dev

# Terminal 2 — Frontview
cd "d:\acm-website\acm-frontview\Earth Spinning Animation\ACM-Website-main" && npm run dev

# Terminal 3 — Homepage
cd "d:\acm-website\acm homepage\ACM CITY 2" && npm run dev

# Terminal 4 — Events (only needed when entering Events building)
cd "d:\acm-website\acm-events\acm-events" && npm run dev

# Terminal 5 — Editorial
cd "d:\acm-website\editorial page\events-acm" && npm run dev

# Terminal 6 — Research
cd "d:\acm-website\acm-research\acm-research-v3_7_4-mesh-field" && npm run dev

# Terminal 7 — Our Team
cd "d:\acm-website\acm-team" && npm run dev

# Terminal 8 — Connect
cd "d:\acm-website\acm connect us" && npm run dev
```

Then open **http://localhost:3000** in your browser.

## User Flow

1. **Intro** — Globe spins, user scrolls, hyperspace warp plays
2. **"ENTER CITY →"** button appears at end of warp → click to enter the city
3. **City** — Scroll through ACM CITY 2 to explore buildings
4. **Click a building** → zoom-in animation → fade to section page
5. **"← RETURN TO CITY"** button (top-left, always visible) → fade back to city

## Port Assignments

| App | Port |
|-----|------|
| **acm-root** (this shell) | 3001 |
| acm-frontview | 8080 |
| acm homepage / ACM CITY 2 | 5173 |
| acm-events | 5174 |
| editorial page | 5175 |
| acm-research | 5176 |
| acm-team | 5177 |
| acm connect us | 5178 |
