// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Single Planning & Song Production update
// -------------------------------------------------------------------------------------
//  · 30 Genres and 30 Concepts. Each song has exactly one of each (no sub-genre, no
//    secondary concept). Every combination is allowed; there is no compatibility rule.
//    Older saves are converted (Pop→Teen Pop, Rock→Pop Rock, Electro→Electropop,
//    Folk→Folk Pop, Pure→Youth) and keep the same skills and stamina values.
//  · Costumes are purely creative: the old costume/concept sales bonus is removed.
//  · One unified "New Single Planning" page: tracklist, title track, Genre, Concept,
//    Senbatsu, Center, Front/Middle/Back rows and the costume of every song.
//  · Production: 28 days on the game calendar (milestones added to the calendar),
//    costumes take 7 days; the CD cover (designable from the start) is mandatory.
//  · Release Day: the single is released automatically when everything is ready;
//    otherwise nothing is released and a notice lists what is missing.
//  · Song Library: every song keeps its genre, concept, single, track, Senbatsu, center,
//    positions, costume and production/release status (snapshot taken on release).
// =====================================================================================
const GENRES=['Dance Pop','Synth Pop','Electropop','Bubblegum Pop','Teen Pop','City Pop','Disco Pop','Funk Pop','R&B','Contemporary R&B','Hip-Hop','Trap','Pop Rock','Alternative Rock','Punk Pop','EDM','House','Future Bass','Drum and Bass','Hyperpop','Acoustic Pop','Ballad','Pop Ballad','Jazz Pop','Latin Pop','Reggae Pop','Orchestral Pop','Gospel Pop','Folk Pop','Vocaloid / Anime Pop'];
const CONCEPTS=['Cute','Sweet','Romantic','First Love','Youth','School Life','Friendship','Summer','Festival','Cheerful','Dreamy','Fantasy','Magical','Fairy Tale','Princess','Elegant','Glamorous','Sexy / Mature','Girl Crush','Cool','Dark','Gothic','Mysterious','Horror','Cyberpunk','Futuristic','Retro','Nostalgic','Emotional','Inspirational'];
// skills a genre is performed with (same two-skill scheme as the original genres) and its Roadshow stamina cost
const GEN_SPEC={'Dance Pop':[['dance','sing'],7],'Synth Pop':[['sing','dance'],6],'Electropop':[['dance','sing'],8],'Bubblegum Pop':[['cha','sing'],6],'Teen Pop':[['cha','sing'],6],'City Pop':[['sing','cha'],6],'Disco Pop':[['dance','cha'],7],'Funk Pop':[['dance','variety'],7],'R&B':[['sing','cha'],6],'Contemporary R&B':[['sing','dance'],6],'Hip-Hop':[['dance','variety'],8],'Trap':[['dance','cha'],8],'Pop Rock':[['dance','cha'],9],'Alternative Rock':[['sing','cha'],9],'Punk Pop':[['dance','variety'],9],'EDM':[['dance','cha'],9],'House':[['dance','sing'],8],'Future Bass':[['sing','dance'],7],'Drum and Bass':[['dance','cha'],9],'Hyperpop':[['cha','variety'],8],'Acoustic Pop':[['sing','variety'],4],'Ballad':[['sing','cha'],4],'Pop Ballad':[['sing','cha'],4],'Jazz Pop':[['sing','variety'],5],'Latin Pop':[['dance','cha'],7],'Reggae Pop':[['variety','sing'],6],'Orchestral Pop':[['sing','cha'],5],'Gospel Pop':[['sing','variety'],5],'Folk Pop':[['sing','variety'],5],'Vocaloid / Anime Pop':[['sing','dance'],7]};
// personalities that suit a concept (the original "concept fit" between members and the song's theme)
const CONC_PERS={Cute:['Genki','Airhead'],Sweet:['Shy','Airhead'],Romantic:['Shy','Elegant'],'First Love':['Shy','Airhead'],Youth:['Shy','Airhead'],'School Life':['Genki','Airhead'],Friendship:['Genki','Serious'],Summer:['Genki','Airhead'],Festival:['Genki','Cool'],Cheerful:['Genki','Airhead'],Dreamy:['Airhead','Shy'],Fantasy:['Airhead','Elegant'],Magical:['Genki','Airhead'],'Fairy Tale':['Shy','Elegant'],Princess:['Elegant','Airhead'],Elegant:['Elegant','Serious'],Glamorous:['Elegant','Cool'],'Sexy / Mature':['Cool','Elegant'],'Girl Crush':['Cool','Serious'],Cool:['Cool','Serious'],Dark:['Cool','Serious'],Gothic:['Cool','Elegant'],Mysterious:['Cool','Shy'],Horror:['Serious','Shy'],Cyberpunk:['Cool','Genki'],Futuristic:['Cool','Serious'],Retro:['Genki','Elegant'],Nostalgic:['Shy','Serious'],Emotional:['Shy','Serious'],Inspirational:['Genki','Serious']};
const GEN_LEGACY={Pop:'Teen Pop',Rock:'Pop Rock',Ballad:'Ballad',Electro:'Electropop',Folk:'Folk Pop'},CONC_LEGACY={Cute:'Cute',Cool:'Cool',Pure:'Youth',Elegant:'Elegant'};
const plG=g=>GENRES.includes(g)?g:(GEN_LEGACY[g]||'Dance Pop'),plC=c=>CONCEPTS.includes(c)?c:(CONC_LEGACY[c]||'Cute');
(function plTables(){
 // rebuild the lookup tables: the 30 new entries are listed (dropdowns), old keys stay readable but hidden
 const reb=(T,list,val)=>{const old={};Object.keys(T).forEach(k=>{old[k]=T[k];delete T[k]});list.forEach(k=>T[k]=val(k));Object.keys(old).forEach(k=>{if(!(k in T))Object.defineProperty(T,k,{value:old[k],enumerable:false,writable:true,configurable:true})})};
 reb(GEN,GENRES,k=>GEN_SPEC[k][0].slice());reb(CONC,CONCEPTS,k=>CONC_PERS[k].slice());
 if(CFG.rs&&CFG.rs.INT)GENRES.forEach(k=>CFG.rs.INT[k]=GEN_SPEC[k][1]);
 Object.keys(CMATCH).forEach(k=>delete CMATCH[k]); // costumes no longer change sales
 Object.assign(WNAME,{1:'Song Production',2:'Rehearsal',3:'Production',4:'Final Preparation'})})();

