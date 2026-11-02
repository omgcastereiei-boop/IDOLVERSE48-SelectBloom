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
| `js/ui/release-planning.js` | Restored step-by-step Single / Album planning page, Senbatsu screen filter, per-member song costumes, random costume & CD cover, release-level Senbatsu history, Group & Team navigation |
| `js/ui/release-events.js` | Senbatsu box in Songs & Tracklist, Auto Select filter, Single Costume & profile costume, event costume rules, Roadshow Senbatsu badges/filter, chronological song history, Title-Track-only Senbatsu history |
| `js/ui/fixes.js` | Roadshow participation tracking & member picker, costume library auto-save, Copy to members, cover costume picker |
| `js/ui/member-extras.js` | Member grid columns, profile outfit after each release, Roadshow planning status (Not Planned / Planned / Participated), audition without probability settings |
| `js/ui/debut.js` | Automatic group debut on the first single release, anniversary calendar events, debut info in Groups, trainees in Handshake Events |
| `js/ui/wellness.js` | Member emotions & wellness: Physical/Mental Health, Mood, Senbatsu reactions and history, lesson costs, recovery activities, mandatory 3-month leave |
| `js/ui/stability.js` | Save safety (IndexedDB mirror, validation & repair, backups, recovery screen, auto-resume) and runtime guards |
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

Producer Office · Members · Group & Team · Training · Music Production · Events & Concerts ·
Fan Community · Charts & Sales · Audition & Recruitment · Management & Settings.
Music Production has three tabs: Single Production (Singles and Albums), Song Library, Costume Designer.

## Single & Album planning (Single Production)

The step-by-step planning page: **1 Release Information · 2 Songs & Tracklist (with each song's Senbatsu) ·
3 Costume Design · 4 CD Cover Design · 5 Budget & Start**, plus an “All steps” overview.

* **Single or Album.** Same workflow and 28-day production. A Single's name is its Title Track title (kept in
  sync). An Album has its own title, one new Main Song, new songs and previously released songs from the Song
  Library (referenced, never copied; their original Senbatsu and costumes are kept), and track types of up to
  10 songs each. Albums use the album prices of the existing economy.
* **Songs:** title, Genre (30) and Concept (30) per song, any combination; add / remove / reorder tracks.
* **Select Senbatsu** opens the Senbatsu screen for that song: members, Center, Front / Middle / Back rows.
  For other songs it shows who is in this release's Title Track Senbatsu and offers the filter
  “Show only members not selected for the Title Track” (optional; members may sing several songs).
* **Costumes per song and per member:** every Senbatsu member gets her own costume built from separate pieces,
  patterns, fabrics and colours; **Randomize Costume** makes a new outfit (only saved when you press Save);
  face and hair never change. Library designs can still be assigned in the Costume Designer.
* **CD covers** can be designed from the start; **Randomize CD Cover** builds a cover from the Title Track
  Senbatsu and release name (asks before replacing a saved cover). A confirmed cover is required by Release Day.
* **Songs & Tracklist** shows each song's Senbatsu name (editable), members, Center and rows; **Select Senbatsu**
  opens the selection screen (3 member columns on phones). Auto Select can use only members not in the Title Track.
* **Single Costume** (Singles): an optional release outfit for members outside the Title Track Senbatsu, designed
  per member; it can be saved to the member's profile (older profile costumes stay in her costume history).
* **Event costumes** follow the released single: Title Track members wear their Title Track costume; others wear
  the Single Costume (else their coupling-song costume, else the default outfit). Roadshow planning shows
  Title Track / Center / Non-Senbatsu badges and a "Show Only Title Track Senbatsu" filter (Full Group unchanged).
* **Senbatsu history** (first-time, consecutive, best streak, returns, first and latest) counts the Title Track only
  (the Album Main Song for albums); coupling songs and reused album songs never count. Profile song history is
  listed oldest first.
* Group & Team is its own navigation category. Thai uses “เพลงรอง” for coupling songs.

**Production (28 days, game calendar):** Week 1 Song Production (costume manufacturing starts,
7 days) · Week 2 Rehearsal · Week 3 Production · Week 4 Final Preparation. Milestones appear in
the calendar. A confirmed cover for every edition / track type is mandatory. On **Release Day** the single is released automatically if
everything is ready; otherwise nothing is released and a notice lists what is missing (fix it
and release, or reschedule).

**Song Library:** every song with Genre, Concept, single, track type and position, Senbatsu,
Center, positions, costume, production and release status. A snapshot is stored on release.

Older saves: Pop → Teen Pop, Rock → Pop Rock, Electro → Electropop, Folk → Folk Pop, Ballad stays
Ballad; Pure → Youth (Cute, Cool, Elegant stay). Skills and Roadshow stamina values are unchanged.

## Saves

* Every autosave goes to localStorage **and** an IndexedDB mirror (larger storage). If localStorage is full the game keeps
  saving to IndexedDB and shows a banner suggesting an export.
* Refreshing resumes the newest valid save automatically. A damaged save shows a recovery screen (restore backup,
  download raw data); the game never starts a new game on its own, and New Game asks before replacing a save.
