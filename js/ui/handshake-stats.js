// =====================================================================================
//  Handshake Events — individual member statistics
// -------------------------------------------------------------------------------------
//  · Handshake Sessions (จำนวนครั้ง): every completed interaction with a member.
//  · Unique Visitors (จำนวนคน): distinct people who met that member at least once.
//  · Total unique attendees: distinct people at the whole event (never the sum of the
//    members' unique visitors, because one fan can meet several members).
//  · The event itself (tickets, redeemed tickets, booth results, attendance, costs, new
//    fans) is unchanged. When it finishes, its redeemed tickets are given to a lightweight
//    set of event-level fan identities: exactly P.att people holding exactly the redeemed
//    tickets, so the number of sessions at each booth stays exactly as the event decided.
//    Fans with several tickets mostly revisit their favourite booth, sometimes another one.
//  · Formats: Individual → statistics per member (one session per ticket at her booth);
//    Group Handshake → statistics per booth (members of a booth share them);
//    Group Hi-Touch (High-Five Event) → no handshake statistics at all.
//  · The result is stored with the event (P.hsx) and never recomputed, so save/load does
//    not change or duplicate it.
// =====================================================================================
function hsxPick(W,tot){let k=Math.random()*tot;for(let i=0;i<W.length;i++){k-=W[i];if(k<0)return i}for(let i=W.length-1;i>=0;i--)if(W[i]>0)return i;return-1}
// simulate the people behind the booth sessions: returns unique visitors per booth and the attendee count
// count a list of visits [fan, booth]: sessions and unique visitors per booth, unique attendees overall
function hsxCount(visits,B){const ses=Array(B).fill(0),seen=Array.from({length:B},()=>new Set()),all=new Set();visits.forEach(([f,b])=>{ses[b]++;seen[b].add(f);all.add(f)});return{ses,uv:seen.map(x=>x.size),att:all.size}}
// the people behind the booth sessions: exactly `att` people holding exactly sum(cap) tickets
function hsxSim(cap,att){const B=cap.length,T=cap.reduce((a,b)=>a+b,0),A=Math.max(0,Math.min(att|0,T)),rem=cap.slice(),V=[];if(!T||!A)return{...hsxCount([],B),T};
 const k=Array(A).fill(1),own=[];for(let i=0;i<A;i++)own.push(i);for(let e=T-A;e>0;e--){const f=Math.random()<.6?own[Math.floor(Math.random()*own.length)]:Math.floor(Math.random()*A);k[f]++;own.push(f)}
 let left=T;for(let f=0;f<A;f++){let fav=-1;for(let t=0;t<k[f];t++){let b;if(fav>=0&&rem[fav]>0&&(t==0||Math.random()<.72))b=fav;else b=hsxPick(rem,left);if(b<0)break;if(fav<0)fav=b;rem[b]--;left--;V.push([f,b])}}
 return{...hsxCount(V,B),T}}
// statistics by format: Individual → per member · Group → per booth · Hi-Touch (High-Five) → none
const hsxOn=fmt=>fmt=='ind'||fmt=='grp';
function hsxCalc(P){const rows=P.rows||[],fmt=P.fmt;if(!hsxOn(fmt))return null;
 if(fmt=='grp'){const G=(P.groups||[]).map(g=>({name:g.name,m:(g.m||[]).filter(id=>rows.some(r=>r.mid==id))})).filter(g=>g.m.length),cap=G.map(g=>(rows.find(r=>r.mid==g.m[0])||{}).inter||0),R=hsxSim(cap,P.att);
  const booths=G.map((g,i)=>({name:g.name,m:g.m.slice(),ses:cap[i],uv:R.uv[i]}));return{v:2,fmt,att:R.att,ses:booths.reduce((a,b)=>a+b.ses,0),booths,made:S?S.day:null}}
 const cap=rows.map(r=>r.inter||0),R=hsxSim(cap,P.att),mem=rows.map((r,i)=>({mid:r.mid,name:r.name,ses:cap[i],uv:R.uv[i]}));return{v:2,fmt,att:R.att,ses:mem.reduce((a,x)=>a+x.ses,0),mem,made:S?S.day:null}}