// ---- data: migration, song records -------------------------------------------------
const _plMk=mkSong;mkSong=function(role,x={}){const o=_plMk(role,x);o.genre=plG(x.genre||'Dance Pop');o.concept=plC(x.concept||'Cute');o.costume='Custom';return o};
function plMigrate(){if(!S)return;Object.values(S.songs||{}).forEach(o=>{o.genre=plG(o.genre);o.concept=plC(o.concept);if(!o.rel)o.costume='Custom'});
 (S.singles||[]).forEach(x=>{if(x.genre)x.genre=plG(x.genre);if(x.concept)x.concept=plC(x.concept)});if(S.al&&S.al.concept)S.al.concept=plC(S.al.concept);
 if(ui.mf){ui.mf.genre=plG(ui.mf.genre);ui.mf.concept=plC(ui.mf.concept)}plLibBackfill();plCalSync()}
const _plMig=migrate;migrate=function(){const r=_plMig.apply(this,arguments);try{plMigrate()}catch(e){console.error(e)}return r};
const plIn=id=>!!(S.pj&&(id==S.pj.mainId||S.pj.coup.includes(id)));
const plTracks=p=>{const u=cost(p).u;return[p.mainId,...p.coup.filter(i=>u.has(i))]};
const plTracksX=x=>uniq([x.mainId,...(x.types||[]).flatMap(t=>t.songs)]).filter(i=>i&&S.songs[i]);
function plCzSnap(o){try{const d=czMain(o);if(!d){const M=czMembers(o).map(m=>[m.id,czFor(o,m.id)]).filter(x=>x[1]);if(!M.length)return null;return{name:"Individual costumes",mode:"individual",p:czClone(M[0][1]),mem:Object.fromEntries(M.map(([id,p])=>[id,czClone(p)]))}}const z=o.cdz||{},mem={};czMembers(o).forEach(m=>{const mm=(z.mem||{})[m.id];if(mm&&(mm.d||(mm.ov&&Object.keys(mm.ov).length))){const q=czFor(o,m.id);if(q)mem[m.id]=czClone(q)}});return{name:d.name,mode:z.mode||'uniform',p:czClone(d.p),mem}}catch(e){return null}}
function plStamp(o,x,pos,retro){if(!o)return;const f=o.fm;o.lib={rid:x.rid,num:x.num,single:x.title,track:o.id==x.mainId?'title':'coupling',pos,types:(x.types||[]).filter(t=>t.songs.includes(o.id)).map(t=>t.name),day:x.relDay!=null?x.relDay:x.day,sname:o.sname||'Senbatsu',members:(o.slots||[]).filter(Boolean),center:o.center||null,centers:(o.centers||[]).slice(),rows:f?rowsOf(f.sl):[],form:f?f.sl.map(s=>({m:s.m||null,r:s.r,i:s.i,c:!!s.c})):[],cz:plCzSnap(o),genre:o.genre,concept:o.concept};if(retro)o.lib.retro=1}
function plLibBackfill(){(S.singles||[]).forEach(x=>{const T=plTracksX(x);T.forEach((i,k)=>{const o=S.songs[i];if(o&&!o.lib)plStamp(o,x,k+1,1)});if(!x.tracks)x.tracks=T.map((i,k)=>({id:i,title:S.songs[i].title,track:i==x.mainId?'title':'coupling',pos:k+1,genre:S.songs[i].genre,concept:S.songs[i].concept}))})}

