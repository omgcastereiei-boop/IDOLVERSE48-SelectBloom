// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Member profile: Discography & history layout
// -------------------------------------------------------------------------------------
//  The "Discography & Achievements" tab shows, in this order:
//   1. Team History       — oldest first; group/team/leadership moves only
//                           ("Joined OMG48 as 1st Generation", "Promoted to Team O", …)
//   2. Senbatsu Election  — "OMG48 1st General Election: 12th Place (Senbatsu)"
//   3. Senbatsu           — per group (her own group first, then the other groups she sang for),
//                           each split into A-Sides (title track / album main song) and B-Sides.
//                           Released songs re-used on an album are not counted again.
//  Birthdays, Birthday Stages, debut and "first Senbatsu" notes are no longer listed here.
// =====================================================================================
const PF_TEAM_EV=new Set(['group_join','group_transfer','team_join','team_transfer','team_leave','demote','reclass','gcap','cap','vice','lead_end','kennin','kennin_end','kennin_change','cap_start','cap_end','org_lead','team_disband','group_disband','graduate']);
function pfTeamText(e,E,m){const tn=String(e.tname||'').trim();
 if(e.t=='group_join'){const g=e.gname||(grp(e.gid)||{}).name||'the group',gen=e.gen||(e.gid==null||e.gid==m.group?m.gen:null);return`Joined ${esc(g)}${gen?` as ${ord(gen)} Generation`:''}`}
 if(e.t=='team_join'){const prom=E.some(p=>p.t=='promote'&&p.day==e.day);return`${prom?'Promoted to':'Joined'} ${esc(tn||'a team')}`}
 return evText(e)}
function pfTeamHtml(m){const E=(m.mh||[]).map((e,i)=>({...e,_i:i})).sort((a,b)=>(a.day??0)-(b.day??0)||a._i-b._i),L=E.filter(e=>PF_TEAM_EV.has(e.t)),g=grp(m.group),t=teamOf(m);
 return`<h3>Team History <span class="st">(oldest first)</span></h3><div class="st">${(S.members||[]).includes(m)?`Current: ${g?esc(g.name):'No group'}${t?' · '+esc(t.name):''} · ${isAct(m)&&t?'Active':esc(TLm(m))}`:`<span>Former member</span> · ${g?esc(g.name):""} · ${esc((typeof CT_ST!='undefined'&&typeof ctStatus=='function'&&CT_ST[ctStatus(m)])||'Graduated')}`}</div><ul class="pfl">${L.map(e=>`<li><b>${pfTeamText(e,E,m)}</b> <span class="st">· ${jd(e.day)}</span></li>`).join('')||'<li class="st">No team history recorded yet.</li>'}</ul>`}
// group that held an election (elections live in each group's own context)
function pfElGroup(eid){for(const g of (S.groups||[])){const c=g.id==S.ag?S:g.ctx,L=c&&c.ge&&Array.isArray(c.ge.list)?c.ge.list:[];if(L.some(x=>x&&x.id==eid))return g.name}return null}
function pfElecHtml(m){const E=(m.mh||[]).map((e,i)=>({...e,_i:i})).filter(e=>e.t=='ge').sort((a,b)=>(a.day??0)-(b.day??0)||a._i-b._i);
 const rn=n=>typeof geRn=='function'?geRn(n):ord(n)+' Place';
 return`<h3>Senbatsu Election</h3><ul class="pfl">${E.map(e=>{const gname=pfElGroup(e.eid)||(grp(m.group)||{}).name||'';return`<li><b>${gname?`<span>${esc(gname)}</span> `:''}<span>${esc(e.ename||'General Election')}</span>: <span>${e.rank?rn(e.rank):'Unranked'}</span>${e.rank&&e.gname?` (<span>${esc(e.gname)}</span>)`:''}</b> <span class="st">· ${jd(e.day)}</span></li>`}).join('')||'<li class="st">No election yet.</li>'}</ul>`}
