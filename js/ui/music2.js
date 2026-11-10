// =====================================================================================
//  Music update: expanded Genre / Concept / Lyrics libraries, fan music tastes, Song Preference
// -------------------------------------------------------------------------------------
//  · The libraries of music-lib.js extend the existing GENRES / CONCEPTS / LY_THEMES tables (genre
//    skills and stage intensity, concept → member Concept Fit weights and suited personalities).
//    One Genre, one Concept and one Lyrics theme per song. Lyrics have NO Mood (o.lyM is removed).
//  · Every Genre / Concept / Lyrics select opens a searchable library with family filters and a
//    description under each option; the chosen option's description stays visible under the select.
//  · Fan tastes live on the existing fan cohorts (segment.mt): a value per Genre / Concept / Lyrics
//    family plus a few favourite options. New fans get their own profile; tastes drift every month
//    from the songs the group released or performed, the fan's engagement and her Kami Oshi.
//  · Song Preference (0–100, separate from popularity and sales): Genre 20% · Concept 15% ·
//    Lyrics 15% (from the fans, weighted by interest, each fan once) · Member Popularity 20% ·
//    Member Concept Fit 15% · Performance Ability 15% (Vocal vs Dance by Genre), positions weighted
//    (Center > Front > Middle > Back), small variation. Stored once: on release (song.pref,
//    single.prefs) and per Stage song at its first performance (stage.prefs), never recalculated.
// =====================================================================================
const MUI={g:{},c:{},l:{}};MU_G.forEach(x=>MUI.g[x.n]=x);MU_C.forEach(x=>MUI.c[x.n]=x);MU_L.forEach(x=>MUI.l[x.n]=x);
(function(){MU_G.forEach(g=>{if(!GENRES.includes(g.n))GENRES.push(g.n);const sk=g.vw>=.62?['sing','cha']:g.vw<=.42?['dance','sing']:['sing','dance'];if(!GEN_SPEC[g.n])GEN_SPEC[g.n]=[sk,g.int];if(!GEN[g.n])GEN[g.n]=GEN_SPEC[g.n][0].slice();if(CFG.rs&&CFG.rs.INT&&CFG.rs.INT[g.n]==null)CFG.rs.INT[g.n]=GEN_SPEC[g.n][1]});
 MU_C.forEach(c=>{const F=MU_CF[c.f];if(!CONCEPTS.includes(c.n))CONCEPTS.push(c.n);if(!CONC_PERS[c.n])CONC_PERS[c.n]=F[2].slice();if(!CONC[c.n])CONC[c.n]=CONC_PERS[c.n].slice();if(!CF_W[c.n])CF_W[c.n]={...F[1]}});
 MU_L.forEach(l=>{if(!LY_THEMES.includes(l.n))LY_THEMES.push(l.n)})})();
const muFamG=n=>(MUI.g[n]||{f:'pop'}).f,muFamC=n=>(MUI.c[n]||{f:'cute'}).f,muFamL=n=>(MUI.l[n]||{f:'love'}).f;
const muDesc=(k,n)=>((MUI[k]||{})[n]||{}).d||'';
// ---- Lyrics: a theme only (no Mood) ---------------------------------------------------------------------------------------
seFill=function(o){if(!o)return o;if(!LY_THEMES.includes(o.lyT))o.lyT=pick(LY_THEMES);if('lyM'in o)delete o.lyM;return o};
seRand=function(id,part){const o=S.songs[id];if(!o)return;if(lockedSong(id))return toast('Production is already confirmed.','err');const all=part=='all';
 if(all||part=='genre')o.genre=pick(GENRES.filter(g=>g!=o.genre));if(all||part=='concept')o.concept=pick(CONCEPTS.filter(c=>c!=o.concept));if(all||part=='lyrics'||part=='theme')o.lyT=pick(LY_THEMES.filter(x=>x!=o.lyT));delete o.ev;if(ui.mod&&ui.mod.t=='html'&&ui.sesh==id)ui.mod.h=seSheetHtml(id);render()};
{const f=seCreateRow;seCreateRow=function(o,dis){return f.apply(this,arguments).replace(/<label class="st">Lyrics mood <select[\s\S]*?<\/select><\/label>/,'').replace('Lyrics theme <select','Lyrics <select')}}
{const f=seSheetHtml;seSheetHtml=function(id){let h=f.apply(this,arguments);try{const o=S.songs[id];if(!o)return h;const d=(k,n)=>`<br><small class="st">${esc(muDesc(k,n))}</small>`;
 h=h.replace(/<tr><th>Lyrics mood<\/th><td>[\s\S]*?<\/td><\/tr>/,'').replace('<th>Lyrics theme</th>','<th>Lyrics</th>').replace(`<tr><th>Genre</th><td>${esc(o.genre)}</td>`,`<tr><th>Genre</th><td>${esc(o.genre)}${d('g',o.genre)}</td>`).replace(`<tr><th>Concept</th><td>${esc(o.concept)}</td>`,`<tr><th>Concept</th><td>${esc(o.concept)}${d('c',o.concept)}</td>`).replace(`<td>${esc(o.lyT)}</td>`,`<td>${esc(o.lyT)}${d('l',o.lyT)}</td>`);
 if(o.pref)h=h.replace('<p class="st">Concept Compatibility',muPrefCard({title:o.title,genre:o.genre,concept:o.concept,ly:o.lyT,...o.pref},1)+'<p class="st">Concept Compatibility')}catch(e){console.error(e)}return h}}
