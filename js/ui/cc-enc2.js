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
