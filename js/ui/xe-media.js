// =====================================================================================
//  IDOLVERSE48: Select Bloom! — External Events: Media Senbatsu, automatic lineups,
//                               1–2 offers per group a month, auto-accept, smaller fan gains
// -------------------------------------------------------------------------------------
//  · Media Senbatsu (optional) is chosen with the Title Track Senbatsu of a single: the members
//    who represent the group at events. Without one, the latest single's Title Track Senbatsu
//    represents the group.
//  · Event members are no longer chosen by hand: an event takes the first members of that list.
//    A member who is busy (Theater performances do not count — the event has priority) is
//    replaced by the best-ranked member of the latest General Election, or, without an election,
//    by the member with the largest fanbase.
//  · Performance events (festivals / live events with songs): 1–2 a month per group. Other offers
//    (corporate, media, talk, photo …) keep their usual frequency. Music programs are not counted.
//  · Auto-accept (optional): offers are accepted automatically when every check passes; live
//    events get the latest single's songs with their original Centers.
//  · Fans: an event reaches many people but converts few of them into fans.
// =====================================================================================
// ---- fans: conversion per category (rebalanced: a good event brings more new group fans than a Theater show) ---------------------------------------------------------------------------------------------
try{Object.keys(XE_REACH).forEach(k=>{if(!XE_REACH[k].x9){XE_REACH[k][1]*=.9;XE_REACH[k].x9=1}})}catch(e){console.error(e)}
// ---- Media Senbatsu -------------------------------------------------------------------------------------------------------------------
function xmMembersFor(p){try{const mn=S.songs[p.mainId];return elig(mn).filter(m=>isAct(m))}catch(e){return[]}}
function xmOpen(){const p=S.pj;if(!p)return;ui.xmP={sel:(p.media||[]).slice()};ui.mod={t:'html',xm:1,h:xmHtml()};render()}
function xmHtml(){const p=S.pj,P=ui.xmP;if(!p||!P)return'';const mn=S.songs[p.mainId],TT=(mn&&mn.slots||[]).filter(Boolean),M=xmMembersFor(p).sort((a,b)=>(TT.includes(b.id)?1:0)-(TT.includes(a.id)?1:0)||b.pop-a.pop);
 return`<h2 class="ht">📣 Media Senbatsu</h2><p class="st">The members who perform at festivals and live events while this single is the latest one (other events draw members by skill). Optional — without a Media Senbatsu, every member of the group can be sent. Events take members in this order; busy members are replaced by General Election rank (or fanbase).</p>
 <div class="row"><button class="b s" onclick="ui.xmP.sel=${JSON.stringify(TT)};ui.mod.h=xmHtml();render()">Same as Title Track Senbatsu</button><button class="b s" onclick="ui.xmP.sel=[];ui.mod.h=xmHtml();render()">Clear</button></div><p class="st"><b>${P.sel.length}</b> selected</p>
 <div class="ccmg3">${M.map(m=>{const k=P.sel.indexOf(m.id);return ccMCard(m,k>=0,`xmTog(${m.id})`,`${k>=0?`<small class="ccm3s">#${k+1}</small>`:''}${TT.includes(m.id)?'<small class="ccm3u">Title Track</small>':''}`)}).join('')}</div>
 <div class="row"><button class="b p" onclick="xmSave()">Save Media Senbatsu</button><button class="b s" onclick="ui.mod=null;ui.xmP=null;render()">Cancel</button></div>`}
