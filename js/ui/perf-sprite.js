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
 // pop-ups kept for "Back" (and the open pop-up's stored html) still need their faces
 try{const keep=[ui&&ui.mod&&ui.mod.h,...((typeof MB!='undefined'&&MB.stack)||[]).map(z=>z&&z.m&&z.m.h)];keep.forEach(h=>{if(typeof h!='string')return;const re=/href="#(ps\d+)"/g;let m;while((m=re.exec(h)))used.add(m[1])})}catch(e){}
 for(const [k,y]of PT_SPR){const id=(y.u.match(/href="#([^"]+)"/)||[])[1];if(id&&!used.has(id)){PT_SPR.delete(k);const s=document.getElementById(id);if(s&&s.parentNode==el)s.remove()}}}catch(e){console.error(e)}}
{const f=render;render=function(){const r=f.apply(this,arguments);if(!PT_PRUNE){PT_PRUNE=1;(window.requestIdleCallback||(c=>setTimeout(c,200)))(ptPrune,{timeout:1500})}return r}}
// ---- iPhone / iPad / Safari (WebKit): portraits as images ------------------------------------------------------------
//  WebKit re-creates every <use> reference of the sprite as live SVG (with its masks, clip paths and gradients), which
//  can exhaust memory on iOS when a screen shows many members (the tab then crashes: "A problem repeatedly occurred").
//  On WebKit each portrait is drawn ONCE into an SVG image (data URL) and every copy on screen is that image: the page
//  stays tiny and the browser keeps a cached bitmap instead of thousands of SVG elements. Looks the same.
const PT_WK=(()=>{try{const u=navigator.userAgent||'',ios=/iPad|iPhone|iPod/.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),saf=/^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(u);return ios||saf||/[?&]ptimg=1/.test(location.search)}catch(e){return false}})();
const PT_IMG=new Map();
// then the SVG image is turned into a PNG once (in the background): the page keeps one small bitmap per member
// instead of a live SVG document per portrait; every portrait on screen switches to the PNG
function ptPng(y,vb){try{const im=new Image();im.onload=()=>{try{const sc=3,c=document.createElement('canvas');c.width=Math.round(vb[2]*sc);c.height=Math.round(vb[3]*sc);const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);
 c.toBlob(b=>{if(!b)return;const png=URL.createObjectURL(b),old=y.url;y.u=y.u.replace(old,png);y.url=png;document.querySelectorAll('image[href="'+old+'"]').forEach(e=>e.setAttribute('href',png));setTimeout(()=>{try{URL.revokeObjectURL(old)}catch(e){}},3000)},'image/png')}catch(e){}};im.src=y.url}catch(e){}}
if(PT_WK){const f0=ptUse;ptUse=function(k,t){let y=PT_IMG.get(k);if(!y){try{if(PT_IMG.size>600){PT_IMG.forEach(z=>{try{URL.revokeObjectURL(z.url)}catch(e){}});PT_IMG.clear()}const body=t.split('§').join('pi_'),mm=body.match(/^<svg([^>]*)>/);if(!mm)return f0.apply(this,arguments);
   const at=mm[1].replace(/\s(width|height)="[^"]*"/g,''),vbm=at.match(/viewBox="([^"]+)"/),vb=(vbm?vbm[1]:'0 0 100 120').split(/\s+/).map(Number),doc=body.replace(/^<svg([^>]*)>/,(x,a)=>`<svg${/xmlns=/.test(a)?a:a+' xmlns="http://www.w3.org/2000/svg"'}>`);
   const url=URL.createObjectURL(new Blob([doc],{type:'image/svg+xml'}));y={at:mm[1],url,u:`<image href="${url}" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" preserveAspectRatio="xMidYMid meet"/>`};PT_IMG.set(k,y);ptPng(y,vb)}catch(e){return f0.apply(this,arguments)}}
  return`<svg${y.at}>${y.u}</svg>`}}
// WebKit (iPhone / iPad / Safari): lighter rendering — the html element gets the class "wk" (see theme.css)
try{if(PT_WK)document.documentElement.classList.add('wk')}catch(e){}
