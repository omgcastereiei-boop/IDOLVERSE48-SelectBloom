// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Stage editor: "Add songs" menu like the concert one
// -------------------------------------------------------------------------------------
//  The long Song Library list under the setlist is replaced by an "+ Add songs" button that opens a picker
//  organised like the concert's: 💿 Singles (each single with its tracks), 🎭 Stages (each Stage with its songs),
//  🎵 Other songs (album songs, Theater originals…), collapsible, with a search box. Random songs and New original
//  song stay next to the button. Replacing unavailable songs keeps its own list.
// =====================================================================================
const TAP_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const tapOpen=k=>!(ui.tapz||{})[k];
function tapTog(el,k){const Z=ui.tapz=ui.tapz||{};if(el.open)delete Z[k];else Z[k]=1}
// songs of a group for Stage s: its own group uses the theater's available songs; another group offers its released songs
// and debuted Stage songs, which are added as Theater versions (copies that keep their original: song.xFrom)
function tapData(s,gid){const K=thK(s.k),own=K?K.gid:null;gid=gid??own;const run=f=>(typeof gsWith=='function'&&gid!=null&&typeof gsAg=='function'&&gid!=gsAg())?gsWith(gid,f):f();
 return run(()=>{const pool=gid==own?thAvail(s.k):Object.values(S.songs||{}).filter(o=>o&&!o.xFrom&&(o.rel||o.relDay!=null||(o.th&&o.th.deb!=null)));const A=new Map(pool.map(o=>[o.id,o])),used=new Set();
  const sing=(S.singles||[]).slice().sort((a,b)=>(b.relDay??b.day??0)-(a.relDay??a.day??0)).map(x=>{const ids=[x.mainId,...(x.coup||[]),...((x.tracks||[]).map(t=>t.id))].filter((id,i,L)=>id&&L.indexOf(id)==i);
   const L=ids.map(id=>A.get(id)).filter(Boolean);return L.length?{h:x.title||(S.songs[x.mainId]||{}).title||'Single',sub:[x.no?ordN(x.no)+' Single':'',(x.relDay??x.day)!=null?jd(x.relDay??x.day):''].filter(Boolean).join(' · '),L,role:id=>id==x.mainId?TAP_T('Title track','เพลงหลัก'):TAP_T('Coupling','เพลงรอง')}:null}).filter(Boolean);
  sing.forEach(b=>b.L.forEach(o=>used.add(o.id)));
  const keys=new Set(thKeysAll().filter(k=>k.gid==gid).map(k=>k.key));
  const stg=Object.values(thS().st||{}).filter(t=>keys.has(t.k)&&t.id!=s.id&&!String(t.k).startsWith('sx')&&(t.no||t.status=='active'||t.status=='retired')).sort((a,b)=>(b.debut??0)-(a.debut??0)).map(t=>{const L=[...new Set(thAll(t).map(it=>it.song))].map(id=>A.get(id)).filter(Boolean);
   return L.length?{h:`${thLabel(t.k)} ${t.no?ordN(t.no)+' Stage':'Stage'} “${t.name}”`,sub:t.debut!=null?jd(t.debut):'',L}:null}).filter(Boolean);
  stg.forEach(b=>b.L.forEach(o=>used.add(o.id)));
  const oth=[...A.values()].filter(o=>!used.has(o.id)).sort((a,b)=>thSongPop(b)-thSongPop(a));return{sing,stg,oth}})}