function xmTog(id){const P=ui.xmP;if(!P)return;const i=P.sel.indexOf(id);if(i>=0)P.sel.splice(i,1);else P.sel.push(id);ui.mod.h=xmHtml();render()}
function xmSave(){const p=S.pj,P=ui.xmP;if(!p||!P)return;p.media=P.sel.length?P.sel.slice():null;ui.mod=null;ui.xmP=null;toast(p.media?`Media Senbatsu: ${p.media.length} member(s).`:'No Media Senbatsu: every member of the group can be sent.');render()}
{const f=plSenBox;plSenBox=function(p,o){let h=f.apply(this,arguments);try{if(p&&o&&o.id==p.mainId&&!(typeof plReused=='function'&&plReused(p,o))){const n=(p.media||[]).length;
  h=h.replace(/<\/div>$/,`<div class="row xmrow"><button class="b s" onclick="xmOpen()">📣 Media Senbatsu${n?` (${n})`:''}</button><small class="st">${n?'Represents the group at events':'Not set — every member can go to events'}</small></div></div>`)}}catch(e){console.error(e)}return h}}
{const f=doRelease;doRelease=function(){const p=S.pj,n=S.singles.length,media=p&&p.media?p.media.slice():null;const r=f.apply(this,arguments);try{const x=S.singles[n];if(x&&media)x.media=media}catch(e){console.error(e)}return r}}
// ---- who goes: Media Senbatsu / Title Track Senbatsu, then election rank, then fanbase --------------------------------------------------
function xmBase(gid){let L=[];try{gsWith(gid,()=>{const x=(S.singles||[]).slice(-1)[0];if(!x)return;const mn=S.songs[x.mainId];let TT=[];
  if(mn&&mn.fm&&mn.fm.sl){try{TT=slotOrder(mn.fm).map(k=>mn.fm.sl[k].m).filter(v=>v!=null)}catch(e){}}if(!TT.length)TT=((x.tt&&x.tt.members)||(mn&&mn.slots)||[]).filter(v=>v!=null);
  L=(x.media&&x.media.length)?x.media.slice().sort((a,b)=>{const ia=TT.indexOf(a),ib=TT.indexOf(b);return(ia<0?999:ia)-(ib<0?999:ib)}):TT})}catch(e){console.error(e)}return L}
function xmRankList(gid){const M=gsMem(gid).filter(m=>isAct(m));let ed=-1;M.forEach(m=>(m.geRec||[]).forEach(h=>{if(h.rank&&(h.ed||0)>ed)ed=h.ed||0}));
 const rk=m=>{if(ed<0)return null;const h=(m.geRec||[]).find(z=>(z.ed||0)==ed&&z.rank);return h?h.rank:null};
 return M.map(m=>({m,r:rk(m)})).sort((a,b)=>(a.r==null?1e9:a.r)-(b.r==null?1e9:b.r)||(b.m.fans||0)-(a.m.fans||0)).map(z=>z.m.id)}
function xmIds(gid,n,day,except){const out=[],ok=id=>{const m=get(id);return m&&isAct(m)&&(+m.en||0)>=0&&(typeof gsGid!='function'||gsGid(m)==gid||(m.kn&&m.kn.gid==gid))&&xeFree(id,day,except)};
 const B=xmBase(gid),L=xmSpread(B,day,except);for(const id of L){if(out.length>=n)break;if(!out.includes(id)&&ok(id))out.push(id)}
 if(out.length<n)for(const id of xmRankList(gid)){if(out.length>=n)break;if(!out.includes(id)&&ok(id))out.push(id)}return out}
const xmGid=r=>{const g=(r.gr||[])[0];if(g&&g.gid!=null)return g.gid;const q=(r.req||[])[0];return q?q.gid:gsAg()};
// put the automatic lineup on an open offer
function xmApply(r,size){if(!r||r.status!='open'||r.ch=='mp')return true;const gid=xmGid(r),n=size||r.n||1,ids=xmIds(gid,n,r.day,r.id);if(!ids.length)return false;const g=grp(gid)||{};r.gr=[{gid,gn:g.name||''}];
 if(r.mode=='org'){const old=(r.req||[]).map(q=>q.mid).join();r.req=ids.map(id=>{const m=get(id);return{mid:id,gid,nm:m.name,gn:g.name||''}});r.n=ids.length;if(old!=ids.join())try{r.art=xeArtMake(r,ids)}catch(e){}}
 else{const D=xeSelOf(r),old=D.sel.join();D.sel=ids.slice();r.n=Math.max(r.n||0,ids.length);(D.songs||[]).forEach(z=>{z.o=z.o.filter(x=>ids.includes(x));ids.forEach(x=>{if(!z.o.includes(x))z.o.push(x)});if(z.center!=null&&!ids.includes(z.center))z.center=null;if(z.c2!=null&&!ids.includes(z.c2))z.c2=null;if(z.center==null&&z.c2!=null){z.center=z.c2;z.c2=null}})}
 try{r.pay=xePay(r);r.expE=xeExp(r).t;r.cond=xeCond(r).map(c=>/chooses the members|named the members/.test(c)?'Members: the Festivals / live events: Media Senbatsu (or anyone in the group); other events: drawn by skill; busy members are replaced by election rank or fanbase.':c)}catch(e){}return true}