// ---- production calendar milestones (existing calendar, no separate clock) -----------
const PL_MS=[['w1',0,'Week 1 — Song Production begins'],['w2',7,'Week 2 — Rehearsal begins'],['cos',null,'Costumes manufactured'],['w3',14,'Week 3 — Production begins'],['w4',21,'Week 4 — Final Preparation begins']];
function plCalSync(){const p=S&&S.pj;if(!p||p.status!='producing'||p.startDay==null||!p.id)return;S.cal=S.cal||[];
 PL_MS.forEach(([k,off,t])=>{if(S.cal.some(e=>e.pid==p.id&&e.type=='prod'&&e.k==k))return;const day=p.startDay+(off==null?CFG.costumeDays:off);S.cal.push({id:'e'+(++S.sid),pid:p.id,type:'prod',k,day,title:`${t} — ${p.title.trim()}`,done:S.day>=day})})}
function plCalTick(){(S.cal||[]).forEach(e=>{if(e.type=='prod'&&!e.done&&S.day>=e.day)e.done=true})}

// ---- Release Day: automatic check & release ----------------------------------------
function plAutoRelease(){const p=S.pj;if(!p||p.status!='producing'||p.releaseDay==null||S.day<p.releaseDay||p.arChk==S.day)return;p.arChk=S.day;
 const pr=readiness(p);if(pr.length){ui.plRel={t:'rel',pr};toast(`Release Day: "${p.title}" was not released — ${pr.length} item(s) missing.`,'err');return}
 doRelease();ui.plRel=ui.mod}
const _plTick=tick;tick=function(){const r=_plTick.apply(this,arguments);try{plCalSync();plCalTick();plAutoRelease()}catch(e){console.error(e)}return r};
const _plAdv=adv;adv=function(){ui.plRel=null;const r=_plAdv.apply(this,arguments);const R=ui.plRel;ui.plRel=null;if(R){const h=R.t=='html'?R.h:relHtml(R);if(ui.mod&&ui.mod!==R){if(ui.mod.t=='html')ui.mod={t:'html',h:h+'<hr>'+ui.mod.h};else ui.mod.extra=h+(ui.mod.extra||'')}else ui.mod=R;render()}return r};

// ---- start / release hooks ---------------------------------------------------------
const _plReqs=reqs;reqs=function(p){const r=_plReqs.apply(this,arguments);if(!p)return r;plTracks(p).forEach(i=>{const o=S.songs[i];if(!o)return;const nm=`"${o.title}" (${i==p.mainId?'main song':'coupling song'})`;
 if(!GENRES.includes(o.genre))r.push(`${nm}: choose a Genre.`);if(!CONCEPTS.includes(o.concept))r.push(`${nm}: choose a Concept.`)});return r};
