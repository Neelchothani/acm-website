# Higgsfield prompt sheet (optional asset upgrades)

The page ships with motion everywhere already (the city clip + live-rendered
animation). If the chapter wants freshly generated loops, these prompts match
the exact palette and style of the reference flythrough. Generate as short
seamless loops (5-10s, 1024x576 or 1024x1024), export mp4, keep each under
~2 MB, drop into `public/assets/`.

Global style suffix for every prompt:
"cinematic cyberpunk digital city at night, deep navy sky, neon cyan and
magenta signage, warm amber window light, wet reflective streets, subtle fog,
a ringed planet glowing 'acm' in the sky, smooth slow camera, seamless loop"

1. Hero backdrop (street, RESEARCH building centered):
   "Slow forward dolly down a neon city boulevard, the camera holding on a
   modern glass building signed 'RESEARCH' in glowing cyan neon, other
   department buildings at the edges," + style suffix
2. Area sign loops (one per domain, square):
   - AI/ML: "Close-up of a pulsing neural-network hologram above a rooftop,"
   - Software: "Holographic code brackets materializing over a terminal window,"
   - Cybersecurity: "A glowing shield hologram scanning across a dark facade,"
   - HCI: "A cursor of light tracing gestures across a glass interface wall,"
   - Distributed/Cloud: "Nodes of light linking rooftops across the skyline,"
   each + style suffix
3. Blog card loops (one per post, 1024x576):
   Match the post topic (terminal, face scan, retrieval mesh, RL hill,
   stills-to-motion frames, orbiting agents, audio equalizer, pixel blocks),
   each + style suffix

Then reference them from the matching component or post frontmatter.