// ---- 1–2 offers per group a month (solo or group) -------------------------------------------------------------------------------------
let XM_IN=0,XM_GEN=0;
{const f=xeMake;xeMake=function(ch,o={}){const r=f.apply(this,arguments);if(!r||ch=='mp')return r;if(!XM_GEN&&(r.acts||[]).includes('live')){const X=xeS(),i=X.list.indexOf(r);if(i>=0)X.list.splice(i,1);return null}try{
  const gid=o.gid!=null?o.gid:xmGid(r);r.gr=[{gid,gn:(grp(gid)||{}).name||''}];const size=r.mode=='org'?(o.size||(Math.random()<.55?1:xeR(3,6))):Math.max(3,r.n||3);
  if(!xmApply(r,size)){const X=xeS(),i=X.list.indexOf(r);if(i>=0)X.list.splice(i,1);return null}}catch(e){console.error(e)}return r}}
const xmMonth=d=>{const t=dayDate(d);return t.getFullYear()*12+t.getMonth()};
function xmGenerate(){const X=xeS();if(!X)return;X.mq=X.mq||{};const mo=xmMonth(S.day),t=dayDate(S.day),dim=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(),left=dim-t.getDate()+1;
 for(const k in X.mq)if(+k.split('|')[1]<mo-2)delete X.mq[k];
 S.groups.filter(g=>!g.dis&&gsMem(g.id).some(isAct)).forEach(g=>{const key=g.id+'|'+mo,Q=X.mq[key]=X.mq[key]||{q:Math.random()<.5?1:2,n:0};if(Q.n>=Q.q)return;
  if(Math.random()>=(Q.q-Q.n)/left)return;const ch=Math.random()<.4?'direct':'board',good=Object.values(X.orgs||{}).filter(o=>o.sat>=62&&o.cat=='music'),org=ch=='direct'&&good.length&&Math.random()<.6?xePick(good):null;
  XM_GEN=1;let r=null;try{r=xeMake(ch,{gid:g.id,cat:'music',...(org&&org.cat=='music'?{org}:{})})}finally{XM_GEN=0}
  if(r){Q.n++;if(ch=='direct')xeNote(`📨 Festival / live offer for <b>${esc(g.name)}</b> from <b>${esc(r.orgNm)}</b>: ${esc(r.name)} · ${yen(r.pay)}.`,r.id)}})}
{const f=xeDaily;xeDaily=function(){XM_IN=1;let out;try{out=f.apply(this,arguments)}finally{XM_IN=0}try{xmGenerate();xeS().list.filter(r=>r.status=='open'&&r.ch!='mp').forEach(r=>{if(!xmApply(r)){r.status='expired';r.end=S.day}});xmAuto()}catch(e){console.error(e)}return out}}
// ---- auto-accept ----------------------------------------------------------------------------------------------------------------------
function xmAutoSongs(r){const gid=xmGid(r),ids=xeSelOf(r).sel,out=[];try{gsWith(gid,()=>{const x=(S.singles||[]).slice(-1)[0];if(!x)return;const L=[x.mainId,...(x.coup||[]),...((x.types||[]).flatMap(t=>t.songs||[]))].filter((v,i,a)=>v&&a.indexOf(v)==i);
  L.slice(0,r.songs||1).forEach(song=>{const o=S.songs[song];if(!o)return;out.push({gid,song,title:o.title})})})}catch(e){console.error(e)}
 return out.map(z=>{const X=xeOrigOrder(z.gid,z.song,ids);return{...z,center:X.cen[0]??null,c2:X.cen[1]??null,o:X.O}})}
function xmAuto(){const X=xeS();if(!X||!X.auto)return;X.list.filter(r=>r.status=='open'&&r.ch!='mp').forEach(r=>{try{if(!xmApply(r))return;let ids,set;
  if(r.mode=='org')ids=r.req.map(q=>q.mid);else{const D=xeSelOf(r);ids=D.sel.slice();if(r.songs&&!(D.songs&&D.songs.length))D.songs=xmAutoSongs(r);set=(D.songs||[]).map(z=>({gid:z.gid,song:z.song,title:z.title,center:z.center,c2:z.c2,o:z.o.filter(id=>ids.includes(id))}))}
  if(xeCheck(r,ids).length)return;if(ids.some(id=>((get(id)||{}).en|0)<40))return;if(xeDoAccept(r,ids,set)){xeNote(`🤝 Auto-accepted: <b>${esc(r.name)}</b> · ${jd(r.day)} · ${ids.length} member(s) · ${yen(r.pay)}.`,r.id)}}catch(e){console.error(e)}})}