function tapHtml(){const s=thEd();if(!s)return'';const K=thK(s.k),own=K?K.gid:null,G=(S.groups||[]).filter(g=>!g.dis);if(!G.some(g=>g.id==ui.tapg))ui.tapg=own;const gid=ui.tapg,xg=gid!=own;
 const q=String(ui.tapq||'').toLowerCase(),inSet=thAll(s).map(i=>S.songs[i.song]).filter(Boolean),have=new Set(inSet.map(o=>o.id)),haveX=new Set(inSet.filter(o=>o.xFrom).map(o=>o.xFrom.gid+':'+o.xFrom.id)),D=tapData(s,gid),ok=o=>!q||String(o.title).toLowerCase().includes(q),full=thAll(s).length>=TH_MAXS;
 const row=(o,role)=>{const n=xg?haveX.has(gid+':'+o.id):have.has(o.id);return`<div class="row ccpki"><div style="flex:1;min-width:0"><b>${esc(o.title)}</b><small class="st">${esc(role||thCat(o))}${o.genre?' · '+esc(o.genre):''}${o.concept?' · '+esc(o.concept):''} · ≈${thDur(o)}</small></div>${n?`<span class="tag">${TAP_T('In setlist','อยู่ในเซ็ตลิสต์แล้ว')}</span>`:`<button class="b s p" ${full?'disabled':''} onclick="${xg?`tapAddX(${gid},'${o.id}')`:`tapAdd('${o.id}')`}">+ Add</button>`}</div>`};
 const blk=(b,pre)=>{const L=b.L.filter(ok);if(!L.length)return'';const k=gid+pre+b.h;return`<details ${tapOpen(k)?'open':''} class="ccpkb" ontoggle="tapTog(this,'${esc(k).replace(/'/g,'')}')"><summary><b>${esc(b.h)}</b> <small class="st">${esc(b.sub||'')}</small></summary>${L.map(o=>row(o,b.role?b.role(o.id):'')).join('')}</details>`};
 const sec=(id,title,body,n)=>{const k=gid+'sec'+id;return n?`<details ${tapOpen(k)?'open':''} class="ccpks" ontoggle="tapTog(this,'${k}')"><summary><b>${title}</b> <small class="st">${n}</small></summary>${body}</details>`:''};
 const si=D.sing.map(b=>blk(b,'s')).filter(Boolean),st=D.stg.map(b=>blk(b,'t')).filter(Boolean),ot=D.oth.filter(ok);
 return`<h2 class="ht">${TAP_T('Add songs','เพิ่มเพลง')}</h2><p class="st">“${esc(s.name)}” · ${thAll(s).length}/${TH_MAXS} ${TAP_T('songs','เพลง')}${full?' · '+TAP_T('the setlist is full','เซ็ตลิสต์เต็มแล้ว'):''}</p>
 ${G.length>1?`<div class="row cctabs">${G.map(g=>`<button class="b s ${g.id==gid?'p':''}" onclick="ui.tapg=${g.id};ui.mod.h=tapHtml();render()">${esc(g.name)}</button>`).join('')}</div>`:''}
 ${xg?`<p class="st">${TAP_T(`Songs of ${esc((grp(gid)||{}).name||'')} are added as Theater versions for this Stage (the original stays with its group).`,`เพลงของวง ${esc((grp(gid)||{}).name||'')} จะเพิ่มเป็นเวอร์ชันเธียเตอร์ของสเตจนี้ (ต้นฉบับยังเป็นของวงเดิม)`)}</p>`:''}
 <input class="ccpkq" placeholder="${TAP_T('Search songs','ค้นหาเพลง')}" value="${esc(ui.tapq||'')}" onchange="ui.tapq=this.value;ui.mod.h=tapHtml();render()">
 <div class="ccpk">${sec('single','💿 '+TAP_T('Singles','ซิงเกิล'),si.join(''),si.length?`${si.length} ${TAP_T('single(s)','ซิงเกิล')}`:'')}${sec('stage','🎭 '+TAP_T('Stages','สเตจ'),st.join(''),st.length?`${st.length} ${TAP_T('stage(s)','สเตจ')}`:'')}${sec('other','🎵 '+TAP_T('Other songs','เพลงอื่น ๆ'),ot.map(o=>row(o)).join(''),ot.length?`${ot.length} ${TAP_T('song(s)','เพลง')}`:'')}
 ${!si.length&&!st.length&&!ot.length?`<p class="st">${TAP_T('No songs match.','ไม่พบเพลง')}</p>`:''}</div>
 <div class="row"><button class="b" onclick="ui.mod=null;render()">${TAP_T('Done','เสร็จ')}</button></div>`}
// a song of another group: its Theater version in this Stage's group, then added like any song
function tapAddX(gid,id){const s=thEd();if(!s)return;const K=thK(s.k),own=K?K.gid:null;if(thAll(s).length>=TH_MAXS)return toast(TAP_T(`A Stage can have at most ${TH_MAXS} songs.`,`สเตจมีได้สูงสุด ${TH_MAXS} เพลง`),'err');
 const run=f=>(own!=null&&typeof gsAg=='function'&&own!=gsAg())?gsWith(own,f):f();let n=null;try{n=run(()=>thXgSong(+gid,id,s.k))}catch(e){console.error(e)}if(!n)return toast(TAP_T('That song could not be added.','เพิ่มเพลงนี้ไม่ได้'),'err');tapAdd(n.id)}
