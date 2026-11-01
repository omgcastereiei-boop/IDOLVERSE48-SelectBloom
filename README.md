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
| `js/ui/single-planning.js` | Unified New Single Planning page, 30 Genres / 30 Concepts, Release Day check, production calendar milestones, Song Library |
| `js/ui/fanbase.js` | Fanbase Management: aggregate fan segments, Kami Oshi / Oshi, acquisition, loss, graduation, teams/units, rankings, dashboard, revenue hooks, save slots |
| `js/ui/event-visuals.js` | Event images (Release Day Mini Concert, Roadshow, Handshake Event) and Roadshow ↔ latest released single synchronization |
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
Music Production has four tabs: Single Production, Song Library, Album Production, Costume Designer.

## New Single Planning (Single Production)

Everything is planned on **one page**. The left panel keeps the single visible (title, number,
tracklist with ✔/✗ status, budget, missing items, Start Single); the right side shows one song
at a time (or all songs) with:

* song title and track type (Title Track / Coupling Song), “Make title track”, track order;
* **Genre** (one of 30) and **Concept** (one of 30): every combination is allowed, no sub-genre
  or secondary concept, no compatibility bonus or penalty;
* **Senbatsu**: participation, Senbatsu name, Center, Front / Middle / Back rows, Auto-select,
  copy, and the full formation editor opened *inside* the song section;
* **Costume design**: pick from the library, create a new design for the song, open the
  Costume Designer, and **Confirm costume** (required before Start Single).

Coupling songs can be added (new, or an unassigned song from the Song Library), reordered and
removed (they stay in the library). Editions (Types) and CD covers are on the same page.

**Production (28 days, game calendar):** Week 1 Song Production (costume manufacturing starts,
7 days) · Week 2 Rehearsal · Week 3 Production · Week 4 Final Preparation. Milestones appear in
the calendar. The CD Cover Studio unlocks when the costumes are finished; a confirmed cover for
every edition is mandatory. On **Release Day** the single is released automatically if
everything is ready; otherwise nothing is released and a notice lists what is missing (fix it
and release, or reschedule).

**Song Library:** every song with Genre, Concept, single, track type and position, Senbatsu,
Center, positions, costume, production and release status. A snapshot is stored on release.

Older saves: Pop → Teen Pop, Rock → Pop Rock, Electro → Electropop, Folk → Folk Pop, Ballad stays
Ballad; Pure → Youth (Cute, Cool, Elegant stay). Skills and Roadshow stamina values are unchanged.

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
* **Production rule:** each song needs its own assigned and confirmed costume design (set on the
  New Single Planning page or in the Costume Designer); manufacturing takes 7 days after Start Single.
  The title track's design is never copied to coupling songs automatically.
  Costumes are **purely creative**: they have no score and never change sales, fans, Buzz or
  member stats (the old costume/concept sales bonus was removed in this update).
  Pieces include one-piece dresses, and every piece has a fabric texture (cotton, satin, velvet,
  sequins, denim, tulle, leather, knit) as well as pattern and colours.
* Designs made with the earlier per-song designer are moved into the library automatically.

## Event images & Roadshows

* Release Day Mini Concert, every Roadshow and every Handshake Event get **one** image, drawn
  with the members who actually took part, wearing the title-track Senbatsu costume of that
  single. An image record (members, their looks, costume snapshot, single, place, date) is
  stored on the event and its history records, so it looks the same after save/load.
  Shown in the release popup, Roadshow / Handshake results and each single's promotion history.
  Each image record carries its Event ID (`eid`) and Single ID (`rid`) and is never regenerated.
* Composition: members stand on the stage floor (feet measured per pose, contact shadows,
  front/back rows with the Center in front), facing a large audience with glow sticks and
  uchiwa. Roadshows use an outdoor stage with a landmark for the location (Tokyo tower,
  Osaka castle, Mt. Fuji, torii, temples, skylines…) and the location name on the banner.
* Handshake images show exactly the **Top 5 members by New Fans Gained** (ties: interactions,
  then popularity, then member ID), one booth each with a fan in front. This only affects the
  picture: every participating member is still calculated exactly as before. Older handshake
  images are reduced to their Top 5 automatically on load.
* Roadshows always promote the **latest released single**. A single in production only takes
  over on its Release Day; planning resets cleanly (setlist, members, date) when it does.
  Each location can host one Roadshow per single; growth and history keep accumulating.

## Fanbase Management

Fan Community → **Fanbase** (tabs: Overview · Member Ranking · Kami Oshi & Oshi · Team / Unit · Fan Growth).

* **Aggregate simulation.** Fans are stored as segments in the save (`S.fb.segs`): count, fan type
  (Casual, Dedicated, Oshi Fan, Hardcore, Collector) plus the Overseas and New Generation traits,
  origin, region, loyalty, engagement and spending power (0–100), a support pattern
  (Strong Kami 95/5, Kami-focused 90/10, Balanced 75/25, Multi-Oshi 60/40), **one or no Kami Oshi**,
  and an Oshi distribution (overlapping; never the segment's own Kami Oshi). Segments are created,
  split, merged and moved without changing the number of fans.
* **Group fanbase** is the number of unique fans (Σ segment counts) and is the game's fan count, so
  the HUD and every existing formula use unique fans. Member supporters = Kami Oshi + Oshi fans (unique per member).
* **Acquisition.** Fans gained by releases, concerts, events, handshakes and roadshows arrive through the
  group channel; members' exposure (Center, Senbatsu, front row, skills, personality, performances,
  team songs) brings fans through the member channel. New fans start with modest loyalty.
* **Monthly (on the 1st):** acquisition, loss (by type, loyalty, release activity, failed releases and
  long-term lack of exposure — one missed Senbatsu costs little), fan type evolution, loyalty and engagement
  drift, Kami Oshi changes (uncommon; the old Kami Oshi often stays an Oshi), Oshi changes, team/unit stats,
  rankings and history. Events are processed once (ids in `S.fb.done`); loading never replays them.
* **Graduation** (member action menu → Graduate…): her fans split into those who stay with the group,
  choose a new Kami Oshi, stay attached to her (leave the active fanbase; kept in history) and leave.
* **Revenue:** daily merch & streaming come from engagement, loyalty, spending power and Kami Oshi / Oshi
  support weights; single sales use Dedicated/Hardcore/Oshi share and loyalty; albums Hardcore/Collector
  share, loyalty and spending; concerts and roadshows engagement, popularity and loyalty.
* **Save slots:** Management → Agency & Save has three extra slots; each holds its own game and fanbase.
  Older saves get a fanbase built from their existing fan count without changing anything else.

## Language / ภาษา

Choose **ไทย** or **English** on the title screen (top right) or in Management & Settings → Display.
The choice is a display preference (stored with the UI prefs, not in the save) and can be switched any time.
Names, song titles and CD-cover text typed by the player are never translated.
