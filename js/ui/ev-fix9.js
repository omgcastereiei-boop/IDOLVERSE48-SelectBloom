// =====================================================================================
//  IDOLVERSE48: Select Bloom! — release date, event songs / Centers / costumes
// -------------------------------------------------------------------------------------
//  1. Single in production: the release date is chosen on a calendar (any day from tomorrow),
//     instead of "reschedule by 7 / 14 / 21 / 28 days".
//  2. External Events song picker like the Concert one: a tab per group, then Singles / Stages /
//     other songs (collapsed sections stay collapsed).
//  3. Each event song has 1 or 2 Centers. When a song is added, its original Center(s) are used
//     first (if they take part in the event), then the original positions.
//  4. Event costume: every member wears her latest single costume (like the Roadshow), at every
//     External Event and music program — the costume picker is gone.
//  5. Member cards in "copy costume" pickers: the "Has a costume" label wraps inside the card.
// =====================================================================================
// ---- 1. release date ----------------------------------------------------------------------------------------------------------
function relMoveTo(v){const p=S.pj;if(!p||p.status!='producing'||p.releaseDay==null)return;const d=dateDay(new Date(v+'T00:00:00'));if(!Number.isFinite(d))return render();
 if(d<=S.day){toast(`Choose a day after today (${jd(S.day)}).`,'err');return render()}if(d==p.releaseDay)return;
 const go=()=>{const old=p.releaseDay,dd=d-old;p.releaseDay=d;(S.cal||[]).forEach(e=>{if(e.pid==p.id&&!e.done&&(e.type=='release'||e.type=='concert')){e.day=d;if(e.day2!=null)e.day2+=dd}});
  try{if(hsLegacy(p))scheduleHS({base:p.releaseDay,members:singleMembersP(p),title:p.title.trim(),pid:p.id});else if(hsOn(p))hsSched2(p,null)}catch(e){console.error(e)}
  if(S.prod)S.prod.left=Math.max(0,d-S.day);ui.mod=null;toast(`Release date set to ${jd(d)}. Completed work is kept.`);render()};
 let C=[];try{C=typeof seRelConf=='function'?seRelConf(p,d):[]}catch(e){}
 if(C.length)ask(`Members are busy on ${jd(d)}:\n${C.slice(0,6).join('\n')}\nMove the release there anyway?`,go,'Move release');else go()}
const relDateIn=()=>{const p=S.pj;if(!p||p.releaseDay==null)return'';return`<label class="st">Release date <input type="date" min="${thDateStr(S.day+1)}" value="${thDateStr(p.releaseDay)}" onchange="relMoveTo(this.value)"></label>`};
const REL_RX=/<label class="st">Reschedule by <select id="pdays2?">[\s\S]*?<\/select><\/label><button class="b [ps]" onclick="postpone\(\$\('#pdays2?'\)\.value\)">Reschedule release<\/button>/;
{const f=relHtml;relHtml=function(){const h=f.apply(this,arguments);try{return h.replace(REL_RX,relDateIn())}catch(e){return h}}}
{const f=prodPanel;prodPanel=function(){const h=f.apply(this,arguments);try{return h.replace(REL_RX,relDateIn())}catch(e){return h}}}
// ---- 2. song picker by group (Singles / Stages / other songs) --------------------------------------------------------------------
spkPanel=function(t){if(!spkOn(t))return'';const P=ui.spk;let D;try{D=ccPickData()}catch(e){console.error(e);return''}
 const G=S.groups.filter(g=>!g.dis);if(!G.some(g=>g.id==P.g))P.g=(G.find(g=>g.id==gsAg())||G[0]||{}).id;const g=P.g,q=(P.q||'').toLowerCase(),have=new Set(spkHave(t));
 const ok=x=>x.gid==g&&(!q||String(x.o.title).toLowerCase().includes(q)),gid0=b=>b.L[0]&&b.L[0].gid;
 const sing=(D.single||[]).filter(b=>gid0(b)==g).map(b=>({...b,L:b.L.filter(ok)})).filter(b=>b.L.length),stg=(D.stage||[]).filter(b=>gid0(b)==g).map(b=>({...b,L:b.L.filter(ok)})).filter(b=>b.L.length);
 const used=new Set([...(D.single||[]),...(D.stage||[])].flatMap(b=>b.L.map(x=>x.gid+':'+x.o.id))),oth=((D.grp||[]).find(b=>gid0(b)==g)||{L:[]}).L.filter(x=>ok(x)&&!used.has(x.gid+':'+x.o.id));
 const row=x=>{const k=x.gid+':'+x.o.id,on=have.has(k);return`<div class="row ccpki"><div style="flex:1;min-width:0"><b>${esc(x.o.title)}</b><small class="st">${esc(x.o.role||(typeof thCat=='function'?thCat(x.o):''))}${x.o.genre?' · '+esc(x.o.genre):''}</small></div>${on?'<span class="tag">In setlist</span>':`<button class="b s p" onclick="spkAdd('${t}','${k}')">+ Add</button>`}</div>`};
 const blk=(b,pre)=>{const k=ccPkKey('spk'+pre+g+b.h);return`<details ${ccPkOpen(k)?'open':''} class="ccpkb" ontoggle="ccPkTog(this,'${k}')"><summary><b>${esc(b.h)}</b> <small class="st">${esc((b.sub||'').replace(/^[^·]*· /,G.length>1?'':'$&'))}</small></summary>${b.L.map(row).join('')}</details>`};
 const sec=(id,title,n,body)=>{const k=ccPkKey('spksec'+g+id);return parseInt(n)>0?`<details ${ccPkOpen(k)?'open':''} class="ccpks" ontoggle="ccPkTog(this,'${k}')"><summary><b>${title}</b> <small class="st">${n}</small></summary>${body}</details>`:''};
 return`<div class="c spk">${G.length>1?`<div class="row cctabs">${G.map(x=>`<button class="b s ${x.id==g?'p':''}" onclick="ui.spk.g=${x.id};render()">${esc(x.name)}</button>`).join('')}</div>`:''}<input class="ccpkq" placeholder="Search songs" value="${esc(P.q||'')}" onchange="ui.spk.q=this.value;render()">
 <div class="ccpk">${sec('single','💿 Singles',`${sing.length} single(s)`,sing.map(b=>blk(b,'s')).join(''))}${sec('stage','🎭 Stages',`${stg.length} stage(s)`,stg.map(b=>blk(b,'t')).join(''))}${sec('other','🎵 Other songs',`${oth.length} song(s)`,oth.map(row).join(''))}${!sing.length&&!stg.length&&!oth.length?'<p class="st">No songs match.</p>':''}</div></div>`};
