# Shreya & Ashwin: wedding website

A static site: `index.html`, `css/style.css`, `js/main.js`, `assets/`. No build step. Upload the folder to any static host (Netlify, Vercel, GitHub Pages).

## Before sharing

1. **Hero to invitation:** when the film finishes, the hero stays pinned while the maroon invitation section slides up over it like the next card on a stack (scalloped top edge matching the footer, soft shadow); the film shrinks back slightly and dims underneath. The section is pulled up one screen height in `main.js` so it overlaps the last screen of the pinned hero.
1. **Invitation video:** done. `assets/invitation.mp4` is a 6 MB web copy of `SA Wedding + Reception Invite.mp4`. The invitation section is a maroon two-column spread: the heading, a short line and the buttons on the left (no dates or venue here, since the hero, evening and find-us sections already give them); an open envelope on the right with two cards sliding out of it: the printed invitation behind (`assets/invitation-card.jpg`, rendered from the PDF; clicking it opens the PDF) and the film card in front, playing silently on a loop while it's on screen (still: `assets/invitation-poster.jpg`). The envelope is drawn in SVG with a checked maroon liner and a 16 Nov postmark; the composition is static, and cards lift slightly on hover. The envelope column is the wider one (about 60%) and the envelope is sized to fit the screen height. A strand of warm fairy lights hangs along the top of the section under the scallops, twinkling slowly (still when reduced motion is on). The maroon has a faint tone-on-tone kolam lattice (`.invite-texture`) that fades out toward the middle, and a warm red glow behind the envelope; no grain, and "Play invitation" opens it full size with sound.
2. **Invitation card:** done. `assets/invitation.pdf` is a copy of `Shreya & Ashwin-Wedding Invitation.pdf`; "View invitation" opens it in a new tab.

## Preview locally

```
python3 -m http.server 5173
```
Then open http://localhost:5173.

## How the motion works

