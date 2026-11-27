// =====================================================================================
//  Concert Encore block (like the Stage editor): the Encore sits at the bottom of the setlist as its own block with
//  its own "Add Encore songs" / "MC break" buttons. The main "Add songs" always adds to the main setlist.
// =====================================================================================
const CE2_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
function ce2Set(){const C=ccCur();return C&&ccEdit(C)?C.sets[ui.ccs]:null}
function ccPickMain(){const s=ce2Set();if(s)s.encMode=0;ccPickOpen()}
function ccPickEnc(){const s=ce2Set();if(!s)return;s.encMode=1;ccPickOpen()}
function ccAddMCEnc(){const s=ce2Set();if(!s)return;const ids=new Set(s.items.map(x=>x.id));s.encMode=0;ccAddMC();const it=s.items.find(x=>!ids.has(x.id));if(it&&it.k=='mc'){it.enc=1;s.items.splice(s.items.indexOf(it),1);s.items.push(it)}ccEncSort(s);render()}
// whatever is added outside Encore mode goes before the Encore
{const f=ccAddSong;ccAddSong=function(){const r=f.apply(this,arguments);try{const C=ccCur(),s=C&&C.sets[ui.ccs];if(s)ccEncSort(s)}catch(e){}return r}}
{const f=ccAddMC;ccAddMC=function(){const r=f.apply(this,arguments);try{const C=ccCur(),s=C&&C.sets[ui.ccs];if(s){ccEncSort(s);render()}}catch(e){}return r}}
// the picker shows when it adds to the Encore
{const f=ccPickHtml;ccPickHtml=function(){let h=f.apply(this,arguments);try{const C=ccCur(),s=C&&C.sets[ui.ccs];if(s&&s.encMode)h=`<p class="thwarn ce2pk">🎤 ${CE2_T('Adding songs to the ENCORE','กำลังเพิ่มเพลงเข้าอังกอร์')}</p>`+h}catch(e){}return h}}
{const f=ccSetHtml;ccSetHtml=function(C){let h=f.apply(this,arguments);try{const s=C&&C.sets[ui.ccs];if(!s)return h;const ed=ccEdit(C);
  // no on/off toggle any more
  h=h.replace(/<div class="row ccencm">[\s\S]*?<\/div>(<p class="st">[^<]*<\/p>)?/,'<h3>Setlist</h3>');
  const a=h.indexOf('<ol class="thtl cctl">');if(a<0)return h;const b=h.indexOf('</ol>',a);if(b<0)return h;const inner=h.slice(a+22,b),d=inner.indexOf('<li class="ccencd">ENCORE</li>');
  const main=d>=0?inner.slice(0,d):inner,enc=d>=0?inner.slice(d+'<li class="ccencd">ENCORE</li>'.length):'';const nE=s.items.filter(x=>x.k=='song'&&x.enc).length;
  const encBlock=`<div class="ce2enc"><div class="ce2hd"><b>🎤 ENCORE</b><span class="st">${nE} ${CE2_T('song(s)','เพลง')}</span></div><ol class="thtl cctl">${enc||`<li class="st">${CE2_T('No Encore yet. Add songs here to make an Encore.','ยังไม่มีอังกอร์ กดเพิ่มเพลงตรงนี้เพื่อทำอังกอร์')}</li>`}</ol>${ed?`<div class="row"><button class="b s p" onclick="ccPickEnc()">♪ ${CE2_T('Add Encore songs','เพิ่มเพลงอังกอร์')}</button><button class="b s" onclick="ccAddMCEnc()">+ ${CE2_T('MC break (Encore)','MC (อังกอร์)')}</button></div>`:''}</div>`;
  let rest=h.slice(b+5);rest=rest.replace('onclick="ccPickOpen()">♪ Add songs','onclick="ccPickMain()">♪ Add songs');
  // the encore block goes after the main buttons (bottom of the card)
  const pe=rest.indexOf('<p class="st">Tap a song');if(pe>=0)rest=rest.slice(0,pe)+encBlock+rest.slice(pe);else rest=encBlock+rest;
  h=h.slice(0,a)+`<ol class="thtl cctl">${main||`<li class="st">The setlist is empty.</li>`}</ol>`+rest}catch(e){console.error(e)}return h}}
// ---- round 2 --------------------------------------------------------------------------------------------------------------
// new songs: from "Add Encore songs" → always the LAST Encore song; from "Add songs" → never Encore (main setlist, before the Encore)
{const f=ccAddSong;ccAddSong=function(){const C=ccCur(),s=C&&C.sets[ui.ccs];if(!s||(C&&C.rh))return f.apply(this,arguments);const enc=!!s.encMode,before=new Set(s.items.map(x=>x.id));const r=f.apply(this,arguments);
 try{const nw=s.items.filter(x=>!before.has(x.id));nw.forEach(x=>{if(enc)x.enc=1;else delete x.enc});if(enc&&nw.length)s.items=s.items.filter(x=>!nw.includes(x)).concat(nw);ccEncSort(s)}catch(e){console.error(e)}return r}}