function hsxOf(P){if(!P||!Array.isArray(P.rows))return null;if(!hsxOn(P.fmt)){if(P.hsx)delete P.hsx;return null}const X=P.hsx;
 if(X&&X.v===2&&X.fmt==P.fmt)return X;
 // statistics saved by the first version: Group events become booth statistics (same numbers, no recount); Individual stays as it was
 if(X&&X.v===1&&X.fmt==P.fmt){if(P.fmt=='grp'){const by=new Map();(X.mem||[]).forEach(m=>{const k=m.booth||'Booth';if(!by.has(k))by.set(k,{name:k,m:[],ses:m.ses,uv:m.uv});by.get(k).m.push(m.mid)});const booths=[...by.values()];P.hsx={v:2,fmt:'grp',att:X.att,ses:booths.reduce((a,b)=>a+b.ses,0),booths,made:X.made,ev:X.ev,day:X.day,day2:X.day2,late:X.late}}else P.hsx={...X,v:2};return P.hsx}
 P.hsx=hsxCalc(P);if(P.hsx&&P.r2done==null)P.hsx.late=1;return P.hsx}
{const f=hsRun2;hsRun2=function(ev,part){const r=f.apply(this,arguments);try{if(part==2&&ev&&ev.done&&ev.plan&&!ev.plan.hsx&&hsxOn(ev.plan.fmt)){const P=ev.plan;P.hsx=hsxCalc(P);P.hsx.ev=ev.id;P.hsx.day=ev.day;P.hsx.day2=ev.day2;P.r2done=1}}catch(e){console.error(e)}return r}}
function hsxSort(k){const s=ui.hss=ui.hss||{k:'ses',d:'d'};if(s.k==k)s.d=s.d=='d'?'a':'d';else{s.k=k;s.d=k=='name'?'a':'d'}render()}
function hsxHtml(P){if(!P||!hsxOn(P.fmt))return'';const X=hsxOf(P);if(!X)return'';const s=ui.hss=ui.hss||{k:'ses',d:'d'},F=HSF[P.fmt]||{n:''},grpM=P.fmt=='grp',dir=s.d=='a'?1:-1,arrow=k=>s.k==k?(s.d=='a'?' ▲':' ▼'):'';
 const items=grpM?X.booths.map(b=>({...b,key:b.name})):X.mem.map(x=>{const m=get(x.mid);return{...x,name:m?m.name:x.name}});
 const L=items.slice().sort((a,b)=>s.k=='name'?dir*String(a.name).localeCompare(String(b.name)):(dir*(a[s.k]-b[s.k])||b.ses-a.ses||String(a.name).localeCompare(String(b.name))));
 const topS=items.slice().sort((a,b)=>b.ses-a.ses)[0],topU=items.slice().sort((a,b)=>b.uv-a.uv)[0],same=topS&&topU&&topS===topU,unit=grpM?'booth':'member',isTS=x=>topS&&x.name==topS.name&&x.ses>0,isTU=x=>topU&&x.name==topU.name&&x.uv>0;
 const K=(a,b,c)=>`<div class="c hsxk"><small>${a}</small><b>${b}</b>${c?`<span class="st">${c}</span>`:''}</div>`;
 const who=x=>grpM?`<span class="hsxm"><span class="hsxfs">${x.m.slice(0,6).map(id=>{const m=get(id);return m?ptc(m,30):''}).join('')}${x.m.length>6?`<i>+${x.m.length-6}</i>`:''}</span><span><b>${esc(x.name)}</b><small class="st">${x.m.map(id=>esc((get(id)||{}).name||'')).join(', ')}</small>${badge(x)}</span></span>`:(()=>{const m=get(x.mid);return`<span class="hsxm">${m?ptc(m,34):''}<span><a class="hsxn" onclick="${m?`mpOpen(${m.id})`:''}">${esc(x.name)}</a>${badge(x)}</span></span>`})();
 function badge(x){const a=isTS(x),b=isTU(x);return same&&a?'<span class="tag hsxb">★ Most sessions &amp; visitors</span>':a?'<span class="tag hsxb">★ Most sessions</span>':b?'<span class="tag hsxb u">★ Most unique visitors</span>':''}
 return`<div class="hsx"><h3>${grpM?'Booth handshake statistics':'Individual handshake statistics'}</h3><p class="st">${esc(F.n)} · <b>Handshake Sessions</b> (จำนวนครั้ง) count every completed handshake, including repeat visits. <b>Unique Visitors</b> (จำนวนคน) count each person once per ${unit}.${grpM?' The members of a booth share that booth\'s statistics; they are not split between them.':''} The event total counts each person once for the whole event.</p>
 <div class="hsxks">${K('Total Handshake Sessions',X.ses.toLocaleString(),grpM?'all booths':'all members')}${K('Total unique fan attendees',X.att.toLocaleString(),'each person once')}${grpM?K('Booths',X.booths.length,`${X.booths.reduce((a,b)=>a+b.m.length,0)} members`):K('Participating members',X.mem.length)}${K(grpM?'Booth with most sessions':'Most Handshake Sessions',topS?esc(topS.name):'—',topS?topS.ses.toLocaleString()+' sessions':'')}${K(grpM?'Booth with most visitors':'Most Unique Visitors',topU?esc(topU.name):'—',topU?topU.uv.toLocaleString()+' people':'')}</div>
 <div class="hsxt" role="table"><div class="hsxr hsxh" role="row"><button class="hsxs" onclick="hsxSort('name')">${grpM?'Booth':'Member'}${arrow('name')}</button><button class="hsxs" onclick="hsxSort('ses')">Handshake Sessions${arrow('ses')}</button><button class="hsxs" onclick="hsxSort('uv')">Unique Visitors${arrow('uv')}</button></div>
 ${L.map(x=>`<div class="hsxr ${isTS(x)||isTU(x)?'top':''}" role="row">${who(x)}<b class="hsxv">${x.ses.toLocaleString()}</b><b class="hsxv">${x.uv.toLocaleString()}</b></div>`).join('')}</div>
 <p class="st">Saved with this event${X.late?' (reconstructed from the recorded event results)':''}.</p></div>`}
{const f=hsResHtml;hsResHtml=function(P){const h=f.apply(this,arguments);try{const x=hsxHtml(P);if(!x)return h;const i=h.indexOf('<h3>Members</h3>');return i>=0?h.slice(0,i)+x+h.slice(i):h+x}catch(e){console.error(e);return h}}}
