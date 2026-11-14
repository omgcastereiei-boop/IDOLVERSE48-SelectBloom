// =====================================================================================
//  General Election — vote count & voting statistics (revealed only after the results)
// -------------------------------------------------------------------------------------
//  · Nothing is shown while voting is open: the data below is recorded silently.
//  · Recording (from the existing fan-behaviour voting of election2.js, no extra votes):
//    every time a fan segment's CDs (= vote tokens) are given to candidates (geGive), the
//    tokens each candidate receives are added to a behaviour class of that candidate:
//      fan type (casual / regular / dedicated / hardcore / collector / dormant)
//      × relation (k = Kami Oshi supporters · o = Oshi / multi-member voters · f = floating fans)
//    together with the class's buyer pool (distinct fans who buy: fans × buying probability ×
//    share of those fans who support that member) and the tokens one buyer gives that member
//    (quantity per buyer × the part of her CDs that go to that member). Classes use stable
//    keys, so segment splits / merges during the voting never count a fan twice.
//  · At the close: unique voters per class = min(buyer pool, tokens ÷ tokens per buyer),
//    reduced to fans with at least one CAST token (uncast tokens expire). Total Votes are the
//    member's real cast votes (e.votes) and still decide the ranking (existing rules).
//    Average = Total Votes ÷ Unique Voters (0 when nobody voted).
//  · A permanent snapshot is stored in e.final.vs (names, ranks, votes, voters, behaviour mix),
//    so history never changes after graduation, transfers, team or Oshi changes.
// =====================================================================================
const GEV_FT={casual:'Casual',oshi:'Regular',dedicated:'Dedicated',hardcore:'Hardcore',collector:'Collector',dormant:'Dormant'};
const GEV_REL={k:'Kami Oshi supporters',o:'Oshi / multi-member voters',f:'Floating fans'};
// ---- silent recording -------------------------------------------------------------------------------------------------------
{const f=geGive;geGive=function(e,P,u,FW){if(!e||!P||!(u>0))return f.apply(this,arguments);const b0={},B=e.buy||{};for(const k in B)b0[k]=B[k];const r=f.apply(this,arguments);try{geVxRec(e,P,b0,FW)}catch(x){console.error(x)}return r}}
function geVxRec(e,P,b0,FW){if(e.final||e.st=='done')return;const X=e.vx=e.vx||{from:S.day,c:{}},s=P.s,ft=s.ft||'casual',n=s.n||0,p=P.p||0,q=Math.max(1,P.q||1),k2=e.k2||1,sc=(P.mk||1)*(P.mot||1)*Math.max(1,k2),pk=p*Math.min(1,k2);
 let fw=null,fwT=0;const FWx=()=>{if(!fw){fw=FW||geFloatW(e);for(const k in fw)fwT+=fw[k]}return fw};
 for(const k in e.buy){const d=(e.buy[k]||0)-(b0[k]||0);if(d<=0)continue;const mid=+k,shm=(P.sh&&P.sh[k])||0,rel=P.kc==mid?'k':shm>0?'o':'f';
  // distinct buying fans of this segment who support this member, and the tokens one of them gives her
  let E,a;if(rel=='k'){E=n*pk;a=q*shm*sc}else if(rel=='o'){const oj=Math.max(1,Math.min(n,(s.o||{})[mid]||0));E=oj*pk;a=q*shm*n/oj*sc}else{const F=FWx(),sh=fwT?(F[mid]||0)/fwT:0,fl=(P.sh&&P.sh._f)||0;E=n*pk*fl*sh;a=q*fl*sc}
  a=Math.max(1,a);E=Math.max(E,1);const M=X.c[mid]=X.c[mid]||{},key=ft+'|'+rel,c=M[key]=M[key]||{T:0,Aw:0,E:0,Ed:0,d:S.day};
  if(c.d!=S.day){c.E=Math.max(c.E,c.Ed);c.Ed=0;c.d=S.day}c.Ed+=E;c.T+=d;c.Aw+=d*a}}