// ---- library picker: search, family filter, description under every option -----------------------------------------------
function muKindOf(sel){const n=sel.options.length;if(n<40)return null;let c={g:0,c:0,l:0};for(const o of sel.options){if(MUI.g[o.value])c.g++;if(MUI.c[o.value])c.c++;if(MUI.l[o.value])c.l++}const k=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return c[k]>=n*.8?k:null}
{const f=gpOpen;gpOpen=function(sel){const r=f.apply(this,arguments);try{const k=sel&&muKindOf(sel),el=GP.t;if(!k||!el)return r;el.classList.add('mupick');const FAM=k=='g'?MU_GF:k=='c'?Object.fromEntries(Object.entries(MU_CF).map(([a,b])=>[a,b[0]])):MU_LF;
 el.querySelectorAll('.gpo').forEach(b=>{const x=MUI[k][b.dataset.v];if(!x)return;b.dataset.f=x.f;b.insertAdjacentHTML('beforeend',`<small class="mud">${esc(x.d)}</small><em class="muf">${esc(FAM[x.f]||'')}</em>`)});
 const bar=document.createElement('div');bar.className='muchips';bar.innerHTML=`<button type="button" class="on" data-f="">All</button>`+Object.entries(FAM).map(([a,n])=>`<button type="button" data-f="${a}">${esc(n)}</button>`).join('');el.querySelector('.gpl').before(bar);
 bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();bar.querySelectorAll('button').forEach(z=>z.classList.toggle('on',z===b));el.querySelectorAll('.gpo').forEach(o=>{o.hidden=!!b.dataset.f&&o.dataset.f!=b.dataset.f})});
 const t=el.querySelector('.gphd b');if(t)t.textContent={g:'Genre library',c:'Concept library',l:'Lyrics library'}[k]+` (${sel.options.length})`}catch(e){console.error(e)}return r}}
function muDecorate(){try{document.querySelectorAll('select').forEach(sel=>{const k=muKindOf(sel);if(!k)return;const host=sel.closest('label')||sel;let d=host.nextElementSibling;if(!d||!d.classList||!d.classList.contains('mudesc')){d=document.createElement('small');d.className='mudesc';host.after(d)}d.textContent=muDesc(k,sel.value)})}catch(e){}}
{const f=render;render=function(){const r=f.apply(this,arguments);try{muDecorate()}catch(e){}return r}}
// ---- fan music tastes (stored on the existing fan cohorts) ------------------------------------------------------------------
const MU_FAMS={g:Object.keys(MU_GF),c:Object.keys(MU_CF),l:Object.keys(MU_LF)},MU_LIB={g:MU_G,c:MU_C,l:MU_L};
function muTaste(s){if(s.mt)return s.mt;const T={g:{},c:{},l:{},f:{g:[],c:[],l:[]}};['g','c','l'].forEach(k=>{const F=MU_FAMS[k],like=[...F].sort(()=>Math.random()-.5),hi=like.slice(0,2+(Math.random()<.4?1:0)),lo=like.slice(-2);F.forEach(f=>{T[k][f]=Math.round(hi.includes(f)?68+Math.random()*27:lo.includes(f)?8+Math.random()*24:30+Math.random()*38)});
  T.f[k]=MU_LIB[k].filter(x=>hi.includes(x.f)).sort(()=>Math.random()-.5).slice(0,2).map(x=>x.n)});return s.mt=T}
