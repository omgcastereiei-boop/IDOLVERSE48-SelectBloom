// =====================================================================================
//  IDOLVERSE48: Select Bloom! — pages stay where you left them
// -------------------------------------------------------------------------------------
//  · Every section of the bottom / side navigation remembers the page you had open in it and
//    how far you had scrolled. Going to another section and back returns to that page and spot
//    (sub-pages such as a concert's Formation page are kept as well, they live in ui state).
//    Tapping the section you are already in still goes to its first page, as before.
//  · Concert setlist: coming back from a song's Formation page returns to the same place in
//    the setlist.
//  · Pop-ups that refresh their own content (e.g. "Add songs" after + Add) keep their scroll
//    position instead of jumping back to the top.
// =====================================================================================
const NAVM={last:{},sc:{}};
const navKey=()=>view+(ui.ccfp?'|fp:'+ui.ccfp:'')+(ui.cc?'|cc:'+ui.cc+':'+(ui.cct||''):'');
if(typeof window!='undefined')window.addEventListener('scroll',()=>{try{if(S&&!ui.t)NAVM.sc[navKey()]=window.scrollY}catch(e){}},{passive:true});
{const f=goSec;goSec=function(k){try{const cur=secOf(view).k,last=NAVM.last[k];if(k!=cur&&last&&secOf(last).k==k){
  // a remembered page that cannot be shown any more (e.g. a stage that has been performed) → the section's first page
  try{if(typeof V[last]!='function')throw new Error('no page');const v0=view;view=last;try{V[last]()}finally{view=v0}}catch(e){console.error('remembered page',last,e);delete NAVM.last[k];return f.apply(this,arguments)}
  view=last;render();const y=NAVM.sc[navKey()]||0;requestAnimationFrame(()=>{try{window.scrollTo(0,y)}catch(e){}});return}}catch(e){console.error(e)}return f.apply(this,arguments)}}
{const f=ccFormGo;ccFormGo=function(iid){ui.ccSetY=window.scrollY;return f.apply(this,arguments)}}
{const f=ccFormBack;ccFormBack=function(){const y=ui.ccSetY;const r=f.apply(this,arguments);if(y!=null)requestAnimationFrame(()=>{try{window.scrollTo(0,y)}catch(e){}});return r}}
// Pop-up scroll positions are recorded by scroll events (no layout reads while rendering — reading scrollTop
// during every render forced a full page layout and made "Next day" and releases very slow on phones).
const NAVM_POP={h:'',top:0,inner:{}};
if(typeof document!='undefined')document.addEventListener('scroll',e=>{try{const t=e.target;if(!t||!t.closest||!ui.mod)return;const d=t.closest('.mod [role=dialog]');if(!d)return;const h=((d.querySelector('h2')||{}).textContent)||'';if(h!=NAVM_POP.h){NAVM_POP.h=h;NAVM_POP.top=0;NAVM_POP.inner={}}
 if(t==d)NAVM_POP.top=d.scrollTop;else if(t.matches('.ccpk,.xeczl,.thlib,.czlist')){const k=[...d.querySelectorAll('.ccpk,.xeczl,.thlib,.czlist')].indexOf(t);if(k>=0)NAVM_POP.inner[k]=t.scrollTop}}catch(x){}},true);
{const f=render;render=function(){const r=f.apply(this,arguments);
 try{if(S&&!ui.t&&!document.querySelector('#app .svcrash'))NAVM.last[secOf(view).k]=view;if(ui.mod&&(NAVM_POP.top||Object.keys(NAVM_POP.inner).length)){const d=document.querySelector('.mod [role=dialog]');if(d){const h=((d.querySelector('h2')||{}).textContent)||'';if(h==NAVM_POP.h){if(NAVM_POP.top)d.scrollTop=NAVM_POP.top;const L=d.querySelectorAll('.ccpk,.xeczl,.thlib,.czlist');Object.entries(NAVM_POP.inner).forEach(([k,v])=>{if(L[k])L[k].scrollTop=v})}else{NAVM_POP.h=h;NAVM_POP.top=0;NAVM_POP.inner={}}}}else if(!ui.mod){NAVM_POP.h='';NAVM_POP.top=0;NAVM_POP.inner={}}}catch(e){}
 return r}}