function xmAutoTog(){const X=xeS();X.auto=!X.auto;toast(X.auto?'Auto-accept on: offers are accepted automatically when everything is ready.':'Auto-accept off.');if(X.auto)xmAuto();render()}
const xmAutoBar=()=>{const X=xeS();return`<div class="c xmauto"><label class="row"><input type="checkbox" ${X.auto?'checked':''} onchange="xmAutoTog()"> <b>Auto-accept offers</b></label><small class="st">Performance events (festivals / live events): 1–2 a month per group; other events (corporate, media, talk …) as before. Members are the Festivals / live events: Media Senbatsu (or anyone in the group); other events: drawn by skill; busy members are replaced by General Election rank, or fanbase.</small></div>`};
['xeboard','xedirect','xeov'].forEach(v=>{const f=V[v];if(typeof f!='function')return;V[v]=function(){const h=f.apply(this,arguments);try{const i=h.indexOf('</h2>');return i>=0?h.slice(0,i+5)+xmAutoBar()+h.slice(i+5):xmAutoBar()+h}catch(e){return h}}});
// ---- accepting by hand: the lineup is automatic ----------------------------------------------------------------------------------------
{const f=xeAccept;xeAccept=function(id){const r=xeGet(id);if(r&&r.status=='open'&&!xmApply(r))return toast('Nobody in the group is free that day.','err');return f.apply(this,arguments)}}
xeSelTog=function(){toast('Members are chosen automatically (Media Senbatsu → election rank → fanbase).')};
{const f=V.xesel;V.xesel=function(){const r=xeGet(ui.xe);if(r&&r.status=='open'&&r.mode=='player'){xmApply(r);const D=xeSelOf(r);if(r.songs&&!(D.songs&&D.songs.length))D.songs=xmAutoSongs(r)}let h=f.apply(this,arguments);try{if(!r||r.mode!='player'||r.status!='open')return h;
  h=h.replace(/You decide who performs and how many; /,'');const a=h.indexOf('<div class="c"><p class="st"><b>');if(a<0)return h;const ends=['<div class="c xeset">','<div class="c xecz">','<div class="c geerr">','<div class="row"><button class="b p"'].map(s=>h.indexOf(s,a)).filter(i=>i>a);if(!ends.length)return h;const b=Math.min(...ends);
  const ids=xeSelOf(r).sel,base=new Set(xmBase(xmGid(r)));
  const blk=`<div class="c xmline"><h3>Members (${ids.length})</h3><p class="st">Chosen automatically: Festivals / live events: Media Senbatsu (or anyone in the group); other events: drawn by skill; busy members are replaced by General Election rank, or fanbase. Theater performances that day are covered by the Theater.</p><div class="xmfaces">${ids.map(id=>{const m=get(id);return m?`<span class="xmface">${ptc(m,40)}<small>${esc(m.name.split(' ')[0])}</small>${base.has(id)?'':'<small class="xmsub">replacement</small>'}</span>`:''}).join('')}</div></div>`;
  h=h.slice(0,a)+blk+h.slice(b)}catch(e){console.error(e)}return h}}
// ---- member recognition from an event = her share of the event's new fans (never more than the new fans); popularity still rises ---------------------------------------------------
let XM_RUN=0;
{const f=xeRun;xeRun=function(){XM_RUN=1;try{return f.apply(this,arguments)}finally{XM_RUN=0}}}
{const f=gainPop;gainPop=function(m,d){if(!XM_RUN||!m)return f.apply(this,arguments);const f0=Number.isFinite(+m.fans)?+m.fans:0;m.buzz=cl(Math.round(m.buzz+d*2));m.pop=popOf(m)}}
// ---- music programs are always accepted automatically (locked) -----------------------------------------------------------------------
function xmAutoMp(){const X=xeS();if(!X)return;X.list.filter(r=>r.status=='open'&&r.ch=='mp').forEach(r=>{try{const ids=(r.req||[]).map(q=>q.mid);if(!ids.length||xeCheck(r,ids).length)return;if(xeDoAccept(r,ids))xeNote(`📺 Music program accepted automatically: <b>${esc(r.name)}</b> · ${jd(r.day)} · ${yen(r.pay)}.`,r.id)}catch(e){console.error(e)}})}
{const f=tick;tick=function(){const out=f.apply(this,arguments);try{xmAutoMp()}catch(e){console.error(e)}return out}}
{const f=V.xemp;if(typeof f=='function')V.xemp=function(){try{xmAutoMp()}catch(e){}const h=f.apply(this,arguments);const bar=`<div class="c xmauto"><label class="row"><input type="checkbox" checked disabled> <b>🔒 Music programs: accepted automatically</b></label><small class="st">Offers for the latest single's music programs are accepted as soon as every performer is free.</small></div>`;const i=h.indexOf('</h2>');return i>=0?h.slice(0,i+5)+bar+h.slice(i+5):bar+h}}