// ---- snapshot at the close ------------------------------------------------------------------------------------------------
function geVsBuild(e){const F=e.final;if(!F||F.vs)return F&&F.vs;const X=e.vx;if(!X||!X.c)return F.vs={v:1,none:1};const partial=X.from>e.vStart;
 const rows=F.rows.map(r=>{const C=X.c[r.id]||{},votes=r.votes||0,buy=(e.buy||{})[r.id]||0,cf=buy>0?Math.min(1,votes/buy):0;let uv=0,heavyV=0,mixV={},mixU={};
  Object.entries(C).forEach(([key,c])=>{const E=Math.max(c.E,c.Ed),a=c.T>0?c.Aw/c.T:1,U=Math.min(E,c.T/a),Uc=U*(1-Math.pow(1-cf,Math.max(1,a))),Vc=c.T*cf;uv+=Uc;const[ft,rel]=key.split('|');
   if(Uc>0&&Vc/Uc>=10)heavyV+=Vc;mixV[rel]=(mixV[rel]||0)+Vc;mixU[rel]=(mixU[rel]||0)+Uc;const g=ft=='hardcore'||ft=='collector'?'heavy':ft=='casual'||ft=='dormant'?'casual':'dedicated';mixV[g]=(mixV[g]||0)+Vc;mixU[g]=(mixU[g]||0)+Uc});
  uv=votes>0?Math.max(1,Math.min(votes,Math.round(uv))):0;const R=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,Math.round(v)]));
  return{id:r.id,name:r.name,stage:r.stage,rank:r.rank,wd:r.withdrawn?1:0,votes,uv,avg:uv?Math.round(votes/uv*100)/100:0,heavy:votes?Math.round(heavyV/votes*1000)/10:0,mv:R(mixV),mu:R(mixU)}});
 return F.vs={v:1,day:S.day,partial:partial?X.from:null,rows}}
{const f=geClose;geClose=function(e){const r=f.apply(this,arguments);try{if(e&&e.final&&!e.final.vs)geVsBuild(e);if(e&&e.final&&e.vx)delete e.vx}catch(x){console.error(x)}return r}}
// ---- dashboard (completed elections only) -------------------------------------------------------------------------------------
const geVsOk=e=>!!(e&&e.st=='done'&&e.final&&e.final.vs&&!e.final.vs.none);
function geVsPrev(e){const p=gePrevDone(e);return geVsOk(p)?new Map(p.final.vs.rows.map(r=>[r.id,r])):null}
function geVsSort(k){const o=ui.gevs=ui.gevs||{k:'rank',d:1};if(o.k==k)o.d=-o.d;else{o.k=k;o.d=k=='rank'?1:-1}render()}
function geVsHtml(e){if(!e||e.st!='done'||!e.final)return'';const V=e.final.vs;GE_CTX=e;
 if(!V||V.none)return`<div class="c gevs"><div class="row"><span class="gefinb">VOTING STATISTICS</span><h3 style="margin:0">Vote count &amp; voters</h3></div><p class="st">This election was held before voter tracking existed, so only the official vote totals above are available.</p></div>`;
 const P=geVsPrev(e),o=ui.gevs=ui.gevs||{k:'rank',d:1},key={rank:r=>r.rank||1e6+(r.wd?1:0),votes:r=>r.votes,uv:r=>r.uv,avg:r=>r.avg}[o.k]||(r=>r.rank||1e6);
 const rows=V.rows.slice().sort((a,b)=>(key(a)-key(b))*o.d||((a.rank||1e6)-(b.rank||1e6)));const N=x=>Math.round(x||0).toLocaleString(),A=x=>(x||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
 const best=(f,flt)=>{const L=V.rows.filter(r=>!r.wd&&(flt?flt(r):true));return L.length?L.reduce((a,b)=>f(b)>f(a)?b:a):null};
 const H=[['🏆 Highest Total Votes',best(r=>r.votes),r=>N(r.votes)+' votes'],['👥 Most Unique Voters',best(r=>r.uv),r=>N(r.uv)+' voters'],['📈 Highest Average Votes per Voter',best(r=>r.avg,r=>r.uv>0),r=>A(r.avg)+' votes / voter'],
  ['🆕 Largest Increase in Unique Voters',P?best(r=>r.uv-(P.get(r.id)||{uv:0}).uv,r=>P.has(r.id)):null,r=>'+'+N(r.uv-P.get(r.id).uv)+' vs previous election'],
  ['⬆ Largest Increase in Total Votes',P?best(r=>r.votes-(P.get(r.id)||{votes:0}).votes,r=>P.has(r.id)):null,r=>'+'+N(r.votes-P.get(r.id).votes)+' vs previous election'],
  ['🔥 Highest Concentration per Supporter',best(r=>r.heavy,r=>r.votes>0),r=>`${r.heavy}% of her votes from heavy voters (10+ votes each)`]];
 const card=([t,r,f])=>`<div class="gevh">${r?`${gePor(e.snap[r.id],r.rank&&r.rank<=3?r.rank:0,46,e)}<div><small>${t}</small><b>${esc(r.stage||r.name)}</b><span>${r&&f(r)}</span></div>`:`<div><small>${t}</small><span class="st">No previous election with statistics to compare.</span></div>`}</div>`;
 const th=(k,n)=>`<th><button class="gevsb ${o.k==k?'on':''}" onclick="geVsSort('${k}')">${n}${o.k==k?(o.d>0?' ▲':' ▼'):''}</button></th>`;
 const mix=r=>{const t=Math.max(1,r.votes),seg=[['heavy','#d6457f'],['dedicated','#b28be8'],['casual','#9fd3ff']].map(([k,c])=>`<i style="width:${((r.mv[k]||0)/t*100).toFixed(1)}%;background:${c}" title="${k}: ${N(r.mv[k])} votes · ${N(r.mu[k])} voters"></i>`).join('');return`<span class="gevmix">${seg}</span>`};
 const tr=r=>{const pv=P&&P.get(r.id);return`<tr class="${r.wd?'wd':''}"><td class="gevm">${gePor(e.snap[r.id],r.rank&&r.rank<=3?r.rank:0,34,e)}<div><b>${esc(r.stage||r.name)}</b>${mix(r)}</div></td><td>${r.wd?'Withdrawn':r.rank?ordN(r.rank):'Unranked'}</td><td><b>${N(r.votes)}</b>${pv?`<small class="${r.votes>=pv.votes?'up':'dn'}">${r.votes>=pv.votes?'+':'−'}${N(Math.abs(r.votes-pv.votes))}</small>`:''}</td><td>${N(r.uv)}${pv?`<small class="${r.uv>=pv.uv?'up':'dn'}">${r.uv>=pv.uv?'+':'−'}${N(Math.abs(r.uv-pv.uv))}</small>`:''}</td><td>${A(r.avg)}</td></tr>`};
 return`<div class="c gevs"><div class="row"><span class="gefinb">VOTING STATISTICS</span><h3 style="margin:0">Vote count &amp; voters · ${esc(e.name)}</h3></div>
 <p class="st">Revealed after the official announcement. Total Votes decide the ranking. Unique Voters count each fan once per member (a fan who supported several members counts once for each). Average = Total Votes ÷ Unique Voters.${V.partial!=null?` Voters were tracked from ${jd(V.partial)} (this election was already running when tracking was added).`:''}</p>
 <div class="gevhl">${H.map(card).join('')}</div><p class="st">Highlights are statistical observations — not awards. Bar under each name: votes from <b style="color:#d6457f">heavy</b> · <b style="color:#9b7fe0">regular &amp; dedicated</b> · <b style="color:#5aa9e6">casual</b> voters.</p>
 <div class="gevtw"><table class="gevt"><thead><tr><th>Member</th>${th('rank','Final Rank')}${th('votes','Total Votes')}${th('uv','Unique Voters')}${th('avg','Avg / Voter')}</tr></thead><tbody>${rows.map(tr).join('')}</tbody></table></div></div>`}
{const f=V.gearch;V.gearch=function(){let h=f.apply(this,arguments);try{const e=geS().list.find(z=>z.id==ui.gea&&z.st=='done');if(e)h+=geVsHtml(e)}catch(x){console.error(x)}return h}}
// the General Election page links the last completed election's statistics
{const f=V.ge;V.ge=function(){let h=f.apply(this,arguments);try{const e=geCur();if(!e||e.st=='done'){const D=geS().list.filter(z=>z.st=='done'&&z.final),last=D.at(-1);if(last&&last.final.vs&&!last.final.vs.none){const b=`<div class="c gevlink"><b>📊 ${esc(last.name)} — voting statistics</b><span class="st">Total votes, unique voters and average votes per voter of every member.</span><button class="b s p" onclick="ui.gea='${last.id}';goView('gearch')">Open</button></div>`;const i=h.indexOf('<div class="c gestart">');h=i<0?h+b:h.slice(0,i)+b+h.slice(i)}}}catch(x){console.error(x)}return h}}