const _plStart=startSingle;startSingle=function(){const p=S.pj,was=p&&p.status;const r=_plStart.apply(this,arguments);
 if(p&&was=='draft'&&p.status=='producing'){try{(p.ann&&p.ann.tracks||[]).forEach(t=>t.songs.forEach(s=>{const o=S.songs[s.id];if(!o)return;s.genre=o.genre;s.concept=o.concept;const d=czMain(o);s.design=d?d.name:null}));plCalSync()}catch(e){console.error(e)}ui.pled=null;ui.mod={t:'html',h:plAnnounce(p)};render()}return r};
const _plRelease=doRelease;doRelease=function(){const p=S.pj;if(!p||p.status!='producing')return;plMigrate();const order=plTracks(p);order.forEach(i=>{const o=S.songs[i];if(o)o.costume='Custom'});
 const n=S.singles.length;_plRelease.apply(this,arguments);const x=S.singles[n];if(!x)return;
 try{x.tracks=order.map((i,k)=>{const o=S.songs[i];plStamp(o,x,k+1);return{id:i,title:o.title,track:i==x.mainId?'title':'coupling',pos:k+1,genre:o.genre,concept:o.concept}});(S.cal||[]).forEach(e=>{if(e.pid==p.id&&e.type=='prod')e.done=true})}catch(e){console.error(e)}};
const _plTasks=prodTasks;prodTasks=function(p){const T=_plTasks.apply(this,arguments),d=S.day-p.startDay,wp=w=>Math.max(0,Math.min(100,Math.round((d-7*(w-1))/7*100))),add=(w,label,done)=>T.push({w,label,pr:done?100:wp(w),st:done?'Done':(d<7*(w-1)?'Waiting':'In progress')});
 const U=plTracks(p).map(i=>S.songs[i]).filter(Boolean),cd=U.every(o=>!o.cosProd||o.cosProd.done);
 add(3,'Continue song production — recording & mixing',d>=21);add(3,'Continue rehearsals',d>=21);T.push({w:3,label:`Costume manufacturing (${CFG.costumeDays}-day schedule) — ${cd?'completed':'in progress'}`,pr:cd?100:Math.min(100,Math.round(d/CFG.costumeDays*100)),st:cd?'Done':'In progress'});
 add(4,'Final song preparation',d>=28);add(4,'Final rehearsal',d>=28);return T};
// removing a coupling keeps the song in the Song Library (it can be added again later)
rmCoup=function(id){if(guard())return;const p=S.pj,o=S.songs[id];if(!o||!p.coup.includes(id))return;ask(`Remove "${o.title}" from this single? The song stays in the Song Library (unassigned) and can be added again later.`,()=>{p.coup=p.coup.filter(x=>x!=id);p.types.forEach(t=>t.songs=t.songs.filter(x=>x!=id));o.shelf=1;if(ui.psong==id)ui.psong=null;if(ui.pled==id)ui.pled=null;toast(`"${o.title}" removed from the single (kept in the Song Library).`);render()},'Remove')};
// track order is one list: moving a coupling song reorders it on every edition too
const _plPool=poolMove;poolMove=function(id,d){if(guard())return;_plPool.apply(this,arguments);const p=S.pj;p.types.forEach(t=>{const m=t.songs[0];t.songs=[m,...p.coup.filter(i=>t.songs.includes(i)&&i!=m)]})};

// ---- planning actions -------------------------------------------------------------
function plSong(id){ui.psong=id;render();plScroll(id)}
function plScroll(id){try{setTimeout(()=>{const e=document.getElementById('pl-'+id);e&&e.scrollIntoView({block:'start',behavior:UIP.motion=='off'?'auto':'smooth'})},30)}catch(e){}}
function plSet(id,k,v){const o=S.songs[id];if(!o)return;if(lockedSong(id))return toast('Production is already confirmed.','err');if(k=='genre'&&!GENRES.includes(v))return;if(k=='concept'&&!CONCEPTS.includes(v))return;o[k]=v;render()}
function plMakeTitle(id){if(guard())return;const p=S.pj,o=S.songs[id],old=S.songs[p.mainId];if(!o||!p.coup.includes(id))return;
 ask(`Make "${o.title}" the title track? "${old.title}" becomes a coupling song. Each song keeps its own Genre, Concept, Senbatsu and costume.`,()=>{p.coup=p.coup.map(x=>x==id?old.id:x);p.types.forEach(t=>t.songs=t.songs.map(x=>x==id?old.id:x==old.id?id:x));p.mainId=id;o.role='Main';old.role='Coupling';syncSaved();toast(`"${o.title}" is now the title track.`);render()},'Make title track')}
