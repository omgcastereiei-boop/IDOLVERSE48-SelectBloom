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
{const f=goSec;goSec=function(k){try{const cur=secOf(view).k,last=NAVM.last[k];if(k!=cur&&last&&secOf(last).k==k){view=last;render();const y=NAVM.sc[navKey()]||0;requestAnimationFrame(()=>{try{window.scrollTo(0,y)}catch(e){}});return}}catch(e){console.error(e)}return f.apply(this,arguments)}}
{const f=ccFormGo;ccFormGo=function(iid){ui.ccSetY=window.scrollY;return f.apply(this,arguments)}}
{const f=ccFormBack;ccFormBack=function(){const y=ui.ccSetY;const r=f.apply(this,arguments);if(y!=null)requestAnimationFrame(()=>{try{window.scrollTo(0,y)}catch(e){}});return r}}
{const f=render;render=function(){let keep=null;try{const d=document.querySelector('.mod [role=dialog]');if(d&&ui.mod){const h=(d.querySelector('h2')||{}).textContent||'';const inner=[...d.querySelectorAll('.ccpk,.xeczl,.thlib,.czlist')].map(e=>e.scrollTop);keep={h,top:d.scrollTop,inner}}}catch(e){}
 const r=f.apply(this,arguments);
 try{if(S&&!ui.t)NAVM.last[secOf(view).k]=view;if(keep&&ui.mod){const d=document.querySelector('.mod [role=dialog]');if(d&&((d.querySelector('h2')||{}).textContent||'')==keep.h){d.scrollTop=keep.top;[...d.querySelectorAll('.ccpk,.xeczl,.thlib,.czlist')].forEach((e,i)=>{if(keep.inner[i]!=null)e.scrollTop=keep.inner[i]})}}}catch(e){}
 return r}}