const muVal=(s,k,name)=>{const T=muTaste(s),x=MUI[k][name],f=x?x.f:MU_FAMS[k][0];return Math.min(100,(T[k][f]??50)+(T.f[k].includes(name)?18:0))};
{const f=fbNew;fbNew=function(o){const src=o&&o.mt;const s=f.apply(this,arguments);try{if(s){if(src){const T=JSON.parse(JSON.stringify(src));['g','c','l'].forEach(k=>{for(const a in T[k])T[k][a]=fbCl(T[k][a]+(Math.random()*6-3),3,97)});s.mt=T}else muTaste(s)}}catch(e){}return s}}
// what the group released / performed lately (families the fans were exposed to)
function muExposure(){const E={};(S.groups||[]).forEach(g=>{const L=[];try{gsWith(g.id,()=>{S.singles.filter(x=>S.day-(x.relDay??x.day??-999)<=35).forEach(x=>[x.mainId,...(x.coup||[])].forEach(id=>{const o=S.songs[id];if(o)L.push({o,w:id==x.mainId?1.5:1,ids:new Set((o.slots||[]).filter(Boolean))})}));
  const seen=new Set();thS().pf.filter(p=>S.day-p.day<=30).forEach(p=>{const K=thKeysAll().find(z=>z.key==p.k);if(!K||K.gid!=g.id)return;(thS().snap[p.snap]||[]).forEach(z=>{if(z.k!='song'||seen.has(z.song))return;seen.add(z.song);const o=S.songs[z.song];if(o)L.push({o,w:.6,ids:new Set(z.mem||[])})})})})}catch(e){}E[g.id]=L});return E}
function muEvolve(){const E=muExposure();S.fb.segs.forEach(s=>{const T=muTaste(s),home=s.k!=null&&get(s.k)?gsGid(get(s.k)):(s.gs??(S.groups[0]||{}).id),L=E[home]||[],hit={g:{},c:{},l:{}};
  L.forEach(x=>{const ks=s.k!=null&&x.ids.has(s.k)?1.5:1;[['g',muFamG(x.o.genre),x.o.genre],['c',muFamC(x.o.concept),x.o.concept],['l',muFamL(x.o.lyT),x.o.lyT]].forEach(([k,f,nm])=>{hit[k][f]=1;const cur=T[k][f]??50,enjoy=cur/100*.6+(s.eng||50)/250;const r=Math.random();
   if(r<enjoy)T[k][f]=fbCl(cur+(1+Math.random()*2)*x.w*ks,3,97);else if(r>.9)T[k][f]=fbCl(cur-1-Math.random(),3,97);if(cur>=60&&Math.random()<.04&&!T.f[k].includes(nm)){T.f[k].push(nm);if(T.f[k].length>3)T.f[k].shift()}})});
  ['g','c','l'].forEach(k=>{for(const f in T[k]){let v=T[k][f]+(Math.random()*2.4-1.2);if(!hit[k][f]&&v>72)v-=.4;T[k][f]=+fbCl(v,3,97).toFixed(1)}})})}
{const f=fbMonthly;fbMonthly=function(){const r=f.apply(this,arguments);try{muEvolve()}catch(e){console.error(e)}return r}}
// ---- Song Preference ----------------------------------------------------------------------------------------------------------
const MU_RATE=[[90,'Loved by Fans'],[80,'Very Well Received'],[70,'Well Received'],[60,'Generally Liked'],[50,'Mixed Reception'],[40,'Below Expectations'],[0,'Poor Reception']];
const muRate=v=>(MU_RATE.find(([t])=>v>=t)||MU_RATE.at(-1))[1];
const MU_FN={g:'Genre',c:'Concept',l:'Lyrics',p:'Member popularity',mc:'Concept fit of the members',a:'Performance ability'};
// lineup: [{id, w}] — position weights; cen: Set of Center ids
function muLineSingle(o){const sl=(o.fm&&o.fm.sl||[]).filter(z=>z.m&&get(z.m)),R=sl.length?Math.max(...sl.map(z=>z.r))+1:1;if(sl.length)return{L:sl.map(z=>({id:z.m,w:z.c?2:z.r==0?1.4:z.r>=R-1&&R>1?.8:1})),cen:new Set(sl.filter(z=>z.c).map(z=>z.m))};const ids=(o.slots||[]).filter(id=>id&&get(id)),cen=new Set(o.centers||[]);return{L:ids.map(id=>({id,w:cen.has(id)?2:1})),cen}}
function muLineTheater(z){const mem=(z.mem||[]).filter(id=>get(id)),rows=z.rows||[],cen=new Set([z.center,z.center2].filter(x=>x!=null));let acc=0,ri=0;const rowOf=i=>{let a=0;for(let r=0;r<rows.length;r++){a+=rows[r];if(i<a)return r}return rows.length-1};
 return{L:mem.map((id,i)=>{const r=rows.length?rowOf(i):0;return{id,w:cen.has(id)?2:r==0?1.4:r>=rows.length-1&&rows.length>1?.8:1}}),cen}}
