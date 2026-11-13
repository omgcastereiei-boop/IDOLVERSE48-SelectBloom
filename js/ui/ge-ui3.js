// =====================================================================================
//  General Election — ceremony card, photos, profile rank frames
// -------------------------------------------------------------------------------------
//  · Rank reveal: "TOP 48" (TOP as large as the number, no ordinal suffix); next to it the change vs the
//    previous election (▲ / ▼ / ＝), NEW (yellow: never ranked before / first election) or Comeback (grey:
//    ranked before, not ranked last time).
//  · Member line: Group Team (Group 1st Gen); Concurrent Position members show both groups. No supporters.
//  · Results line: previous election · Preliminary 01 · Preliminary 02 (with the change vs Preliminary 01);
//    "Not Ranked" when not ranked.
//  · Photos: solo photos of TOP 1, TOP 2, TOP 3 and a Kami 7 group photo, before the ranking-group photos.
//  · Profile: the member's latest election rank, with a frame — TOP 1 gold, TOP 2 silver, TOP 3 bronze,
//    TOP 4–7 Kami 7 colour, Title Track Senbatsu highlighted (less than Kami 7). Unranked: nothing.
// =====================================================================================
const geTopN=n=>`<span class="getopw">TOP</span> <b>${n}</b>`;
function gePreOf(e,n){const L=(e.prelim||[]),p=L.find(z=>z.n2==n)||(L.some(z=>z.n2)?null:L[n-1]);return p||null}
function geHistOf(e,r){const m=get(r.id)||(S.alumni||[]).find(a=>a.id==r.id)||{},prevE=gePrevDone(e),pr=prevE?(prevE.final.rows.find(z=>z.id==r.id)||null):undefined,prevRank=pr===undefined?undefined:pr?pr.rank||null:null;
 const past=(m.geRec||[]).filter(h=>h.eid!=e.id),everRanked=past.some(h=>h.rank),p1=gePreOf(e,1),p2=gePreOf(e,2),rk=(p,id)=>{if(!p)return undefined;const z=p.rows.find(y=>y.id==id);return z&&z.rank?z.rank:null};
 return{prevE,prevRank,everRanked,p1:rk(p1,r.id),p2:rk(p2,r.id),hasP1:!!p1,hasP2:!!p2}}
const geArrow=(from,to)=>{if(from==null||to==null)return'';const d=from-to;return`<span class="gechg2 ${d>0?'up':d<0?'dn':''}">${d>0?'▲'+d:d<0?'▼'+(-d):'＝'}</span>`};
function geBadge(e,r){if(!r.rank)return'';const H=geHistOf(e,r);if(!H.everRanked)return'<span class="getag new">NEW</span>';if(H.prevRank==null)return'<span class="getag cb">Comeback</span>';return geArrow(H.prevRank,r.rank)}
// member line: Group Team (Group 1st Gen) / Group B Team B
geMeta=function(r){const m=r&&(get(r.id)||(S.alumni||[]).find(a=>a.id==r.id));if(!m)return r?`${esc(r.trainee?TL():r.team||'')}`:'';const g=grp(m.group),t=teamOf(m),tn=t&&isAct(m)?t.name:TLm(m);
 let s=`${esc(g?g.name:'')} ${esc(tn)}`;if(m.kn){const kg=grp(m.kn.gid),kt=kg&&(kg.teams||[]).find(x=>x.id==m.kn.tid);if(kg)s+=` / ${esc(kg.name)} ${esc(kt?kt.name:'')}`}return`${s} (${esc(g?g.name:'')} ${ordN(m.gen||1)} Gen)`};
// results line under the votes
geChg=function(r){const e=GE_CTX;if(!e||!r)return'';const H=geHistOf(e,r),it=[],v=x=>x?`<b>TOP ${x}</b>`:'<b class="nr">Not Ranked</b>';
 if(H.prevE)it.push(`<span>Last election ${v(H.prevRank)}</span>`);if(H.hasP1)it.push(`<span>Preliminary 01 ${v(H.p1)}</span>`);if(H.hasP2)it.push(`<span>Preliminary 02 ${v(H.p2)} ${geArrow(H.p1,H.p2)}</span>`);
 return it.length?`<div class="gerhist">${it.join('')}</div>`:''};
gePrevTxt=function(){return''};
{const f=geCerHtml;geCerHtml=function(e){let h=f.apply(this,arguments);try{const St=geSteps(e),s=St[Math.min(e.cp.i,St.length-1)];if(s&&s.k=='r'){const r=geRow(e,s.id);
 h=h.replace(/<div class="gernum">[\s\S]*?<\/div><div class="gerl">PLACE<\/div>/,`<div class="gernum">${geTopN(r.rank)}</div>`)
  .replace(/<div class="gernum sm">[\s\S]*?<span>PLACE<\/span><\/div>/,`<div class="gernum sm">${geTopN(r.rank)} ${geBadge(e,r)}</div>`)}}catch(err){console.error(err)}return h}}