function tapPick(){if(!thEd())return;ui.mod={t:'html',h:tapHtml(),tap:1};render()}
function tapAdd(id){const y=(document.querySelector('.mod .ccpk')||{}).scrollTop||0;thSongAdd(id);if(ui.mod&&ui.mod.tap){ui.mod.h=tapHtml();render();try{const el=document.querySelector('.mod .ccpk');if(el)el.scrollTop=y}catch(e){}}}
// the Stage editor: compact card with the button, Random and New original song (the replacement list stays as it was)
{const f=thSongsTab;thSongsTab=function(s,tr,lk){const h=f.apply(this,arguments);try{const mk='<div class="c"><h3>Add songs from the Song Library</h3>',i=h.lastIndexOf(mk);if(i<0)return h;const end=h.lastIndexOf('</div>');if(end<i)return h;
  const card=`<div class="c tapc"><h3>${TAP_T('Add songs','เพิ่มเพลง')}</h3><p class="st">${TAP_T('Choose songs by Single, by Stage or from the other songs of the group.','เลือกเพลงตามซิงเกิล ตามสเตจ หรือจากเพลงอื่น ๆ ของวง')}</p><div class="row"><button class="b p" onclick="tapPick()">＋ ${TAP_T('Add songs','เพิ่มเพลง')}</button><label class="st">${TAP_T('Random','สุ่ม')} <select id="thrn">${[1,3,5,8,12].map(n=>`<option>${n}</option>`).join('')}</select></label><button class="b s" onclick="thSongRand($('#thrn').value)">🎲 ${TAP_T('Random songs','สุ่มเพลง')}</button>${tr||tapIsSp(s.k)?'':`<button class="b s p" onclick="thSongNew()">✦ ${TAP_T('New original song','สร้างเพลงใหม่')}</button>`}</div>${tr?`<p class="st">${TAP_T('Trainee Theater uses songs from the Song Library; new songs are created by Single Production or Team Theater.','เธียเตอร์เด็กฝึกใช้เพลงจากคลังเพลง เพลงใหม่สร้างจากการทำซิงเกิลหรือเธียเตอร์ของทีม')}</p>`:''}</div>`;
  return h.slice(0,i)+card+h.slice(end)}catch(e){console.error(e);return h}}}
// ---- Special Stages use songs that already exist: no new songs are created there ------------------------------------------------
const tapIsSp=key=>{try{const K=thK(key);return!!K&&K.kind=='sp'}catch(e){return false}};
{const f=thSongNew;thSongNew=function(){if(tapIsSp(thCur()))return toast(TAP_T('Special Stages use existing songs only. New songs are created in Team Stages or Single Production.','สเปเชียลสเตจใช้ได้เฉพาะเพลงที่มีอยู่แล้ว เพลงใหม่สร้างได้ที่สเตจของทีมหรือการทำซิงเกิล'),'err');return f.apply(this,arguments)}}
{const f=thSongMake2;thSongMake2=function(){if(tapIsSp(thCur()))return;return f.apply(this,arguments)}}
{const f=thTimeline;thTimeline=function(s){const h=f.apply(this,arguments);try{if(s&&tapIsSp(s.k))return h.replace(/<button class="b p" onclick="thSongNew\(\)">✦ Add New Song<\/button><span class="st">[^<]*<\/span>/,`<span class="st">${TAP_T('Special Stages use existing songs only: add them with “Add songs” below.','สเปเชียลสเตจใช้ได้เฉพาะเพลงที่มีอยู่แล้ว: เพิ่มเพลงด้วยปุ่ม “เพิ่มเพลง” ด้านล่าง')}</span>`)}catch(e){console.error(e)}return h}}
// Special Stage Encore: no new songs either
{const f=thEncHtml;thEncHtml=function(s){const h=f.apply(this,arguments);try{if(s&&tapIsSp(s.k))return h.replace(/<button[^>]*onclick="thSongNew\(1\)"[^>]*>[^<]*<\/button>/g,'')}catch(e){console.error(e)}return h}}
// ---- schedule grid: slots taken by another Stage of the same theater are shown with its name ---------------------------------
{const f=thWeekGrid;thWeekGrid=function(key){let h=f.apply(this,arguments);try{h=h.replace(/<button class="thsl2 no([^"]*)" title="The theater is booked by ([^"]+)\."([^>]*)>([^<]*)<\/button>/g,(a,c,who,rest,l)=>{const sh=String(who).replace(/^Team\s+/,'').replace(/&amp;/g,'&').slice(0,4);return`<button class="thsl2 no tapoth${c}" title="${TAP_T('Booked by','จองโดย')} ${who}"${rest}>${esc(sh)}</button>`});
 if(h.includes('tapoth'))h=h.replace('<div class="thwg">',`<p class="st"><span class="thsl2 no tapoth">W</span> ${TAP_T('= taken by another Stage of this theater (its name is shown). Special Stages cannot be booked on those slots.','= รอบของสเตจอื่นในเธียเตอร์นี้ (แสดงชื่อ) สเปเชียลสเตจจองทับรอบนั้นไม่ได้')}</p><div class="thwg">`)}catch(e){console.error(e)}return h}}