// ---- 3. Centers: 1 or 2, the original Center(s) first ------------------------------------------------------------------------
const xeCens=z=>[z.center,z.c2].filter(x=>x!=null);
function xeOrigOrder(gid,song,ids){let o=null;try{o=(gsCtx(gid,'songs')||{})[song]}catch(e){}const cen=[],ord=[];if(o){(o.centers&&o.centers.length?o.centers:o.center!=null?[o.center]:[]).forEach(id=>{if(ids.includes(id)&&!cen.includes(id))cen.push(id)});
  try{const f=o.fm;if(f&&f.sl)slotOrder(f).forEach(k=>{const m=f.sl[k].m;if(m!=null&&ids.includes(m)&&!ord.includes(m))ord.push(m)});else(o.slots||[]).forEach(m=>{if(m!=null&&ids.includes(m)&&!ord.includes(m))ord.push(m)})}catch(e){}}
 const rest=ids.filter(id=>!ord.includes(id)).sort((a,b)=>((get(b)||{}).pop||0)-((get(a)||{}).pop||0));const O=[...cen,...ord.filter(x=>!cen.includes(x)),...rest.filter(x=>!cen.includes(x))];
 const nOrig=o&&o.centers?Math.min(2,o.centers.length):1;return{O,cen:cen.length?cen.slice(0,2):(O.length>2?O.slice(0,Math.min(nOrig,2)):[])}}
xeSongAdd2=function(gid,song){const r=xeR0();if(!r)return;const L=xeL(r),max=r.songs||8;if(L.length>=max)return toast(`This event asks for ${max} song(s).`,'err');if(L.some(z=>z.song==song&&z.gid==gid))return;
 const t=((gsCtx(gid,'songs')||{})[song]||{}).title||'?',X=xeOrigOrder(gid,song,xeM(r).slice());L.push({gid,song,title:t,center:X.cen[0]??null,c2:X.cen[1]??null,o:X.O});xeTouch(r);toast(`Added “${t}”.`);render()};
