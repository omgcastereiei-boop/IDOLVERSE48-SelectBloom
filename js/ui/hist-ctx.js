// =====================================================================================
//  IDOLVERSE48: Select Bloom! — history keeps graduated members
// -------------------------------------------------------------------------------------
//  Graduated members move to S.alumni, and get(id) only finds current members, so every past work they took part in
//  (single details, covers, announcements, Senbatsu lists, Music Videos, election ceremonies, theater and concert
//  history…) silently lost them. While history is drawn, get(id) also finds former members.
//  History of a single also shows each member as she was then: her profile costume of that single (or the latest one
//  she had by its release day) and her General Election rank from the last election held by that release day.
// =====================================================================================
const HX_GET0=get;let HX=0,HX_AT=null;
const hxAny=id=>HX_GET0(id)||((S&&S.alumni)||[]).find(m=>m.id==id);
function hxRun(at,f,self,args){const g0=get,a0=HX_AT;get=hxAny;HX++;if(at)HX_AT=at;try{return f.apply(self,args)}finally{HX--;HX_AT=a0;get=HX?hxAny:g0}}
const hxSingleAt=x=>x?{rid:x.rid,day:x.relDay??x.day??S.day}:null;
function hxWrap(name,atOf){const f=window[name];if(typeof f!='function')return;window[name]=function(){let at=null;try{at=atOf?atOf.apply(this,arguments):null}catch(e){}return hxRun(at,f,this,arguments)}}
// single details, announcement, Senbatsu list, covers
hxWrap('showEds',i=>hxSingleAt(S.singles[i]));
hxWrap('seAnnOpen',i=>hxSingleAt(S.singles[i]));
hxWrap('slSingleHtml',x=>hxSingleAt(x));
hxWrap('coverSvg');
// Music Videos: each MV as it was when it was published
const hxMvAt=o=>{const v=o&&o.mv;return v&&v.st=='published'?{rid:v.rid,day:v.pub}:null};
hxWrap('mvThumb',o=>hxMvAt(o));hxWrap('mvOpen',id=>hxMvAt(S.songs[id]));
hxWrap('plSongInfo',id=>{const o=S.songs[id];if(!o)return null;const x=S.singles.find(s=>s.mainId==id||(s.coup||[]).includes(id)||(s.tracks||[]).some(t=>t.id==id));return x?hxSingleAt(x):(o.relDay!=null?{day:o.relDay}:null)});
// election ceremony pictures
hxWrap('geScenes',e=>e?{day:(e.cer&&e.cer.day)||e.vEnd||S.day}:null);
// history pages
const HX_VIEWS=new Set(['mvlib','songlib','gearch','thhist','tharch','hist','rechist','reclib','recdvd','xehist','blpg','blep','blcon']);
{const f=render;render=function(){if(typeof view!='undefined'&&HX_VIEWS.has(view))return hxRun(null,f,this,arguments);return f.apply(this,arguments)}}
// as she was then: profile costume of that single
{const f=apEff;apEff=function(m){const a=f.apply(this,arguments);try{const A=HX_AT;if(!A||!m||m._x)return a;const L=[...(m.czHist||[]),...(m.profCz?[m.profCz]:[])].filter(z=>z&&z.p);
  let z=A.rid?L.find(z=>z.rid==A.rid):null;if(!z&&A.day!=null)z=L.filter(z=>(z.day??0)<=A.day).sort((p,q)=>(q.day??0)-(p.day??0))[0];if(z)return{...a,cd:z.p};const b={...a};delete b.cd;return b}catch(e){return a}}}
// …and her election rank of that time
function hxRankAt(m,day){let best=null;S.groups.forEach(g=>{const G=gsCtx(g.id,'ge');const E=((G&&G.list)||[]).filter(e=>e.st=='done'&&e.final&&((e.cer&&e.cer.day)||e.vEnd||0)<=day).sort((a,b)=>(b.vEnd||0)-(a.vEnd||0))[0];if(!E)return;const row=E.final.rows.find(r=>r.id==m.id&&!r.withdrawn);if(!row)return;if(!best||(E.vEnd||0)>(best.e.vEnd||0))best={e:E,row,g}});
 if(!best||!best.row.rank)return null;const k=best.row.rank<=3?String(best.row.rank):best.row.rank<=7?'k7':best.row.gi==0?'sen':'rk';return{...best,k}}
