// =====================================================================================
//  IDOLVERSE48: Select Bloom! — keep the portrait sprite small
// -------------------------------------------------------------------------------------
//  Portraits are drawn once into a hidden sprite (characters.js: ptUse) and reused. The sprite was
//  only cleared after 4000 faces, so in a long game it held thousands of SVG elements and every
//  screen update re-styled all of them ("Next day" and "+7" became slow). After each screen update,
//  while the browser is idle, faces that are no longer on screen are removed from the sprite
//  (they are simply drawn again when needed).
// =====================================================================================
let PT_PRUNE=0;
function ptPrune(){PT_PRUNE=0;try{const el=document.getElementById('ptspr');if(!el||PT_SPR.size<=40)return;const used=new Set();document.querySelectorAll('use[href^="#ps"]').forEach(u=>used.add(u.getAttribute('href').slice(1)));
 for(const [k,y]of PT_SPR){const id=(y.u.match(/href="#([^"]+)"/)||[])[1];if(id&&!used.has(id)){PT_SPR.delete(k);const s=document.getElementById(id);if(s&&s.parentNode==el)s.remove()}}}catch(e){console.error(e)}}
{const f=render;render=function(){const r=f.apply(this,arguments);if(!PT_PRUNE){PT_PRUNE=1;(window.requestIdleCallback||(c=>setTimeout(c,200)))(ptPrune,{timeout:1500})}return r}}
