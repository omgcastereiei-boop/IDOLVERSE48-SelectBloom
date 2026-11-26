// =====================================================================================
//  IDOLVERSE48: Select Bloom! — CD Cover Studio: mobile workspace, Back to Production, Random Cover
//  Extends cover-canva.js (same editor, same data). Only the page structure around it changes:
//   · toolbar gets "Back to Production" (upper left) and "Random Cover" (existing plCoverRand);
//   · the tool drawer, object properties and cover tools are grouped in one panel (.cvpanel). On
//     desktop it is display:contents, so the existing grid layout is unchanged. On phones the editor
//     becomes an app-like workspace sized to the visible screen: toolbar · pinned cover · tool tabs ·
//     independently scrolling panel. The cover never scrolls away and stays fully interactive.
//   · Back to Production keeps unsaved work (S.cvWip, restored when the studio is reopened) without
//     saving, confirming or changing the production status. Random Cover keeps the saved cover
//     untouched and is one Undo away from the previous design.
// =====================================================================================
const CVM_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
let CVM_NOWIP=0;const cvmIsMob=()=>window.innerWidth<720;
function cvmDirty(){if(!ui.cd)return false;const s=S.cov&&S.cov[ui.ed];try{if(!s)return(ui.cd.layers||[]).length>0&&(ui.hu||[]).length>0;return JSON.stringify({bg:s.bg,l:s.layers})!==JSON.stringify({bg:ui.cd.bg,l:ui.cd.layers})}catch(e){return true}}
// ---- Back to Production: navigation only; unsaved work is parked, never saved or confirmed ----------------------------
function cvBackProd(){if(typeof RCCV!='undefined'&&RCCV){rcCvExit(1);render();return}
 try{if(cvmDirty()){S.cvWip={ed:ui.ed,ctx:ui.cvCtx||null,cd:JSON.stringify(ui.cd),day:S.day};toast(CVM_T('Your unsaved changes are kept. Reopen the cover to continue editing.','เก็บการแก้ไขที่ยังไม่บันทึกไว้แล้ว เปิดปกนี้อีกครั้งเพื่อแก้ต่อได้'))}}catch(e){console.error(e)}
 view=ui.cvCtx=='album'?'albums':'music';render()}
{const f=initCov;initCov=function(ed){const r=f.apply(this,arguments);try{const W=S.cvWip;if(!CVM_NOWIP&&W&&W.ed==ed&&(W.ctx||null)==(ui.cvCtx||null)){ui.cd=JSON.parse(W.cd);ui.hu=[];ui.hr=[];delete S.cvWip;toast(CVM_T('Unsaved changes restored. Save or confirm when you are ready.','กู้คืนการแก้ไขที่ยังไม่บันทึกแล้ว กดบันทึกหรือยืนยันเมื่อพร้อม'))}}catch(e){console.error(e)}return r}}
{const f=saveDraft;saveDraft=function(){const r=f.apply(this,arguments);try{if(S.cvWip&&S.cvWip.ed==ui.ed)delete S.cvWip}catch(e){}return r}}
{const f=confirmCov;confirmCov=function(){const ed=ui.ed,r=f.apply(this,arguments);try{if(S.cvWip&&S.cvWip.ed==ed&&S.cov[ed]&&S.cov[ed].status=='confirmed')delete S.cvWip}catch(e){}return r}}
// ---- Random Cover inside the studio: the existing generator, undoable, the saved cover untouched ------------------------
function cvStudioRand(){if(typeof RCCV!='undefined'&&RCCV){try{snap();ui.cd=rcCvDesign(srGet(RCCV.pid),rcS().fps[srGet(RCCV.pid).sid],true);render()}catch(e){console.error(e)}return}
 if(!ui.cd||!S.pj)return toast(CVM_T('Open a single first.','เปิดซิงเกิลก่อน'),'err');const ed=ui.ed,ctx=ui.cvCtx,old=JSON.stringify(ui.cd),hu=(ui.hu||[]).slice(),had=Object.prototype.hasOwnProperty.call(S.cov,ed),saved=had?S.cov[ed]:undefined,ask0=window.ask;
 let made=false;try{CVM_NOWIP=1;window.ask=(t,fn)=>fn();const before=S.cov[ed];plCoverRand(ed);made=S.cov[ed]!==before}finally{window.ask=ask0;CVM_NOWIP=0}
 if(!made){ui.cvCtx=ctx;return}
 // the generated design goes into the editor only; the saved cover stays as it was until Save / Confirm
 const gen=ui.cd;if(had)S.cov[ed]=saved;else delete S.cov[ed];ui.ed=ed;ui.cvCtx=ctx;ui.cd=gen;ui.cd.status='draft';ui.hu=hu.concat([old]);if(ui.hu.length>60)ui.hu.shift();ui.hr=[];view='cover';
 toast(CVM_T('Random cover created. Undo brings back your previous design.','สุ่มปกใหม่แล้ว กดย้อนกลับเพื่อกลับไปใช้แบบเดิมได้'));render()}