* A backup of the save is kept before each load-time migration and before New Game / Import / slot loading.
* Save slots are stored in IndexedDB.

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

## Members, profiles & Roadshow planning

* **Grades** (UR / SR / R / N) are shown only in Auditions.
* **Song history** in the profile lists Title Tracks (A-Sides) and Coupling Songs (B-Sides, with their title track),
  oldest first, with month and year.
* **Team costumes** were removed; Group & Team lists and the add-members window can be sorted by any stat.
* **Member grids:** the Members directory, Group & Team lists, team member selection and the CD Cover Studio member list have a
  Columns control (3 / 4 / 5), remembered per screen (UI preferences and the save).
* **Profile outfit:** when a single is officially released, every portrait and full-body picture of a member (member
  cards, lists, profile) shows her Title Track costume (Senbatsu) or the single's Single Costume (Under Girls).
  Costume editors, CD covers and event images keep their own outfits. Earlier outfits stay in her costume history.
* **Roadshow planning:** for the promoted single every member is Not Planned, Planned (booked for an upcoming
  Roadshow, with location and date) or Participated (a Roadshow that took place). Filters: All / Not Planned /
  Planned / Participated, plus "have not participated". Adding a member who is already booked asks first.
  Cancelling a Roadshow clears its planned status. Each released single has its own cycle.
* **Labels:** Senbatsu / Under Girls replace "Selected / Not selected for Title Track" (data unchanged).
* **Auditions** use the default recruitment odds; the Probability Settings screen was removed (an earlier
  custom setting is kept aside in the save).

## Group debut & anniversaries

* There is no manual "Debut group" step. A group's official debut date is the release day of its first single
  (production, announcement or scheduling do not count). Later releases never change it.
* The debut day and every anniversary (1st, 2nd, …) are events in the game calendar; each one is created once.
* Groups shows Official Debut, time since debut (years, months, days) and the next anniversary, or "Not Yet Debuted".
* Older saves get their debut date from the group's earliest released single.
* Trainees of the performing group take part in Handshake Events (all formats) under the same rules; each member's
  handshake participation is listed in her profile. Their status and team do not change.

## Member emotions & wellness

Each member has four separate conditions (shown in her profile under **Wellness & Emotions** and in the Lesson Room):

| Stat | Range | What changes it |
|---|---|---|
| Physical Health | 0–100 (Excellent / Good / Normal / Poor / Critical) | Falls only under overload (sustained heavy workload, exhaustion), injuries or illness; recovers slowly with rest |
| Energy | 0–100 (the existing Stamina) | Lessons: Vocal −15 · Dance −25 · Performance −20 · Variety −10 · Rest +40; +15 per day |
| Mental Health | 0–100 | Long-term; drops only in context (former Center moved back/out, repeated exclusion, Center pressure, sustained stress); recovers slowly |
| Mood | Happy, Excited, Proud, Motivated, Neutral, Nervous, Pressured, Disappointed, Frustrated, Sad, Lonely | Short-term feeling from events; fades back to Neutral after about a week |

Passion, Loyalty and Morale stay separate and recoverable.

**Lesson EXP by Mental Health:** 80+ ×1.10 · 60–79 ×1.00 · 40–59 ×0.95 · 20–39 ×0.85 (chance of a negative mood) · 1–19 ×0.75 and no high-pressure activities (Center positions, events). Dance lessons are unavailable at Critical Physical Health.

**Senbatsu reactions.** When a single is announced, every member of the group reacts to her result: Center, Front/Middle/Back Row or Not Selected, including first Center, first Senbatsu, former Center moved to the back row, comebacks and repeated exclusion. The reaction depends on personality, traits, Passion, Loyalty, popularity, Mental Health and her history (with a little randomness; rarity plays no part). Reactions and dialogue appear in the announcement window. Each member keeps a Senbatsu record: totals, selections and non-selections in a row, previous position, first Senbatsu and first Center.

**Recovery.** Rest (free, once a day), Recovery Day, Medical Checkup (report), Medical Treatment, Mental Recovery, Producer Talk, Team Bonding and Reduced Schedule.

**Mandatory leave.** If Physical or Mental Health reaches 0, the member immediately starts a Medical Leave, a Mental Health Leave, or one combined leave if both are 0. The leave lasts exactly 3 calendar months and cannot be cancelled or shortened with money.
- During leave she is out of lessons, Senbatsu/Center selection, events, concerts, handshakes and roadshows, and is removed from upcoming plans.
- She stays in her group and team with all her data.
- She keeps recovering during the leave and returns automatically on the return date, with a notification.

Older saves load with Physical and Mental Health at 100, a Neutral mood, unchanged Energy, Passion and Loyalty, and a Senbatsu record rebuilt from past releases.

## Language / ภาษา

Choose **ไทย** or **English** on the title screen (top right) or in Management & Settings → Display.
The choice is a display preference (stored with the UI prefs, not in the save) and can be switched any time.
Names, song titles and CD-cover text typed by the player are never translated.