function muPref(o,line,gid){const L=line.L,cen=line.cen,ids=new Set(L.map(z=>z.id));if(!o||!L.length)return null;let W=0,G=0,C=0,Ly=0,nf=0;
 try{((S.fb&&S.fb.segs)||[]).forEach(s=>{if(!(s.n>0))return;const g=typeof fxGrpOk=='function'?fxGrpOk(s,gid):1;if(!g)return;let os=0;for(const j in s.o)if(ids.has(+j))os+=s.o[j];const kin=s.k!=null&&ids.has(s.k);
   const w=s.n*g*(s.ft=='dormant'?.2:1)*(.5+(s.eng||50)/100)*(1+(kin?.8:0)+.4*Math.min(1,os/s.n)+(kin&&cen.has(s.k)?.6:0));W+=w;nf+=s.n*g;G+=w*muVal(s,'g',o.genre);C+=w*muVal(s,'c',o.concept);Ly+=w*muVal(s,'l',o.lyT)})}catch(e){console.error(e)}
 const gf=muFamG(o.genre),base={g:{pop:60,dance:58,idol:60,elec:52,rock:52,ballad:55,rnb:50,hip:47,jazz:44,folk:45,world:44,classic:43}[gf]||50,c:54,l:54},b=Math.min(1,nf/800);
 const g=W?b*G/W+(1-b)*base.g:base.g,c=W?b*C/W+(1-b)*base.c:base.c,l=W?b*Ly/W+(1-b)*base.l:base.l,sw=L.reduce((a,z)=>a+z.w,0),av=fn=>L.reduce((a,z)=>a+z.w*fn(get(z.id)),0)/sw;
 const vw=(MUI.g[o.genre]||{vw:.5}).vw,p=fbCl(15+av(m=>m.pop||0)*.9),mc=fbCl(35+av(m=>seComp(m,o.concept))*.65),a=fbCl(av(m=>vw*(m.sing||0)+(1-vw)*(m.dance||0))*.9+av(m=>((m.cha||0)+(m.variety||0))/2)*.1);
 const raw=.2*g+.15*c+.15*l+.2*p+.15*mc+.15*a,s=Math.round(fbCl(raw+(Math.random()*5-2.5))),F={g,c,l,p,mc,a},ord=Object.entries(F).sort((x,y)=>y[1]-x[1]);
 const why=`Strongest: ${MU_FN[ord[0][0]]} (${Math.round(ord[0][1])}) and ${MU_FN[ord[1][0]]} (${Math.round(ord[1][1])}). Weakest: ${MU_FN[ord.at(-1)[0]]} (${Math.round(ord.at(-1)[1])}).${nf<800?' The fanbase is still small, so general listeners count for part of the taste scores.':''}`;
 return{s,g:Math.round(g),c:Math.round(c),l:Math.round(l),p:Math.round(p),mc:Math.round(mc),a:Math.round(a),vw,n:L.length,day:S.day,why}}