function plAddCoup(cp){if(guard())return;const p=S.pj,n=p.coup.length;addCoup(cp);setTimeout(()=>{if(S.pj&&S.pj.coup.length>n){ui.psong=S.pj.coup[S.pj.coup.length-1];render();plScroll(ui.psong)}},0)}
const plFree=()=>Object.values(S.songs||{}).filter(o=>!o.rel&&!plIn(o.id)&&!(S.al&&(S.al.tracks||[]).includes(o.id)));
function plAddLib(id){if(guard())return;const p=S.pj,o=S.songs[id];if(!o||o.rel||plIn(id))return toast('That song cannot be added.','err');if(p.coup.length>=CFG.maxTypes*(CFG.maxPerType-1))return toast('Coupling song limit reached.','err');
 p.coup.push(id);o.role='Coupling';o.shelf=0;const t=p.types.find(t=>t.songs.length<CFG.maxPerType);if(t)t.songs.push(id);ui.psong=id;ui.mod=null;toast(`"${o.title}" added from the Song Library.`);view='music';render();plScroll(id)}
function plLibDel(id){const o=S.songs[id];if(!o||o.rel||plIn(id)||(S.al&&(S.al.tracks||[]).includes(id)))return toast('Only unassigned, unreleased songs can be deleted.','err');ask(`Delete "${o.title}" from the Song Library? This cannot be undone.`,()=>{delete S.songs[id];ui.mod=null;toast('Song deleted.');render()},'Delete')}
function plFmSave(o){fmSync(o,!fmCheck(o).length);if(S.pj&&o.id==S.pj.mainId)syncSaved()}
function plSaveFm(id){const o=S.songs[id],r=fmCheck(o);if(r.length)return toast(r[0],'err');if(lockedSong(id))return toast('Production is already confirmed.','err');plFmSave(o);toast(`Lineup saved to "${o.title}".`);render()}
function plCenter(id,k,mid){const o=S.songs[id];if(!o)return;if(lockedSong(id))return toast('Production is already confirmed.','err');const f=o.fm,j=f.sl.findIndex(x=>x.m==mid);
 if(j<0){toast('The center must be a member of this song\'s Senbatsu.','err');return render()}if(j!=k){[f.sl[k].m,f.sl[j].m]=[f.sl[j].m,f.sl[k].m];plFmSave(o);toast(`${get(mid).name} is now the center of "${o.title}".`)}render()}
function plAuto(id){const o=S.songs[id];if(!o)return;if(lockedSong(id))return toast('Production is already confirmed.','err');const g=genAuto(o,'pop');if(g.err)return toast(g.err,'err');
 const go=()=>{applyIds(o,g.ids);plFmSave(o);toast(`Senbatsu for "${o.title}" filled by popularity. Adjust positions as you like.`);render()};if(o.fm.sl.some(x=>x.m))ask('Auto-select replaces the whole lineup of this song only. Other songs are not affected.',go,'Replace lineup');else go()}
const _plCzV=V.costume;V.costume=function(){const h=_plCzV.call(V);return(ui.czFrom=='music'&&S.pj?`<div class="c plback"><button class="b p" onclick="ui.czFrom=null;view='music';render()">◀ Back to Single Planning</button><span class="st">Save the design here, then confirm it on the planning page.</span></div>`:'')+h};

