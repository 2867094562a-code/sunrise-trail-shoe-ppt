# Sunrise Trail Shoe HTML PPT

Interactive HTML presentation for the "日照金山" trail running shoe concept.

## Live Deck

https://2867094562a-code.github.io/sunrise-trail-shoe-ppt/

## Controls

- `ArrowRight`, `PageDown`, `Space`, `Enter`: next slide
- `ArrowLeft`, `PageUp`, `Backspace`: previous slide
- Mouse wheel: switch slides
- Tap blank space: next slide
- Swipe left/right on touch screen: next/previous slide
- `F`: fullscreen
- `N`: speaker notes
- Product view images: click to zoom
- 3D page: drag to orbit, use `LOW POWER` on weak computers

## Offline Presentation

For stage use, prefer the local version as the primary plan:

1. Download or clone this repository.
2. Run `start-local.bat`.
3. Open `http://127.0.0.1:8765/`.

The GitHub Pages link can be used as a backup or for audience scanning.

## Performance Notes

- The 3D model is preloaded quietly after the deck opens.
- The viewer uses 1024px optimized textures.
- Low power mode reduces pixel ratio, disables autorotation, and throttles rendering.
- The original FBX is about 54MB. A future production pass should convert it to compressed GLB with Draco or Meshopt when a reliable FBX conversion tool is available.

## File Structure

- `index.html`: deck content
- `styles.css`: visual system and responsive layout
- `deck.js`: slide navigation, notes, touch, lightbox
- `shoe-viewer.js`: Three.js 3D model viewer
- `assets/`: images, QR code, model, textures