function pfSenHtml(m){const rel=h=>S.singles.find(x=>x.rid==h.rid)||(S.albums||[]).find(a=>a.id==h.rid)||(()=>{for(const g of (S.groups||[])){if(g.id==S.ag||!g.ctx)continue;const x=(g.ctx.singles||[]).find(z=>z.rid==h.rid)||(g.ctx.albums||[]).find(a=>a.id==h.rid);if(x)return x}return null})();
 const ym=d=>d==null?'':jd(d);
 // re-used songs on an album are not a new Senbatsu
 const reused=h=>{const r=rel(h);if(!r)return false;const T=(r.trk||[]).find(t=>t.id==h.song);if(T)return!!T.reused;const o=S.songs[h.song];return!!(r.kind=='album'&&o&&o.relDay!=null&&r.relDay!=null&&o.relDay<r.relDay)};
 const H=(m.hist||[]).filter(h=>!reused(h)).slice().sort((a,b)=>(a.day??0)-(b.day??0)||plRidNo(a.rid)-plRidNo(b.rid));
 const isA=h=>{const r=rel(h);return h.cat=='main'||!!(r&&r.kind=='album'&&r.mainId==h.song)};
 const mainOf=h=>{const r=rel(h);if(!r)return h.rel||'';if(r.kind=='album')return'Album: '+(r.title||'');const o=S.songs[r.mainId];return o?o.title:(r.title||'')};
 const li=(h,b)=>{const r=rel(h),alb=r&&r.kind=='album';return`<li><b>${esc(h.title)}</b>${b?` <span class="st">(${esc(mainOf(h))})</span>`:alb?' <span class="st">(Album)</span>':''} <span class="st">· ${ym(h.day)}</span>${h.center?' <span class="tag rrUR">Center</span>':''}</li>`};
 // her own group first, then every other group in company order
 const gidOf=h=>h.gid!=null?h.gid:m.group,own=m.group,ids=[...new Set(H.map(gidOf))].sort((a,b)=>(a==own?-1:0)-(b==own?-1:0)||(S.groups||[]).findIndex(g=>g.id==a)-(S.groups||[]).findIndex(g=>g.id==b));
 const tot=H.length,A0=H.filter(isA).length;
 return`<h3>Senbatsu</h3><div class="row"><span class="pill">A-Sides ${A0}</span><span class="pill">B-Sides ${tot-A0}</span><span class="pill">Center ×${H.filter(h=>h.center).length}</span></div>${ids.map(gid=>{const G=H.filter(h=>gidOf(h)==gid),A=G.filter(isA),B=G.filter(h=>!isA(h)),gn0=(grp(gid)||{}).name||(G[0]&&G[0].gname)||'Group';
  return`<div class="shist pfsen"><h4><span>${esc(gn0)}</span> <span>Senbatsu</span></h4><h5>A-Sides</h5><ul>${A.map(h=>li(h,0)).join('')||'<li class="st">None yet.</li>'}</ul><h5>B-Sides</h5><ul>${B.map(h=>li(h,1)).join('')||'<li class="st">None yet.</li>'}</ul></div>`}).join('')||'<p class="st">No Senbatsu yet.</p>'}`}
// the tab: Team History → Senbatsu Election → Senbatsu (tlHtml is folded into histHtml)
histHtml=function(m){return pfTeamHtml(m)+pfElecHtml(m)+pfSenHtml(m)};
tlHtml=function(){return''};
// Former Members: the same Discography & Achievements as in the group (Team History → Senbatsu Election → Senbatsu),
// and the same compact Birthday Stage history (date · age · photos) as the member profile
function pfBdHtml(m){const L=(m.bdh||[]).slice().reverse();if(!L.length)return'';return`<details open><summary class="st">Birthday Stage history (${L.length})</summary><ul class="ms">${L.map(b=>`<li>${jd(b.day)} · age ${b.age}${b.img&&b.pf?` <button class="b s" onclick="bdPhotoOpen('${b.pf}',${m.id})">📸</button>`:''}</li>`).join('')}</ul></details>`}
{const f=ctFormerOpen;ctFormerOpen=function(id){f.apply(this,arguments);try{const m=ctMem(id);if(!m||!ui.mod||ui.mod.t!='html')return;let h=ui.mod.h;
 const cut=(start)=>{const i=h.indexOf(start);if(i<0)return;const j=h.indexOf('</ul></div>',i);if(j<0)return;h=h.slice(0,i)+h.slice(j+11)};
 cut('<div class="c"><h3>Birthday Stage history</h3>');cut('<div class="c"><h3>History</h3>');
 h+=`<div class="c pfdisc"><h2 class="ht">Discography &amp; Achievements</h2>${histHtml(m)}${pfBdHtml(m)}</div>`;ui.mod.h=h;render()}catch(e){console.error(e)}}}
