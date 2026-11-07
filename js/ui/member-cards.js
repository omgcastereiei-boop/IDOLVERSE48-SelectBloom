// =====================================================================================
//  Member cards (Members and Groups pages) and election rank frames
// -------------------------------------------------------------------------------------
//  · Cards are short: portrait, name, "Group 1st Gen Team" (Concurrent Position: + other group & team).
//    No popularity heart, no stat values / bars, no "Joined team" line (still in the profile history).
//  · The latest General Election rank decorates the PORTRAIT only (not the text): TOP 1 gold, TOP 2 silver,
//    TOP 3 bronze (crown + corner flourishes + shimmer), TOP 4–7 Kami 7 (star), Title Track Senbatsu (bow).
//    A "TOP n" ribbon sits on the portrait. Unranked / not running: nothing. Same frame in the profile.
// =====================================================================================
const mcLine=m=>{const g=grp(m.group),t=teamOf(m),tn=t&&isAct(m)?t.name:TL();let s=`${esc(g?g.name:'')} ${ord(m.gen||1)} Gen ${esc(tn)}`;
 if(m.kn){const kg=grp(m.kn.gid),kt=kg&&(kg.teams||[]).find(x=>x.id==m.kn.tid);if(kg)s+=` · ${esc(kg.name)} ${esc(kt?kt.name:'')}`}return s};
const GEDC_C='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 22V9Q2 2 9 2H22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M6.5 18V10.5Q6.5 6.5 10.5 6.5H18" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".75" stroke-linecap="round"/><circle cx="4.2" cy="4.2" r="2.8" fill="currentColor"/><circle cx="4.2" cy="4.2" r="1.1" fill="#fff" opacity=".85"/></svg>';
const GEDC_TOP={crown:'<svg viewBox="0 0 40 26" aria-hidden="true"><path d="M3 22L6 7L14 15L20 2L26 15L34 7L37 22Z" fill="currentColor" stroke="rgba(0,0,0,.25)" stroke-width="1"/><rect x="3" y="21" width="34" height="4" rx="1.5" fill="currentColor" stroke="rgba(0,0,0,.25)" stroke-width="1"/><circle cx="20" cy="3" r="2.3" fill="#fff"/><circle cx="6" cy="7.5" r="1.8" fill="#fff"/><circle cx="34" cy="7.5" r="1.8" fill="#fff"/><circle cx="20" cy="18" r="2" fill="#e8213b"/></svg>',
 star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l3.1 6.7 7.3.8-5.5 4.9 1.6 7.2L12 17.4 5.5 21.1l1.6-7.2L1.6 9l7.3-.8z" fill="currentColor" stroke="rgba(0,0,0,.2)" stroke-width=".8"/><circle cx="12" cy="11.5" r="2.2" fill="#fff" opacity=".8"/></svg>',
 bow:'<svg viewBox="0 0 32 20" aria-hidden="true"><path d="M16 10C11 3 3 1 2 6S8 17 16 10ZM16 10C21 3 29 1 30 6S24 17 16 10Z" fill="currentColor" stroke="rgba(0,0,0,.18)" stroke-width=".8"/><circle cx="16" cy="10" r="3" fill="currentColor" stroke="#fff" stroke-width="1"/><path d="M14 12L11 19M18 12L21 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'};
function geDeco(m){let P=null;try{P=typeof geProfRank=='function'?geProfRank(m):null}catch(e){}if(!P)return null;const k=P.k,ic=k=='1'||k=='2'||k=='3'?'crown':k=='k7'?'star':k=='sen'?'bow':'';
 const corners=k=='rk'?'':['tl','tr','bl','br'].map(c=>`<i class="gedc-c ${c}">${GEDC_C}</i>`).join('');
 return{k,cls:`gedc gedc-${k}`,html:`${corners}${ic?`<i class="gedc-ic">${GEDC_TOP[ic]}</i>`:''}<span class="gedc-rib">TOP ${P.row.rank}</span>`}}
// Members page card
{const f=mcard;mcard=function(m){let h=f.apply(this,arguments);try{h=h.replace(/<span class="mcpop"[^>]*>[\s\S]*?<\/span>/,'').replace(/<span class="mst">[\s\S]*?<\/span>/,'').replace(/<div class="mini">[\s\S]*?<\/div>/,'').replace(/<span class="mteam">[\s\S]*?<\/span>/,`<span class="mteam">${mcLine(m)}</span>`);
 const D=geDeco(m);if(D)h=h.replace('<div class="mart">',`<div class="mart ${D.cls}">${D.html}`)}catch(e){console.error(e)}return h}}