function muPrefCard(x,compact){const col=x.s>=80?'#2f8f62':x.s>=60?'#b28be8':x.s>=50?'#d9a23a':'#c4513a';return`<div class="c mupref"><div class="muph"><b>${esc(x.title||'')}</b><span class="mups" style="color:${col}">${x.s}</span></div><div class="mupb"><i style="width:${x.s}%;background:${col}"></i></div><div class="mupr" style="color:${col}">${muRate(x.s)}</div>
 <div class="mupt"><span class="tag" title="${esc(muDesc('g',x.genre))}">♪ ${esc(x.genre||'')}</span><span class="tag" title="${esc(muDesc('c',x.concept))}">✦ ${esc(x.concept||'')}</span><span class="tag" title="${esc(muDesc('l',x.ly))}">✎ ${esc(x.ly||'')}</span></div>
 <div class="mupf">${[['g','Genre 20%'],['c','Concept 15%'],['l','Lyrics 15%'],['p','Popularity 20%'],['mc','Concept fit 15%'],['a','Ability 15%']].map(([k,n])=>`<span><small>${n}</small><b>${x[k]??'—'}</b></span>`).join('')}</div><p class="st">${esc(x.why||'')}</p>${compact?'':`<details><summary class="st">About this Genre, Concept and Lyrics</summary><p class="st"><b>${esc(x.genre)}</b> — ${esc(muDesc('g',x.genre))}<br><b>${esc(x.concept)}</b> — ${esc(muDesc('c',x.concept))}<br><b>${esc(x.ly)}</b> — ${esc(muDesc('l',x.ly))}</p></details>`}</div>`}
