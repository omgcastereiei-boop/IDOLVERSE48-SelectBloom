// =====================================================================================
//  IDOLVERSE48: Select Bloom! — General Election: lighter grand stage, replay, ceremony scenes, sister-group photos
// -------------------------------------------------------------------------------------
//  1. The grand stage (wide shot) is shown as one picture (<img> of the same SVG) instead of a huge inline SVG:
//     phones drew the inline version with missing / garbled tiles when many members sat on the tiers.
//  2. Replay: a finished election's ceremony can be watched again step by step (read-only — nothing changes).
//  3. Ceremony scenes in the Election Archive: the winner on the throne and the closing ceremony.
//  4. Sister-group rankings (e.g. "WIN48 TOP 16") get a group photo like the ranking groups.
// =====================================================================================
const geT=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
// ---- 1. SVG → picture ----------------------------------------------------------------------------------------------
const GX_URL=new Map();
function gxHashS(s){let h=5381;for(let i=0;i<s.length;i+=7)h=((h<<5)+h+s.charCodeAt(i))|0;return s.length+':'+h}
function gxAsImg(svg,cls,alt){try{if(typeof Blob=='undefined'||!URL.createObjectURL)return svg;if(!/xmlns=/.test(svg.slice(0,300)))svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
 const k=gxHashS(svg);let u=GX_URL.get(k);if(!u){u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));GX_URL.set(k,u);if(GX_URL.size>14){const[k0,u0]=GX_URL.entries().next().value;GX_URL.delete(k0);setTimeout(()=>{try{URL.revokeObjectURL(u0)}catch(e){}},4000)}}
 return`<img class="${cls||'gxwimg'}" src="${u}" alt="${esc(alt||'')}" decoding="async">`}catch(e){console.error(e);return svg}}
{const f=gxWide;gxWide=function(){const s=f.apply(this,arguments);return GX_RAW?s:gxAsImg(s,'gxwimg','')}}
let GX_RAW=0;
// ---- 2. replay ---------------------------------------------------------------------------------------------------------------
function geRpOpen(id){const e=geGet(id);if(!e||e.st!='done'||!e.final)return toast(geT('This election has no ceremony to replay yet.','การเลือกตั้งนี้ยังไม่มีพิธีให้ดูย้อนหลัง'),'err');ui.mod=null;ui.gerp={id,i:0,rv:0};render();try{window.scrollTo(0,0)}catch(x){}}
function geRpE(){const R=ui.gerp,e=R&&geGet(R.id);if(!e)return null;return{...e,st:'ceremony',cp:{i:R.i,rv:R.rv}}}
function geRpGo(){const R=ui.gerp,E=geRpE();if(!E)return geRpExit();const St=geSteps(E),s=St[R.i];if(!s)return geRpExit();
 if(s.k=='r'&&!R.rv){R.rv=1;return render()}if(s.k=='close')return geRpExit(1);R.i=Math.min(St.length-1,R.i+1);R.rv=0;render()}
function geRpSkip(){const R=ui.gerp,E=geRpE();if(!E)return;const St=geSteps(E);R.i=Math.max(0,St.findIndex(s=>s.k=='photo'));R.rv=0;render()}
function geRpExit(done){ui.gerp=null;if(done)toast(geT('Replay finished.','ดูย้อนหลังจบแล้ว'));render()}
{const f=render;render=function(){const r=f.apply(this,arguments);try{const R=ui.gerp;if(!R||!S||ui.t||ui.gec)return r;const E=geRpE();if(!E){ui.gerp=null;return r}
  let h=geCerHtml(E).replace(/geCerGo\(\)/g,'geRpGo()').replace(/geCerSkip\(\)/g,'geRpSkip()').replace(/geCerExit\(\)/g,'geRpExit()').replace('>Pause<',`>${geT('Exit replay','ออกจากการดูย้อนหลัง')}<`)
   .replace('<div class="getop"><div><b>',`<div class="getop"><div><b>▶ ${geT('REPLAY','ดูย้อนหลัง')} · `).replace(/>FINISH CEREMONY</g,`>${geT('END REPLAY','จบการดูย้อนหลัง')}<`);
  const a=document.getElementById('app');let d=document.getElementById('gecerw');if(!d&&a){d=document.createElement('div');d.id='gecerw';a.appendChild(d)}if(d){d.innerHTML=h;document.body.classList.add('gecer-on')}
  try{if(typeof i18nApply=='function')i18nApply(d)}catch(x){}}catch(x){console.error(x)}return r}}
