# IDOLVERSE48: Select Bloom!
*Choose Your Stars. Watch Them Bloom.*

A Japanese idol‑agency management simulation that runs entirely in the browser.
This version is a **complete visual redesign** of the original single‑file game:
new game UI, new 2D anime character art, and illustrated agency environments.
**The gameplay, rules, formulas, data and save format are unchanged.**

## Run it

No build step and no dependencies are needed.

```bash
npm start            # or: node tools/serve.js   → http://localhost:8048
```

You can also open `index.html` directly in a browser. For a one‑file copy (same
format as the original), run:

```bash
npm run build        # → dist/IDOLVERSE48_Select_Bloom.html
```

Previews of the art assets: `tools/art-preview.html` (cast, `?m=expr&i=3` for
expressions, poses and costumes) and `tools/scene-preview.html` (all environments).

## Project structure

| Path | What it is |
|---|---|
| `index.html` | Game shell; loads the files below in the original script order |
| `js/core/game-base.js` | **Original game code, verbatim** (state, new game, save/load, day tick, training, events) |
| `js/core/game-systems.js` | **Original game code, verbatim** (members, teams, auditions, Senbatsu, single/album production, costumes, CD Cover Studio, handshake, Roadshow, charts, finances, all original views) |
| `js/art/characters.js` | Character art engine v4 (modelled on the art reference): portraits, half body, full body, 12 expressions, 16 poses, 7 layered idol costumes, accessories |
| `js/art/costume-parts.js` | Modular costume renderer: independent clothing pieces, 15 patterns, per-piece colours, accessories, 13 presets |
| `js/scenes/environments.js` | New illustrated environments (office, lounge, dressing room, rehearsal room, recording studio, photo studio, concert stage, tour, fan meeting hall, broadcast studio, audition room, management office, backstage) |
| `js/ui/ui.js` | New UI layer: HUD, navigation, title screen, Producer Office, member cards, Training, Fan Community, Charts, Management, 6‑step Single Production |
| `js/ui/costume-designer.js` | Costume Designer screen: per-song designs, uniform/individual member assignment, CD Cover Studio integration |
| `js/i18n/` | Language layer (English / ภาษาไทย): `i18n.js` translates the rendered screen; `th.js` + `th-more.js` hold the Thai text and sentence templates |
| `css/base.css` | Original structural CSS, verbatim |
| `css/theme.css` | New visual identity (pastel pink · lavender · sky blue · champagne · ivory · warm beige) |
| `original/` | Untouched backup of the original single‑file game |
| `tools/` | Dev server, single‑file build, art & scene previews |

The two `js/core` files are byte‑for‑byte copies of the original script. The new
UI layer only re‑implements *presentation* functions (view templates, the member
card, the modal frame) and every control calls the original game functions.

## Characters

* Every idol is drawn from her saved appearance record (`m.ap`: hair style and colour,
  bangs, eyes, brows, mouth, outfit, accessory, skin) plus stable traits derived from
  her **member ID** (face shape, eye size, lashes, highlights, freckles, cowlick…).
  Nothing is random at draw time, so she is identical on every screen.
* Asset registry: `CHAR_ASSETS.portrait / bust / face / half / full / entry(m)` —
  `entry` lists `char/<id>/portrait|half|full|expr/<n>|costume/<n>`.
* The portrait and the full body share the same costume renderer, so outfits match
  everywhere (member list, profile, training, Senbatsu, costumes, cover studio, events).
* Appearance editing (Members → Appearance) and existing saves keep working because
  the record format is unchanged.

## Navigation

Producer Office · Members · Training · Music Production · Events & Concerts ·
Fan Community · Charts & Sales · Audition & Recruitment · Management & Settings.
Costume Selection and the CD Cover Studio stay inside Single Production.

Single Production is organised into six steps (UI only): Single Information →
Song Selection → Senbatsu Selection → Costume Selection → CD Cover Design →
Final Preview & Confirmation, plus an "All steps" overview.

## Saves

Saves use the same `localStorage` key and format as the original
(`idolProducerSave1`); a save made in the original game loads directly.
Management → Save & Load can also export/import the same data as a `.json` file.
Display preferences are stored separately (`iv48ui`) and never touch the save.

## Costume Designer & costume library

Music Production → **Costume Designer** tab (also reachable from each song in Single Production).

* All designs live in one **costume library** (`S.czLib`): create (blank or from 13 presets),
  edit, rename, duplicate, delete. Every piece is drawn on the idol: tops, sleeves, collars,
  outerwear, bottoms, overskirts, extras, shoes, legwear and accessories, each with its own
  pattern (15 types, size, intensity) and colours.
* Songs reference designs (`S.songs[id].cdz`): one main costume per song, reusable across
  songs; uniform mode (with per-member colour tweaks) or individual member designs.
  Editing a design updates every song that wears it.
* **Production rule:** Single Production has no costume selection step any more. Each song
  needs a costume design assigned in the Costume Designer; when the single starts the
  assigned design is used automatically (manufacturing still takes 7 days).
  A design's **concept line** (Cute / Cool / Pure / Elegant / Sporty) feeds the original
  release formula, so the concept-match sales bonus works as before.
* Designs made with the earlier per-song designer are moved into the library automatically.

## Language / ภาษา

Choose **ไทย** or **English** on the title screen (top right) or in Management & Settings → Display.
The choice is a display preference (stored with the UI prefs, not in the save) and can be switched any time.
Names, song titles and CD-cover text typed by the player are never translated.