function xeCenFix(z){const C=xeCens(z);z.o=[...C,...z.o.filter(x=>!C.includes(x))]}
xeSongCen=function(i,v){xeCen1(i,v)};
function xeCenN(i,n){const r=xeR0();if(!r)return;const z=xeL(r)[i];if(!z)return;n=+n;if(n==0){z.center=null;z.c2=null}else if(n==1){if(z.center==null)z.center=z.o[0]??null;z.c2=null}else{if(z.center==null)z.center=z.o[0]??null;if(z.c2==null)z.c2=z.o.find(x=>x!=z.center)??null}xeCenFix(z);xeTouch(r);render()}
function xeCen2(i,v){const r=xeR0();if(!r)return;const z=xeL(r)[i];if(!z)return;const id=v===''?null:+v;if(id!=null&&id==z.center)return render();z.c2=id;xeCenFix(z);xeTouch(r);render()}
function xeCen1(i,v){const r=xeR0();if(!r)return;const z=xeL(r)[i];if(!z)return;const id=v===''?null:+v;if(id!=null&&id==z.c2)z.c2=z.center;z.center=id;if(z.center==null)z.c2=null;xeCenFix(z);xeTouch(r);render()}
// tap a face: she becomes a Center (with 2 Centers, she replaces the second one)
function xeFace(i,id){const r=xeR0();if(!r)return;const z=xeL(r)[i];if(!z)return;if(xeCens(z).includes(id))return;if(z.c2!=null)z.c2=id;else z.center=id;xeCenFix(z);xeTouch(r);render()}
{const f=xeTouch;xeTouch=function(r){const out=f.apply(this,arguments);try{if(r&&r.status=='accepted'){const sel=r.sel||[];(r.set||[]).forEach(z=>{if(z.c2!=null&&!sel.includes(z.c2))z.c2=null})}}catch(e){}return out}}
xeSetEdHtml=function(r){const L=xeL(r),max=r.songs||0,acc=r.status=='accepted';
 const opt=(z,cur,skip)=>z.o.filter(id=>id!=skip).map(id=>`<option value="${id}" ${cur==id?'selected':''}>${esc((get(id)||{}).name||'')}</option>`).join('');
 return`<div class="c xeset"><h3>Setlist (${L.length}/${max} song(s))</h3><p class="st">Songs of every group can be used (sister and main groups). Each song has 1 or 2 Centers — the song's original Center comes first. Tap a face to make her a Center; ◀ ▶ change the positions. Saved for this event only — the songs' original Senbatsu, Center and formation never change.${acc?` You can change it until ${jd(r.day-1)}.`:''}</p>
 ${L.map((z,i)=>{const C=xeCens(z),n=C.length;return`<div class="c xesong"><div class="row"><b>${i+1}. ${esc(z.title)}</b><span class="st">${esc((grp(z.gid)||{}).name||'')}</span><button class="b s" onclick="xeSongMv(${i},-1)">▲</button><button class="b s" onclick="xeSongMv(${i},1)">▼</button><button class="b s" onclick="xeSongRm(${i})">✕</button></div>
  <div class="row xecen"><label class="st">Centers <select onchange="xeCenN(${i},this.value)"><option value="0" ${n==0?'selected':''}>No Center</option><option value="1" ${n==1?'selected':''}>1</option>${z.o.length>=2?`<option value="2" ${n==2?'selected':''}>2</option>`:''}</select></label>
  ${n>=1?`<select aria-label="Center" onchange="xeCen1(${i},this.value)">${opt(z,z.center)}</select>`:''}${n>=2?`<select aria-label="Second Center" onchange="xeCen2(${i},this.value)">${opt(z,z.c2,z.center)}</select>`:''}</div>
  <div class="xepos">${z.o.map((id,k)=>{const m=get(id),c=C.includes(id);return m?`<span class="xep ${c?'cen':''}"><button class="xepf" title="Make ${esc(m.name)} a Center" onclick="xeFace(${i},${id})">${ptc(m,34)}${c?'<i>★</i>':''}</button><small>${c?'Center':'#'+(k+1)}</small><span><button class="b s" onclick="xePosMv(${i},${id},-1)">◀</button><button class="b s" onclick="xePosMv(${i},${id},1)">▶</button></span></span>`:''}).join('')}</div></div>`}).join('')}
 ${L.length<max?`<div class="row">${spkBtn('xe')}</div>${spkPanel('xe')}`:''}</div>`};
