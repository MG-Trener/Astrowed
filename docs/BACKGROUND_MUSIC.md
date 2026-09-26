# Background music

Track supplied by the user: `universfield-silent-universe-351473.mp3`.
Original file copied without transcoding to `public/audio/universfield-silent-universe-351473.mp3` (9,232,128 bytes, approximately 4:48). No external audio service is used. The Pages prebuild copies this directory into its public assets; the component includes the configured base path.

The shared shell holds one looping audio element so client-side navigation does not restart playback. It attempts playback on mount at 25% volume, unless the visitor previously switched music off. Browser/device volume restrictions may apply. An autoplay rejection leaves a working, clearly labelled play button; it does not claim playback succeeded. Playback starts from the explicit button gesture when autoplay is blocked. Preference is stored as `astrowed-music-enabled` in localStorage. Storage failures do not disable the controls. Full page reloads restart the track if playback is allowed; ordinary navigation preserves position.

The header button reflects media events, can cancel a pending start, and permits retry after a media error. It has accessible on/off labels, a live status message, a 44px touch target and reduced-motion support. On narrow screens the workspace link moves into the menu to keep the music control visible.

Validation: TypeScript, Pages production build, export route/asset validation; browser checks for blocked autoplay, explicit start, advancing playback time, looping attribute, uninterrupted navigation, pause, persistence of off after reload, and 320×640 layout/menu. Physical phone playback and the acoustic transition at the end of the supplied track were not separately measured.