// ---- release announcement popup -------------------------------------------------
function plAnnounce(p){const a=p.ann||{tracks:[]},seen=new Set(),L=[];a.tracks.forEach(t=>t.songs.forEach(s=>{if(!seen.has(s.id)){seen.add(s.id);L.push(s)}}));
 return`<h2 class="ht">✦ New single announced ✦</h2><p><b>“${esc(p.title)}”</b> · Single #${p.num}</p>${L.map(s=>`<div class="plann"><span class="tag ${s.role=='main'?'tmain':'tcoup'}">${s.role=='main'?'TITLE TRACK':'COUPLING'}</span> <b>${esc(s.title)}</b> <span class="st">${esc(s.genre||'')} · ${esc(s.concept||'')}${s.design?' · 👗 '+esc(s.design):''}</span><div class="row lnp">${(s.members||[]).map(get).filter(Boolean).map(m=>`<span class="lpi">${ptc(m,30)}${(s.center||[]).includes(m.id)?'<b class="ctrs">★</b>':''}</span>`).join('')}</div><div class="st">${esc(s.sname||'Senbatsu')} · ${(s.members||[]).length} members · rows ${(s.rows||[]).join('-')} · Center: ${(s.center||[]).map(i=>get(i)?.name).filter(Boolean).map(esc).join(', ')||'—'}</div></div>`).join('')}
 <p class="st">Production runs ${CFG.prodDays} days on the calendar: costumes ready ${jd(p.startDay+CFG.costumeDays)} · Release Day ${jd(p.releaseDay)}.</p>`}

// ---- Song Library -----------------------------------------------------------------
SECS.find(x=>x.k=='music').v.splice(1,0,['songlib','Song Library']);SUBLOC.songlib='Recording Studio · Song Library';
function plStatus(o){const p=S.pj;if(o.rel)return{k:'rel',t:'Released',d:o.relDay!=null?jd(o.relDay):''};if(p&&plIn(o.id)){if(p.status=='producing'&&p.startDay!=null){const d=S.day-p.startDay;return{k:'prod',t:`In production · Week ${Math.min(4,Math.floor(d/7)+1)}`,d:`Release Day ${jd(p.releaseDay)}`}}return{k:'plan',t:'Planning',d:''}}if(S.al&&(S.al.tracks||[]).includes(o.id))return{k:'plan',t:'Album planning',d:''};return{k:'free',t:'Unassigned',d:''}}
function plTrackOf(o){if(o.lib)return{track:o.lib.track,pos:o.lib.pos,single:`#${o.lib.num||''} ${o.lib.single}`,types:o.lib.types};const p=S.pj;if(p&&plIn(o.id)){const t=plTracks(p).indexOf(o.id)+1;return{track:o.id==p.mainId?'title':'coupling',pos:t||null,single:`#${p.num} ${p.title||'(untitled single)'}`,types:p.types.filter(t=>t.songs.includes(o.id)).map(t=>t.name)}}return{track:o.role=='Main'?'title':'coupling',pos:null,single:o.rel||'—',types:[]}}
function plForm(o){if(o.lib&&o.lib.form&&o.lib.form.length)return o.lib.form;return(o.fm&&o.fm.sl||[]).map(s=>({m:s.m||null,r:s.r,i:s.i,c:!!s.c}))}
function plSongInfo(id){const o=S.songs[id];if(!o)return;const st=plStatus(o),T=plTrackOf(o),F=plForm(o),nR=F.length?Math.max(...F.map(s=>s.r))+1:0,cen=(o.lib?o.lib.centers:o.centers||[]).map(get).filter(Boolean),pm=cen[0]||get(((o.lib?o.lib.members:o.slots)||[]).find(Boolean))||S.members[0];
 const cz=o.lib&&o.lib.cz?o.lib.cz:(()=>{const d=czMain(o);if(!d)return plCzSnap(o);return{name:d.name,mode:(o.cdz||{}).mode||'uniform',p:d.p,mem:{}}})();
 const rows=Array.from({length:nR},(_,r)=>r).reverse().map(r=>`<div class="plrow"><b>${rowSh(r,nR)} row</b><div>${F.filter(s=>s.r==r).sort((a,b)=>a.i-b.i).map(s=>{const m=get(s.m);return m?`<span class="plm ${s.c?'ctr':''}">${ptc(m,30)}<small>${esc(m.name.split(' ')[0])}</small>${s.c?'<i>★</i>':''}</span>`:'<span class="plm empty">·</span>'}).join('')}</div></div>`).join('');
 const p=S.pj,can=p&&p.status=='draft'&&st.k=='free'&&!o.rel;
 ui.mod={t:'html',h:`<h2 class="ht">♪ ${esc(o.title)}</h2><div class="slinfo"><div class="slfig">${cz&&pm?czDesignThumb({p:(cz.mem&&cz.mem[pm.id])||cz.p},pm,96):''}</div><table class="slt">
 <tr><td>Genre</td><td><b>${esc(o.genre)}</b></td></tr><tr><td>Concept</td><td><b>${esc(o.concept)}</b></td></tr><tr><td>Single</td><td>${esc(T.single)}</td></tr>
 <tr><td>Track type</td><td>${T.track=='title'?'Title Track':'Coupling Song'}</td></tr><tr><td>Tracklist position</td><td>${T.pos||'—'}${T.types&&T.types.length?` · ${T.types.map(esc).join(', ')}`:''}</td></tr>
 <tr><td>Senbatsu</td><td>${esc((o.lib&&o.lib.sname)||o.sname||'Senbatsu')} · ${((o.lib?o.lib.members:o.slots)||[]).filter(Boolean).length} members</td></tr><tr><td>Center</td><td>${cen.map(m=>esc(m.name)).join(', ')||'—'}</td></tr>
 <tr><td>Costume</td><td>${cz?`${esc(cz.name)} · ${cz.mode=='individual'?'individual':'uniform'}`:'—'}</td></tr><tr><td>Production</td><td>${esc(st.t)}${st.d?' · '+esc(st.d):''}</td></tr><tr><td>Release</td><td>${o.rel?`Released ${o.relDay!=null?jd(o.relDay):''}`:'Not released'}</td></tr></table></div>
 <h3>Member positions</h3>${rows?`<div class="plstage">${rows}</div>`:'<p class="st">No Senbatsu yet.</p>'}
 <div class="row">${plIn(o.id)&&p.status=='draft'?`<button class="b p" onclick="ui.mod=null;ui.psong='${o.id}';goView('music')">Open in Single Planning</button>`:''}${can?`<button class="b p" onclick="plAddLib('${o.id}')">Add to the current single</button>`:''}${st.k=='free'?`<button class="b s" onclick="plLibDel('${o.id}')">Delete song</button>`:''}</div>`};render()}