// keep a Center in front when positions move
{const f=xePosMv;xePosMv=function(i,mid,d){const r=xeR0();const z=r&&xeL(r)[i];if(z&&xeCens(z).length){const C=xeCens(z),k=z.o.indexOf(mid),j=k+d;if(k<0||j<0||j>=z.o.length)return;if(C.includes(mid)!==C.includes(z.o[j]))return toast('Centers stay in front — change the Center to move her.','err')}return f.apply(this,arguments)}}
// accepting keeps the second Centers chosen in the offer draft
{const f=xeDoAccept;xeDoAccept=function(r,ids,set){const D=r&&r.draft&&r.draft.songs?r.draft.songs.slice():[];const ok=f.apply(this,arguments);try{if(ok&&r&&r.set)r.set.forEach(z=>{const d=D.find(x=>x.song==z.song&&x.gid==z.gid);if(d&&d.c2!=null&&(r.sel||[]).includes(d.c2)&&d.c2!=z.center){z.c2=d.c2;xeCenFix(z)}})}catch(e){console.error(e)}return ok}}
// ---- 4. every member wears her latest single costume ---------------------------------------------------------------------------
// a sister-group member at an event booked for her senior group wears the SENIOR group's latest single costume:
// her own costume of its title track when she was in that Senbatsu, otherwise the single's (non-Senbatsu) costume
function xeHostGid(r,m){const G=r&&Array.isArray(r.gr)?r.gr.map(e=>e.gid):[];const own=typeof gsGid=='function'?gsGid(m):m.group;if(!G.length||G.includes(own))return null;const main=G.find(g=>{const x=grp(g);return x&&x.type=='main'});return main??G[0]}
function xeSeniorCz(gid,m){let cd=null;try{gsWith(gid,()=>{const x=(S.singles||[]).filter(z=>z.mainId&&S.songs[z.mainId]).sort((a,b)=>(b.relDay??b.day??0)-(a.relDay??a.day??0))[0];if(!x)return;const o=S.songs[x.mainId],tt=new Set((x.tt&&x.tt.members)||(o.slots||[]).filter(Boolean)),sc=(x.scz&&x.scz.cdz&&x.scz.cdz.mem)||{};
 if(tt.has(m.id)){const c=evCostume(o,m);if(c&&c.cd){cd=c.cd;return}}const v=sc[m.id];if(v&&v.own&&v.own.p){cd=v.own.p;return}const any=Object.values(sc).find(z=>z&&z.own&&z.own.p&&z.ok);if(any){cd=any.own.p;return}const c=evCostume(o,m);cd=c&&c.cd||null})}catch(e){}return cd}
function xeLatestCz(m,r){if(!m)return null;const hg=r?xeHostGid(r,m):null;if(hg!=null){const cd=xeSeniorCz(hg,m);if(cd)return cd}if(m.profCz&&m.profCz.p)return m.profCz.p;
 try{const gid=typeof gsGid=='function'?gsGid(m):m.group;let cd=null;gsWith(gid,()=>{for(const x of (S.singles||[]).slice().reverse()){const o=S.songs[x.mainId];if(!o)continue;const c=evCostume(o,m);if(c&&c.cd){cd=c.cd;break}}});return cd}catch(e){return null}}
function xeDressLatest(sp,r){if(!sp||!Array.isArray(sp.m))return sp;const keys=[],cds=[];sp.m.forEach(e=>{const m=get(e.id),cd=xeLatestCz(m,r);if(cd){const k=JSON.stringify(cd);let ci=keys.indexOf(k);if(ci<0){keys.push(k);cds.push(JSON.parse(k));ci=cds.length-1}e.c=ci;delete e.of;delete e.oh}else{const a=m?ap(m):{};e.c=null;e.of=a.of;e.oh=a.oh}});sp.cd=cds;sp.czLatest=1;return sp}
{const f=xeArtMake;xeArtMake=function(r){const sp=f.apply(this,arguments);try{xeDressLatest(sp,r)}catch(e){console.error(e)}return sp}}
{const f=xeArtFix;xeArtFix=function(r){try{if(r){r.cz=null;if(r.draft)r.draft.cz=null}}catch(e){}const out=f.apply(this,arguments);try{if(r&&r.art&&r.status!='done')xeDressLatest(r.art,r)}catch(e){console.error(e)}return out}}
xeCzHtml=function(r){const ids=xeM(r).slice(0,8);return`<div class="c xecz"><h3>Event costume</h3><p class="st">Every member wears her latest single costume (like the Roadshow). Sister-group members at a senior-group event wear the senior group's latest single costume.</p><div class="row xeczrow">${ids.map(id=>{const m=get(id);if(!m)return'';const a=ap(m),cd=xeLatestCz(m,r);return`<span class="xeczm"><svg viewBox="10 -2 80 200" width="34">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,cd:cd||undefined})}</svg><small>${esc(m.name.split(' ')[0])}</small></span>`}).join('')}${xeM(r).length>8?`<small class="st">+${xeM(r).length-8}</small>`:''}</div></div>`};
// the accepted-event page no longer shows an old "one costume" choice
{const f=V.xedet;V.xedet=function(){const r=xeGet(ui.xe);if(r&&r.status!='done')r.cz=null;return f.apply(this,arguments)}}
