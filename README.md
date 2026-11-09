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

**Recovery.** Rest (free, once a day), Recovery Day, Medical Checkup (report), Medical Treatment, Mental Recovery, Producer Talk, Team Bonding and Reduced Schedule.

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