- **Libraries (from the jsDelivr CDN):** Lenis for smooth scrolling, GSAP with ScrollTrigger and DrawSVG for scroll-driven animation. If they fail to load, or a visitor has "reduce motion" turned on, the page falls back to a calm static version: the painting hero, the morning as a normal list, and no loader.
- **Loader:** the lamp lights once the hero painting and fonts have loaded (5 seconds at most).
- **Hero:** your film (`hero video.mp4`) is scrubbed by scroll. It's stored as 124 still frames in `assets/hero-frames/` and drawn on a canvas, which is smoother than seeking a video, especially on iPhones. Frames load coarse-to-fine, and phones load every other frame (about 3.9 MB instead of 7.8 MB). The doorway starts small under your names, fills the screen as the doors open, and the invitation text appears on the mandapam wall at the end. To use a different film, re-export the frames at 1280×720 with the same names.
- **The morning:** each moment sits in a plain round frame: a pastel apricot ring (#F0D5A6) around the illustration, with a thin cream inner line (the Muhurtham gets a heavier one). It used to be a perforated postage stamp. The section's title and intro sit at the top of a locked scene. Below them, large round medallions (one per moment, each holding your own ritual illustration from `assets/moments/step-1.webp` to `step-5.webp` (step 4 is a `.jpg`), converted from your PNGs to 640px images; to swap one, replace that file) travel along the rim of a soft half-circle glow; the current one rises to the top and grows, its words crossfade underneath, and five dots at the bottom show progress. The scene locks with the first moment fully shown and holds it for a short stretch of scrolling before turning; it holds briefly on the last moment before unlocking. When scrolling pauses inside the scene it glides to the next card in the direction you were scrolling (snapping is done through Lenis, since ScrollTrigger’s own snap fights the smooth scroller). The Muhurtham medallion has a gold ring and a "9:00 to 10:00 AM" tag.
- **Sunset:** the sun, moon, birds and stars move with the scroll.
- **Self-drawing lines:** any SVG path with `class="draw"` draws itself when it scrolls into view.
- **Cache busting:** after editing the CSS or JS, bump the `?v=` number on their links in `index.html` so returning visitors get the new files.

## Notes

- **Look:** colours from the hero film (maroon, kumkum red, cream, marigold, banana-leaf green) with clean flat illustrations and no grain. Fonts: Agraham for the section titles (bundled in `assets/fonts/Agraham.otf`, from Hishand Studio; its licence is marked Personal Use), Helvetica for all reading text, Italianno (Google Fonts) for the names.
- Motion respects "reduce motion" system settings.
- `drafts/` holds the style explorations (including the Mix 2 mock-up in `direction-ad.html`). Nothing links to it, so it can be deleted.

- **Footer:** a maroon band with a scalloped top edge: ornament, closing line, names in Italianno, the date, links back to each section, "Back to top" and a credit line. The RSVP form and the blessings game were removed on request; there are no yellow buttons (cream on maroon, maroon on cream).

## Type scale

One set of sizes for the whole site, as CSS variables at the end of `css/style.css` (`--fs-h2` to `--fs-small`). Use these instead of new one-off sizes.

| Role | Variable | Laptop (1440px) | Phone (375px) |
|---|---|---|---|
| Couple's names | Italianno, hero and footer only | about 105px | scales down |
| Section title | `--fs-h2` | 68px | 42px (the morning title is 34px so the pinned scene fits) |
| Card / moment title, footer line | `--fs-h3` | 42px | 30px |
| Section intro | `--fs-lede` | 26px | 21px (19px inside the pinned morning scene) |
| Body text | `--fs-body` | 22px | 19px |
| Buttons | `--fs-btn` | 20px | 20px |
| Labels (spaced capitals) | `--fs-label` | 16px | 15 to 16px |
| Notes and credits | `--fs-small` | 16px | 16px |

The morning stamp shrinks on shorter screens so the title, stamp and words always fit above the progress dots.

## The day, in six moments

The timeline section is titled "One very full, very lovely day" (menu link: "Wedding") and has six stamps: the morning begins, Kashi Yatra, Garlands & Oonjal, the Muhurtham, Saptapadi and Lunch. Lunch used to be its own section; it is now step 6, using your square banana leaf illustration (`assets/moments/step-6.jpg`). After the last stamp the page goes straight into the dusk transition and the reception.

## Sunset clouds

The clouds in the sunset section are cut from your `clouds.png` sheet: `assets/clouds/cloud-a.jpg` (the large one, top left of the sheet), `cloud-b.jpg` (top right) and `cloud-c.jpg` (bottom right). They are blended into the sky bands with `mix-blend-mode: multiply`, so their white paper disappears; small clip shapes hide bits of neighbouring clouds caught in each crop. They drift right as you scroll (each at its own speed, set in `buildDusk` in `main.js`) and sway gently on their own; the sway is off with reduced motion. The sun is your `sun.png`, cropped to `assets/sun.jpg` and clipped to a circle just inside its crayon edge; it still sets behind the lower bands as you scroll. The moon is your `moon.png`, cropped to `assets/moon.jpg`; an SVG filter (`#paper-out`) turns its white paper transparent so it sits on the dark bands. As the maroon bands scroll in, a field of twinkling stars (`.dusk-night`, 22 sparkles and dots kept clear of the bottom edge, each on its own twinkle) fades in; they hold still with reduced motion.

## Reception

The reception text sits inside your floral frame (`assets/reception-frame.jpg`). The navy sky, stars and clouds were removed from the original with a small script (it keeps the frame and flowers and drops the blue sky and stray specks), then the frame was flattened onto the section's maroon (#5A1219) and saved as a JPEG so it stays light (about 175 KB). If the section background colour changes, the frame needs re-exporting onto the new colour. Reception time: 5:30 to 9:30 PM.

## Night-sky variation (current)

The lower sunset bands now run orange, dusky rose (#B8577A), plum (#6E4A8E), indigo (#2E3B84), deep blue (#172E66) and navy (#0A1F4A), the navy taken from the reception frame's sky. The reception section is navy, using `assets/reception-frame-navy.jpg`, and the dark top bar takes the colour of the section under it. The previous maroon version is saved in `drafts/maroon-evening/` (index.html, style.css, main.js, reception-frame.jpg) if you want to go back.

## Menu

There is no top bar. A round hamburger button sits in the top-right corner (maroon over light sections, cream over dark ones; it turns into a cross when open) and opens a small card with Invitation, Wedding, Reception, Moments and Location (the footer uses the same names). It is visible from the first screen, so a guest can jump straight to the address; far jumps land instantly instead of racing through the film. It hides while the timeline is pinned, and closes on a link, a click outside or Escape.

## Reception background

Your night terrace painting (`reception bg.png`, saved as `assets/reception-bg.jpg`) sits along the bottom of the reception section and fades up into the navy; phones use the tall version (`reception bg mobile.png`, saved as `assets/reception-bg-mobile.jpg`). The painting layer is sized to the image itself so the fade lands on its sky. Because the frame now overlaps a picture, it has see-through edges: its colour is `assets/reception-frame-color.jpg` and its shape is a small mask (`assets/reception-frame-mask.png`) embedded in `style.css`, so it works even when the site is opened straight from the folder.

## Find us and footer

Find us shows your illustrated map (`map.png`, saved as `assets/map.jpg`) in a clean rounded card, beside the address and two buttons: Google Maps and Apple Maps. The map picture is itself a link with an "Open in maps" label: on iPhone, iPad and Mac it opens Apple Maps, on Android it offers the installed map apps (Google Maps, Waze and so on), and elsewhere it opens Google Maps. No live map is embedded any more. The old hand-drawn map, the stray sprig and dot are gone.

The footer is maroon (#6C1716 at the top, like the invitation, with a warm glow behind the names and a gentle deepening towards the bottom) with the closing line, a live countdown to the Muhurtham (days, hours, minutes, seconds to 16 November 2026, 9:00 AM India time; it says "Today’s the day" on the day and "Happily married" after), section links and back to top. The divider line above the links is gone.

## Photo gallery

"A few of our favourite moments" sits after the reception and before Find us (menu link: "Moments"). It is a slow, endless carousel of 8 prints drifting sideways, collage style: each photo is a plain polaroid (off-white frame with a deeper bottom edge and a soft shadow) with a bold tilt, a different size (about 80% to 120%, set by `--s` on each print) and clear space between prints; every print keeps the photos' upright 3:4 shape, and each photo is gently zoomed and shifted (per print, `--z`, `--tx`, `--ty`) so the two of you sit in the middle; the photos in the carousel have a subtle retro film look (a little warm and faded, with a soft vignette, no grain), while the full-screen view shows the whole uncropped, untouched photo. It sits on the plain cream page; hovering, focusing or touching pauses it, and tapping a photo opens it full screen with arrows (and the arrow keys) to step through. With reduced motion it stops and becomes a plain sideways-scrolling row. A jamakalam border (128px on laptops, 88px on phones: red, marigold, green, navy and cream stripes; the marigold here is the only yellow in the footer) runs along the very bottom of the footer, like the woven edge of a mat.

The photos were picked from your `gallery photos` folder and saved in `assets/gallery/`: `photo-N.jpg` (720px, for the carousel) and `photo-N-full.jpg` (1400px, only loaded when a photo is opened). The carousel repeats its 8 prints once more so the loop is seamless, so if you swap a photo or add a caption (inside the empty `<figcaption></figcaption>`), change it in both copies in `index.html`. The original `gallery photos` folder is not part of the site.