if(typeof geProfRank=='function'){const f=geProfRank;geProfRank=function(m){try{if(HX_AT&&HX_AT.day!=null&&m)return hxRankAt(m,HX_AT.day)}catch(e){}return f.apply(this,arguments)}}
// ---- Music Videos: a song set to "Music Video" always gets its MV on release (the older Video menu set only the song) -----
{const f=doRelease;doRelease=function(){try{const p=S.pj;if(p&&p.status=='producing')usedSongs(p).forEach(i=>{const o=S.songs[i];if(o&&o.video=='mv'){const v=mvOf(o);if(v&&!v.on&&v.st!='published')v.on=true}})}catch(e){console.error(e)}return f.apply(this,arguments)}}
// repair: released songs set to "Music Video" whose MV was never published get it (dated to their release)
function hxMvRepair(){try{if(!S||!S.songs)return 0;let n=0;S.singles.forEach(x=>{[x.mainId,...(x.coup||[]),...((x.tracks||[]).map(t=>t.id))].filter((id,k,A)=>id&&A.indexOf(id)==k).forEach(id=>{const o=S.songs[id];if(!o||o.video!='mv')return;const v=mvOf(o);if(!v||v.st=='published')return;
  v.on=true;if(!v.film)try{v.film=mvSnap(o);v.film.day=x.relDay??x.day}catch(e){}v.st='published';v.pub=x.relDay??x.day??S.day;v.rid=x.rid;v.single=x.title;v.track=id==x.mainId?'title':'coupling';v.v=0;v.dh=[];v.ev=[];v.bz=0;v.carry=0;try{mvInit(o,x)}catch(e){}n++})});return n}catch(e){console.error(e);return 0}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{const n=hxMvRepair();if(n)console.log('MV repair:',n)}catch(e){}return r}}
// ---- iPhone / iPad (WebKit): pictures turned into an image file keep their characters ---------------------------------
//  On WebKit characters are drawn as small images (perf-sprite.js). A whole picture converted to an image file (election
//  ceremony scenes, song library covers…) cannot load those, so its characters were missing (an empty throne). Such a
//  picture now stays an inline drawing; pictures made from a drawing function are drawn with plain characters instead.
const hxHasBlob=s=>typeof s=='string'&&s.indexOf('href="blob:')>=0;
const hxInl=(svg,cls)=>svg.replace(/<svg\b/,`<svg class="${cls}" role="img"`);
if(typeof gxAsImg=='function'){const f=gxAsImg;gxAsImg=function(svg,cls){if(hxHasBlob(svg))return hxInl(svg,cls||'gxwimg');return f.apply(this,arguments)}}
if(typeof rcImg=='function'){const f=rcImg;rcImg=function(key,svg,cls){if(hxHasBlob(svg))return hxInl(svg,cls||'rcimg');return f.apply(this,arguments)}}
if(typeof cvImg=='function'){const f=cvImg;cvImg=function(key,mk,w,h){const g=typeof mk=='function'?function(){PT_RAW++;try{return mk.apply(this,arguments)}finally{PT_RAW--}}:mk;return f.call(this,key,g,w,h)}}
// portrait frames / "TOP n" ribbons use a cached current rank (member-cards.js): in history, the rank of that time
if(typeof geRankC=='function'){const f=geRankC,C=new Map();geRankC=function(m){try{const A=HX_AT;if(A&&A.day!=null&&m&&m.id!=null){const k=A.day+'|'+m.id;if(!C.has(k)){if(C.size>3000)C.clear();C.set(k,hxRankAt(m,A.day))}return C.get(k)}}catch(e){}return f.apply(this,arguments)}}