// Encore mode lasts only while the song picker opened by "Add Encore songs" is open
{const f=render;render=function(){try{if(S&&!(ui.mod&&ui.mod.ccpk)&&typeof ccS=='function'&&ui.cc){const C=ccGet(ui.cc),s=C&&C.sets&&C.sets[ui.ccs];if(s&&s.encMode)s.encMode=0}}catch(e){}return f.apply(this,arguments)}}
// no "EN" button on each song: songs enter the Encore only through "Add Encore songs"
{const f=ccSetHtml;ccSetHtml=function(C){let h=f.apply(this,arguments);try{h=h.replace(/<button[^>]*onclick="ccEncTog\('[^']*'\)"[^>]*>EN<\/button>/g,'')}catch(e){}return h}}
// ---- round 3 --------------------------------------------------------------------------------------------------------------
// "+▲ / +▼" (add above / below a song): the new song is placed exactly there. (The older code moved the last item of the list,
// which is an Encore song once an Encore exists.) A song added next to an Encore song joins the Encore; next to a main song it is a main song.
{const f=ccAddSong;ccAddSong=function(){const C=ccCur(),s=C&&C.sets[ui.ccs],I=ui.ccins;if(!s||(C&&C.rh)||!I)return f.apply(this,arguments);
 const before=new Set(s.items.map(x=>x.id));ui.ccins=null;let r;try{r=f.apply(this,arguments)}finally{ui.ccins=I}
 try{const nw=s.items.filter(x=>!before.has(x.id));if(nw.length){const L=s.items.filter(x=>!nw.includes(x)),j=L.findIndex(x=>x.id==I.iid);if(j>=0){const ref=L[j],enc=!!ref.enc;nw.forEach(x=>{if(enc)x.enc=1;else delete x.enc});L.splice(I.below?j+1:j,0,...nw);s.items=L;ccEncSort(s);ui.ccins={iid:nw[nw.length-1].id,below:1}}}}catch(e){console.error(e)}return r}}
// ▲ on the first Encore song moves it out of the Encore (it becomes the last main song); ▼ on the last main song does not enter
// the Encore (songs enter the Encore only through "Add Encore songs")
{const f=ccItemMove;ccItemMove=function(iid,d){const C=ccCur(),r=C&&ccItem(C,iid);if(!r||!ccEdit(C)||(C&&C.rh)||r.it.k!='song')return f.apply(this,arguments);const L=r.s.items,i=L.indexOf(r.it);
 if(d<0&&r.it.enc){let k=i-1;while(k>=0&&L[k].enc&&L[k].k!='song')k--;if(k<0||!L[k].enc){delete r.it.enc;L.splice(i,1);const firstEnc=L.findIndex(x=>x.enc);L.splice(firstEnc<0?L.length:firstEnc,0,r.it);ccEncSort(r.s);toast(CE2_T(`“${r.it.title}” moved out of the Encore.`,`ย้าย “${r.it.title}” ออกจากอังกอร์แล้ว`));render();return}}
 if(d>0&&!r.it.enc){let k=i+1;while(k<L.length&&!L[k].enc&&L[k].k!='song')k++;if(k<L.length&&L[k].enc){toast(CE2_T('Songs join the Encore only with “Add Encore songs”.','เพลงจะเข้าอังกอร์ได้ผ่านปุ่ม “เพิ่มเพลงอังกอร์” เท่านั้น'),'err');return}}
 return f.apply(this,arguments)}}