// ---- 3 & 4. archive: ceremony scenes, replay button, sister-group photos ---------------------------------------------------------
function geSubPhotos(e){try{if(!e||!e.final||typeof geIsMainE!='function'||!geIsMainE(e))return;e.photos=e.photos||[];S.groups.slice(1).forEach(g=>{const ids=geSubOf(e,g.id);if(!ids.length)return;
 if(e.photos.some(p=>p.sub==g.id))return;e.photos.push({gi:-1,sub:g.id,name:`${g.name} TOP ${ids.length}`,rows:geArrange(ids),ed:e.name,year:e.year,day:S.day})})}catch(x){console.error(x)}return e.photos}
{const f=gePhotos;gePhotos=function(e){const r=f.apply(this,arguments);geSubPhotos(e);return e.photos||r}}
function geScenes(e){const win=e.final.rows.find(r=>r.rank==1),seated=new Set(e.final.rows.filter(r=>r.rank&&!r.withdrawn&&!(win&&r.id==win.id)).map(r=>r.id));GE_CTX=e;const L=[];
 try{if(win)L.push({k:'throne',n:geT('The winner on the throne','ผู้ชนะบนบัลลังก์'),svg:gxThroneShot(e,win)})}catch(x){console.error(x)}
 try{GX_RAW=1;L.push({k:'close',n:geT('Closing ceremony','พิธีปิด'),svg:gxWide(e,{seated,throne:!!win,hosts:'both',confetti:1,screen:[gpT('THANK YOU!','ขอบคุณ!'),e.name,'']})})}catch(x){console.error(x)}finally{GX_RAW=0}
 try{GX_RAW=1;L.push({k:'stage',n:geT('All ranked members on the grand stage','สมาชิกที่ติดอันดับทั้งหมดบนเวที'),svg:gxWide(e,{seated,throne:!!win,hosts:'both',screen:[e.name,gpT('RANKING ANNOUNCEMENT CEREMONY','งานประกาศผลการจัดอันดับ'),`${S.co||''} · ${e.year||''}`]})})}catch(x){console.error(x)}finally{GX_RAW=0}
 return L}
function geOpenScene(id,k){const e=geGet(id);if(!e)return;const L=geScenes(e),s=L.find(z=>z.k==k);if(!s)return;ui.mod={t:'html',h:`<h2 class="ht">${esc(s.n)} — ${esc(e.name)}</h2><div class="gephbig gxscene">${gxAsImg(s.svg,'gxsimg',s.n)}</div>`};render()}
{const f=V.gearch;V.gearch=function(){try{const e=geS().list.find(z=>z.id==ui.gea&&z.st=='done');if(e&&e.photos)geSubPhotos(e)}catch(x){}let h=f.apply(this,arguments);try{const e=geS().list.find(z=>z.id==ui.gea&&z.st=='done');if(!e||!e.final)return h;
  const sc=geScenes(e),add=`<div class="c gescn"><div class="row"><h3 style="margin:0">${geT('Ceremony','พิธีประกาศผล')}</h3><span style="flex:1"></span><button class="b p" onclick="geRpOpen('${e.id}')">▶ ${geT('Replay the ceremony','ดูพิธีย้อนหลัง')}</button></div>
   <div class="gegal">${sc.map(s=>`<button class="gegi" onclick="geOpenScene('${e.id}','${s.k}')">${gxAsImg(s.svg,'gxsimg',s.n)}<b>${esc(s.n)}</b></button>`).join('')}</div></div>`;
  const i=h.indexOf('<h3>Group photos</h3>');h=i>=0?h.slice(0,i)+add+h.slice(i):h+add}catch(x){console.error(x)}return h}}