// Groups page card
{const f=mcardT;mcardT=function(m){let h=f.apply(this,arguments);try{
 h=h.replace(/<div class="st">\d+(?:st|nd|rd|th) Gen[^<]*<\/div>/,`<div class="st mtline">${mcLine(m)}</div>`).replace(/<div class="st">(?:Joined team:[^<]*|[^<]* since [^<]*|)<\/div>/,'')
  .replace('<span class="tag" style="">Active</span>','').replace(`<span class="tag" style="background:#ffe3a8">${esc(TL())}</span>`,'');
 const a=h.indexOf('<div class="c m"');if(a>=0){const i=h.indexOf('>',a)+1,j=h.indexOf('<div>',i);if(j>i){const D=geDeco(m);h=h.slice(0,i)+`<div class="mtart ${D?D.cls:''}">${D?D.html:''}${h.slice(i,j)}</div>`+h.slice(j)}}
 h=h.replace('<div class="c m" style="padding:6px;','<div class="c m" data-mt="1" style="padding:6px;')}catch(e){console.error(e)}return h}}
// profile: the frame goes on the portrait only
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{h=h.replace(/<div class="pf gefr gefr-[^"]*">/,'<div class="pf">');if(cand)return h;const D=geDeco(m);if(D)h=h.replace(/<div class="pfart"([^>]*)>/,(x,a)=>`<div class="pfart ${D.cls}"${a}>${D.html}`)}catch(e){console.error(e)}return h}}
// ---- every member portrait (pickers, lists, lineups…): election frame + TOP ribbon drawn inside the picture ---------
// Drawn in the portrait's own SVG, so layouts are unchanged. Cards that already frame the portrait (Members,
// Groups, profile) are skipped. Very small faces (< 30 px) are left plain.
let GEDX_OFF=0;const GEDX={day:-1,v:-1,M:new Map()};
function geRankC(m){if(!m||m.id==null||!S)return null;const key=S.day+'|'+S.groups.map(g=>(((gsCtx(g.id,'ge')||{}).list)||[]).filter(e=>e.st=='done').length).join(',');if(GEDX.key!==key){GEDX.key=key;GEDX.M.clear()}if(!GEDX.M.has(m.id)){let P=null;try{P=geProfRank(get(m.id)||m)}catch(e){}GEDX.M.set(m.id,P)}return GEDX.M.get(m.id)}
const GEDX_C={'1':['#fff7cf','#f1c84b','#b8860b','#3a2600'],'2':['#ffffff','#cfd6de','#8a96a3','#2a3038'],'3':['#ffe2c4','#d4935a','#8c4f22','#fff'],k7:['#f6e2ff','#b56ce8','#6d22a8','#fff'],sen:['#ffe6f0','#ff9cc2','#ff6a9e','#fff'],rk:null};
function geSvgDeco(m,svg,s){if(GEDX_OFF||!svg||(s&&s<30))return svg;const P=geRankC(m);if(!P)return svg;const v=/viewBox="([-\d.]+)[ ,]+([-\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)"/.exec(svg);if(!v)return svg;
 const[x,y,w,h]=v.slice(1).map(Number),u=Math.min(w,h),C=GEDX_C[P.k],id='gdx'+(++PTC[0]),small=s&&s<46;let o='';
 if(C){const sw=u*(small?.06:.05);o+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C[0]}"/><stop offset=".45" stop-color="${C[1]}"/><stop offset=".72" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[0]}"/></linearGradient></defs><rect x="${(x+sw/2).toFixed(2)}" y="${(y+sw/2).toFixed(2)}" width="${(w-sw).toFixed(2)}" height="${(h-sw).toFixed(2)}" rx="${(u*.12).toFixed(2)}" fill="none" stroke="url(#${id})" stroke-width="${sw.toFixed(2)}"/>`;
  if(!small&&P.k!='sen'){const c=u*.2,k=c/24,cp='<path d="M2 22V9Q2 2 9 2H22" fill="none" stroke="'+C[2]+'" stroke-width="2.6" stroke-linecap="round"/><path d="M6.5 18V10.5Q6.5 6.5 10.5 6.5H18" fill="none" stroke="'+C[1]+'" stroke-width="1.3" stroke-linecap="round"/><circle cx="4.2" cy="4.2" r="2.8" fill="'+C[1]+'"/>';
   [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([a,b,sx,sy])=>{o+=`<g transform="translate(${a.toFixed(2)} ${b.toFixed(2)}) scale(${(sx*k).toFixed(3)} ${(sy*k).toFixed(3)})">${cp}</g>`})}
  if(!small){const iw=u*(P.k=='k7'?.2:.3),ix=x+w/2-iw/2,iy=y+u*.005,ic=P.k=='k7'?'star':P.k=='sen'?'bow':'crown',vbw=ic=='crown'?40:ic=='bow'?32:24,sc=iw/vbw;
   const body=GEDX_TOP_RAW[ic].replace('currentColor',C[1]).split('currentColor').join(C[1]);o+=`<g transform="translate(${ix.toFixed(2)} ${iy.toFixed(2)}) scale(${sc.toFixed(3)})">${body}</g>`}}
 const rw=u*(small?.78:.6),rh=u*(small?.22:.16),rx0=x+w/2-rw/2,ry0=y+h-rh-u*.04,bg=C?C[1]:'#4a3474',fg=C?C[3]:'#fff';
 o+=`<rect x="${rx0.toFixed(2)}" y="${ry0.toFixed(2)}" width="${rw.toFixed(2)}" height="${rh.toFixed(2)}" rx="${(rh/2).toFixed(2)}" fill="${bg}" stroke="${C?C[2]:'#fff'}" stroke-width="${(u*.008).toFixed(2)}" opacity=".96"/><text x="${(x+w/2).toFixed(2)}" y="${(ry0+rh*.72).toFixed(2)}" text-anchor="middle" font-family="Quicksand,sans-serif" font-weight="900" font-size="${(rh*.66).toFixed(2)}" fill="${fg}">TOP ${P.row.rank}</text>`;
 const i=svg.lastIndexOf('</svg>');return i<0?svg:svg.slice(0,i)+o+svg.slice(i)}
const GEDX_TOP_RAW={crown:'<path d="M3 22L6 7L14 15L20 2L26 15L34 7L37 22Z" fill="currentColor" stroke="rgba(0,0,0,.3)" stroke-width="1"/><rect x="3" y="21" width="34" height="4" rx="1.5" fill="currentColor" stroke="rgba(0,0,0,.3)" stroke-width="1"/><circle cx="20" cy="3" r="2.3" fill="#fff"/><circle cx="20" cy="18" r="2" fill="#e8213b"/>',
 star:'<path d="M12 1.5l3.1 6.7 7.3.8-5.5 4.9 1.6 7.2L12 17.4 5.5 21.1l1.6-7.2L1.6 9l7.3-.8z" fill="currentColor" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>',
 bow:'<path d="M16 10C11 3 3 1 2 6S8 17 16 10ZM16 10C21 3 29 1 30 6S24 17 16 10Z" fill="currentColor" stroke="rgba(0,0,0,.2)" stroke-width=".8"/><circle cx="16" cy="10" r="3" fill="currentColor" stroke="#fff" stroke-width="1"/>'};
{const f=pt;pt=function(m,s){const r=f.apply(this,arguments);try{return m&&m.id!=null?geSvgDeco(m,r,s):r}catch(e){return r}}}
// cards that already frame the portrait
[['mcard'],['mcardT'],['profHtml']].forEach(([n])=>{const f=window[n];if(typeof f!='function')return;window[n]=function(){GEDX_OFF++;try{return f.apply(this,arguments)}finally{GEDX_OFF--}}});
// ---- sort: Election Rank (TOP 1 first under "Highest to Lowest"; shows "TOP n") ------------------------------------------
const GE_RKV=P=>({valueOf(){return P?1000-P.row.rank:0},toString(){return P?'TOP '+P.row.rank:'—'},toLocaleString(){return this.toString()}});
STATS.push(['geRk','Election Rank']);
function geRkDef(m){if(!m||Object.getOwnPropertyDescriptor(m,'geRk'))return;Object.defineProperty(m,'geRk',{get(){return GE_RKV(geRankC(this))},enumerable:false,configurable:true})}
{const f=render;render=function(){try{if(S&&S.members)S.members.forEach(geRkDef)}catch(e){}return f.apply(this,arguments)}}
