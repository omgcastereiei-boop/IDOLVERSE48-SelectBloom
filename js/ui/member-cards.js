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