// ---- page structure ----------------------------------------------------------------------------------------------------------
{const f=V.cover;V.cover=function(){let h=f.apply(this,arguments);try{if(!h.includes('class="cvx"'))return h;
  const rc=typeof RCCV!='undefined'&&RCCV,back=`<button class="cvtb t cvback" onclick="cvBackProd()" title="${rc?'Back to Studio Recording':'Back to Production'}">◀ <span>${rc?'Back to Studio Recording':'Back to Production'}</span></button>`,rnd=`<button class="cvtb t cvrand" onclick="cvStudioRand()" title="Random Cover">🎲 <span>Random Cover</span></button>`;
  h=h.replace('<div class="cvtop">','<div class="cvtop">'+back).replace('<span class="cvsp"></span><button class="cvtb t" onclick="showPrev()">','<span class="cvsp"></span>'+rnd+'<button class="cvtb t" onclick="showPrev()">');
  // group drawer + properties + cover tools into one scrolling panel
  const cut=(s,a,b)=>{const i=s.indexOf(a);if(i<0)return[s,'',-1];const j=s.indexOf(b,i);if(j<0)return[s,'',-1];return[s.slice(0,i)+s.slice(j+b.length),s.slice(i,j+b.length),i]};
  let dr,pr,pt,at;[h,dr]=cut(h,'<aside class="cvdrawer','</aside>');[h,pr,at]=cut(h,'<aside class="cvprops','</aside>');[h,pt]=cut(h,'<details class="c cvprod"','</details>');
  if(at>=0)h=h.slice(0,at)+`<div class="cvpanel cvkeep" data-k="pn">${pr}${dr}${pt}</div>`+h.slice(at);
  h=h.replace('<div class="cvx">',`<div class="cvx ${cvmIsMob()?'cvmob':''}">`)}catch(e){console.error(e)}return h}}
// ---- sizing: the workspace fills the visible screen between the app header and the bottom tab bar -------------------------
function cvmLayout(){const x=document.querySelector('.cvx');if(!x)return;const mob=cvmIsMob();x.classList.toggle('cvmob',mob);const st=document.getElementById('cvstage');
 if(!mob){x.style.height='';x.style.top='';x.style.removeProperty('--cvmain');if(st){st.style.paddingLeft='';st.style.paddingRight=''}return}
 const vv=window.visualViewport,vh=vv?vv.height:window.innerHeight,hd=document.querySelector('.hd'),nav=document.querySelector('.nav'),hdB=hd?Math.max(0,hd.getBoundingClientRect().bottom):0,
  navH=nav&&getComputedStyle(nav).display!='none'&&vh>=window.innerHeight*.8?nav.getBoundingClientRect().height:0,avail=Math.max(320,vh-hdB-navH-6),kb=vv&&vv.height<window.innerHeight*.75;
 x.style.top=hdB+'px';x.style.height=avail+'px';const top=x.querySelector('.cvtop'),rail=x.querySelector('.cvrail'),act=x.querySelector('.cvact'),tH=top?top.offsetHeight:44,rH=rail?rail.offsetHeight:56,aH=act?act.offsetHeight:0,W=x.clientWidth;
 const ideal=W*CVH/512+aH+16,room=avail-tH-rH-18,mainH=Math.max(150,Math.min(ideal,room*(kb?.42:.72)));x.style.setProperty('--cvmain',Math.round(mainH)+'px');
 if(st){const sh=mainH-aH-4,fitW=Math.min(W-16,(sh-16)*512/CVH),pad=Math.max(8,(W-fitW)/2);st.style.paddingLeft=pad+'px';st.style.paddingRight=pad+'px'}
 cvmTrim(x,hdB);try{cvOverlay()}catch(e){}}