// ---- photos: TOP 1 / TOP 2 / TOP 3 solo photos and Kami 7 ---------------------------------------------------------
{const f=gePhotos;gePhotos=function(e){const P=f.apply(this,arguments);try{if(e&&e.final&&Array.isArray(P)&&!P.some(p=>p.kind)){const R=e.final.rows.filter(r=>r.rank).sort((a,b)=>a.rank-b.rank),ex=[];
 R.slice(0,3).forEach(r=>ex.push({kind:'solo',gi:'s'+r.rank,rank:r.rank,id:r.id,name:`TOP ${r.rank} · ${r.stage}`,ed:e.name,year:e.year,day:S.day}));
 if(R.length>=4)ex.push({kind:'kami7',gi:'k7',name:R.length>=7?'Kami 7':'Top members',rows:geArrange(R.slice(0,7).map(r=>r.id)),ed:e.name,year:e.year,day:S.day});P.unshift(...ex)}}catch(err){console.error(err)}return P}}
function gePhotoSolo(e,ph){GE_CTX=e;const W=600,H=900,r=e.final.rows.find(z=>z.id==ph.id)||{},c=GE_CAPE[ph.rank]||{l:'#fff',c:'#e9c46a',d:'#a87810',n:''},id='gso'+ph.rank+'_'+(++PTC[0]);
 return`<svg class="gephoto solo" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(ph.name)}"><defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d0f33"/><stop offset=".6" stop-color="#4b2160"/><stop offset="1" stop-color="${c.d}"/></linearGradient><radialGradient id="${id}s" cx=".5" cy=".38" r=".55"><stop offset="0" stop-color="#fff6d6" stop-opacity=".75"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient></defs>
 <rect width="${W}" height="${H}" fill="url(#${id}b)"/><path d="M${W/2-60} 0L${W/2-230} ${H-150}H${W/2+230}L${W/2+60} 0Z" fill="#fff6d6" opacity=".12"/><rect width="${W}" height="${H}" fill="url(#${id}s)"/>${Array.from({length:30},(_,i)=>`<circle cx="${(i*97)%W}" cy="${(i*53)%(H*.55)}" r="${1+i%3}" fill="#fff" opacity="${.3+(i%4)*.12}"/>`).join('')}
 <ellipse cx="${W/2}" cy="${H-165}" rx="210" ry="26" fill="#000" opacity=".35"/><g transform="translate(${W/2-150} 90)">${geFig(e.snap[ph.id],ph.rank,{w:300,ex:3})}</g>
 <rect x="0" y="${H-140}" width="${W}" height="140" fill="#140a24" opacity=".88"/><rect x="0" y="${H-140}" width="${W}" height="4" fill="${c.c}"/>
 <text x="${W/2}" y="${H-82}" text-anchor="middle" font-size="46" font-weight="800" fill="${c.l}" font-family="sans-serif" letter-spacing="3">TOP ${ph.rank}</text><text x="${W/2}" y="${H-44}" text-anchor="middle" font-size="28" font-weight="700" fill="#fff" font-family="sans-serif">${esc(r.stage||'')}</text><text x="${W/2}" y="${H-14}" text-anchor="middle" font-size="16" fill="#f3d7ff">${esc(ph.ed)} · ${ph.year} · ${(r.votes||0).toLocaleString()} votes</text></svg>`}
{const f=gePhotoSvg;gePhotoSvg=function(e,ph){if(ph&&ph.kind=='solo')return gePhotoSolo(e,ph);return f.apply(this,arguments)}}
// past elections get the new photos too
function geArchPhotos(){if(!S||!S.groups)return;S.groups.forEach(g=>{try{gsWith(g.id,()=>{((S.ge&&S.ge.list)||[]).forEach(e=>{if(e.final&&e.st=='done'&&Array.isArray(e.photos)&&e.photos.length)gePhotos(e)})})}catch(err){console.error(err)}})}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{geArchPhotos()}catch(e){console.error(e)}return r}}
// ---- profile: latest election rank and frame --------------------------------------------------------------------------
function geProfRank(m){if(!m||!S||!S.groups)return null;let best=null;S.groups.forEach(g=>{const G=gsCtx(g.id,'ge');const E=((G&&G.list)||[]).filter(e=>e.st=='done'&&e.final).sort((a,b)=>(b.vEnd||0)-(a.vEnd||0))[0];if(!E)return;const row=E.final.rows.find(r=>r.id==m.id&&!r.withdrawn);if(!row)return;if(!best||(E.vEnd||0)>(best.e.vEnd||0))best={e:E,row,g}});
 if(!best||!best.row.rank)return null;const k=best.row.rank<=3?String(best.row.rank):best.row.rank<=7?'k7':best.row.gi==0?'sen':'rk';return{...best,k}}
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(cand)return h;const P=geProfRank(m);if(!P)return h;const lab={'1':'Kami 7 · 1st place','2':'Kami 7 · 2nd place','3':'Kami 7 · 3rd place',k7:'Kami 7',sen:'Senbatsu',rk:''}[P.k];
 const badge=`<div class="gepfb gepfb-${P.k}"><span class="gepfr">TOP ${P.row.rank}</span><span>${esc(P.e.name)}${S.groups.length>1?' · '+esc(P.g.name):''}${lab?` · <b>${lab}</b>`:''}</span></div>`;
 if(P.k!='rk')h=h.replace('<div class="pf">',`<div class="pf gefr gefr-${P.k}">`);h=h.replace('</h2>','</h2>'+badge)}catch(e){console.error(e)}return h}}
