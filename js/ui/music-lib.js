// =====================================================================================
//  Music database: Genres, Concepts and Lyrics themes (name | family | data | short description)
//  · Genres:   name | family | vocal weight 0–1 (rest is dance) | stage intensity 4–9 | description
//  · Concepts: name | family | description   (family → member Concept Fit weights and suited personalities)
//  · Lyrics:   name | family | description   (a lyrical theme only — there is no Mood)
//  The entries extend the existing GENRES / CONCEPTS / LY_THEMES tables (music2.js); nothing is replaced.
// =====================================================================================
const MU_GF={pop:'Pop',dance:'Dance',elec:'Electronic',rock:'Rock',ballad:'Ballad & Acoustic',rnb:'R&B, Soul & Funk',hip:'Hip-Hop',jazz:'Jazz',folk:'Folk & Country',world:'World',classic:'Classical & Stage',idol:'Idol & Anime'};
const MU_G=`Pop|pop|.55|6|Bright, catchy melodies and simple song structures made to be sung along with by everyone.
Dance Pop|dance|.4|7|Upbeat pop built for choreography, with strong beats and hooks that stick after one listen.
Synth Pop|pop|.55|6|Melodic pop led by synthesizers and drum machines, cool and slightly nostalgic in tone.
Electropop|elec|.4|8|Glossy pop with heavy electronic production, punchy bass and processed vocal hooks.
Bubblegum Pop|pop|.5|6|Sugary, playful pop with bouncy rhythms and childlike, instantly memorable choruses.
Teen Pop|pop|.5|6|Fresh, youthful pop about everyday feelings, easy to sing and easy to love.
City Pop|pop|.6|6|A smooth, stylish Japanese pop sound inspired by urban nightlife of the late 1970s and 1980s.
Power Pop|pop|.55|7|Punchy guitars and big sing-along choruses that mix pop sweetness with rock energy.
Indie Pop|pop|.6|5|Charming, lightly produced pop with jangly guitars and a handmade, personal feel.
Dream Pop|pop|.65|4|Hazy, floating textures and soft vocals that feel like drifting through a dream.
Chamber Pop|classic|.7|4|Pop songs dressed in strings, woodwinds and piano, delicate and carefully arranged.
Art Pop|pop|.6|5|Pop that plays with unusual structures, theatrical ideas and bold artistic images.
Experimental Pop|pop|.5|6|Pop that breaks its own rules with surprising sounds, rhythms and song forms.
Sunshine Pop|pop|.6|5|Warm vocal harmonies and breezy melodies that sound like a sunny afternoon.
Baroque Pop|classic|.7|4|Classical ornaments such as harpsichord and strings wrapped around a pop tune.
Bedroom Pop|pop|.65|4|Intimate, soft-spoken pop that sounds as if it were recorded at home late at night.
Shibuya-kei|pop|.55|5|A chic Tokyo blend of pop, jazz and bossa nova with a retro, fashionable collage feel.
Hyperpop|elec|.45|8|Extreme, glittering pop with pitched vocals, distorted bass and chaotic energy.
Kawaii Pop|idol|.5|6|Ultra-cute idol pop with squeaky hooks, call-and-response chants and sparkling sounds.
Idol Pop|idol|.5|7|The classic idol sound: bright chords, group vocals and fan chants built into the song.
Disco|dance|.45|7|An upbeat dance style with a steady four-on-the-floor rhythm and groovy basslines.
Disco Pop|dance|.45|7|Modern pop with disco strings, glittering guitars and a dance-floor pulse.
Nu-Disco|dance|.45|7|Disco reborn with modern electronic polish, slick bass and a cool late-night mood.
Eurobeat|dance|.35|9|Very fast, synth-driven dance music with dramatic melodies and non-stop energy.
Eurodance|dance|.4|8|Nineties club pop with pounding beats, big synth riffs and anthem choruses.
Para Para|dance|.3|8|High-tempo dance tracks written for synchronized arm-movement routines.
Hi-NRG|dance|.4|9|Driving, fast electronic disco with relentless bass and powerful vocals.
Italo Disco|dance|.45|7|Melodic European disco with robotic synths and romantic, slightly melancholic tunes.
Freestyle|dance|.45|7|Latin-tinged electro dance music with syncopated beats and emotional melodies.
EDM|elec|.3|9|Electronic dance music featuring synthesized sounds, energetic build-ups and powerful drops.
House|elec|.4|8|Steady club beats, warm chords and a groove designed to keep people dancing.
Deep House|elec|.5|6|Mellow, soulful house with soft pads, deep bass and a relaxed after-hours feel.
Tropical House|elec|.5|6|Laid-back house with steel drums, marimba and a breezy holiday atmosphere.
Progressive House|elec|.4|8|Long, slowly building house tracks that rise to wide, euphoric melodies.
Electro House|elec|.3|9|Hard-edged house with buzzing synth leads and heavy, aggressive drops.
Future Bass|elec|.5|7|Shimmering synth chords, chopped vocals and bouncy drops full of colour.
Drum and Bass|elec|.35|9|Very fast breakbeats over deep rolling bass, urgent and athletic.
Dubstep|elec|.3|9|Half-time beats and wobbling, growling bass drops with dramatic tension.
Trance|elec|.45|8|Hypnotic, soaring synth melodies over a fast steady beat that builds to release.
Techno|elec|.25|9|Mechanical, repetitive club rhythms with a cold, futuristic drive.
Synthwave|elec|.5|6|Retro-futuristic synths and neon moods inspired by 1980s films and games.
Chiptune|elec|.45|7|Cheerful melodies made from the bleeps of old video-game consoles.
Future Funk|elec|.45|7|Chopped disco and city pop samples turned into sparkling, bouncing dance tracks.
Ambient Pop|elec|.65|4|Slow, spacious pop that floats on soft electronic atmospheres.
Trip-Hop|elec|.6|5|Slow, smoky beats with moody samples and a dark, cinematic calm.
UK Garage|elec|.45|7|Shuffling two-step beats, chopped vocals and warm bass with a stylish swing.
Hardstyle|elec|.25|9|Pounding distorted kicks and anthem melodies at festival-level intensity.
Electro Swing|jazz|.5|7|Vintage swing horns and jazz samples fused with modern dance beats.
Glitch Pop|elec|.5|6|Pop built from stutters, clicks and digital errors turned into rhythm.
Rock|rock|.5|8|Guitars, bass and drums played loud with attitude and a strong backbeat.
Pop Rock|rock|.5|8|Catchy pop melodies with energetic rock instrumentation, guitars and strong rhythms.
Alternative Rock|rock|.55|8|Guitar music outside the mainstream, mixing raw emotion with unusual sounds.
Punk Pop|rock|.45|9|Fast, bratty guitar pop with shouted hooks and youthful rebellion.
Punk Rock|rock|.45|9|Short, fast and loud songs with simple chords and a defiant attitude.
Hard Rock|rock|.5|9|Heavy guitar riffs, pounding drums and powerful, belted vocals.
Soft Rock|rock|.65|5|Gentle, melodic rock with smooth vocals and an easy-going warmth.
Indie Rock|rock|.55|7|Independent-minded guitar music, a little rough and full of personality.
Garage Rock|rock|.45|8|Raw, fuzzy and energetic rock that sounds like a band in a small room.
Glam Rock|rock|.5|8|Stomping beats, flashy guitars and theatrical glitter-covered swagger.
Symphonic Rock|rock|.6|7|Rock band power combined with sweeping orchestral arrangements.
Emo Rock|rock|.6|7|Confessional lyrics and dramatic guitars that swing between quiet and explosive.
Post-Rock|rock|.4|6|Mostly instrumental guitar landscapes that grow slowly into huge climaxes.
Surf Rock|rock|.45|7|Twanging reverb guitars and rolling drums that evoke waves and beaches.
Rockabilly|rock|.5|8|Early rock and roll with slap bass, quick guitar licks and a retro bounce.
Visual Rock|rock|.55|8|Dramatic Japanese rock with gothic flair, fast guitars and emotional melodies.
Kawaii Metal|rock|.45|9|Heavy metal riffs colliding with sweet idol melodies and cute chants.
Shoegaze|rock|.55|5|Walls of blurred, distorted guitar with soft vocals buried inside the sound.
Ballad|ballad|.85|4|A slower, melody-focused style that emphasizes vocals and emotional expression.
Pop Ballad|ballad|.8|4|A gentle pop song at a slow tempo with a big, heartfelt chorus.
Power Ballad|ballad|.85|5|A slow song that builds from quiet verses to a huge, soaring finale.
Piano Ballad|ballad|.9|4|Voice and piano at the centre, leaving every word and breath exposed.
Acoustic Pop|ballad|.7|4|Pop songs carried by acoustic guitar, natural and close to the listener.
Acoustic|ballad|.75|4|Unplugged instruments and unprocessed voices, simple and honest.
Enka Ballad|ballad|.9|4|Traditional Japanese-style ballad with dramatic vibrato and deep sentiment.
R&B|rnb|.7|6|Smooth grooves, rich vocal runs and a relaxed, soulful rhythm.
Contemporary R&B|rnb|.6|6|Sleek modern R&B with electronic beats and layered, silky harmonies.
Soul|rnb|.8|6|Deeply felt vocals over warm horns and rhythm, rooted in gospel emotion.
Neo Soul|rnb|.75|5|Jazzy chords and laid-back grooves with intimate, expressive singing.
Funk|rnb|.45|8|Tight syncopated bass and guitar, punchy horns and an irresistible groove.
Funk Pop|rnb|.45|7|Pop songs riding a funky bassline with crisp rhythm guitar and brass.
Motown|rnb|.65|6|Classic 1960s soul-pop with tambourines, handclaps and sweet group harmonies.
New Jack Swing|rnb|.45|8|Late-80s fusion of R&B singing with hard swinging hip-hop beats.
Gospel Pop|rnb|.8|5|Uplifting choir harmonies and handclaps that build to a joyful release.
Hip-Hop|hip|.35|8|Rhythmic spoken verses over sampled beats, with swagger and street style.
Rap|hip|.35|8|Fast, rhythmic wordplay at the front, driven by flow and attitude.
Trap|hip|.3|8|Booming 808 bass, rattling hi-hats and dark, heavy atmospheres.
Boom Bap|hip|.4|7|Old-school hip-hop with dusty drum loops and a head-nodding swing.
Lo-fi Hip-Hop|hip|.5|4|Mellow, crackling beats with jazzy chords made for quiet evenings.
Pop Rap|hip|.45|7|Rap verses paired with bright sung hooks for an easy, radio-friendly mix.
Jazz|jazz|.7|5|Swinging rhythms, rich harmony and room for improvisation and personality.
Jazz Pop|jazz|.7|5|Pop melodies with jazz chords, walking bass and a sophisticated mood.
Swing|jazz|.55|7|Big, bouncing dance-band rhythm with bright brass and a playful step.
Bossa Nova|jazz|.7|4|Soft Brazilian rhythm with whispered vocals and gentle nylon guitar.
Big Band|jazz|.6|7|A full brass and reed orchestra playing bold, showy arrangements.
Lounge|jazz|.65|4|Easy, elegant background music with soft vibraphone and cocktail-hour charm.
Folk|folk|.75|4|Story-telling songs with acoustic instruments and plain, sincere voices.
Folk Pop|folk|.7|5|Folk warmth and acoustic strumming shaped into catchy pop songs.
Country Pop|folk|.65|6|Twangy guitars and heartfelt stories with a polished pop chorus.
Celtic Pop|folk|.65|6|Fiddles, whistles and lilting melodies woven into bright pop.
Latin Pop|world|.45|7|Pop with Latin percussion, passionate vocals and dance-ready rhythm.
Reggae Pop|world|.55|6|Off-beat guitar skank and relaxed island groove under a sunny melody.
Reggaeton|world|.4|8|The driving dembow beat with chanted hooks made for the dance floor.
Samba Pop|world|.45|8|Carnival percussion and joyful melodies that never stop moving.
Afrobeat Pop|world|.45|7|Interlocking African rhythms, bright guitars and a light, rolling bounce.
Okinawan Pop|world|.65|5|Island scales and the sanshin lute give pop a warm southern-sea colour.
Wa-Pop|world|.6|6|Japanese traditional instruments such as koto and shamisen fused with modern pop.
Kayokyoku|world|.75|5|Showa-era Japanese pop with dramatic melodies and nostalgic orchestration.
Tango Pop|world|.55|6|Sharp, passionate tango rhythm and accordion set inside a pop song.
Flamenco Pop|world|.55|7|Spanish guitar, handclaps and fiery vocals with a pop structure.
Classical|classic|.75|4|Composed music for orchestra or chamber group, formal and refined.
Orchestral Pop|classic|.7|5|Pop songs lifted by a full orchestra for a grand, sweeping sound.
Musical Theatre|classic|.75|6|Songs that tell a story like a stage show, with character and big finishes.
Waltz Pop|classic|.7|4|Graceful three-beat rhythm that makes a pop song sway like a ballroom dance.
Opera Pop|classic|.9|5|Operatic vocal power and drama delivered through pop melodies.
Cinematic|classic|.6|5|Wide, film-score soundscapes that make a song feel like a movie scene.
Vocaloid / Anime Pop|idol|.5|7|Fast, intricate melodies in the style of synthesized-singer and anime songs.
Denpa|idol|.45|8|Deliberately chaotic, hyper-cute songs with rapid chants and nonsense hooks.
Anison Rock|idol|.5|8|Heroic, fast guitar anthems in the style of anime opening themes.
Marching Band Pop|idol|.45|7|Snare drums, brass fanfares and parade energy turned into pop.
Cheer Pop|idol|.4|8|Chant-driven, stomping pop written like a cheerleading routine.`.split('\n').map(l=>{const[n,f,v,i,d]=l.split('|');return{n,f,vw:+v,int:+i,d}});
const MU_CF={cute:['Cute & Sweet',{cute:.8,pretty:.2},['Genki','Airhead']],pure:['Pure & Youthful',{cute:.5,pretty:.5},['Shy','Airhead']],romance:['Romance',{pretty:.5,cute:.3,mature:.2},['Shy','Elegant']],cool:['Cool & Powerful',{cool:.8,mature:.2},['Cool','Serious']],dark:['Dark & Mysterious',{cool:.5,mature:.5},['Cool','Serious']],elegant:['Elegant & Luxury',{pretty:.6,mature:.4},['Elegant','Serious']],sexy:['Sexy & Glamorous',{mature:.8,pretty:.2},['Cool','Elegant']],energy:['Energetic & Festive',{cute:.5,cool:.3,pretty:.2},['Genki','Airhead']],fantasy:['Fantasy',{pretty:.6,cute:.4},['Airhead','Elegant']],emotional:['Emotional',{pretty:.5,mature:.3,cute:.2},['Shy','Serious']],season:['Seasons & Places',{cute:.4,pretty:.4,cool:.2},['Genki','Shy']],retro:['Retro',{pretty:.5,cute:.3,mature:.2},['Genki','Elegant']],future:['Future & Sci-Fi',{cool:.7,pretty:.3},['Cool','Serious']],life:['Life & Spirit',{cute:.35,cool:.3,pretty:.35},['Genki','Serious']]};
const MU_C=`Cute|cute|An adorable, cheerful and charming concept with playful expressions and sweet visuals.
Sweet|cute|Soft pastel colours, gentle smiles and a sugary, comforting atmosphere.
Candy Pop|cute|Lollipops, bright primary colours and a hyperactive sweet-shop world.
Toy Box|cute|Members as living dolls and toys in a colourful, playful playroom.
Pajama Party|cute|A cosy sleepover with pillows, secrets and giggles late at night.
Maid Café|cute|Frilled aprons and devoted service with a wink, straight from Akihabara.
Idol Classic|cute|The timeless idol image: ribbons, matching uniforms and bright smiles.
Cheerful|energy|Non-stop positivity and big gestures that make everyone smile.
Innocent|pure|A pure and youthful concept that expresses sincerity, freshness and simplicity.
Youth|pure|The sparkle of being young: running, laughing and believing in tomorrow.
School Life|pure|Classrooms, uniforms and after-school moments shared with friends.
First Love|romance|The shy excitement of liking someone for the very first time.
Diary|pure|Private thoughts and small daily feelings, as if reading a girl's notebook.
Flower Language|pure|Blossoms and bouquets used to say what words cannot.
Butterfly|pure|Delicate transformation and lightness, like wings opening for the first time.
Romantic|romance|Soft lights, longing glances and the warmth of being in love.
Valentine|romance|Chocolate, hand-written notes and the courage to confess.
Wedding|romance|White dresses, vows and the promise of a shared future.
Moonlight|romance|A quiet night scene bathed in silver light and gentle longing.
Starry Night|romance|A sky full of stars and wishes made side by side.
Secret Garden|romance|A hidden place of flowers where private feelings are allowed to bloom.
Cool|cool|A confident and stylish concept featuring strong attitudes and sophisticated visuals.
Girl Crush|cool|Fearless women other women admire: bold, independent and in control.
Powerful|cool|Hard-hitting choreography and fierce expressions that fill the stage.
Rebellious|cool|Breaking the rules with a smirk, torn denim and raised fists.
Confidence|cool|Head high and shoulders back, owning every step.
Rock Star|cool|Leather, guitars and the swagger of a band at its peak.
Punk|cool|Safety pins, spiked hair and loud refusal to behave.
Street Dance|cool|Sneakers, crews and battles under city lights.
Hip-Hop Swag|cool|Oversized fashion, gold chains and relaxed, unshakable cool.
Warrior|cool|Fighters preparing for battle with discipline and burning eyes.
Military Uniform|cool|Sharp tailoring, synchronized marching and commanding presence.
Spy Action|cool|Secret agents, sleek black outfits and a mission against the clock.
Racing|cool|Speed, checkered flags and the roar of engines.
Dark|dark|A mysterious and dramatic concept with darker visuals and intense expressions.
Gothic|dark|Black lace, candlelight and old-world melancholy.
Mysterious|dark|Half-hidden faces and unanswered questions that pull the viewer in.
Horror|dark|Eerie settings and chilling expressions that play with fear.
Vampire|dark|Immortal beauty, crimson accents and dangerous elegance after dark.
Witch|dark|Spells, potions and knowing smiles under a pointed hat.
Masquerade|dark|Ornate masks and a ballroom where nobody is who they seem.
Detective Noir|dark|Rain-soaked streets, trench coats and a case that won't let go.
Lonely|emotional|An empty room, a single light and feelings no one else sees.
Elegant|elegant|Refined poise, graceful movement and quiet, tasteful beauty.
Luxury|elegant|Diamonds, champagne and the gleam of the high life.
Royal Court|elegant|Crowns, gowns and the formal splendour of a palace.
Princess|elegant|Tiaras and ball gowns in a kingdom where dreams come true.
Ballet|elegant|Tutus, pointe shoes and disciplined, weightless grace.
Art Museum|elegant|Members posed like paintings among marble halls and gilded frames.
Jazz Club|elegant|Velvet curtains, a spotlight and smoky late-night sophistication.
Glamorous|sexy|Sequins, red carpets and the dazzling confidence of a star.
Sexy / Mature|sexy|Grown-up allure with slow, deliberate movement and smouldering looks.
Disco Fever|retro|Mirror balls, flared outfits and a dance floor that never empties.
Night City|sexy|Neon reflections, taxis and the thrill of the city after midnight.
Festival|energy|Lanterns, drums and a crowd celebrating together in the streets.
Celebration|energy|Confetti, toasts and the joy of marking a special day.
Carnival|energy|Feathers, parades and wild colour from morning to night.
Circus|energy|Ringmasters, acrobats and a big top full of surprises.
Cheerleader|energy|Pom-poms, jumps and loud support from the sidelines.
Marching Band|energy|Uniformed ranks, drums and brass moving as one.
Sports Day|energy|Headbands, relay races and giving everything for the team.
Sporty|energy|Athletic wear, healthy energy and a love of movement.
Adventure|energy|Maps, backpacks and the excitement of the unknown.
Pirate|energy|Treasure maps, tall ships and freedom on the open sea.
Wild West|energy|Cowboy hats, dusty towns and a showdown at noon.
Safari|energy|Khaki outfits and wide-eyed wonder among wild animals.
Road Trip|energy|An open road, loud music and friends in the back seat.
Dreamy|fantasy|Soft focus, clouds and the feeling of not quite being awake.
Fantasy|fantasy|Enchanted worlds with castles, quests and impossible landscapes.
Magical|fantasy|Sparkling wands and transformations in the magical-girl tradition.
Fairy Tale|fantasy|Storybook scenes of forests, glass slippers and happy endings.
Angel|fantasy|White wings, halos and a gentle light from above.
Mermaid|fantasy|Shimmering scales and songs from beneath the waves.
Fairy Forest|fantasy|Tiny wings and glowing mushrooms deep among ancient trees.
Snow Fairy|fantasy|A spirit of frost dancing through silent, glittering snow.
Heroic Fantasy|fantasy|Swords, dragons and a party of heroes setting out together.
Emotional|emotional|Raw feeling at the centre, with expressions that hold nothing back.
Heartbreak|emotional|The ache after love ends, shown through tears and empty hands.
Bittersweet|emotional|A smile and a sigh together, happy and sad in the same moment.
Nostalgic|emotional|A warm, faded look back at days that will not return.
Graduation|emotional|Cherry blossoms, diplomas and saying goodbye with gratitude.
Healing|emotional|Calm, gentle comfort that lets a tired heart rest.
Lullaby|emotional|A hushed bedtime world of soft blankets and whispered songs.
Family Warmth|life|Home cooking, shared tables and the people who are always there.
Hometown|life|Familiar streets and the place you return to in your heart.
Summer|season|Bright and refreshing, inspired by holidays, sunshine and youthful memories.
Beach|season|Sand, waves and swimsuits under a blazing sky.
Tropical Island|season|Palm trees, hibiscus flowers and turquoise water far from home.
Winter|season|Scarves, white breath and warm hands in the cold.
Christmas|season|Illuminations, presents and a wish made on a snowy night.
Spring|season|New buds, soft pink petals and fresh starts.
Autumn|season|Red leaves, warm sweaters and a thoughtful, golden light.
Rainy Day|season|Umbrellas, puddles and quiet moments behind a wet window.
Halloween|season|Costumes, pumpkins and mischievous tricks and treats.
Star Festival|season|Tanabata wishes on paper strips and lovers meeting across the Milky Way.
New Year|season|Kimono, first shrine visits and hopes for the year ahead.
Kimono Festival|season|Yukata, fireworks and goldfish scooping on a summer evening.
Japanese Traditional|season|Classical Japanese beauty: fans, folding screens and elegant restraint.
Nature|season|Forests, rivers and open sky, at peace with the living world.
Sunrise|season|The first light of morning and the promise of a new day.
Travel|season|Suitcases, train windows and discovering somewhere new.
Café Chill|season|Coffee, soft music and an unhurried afternoon with a friend.
Bookish|season|Libraries, glasses and the quiet pleasure of a good story.
Retro|retro|A loving throwback to the styles and colours of earlier decades.
80s Idol|retro|Big ribbons, puffed sleeves and the golden age of Showa idols.
90s Street|retro|Baggy jeans, platform shoes and Shibuya street fashion.
Y2K|retro|Shiny fabrics, flip phones and turn-of-the-millennium pop optimism.
Vaporwave|retro|Pastel sunsets, old computer graphics and dreamy digital nostalgia.
Futuristic|future|Clean lines, metallic fabrics and a vision of tomorrow.
Cyberpunk|future|Neon, rain and high technology in a gritty mega-city.
Space|future|Stars, astronauts and a journey beyond the planet.
Robot / Android|future|Mechanical precision and the question of whether a machine can feel.
Virtual Idol|future|Digital avatars performing on holographic stages.
Gamer|future|Controllers, pixel art and the thrill of the next level.
Freedom|life|Open arms and wide horizons, with nothing holding you back.
Hope|life|A light ahead in the dark and the will to walk toward it.
Self-Love|life|Accepting yourself as you are and treating yourself with kindness.
Friendship|life|Linked arms, shared laughter and standing by each other.
Inspirational|life|An uplifting push to keep going and believe in yourself.
Revolution|life|Raising a flag and changing the world together.`.split('\n').map(l=>{const[n,f,d]=l.split('|');return{n,f,d}});
const MU_LF={love:'Love',heart:'Heartbreak',friend:'Friendship & Bonds',dream:'Dreams & Effort',youth:'Youth & School',self:'Self',life:'Life & Family',season:'Seasons & Places',farewell:'Farewells',fun:'Fun & Everyday',story:'Stories & Worlds'};
const MU_L=`First Love|love|Lyrics about experiencing love for the first time, with excitement, nervousness and sweet memories.
Confession|love|Gathering the courage to finally say "I like you" out loud.
Love Confession|love|A direct, heartfelt declaration of love to one special person.
Secret Crush|love|Loving someone quietly from a distance and hiding it from everyone.
Love at First Sight|love|The instant when a single glance changes everything.
Everyday Love|love|Small, ordinary moments with a partner that turn out to be happiness.
Eternal Love|love|A promise to love someone for the rest of your life.
Forbidden Love|love|Feelings for someone you are not supposed to love.
Love Triangle|love|Three hearts tangled together, where someone will be hurt.
Flirting|love|Playful teasing and the game of getting someone's attention.
Summer Romance|love|A love that burns brightly during one unforgettable summer.
Winter Romance|love|Two people keeping each other warm on cold, snowy nights.
Long-Distance Love|love|Loving someone far away and counting the days until you meet.
Wedding Vows|love|Promises exchanged on the day two lives become one.
Destiny|love|The belief that two people were always meant to find each other.
Unrequited Love|heart|A story about loving someone who does not return the same feelings.
Heartbreak|heart|The pain of a love that has ended and a heart left in pieces.
Breakup|heart|The moment of parting and the words said when a couple separates.
Missing Someone|heart|Thinking of a person who is no longer by your side.
Distance|heart|Growing apart, in miles or in feelings, from someone important.
Jealousy|heart|The sting of seeing the one you love smile at somebody else.
Betrayal|heart|Trust broken by someone you believed in.
Regret|heart|Wishing you could go back and choose differently.
Apology|heart|Finding the words to say sorry and hoping to be forgiven.
Letting Go|heart|Choosing to release someone because you love them.
Moving On|heart|Wiping away tears and stepping forward after a loss.
Tears|heart|Crying openly and letting the sadness finally come out.
Loneliness|heart|Being surrounded by people and still feeling alone.
Sleepless Night|heart|Lying awake with thoughts that refuse to quiet down.
Rainy Days|heart|Grey skies that match a heavy heart, and waiting for them to clear.
Friendship|friend|Lyrics celebrating friendship, shared memories and supporting one another.
Best Friends|friend|The one person who knows everything about you and stays anyway.
Teammates|friend|Working, sweating and winning together as one team.
Sisterhood|friend|Girls protecting and lifting each other up like family.
Rivalry|friend|Two people who push each other to improve by competing.
Promise|friend|A vow made together that neither will ever break.
Bonds with Fans|friend|A thank-you to the fans who cheer from the audience.
Reunion|friend|Meeting again after a long time and finding the bond unchanged.
Gratitude|friend|Saying thank you to everyone who helped along the way.
Dreams|dream|Holding on to a dream and imagining the day it comes true.
Chasing Dreams|dream|A message about pursuing dreams, overcoming obstacles and never giving up.
Stage Dreams|dream|The wish to stand in the spotlight and sing for a full house.
Idol Life|dream|The joys and hardships hidden behind an idol's smile.
Hard Work|dream|Daily practice, sweat and the pride of earning every step.
Never Give Up|dream|Falling down again and again and standing up each time.
Overcoming Difficulties|dream|Getting through hard times and coming out stronger.
Courage|dream|Taking the first frightening step into the unknown.
Victory|dream|The joy of finally winning after a long fight.
Underdog|dream|Being counted out by everyone and proving them wrong.
Ambition|dream|A burning desire to reach the very top.
Fame|dream|What it means to be known by everyone and the price of it.
Youth|youth|The brightness and impatience of being young.
Growing Up|youth|Leaving childhood behind and becoming an adult, one day at a time.
School Days|youth|Memories of classrooms, desks by the window and chalk dust.
After School|youth|The free hours after the last bell, spent with friends.
Club Activities|youth|Devoting every afternoon to a club and the people in it.
Exams|youth|Late-night studying and the nerves before a big test.
Graduation|farewell|Lyrics about saying goodbye, remembering shared experiences and looking to a new beginning.
Unforgettable Memories|youth|Moments so precious they stay vivid for a lifetime.
Nostalgia|youth|A sweet ache for the days and places of the past.
Summer Memories|season|Looking back on fireworks, sunburn and one perfect summer.
Self-Belief|self|Trusting your own strength when nobody else does.
Self-Discovery|self|Searching for who you really are beneath what others expect.
Self-Acceptance|self|Learning to love your flaws and stop comparing yourself.
Identity|self|Declaring "this is me" without apology.
Independence|self|Standing on your own feet and making your own choices.
Freedom|self|Breaking free from what holds you back and running toward the sky.
Mirror|self|A conversation with your own reflection about who you have become.
Imperfection|self|Finding beauty in the things that are not perfect.
Anxiety|self|The worries that tighten the chest, and learning to breathe through them.
Rebellion|self|Refusing to follow rules that make no sense.
Hope|life|A light that remains even on the darkest days.
New Beginning|life|Turning a page and starting fresh with a clear heart.
The Future|life|Wondering and dreaming about what tomorrow holds.
Life's Journey|life|Life as a long road with turns, hills and travelling companions.
Family|life|Love for parents and siblings and the home that raised you.
Mother's Love|life|Gratitude for a mother's quiet, endless care.
Hometown|life|The town you grew up in and the feelings it still holds.
Leaving Home|life|Packing a bag and setting out alone for the first time.
Happiness|life|Noticing that right now, in this moment, you are happy.
Miracle|life|Something impossible that happened anyway.
Prayer|life|A quiet wish sent out for someone's safety and happiness.
Peace|life|A hope for a gentle world without conflict.
Farewell|farewell|A final goodbye said with a smile to hide the tears.
One More Day|farewell|Wishing for just a little more time before the end.
Starlight|season|Looking up at the stars and feeling small and hopeful.
Night Sky|season|The vast dark above, shared by two people far apart.
Morning Light|season|Waking to a new day and feeling ready to begin again.
Spring Blossoms|season|Cherry petals falling and the meetings and partings of spring.
Autumn Leaves|season|Falling leaves and the gentle sadness of time passing.
Christmas Wish|season|One special wish made under the winter lights.
Fireworks|season|A summer night sky lighting up, and a moment that fades too fast.
Festival Night|season|Lanterns, yukata and holding hands in a crowd.
Beach Day|season|Sun, waves and a carefree day by the sea.
City Lights|season|The glow of the city at night and the dreams it holds.
Travel|season|Seeing new places and collecting memories along the way.
Celebration|fun|Raising a glass together on a day worth remembering.
Party Time|fun|Turning up the music and forgetting everything until morning.
Dancing All Night|fun|Losing yourself on the dance floor until sunrise.
Weekend Fun|fun|The freedom of a day off spent exactly as you like.
Sweets and Treats|fun|Cake, parfaits and the simple joy of something delicious.
Fashion|fun|Dressing up and feeling like the best version of yourself.
Social Media|fun|Likes, selfies and life lived through a screen.
Daydream|story|A mind wandering off to a nicer place in the middle of the day.
Fairy Tale Story|story|Once upon a time: a princess, a spell and a happy ending.
Magic Spell|story|Words of magic that change an ordinary girl into something more.
Time Travel|story|Going back to fix the past or forward to see what waits.
Outer Space|story|A voyage among planets and stars in search of something new.
Robots and AI|story|A machine that begins to wonder what a heart is.
Mystery|story|Clues, secrets and a truth waiting to be uncovered.
Secret|story|Something hidden that only the two of you know.
Justice|story|Standing up for what is right, whatever the cost.
Nature|story|Wind, trees and rivers, and our place among them.
Pets|story|The small animal friend who waits for you at home.`.split('\n').map(l=>{const[n,f,d]=l.split('|');return{n,f,d}});
