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
| `js/ui/election.js` | General Election: configuration, election single, daily sales → voting tokens → fan votes, preliminary/final results, weekend ceremony, Top 3 capes, group photos, reactions, locked next-single lineups, archive |
| `js/ui/theater2.js`, `js/ui/theater3.js` | Theater extensions: Stage lineup, per-member Stage costumes, debut photos, double Centers, costume copy & reuse, Revival Stage, audience & fan acquisition, formation tools |
| `js/ui/groups.js` | Sister groups: company & group context, Concurrent Positions, transfers, member schedule & conflicts, company transactions, group fans, election fatigue, company screens |
| `js/ui/theater4.js` | Theater: song add / edit / remove at any time, Center picker cards, whole-day availability with bench and Trainee replacements, performance rescheduling |
| `js/ui/theater5.js` | Theater: Setlist Center as default Center, MC All Members / Team, Encore MC, performance count, scheduled Formation / Center changes with history |
| `js/ui/theater-fans.js` | Theater random member fan acquisition: songs (position, song size, skills, popularity), MC (Variety), Encore, Performance Quality, Breakthroughs, saturation; Member Fan Report; never Group Fans |
| `js/ui/theater-subs.js` | Theater: substitute formation modes (keep / shift), performance photos (Stage + every Unit song), substitution records, Stage Performance Statistics in Member Profile |
| `js/ui/song-eval.js` | Song creation (Genre, Concept, Lyrics, randomisers, Song Sheet), Concept Compatibility & Senbatsu Ability per song, release reception factors and member fans |
| `js/ui/industry.js` | Japanese music industry (AI artists, careers, releases) and Music Charts (weekly, combined, streaming, year-end; Top 20), OMG4ki story rival |
| `js/ui/picker.js` | Game-style picker for every dropdown (replaces the browser's list; same values and change events) |
| `js/ui/theater-xg.js` | Theater: Revival Stage between groups (songs copied as Theater versions); Trainee Stage automatic final performance |
| `js/ui/rs-planner.js` | Roadshow Tour Planner (multi-location, sources, requirements, ranking, Balanced / Grouped / Random distribution, manual editing) and Roadshow Performance Efficiency |
| `js/ui/handshake-stats.js` | Handshake Events: individual member sessions and unique visitors, event attendees, results table |
| `js/ui/members-ui.js` | Game-wide member profile overlay (tap a face) and the shared sort / filter bar for member lists |
| `js/ui/theater.js` | Theater Management: per-team and Trainee theaters, Stages and numbering, Setlist editor, Units, Centers, formations, costumes with versions, schedules, availability and Trainee replacement, audience, online membership, transitions, reuse, adoption, archive |
| `js/ui/mv.js` | Music Video production: per-song MV choice, style / location / storyline planning, itemised dynamic budget, Week 3 filming, Release Day publication, daily views and Buzz, MV library |
| `js/ui/stability.js` | Save safety (IndexedDB mirror, validation & repair, backups, recovery screen, auto-resume) and runtime guards |
| `js/ui/event-visuals.js` | Event images (Release Day Mini Concert, Roadshow, Handshake Event) and Roadshow ↔ latest released single synchronization |
| `js/i18n/` | Language layer (English / ภาษาไทย): `i18n.js` translates the rendered screen; `th.js` … `th-ct.js` hold the Thai text and sentence templates, `th-ui3.js` (costumes, concepts, genres, lyrics, bookings, Theater, toasts) and `th-voice.js` (everything members say) are loaded last |
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
  With a one-piece dress no bottom piece is worn; the Bottoms previews still show each piece, and choosing one turns the dress into a blouse in the same colours.
* Designs made with the earlier per-song designer are moved into the library automatically.
* **Colour tools** (in every costume editor: Costume Designer, single/coupling costume,
  per-member costumes and Theater costumes): **🎨 Random colours** recolours the same pieces
  with a harmonious scheme, **🌀 Random patterns** rolls new patterns while keeping the colours,
  and **🎯 Colours from main colour** builds a palette around the colour you pick. Changes are
  unsaved until you press Save, so Revert still works.

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

**Recovery — Automatic Member Care (Members › Automatic Member Care).** The only recovery system. Every in-game day each member (every team, Trainees and sister groups) recovers naturally: Energy +30, Mental Health +2, Physical Health +1 (always, ON or OFF, whatever the company's money). With the single company-wide switch ON (default), any stat below 20 at the end of the day is treated automatically: Energy +40 (¥5,000), Mental Health +30 (¥15,000), Physical Health +30 (¥25,000) per member, charged separately from company funds, once per stat per day; a treatment the company cannot afford is skipped and retried the next day (the balance never goes negative). All three stats stay within 0–100. The page shows the settings, totals and the treatment history. Remaining member actions: Medical Checkup (report), Producer Talk, Team Bonding and Reduced Schedule.

**Mandatory leave.** If Physical or Mental Health reaches 0, the member immediately starts a Medical Leave, a Mental Health Leave, or one combined leave if both are 0. The leave lasts exactly 3 calendar months and cannot be cancelled or shortened with money.
- During leave she is out of lessons, Senbatsu/Center selection, events, concerts, handshakes and roadshows, and is removed from upcoming plans.
- She stays in her group and team with all her data.
- She keeps recovering during the leave and returns automatically on the return date, with a notification.

Older saves load with Physical and Mental Health at 100, a Neutral mood, unchanged Energy, Passion and Loyalty, and a Senbatsu record rebuilt from past releases.

## General Election (総選挙)

Open **General Election** in the menu.

1. **Configure the election.**
   - Name, edition and year.
   - Ranking groups: any names and sizes, up to 100 ranked positions in total. Ranges are continuous (e.g. 16 + 16 + 8 = 1st–40th). The first member of each group is its Center.
   - Groups are limited to 32 members each (the largest Senbatsu formation) and 9 in total (one main song plus 8 coupling songs per single).
   - Registered participants: trainees and members on leave may take part. Graduated members cannot.
2. **Make the current single plan the General Election Single** and produce it as usual in Single Production. You choose title, Senbatsu, Center, costumes, CD cover and promotion with the existing tools.
3. **Voting.**
   - Voting opens on the single's release day and lasts exactly 2 calendar months (Jan 1 → Feb 28).
   - Every CD sold is 1 voting token, and 1 token is 1 vote.
   - **Votes come from simulated CD buying, not from fan counts.** The existing aggregate fan segments (`S.fb.segs`) buy CDs. No separate election fanbase is created and no fan record is changed.
     - Each segment has a buying probability from fan type, loyalty, engagement and whether its Kami Oshi is a candidate.
     - It also has CDs per buyer, mainly from spending power and loyalty; Kami Oshi fans buy many more.
     - It has a timing style: early, steady or late buyers.
     - Its motivation comes from member popularity, buzz, trending surges, preliminary reactions, promotion events and weekends.
   - A small, loyal, high-spending Kami Oshi fanbase can out-vote a much larger casual one.
   - **No double counting.** A segment's CDs are generated once and then split: its Kami Oshi first (priority by support pattern), then its other Oshi, with a small share for fans who vote for anyone (by popularity). The ♥ fanbase shown is unique people (Kami Oshi + Oshi fans), never votes.
   - Release-day CDs come from the existing CD sales system and are attributed to the segments that bought them. That real number sets the scale for the daily simulation, so CD pricing and the sales economy are unchanged.
   - Every token belongs to this election and one candidate until fans cast it. Votes cast + held tokens = tokens generated, always.
   - **Exactly two preliminary results:**
     - **01**, the day after release: ranking, vote totals and gaps.
     - **02**, one calendar month after voting opens: ranking and ▲▼ movement only; scores are hidden.
   - **Fan reactions to preliminary results.** Per segment and probabilistic, limited to 0.55×–2.2× and fading over time.
     - Fans of high-ranked members may relax (😌).
     - Fans of members below expectation, falling, or in a close race may rally (🔥).
     - Rising members excite their fans.
     - Reactions change future buying only; they never change votes already cast or the fanbase.
   - The voting screen shows:
     - the election timeline
     - each candidate's ♥ fanbase and Kami Oshi fans
     - estimated buying rate and CDs per buyer
     - activity level and fan mood
     - the preliminary result history
4. **Voting close.** Voting closes automatically and unused tokens expire. Final rankings are locked: unique positions, ties broken by who reached her total first. They stay sealed until the ceremony.
5. **Ceremony.**
   - Book it on a Saturday or Sunday after the close, at a venue of your choice; the venue cost and ticket revenue apply.
   - On the day, the full-screen ceremony runs: opening, host, announcement, every place from last to 1st (REVEAL RANKING / NEXT MEMBER), group Centers, winner, speeches, group photos, closing.
   - SKIP PRESENTATION jumps ahead without changing any result. Progress is saved after every step.
   - **Ceremony costume:** choose the standard outfit, a library design (or a new one from the Costume Designer), any team's Stage costume, or the costume of a released single (each member wears her own costume from that single). The choice is fixed when the ceremony begins.
   - 1st place wears a red royal cape and crown, 2nd a pink cape and 3rd a light blue cape, on top of the ceremony costume.
6. **After the ceremony.**
   - Each member reacts to her result through the existing Mood, Mental Health (including the mandatory leave), Passion and Loyalty systems, based on her previous election and preliminary rank, expectations, personality and history.
   - The ranking groups become the **locked** lineups of the next single: main song = first group, coupling songs = the others, each with its group Center. Other songs use the normal Senbatsu system.
   - Results, reactions, speeches and group photos are kept in the **Election Archive** and in each member's profile.
7. **Six-month cooldown.** A new General Election can be organized only 6 calendar months after the ceremony is completed (not after voting opens or closes). The Election section shows the next eligible date and the time left. The cooldown is saved with the game.

Saves with an election already in voting keep every vote. Their unused tokens get owners in proportion to the votes, and the old preliminary results stay as history. The archive also shows each member's ♥ supporters next to her votes.

## Theater (劇場公演)

Open **Theater** in the menu. Every team and the Trainees of each group run their own theater: their own Stage numbers, schedule, Units, ticket price, online membership and history. The teams of a group share one physical theater (one performance per time slot, 300 seats).

- **Stages & Setlists.**
  - A Setlist holds up to 20 songs from the Song Library, plus an optional Overture and any number of MC breaks (neither counts).
  - Songs can be searched, filtered, picked at random and reordered by drag or ▲▼.
  - Team theaters can create original songs (custom or random title); they become real Song Library records.
  - A Stage gets its number (Team A 1st Stage, 2nd Stage, …) only when it officially debuts.
- **Formation rows.** Theater formations have several rows like singles (standard rows from the same odd/even rule). Each row's size can be adjusted with −/+, and "Standard rows" restores the default.
- **Stage lineup (Senbatsu).** In Units & Performers, choose who performs the Stage: the whole team, the top N by popularity, or member by member (e.g. 16 of a 20-member team). The others are the bench. The lineup at the debut is every performance's default lineup. In Schedule, **✎ Lineup** swaps members for one performance only, using bench members or Trainees. Bench members are also the first automatic replacements when someone is unavailable.
- **Stage costumes, like Single costumes.** Each song's **👗 Dress up** opens a dressing room where every member can wear her own costume.
  - It has the same editor and colour tools as the single, plus 🎲 Randomize Costume, 🎲 Random for every member (same design or each different), library designs, presets and "copy to members without a costume".
  - Songs can reuse costumes with **Same costumes as…** (e.g. M01–M03).
  - Trainee theaters only reuse existing costumes.
  - The Stage costume is the costumes of one song of the Stage, and the General Election ceremony can use it, with each member in her own costume.
  - Performances record every member's exact costume; a replacement wears the costume of the member she replaces.
  - The Costume library card was removed from the Stage editor.
- **Centers.** Any song (setlist, per song or Unit) can have **double Centers**: both are placed in the middle of an even front row. Songs performed by 1–2 members have **no Center**.
- **Unit formations.** Unit songs always have their own dance formation, edited in Centers & Formation (swap positions, rows, ranking preset).
- **Debut photos.** On a Stage's debut day, every song gets a photo of the actual performance: members hold microphones in random poses and wear their own costumes. Open the photos from the notice, the Stage details or the performance summary.
- **Encore (optional).**
  - Each Stage can enable or disable an Encore. Encore songs come from the Song Library and are numbered E01, E02 …, separately from M01…. They are songs of the Stage: a Stage has at most 20 songs, Setlist and Encore together (for example 12 + 3 Encore = 15 songs).
  - They can be added, reordered, replaced and removed, and each is a Whole Team or Unit song using the Stage's own Units.
  - They are always performed after all regular songs, and every performance record keeps them in order.
  - New Stages start with the Encore disabled. A Stage without Encore is complete. Disabling the Encore keeps its songs for later, and after the debut the Encore is fixed like the rest of the Setlist.
- **Units inside a Stage.**
  - Every song is either a **Whole Team** song (all eligible members of the team, or all Trainees) or a **Unit** song.
  - Units are created inside each Stage, as many as you like or none, each with a name, an optional description and hand-picked members. A member can be in several Units or in none.
  - Units never change anyone's team and never carry over to a new Stage.
  - Songs can be reassigned between Units or switched between Whole Team and Unit at any time. Deleting a Unit turns its songs into Whole Team songs.
  - A debuted Stage keeps its Units as debuted, and every performance record stores each song's type, Unit and performers.
  - Older saves are converted automatically. A Stage that was performed by a theater-wide Unit, or songs with hand-picked members, become Stage Units with exactly the same performers.
- **Members, Centers & formations.**
  - MC breaks have their own participants.
  - A Setlist Center with per-song overrides, or individual song Centers.
  - A global or per-song formation (Center, front and back rows, left and right) with click or drag swapping.
  - An optional *Sort by General Election ranking* preset (falls back to popularity).
- **Costumes.**
  - The same Costume Designer and costume library as Single Production; one design can be used for several songs.
  - Every performance records the exact costume version worn, and a version can be pinned for a song.
  - Trainee theaters reuse existing costumes and cannot create new costumes or songs.
- **Schedule.**
  - Fixed weekly, random (1–7 per week) or custom weeks.
  - Always at least 2 weeks ahead; weekdays allow Evening performances only, weekends Afternoon and Evening.
  - Never on release or launch-event days, Handshake Events or the General Election ceremony. Roadshow days are allowed; the Roadshow members sit out.
- **Availability.** Before every performance, members on leave, on a Roadshow, in another performance or out of energy sit out. Trainees can replace them, automatically or chosen by you. They stay Trainees, and team membership never changes.
- **Audience & money.**
  - Ticket sales are capped at 300 and revenue is tickets × your ticket price.
  - Online viewers are unlimited and come from Online Membership packages (name, price, benefits, on/off), billed once a month.
  - Everything is recorded in the ledger.
- **Transitions, reuse & Revival Stage.**
  - A complete Stage is scheduled by choosing the current Stage's final performance and the new Stage's debut performance (later).
  - Performances in between are cancelled; cancelling the transition restores them.
  - Reusing a retired Stage keeps its number.
  - A **Revival Stage** is a new production of any debuted Stage, from this team or another team. It is a separate Stage with its own id, a reference to the original, and a "REVIVAL" tag.
  - Costumes of a Revival Stage follow the original automatically, Unit songs included. Each performer wears her own original costume, otherwise the costume of the original member at the same position. Members who join a Unit or the lineup later get it too; a costume you set yourself is never replaced.
  - **Between groups**: the Main Group can revive a sister group's Stage and a sister group can revive the Main Group's Stage. Songs the reviving group does not have are copied into its Song Library as Theater versions; the other group's songs, Stage and history never change.
- **Trainee Stage final performance.** The members of a Trainee Stage's debut lineup keep performing it even after a promotion; graduated members leave their position empty, with no replacement. When the group has fewer Trainees than the Stage's debut lineup (promotions or graduations, not schedule conflicts), the final performance is scheduled automatically: the last performance of the next 14 days. Later performances are cancelled, and the Stage retires after its final performance. A new or revived Stage restarts the schedule.
    - It copies the Setlist order, the Units and their song assignments, the Encore, and every song's costumes, which stay editable.
    - New performers get the costume of the member who had the same position.
    - It receives the team's next Stage number at its debut. The original Stage, its number and its history never change.
- **Costume copy & reuse.** In the dressing room:
  - **📋 Copy to members…** copies the design in the editor to any member of any song of the Stage, including members who already have a costume (it shows their current costume and asks before replacing). The source is never changed.
  - **📚 Use existing costume** opens the Costume Library and the costumes of other Stage songs, with previews, names, their Stage or song, and how often each is used. Apply one to one member or to the whole song.
  - **✦ New costume** starts from a basic preset.
  - Every assignment is an independent copy, so editing it never changes another song, another Stage or the library design.
  - Saved Stage costumes are added to the Costume Library with their Stage.
  - The Single dressing room has the same picker, and its copy dialog shows each member's current costume.
- **Audience & member fans (random).**
  - The live audience (up to the 300 seats) and the online audience (membership broadcast, only when the theater has members) are tracked separately. Online viewers are other people and count for less (×0.3).
  - **Theater builds each member's own fanbase (member fans) and never adds Group Fans.** Each member has her own pool, the viewers who are not yet her fans, and one viewer can become a fan of several members.
  - **Performance Quality** (Poor · Average · Good · Excellent · Outstanding) is rolled for every show from the performers' Dance, Vocal and Passion, the show's satisfaction and luck. Its fan multipliers are ×0.7 · ×1.0 · ×1.15 · ×1.35 · ×1.6, and Outstanding doubles the Breakthrough chance.
  - **Songs**: for every song she performs, an expected gain is computed:
    `pool × base × (position × song exposure, at most ×2.0) × skill × popularity × fanbase saturation × Stage repetition × quality`.
    - The actual number is then drawn at random, so it can be zero, small, moderate or large.
    - Position, using that song's own formation: Center ×1.50 (every Center; a solo performer counts as Center), Front ×1.25, Middle ×1.00, Back ×0.80.
    - Song exposure: 1 ×1.60 · 2 ×1.40 · 3–4 ×1.30 · 5–7 ×1.15 · 8–12 ×1.05 · 13–16 ×1.00 · 17+ ×0.90.
    - Skill: Dance 30%, Vocal 30%, Passion 25%, Variety 15%, the same for every song. Popularity is a separate, milder factor (×0.85 to ×1.15).
    - Later songs of the same member in one show give less, and a skilled member has a better chance of a favourable night.
  - **MC** has its own calculation for every MC segment, Setlist and Encore alike:
    - It uses Variety (70%) and Passion (30%), Popularity, and a random MC quality for each participant (Quiet · Good · Fun · Memorable; Variety helps). Talk time is shared by the participants.
    - There is no song exposure or formation position, and later MC segments in the same show give less.
    - Only the actual participants (picked members, All Members or Team, with availability) get MC fans, including bench members in an All Members MC.
  - **Breakthroughs** are rare (about one show in seven) and do not depend on popularity. Each gives one extra random gain:
    - 💖 Audience Favorite;
    - 🔦 Unexpected Spotlight (only for members away from the front);
    - 📈 Viral Performance;
    - 💎 Hidden Gem (small fanbases or low popularity).
  - Large fanbases have diminishing returns, small fanbases keep real growth, and the expected total of one show is softly capped. Repeating the same Stage lowers gains gradually (never below about 45%).
  - All values are in `TH_MF` (js/ui/theater-fans.js). In the test runs (16-member Stage with Solo, Duo, Unit, two MCs and an Encore), a show gave about 40–80 member fans in total, around 2–4 per member.
  - In the Aggregate Fanbase System the show counts as exposure for the members (existing fans may choose them as Oshi); it is never turned into new group fans.
  - **Member Fan Report**:
    - It shows Performance Quality, Breakthroughs and the total by source (Songs · MC · Encore · Encore MC · Breakthrough).
    - Every member has a card with her total, source chips and a tag: No new fans · Normal · Higher than usual · Breakthrough. Tap the card to see each song and MC segment.
  - Fans are added once per completed performance; cancelled performances give none.
- **Dance Formation tools.** Under the formation there is a performer list with portrait, team, position, fans, popularity, vocal, dance and variety, using the shared sort and filter bar; tap a face for the profile. Tap a member's name and then a position to swap.
  - **⚡ Auto Arrange** orders the real performers by any stat (Dance by default, highest or lowest first), keeps the chosen Center(s) or lets the best-ranked take the Center positions, and uses the standard rows. Everything can still be adjusted by hand.
- **Song management (any time).** Each Setlist and Encore song has **✎ Edit** and **✕ Remove**, and the Setlist has **✦ Add New Song** (Encore: **✦ New Encore song**). This works while drafting, after the debut and while the Stage is running; only retired Stages are read-only.
  - **Edit** changes the title, Genre and Concept (the same lists as Singles), Whole Team or Unit, and the position.
  - A song also used by a released single or another Stage is never changed: editing it creates a Theater version for this Stage.
  - **Remove** asks first, keeps the song in the Song Library and keeps the Units valid.
  - The Setlist recorded at the debut and every past performance stay as they were.
- **Center picker.** Center and 2nd Center are chosen from member cards: portrait, name, team or Trainee, generation and rarity. A card shows a stat only when the list is sorted by it (e.g. “Dance 74” when sorted by Dance). The cards use the shared sort and filter bar; tap a face for the profile. Only the song's performers can be chosen, and the current Center is marked ★.
- **Default Center.** A song without its own Center uses the Stage Setlist Center whenever she performs that song, and the Center picker opens with her selected.
  - Choosing someone else changes only that song. The Setlist Center changes only if you tick **Also save my choice as the Stage Setlist Center**.
  - If the Setlist Center does not perform the song, or is unavailable for the next performance, the picker says so.
- **MC participants.** Each MC break (Setlist or Encore) has three options; new MC breaks start with **All Members**:
  - **All Members**: every full member of the Team who is available that day.
  - **Team**: everyone performing that show.
  - **Choose members**: only the members you pick.

  Unavailable members never take part, and the performance record keeps who actually did the MC. Song labels now read **Team** instead of "Whole Team".
- **Encore MC.** **+ Encore MC** adds an MC segment to the Encore. It is edited, reordered and removed like Encore songs, and is shown in its place in the Encore and in the Performance History.
- **Current Setlist (Theater overview).** Songs are numbered M01 … and E01 … as in the Setlist editor. Unit songs show every member of the Unit; other songs show their Center(s).
- **Performance count.** Stage details show "Team A 1st Stage — 12 Performances". Every completed round counts (two shows on one day count twice). Cancelled performances do not count, and each performance record keeps its number.
- **Changing lineup, Units, Formation or Center of a running Stage.** Edits of the lineup (who performs), Unit members, Formation or Centers on a running Stage are a draft that performances never use. Members taken out of the lineup are removed from their Units automatically.
  - Choose the first performance that should use them, at least 7 days from today, and press **Save for this performance**. Before that date the previous Formation and Center are used; from it, the new ones. You can also **Discard changes**.
  - The Stage, its name, Setlist, history and performance count stay the same: the next show is number 26, not 1.
  - Stage details list the current Formation and Center, the planned changes (which can be cancelled) and the configuration history. Past performances keep the Formation and Center they were performed with.
- **Member availability on performance days.** Before the first round of a day, every round of that theater on that day is checked against every member's schedule in all groups (MV filming, events, other theaters, reservations, illness and so on).
  - Unavailable lineup members are replaced by available members of the same team who are not in the lineup first, then by Trainees. Trainees stay Trainees.
  - If any round cannot reach the Stage's lineup size, **every round of that day is cancelled**. A cancelled day has no audience, revenue, fans, rewards or operating costs.
  - The reason and the missing members are recorded and shown in Theater › Schedule under **Cancelled performances**, and a notice appears.
- **Move a performance.** **📅 Move** in Theater › Schedule (and on the theater rows of Company › Calendar) moves any scheduled performance, automatic or manual, to another date and slot.
  - The dialog shows the original and new date and time, how many performers are available, the replacements and every problem: a past date, a blocked day, a slot already taken, a Stage transition, or not enough members.
  - An invalid date cannot be confirmed.
  - The performance keeps its id and history; it is moved, not duplicated, and the automatic schedule does not refill the freed slot. Member schedules follow the new date.
- **Substitutes in the formation.** When a member is replaced (bench, Trainee or a manual swap), choose how the substitute enters each song's formation. Set a Stage default in Units & Performers, and change it for one performance in Schedule or ✎ Lineup, which shows the planned formation with SUB and C marks.
  - **📌 Keep original positions**: nobody moves; the substitute takes the absent member's exact position, her Center spot too.
  - **⤴ Shift positions**: the remaining members move up (the next one becomes Center) and the substitutes take the last positions.

  Only that performance changes; the Stage formation stays as it is. Every performer has exactly one position. The record keeps every replacement (main member → actual performer) and the report shows them under **Substitutions**.
- **Performance photos.** Every completed performance has:
  - one Stage photo of everyone who actually performed, in the costume of the first Team song;
  - one photo for every Unit song, with substitutes instead of absent members.

  They are drawn from the performance record, so later formation, member or costume changes never alter them. They appear in the performance report, which opens from the day's results ("📸 Photos & performance report") and from Performance History.
- **Member Profile → Stage Performance Statistics.** This shows total completed Stage performances, the times she performed as a substitute, and a breakdown by Stage. It is counted from the performance records: once per performance (songs, Encore and MC included), substitutes count, absent members and cancelled or scheduled performances do not.
- **History & archive.** Every performance keeps its Setlist, members, replacements, formations, costume versions, audience, money and member effects exactly as performed. The archive lists every Stage with its original Setlist and totals.

## Formations & starting a single

- New and automatic formations alternate odd and even rows so the Center(s) stand exactly in the middle and each row fills the gaps of the row in front. A single Center uses odd–even–odd rows (12 → 3-4-5, 16 → 5-6-5, 20 → 7-6-7, 24 → 7-8-9). Double Centers use even–odd–even rows (14 → 4-5-5, 16 → 4-5-7); only the last row breaks the pattern when the total makes it impossible. Theater formations and the General Election group photos (1st place in the middle) use the same rows. Saved formations are not changed.
- New Single Production songs start with a 16-member Senbatsu (or all eligible members when fewer).
- **Start Single** starts production right away; requirements and funds are still checked.
- A single whose lineups come from the General Election has no second member reaction at its announcement: the members already reacted at the ceremony. Their Senbatsu record is still updated.

## Music Videos

For every song of a new single (Songs & tracklist step), choose **Produce Music Video** or **No Music Video**. Each MV has its own plan:

- **Style** (exactly one): Performance, Story, Cinematic, Conceptual, Location or Special Visual.
- **Filming location**: 14 domestic (studios, school, street, beach, forest, garden, rooftop, amusement park, palace, Kyoto, snowfield, custom set …) or 12 overseas (Seoul, Bangkok, Shanghai, Taipei, Singapore, Hong Kong, Paris, London, Rome, Los Angeles, Hawaii, Bali). Each card shows its rent, travel and hotel costs and the estimated total.
- **Storyline**: optional; a Story MV unlocks extra storylines. Genre and Concept never restrict any choice.
- **Participants**: the song's own Senbatsu (Title Track and coupling songs have their own lineups), wearing the costumes assigned to that song in Costume Designer.

The budget is itemised from these choices: location rental, crew, sets, props and equipment, cast, VFX, travel and accommodation, coordination, post-production and other costs (set-up, equipment and effects follow the chosen style and storyline). The MV cover shows the Senbatsu in random poses against an illustrated backdrop of the location. Overseas shoots add flights, hotels and extra days.

- Confirming pays it once through the ledger, and insufficient funds block confirmation.
- Revising the plan, or changing the Senbatsu size, charges or refunds only the difference.
- Cancelling before production refunds the budget.

Filming happens in Week 3 and the production check in Week 4 of the unchanged 28-day schedule. The MV is published on its song's Release Day. Views are simulated every day: first-day interest from popularity, fans, Buzz, song sales, Senbatsu and Center, budget and choices, then decay, a long tail, and occasional viral or renewed-interest spikes (budget helps but guarantees nothing). Views add Buzz to the participating members. All MVs with their full history are listed under **Music Production › Music Videos** and in the Song Library.

## Member profiles & sorting (game-wide)

- Tapping a member's **face** in any list, selection, assignment or formation screen opens the existing Member Profile in an overlay above the current screen. Tap the rest of the card (name, stats) to select or move her as before.
  - Selections, Unit members, formations and dressing-room work stay exactly as they were when you press ◀ Back.
- Every list of member cards you pick from has the same **sort / filter bar**. Announcements and results that only show faces have none:
  - sort by name, any member stat (fanbase, popularity, vocal, dance, performance, variety, passion, …), rarity, generation, team or trend, in either direction
  - filter by team / Trainee, generation and group (when the company has several groups); sort by group too. Rarity is not used for sorting or filtering
- It only re-orders or hides cards on screen, never the data or any selection. The setting is remembered per screen.

### Handshake Events — handshake statistics

The results screen shows handshake statistics according to the event format:
- **Individual Handshake:** a **member** table. Each member has her own Handshake Sessions (จำนวนครั้ง, every completed handshake including repeat visits) and Unique Visitors (จำนวนคน, each person once per member).
- **Group Handshake:** a **booth** table. Each booth has its sessions and unique visitors; the members of a booth share these numbers, and they are not split between members.
- **Group Hi-Touch** (High-Five Event): no handshake statistics are counted or shown. Its event mechanics and tickets are unchanged.

**Summary.** Total sessions, total unique fan attendees (each person once for the whole event, never the sum of the members' or booths' visitors), the number of members or booths, and the member or booth with the most sessions and the most visitors (highlighted).

**Sorting.** Sort by either column in both directions. In the member table, a name or portrait opens the profile.

**How it is counted.** The event itself (tickets, redemptions, booth results, attendance, costs, new fans) is unchanged. When a handshake event ends, its redeemed tickets are given to a lightweight set of event-level fan identities: exactly the recorded number of attendees, holding exactly the redeemed tickets, so every booth keeps exactly its session count. Fans with several tickets mostly revisit their favourite booth.

**Storage.** The statistics are stored with each event (`res.hsx`) and are never recounted. Events finished before this update get theirs once from their recorded results. Statistics saved by the first version are converted with the same numbers (Group → per booth), and Hi-Touch statistics are removed.

## Sister Groups & Member Transfer (Company)

- **Sister-group members in the Main Group.** Full members and Trainees of a sister group can be chosen for the Main Group's singles (Title Track and Coupling Senbatsu), its General Election and its other activities. They join **handshake events and roadshows** only when they are in the Title Track Senbatsu of that Main Group single. Main Group members still need a Concurrent Position (Kennin) to join a sister group. Schedule conflicts between groups are still checked per member.

Open **Company** in the menu. One company runs several independent idol groups: the first group is the **Main Group**, and more are added with **✦ Create Sister Group** (name, short name, logo symbol, identity colour, formation date, headquarters, description). A new group has no members: hold an audition for it or transfer members in.

- **Independent groups.** Every group has its own roster, teams and captains, Trainees, auditions, Single Production (Senbatsu, costumes, CD covers, MVs), Song Library, albums, charts, calendar, Theater, General Election, debut and anniversaries.
  - The group switcher at the top of every screen chooses the group you manage. The other groups keep working in the background every day, so their productions, releases, elections and events progress in parallel.
  - Technically, the active group's data sits in the usual save fields and the others are stored with each group. Every existing system therefore works unchanged for the active group.
- **One Company Funds account.** All income and expenses go to and from the same balance, once.
  - Every ledger entry also becomes a company transaction (id, group, type, income/expense, amount, date, description).
  - **Finances** shows each group's revenue, expenses and profit plus a filterable transaction list. Company-wide items (merchandise & streaming, salaries) are split between groups by fans or members.
  - Group reports are informational only. History stays with the group that generated it.
- **Independent theaters.** Each team (and each group's Trainees) has its own theater, Stage numbering, Setlists, Units, Encore, schedule and history. Theaters of different groups may perform at the same time.
- **Concurrent Position (兼任 Kennin).** A full member with a Primary Team can join one team of another group.
  - She keeps one member record, fanbase and history, appears in both rosters, and can be chosen for both groups' Senbatsu, Centers, MVs, theater (that team's pool) and elections.
  - Trainees cannot hold one, and only one Concurrent Team is allowed at a time (end or replace it first).
  - Ending it keeps all history. It is refused while she still has confirmed activities with that group.
- **Eligibility.** Every group activity only offers its own members plus members holding a Concurrent Position there. This covers Senbatsu and Centers, MV, theater Stages and Units, the General Election participants and event pickers.
- **Member schedule & conflicts.** Commitments are tracked per member across groups: release days, concerts, handshakes, roadshows and ceremonies (all day), MV filming (Week 3, 10:00–16:00), and theater performances (afternoon 14:00–16:00, evening 18:00–20:00).
  - Activities of **different** groups that need the same member at overlapping times cannot both be confirmed. A conflict screen names the member, activity, group, date and time; nothing is removed or cancelled automatically.
  - On a performance day a busy member is replaced, and the conflict is noted. A concurrent member performs with her Primary Team when two theaters perform at the same time.
  - **Calendar** shows each group's calendar, the whole company, and any member's schedule across groups, with conflicts highlighted.
- **Fans.** The company has one fanbase of unique people. Each group's fanbase is the fans who support its members (or the group); a fan who supports two groups is still one person.
  - Fan-driven results (CD sales, concerts) use the group's own share of fans.
  - Concurrent members add impact to a group in proportion to their participation there; their whole personal fanbase is never added to both groups.
  - New fans are logged with their group and source (**Reports**).
- **Elections.** Each group has its own election records, participants, results and six-month cooldown (counted from its own ceremony).
  - **Election fatigue:** fans who support a group that recently held, or is holding, other elections buy fewer election CDs. It is reduced, but not removed, by loyalty, engagement and spending power, and it fades over time.
  - Fans who do not support the election's group are not affected. Fatigue never changes fan counts or votes already cast.
- **Member Transfer (移籍).** Choose the source group, the member, the destination group, and either **Trainee / Kenkyuusei** or **Full Member** of a chosen team; optionally assign a generation in the new group.
  - The summary lists her current group, team and status, the destination, her Concurrent Position (which ends with the transfer) and any commitments that would become invalid. These must be resolved first (remove her from a Stage lineup or a future activity, or wait for a production or election to finish).
  - Her Member ID, profile, stats, fanbase and every record are kept. Her history shows the transfer, and the previous group keeps its records.
- **Profiles & rosters.** The profile shows her current and primary group, team, status (Full Member, Trainee, Concurrent Member, Transferred, Graduated), concurrent group and team, transfer and Kennin history, and participation by group.
  - **Roster** filters a group by all, full, trainees, concurrent and team; the shared bar adds generation and rarity.
- **Old saves.** The existing group becomes the Main Group and keeps all its data. Other groups start with empty production data (nothing is guessed), all ids are unchanged, and the ledger already present is not re-counted.

## Song creation & Senbatsu evaluation

- **Song creation**: every song is built from three things only:
  - **Genre**;
  - **Concept** (exactly one);
  - **Lyrics**: a Theme (First Love, Friendship, Dreams, …) and a Mood (Happy, Nostalgic, Passionate, …).

  Each part has its own 🎲 Random button, and **🎲 Randomize all** re-rolls everything; you can re-roll as often as you like until production is confirmed. Every Genre / Concept combination is allowed. There is no lyric writing, no BPM or instruments, no staff selection and no production quality.
- **📄 Song sheet** (opens when a new song is added) shows the artwork, Genre, Concept, Lyrics, production status, duration and cost, then **Proceed to Senbatsu Selection**. It never shows Compatibility before a Senbatsu exists.
- **After choosing the Senbatsu**, every song (Title Track and each Coupling) is evaluated on its own. The Senbatsu screen shows the evaluation live, and saving the Senbatsu shows the results page.
  - **Concept Compatibility**: each member's Concept Fit (Cute / Sexy / Cool / Pretty), weighted by the song's Concept, as a percentage, with a per-member list and a high / moderate / low distribution.
  - **Senbatsu Ability**: (Vocal + Dance + Variety + Passion) ÷ 4 per member, averaged, with no Center bonus and no popularity or fans; the four averages are shown too.
- **Effects** (separate calculations; never added as raw percentages):
  - **Song reception**: the release formula uses a Compatibility factor (×0.8 – ×1.4) and the Ability score, replacing the old personality fit and genre skills. Albums use the average of their songs. Chart streaming uses each song's own result.
  - **Member fans**: every Senbatsu member of every new song gets her own random member fans. These depend on the song's sales, her own Compatibility, abilities, popularity and formation position (Coupling songs count less).

## Music Charts (Japan)

- **A living industry.** It has female / male idol groups, female / male soloists, bands and K-pop groups promoting in Japan, with unique names (never "48"), labels, members, genres, fans and release histories.
  - New artists keep debuting; the rate falls when the market is crowded.
  - Careers move through Debut → Rising → Established → Declining → Hiatus / Disbanded, and disbanded artists keep their releases and chart history.
  - Every artist releases Singles and Albums on its own schedule.
- **Charts** (Top 20 only, closed every Sunday):
  - Weekly Singles Sales, Albums Sales and Digital Streaming;
  - Combined Singles (CD + downloads + streams ÷ 150) and Combined Albums (CD + downloads + streams ÷ 1,200);
  - Year-End Singles / Albums.

  Each entry shows rank, last week's rank, movement (NEW / ▲ / ▼ / — / RE-ENTRY), cover, title, artist, sales or streams, peak and weeks on chart. Tap an entry for First Day, Week 1 and Total sales, streams, peaks, weeks at No.1 and weekly history.
- **Your releases** chart with their real sales: week 1 is the release sales, then a small tail that counts for the charts only, not money. Streaming comes from each song's Compatibility, Ability and its MV. **My Releases** shows your best Single / Album, weeks in the Top 20 and weeks at No.1.
- **OMG4ki** is the story rival: Japan's biggest girl group, with huge First Day sales, usually Top 10 and often No.1. It is never guaranteed No.1: a Single that sells more beats it. **Naevis, Tongjae and Sefira** are reserved for Story Mode. There is no news system yet.
- Only the Top 20 of the last 60 weeks is kept as full tables. Peaks, weeks on chart, rank history, totals and year-end points are kept for every release.

## Roadshow Tour Planner & Performance Efficiency

- **🗺 Roadshow Tour Planner** (button on the Roadshow screen) plans several locations at once. Each location has its own date and number of members, and the total number of assignments is shown.
  - Every location is booked like a normal 2-day Roadshow: the same costs, random setlists, 7 days' notice, one Roadshow per location per single and conflict rules.
- **Members**:
  - **Sources**: selected pool, Senbatsu (Title Track), Senbatsu first then Under Girls, or all eligible members.
  - **Eligibility**: available members only, or include members with plans; optionally include members who already did a Roadshow for this single.
  - **Required assignments**: Exactly or At least N for chosen members. They are placed first, and unmet requirements are explained.
- **Ranking and distribution**:
  - **Ranking**: fully random, Popularity, Ability (Vocal, Dance, Variety, Passion) or any stat (with a little randomness).
  - **Distribution**: Balanced (round-robin: #1 to the first location, #2 to the second …), Grouped (fill one location first) or Fully random. Locations go in listed or random order.
- **Preview and confirm**:
  - Randomize / Random Again keep every setting; 🎲 on one location re-rolls only that location.
  - Members can always be added, removed, replaced or moved by hand, and the counts, dates and locations changed; manual edits are never re-randomised.
  - The preview shows assignments, repeats (×2), unfilled slots, conflicts (existing plans, overlapping locations) and requirement status, plus each location's skill and Energy / Physical / Mental averages and an estimate.
  - Confirm books every location once (no duplicates).
- **Performance Efficiency** is calculated when each Roadshow day happens, for each location separately:
  - **Stage** = Vocal 35%, Dance 35%, Passion 30%. **MC** = Variety 65%, Passion 35%.
  - **Readiness** = Energy 40%, Physical Health 30%, Mental Health 30%. Values below 60 give a chance of a penalty: the lower the value, the more likely and the stronger, but never a guaranteed bad show.
  - **Overall** = 80% Stage / MC (weighted by the day's songs and MC) + 20% Readiness. Popularity, fans, rarity and Center do not count.
  - Each member's efficiency is blended into her existing performance quality, which already drives that day's fans, audience impression, attendance and regional growth. No fixed fan rewards; costs and income formulas unchanged.
  - The results show **ROADSHOW PERFORMANCE** (Overall, Stage, MC, Readiness) per day and in total, with each member's contribution and penalties.

## Language / ภาษา

Choose **ไทย** or **English** on the title screen (top right) or in Management & Settings → Display.
The choice is a display preference (stored with the UI prefs, not in the save) and can be switched any time.
Names, song titles and CD-cover text typed by the player are never translated.

## Team Structure: Team Restructuring & Shuffle Team

Group & Team now has two separate features (`js/ui/org.js`, `js/ui/org2.js`):

- **Team Restructuring**: specific changes such as promotion, demotion, team transfer, group transfer, Concurrent Member (start / end), and Captain / Vice-Captain (appoint, replace, remove). Several changes can be added; a Change Summary lets you edit or remove each one and shows conflicts before you confirm.
- **Shuffle Team**: a board for one group with Move here, Clear Team, Clear All Teams (draft only), Captains, promote / demote, group transfer and Concurrent. Every move is tracked as old → new.
- Draft → Confirmed → Scheduled → Announced. Confirming does not change anything. The announcement is either on a custom date or at an existing event (Handshake, Roadshow, Theater, Debut, Launch); the event decides the date. On that day the changes take effect, with an official announcement (event announcements show the members at the event), member reactions and fan response.
- **Theater transition** per affected team: the old lineup performs the current Stage until its final performance (at least 14 days after the announcement).
  - **Option A**: continue the current Setlist. Formation, Centers and Units must be edited; songs, order and costumes are kept. The first new-team show can come straight after the final. The performance count continues.
  - **Option B**: a new Setlist Stage, which debuts at least 14 days ahead and after the final. Its count starts at 0.
  - Shows in between are suspended.
- Separate **Team Restructuring History** and **Shuffle Team History**, with before / after structures, every change, the announcement, reactions and theater transitions.
- **Online Theater Membership** is company-wide: every group and team shows the same numbers.

## Monthly Sales Chart, editions & sales methods, YouTube fans (`js/ui/sales.js`)

- **One official chart: the Monthly Sales Chart.** It ranks singles by physical CD sales in a calendar month (Top 20, all editions combined), with previous rank and NEW. Weekly, streaming and combined charts are no longer shown. A pop-up announces each completed month once; past months stay in the chart history.
- **Editions:** every Type has a Regular Edition and an optional Limited Edition with its own CD cover, designed in the CD Cover Studio.
- **Sales method per edition:**
  - **Limited Quantity:** a stock cap; demand follows the existing sales curve.
  - **Pre-order:** opening and closing dates, at most 90 days; the result pop-up appears at close.
- **Daily sales:** revenue, fans, CD units and Handshake tickets follow the real daily sales.
- **Production lock:** while a group has an open or upcoming pre-order it cannot start another single or album production. Other groups are not affected.
- **Handshake:** a pre-order longer than one month moves the existing Handshake / Hi-Touch event to a Saturday–Sunday after the latest closing date, chosen by the player.
- **General Election singles** keep their own voting-period sales.
- **YouTube MV views** bring new group fans at a balanced, diminishing rate. About 35% of them also become fans of the members in the MV, weighted by position (Center > front > middle > back) and popularity.

## Contracts, Graduation, Dismissal & Birthdays (`js/ui/contract.js`, `js/ui/spstage.js`)
- **Contracts**: set at the audition (Fixed-term N years from joining, or Age-based until age N). Existing members get a 5-year contract from their joining date. 3 months before the end the member and the Producer talk (she wants to renew / graduate / is undecided); the Producer proposes a duration and she accepts or refuses. There is no limit on renewals, and every contract and renewal is kept in the contract history. If nothing is decided, graduation is announced automatically 60 days before the end.
- **Status**: Active, Graduation Announced, Contract Expiring, Contract Renewal, Graduated, Agency Retained, Dismissed.
- **Graduation**: started by a member request, a Producer proposal (she must agree) or contract expiry. It is announced to fans; she stays active up to ~90 days and graduates at her mandatory **Graduation Stage**. Early graduation: A) contract termination fee (by remaining months, booked in Finances), or B) Agency Retained until the contract end (no entertainment work).
- **Graduation Song / Graduation Single**: tag songs where she is the Center, and the single itself. The release must come before her graduation date; both are shown in the Discography and her history.
- **Graduation Stage / Birthday Stage**: a scheduled Theater performance of her team. The Setlist is unchanged, plus 1–3 released songs at the end of the Encore, each with its own Center, rows, unit name and participants. Special stages don't add to the Stage's performance count.
  - The Graduation Costume is made in the Costume Studio and becomes her final profile image.
  - Birthday Stage costumes come from the Costume Library only. Its history is kept on the member.
- **Dismissal**: reason, Immediate or with a Graduation Stage. Unjustified dismissals pay compensation (Finance History), lose fans and lower single sales for a while (boycott); Company Rules violations, Repeated Misconduct and Contract Violations cost no compensation.
- **Careers** are announced one month after leaving. Former members can be signed as **Solo Idols** or a **New Idol Group** (Members › Solo & New Groups), with their own singles, MV views, covers, fans and sales — no teams, theater or elections.
- **Birthdays**: every member has a birthday (editable in the profile). Age goes up by one on the birthday, with a notice 7 days ahead. Birthdays have no stat effects.
- **Birthday Stage scheduling**: any scheduled performance of her team's active Stage within 30 days before or after her birthday. **Auto-Schedule Birthday Stage** (Birthdays page, or per member in the profile) picks the closest performance; ties go to the earlier day, then the Afternoon show. It adds 1–3 random released songs after the Encore, with the birthday member as Center, rows by popularity, and her existing Stage unit when there is one. Everything stays editable. No performance is ever created; if none fits, you are notified.
- **Auto-Schedule Graduation Stage** (Contracts & Graduation page, or 🎲 per member) proposes the team performance closest to (and not after) the contract end or her last day. Farewell songs come first, starting with her Graduation Songs. You confirm the date and can edit everything. She graduates the **day after** her Graduation Stage.
- **Graduation costumes**: a Graduation category in the Costume Studio (flowers, lace trim, pearls, graduation sash, academic gown, layered train, corsage, bouquet). It also adds floor-length gowns, formal and lace sleeves and collars, floral hair accessories, a graduation cap, and 7 graduation dress styles. Random costume generators never use these pieces.
- **Honorary Graduates**: members who graduate at the end of their contract (contract expiry; not early, not dismissed). They get an academic gown (cap, robe and sash in the group colour) as their profile image, and their Graduation Costume is kept. Instead of a team-show stage they can have a standalone **Honorary Graduation Stage**:
  - its own Setlist and Encore, Centers, rows and units;
  - members from any team or sister group;
  - existing songs and Costume Library costumes only;
  - a random Setlist or random members if you want them;
  - conflict checks against schedules and Theater shows;
  - a full record in her profile.
  It never changes any team's Stage performance count. The Former Members page groups Honorary Graduates, Graduated, Agency Retained and Dismissed members.
- **Trainee Stage & promotions**: promoted Trainees no longer perform in the Trainee Stage. A restructuring that changes the Trainee roster gives the Trainee theater a transition, where the old lineup performs until the final performance. If no Trainees are left, or fewer than the Stage's main lineup, that performance automatically becomes the final performance of the Setlist Stage. It is the first performance 14+ days after the announcement, and you can change it.
- **Units**: only members of the Stage's main lineup can join or perform Unit songs.
- **Birthday Stage**: Trainees with a Trainee Stage can have one. A member must have been in the group for at least 3 months. Birthday photos (group and solo) show her holding a cake on the stage, in the costume of the last song of the Birthday special show.
- **Senbatsu filter**: "Only members not yet in any other song of this single".

## Long-game performance (`js/ui/saveopt.js`)
- Startup parses the save once: the newer of the localStorage and IndexedDB copies is picked by its timestamp without parsing. The title screen and Continue reuse that result, and the backup copy is written from the raw text.
- Saves over 512 KB are written to IndexedDB only. The synchronous localStorage write is skipped, and the old localStorage copy is freed.
- Old Theater performance records are archived (the newest 60 per theater keep every detail). Finished or cancelled schedule slots older than 120 days are removed. This runs on load and monthly, and cuts saves by about a third after 2 years of play.

## Member decisions, obligations & graduation details (`js/ui/grad3.js`)
- **Motivations**: each member has her own dream (acting, solo, modeling, variety or study), family pull and dream strength. Every month her situation is evaluated from real data:
  - health and workload (wellness, Theater load, energy);
  - being overlooked (missed Title Track Senbatsu, never Center);
  - outside agency offers;
  - a sense of completion (years in the group, achievements);
  - family and age, morale, Loyalty and stay agreements.

  The strongest factor becomes her reason. Occasional hints reflect it, and hints never trigger graduation by themselves.
- **Loyalty** (separate from Passion and health) changes monthly from rest, workload, Senbatsu, group success and kept or broken promises.
- **Graduation request**: a private talk showing her reason, feelings, plans and preferred timing. You can accept, **Persuade to Stay**, or **Talk Further**.
  - The persuasion approach depends on her reason, and success uses some Loyalty.
  - There is a maximum of 3 successful persuasions per member, ever.
  - The estimated extension depends on Loyalty (1 month up to 10–12 months). It never renews the contract, and she may ask again at any time.
  - A request left unanswered is announced 30 days after the last talk.
- **Timeline**: the Graduation Stage comes at least ~90 days after the announcement, and after every obligation confirmed before it:
  - scheduled events she is in;
  - singles in production that include her;
  - a confirmed General Election, until its election single's Handshake Event.

  The stage is arranged within 30 days after that, and her graduation date is the Graduation Stage date. A General Election confirmed after her announcement does not include her.
- **Graduation Stage**: a team Theater performance with its own editable Setlist (released songs and Theater songs, Encore, Centers, rows, units, members and costumes).
  - It is generated from her career, starting with her first Center song, first Senbatsu song, Theater units and first Stage, spread across her career periods.
  - Her complete song history (Singles & Albums / Theater, with status and position) is shown while editing.
- **Final Message** (unique and immutable) and **Title Badges** are calculated from her real records and shown in the Graduated profile. They are cosmetic only.
- **Dismissal grounds** (sufficient / insufficient) decide compensation and fan reaction.

## Member Relationship System (`js/ui/rel.js`)
- Every member pair has directional **Bond** (0–100, levels from Barely Acquainted to Deeply Connected). It also has **Attitude** (several feelings at once, marked observed, inferred or private) and **Relationship Dynamics** (several labels can apply together).
- It is fed only by what members actually live through: Theater performances and Units, songs in the same single, Center competition, election ranks, team membership, birthdays, comfort in hard times and senpai lessons.
  - Counters are collected as these happen, and the evaluation runs weekly.
  - Personality (`m.pers`, traits and a per-member profile `m.rp`) and a per-pair compatibility shape the probabilities.
- Events cover friendship, senior–junior, rivalry, conflict (with a mediator or an apology, or no resolution at all) and romance.
  - Romance is adults only (18+), rare and non-explicit. It stays private until it is shown.
  - Dialogue varies and is not repeated for the same pair.
- Milestones, history (kept after transfer, graduation and dismissal), automatic **Social Circles** and a **Relationship News** feed are included. There are no popups.
- **Members › Relationships**: overview, member list (sort and filter) and a pair detail with Bond in both directions. Profiles show the closest relationships.
- The Producer can only observe; there are no controls. Effects are moderate and use existing systems only: conflict stress, comfort relief, rivalry → Passion, and friends' reactions to graduations.

## Fanbase, Oshi & fan economy (`js/ui/faneco.js`, extends `js/ui/fanbase.js`)
- **One fan identity**: the existing cohorts in `S.fb.segs`. Nothing is duplicated; the extra data is stored on the same segments.
- **Six categories**: Casual, Regular, Dedicated, Hardcore, Dormant, Former. Fans move between them every month (active ↔ dormant → former); former fans are kept as history and not counted in the fanbase.
- **Attributes** per segment: group interest, loyalty, activity, spending power, willingness to spend, purchase frequency, event tendency, social engagement, preferred activity, and a shared monthly **budget**.
- **Oshi**: one Kami Oshi per group (`k`, plus `k2` for other groups) and any number of Oshi. **Affinity** is tracked per member per segment. Unique supporters are never double-counted.
- **Member fan categories** are separate from the group category, calculated from affinity, and split into Kami Oshi and Other Oshi. Each member has her own Dormant and Former pools. Monthly snapshots are kept.
- **Economy**: CD sales, merchandise, Theater tickets, election tokens and other ticket income are charged to fan budgets (`fxPay`), and logged per kind, fan category, member and group. Revenue is still booked once by the existing systems.
  - Remaining budget feeds back into CD, merchandise and election demand.
  - Election tokens are bought per segment and given to Kami Oshi first, then Oshi (existing election rules unchanged).
  - Handshake tickets come with CDs, so they are not charged again.
- **Fanbase** page (replaces the old Fan Club title page): Overview, Oshi Ranking (sort by any category, filter by group, team, current or graduated), Fan Spending, Fan Activity (tickets vs unique vs repeat), Regional, Kami Oshi & Teams. Member profiles have a Fanbase section; graduated profiles keep their fan history.
- No Fan Club, membership or subscription features.

## Music libraries, fan tastes & Song Preference (`js/ui/music-lib.js`, `js/ui/music2.js`)
- **Libraries**: 120 Genres, 120 Concepts and 114 Lyrics themes, each with a family and a short description. They extend the existing `GENRES`, `CONCEPTS` and `LY_THEMES` tables, so every older song keeps its values. A song has one Genre, one Concept and one Lyrics theme. **Lyrics have no Mood**; the old `lyM` field is removed.
- **Picker**: every Genre, Concept or Lyrics select opens a searchable library with family filters and a description under each option. The chosen option's description stays visible under the select. Theater song forms have the same three fields.
- **Fan tastes**: each fan cohort stores a value per Genre, Concept and Lyrics family plus a few favourite options (`segment.mt`). New fans get their own profile. Tastes drift a little every month from the songs the group released or performed, the fan's engagement and her Kami Oshi. There is no market trend system.
- **Song Preference** (0–100, separate from popularity and sales):
  - Genre 20%, Concept 15% and Lyrics 15% come from the fans, weighted by interest, with each fan counted once.
  - Member Popularity 20%, members' existing Concept Fit 15% and Performance Ability 15% (Vocal vs Dance by Genre) come from the performers.
  - Positions are weighted: Center, then Front, Middle, Back.
- **Stored once**: singles and albums are scored on release (`song.pref`, `single.prefs`) and shown on the release results and single details. Theater songs are scored at their first performance (`stage.prefs`), with Unit songs using only the Unit, and shown in the performance summary. Later changes never alter stored results.

## Day-advance speed (`js/ui/perf3.js` and changes in `fanbase.js` / `faneco.js`)
- During one Theater performance the Stage lineup (`thBase`) and team pool (`thPool`) are computed once instead of hundreds of times.
- Fan purchases are queued and settled together once a week, at month end (before budgets reset), before saving and before fan statistics are read. Fan affinity changes from exposure are applied once a day in one pass.
- Daily merch & streaming revenue reuses fan statistics for up to 7 days. Team and unit supporter totals are only computed when a screen or the monthly snapshot needs them.
- Member lookups in the monthly fan simulation use a map instead of searching the roster each time. The full fan cohort clean-up runs only when the active roster changes.
- Measured with 4 teams and 4 Stages after about 300 days: a normal 7-day advance went from about 1.3–1.6 s to about 0.3 s, and a week that crosses a month from about 2.4 s to about 1.0 s (desktop Chrome).

## Theater operations & disbanding (`js/ui/theater-ops.js`)
- **Revival Stage**:
  - Only an Original Stage can be revived. Revival Stages are left out of the Revival list, and reviving one is refused with a pointer to its original.
  - A Revival Stage shows where it came from ("Revival of Team A 2nd Stage “…”") in Stage Management, the Stage page and the archive.
  - Stages of a disbanded team stay revivable.
- **Trainee Theater without Trainees**: when the group has no Trainees left (all promoted or graduated), the Trainee Stage ends at once.
  - Scheduled performances are cancelled and the Stage retires.
  - No new performance is scheduled and a debut cannot be confirmed until there are Trainees again.
  - A restructuring transition with a frozen lineup still runs its own final performance.
- **Final performance & pause**: Stage Management › *Final performance & pause* picks one scheduled performance as the active Stage's last.
  - Later performances are cancelled.
  - After the final performance the Stage retires and the theater is **paused**: no performances and no automatic scheduling.
  - A new, revived or reused Stage ends the pause, and the history is kept in `T.pauseH`.
  - The plan can be cancelled before the date, which restores the cancelled performances.
- **Online membership** (company-wide):
  - No subscribers until a theater has given a performance. Existing saves are corrected on load.
  - A theater that stopped performing in the last 180 days (paused or disbanded) adds extra monthly cancellations in proportion to its share of theaters.
  - With no theater performing, subscribers drop by about 25–38% a month and nobody new subscribes.
- **Disband Team** (Groups › team › *Disband team*): members become **Regular Members** (`m.reg`): full members with no team.
  - They are shown in their own section and filter (`@reg`) and are labelled "Regular Member" everywhere.
  - They can join a team later or be demoted.
  - Team leadership and Concurrent Positions in that team end.
  - The team's theater stops, and its Stages stay in the archive.
- **Disband Group** (sister groups only; the Main Group cannot be disbanded): a dialog lets the player choose, for every member, one of:
  - graduate;
  - move to another group as a Trainee;
  - move to another group as a Regular Member;
  - move straight into one of another group's teams.

  After disbanding:
  - The group is marked `g.dis` and its teams, theaters and leadership end.
  - It disappears from the group switcher and the Groups page, and stays listed as *Disbanded* in the company history.

## Concert System (`js/ui/concert.js`, `js/ui/concert2.js`, `js/ui/concert-ui.js`)
Events & Concerts › **Concerts**. One record per concert in `S.cc.list` (statuses: Planning, Confirmed, Ticket Sales, Ongoing, Completed, Cancelled). Both parts of the system use the same records.

### Types and participants
- **Types**:
  - **Regular Concert**.
  - **Anniversary Concert**: group, sister group, team or generation. The date comes from the stored debut/founding date, the team founding date (`t.founded`, recorded for new teams, otherwise the first member's join date) or the generation's join date.
  - **Graduation Concert**: individual or joint. Only members whose graduation is announced can be chosen, and they must be participants. The concert never graduates anyone.
- **Participants**: any members of any groups. The picker has search, filters (group, team, generation) and sorts (popularity, fans, Vocal, Dance, Energy).
- Schedule conflicts come from `gsCommits`. Confirmed concerts are added to it, so the theater and other groups see the members as busy on performance days.

### Venues
- **Real Japanese venues** (`CC_V`):
  - the Zepp halls (published reference price ranges, tax excluded; 10% tax is added when charged);
  - Tokyo International Forum Hall A (official time-slot prices);
  - GMO ARENA saitama, arena and stadium configurations (official prices);
  - Tokyo Dome and the expansion venues (NHK Hall, TIF Hall C, Tokyo Garden Theater, Nippon Budokan, Yokohama Arena, K-Arena Yokohama, Osaka-jo Hall, Nippon Gaishi Hall, Nissan Stadium, Kyocera Dome Osaka, Vantelin Dome Nagoya, Mizuho PayPay Dome Fukuoka).
- Every price is labelled **Official**, **Published reference** or **Estimated game price**. Tokyo Dome and the expansion venues use estimated game prices.
- Holidays: fixed-date Japanese national holidays only.
- Any venue can be chosen. The recommendation (expected audience, fit, previous attendance) and the risk warnings never block a choice.

### Schedule and preparation
- At most 3 consecutive days and 5 performances (afternoon / evening), all at one venue.
- Preparation days are automatic. They depend on the venue category, members and length. They are not rehearsal and use no Energy.
- Rental is charged per actual rental day: performance days at the performance rate, preparation and hold days at the setup rate. It is never charged per performance.

### Setlists, formations, MC and costumes
- **Setlists**: per performance, reusable (several performances can share one), copyable, and savable to a setlist library (`S.cc.lib`). Songs come from the existing song libraries of every group.
- **Formations**: each song is a copy of its original formation. Original members who are not participants, or who have graduated, leave their position empty, and the original center stays empty if she does not take part. Nobody is replaced automatically, and the original song is never written to. The player can add, remove and move members, change centers and rows, and add or remove positions.
- **MC**: all participants or chosen speakers. MC never counts as a song.
- **Costumes** per song: the original song costume, the previous song's costume, one design for everyone, or one design per member (with copy to all). New designs (random, or made in the Costume Designer) go to the shared Costume Library.

### Expenses
- Calculated automatically. There is no production budget or quality to choose.
- Categories: Venue Rental, Stage Production, Operational, Transportation, Accommodation, Marketing, Miscellaneous, plus Streaming and Ticketing fees.
- House equipment included in the Zepp rentals is not charged twice.

### Tickets and sales
- **Ticket types** per venue configuration: General Admission, Reserved, Premium, VIP. Online General and Online Premium have no seats.
- Physical quantities can never exceed the capacity. Each performance has its own prices and quantities.
- Recommended prices follow the venue, its prestige, the concert type, the seat category, popularity, history, the number of performances, the location and fan spending.
- **Demand** is simulated per fan segment of the existing fanbase:
  - each fan is counted once, even if she supports several participants;
  - the price response depends on fan category, spending power and willingness;
  - Kami Oshi and Oshi of participants, group interest, the general idol audience and online viewers all contribute.
- The forecast shows the expected result. The sale draws its own random result and sells along a curve between the opening and closing dates.

### Performances, fans and money
- **Performance**:
  - 20 Energy per performing member per performance. A member below 20 sits out: no deduction and no replacement.
  - Efficiency comes from Vocal, Dance, Passion, Energy, Physical and Mental Health, song intensity, member–song compatibility, fatigue and coordination, with random mistakes.
- **Fan response**:
  - Song, member, position, performance, physical and online satisfaction are calculated per fan segment, using the existing music tastes (`muVal`).
  - Results are kept per fan category and per member fandom. Negative reactions are listed even when the overall score is good.
  - Fan trust per group (`S.cc.trust`) moves with satisfaction and ticket prices.
  - Repeated poor treatment of a popular member (few songs, back row) builds frustration over several concerts (`S.cc.mt`).
- **Fan growth**, using the existing segments only:
  - casual → regular;
  - new Oshi;
  - new Kami Oshi, and Kami Oshi changes under the existing rule;
  - fans lost;
  - new fans through `fbAcquire`;
  - member recognition, which updates popularity.
- **Money**:
  - venue rental is paid at confirmation;
  - ticket revenue is booked per performance;
  - the other expenses are booked once when the concert ends, which also creates the combined financial report.
  - Cancellation refunds 50% of the rental if preparation starts in 30 days or more.
- **History**: completed and cancelled concerts stay in the history with member name snapshots, setlists, formations, ticket results, reports and finances. This survives graduation, transfers and team changes.

## Small updates (`js/ui/ux6.js`)
- **Position numbers** run centre-out: #1 is the center, then the positions beside it alternate left and right moving outward (front row of 5: `#4 #2 #1 #3 #5`). Twin centers are #1 and #2. Later rows continue the same way. Existing saves are renumbered once on load (`fmRenum`).
- **Dress-up**:
  - Members are listed in position order (center first) for Single Production and the Theater.
  - The default model pose is *Standing confidently* (straight).
- **Copy costume to members**: several members can be ticked in a row. The page no longer redraws or jumps after each tap.
- **Costume colours**:
  - *Secondary colour* + *🎯 Main + secondary* builds a palette from two chosen colours.
  - *🔁 Replace a colour in every piece*: tap a colour used by the costume, choose the new one, and every piece that uses it changes.
- **Theater song forms** (new song / edit): 🎲 random Genre, Concept, Lyrics or all. Single Production already had this.
- **Saves**: large saves (IndexedDB only) also get a synchronous emergency copy in localStorage when the page is closed or refreshed. The newer copy wins at load, so a refresh right after a save no longer loads an older game.

## Concert performance pictures (`js/ui/concert-art.js`)
Every performance report, and the pop-up after a performance, has **📸 Performance pictures**, with one picture per song. ◀ ▶ and the M1…Mn buttons switch songs, and only one picture is drawn at a time to keep phones fast.
- **Performers:** they stand in the song's concert formation (rows, center in front) wearing that song's exact costume, with microphone poses. Members who sat out are not shown.
- **LED wall:**
  - The pattern follows the song's genre family: rays, synth grid, stars, waves, hearts, EQ bars, rings, petals, diamonds, or the song title.
  - It is never the same as the previous song's.
  - Its colours come from that song's costumes, with a glow in the main costume colour.
- **Stages by venue category:**
  - Live house: truss, par cans, standing crowd.
  - Hall: curtains and a seated audience.
  - Large hall: Nippon Budokan has its golden roof ornament.
  - Arena: side screens with a close-up of the center, a runway and a penlight sea.
  - Stadium: open night sky, fireworks and light towers.
  - Dome: the roof arch, white for Tokyo Dome.
- **Per-venue details:** the structure colours, curtains and lights are seeded by the venue, so each venue always looks the same and different from the others.

## General Election voting statistics (`js/ui/ge-stats.js`)
- **Hidden during voting.** While voting is open nothing new is shown. The data is recorded silently from the existing fan-behaviour voting (`geGive`): tokens per member by fan class (fan type × Kami Oshi / Oshi / floating), the buyer pool, and tokens per buyer.
- **Snapshot at the close.** When voting closes, `e.final.vs` is stored:
  - Unique Voters: distinct buying fans, capped by the pool, and only fans with at least one cast token.
  - Total Votes: the real cast votes. They still decide the rank.
  - Average = votes ÷ voters.
  - The heavy-voter share and the behaviour mix.
  - Names are kept, so history never changes.
- **Shown after the ceremony** in the Election Archive:
  - a sortable table (Member, Final Rank, Total Votes, Unique Voters, Avg / Voter, with change versus the previous election);
  - six statistical highlights;
  - a link from the General Election page.
- **Older elections** show a note instead of invented numbers.

## Performance stat & speed (`js/ui/ux6.js`, `js/art/characters.js`)
- **Performance = average of Vocal and Dance.** `m.cha` is now a computed property on every member. All formulas, sorts and displays that used "Performance" use the average, and the old separate value is gone. It can't be trained directly; train Vocal or Dance.
- **Portraits are drawn once** into a hidden SVG sprite (`#ptspr`), and every copy on screen is a small `<use>` reference.
  - The Theater member / unit pickers went from ~5 MB of HTML per tap to ~90 KB.
  - Re-render times dropped about 5–8× on the heaviest screens.
  - Covers (exported as PNG) keep inline portraits.

## Captain System (`js/ui/captain.js`)
Extends the existing leadership fields: `g.cap` (Group Captain), the new `g.vcap` (Group Vice Captain), and `g.tl[tid].cap` / `.vice` (Team Captain / Team Vice Captain). Every group, Sister Groups included, and every team has its own independent positions.

### Positions & recommendations
- **Positions:** all optional, no term, appointed and removed immediately, never filled automatically, no Acting Captain.
- **Eligibility:** active full members of that group (and of that team for team positions). Trainees, graduated or dismissed members and members who left the group are not eligible.
- **Combinations:** one position per level. Group Captain + Team Captain together is allowed; a same-level conflict is explained and nothing is changed.
- **Validation:** positions are re-checked every day.
- **Recommendations (advice only):** computed when the appointment screen opens, from existing data:
  - personality and the relationship profile `m.rp`;
  - Passion, Loyalty, Mental Health;
  - group and team tenure;
  - relationships in `S.rel` (cross-team for group positions, team bonds for team positions, the bond with the Captain for Vice positions);
  - past appointments and leadership events.

  Weights differ per position. The level is Excellent / Good / Average / Poor, with reasons taken from the real data. If nobody is suitable, the screen suggests leaving the position vacant.

### History
- `S.capH` stores one record per appointment period (member, group, team, position, start, end, reason). It is never deleted, and a later re-appointment creates a new record.
- A reconciler keeps the history in step whatever changed the position: the Groups page, restructuring, graduation, dismissal, transfer, demotion, disbanding.
- Saves from before this system record the current holders as "before records", with no invented history.

### Leadership events
- **When:** checked weekly per team and group, only when a real trigger exists:
  - a new member;
  - a member with low Mental Health;
  - a strained or conflicting pair;
  - a new single Center;
  - recent General Election results;
  - a recent Theater show of the team;
  - a generation gap;
  - cross-team distance;
  - Captain pressure, or appreciation after repeated support.
- **How often:** per-team and per-group cooldowns plus per-member/pair cooldowns. The Captain leads more often than the Vice Captain, and one member leads at most one event per check.
- **Outcomes:** probabilistic. They depend on bond, personality and the member's need for space, and can be positive, neutral or negative.
- **Effects** go only through existing systems:
  - relationship bond, feelings, pair history and Relationship news;
  - Mental Health through `wlAdj`;
  - small Passion changes;
  - +1 Loyalty only when a new member is welcomed.
- **What it never does:** no fan, revenue, Senbatsu, Center or election influence, and no direct relationship controls.
- **When a Captain graduates,** only members who were genuinely close to her react.

### UI
- **Groups page:** a Group Leadership panel with History, plus Captain / Vice Captain rows on each team.
- **Candidate screen:** level, reasons and current positions, with Appoint, Cancel or Leave vacant.
- **Position detail:** appointment date, time in office, duties, leadership moments and previous positions, with Replace or Remove.
- **Profile:** a Leadership section.
- **Vacancy notice:** a single "Leadership" pop-up.

## Economy & fanbase safety (`js/ui/econfix.js`)
- **CD cap.** `CD_MAX` = 5,000,000 CDs per single, album or election single. It applies to release-day sales, daily edition sales (editions stop selling when the cap is reached), album sales and election CD buying.
- **Diminishing fan growth.** Fan gains shrink as the fanbase grows: × 1 / (1 + (fans / 2.5M)^1.3). That is about 77% at 1M fans, 50% at 2.5M and 29% at 5M, which stops the sales ↔ fans feedback loop from exploding.
- **Kami Oshi adoption.** Each month some fans who only have Oshi choose one of them as Kami Oshi (existing rules; no fans are created or removed). Saves where Oshi-only fans outnumber Kami Oshi fans more than 2:1 are rebalanced once on load.
- **Invalid values repaired.** Loyalty, engagement, spending and segment sizes are fixed on load and monthly, so averages no longer show NaN.
- **Election voter statistics.** The CD scale of an election now changes how many fans buy, not how many CDs each buyer gets. Average votes per voter now reflects real behaviour (casual about 1–2, hardcore 20+). Statistics already sealed in finished elections are not changed.

## Theater fixes (round 7)
- **Trainee Stage** ends as soon as a Trainee of its lineup is promoted, transferred or leaves (scheduled shows cancelled), whether Trainees remain or not. A restructuring transition of the Trainee theater ends with it.
- **Restructuring transition**: a pending "Theater transition needed" is completed automatically once the team already performs another Stage after the announcement (or the team no longer exists).
- **Performance report**: "Setlist as performed" only on the Stage's first performance (or when the setlist changed); Song Preference only where songs were scored (first performance / new performers). The daily Song Preference note follows the same rule.
- **Birthday / Graduation Stage** tag in results, Performance History, Stage pages and the report title. The special-stage box is a one-line summary (no member/row list).
- **Birthday Stage**: one member per performance; never on a Stage's first (debut) or final performance. Plans that break the rules are moved (auto-schedule) or released with a notice. Photos use the Theater stage: one photo of everyone who performed that show and one photo per extra song.
- **Stage Archive**: only the first and the last (latest) performance, with every member (tap a face for the profile).
- **Costume dropdowns** (every page): Single costumes and Theater costumes in separate sections, sorted by group, team and release order; other designs last.
- Team names are shown correctly when a performance of another group's team is opened (no more raw keys such as "tt4").
- **Performance pictures** (Theater debut/performance photos, Birthday Stage photos, Concert photos): every row stands on a perspective stage floor (back rows further back and smaller, with shadows) instead of floating; members stand further apart. In the Birthday Stage group photo the birthday member holds the cake (others in random poses); extra-song photos use the normal stage formation with the birthday member as Center.
- **Performance report from Performance History / Stage Archive**: no per-member section (it stays in the summary shown right after the performance).
- **Stage Archive Setlist**: song, Team / Unit and Center only (no costume preview, costume count or rows); Unit songs show the Unit members (faces and names); no Units section. Debut photos are labelled "First performance photos" with the note that they show the costumes worn that day.

## Fans: Kami Oshi & Oshi
- Each fan has **at most 1 Kami Oshi** (main support: most of the fan's money and votes) and **up to 5 Oshi** (secondary support). A member is never both Kami Oshi and Oshi of the same fan. Old saves are trimmed to the limit on load.
- **Support style** per fan: Steady (rarely changes Kami Oshi / Oshi), Normal, Fickle (keeps changing). High-loyalty fans are more often Steady. Both Kami Oshi and Oshi keep changing month by month at the fan's own pace.
- Fanbase overview shows fans with a Kami Oshi, average Oshi per fan and the number of Steady / Normal / Fickle fans.
- The member profile overlay (tap a face) has a ✕ close button at the top right.

## Single Production (7 steps) & release updates
- Steps: 1 Release information · 2 Songs & Senbatsu · 3 Costumes · **4 Music Video** · **5 Sales & Editions** (Release Day, editions) · **6 CD covers** (each Type and each Limited Edition) · 7 Budget & start.
- A new coupling / album song goes straight to Senbatsu Selection; its Song Sheet ("Song created") opens after the Senbatsu is saved.
- **Regular Edition = Pre-order, Limited Edition = Limited Quantity** (fixed). Note: an open pre-order still blocks starting the next single until it closes (existing rule).
- Popularity Index is no longer shown (sort lists, member cards, profile); it still works inside the simulation.
- Costume Library picker (📚 Library design…): previews, category (Single / Theater / Other), group, team, newest / oldest first.
- Saved costume names: "Song — Center" for the Center, "Song #1 / #2" for other members' designs; Single Costumes (non-Senbatsu) are "<Group> <Title Track>" (#1, #2 when there are several). Old saves are renamed once.
- CD cover studio: 🎲 Random members (same number, others from the Senbatsu), 🎲 Random positions, 🎲 Random poses, 🎲 Move texts; a random cover also moves its texts.
- Theater notices: short reasons ("Busy: Filming MV: names") and "Substitutes: names"; who replaced whom is in the performance summary.
- Release Day Mini Concert picture: members stand in the Title Track dance formation (rows and left-to-right order, Center in the middle of the front row).
- Song Preference in theater reports only on a Stage's first and final performance.
- MV: Song Preference changes views (and the long tail); new fans per view are highest on the first day and fade over the following days; Coupling MVs reach fewer people than the Title Track MV (fewer views, lower fan conversion).
- **Release Day Mini Concert popularity**: Title Track Senbatsu members gain more than Coupling members — Title Track Center +3, front row +2, others +1; Coupling-only members also perform (smaller exposure), the Coupling Center +1. The release pop-up lists each member's gain.
- **Release Day Mini Concert pictures**: besides the Title Track picture, one performance picture per Coupling song (its own Senbatsu, formation and costumes) — in the release pop-up and in the event window (Discography › promotion gallery). Older singles get them from their records.

## External Events (Bookings) — Part 1 & 2
New section **External Events** (bottom bar: Bookings): Overview · Event Board · Direct Offers · Music Programs · Event Calendar · Preparation · Event Reports · Event History · Organizers (+ Event Details and Participant Selection).
- **Offers**: the Event Board refreshes daily (number / level follow company reputation); Direct Offers come from organizers, satisfied ones send more and exclusive invitations; referrals from excellent organizers. Every offer has a deadline (expired offers are kept as expired) and a **fixed payment** (no negotiation).
- **Categories**: Music & Festival, Corporate, Media & TV, School & University, Fashion & Beauty, Commercial & Promotion, Public & Charity, Special Appearance (with subtypes and activities: Live Performance, Talk & Interview, Guest Appearance, Photo Session, Fashion Show, Commercial Shoot, MC / Presenter, Promotional Activities). Levels: Local, Small, Medium, Large, Major, Premium.
- **Selection mode is fixed by the event**: events with a Live Performance → *Player Selection* (members of the requested group(s) / team(s); a senior (main) group also covers its sister groups; any number, mixed groups; songs from the Song Library with event-only order, Centers and positions — original song data is never changed). Every other booking → *Organizer Selection* (named members with their groups; accept or decline only; no changes, no substitutes). No whole-group booking.
- **Schedules**: offers are generated only when the people involved are free of Concerts, Roadshows, other external events and other locked activities. Theater never blocks; accepted bookings make the members unavailable for that day's Theater performances, so the existing Theater replacement / cancellation rules apply. Accepted bookings are schedule reservations visible to every system and appear in the game Calendar.
- **Preparation**: automatic from category, level, duration, members and activities (a plan, not a rehearsal system).
- **Artwork**: every record gets its own artwork when it is created (category scene + the members drawn from their stored character snapshots), kept with the record in History and after save / load.
- **Results** (category-specific criteria from existing stats + wellness efficiency): Excellent / Great / Good / Average / Poor; activity results; organizer and audience satisfaction; uneven popularity gains by visibility and performance; Trend (Buzz), Passion, Variety; energy by activity and duration; group fans through the fanbase, member recognition and exposure (Oshi / Kami Oshi choices); company / group reputation; organizer relationship (Neutral / Good / Excellent).
- **Finance**: fixed payment as income, transport / accommodation / staff / equipment / other as expenses — recorded once; report shows gross, expenses and net.
- **Cancellation**: declining is free; after acceptance a company cancellation without a valid reason costs 30% of the fee (valid: a participant's health or departure); organizer cancellations have no penalty and incurred expenses are reimbursed.
- **Music Programs**: every new single brings 1–3 invitations to fictional music programs inspired by Japanese formats (Music Station-, CDTV-, Venue101-, Buzz Rhythm-style and a seasonal special), each with its own network, popularity, audience, prestige, style, interview and requirements. Performers are exactly the Title Track Senbatsu (locked). Results raise single visibility, Title Track popularity, group reputation, member popularity / Trend, fans and income.
- **Performance (Next day / +7)**: portraits are drawn once into a hidden sprite; that sprite used to keep every portrait ever shown (every costume, expression and size — up to 4,000), so each screen update had to restyle tens of thousands of hidden nodes and advancing days got slower the longer a game ran. Portraits no longer used on screen are now removed after each render (and restored automatically if an older window is shown again). External Event offer generation stops checking schedules as soon as it has enough members.

## Notification settings
Management › 🔕 Notifications: turn off the pop-ups for Member birthdays, Theater performance results and Theater notices. Everything is still recorded (Birthdays page, Theater history) and every muted notice is kept in a log on the same card.

## Studio Recording & Theater DVD (Recording & DVD section)
- **First Performance Snapshots**: one per Stage production — Original and Revival Stages are separate Stage records with their own IDs. Created from the first completed official performance (cancelled shows never produce a performance record) and never rewritten: setlist order, each song's performers in their positions, Centers, rows, Units, MC sections and participants, Encore, costume references and the performers' names at the time. Existing saves get snapshots from their earliest stored performance; if the debut record or parts of it are missing, the missing items are listed and the production that needs them is unavailable (nothing is guessed).
- **Studio Recording**: choose a Stage (Original or Revival), all / one / several songs, arrange the tracklist; each song is recorded by its own first-performance participants (locked, no member selection; graduated / transferred members included). New studio audio only. Cost and days from the number of songs and participants; charged once via the ledger; completion on the calendar.
- **Theater DVD**: the complete first performance (all songs in order, all MC sections, Encore only if performed, original costumes, Centers, formations, Units). No song, date or member selection. Unavailable when the first performance is not completely recorded. Charged once.
- **Recording Library** (Studio Recordings / Theater DVDs) and **Recording History** (productions, costs, snapshots, log).

## Song Library (streaming style)
Music › Song Library opens on **Your Library** (no Home page); **Search** is the second section; the previous production list stays available as "Production list". Dark streaming-app design with large artwork (existing CD covers, song artwork, Stage / recording covers drawn as light images), categories (All, Songs, Singles, Albums, EPs, Theater Stages, Studio Recordings, Theater DVDs), Grid / List view, sort (Recently Added, Release Date, Alphabetical, Popularity from existing values), detail pages for Singles (Types A–D, tracklist, Title Track Senbatsu, Center, MV), Albums / EPs, Songs (genre, concept, lyrics, popularity, Song Preference, MV views, Senbatsu, history, links to single / album / Stages / recordings / DVDs), Theater Stages (original first-performance setlist with Units, MC and Encore), Studio Recordings and Theater DVDs. A small info bar shows the selected item (no audio playback). Read-only: no game data is changed.

## UI & costume updates (ux9)
- **Promotion pictures**: in a single's promotion record, tapping the Handshake Event picture opens its results and tapping a Roadshow picture opens its details (the separate "View results" / "Details" buttons were removed).
- **New songs** open on their song card in step 2 (title, genre, concept, lyrics); the song sheet still appears after the Senbatsu is saved.
- **Costume presets** open as a 3-column picture grid; the "Use existing costume" library picker is also 3 columns.
- **Costume parts**: pants hips follow the body (no box at the hips) and reach the shoes; puff sleeves and armbands sit on the shoulder; new *Off-shoulder sleeves*, *Strapless top* and necklines *V-neck*, *Wide neckline*, *Shirt collar*, *Crew neck (T-shirt)*.

## Concert screens, round 3 (concert3.js)
- The old *Theater & Events* page was removed; **Concerts** is the first page of Events & Concerts.
- Participants and MC speakers are chosen from member cards (face, name, group, team) in 3–5 columns, with filters and sorting.
- Venues with both seats and a standing floor offer **Mixed: standing + seated**: a slider sets the standing share; standing tickets (General Admission) and seats (Reserved / Premium / VIP) are priced and capped separately.
- **Add songs** opens a picker sorted by Group, Single, Stage and Team.
- The setlist uses the Theater timeline (M01, M02 … with MC breaks; +MC inserts a break after a song).
- Tapping a song opens its **formation page**: no member limit, up to 10 rows, tap a position then a member; ★ center, ◀ ▶ order, ▲ ▼ rows.
- Costumes can be chosen **per member**: one of her own single / Stage costumes, a library design or a random one; the others keep theirs.
- Stage pictures are bigger (1200×560); large halls, arenas, stadiums and domes get a thrust stage and an upper stage level where the back row stands.
- Concert dates must be at least 2 months ahead; after confirmation the **setlists stay editable until the first performance day** (schedule, venue, participants and tickets are fixed).
- Member cards in concert pickers show only the picture, name, group and team; sorting and filtering use the game-wide sort bar (one sort per list).
- Setlists can have an **Overture** and an **Encore** (EN button moves a song — and the MC right after it — into the Encore).
- Formation rows fill from the centre outwards (centre, right, left, …); each row has **⇔ Center out** (center, then most popular, alternating) and **Clear row**.
- **Select all shown (not yet in this song)** on the formation page adds every member the sort bar currently shows (in its sorted order, filters respected) to the chosen row, filling empty positions first.

## Library, covers and concert segments (recdvd2.js, concert3.js)
- Your Library no longer lists Theater Stages or Theater DVDs. In a single's tracklist every track of an edition uses that edition's cover.
- Discography and release results show each Senbatsu as member cards (face, name, team, ★ center, First Time).
- **Studio Recording covers** use the same Cover Studio as singles (layers, poses, text, stickers, backgrounds, random tools); members wear the costumes of the recorded Stage songs. 🎲 Random cover creates one instantly.
- **Theater DVD covers** are DVD-case size (portrait): a first-performance stage photo in Stage costumes with editable group, team, Stage name, subtitle, photo song, layout and colour.
- Concerts can include **VTR** and **PV** segments; the player writes what they are about or rolls a random idea.
- Stage songs added to a concert keep the members, rows and centers of the Stage's first performance (only concert participants are placed).
- The song picker has Group / Single / Stage tabs; Stages are listed group → team → stage number, without Revival Stages.
- Concert songs can be marked **Unit**; the formation page shows which Unit songs each member is already in ("Unit M03").
- Costumes: Stage songs wear their Stage costumes; members added to a song automatically wear that song's original costume; **Same as M0x** reuses another song's costumes; **Copy to members without a costume**; the member costume library has Single / Stage / Other and group filters plus a name search.
- Every popup has a ✕ in its top-right corner, and closing a popup keeps the page at the same scroll position.

## Costume Designer expansion (cz-core.js, cz-items1/2/3a/3b.js, costume-designer2.js)
Additive: the same Costume Designer, Costume Library and save format. New components are ordinary pieces stored in the design (`design[category][component]`), so old costumes draw exactly as before (tested byte-for-byte).
- **Category groups**: Basics · Details · Accessories · Festival & Graduation · Traditional, with search and collection / style filters for large categories, and real thumbnails.
- **Details**: Bodice details (13), Skirt structures (13), Shoulders & arms (12, arm parts follow the arm in every pose), Back details (9), Trims (13, placed on skirt hem / top hem / neckline / waist / cuffs).
- **Accessories**: Ornaments (14), Fantasy & stage (12), localized Embroidery (12 motifs × 8 areas), Head accessories (39: seasonal, royal, Thai / Chinese / Japanese, idol) drawn above the hair.
- **Festival & seasonal** (53): Christmas, Halloween, Valentine's Day, Spring & Sakura, Summer festival, New Year, Easter, Winter, Autumn, Birthday.
- **Traditional-inspired**: new tops (Sabai, Thai fitted top, Dusit bodice, Kimono, Hanfu cross-collar, Qipao), bottoms (Pha sin, Hakama, Horse-face skirt, Chest-high skirt, Kimono lower), sleeves (Kimono, Furisode, Hanfu wide, Water sleeves), collars (Kimono eri, Jiaoling), Song-style beizi, 22 components, and 19 complete presets (7 Thai Chut Thai styles, 6 Chinese, 6 Japanese).
- **Dresses** (26 one-piece silhouettes) — Top/Bottom are kept but hidden while a dress is worn.
- **Placement**: left / right / both, layer (behind the body · on the outfit · on top · above the arms), size, position, rotation and sheerness, clamped per part.
- **Materials**: lace, chiffon and organza (sheer), metallic, glitter, embroidered fabric (added to satin, velvet, sequins, tulle…).
- **Patterns**: 31 new reusable textile patterns (Thai, Chinese, Japanese, universal) usable on any piece, pattern rotation, and a **Pattern Library** to save patterns and apply them to any costume.
- Skipped as duplicates of existing pieces: Corset overlay, Peplum, Apron, Back bustle, Cape, Detached sleeves, Mandarin collar, Tiara / Royal crown, Beret / Mini top hat, Hair ribbon, star / heart clips, Necklace, Choker, Earrings, Graduation train, Graduation corsage, Scalloped lace trim.
- Random costume generation keeps using the original pieces only.

## Media & Public Relations (news.js, news-gen.js, news-world.js, news-scandal.js, news-ui.js)
New **Media & PR** section: News Feed, Crisis Room, News Archive, Reputation & Outlets. There is no social-media management (no official accounts, followers, posting or scheduling).
- **News Engine** (`news.js`): one pipeline (`nwEmit` → `nwPublish` → `nwApply` → `nwNotify`) for all articles. Each source event has a dedupe key, so an event is reported once; follow-ups link to their parent. On the first day after loading an older save, existing records are marked as covered, so old events do not flood the feed. Impacts are applied once and logged (`S.news.log`).
- **Separate values**: company reputation / public trust / media attention, group reputation / attention, and member reputation / attention live in `S.news.rep`. Popularity (`m.pop`) and the fanbase change only through the existing helpers.
- **Game-triggered news** (`news-gen.js`) reads real records only: single announcement and release (release-day sales from the sales log), MV view milestones, costume praise, the real weekly chart (`S.ind`), Theater (stage announcement, first performance, revival, milestones, satisfaction), concerts, elections (no ranks or votes before the ceremony; actual votes after), handshake and roadshow events, external bookings, member history (first center, first Senbatsu, promotion, transfer, kennin, graduation), auditions, captains, recordings, fanbase surges, rival debuts / status / No. 1 hits from the competitor simulation.
- **Random world news** (`news-world.js`): positive stories about members (including low-popularity members, with cooldowns), groups and the company, plus genre trends from the real chart.
- **Scandals & rumors** (`news-scandal.js`): 12 categories, 5 severity levels, hidden truth (true / partial / false / unconfirmed) independent of severity. Investigation actions reveal evidence over time. Responses (deny, clarify, acknowledge, apology, statements, correction request, warning, explanation, suspension, penalty, no disciplinary action, monitor, close) each have conditions shown in the UI. **The game never chooses a response, punishment, suspension or resolution for the player.** Outcomes come from the hidden truth (for example, denying a true report can be exposed later). Suspension uses the existing leave system (`leave.type='susp'`, 14 days). Reaction is split by audience (Kami Oshi, Oshi, casual, general public, media, rival fans). Case history is permanent.
- **Images**: every article has an image: the real CD cover, group or member portraits, the Theater or concert stage, rival emblems, chart graphics, or a labelled editorial illustration for sensitive stories (never a fabricated photo, nothing explicit).
- **Language**: each article stores English and Thai text under one ID. The UI follows the global language setting, and switching keeps the same article, image and facts.
- **Outlets**: 8 fictional outlets with focus, credibility and tone. Trending is ranked from attention, follow-ups, severity and member popularity.

## Thai language pass (th-voice.js, th-ui3.js, i18n.js)
- **Member voice**: every line a member says was rewritten in natural Thai that follows her tone: bright (Genki, Airhead) is lively and uses “หนู”; calm (Cool, Elegant) is poised and uses “ฉัน”; soft (Shy) hesitates (“อ-เอ่อ…”, “ห-หนู…”); firm (Serious) is resolute and ends with “ค่ะ”. This covers Senbatsu reactions, election speeches, greetings, team and role changes, contract talks, graduation requests, talks and persuasion replies, monthly hints and the final graduation message. Fan comments sound like real fans online.
- **Joined text**: speeches and notes built from several sentences (final message, graduation talk, help text) are translated sentence by sentence, using the longest known run of sentences. A template blank never swallows a sentence break. Names and titles written inside quotes are kept exactly as typed.
- **Newly translated**: costume catalogue (pieces, patterns, presets), all 120 concepts and their descriptions, 120 genre descriptions (genre names stay in English, as Thai listeners use them), 114 lyric themes, prefectures, event types, music programs, Theater and booking screens, fan and chart screens, member profile and care options, the single-production timeline, release pop-ups, and about 340 toast and confirmation messages. Organiser, rival and song names are proper nouns and stay as they are.
- **Full sweep (second pass)**: every English text in the UI source (about 6,900 pieces: labels, buttons, toasts, confirmations, reports, help text, relationship stories, contract and graduation screens, concerts and venues, election setup, external-event details, MV planning, Studio Recording / DVD, restructuring, health and leave) was checked against the Thai layer and the missing ones (about 2,050 strings and templates) were translated. Only proper nouns stay in English: member, group, song, organiser, venue, label and TV-programme names, plus genre names.
- Wrong partial translations were fixed (for example “Back to production” no longer becomes the Senbatsu back row).

## Training & Skill Development (skills.js) — replaces the Lesson Room
- **Removed:** player-bought lessons (`train()` with ¥10,000 and Energy per click), the Lesson Room view, the per-profile "Train" buttons, the random +1 skill from single rehearsals, and the **Potential** stat (dropped from members, audition cards, profiles and planners).
- **Three skills, 0–1000 each:** `m.skl = {vo, da, va}` (Vocal, Dance, Variety) is the only stored copy. `m.sing` / `m.dance` / `m.variety` are read-only views on the 0–100 scale existing formulas use (100·√(skill/1000)), so every performance, event and sales formula reads the same live skills without being rewritten. Performance (`m.cha`) is still the Vocal/Dance average. Lists and profiles show the real 0–1000 values (`svs` → `skShow`).
- **Audition:** rarity sets the starting total (UR ≈ 230–340, SR ≈ 170–260, R ≈ 120–200, N ≈ 60–150) and each applicant gets an individual specialty: one strong skill, two strong skills or balanced. Lower rarities can be gifted. Values are generated with the applicant, shown on the audition card and kept on recruitment.
- **Growth:** one calculation for every source (`skAdd`). EXP per point = 1 + 3·(v/1000)², so 50→60 costs about 10 EXP and 900→910 about 35. Rarity never changes growth or the cap, so every rarity can reach 1000 in each skill independently.
- **Member-driven training (`trnDay`, daily):** each member has her own habit, sociability, favourite skills and a motivation that drifts toward her Passion-based baseline. Motivation moves with Senbatsu results (left out, demoted, lost Center: wants to win her place back; first Center or first Senbatsu: wants to live up to it), show feedback, consistency and low Mental Health. A free member (no commitment that day, not on leave or resting, enough Energy) may practise: she picks the skill herself (weakness, enjoyment, current ambition). Sociable members invite others who are also free; partners can come from other teams, other groups or the trainees. Each participant's EXP depends on her own effort, the session length, her consistency, Mental Health and mood, and, in a group, cohesion and stronger partners. Practice uses Energy and adds workload through the existing wellness system.
- **Real work EXP (participants only, once per activity, unique completion keys in `S.trn.done`):**
  - Theater: songs actually performed (Vocal, Dance) and MC segments (Variety).
  - Concerts: per-member songs and MC from the result.
  - Release mini concert, and single rehearsals (only members who attended).
  - External events and music programs, by their real activities (live: Vocal and Dance; talk, guest, MC, promo: Variety).
  - Handshake events (Variety), and Roadshows (songs: Vocal and Dance; MC breaks: Variety).
  - Absent, unselected or cancelled participants get nothing. Reloading or opening histories never re-applies a reward.
- **Practice Room** (Training menu): today's self and group sessions, plus each member's skills, motivation and why she feels that way. There is no scheduler, no assignment control and no development report. Profiles show the three skills, specialty, motivation and last practice.
- **Old saves:** skills migrate ×10 (80 → 800). Rarity, identity and history are kept, Potential is removed, and past activities are not rewarded again.
- Balance check: in a five-year simulation with Theater four times a week, the average best skill reached about 790 and the most consistent member about 999.

## Albums work like Singles (MV, Under Girls costume, 20 songs, 3:4 cover)
- **Music Video**: new album songs get the same MV planning as singles (style, location, budget, Week 3 filming). Their MVs are published on the Album Release Day and earn views and fans like single MVs. Songs reused from the Song Library keep their existing video.
- **Under Girls costume**: albums have the same optional release outfit as singles, for members outside the Album Main Song Senbatsu (“ALBUM COSTUME”). It can be saved as the profile costume and is kept on the released album.
- **Track types**: each album track type holds up to **20** songs (singles keep their edition limit).
- **Cover**: album covers are portrait **3:4** (512×683 in the editor, 600×800 PNG export). Random covers and random positions use the full height. Singles stay 1:1. Albums released before this update keep their square covers.
- **Fix**: album sales could become NaN (the album fan factor read a fan type that is not always present), which gave no revenue. The factor now falls back safely.
- **Fix**: the Lyrics theme could not be chosen by hand in Thai mode (the option value became the Thai label). Options without a value now keep their English value when translated, for every dropdown in the game.

## Fanbase NaN repair
- **Cause**: before the album fix above, an album release could compute NaN sales. The NaN then reached `S.fans`, member popularity (`grantRep`) and the fanbase segments, so the Fanbase screen showed “NaN” and its rankings could not be sorted (a NaN breaks the sort).
- **Repair** (`js/ui/nan-repair.js`): runs on load, after each release and on any day where something looks broken. Broken member stats take the median of the other members; broken fan segments are dropped and broken traits reset to neutral values; `S.fans` is rebuilt from the fan segments; broken album/single sales become 0; any other NaN becomes 0. Company Money is left to its own repair.
- **Whole-generation repair**: member stats are repaired even when most members are broken (for example a whole first generation): the median of the healthy members is used, or a neutral default when none is healthy. Number displays (`fans`, `sales`, `views`, `pop`, `buzz`, `rev`) treat a missing value as 0 instead of crashing the screen.
- **Member fans from the fanbase**: a broken member fan count is rebuilt from her supporters in the fanbase (Kami Oshi + Oshi), which the bug did not damage. The check runs on every load and every day (no one-time flag): any member with 0 fans who still has supporters gets her fans rebuilt, counted directly from the fan segments. If her popularity was broken too, it is estimated from the healthy members (popularity per supporter), capped at twice the highest healthy popularity.
- **Sorting**: Fanbase ranking sorts now treat a missing value as 0, so one bad value can no longer stop the sort.

## Albums share the single release pipeline
- New albums are released through the same pipeline as singles. The release is stored in `S.singles` with `kind:'album'` and mirrored in `S.albums` (same id, `sx:1`) for the album views, song library and discography (listed once).
- So an album now: enters the **Monthly Sales Chart**, can hold a **Handshake Event** (step 7 of planning), can be promoted with **Roadshows**, updates members' **profile costumes** (main-song costume for its Senbatsu, Album Costume for Under Girls), gets MVs, fan growth and music-program offers like a single.
- **Numbering**: singles and albums keep their own numbers (Single 3 → Album 1 → Single 4), while the Senbatsu history counts them as one sequence of releases.
- Songs reused from the Song Library keep their original release (they are referenced, not re-released). Albums released before this update stay as they were.

## Office and Costume Designer clean-up
- The Producer Office no longer shows the Missions card or the featured “Mini Concert” banner.
- Costume Designer: the five category tabs (Basics / Details / Accessories / Festival & Graduation / Traditional) are replaced by one list of every costume part, grouped in labelled sections. Each part shows ✓ (or a count) when it is in use, and each section shows how many parts it uses. On a phone the list wraps instead of scrolling sideways.
- **Garment pieces moved into Basics** (`js/art/cz-move.js`): clothing-type pieces from Traditional and Festival now live in five new Basics categories: *Capes, shawls & robes* (Sabai shawl, Pibo, Santa/Witch cape, knit scarf…), *Belts, sashes & obi* (Thai gold belt, obi set, festival/red/floral/birthday sashes…), *Collar pieces* (Thai jewelled collar, fur and gothic collars), *Sleeve & wrist pieces* (Thai armlets, fur cuffs, flower sleeves) and *Skirt overlays & panels* (Thai/Chinese front panels, kimono panel, Christmas and blossom overlays). The Graduation category (gown, sash, train) is listed in Basics too. Saved designs keep working: a moved piece stored under its old category is moved to the new one when the design is drawn or edited.
- **Display categories by body area** (`js/ui/cz-taxo.js`): every one of the 347 pieces is listed in exactly one display category, grouped as *Clothing* (Tops, Dresses, Skirts & pants, Skirt layers & overlays, Jackets/capes & robes, Sleeves & cuffs, Collars & necklines, Belts/sashes & corsets, Legwear, Shoes), *Details* (Bodice details, Shoulders/arms & hands, Back details, Trims, Embroidery), *Accessories* (Head & hair, Jewellery & ornaments, Flowers & corsages, Wings & stage effects), *Festival & seasonal* and *Traditional ornaments*. A display category can mix pieces from different storage categories (for example Head & hair holds the hair bow, headband, clips, crown, hat and graduation cap of the basic accessories together with all head accessories). Storage is unchanged, so saved costumes, presets and randomizers are unaffected.

## Character Appearance expansion (js/art/appearance.js, js/ui/appearance-ui.js)
Extends the existing character art engine and Character Creator; no separate system, no gameplay change.
- **Bangs** (22, +11): straight, thin, diagonal, split, rounded, long, layered, fluffy, uneven, curved, anime decorative (plus the existing middle/side part, side-swept, curtain, wispy, blunt, asymmetrical, short fringe, face-framing).
- **Back hair** (25, +9): short wavy, shoulder-length, waist-length, shaggy, half-down, braided hair (crown braid), double braids, double buns, voluminous (plus bob, medium/long straight, long wavy, curly, high/low/side ponytail, twin tails, side braid, bun, half-up, hime cut, wolf cut, layered, short layered). Bangs and back hair stay independent.
- **Ahoge** (7 shapes + none): drawn as part of the bangs. Its base sits inside the crown with no outline across it, it uses the crown colour, flips with the bangs and keeps its place for every bangs style and face shape.
- **Face shapes** (16): different outlines (cheeks, jaw, chin); the eyes, nose, mouth and hair keep their positions.
- **Eyes** (16, +10): cat-like, sharp, soft, droopy, innocent, elegant, mature, cute, sleepy, expressive. Each has its own lid curve, lower lid, lash style and proportions.
- **Eyebrows** (14, +10) and **mouths** (14). The chosen mouth is the resting mouth; event expressions still change it for the moment.
- **Colour picker**: saturation/brightness square, hue slider, HEX, RGB, system picker, presets, saved custom colours (kept in the browser), reset. Free colours for hair (+ optional shadow colour), skin, eyes, eyebrows and eyelashes. The renderer builds its gradients, highlights and line art from the chosen colour, so shading is kept and each part keeps its own colour.
- **Editor**: categories Face Shape · Skin Color · Bangs · Back Hair · Ahoge · Eyebrows · Eyes · Mouth · Hair Color (+ Outfits, Accessories); thumbnails drawn by the real renderer; live preview (pinned on phones).
- **Saves**: new optional fields `fs, ah, mt, hcx, hc2x, skx, ecx, bcx, lcx` (exact `#rrggbb`). Records without them draw exactly as before; verified byte-identical for characters without an ahoge (the ahoge itself is now attached to the bangs, as requested).
- The page no longer uses `overflow-x:hidden` on html/body (now `overflow-x:clip`), which had silently disabled every sticky panel.

## Member profile & event participant picker
- **Discography & Achievements tab** (`js/ui/profile2.js`), in this order:
  1. **Team History** (oldest first): only group/team/leadership moves, e.g. “Joined OMG48 as 1st Generation”, “Promoted to Team O”. Debut, birthdays, Birthday Stages, first-Senbatsu notes and election results are no longer listed here.
  2. **Senbatsu Election**: “OMG48 1st General Election: 12th Place (Senbatsu)”.
  3. **Senbatsu**: per group (her own group first, then the other groups she sang for), each with A-Sides and B-Sides. Released songs re-used on an album are not counted again.
- **Member Stats tab**: Birthday Stage history shows the date, age and the photos button only; “Recent emotional events” is removed.
- **External event participant picker**: 3–5 cards per row (3 on phones); each card shows name, group · team · generation, availability and “⭐ Latest Senbatsu · group” when she is in the latest Title Track Senbatsu of her group (or of another group she sang for). Sorting and filters use the shared member sort bar like every other member list.
- **Age** is now a sort option in the shared member sort bar (every member list) and in the restructuring sort.

## BLOOM: THE IDOL PROJECT (js/ui/bloom.js) — annual survival show
- One season per in-game year (`S.bloom.seasons[year]`). March: members apply by themselves; the player only approves/rejects (company quota 10, shared by all groups). Any company commitment between April 1 and EP.13 (`gsCommits`, except theater shows — contestants are left out of those) makes a member ineligible, with the reasons listed. At most one company member debuts per season (not shown to the player).
- April 1: 60 contestants (approved members + generated trainees of other agencies, saved). Contestants are busy for company work until EP.13 (`gsCommits`, Senbatsu pool, roadshow selection).
- 13 Sunday episodes: EP.01/02 grades (A–F) and the Theme Song Center (EP.02 Grade A only; special re-evaluation if nobody has A), rankings with eliminations at EP.03/06/09/12 (48/36/30/20), Group Battle, Position Battle (Vocal/Dance/Rap), Concept Mission and Battle, Grand Finale. Skill and vote scores are stored separately.
- Every company contestant gets saved episode stills (scene recipes, drawn from her own character art).
- Finale: 7–12 debut members form a Project Group (a real company group, type `project`) for two years. Original contracts: A (ends later) → simply return; B (ends earlier) → extended to the project end, renewal talk after return; C (same day) → renewal talk after return. No renewal talk during the project. Generated members return to their agencies at the end.
- Fans for all company contestants through `fbAcquire` (new unique fans, domestic and worldwide); profile shows Survival Show History and the Episode Gallery.

## Forced stay (grad3.js)
- A member who announced her graduation (not a dismissal) can be kept: profile → Contract box → "Force her to stay". Cost = max(¥200M, 60 months of her value + ¥500 per fan, 5% of company money). The announcement is cancelled, her Graduation Stage becomes a regular performance, the contract runs at least 2 more years, morale −25 / loyalty −20, and new graduation requests are less likely for a year.
- Contract talks not held by 60 days before the end: "wants to renew" → automatic renewal (same length, otherwise 3 years); "undecided" → renews with a chance from loyalty/morale, otherwise graduates; "thinking about graduating" → graduation. A reminder comes 7 days before the deadline; contract notices are listed first under "⚠ Contracts".

## History keeps graduated members (hist-ctx.js)
- While history is drawn (single details, announcements, Senbatsu lists, covers, Music Videos, election ceremonies, theater / concert / event / recording history, song library), get(id) also finds former members (S.alumni). Current pages are unchanged.
- History of a single shows each member with her profile costume of that single and her election rank from the last election held by its release day.
- iPhone/iPad: pictures that would be turned into image files keep their characters (inline SVG / plain-SVG drawing).
- Songs set to "Music Video" always get their MV on release; released ones that were missed are repaired on load.

## Request Hour: long-term song life (rh-life.js, extends reqhour.js)
- Every released song (all categories, sister groups included) keeps Awareness and Affection in S.rhs.s["gid:songId"]. Awareness: set at release, raised by exposure (active theater stages, player-chosen concerts/roadshows, Request Hour placings, news), fading weekly. Affection: release reception (song evaluation, stage preference, MV, a hidden-gem factor), well-received stages (capped), graduation announcements of its center/members, Request Hour concerts; almost permanent. Player-chosen performances never raise Affection.
- Performance memory per song: concerts (once per concert, Request Hour concerts excluded), roadshow performances and unique roadshow locations kept apart, last date and a log; random roadshow setlists are not counted.
- Voting: one choice per fan combining group support, center (Kami Oshi) support — spread over every song she centers and smaller for full-team songs — and song affection gated by awareness; new-release interest (first-time center, generation debut), events, previous ranking. No sales/popularity bonus for title tracks.
- Request Hour is held only when the player creates it (no automatic edition). New events default to Top 25 with sister songs.
- Full-team theater songs have no Center in Request Hour (no center support, not counted for center diversity, no center shown); units, solos and duets keep theirs.
- Per-song history (previous, best, years, streak, #1 / Top 3 / Top 10 / Top 25 years, years not ranked) in the results and in the song info pop-up; NEW / RETURN / movement badges.
- Any single can be the Request Hour single, including General Election singles (CDs carry a ballot and a Request Hour code; the election's daily sales feed the voting codes), election-results singles and Janken singles; albums cannot (rh-ui.js).
- Request Hour presentation: stage poster, five-step event timeline, launch card and a banner on the Concerts page (rh-ui.js).

## Units & Solo Artists (units.js)
Management › Units / Solo Artists. A unit (Permanent / Special / Shuffle, 2–12 members from any team or sister group, no Trainees) or a Solo Artist is its own production context in `S.groups` (`type:'unit'|'solo'`), so the normal single / album pipeline works for it through **Production**. Members keep their group and team; leaving the company removes them from rosters (history kept); disbanding is manual and stops new releases. Releases enter the same CD chart (artist tag Main / Sister / Unit / Solo) with demand from the members' own unique fans; awards: release categories for all, no group categories for solo artists, units not in main-group categories. No Senbatsu records or reactions for unit releases.

## Fan Community (community-tpl.js, community.js) — replaces the old News system
Fan Community section: All / Main Group / Sister Groups / Trending, threads with replies, fan campaigns.
- Posts come only from real, public events found by a daily scan (announced Senbatsu, releases, first-week sales, MV view milestones, concerts, theater shows, roadshows, handshakes, elections, Request Hour, promotions, captains, awards, birthdays, special stages, graduation announcements, anniversaries, units) or from speculation built on public history (past lineups, centers, genres). Unannounced decisions are never mentioned.
- Fan accounts belong to one group; who they support comes from the fan economy's Kami Oshi counts. Six writing styles; accounts rest between posts.
- Anti-repetition: one post per meaning per event, same meaning about the same subject at most once in 21 days, per-line cool-downs, exact-text and similarity checks (names removed), reply meanings unique per thread. When nothing new can be said, nothing is posted.
- Trending from the last 3 days' engagement (accounts, replies, likes, recency, relevance); campaigns start only after the same concern came back in separate discussions and end after 3 weeks or when the wish comes true.
- Impact: aggregated and rate-limited, through the existing `gainPop` (medium: +0.3 at most weekly per member; high: a trending campaign, +0.8 at most every 3 weeks). Comments never touch fan counts directly.
- English and Thai lines are written separately (not translated). Data in `S.cm` with retention limits; older saves initialise safely.

## Formation & history labels (sb-update.js)
- Centers selector has **No Center** (fm.nc = 0): no center slot, the song releases with no Center.
- Member history: 1 member (Solo) · 2 members (Duet with name) · double Center: Center (Duet with name) · 3+ Centers: Center (1 in N Centers). Theater / concert 2-member unit songs: Duet with name.
- Thai: names chosen by the player (members, songs, singles, albums, groups, teams, units, stages, concerts) are never translated; genre / concept / lyrics descriptions in the library picker and under the selectors are translated.

## Fandom Drama & Fan Wars (community-drama.js)
Part of the Fan Community: a drama is a normal thread whose replies come from several accounts on different sides (defend / other side / neutral / calming).
- Seeds only from real events: announced Senbatsu (Center War, Senbatsu Dispute, Generation Debate, Team Rivalry, Sister Group Debate when a sister-group member takes a Main Group spot, Management Backlash when the same Center returns 3+ times), a title song in a new genre (Song & Concept Debate), election results (Election Dispute, close-rank Oshi Rivalry), theater unit pairs (Combination Debate).
- Escalation: heat = topic importance × fandom size × members' fans × daily engagement, decaying daily. Levels: Minor Disagreement, Growing Argument, Fan War, Major Backlash (big fandoms + lineup / management / election topics only; small topics stop at level 2). Many threads fade at level 1; heated ones end with a calming reply.
- Opinions change only with real new facts (stronger first-week sales, MV view milestones).
- Anti-repetition: the same conflict waits 30 days; line cool-downs, exact-text checks, each line once per thread, accounts at most twice per thread.
- Impact: engagement, trending, fandom mood and "how fans see management" (descriptive). Level 3+ gives at most +0.15 popularity awareness per member per 30 days. No fan-count changes, no penalties.
- Content stays on lineups, songs, performances and chances: no allegations, rumors or personal attacks.

## Request Hour concert scheduling (rh-cc-fix.js)
- Each performance can be put on any date and slot (days may be apart); two performances never share a date and slot; only performance days are rented / booked.
- Confirmed concerts can be postponed (+7 / +14 / +21 / +30 days, all performances together).
- Protection: duplicate slots are separated automatically; an unconfirmed concert whose date arrives is moved forward with a notice; ticket sales never open after the first performance; a cancelled Request Hour concert can be organized again from the Request Hour results (the ranking is kept).

## Scheduled songs & Concert Premiere (cc-premiere.js)
- Songs of a single / album in production (release day fixed) appear in the Concert and Stage song pickers with their release date. A concert performance that sings one must be on or after the release day; a Stage that uses one must have its first performance on or after it (Stages already performing can add it once released).
- Concert Premiere (Single Production): choose a performance of a concert being prepared; the release day becomes that day, every song of the single / album must be in that performance's setlist, and the release picture is that concert performance at its venue. A moved concert moves the release; a cancelled one ends the premiere (normal release).

## Install on a phone (PWA)
The site is an installable web app (manifest.webmanifest, icons/, sw.js). iPhone: open in **Safari** › Share › **Add to Home Screen**. Android: Chrome › ⋮ › **Install app / Add to Home screen**. It opens full screen like an app. The service worker is network-first (always the newest version online; the last copy only when offline). Note: on iPhone the home-screen app has its own storage — move a save with Export / Import.

## Business & Financial System
- **Central Financial Engine** (`js/core/finance.js`): every yen goes through `finPost()` (earn / spend / project helpers are wrappers). Each transaction has an ID, day, category, source, description, group and optional member / project / dedupe key. Sales record gross, channel deductions and the company's allocated share. Duplicate keys are refused (salaries, job payments, revenue shares, recurring costs). Reversals are supported. Monthly aggregates match the transaction list.
- **New companies** start with ¥50,000,000. Monthly costs scale with the company: office, utilities, staff, marketing, theater lease, training facilities, coaches, insurance, fan club systems. Corporate tax is 30% of fiscal-year profit (April–March) with losses carried forward. Loans are tracked; an emergency loan covers a negative balance on the 1st. Facilities reduce costs but have upkeep.
- **Members** (`js/ui/finance-sys.js`): monthly salary = position base (Trainee ¥80K · Active ¥180K · Team Vice-Captain ¥230K · Team Captain ¥280K · Group Captain ¥350K; Group Vice-Captain is paid as Team Captain) + ¥10,000 per completed year since her own start date. It is paid separately for each group or unit she belongs to. Center, Senbatsu and Under selection do not change it. Graduated members are paid only in an active unit. Job payments are made for recording, MV filming, theater, Special Stages, concerts, roadshows, handshake events, external work, music programs, dramas, awards and election ceremonies. No bonuses.
- **Election Single**: 1 eligible CD = 1 vote. Each member receives 30% of her own votes × ¥300 (company allocation per CD), and the company keeps 70%.
- **Rebalance**: external fees ×0.2, roadshow attendance capped by venue, platform / manufacturing deductions, realistic production / audition / costume costs. Older saves convert their cash once: ¥50M + 4% of the cash above the old ¥3M start. Finished work is never paid again.
- **Dashboard**: Office → Finances & Ledger (overview, monthly, yearly, transactions, project reports, member pay, loans & assets). The member profile shows salary per group, seniority, next increment, job payments and election revenue share.

## Costume Designer — Summer Collection
Extends the existing designer, library and save format (no new editor):
- Swimwear (bikini/ruffle/tankini/sporty tops & bottoms, one-pieces, swim skirt/dress), summer tops, cold-shoulder/flutter sleeves, summer skirts/shorts, sundresses — all separate pieces that combine with every existing piece.
- New **Summer** section: cover-ups, lace collection, details, hair/jewelry (incl. anklet)/hats/beach/tropical accessories.
- Summer & Lace pattern groups, **Pattern spacing** slider, optional **Transparency** slider (sheer fabrics and lace only, default 0).
- 12 summer presets (Marine, Tropical Idol, Beach Festival, Summer Festival, Sailor Summer, Cute, Elegant, Resort, Sundress, swimsuits, kimono cover-up).
- MV planner: per-member costume from the Costume Library (independent of the stage/song costume). CD cover: existing per-member picker lists every library design.