// the page must not scroll the editor under the header: nothing is left below the aligned workspace
function cvmTrim(x,hdB){const w=x.closest('.cvxw')||x;const cur=parseFloat(w.style.marginBottom)||0,aligned=window.scrollY+x.getBoundingClientRect().top-hdB,extra=document.documentElement.scrollHeight-(aligned+window.innerHeight);if(Math.abs(extra)>1)w.style.marginBottom=Math.min(0,cur-extra)+'px'}
{const f=render;render=function(){const first=view=='cover'&&ui.cvmView!==ui.ed+'|'+(ui.cvCtx||'');const r=f.apply(this,arguments);
 if(view=='cover'&&document.querySelector('.cvx')){cvmLayout();if(first&&cvmIsMob()){ui.cvmView=ui.ed+'|'+(ui.cvCtx||'');const x=document.querySelector('.cvx'),hd=document.querySelector('.hd'),y=window.scrollY+x.getBoundingClientRect().top-(hd?hd.getBoundingClientRect().height:0);window.scrollTo(0,Math.max(0,y));setTimeout(()=>{const x2=document.querySelector('.cvx');if(!x2)return;const hd2=document.querySelector('.hd');window.scrollTo(0,Math.max(0,window.scrollY+x2.getBoundingClientRect().top-(hd2?hd2.getBoundingClientRect().height:0)));cvmLayout()},120)}}
 else if(view!='cover')ui.cvmView=null;return r}}
window.addEventListener('resize',()=>{if(view=='cover')cvmLayout()});if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{if(view=='cover')cvmLayout()});
// ---- fullscreen studio (like the Costume Studio): game header and bottom tab bar hidden, the editor fills the screen ----------
const cvFs=()=>document.body.classList.contains('cvfs');
function cvFsTog(){const on=!cvFs();document.body.classList.toggle('cvfs',on);ui.cvFs=on?1:0;try{const el=document.documentElement;if(on){const rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq)rq.call(el).catch&&rq.call(el).catch(()=>{})}else{const ex=document.exitFullscreen||document.webkitExitFullscreen;if((document.fullscreenElement||document.webkitFullscreenElement)&&ex)ex.call(document)}}catch(e){}render()}
{const f=V.cover;V.cover=function(){let h=f.apply(this,arguments);try{if(h.includes('class="cvtop"'))h=h.replace('<div class="cvtop">',`<div class="cvtop"><button class="cvtb t cvfsb" onclick="cvFsTog()" title="${cvFs()?CVM_T('Exit full screen','ออกจากเต็มจอ'):CVM_T('Full screen','เต็มจอ')}">${cvFs()?'⤡':'⛶'} <span>${cvFs()?CVM_T('Exit','ออก'):CVM_T('Full screen','เต็มจอ')}</span></button>`)}catch(e){console.error(e)}return h}}
// leaving the studio leaves full screen
{const f=render;render=function(){if(view!='cover'&&cvFs()){document.body.classList.remove('cvfs');ui.cvFs=0;try{const ex=document.exitFullscreen||document.webkitExitFullscreen;if((document.fullscreenElement||document.webkitFullscreenElement)&&ex)ex.call(document)}catch(e){}}return f.apply(this,arguments)}}