// the "No. …" position list: a song moved into the main part leaves the Encore; a main song cannot be moved into the Encore
function ccItemTo2(iid,to){const C=ccCur(),r=C&&ccItem(C,iid);if(!ccEdit(C)||!r)return;if(C.rh)return ccItemTo(iid,to);const L=r.s.items,i=L.indexOf(r.it);to=Math.max(0,Math.min(L.length-1,(+to|0)-1));if(to==i)return;
 L.splice(i,1);const firstEnc=L.findIndex(x=>x.enc);const inEnc=firstEnc>=0&&to>firstEnc-(to>i?0:0)&&to>=firstEnc;
 if(r.it.k=='song'){if(inEnc&&!r.it.enc){L.splice(i,0,r.it);return toast(CE2_T('Songs join the Encore only with “Add Encore songs”.','เพลงจะเข้าอังกอร์ได้ผ่านปุ่ม “เพิ่มเพลงอังกอร์” เท่านั้น'),'err')}if(!inEnc)delete r.it.enc}else{if(inEnc)r.it.enc=1;else delete r.it.enc}
 L.splice(to,0,r.it);ccEncSort(r.s);toast(CE2_T(`“${r.it.title||r.it.name}” moved to No. ${L.indexOf(r.it)+1}.`,`ย้าย “${r.it.title||r.it.name}” ไปลำดับ ${L.indexOf(r.it)+1} แล้ว`));render()}
{const f=ccSetHtml;ccSetHtml=function(C){let h=f.apply(this,arguments);try{if(!C.rh)h=h.replace(/onchange="ccItemTo\(/g,'onchange="ccItemTo2(')}catch(e){}return h}}
// ---- positions follow the participant list ------------------------------------------------------------------------------------------
//  A song's original members (it.orig) who are concert participants get their position back when it is empty — whether the song was
//  added before they joined, they were removed and added again, or an older version left the position empty. Members the player took
//  out of that song (it.rm) stay out. Only empty positions are used: her own one, else an empty one in her original row.
let CC_EDIT=0;
function ccRefill(C){if(!C||!C.sets||CC_EDIT)return 0;const P=new Set((C.parts||[]).map(String));let n=0;
 Object.values(C.sets).forEach(s=>(s.items||[]).forEach(it=>{if(it.k!='song'||!Array.isArray(it.pos)||!it.pos.some(z=>z.m==null))return;const rm=new Set((it.rm||[]).map(String)),used=new Set(it.pos.filter(z=>z.m!=null).map(z=>String(z.m)));
  (it.orig||[]).forEach(o=>{if(o.m==null)return;const k=String(o.m);if(!P.has(k)||used.has(k)||rm.has(k))return;const m=ccMem(o.m);if(!m||m.status=='graduated')return;
   const z=it.pos.find(z=>z.m==null&&z.o!=null&&String(z.o)==k)||it.pos.find(z=>z.m==null&&(z.o==null||z.why=='graduated'||!P.has(String(z.o)))&&z.r==o.r);if(!z)return;
   z.m=(C.parts||[]).find(x=>String(x)==k);if(z.m==null)z.m=o.m;z.o=z.o??o.m;z.why='';if(o.c&&!it.pos.some(q=>q!==z&&q.c))z.c=true;used.add(k);n++})}));return n}
const ccMemOf=it=>new Set((it&&it.pos||[]).filter(z=>z.m!=null).map(z=>String(z.m)));
// player edits of one song: members she takes out stay out (it.rm), members she puts in are no longer "taken out"
function ccTrackEdit(name,iidArg){const f=window[name];if(typeof f!='function')return;window[name]=function(){const C=ccCur(),iid=iidArg!=null?arguments[iidArg]:ui.ccfp,r=C&&iid!=null&&ccItem(C,iid),b=r?ccMemOf(r.it):null;let res;CC_EDIT++;try{res=f.apply(this,arguments)}finally{CC_EDIT--}
 try{const r2=C&&iid!=null&&ccItem(C,iid);if(b&&r2){const a=ccMemOf(r2.it),O=new Set((r2.it.orig||[]).map(z=>String(z.m))),rm=new Set((r2.it.rm||[]).map(String));b.forEach(k=>{if(!a.has(k)&&O.has(k))rm.add(k)});a.forEach(k=>rm.delete(k));r2.it.rm=[...rm]}}catch(e){console.error(e)}return res}}
[['ccPosSet',0],['ccPosDel',0],['ccRowClear',0],['ccFormClear',0],['ccFmSize',0],['ccFmNcSet',0],['ccFmApply',null],['ccFormPick',null],['ccFormAddShown',null],['ccPosFill',0],['ccPosAll',0]].forEach(([n,a])=>ccTrackEdit(n,a));
// a reset / copied formation starts over
['ccPosReset','ccFormCopy'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(iid){const C=ccCur(),r=C&&ccItem(C,iid);if(r)r.it.rm=[];return f.apply(this,arguments)}});
{const f=ccPartTog;ccPartTog=function(){const r=f.apply(this,arguments);try{if(ccRefill(ccCur()))render()}catch(e){console.error(e)}return r}}
{const f=ccPartSet;ccPartSet=function(){const r=f.apply(this,arguments);try{if(ccRefill(ccCur()))render()}catch(e){console.error(e)}return r}}
if(typeof ccGradTog=='function'){const f=ccGradTog;ccGradTog=function(){const r=f.apply(this,arguments);try{if(ccRefill(ccCur()))render()}catch(e){console.error(e)}return r}}
{const f=render;render=function(){try{if(S&&view=='concert'&&typeof ccCur=='function'){const C=ccCur();if(C&&C.status!='done'&&C.sets)ccRefill(C)}}catch(e){}return f.apply(this,arguments)}}
