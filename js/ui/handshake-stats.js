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
//  · Formats: Individual (one session per ticket at one member's booth), Group (one session
//    per ticket with every member of the shared booth), High-Five (each ticket = one walk
//    down the line: one session with every member).
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
function hsxCalc(P){const rows=P.rows||[],fmt=P.fmt,mem=[];let att=0;
 if(fmt=='hf'){const n=rows.length?Math.max(...rows.map(r=>r.inter||0)):0;att=Math.min(P.att||0,n);rows.forEach(r=>mem.push({mid:r.mid,name:r.name,ses:r.inter||0,uv:(r.inter||0)?att:0}))}
 else if(fmt=='grp'){const G=(P.groups||[]).map(g=>({name:g.name,m:(g.m||[]).filter(id=>rows.some(r=>r.mid==id))})).filter(g=>g.m.length),cap=G.map(g=>(rows.find(r=>r.mid==g.m[0])||{}).inter||0),R=hsxSim(cap,P.att);att=R.att;
  G.forEach((g,i)=>g.m.forEach(id=>{const r=rows.find(z=>z.mid==id);mem.push({mid:id,name:r.name,ses:cap[i],uv:R.uv[i],booth:g.name})}));rows.forEach(r=>{if(!mem.some(x=>x.mid==r.mid))mem.push({mid:r.mid,name:r.name,ses:0,uv:0})})}
 else{const cap=rows.map(r=>r.inter||0),R=hsxSim(cap,P.att);att=R.att;rows.forEach((r,i)=>mem.push({mid:r.mid,name:r.name,ses:cap[i],uv:R.uv[i]}))}
 return{v:1,fmt,att,ses:mem.reduce((a,x)=>a+x.ses,0),mem,made:S?S.day:null}}
function hsxOf(P){if(!P||!Array.isArray(P.rows))return null;if(!P.hsx||P.hsx.v!==1){P.hsx=hsxCalc(P);if(P.r2done==null)P.hsx.late=1}return P.hsx}
{const f=hsRun2;hsRun2=function(ev,part){const r=f.apply(this,arguments);try{if(part==2&&ev&&ev.done&&ev.plan&&!ev.plan.hsx){const P=ev.plan;P.hsx=hsxCalc(P);P.hsx.ev=ev.id;P.hsx.day=ev.day;P.hsx.day2=ev.day2;P.r2done=1}}catch(e){console.error(e)}return r}}
const HSX_K=[['ses','Handshake Sessions'],['uv','Unique Visitors'],['name','Member']];
function hsxSort(k){const s=ui.hss=ui.hss||{k:'ses',d:'d'};if(s.k==k)s.d=s.d=='d'?'a':'d';else{s.k=k;s.d=k=='name'?'a':'d'}render()}
function hsxHtml(P){const X=hsxOf(P);if(!X)return'';const s=ui.hss=ui.hss||{k:'ses',d:'d'},F=HSF[P.fmt]||{n:''},L=X.mem.slice(),dir=s.d=='a'?1:-1;
 L.sort((a,b)=>s.k=='name'?dir*String(a.name).localeCompare(String(b.name)):(dir*(a[s.k]-b[s.k])||b.ses-a.ses||String(a.name).localeCompare(String(b.name))));
 const topS=X.mem.slice().sort((a,b)=>b.ses-a.ses)[0],topU=X.mem.slice().sort((a,b)=>b.uv-a.uv)[0],same=topS&&topU&&topS.mid==topU.mid,nm=x=>{const m=get(x.mid);return m?m.name:x.name},arrow=k=>s.k==k?(s.d=='a'?' ▲':' ▼'):'';
 const K=(a,b,c)=>`<div class="c hsxk"><small>${a}</small><b>${b}</b>${c?`<span class="st">${c}</span>`:''}</div>`;
 return`<div class="hsx"><h3>Individual handshake statistics</h3><p class="st">${esc(F.n)} · <b>Handshake Sessions</b> (จำนวนครั้ง) count every completed handshake, including repeat visits. <b>Unique Visitors</b> (จำนวนคน) count each person once per member. The event total counts each person once for the whole event, even if she met several members.${P.fmt=='grp'?' In a Group Handshake every member of a booth meets every visitor of that booth.':P.fmt=='hf'?' At a High-Five Event every visitor greets every member each time she walks the line.':''}</p>
 <div class="hsxks">${K('Total Handshake Sessions',X.ses.toLocaleString(),'all members')}${K('Total unique fan attendees',X.att.toLocaleString(),'each person once')}${K('Participating members',X.mem.length)}${K('Most Handshake Sessions',topS?esc(nm(topS)):'—',topS?topS.ses.toLocaleString()+' sessions':'')}${K('Most Unique Visitors',topU?esc(nm(topU)):'—',topU?topU.uv.toLocaleString()+' people':'')}</div>
 <div class="hsxt" role="table"><div class="hsxr hsxh" role="row"><button class="hsxs" onclick="hsxSort('name')">Member${arrow('name')}</button><button class="hsxs" onclick="hsxSort('ses')">Handshake Sessions${arrow('ses')}</button><button class="hsxs" onclick="hsxSort('uv')">Unique Visitors${arrow('uv')}</button></div>
 ${L.map(x=>{const m=get(x.mid),tS=topS&&x.mid==topS.mid&&x.ses>0,tU=topU&&x.mid==topU.mid&&x.uv>0;return`<div class="hsxr ${tS||tU?'top':''}" role="row"><span class="hsxm">${m?ptc(m,34):''}<span><a class="hsxn" onclick="${m?`mpOpen(${m.id})`:''}">${esc(nm(x))}</a>${x.booth?`<small class="st">${esc(x.booth)}</small>`:''}${same&&tS?'<span class="tag hsxb">★ Most sessions &amp; visitors</span>':tS?'<span class="tag hsxb">★ Most sessions</span>':tU?'<span class="tag hsxb u">★ Most unique visitors</span>':''}</span></span><b class="hsxv">${x.ses.toLocaleString()}</b><b class="hsxv">${x.uv.toLocaleString()}</b></div>`}).join('')}</div>
 <p class="st">Saved with this event${X.late?' (reconstructed from the recorded event results)':''}. Repeat visits: ${X.ses&&X.mem.reduce((a,x)=>a+x.uv,0)?(X.ses/Math.max(1,X.mem.reduce((a,x)=>a+x.uv,0))).toFixed(2):'0'} sessions per visitor per member on average.</p></div>`}
{const f=hsResHtml;hsResHtml=function(P){const h=f.apply(this,arguments);try{const x=hsxHtml(P);if(!x)return h;const i=h.indexOf('<h3>Members</h3>');return i>=0?h.slice(0,i)+x+h.slice(i):h+x}catch(e){console.error(e);return h}}}