function muPrefList(P,title){if(!P||!P.length)return'';const L=P.slice().sort((a,b)=>b.s-a.s);return`<div class="mupl"><h3>💗 Song Preference <small class="st">ความชื่นชอบของแฟน ๆ ต่อเพลง · how much the fans like each song (not sales or popularity)</small></h3>${title?`<p class="st">${esc(title)}</p>`:''}<div class="muplg">${L.map(x=>muPrefCard(x)).join('')}</div></div>`}
// single / album release: one stored score per new song
function muRelease(x,ids){const P=[];ids.forEach(id=>{const o=S.songs[id];if(!o)return;seFill(o);if(!o.pref){const r=muPref(o,muLineSingle(o),gsAg());if(r)o.pref=r}if(o.pref)P.push({id,title:o.title,genre:o.genre,concept:o.concept,ly:o.lyT,role:id==x.mainId?'Main Song':'Coupling Song',...o.pref})});x.prefs=P;
 try{if(P.length){const av=avg(P.map(p=>p.s));fbBoost(()=>true,fbCl((av-60)/12,-2,3),0)}}catch(e){}return P}
{const f=doRelease;doRelease=function(){const n=S.singles.length;const r=f.apply(this,arguments);try{const x=S.singles[n];if(x&&S.singles.length>n){const ids=uniq([x.mainId,...(x.coup||[]),...((x.types||[]).flatMap(t=>t.songs||[]))]).filter(id=>S.songs[id]&&(S.songs[id].relDay==S.day||!S.songs[id].pref));const P=muRelease(x,ids);if(ui.mod&&ui.mod.t=='html'&&P.length)ui.mod.h+=muPrefList(P)}}catch(e){console.error(e)}return r}}
{const f=alRelease;alRelease=function(){const n=(S.albums||[]).length;const r=f.apply(this,arguments);try{const a=(S.albums||[])[n];if(a){const ids=((a.trk||[]).map(t=>t.id)).filter(id=>S.songs[id]&&!S.songs[id].pref);const P=muRelease(a,ids);if(ui.mod&&ui.mod.t=='html'&&P.length)ui.mod.h+=muPrefList(P)}}catch(e){console.error(e)}return r}}
{const f=showEds;showEds=function(i){f.apply(this,arguments);try{const x=S.singles[i];if(!x||!ui.mod||ui.mod.t!='html')return;const P=x.prefs&&x.prefs.length?x.prefs:null;if(P)ui.mod.h+=muPrefList(P,`Recorded on release day (${jd(x.relDay??x.day)}).`);else{const ids=[x.mainId,...(x.coup||[])].map(id=>S.songs[id]).filter(Boolean);ui.mod.h+=`<div class="c"><h3>Songs</h3>${ids.map(o=>`<div class="fbrow"><b>${esc(o.title)}</b><span>${esc(o.genre)} · ${esc(o.concept)} · ${esc(o.lyT||'—')}</span></div>`).join('')}</div>`}}catch(e){console.error(e)}}}
// Theater: each Stage song gets its score at its first performance (again only if its performers change)
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length;const r=f.apply(this,arguments);try{if(H.pf.length>n0){const rec=H.pf.at(-1),st=thStage(rec.st),gid=(thKeysAll().find(z=>z.key==rec.k)||{}).gid;if(st){st.prefs=st.prefs||{};const out={};let nw=0;
  (H.snap[rec.snap]||[]).forEach(z=>{if(z.k!='song')return;const o=S.songs[z.song];if(!o)return;seFill(o);const sig=[...(z.mem||[])].sort((a,b)=>a-b).join(',')+'|'+(z.center||'')+'|'+o.genre+'|'+o.concept+'|'+o.lyT,cur=st.prefs[z.song];
   if(!cur||cur.sig!=sig){const p=gsWith(gid,()=>muPref(o,muLineTheater(z),gid));if(!p)return;if(cur){st.prefH=st.prefH||[];st.prefH.push({song:z.song,...cur});if(st.prefH.length>60)st.prefH.shift()}st.prefs[z.song]={...p,sig,unit:z.pt=='unit'?(z.unit&&z.unit.name)||'Unit':null,title:o.title,genre:o.genre,concept:o.concept,ly:o.lyT};nw++}out[z.song]=st.prefs[z.song].s});
  rec.prefs=out;const v=Object.values(out);if(v.length)resNote(`<div class="c thres"><b>💗 Song Preference</b> <span class="st">average ${Math.round(avg(v))} · best ${Math.max(...v)}${nw?` · ${nw} song(s) scored for the first time`:''} — see the performance summary</span></div>`)}}}catch(e){console.error(e)}return r}}
{const f=thOpenPerf;thOpenPerf=function(id){f.apply(this,arguments);try{const p=thS().pf.find(z=>z.id==id);if(!p||!p.prefs||!ui.mod||ui.mod.t!='html'||ui.mod.h.includes('class="mupl"'))return;const st=thStage(p.st),P=[];
 (thS().snap[p.snap]||[]).forEach(z=>{if(z.k!='song'||p.prefs[z.song]==null)return;const o=S.songs[z.song]||{},cur=st&&st.prefs&&st.prefs[z.song],old=st&&(st.prefH||[]).find(h=>h.song==z.song&&h.s==p.prefs[z.song]),d=cur&&cur.s==p.prefs[z.song]?cur:old;P.push(d?{...d,title:(d.title||o.title)+(d.unit?` · ${d.unit}`:'')}:{title:z.title||o.title,genre:o.genre,concept:o.concept,ly:o.lyT,s:p.prefs[z.song],why:''})});
 if(P.length){ui.mod.h+=muPrefList(P,'Each song is scored with the members who actually perform it (Unit songs: the Unit only). A score is kept from the song\'s first performance.');render()}}catch(e){console.error(e)}}}
// ---- old saves: every song keeps its data; missing Lyrics get a safe default; Mood is dropped ---------------------------------
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{(S.groups||[{id:null}]).forEach(g=>{try{gsWith(g.id,()=>Object.values(S.songs||{}).forEach(seFill))}catch(e){Object.values(S.songs||{}).forEach(seFill)}});if(S.fb&&S.fb.segs)S.fb.segs.forEach(muTaste)}catch(e){console.error(e)}return r}}
{const f=fbInit;fbInit=function(){const r=f.apply(this,arguments);try{S.fb.segs.forEach(muTaste)}catch(e){}return r}}