// ---- spread the work: when an event needs fewer members than the list, members with fewer recent jobs go first ----------------------
function xmLoad(day,except){const C={};try{xeS().list.forEach(r=>{if(r.id==except||!['accepted','done'].includes(r.status)||Math.abs((r.day|0)-day)>30)return;(r.sel||[]).forEach(id=>{C[id]=(C[id]||0)+1})})}catch(e){}return C}
function xmSpread(B,day,except){const C=xmLoad(day,except);return B.map((id,i)=>{const m=get(id)||{};return{id,c:C[id]||0,w:(m.pop||0)+Math.random()*45}}).sort((a,b)=>a.c-b.c||b.w-a.w).map(z=>z.id)}
// ---- negative Energy: no new jobs until it is back to 0 or more (jobs already accepted still happen) ----------------------------------
{const f=xeCheck;xeCheck=function(r,sel){const E=f.apply(this,arguments);try{if(r&&r.status=='open'){const ids=r.mode=='org'?(r.req||[]).map(q=>q.mid):(sel||[]);ids.forEach(id=>{const m=get(id);if(m&&(+m.en||0)<0)E.push(`${m.name} has negative Energy (${m.en|0}): no new jobs until she has rested.`)})}}catch(e){}return E}}

// Without a Media Senbatsu every member of the group can be sent (the work is spread: fewest recent jobs first, then popularity with some chance)
{const f=xmBase;xmBase=function(gid){let media=null;try{gsWith(gid,()=>{const x=(S.singles||[]).slice(-1)[0];if(x&&x.media&&x.media.length)media=x.media.slice()})}catch(e){}
 if(media)return f.apply(this,arguments);try{return gsMem(gid).filter(m=>isAct(m)).sort((a,b)=>(b.pop||0)-(a.pop||0)).map(m=>m.id)}catch(e){return f.apply(this,arguments)}}}
// ---- who goes (final rule) -------------------------------------------------------------------------------------------------------------
//  · Performance events (festivals / live events with songs): the Media Senbatsu; without one, any member of the group
//    (fewest recent jobs first, then popularity with some chance).
//  · Every other event: a random draw among all members of the group, weighted by how well her skills fit that kind of event
//    (the same criteria the event is judged on), a little less likely if she already has many jobs.
//  · Busy members / negative Energy are skipped; replacements by General Election rank, then fanbase.
function xmFit(r,m){const CR=(typeof XE_EVAL!='undefined'&&XE_EVAL[r.cat])||[];if(!CR.length)return 50;const c={song:50,coord:50,eff:1,brand:x=>((x.aff||{})[r.brand])??50};let s=0,w=0;
 CR.forEach(([n,f,k])=>{let v=50;try{v=+f(m,c);if(!Number.isFinite(v))v=50}catch(e){}s+=Math.max(0,Math.min(100,v))*k;w+=k});return w?s/w:50}
{const f=xmIds;xmIds=function(gid,n,day,except){const r=except?xeGet(except):null;if(!r)return f.apply(this,arguments);
 const ok=id=>{const m=get(id);return m&&isAct(m)&&(+m.en||0)>=0&&(typeof gsGid!='function'||gsGid(m)==gid||(m.kn&&m.kn.gid==gid))&&xeFree(id,day,except)},out=[];
 if((r.acts||[]).includes('live')){for(const id of xmSpread(xmBase(gid),day,except)){if(out.length>=n)break;if(!out.includes(id)&&ok(id))out.push(id)}}
 else{const C=xmLoad(day,except),pool=gsMem(gid).filter(m=>ok(m.id)).map(m=>({id:m.id,w:Math.pow(Math.max(5,xmFit(r,m)),2.2)/(1+(C[m.id]||0)*.5)}));
  while(out.length<n&&pool.length){const T=pool.reduce((a,z)=>a+z.w,0);let x=Math.random()*T,k=0;for(;k<pool.length-1;k++){x-=pool[k].w;if(x<=0)break}out.push(pool[k].id);pool.splice(k,1)}}
 if(out.length<n)for(const id of xmRankList(gid)){if(out.length>=n)break;if(!out.includes(id)&&ok(id))out.push(id)}return out}}
