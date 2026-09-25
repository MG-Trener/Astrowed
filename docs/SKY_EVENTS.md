# Decorative sky events

The shared background now contains eight staggered comet routes: four diagonals, both vertical directions and both horizontal directions. Each route rotates its entire flight plane, keeping the bright head ahead of its tail at any viewport aspect ratio. Colours, delay and period differ by route. The motion is deterministic, without hydration randomness or JavaScript timers.

Two translucent spiral formations rotate slowly in opposite directions near the screen edges. Their arms, dust points, haze and luminous cores use SVG and CSS rather than downloaded assets. Four small star events brighten softly and release a fading expansion ring; events are separated by long idle periods (41–89 seconds per event).

Mobile displays keep four diagonal routes and two star events, with lower galaxy opacity and simpler haze. All backgrounds remain pointer-events:none and aria-hidden. Existing pause, hidden-tab and compact-mode state suspend the animations; reduced-motion hides comets and bursts and leaves galaxies static. Print hides the decorative sky.

Validation: TypeScript, Pages production build and 41-page asset verification; browser inspection of eight flight rotations, visible reverse flight and galaxy formations, pause state for all event types, and 320×640 rendering without horizontal overflow.
