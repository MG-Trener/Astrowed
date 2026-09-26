# Decorative sky events

The shared background now contains eight staggered comet routes: four diagonals, both vertical directions and both horizontal directions. Each route rotates its entire flight plane, keeping the bright head ahead of its tail at any viewport aspect ratio. Colours, delay and period differ by route. The motion is deterministic, without hydration randomness or JavaScript timers.

Two inclined galaxies use a locally generated photographic texture with shader-driven rotation, bounded radial shear and evolving dust. Black texels blend into the sky with screen compositing; the visible edge fades smoothly. There are no rectangular image overlays. Bounded shear prevents the spiral arms winding into rings during long sessions.

`celestial-sky.tsx` lazily loads the dependency-free WebGL renderer in `sky-renderer.ts`. A single requestAnimationFrame loop is capped at 30 draws/second. The longest drawing-buffer edge is capped at 1100 pixels on desktop and 640 on mobile, independently of DPR. Mobile renders four comet routes. No frame-by-frame React updates are used.

All backgrounds remain pointer-events:none and aria-hidden. Pause, hidden-tab and compact-mode state stop the rendering loop and preserve animation time. Reduced motion draws static galaxies. Resize redraws the current moment. On unavailable WebGL or context loss, masked static galaxies remain visible; restoring the context rebuilds GPU resources and resumes from the saved moment. Unmount releases GPU resources, listeners and observers. Print hides the decorative sky.

Validation: TypeScript, existing test suite, Pages production build and asset verification. Browser checks cover shader compilation, progressing animation time, frozen pause time, resumption and mobile layout. `data-sky-time` and `data-sky-motion` on the decorative canvas expose its clock and loop state for inspection.