// ---- Add-song pickers (concert + Stage): jump to Singles / Stages / Other songs, and stay in place after "+ Add" -------------
const PK_SECS=[['💿',TAP_T('Singles','ซิงเกิล')],['🎭',TAP_T('Stages','สเตจ')],['🎵',TAP_T('Other songs','เพลงอื่น ๆ')]];
function pkJumpRow(h){const have=PK_SECS.filter(([e])=>h.includes(`<summary><b>${e} `));if(have.length<2)return'';return`<div class="row pkjump">${have.map(([e,n])=>`<button class="b s" onclick="pkJump('${e}')">${e} ${esc(n)}</button>`).join('')}</div>`}
function pkJump(e){const D=[...document.querySelectorAll('.mod details.ccpks')].find(d=>{const s=d.querySelector('summary');return s&&s.textContent.trim().startsWith(e)});if(!D)return;D.open=true;try{D.scrollIntoView({block:'start',behavior:'smooth'})}catch(x){D.scrollIntoView()}}
const pkWithJump=h=>{try{const i=h.indexOf('<input class="ccpkq"');if(i<0)return h;return h.slice(0,i)+pkJumpRow(h)+h.slice(i)}catch(e){return h}};
{const f=ccPickHtml;ccPickHtml=function(){return pkWithJump(f.apply(this,arguments))}}
{const f=tapHtml;tapHtml=function(){return pkWithJump(f.apply(this,arguments))}}
const pkDlg=()=>document.querySelector('.mod [role=dialog]');
const pkL=()=>document.querySelector('.mod .ccpk');
function pkKeep(fn){return function(){const d=pkDlg(),y=d?d.scrollTop:0,l=pkL(),ly=l?l.scrollTop:0,w=window.scrollY;const r=fn.apply(this,arguments);const put=()=>{const d2=pkDlg(),l2=pkL();if(d2)d2.scrollTop=y;if(l2)l2.scrollTop=ly};try{put();requestAnimationFrame(put);window.scrollTo(0,w)}catch(e){}return r}}
ccPickAdd=pkKeep(ccPickAdd);ccPickAddSt=pkKeep(ccPickAddSt);tapAdd=pkKeep(tapAdd);tapAddX=pkKeep(tapAddX);
// ---- Concert Encore mode (like the Stage editor): while it is on, every added song goes to the Encore ---------------------------
{const f=ccAddSong;ccAddSong=function(){const C=ccCur(),s=C&&C.sets[ui.ccs],before=s?new Set(s.items.map(x=>x.id)):null;const r=f.apply(this,arguments);try{if(s&&s.encMode){s.items.forEach(x=>{if(!before.has(x.id)&&x.k=='song')x.enc=1});ccEncSort(s)}}catch(e){console.error(e)}return r}}
function ccEncMode(on){const C=ccCur(),s=C&&C.sets[ui.ccs];if(!ccEdit(C)||!s)return;s.encMode=on?1:0;toast(on?TAP_T('Encore on: songs you add now go to the Encore.','เปิดอังกอร์: เพลงที่เพิ่มต่อจากนี้จะเข้าอังกอร์'):TAP_T('Encore off: songs you add go to the main setlist.','ปิดอังกอร์: เพลงที่เพิ่มจะเข้าเซ็ตลิสต์หลัก'));render()}
{const f=ccSetHtml;ccSetHtml=function(C){let h=f.apply(this,arguments);try{const s=C&&C.sets[ui.ccs];if(s&&ccEdit(C)&&h.includes('<h3>Setlist</h3>')){const n=s.items.filter(x=>x.k=='song'&&x.enc).length;
  h=h.replace('<h3>Setlist</h3>',`<div class="row ccencm"><h3 style="margin:0">Setlist</h3><span style="flex:1"></span><span class="st">${TAP_T('Encore','อังกอร์')} ${n}</span><button class="b s ${s.encMode?'p':''}" onclick="ccEncMode(1)">${TAP_T('Encore on','เปิดอังกอร์')}</button><button class="b s ${s.encMode?'':'p'}" onclick="ccEncMode(0)">${TAP_T('Encore off','ปิดอังกอร์')}</button></div>${s.encMode?`<p class="st">${TAP_T('Encore is on: songs added now (Add songs) are placed in the Encore.','เปิดอังกอร์อยู่: เพลงที่เพิ่ม (Add songs) ตอนนี้จะอยู่ในอังกอร์')}</p>`:''}`)}}catch(e){console.error(e)}return h}}