V.songlib=function(){plMigrate();const f=ui.slf=ui.slf||{k:'all',q:''},A=Object.values(S.songs||{}).map(o=>({o,s:plStatus(o),t:plTrackOf(o)}));
 const L=A.filter(x=>(f.k=='all'||x.s.k==f.k)&&(!f.q||(x.o.title+' '+x.o.genre+' '+x.o.concept+' '+x.t.single).toLowerCase().includes(f.q.toLowerCase()))).sort((a,b)=>(b.o.rel?1:0)-(a.o.rel?1:0)||((b.o.relDay??1e9)-(a.o.relDay??1e9))||(a.t.pos||9)-(b.t.pos||9));
 const cnt=k=>A.filter(x=>k=='all'||x.s.k==k).length,chip=(k,n)=>`<button class="b s ${f.k==k?'on':''}" onclick="ui.slf.k='${k}';render()">${n} (${cnt(k)})</button>`;
 return`<h2 class="ht">Song Library</h2><p class="st">Every song with its Genre, Concept, single, track, Senbatsu, Center, positions, costume and status. Released songs keep a snapshot of how they were released.</p>
 <div class="row">${chip('all','All')}${chip('rel','Released')}${chip('prod','In production')}${chip('plan','Planning')}${chip('free','Unassigned')}<input placeholder="Search title, genre, concept, single" value="${esc(f.q)}" onchange="ui.slf.q=this.value;render()"></div>
 <div class="slgrid">${L.map(({o,s,t})=>{const c=get((o.lib?o.lib.center:o.center))||get(((o.lib?o.lib.members:o.slots)||[]).find(Boolean));return`<button class="c slcard" onclick="plSongInfo('${o.id}')">${c?ptc(c,46):'<span class="slph">♪</span>'}<span class="slc"><b>${esc(o.title)}</b><small><span class="tag ${t.track=='title'?'tmain':'tcoup'}">${t.track=='title'?'TITLE':'C/W'}</span> ${esc(t.single)}${t.pos?' · track '+t.pos:''}</small><small>${esc(o.genre)} · ${esc(o.concept)}</small><small class="sls ${s.k}">${esc(s.t)}${s.d?' · '+esc(s.d):''}</small></span></button>`}).join('')||'<p class="st">No songs match.</p>'}</div>`};