// offers keep their lineup once drawn (no daily re-draw), unless a member became unavailable
{const f=xmApply;xmApply=function(r,size){try{if(r&&r.status=='open'&&r.ch!='mp'&&!size){const ids=r.mode=='org'?(r.req||[]).map(q=>q.mid):((r.draft&&r.draft.sel)||[]);if(ids.length&&ids.every(id=>{const m=get(id);return m&&isAct(m)&&(+m.en||0)>=0&&xeFree(id,r.day,r.id)}))return true}}catch(e){}return f.apply(this,arguments)}}
// ---- performance events: the whole Media Senbatsu, or else the latest single's Title Track Senbatsu; only the members who
//      cannot come are replaced (General Election rank, then fanbase), and a replacement takes the position of the member
//      she replaces (Center included) ----------------------------------------------------------------------------------------------
function xmTT(gid){let L=[];try{gsWith(gid,()=>{const x=(S.singles||[]).slice(-1)[0];if(!x)return;if(x.media&&x.media.length){L=x.media.slice();return}const mn=S.songs[x.mainId];
  if(mn&&mn.fm&&mn.fm.sl){try{L=slotOrder(mn.fm).map(k=>mn.fm.sl[k].m).filter(v=>v!=null)}catch(e){}}if(!L.length)L=((x.tt&&x.tt.members)||(mn&&mn.slots)||[]).filter(v=>v!=null)})}catch(e){}return L}
{const f=xmIds;xmIds=function(gid,n,day,except){const r=except?xeGet(except):null;if(!r||!(r.acts||[]).includes('live'))return f.apply(this,arguments);
 const ok=id=>{const m=get(id);return m&&isAct(m)&&(+m.en||0)>=0&&xeFree(id,day,except)},B=xmTT(gid);if(!B.length)return f.apply(this,arguments);
 const out=[],subs={},rank=xmRankList(gid).filter(id=>!B.includes(id));B.forEach(id=>{if(ok(id)){out.push(id);return}const rep=rank.find(x=>!out.includes(x)&&ok(x));if(rep!=null){out.push(rep);subs[rep]=id}});
 r.subs=subs;return out}}
{const f=xmApply;xmApply=function(r,size){try{if(r&&r.status=='open'&&r.ch!='mp'&&(r.acts||[]).includes('live')){const B=xmTT(xmGid(r));if(B.length)size=B.length;
  const cur=r.mode=='org'?(r.req||[]).map(q=>q.mid):((r.draft&&r.draft.sel)||[]);if(cur.length==B.length&&cur.every(id=>{const m=get(id);return m&&isAct(m)&&(+m.en||0)>=0&&xeFree(id,r.day,r.id)})&&B.every(id=>cur.includes(id)||(r.subs&&Object.values(r.subs).includes(id))))return true;
  if(r.draft&&r.draft.songs)r.draft.songs=[]}}catch(e){}return f.call(this,r,size)}}
// positions: a replacement stands where the member she replaces stood
let XM_SUBS=null;
{const f=xeOrigOrder;xeOrigOrder=function(gid,song,ids){let subs=XM_SUBS;if(!subs){try{const r=xeGet(ui.xe);subs=r&&r.subs}catch(e){}}if(!subs||!Object.keys(subs).length)return f.apply(this,arguments);
 const fw=id=>subs[id]!=null?+subs[id]:id,back={};Object.keys(subs).forEach(k=>back[subs[k]]=+k);const X=f.call(this,gid,song,ids.map(fw)),bw=id=>back[id]!=null?back[id]:id;return{O:X.O.map(bw),cen:X.cen.map(bw)}}}
{const f=xmAutoSongs;xmAutoSongs=function(r){XM_SUBS=r&&r.subs||null;try{return f.apply(this,arguments)}finally{XM_SUBS=null}}}
