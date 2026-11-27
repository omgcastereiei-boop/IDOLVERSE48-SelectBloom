// =====================================================================================
//  EXTERNAL EVENT SYSTEM — Part 2: evaluation per category, results, member / group / fan impact,
//  energy & health, organizer relationships, finance, cancellation, reports, history, Music Programs
// -------------------------------------------------------------------------------------
//  · Each category has its own criteria built from existing stats (Vocal, Dance, Passion, Variety,
//    Performance, Loyalty, Morale, Buzz/Trend, affinities, fans, popularity) + wellness efficiency.
//  · Results: Excellent / Great / Good / Average / Poor. Popularity gains are not equal: visibility
//    (solo booking, Center, front positions) and individual performance decide.
//  · Fans: group fans through the existing fanbase (fbWith), member recognition (m.fans) and exposure
//    (fbExp: drives Oshi / Kami Oshi choices); one Kami Oshi per fan is preserved by the fanbase rules.
//  · Money: fixed payment (earn) + company expenses (ledger), recorded once (r.paid).
//  · Music Programs: 1–3 appearances generated when a single is released, Title Track Senbatsu only.
// =====================================================================================
const xeCh=m=>cl(Math.round(((m.variety||0)+(m.cha||0)+Math.min(100,40+(m.traits||[]).length*15))/3));
const xeApp=m=>{const v=Object.values(m.aff||{}).map(Number).filter(Number.isFinite);return v.length?Math.max(...v):50};
const xeProf=m=>cl(Math.round(((m.loy??50)+(m.mor??50))/2)),xeEngS=m=>cl(Math.round((m.pas??50)*.5+(m.variety??50)*.5));
const XE_MUS=[['Vocal',m=>m.sing,.22],['Dance',m=>m.dance,.22],['Passion',m=>m.pas,.14],['Song Popularity',(m,c)=>c.song,.12],['Performance Efficiency',(m,c)=>c.eff(m)*100,.1],['Group Coordination',(m,c)=>c.coord,.1],['Audience Engagement',m=>m.pop,.1]];
const XE_EVAL={music:XE_MUS,mp:XE_MUS,
 corp:[['Professionalism',xeProf,.3],['Reliability',m=>m.loy,.2],['Member Popularity',m=>m.pop,.25],['Event Participation',m=>m.pas,.25]],
 media:[['Variety',m=>m.variety,.35],['Character',xeCh,.25],['Communication',m=>(m.variety+m.cha)/2,.2],['Entertainment Value',m=>m.buzz,.2]],
 school:[['Popularity',m=>m.pop,.35],['Audience Engagement',xeEngS,.3],['Performance Quality',m=>(m.sing+m.dance)/2,.2],['Event Participation',m=>m.pas,.15]],
 fashion:[['Character',xeCh,.2],['Appearance',xeApp,.3],['Brand Compatibility',(m,c)=>c.brand(m),.2],['Popularity',m=>m.pop,.15],['Professionalism',xeProf,.15]],
 cm:[['Popularity',m=>m.pop,.3],['Brand Compatibility',(m,c)=>c.brand(m),.25],['Character',xeCh,.15],['Professionalism',xeProf,.15],['Public Recognition',m=>cl(Math.round(14*Math.log10(1+m.fans))),.15]],
 charity:[['Audience Engagement',xeEngS,.3],['Participation',m=>m.pas,.25],['Professionalism',xeProf,.2],['Public Image',m=>((m.loy??50)+(m.mor??50))/2,.25]],
 special:[['Popularity',m=>m.pop,.3],['Communication',m=>(m.variety+m.cha)/2,.3],['Character',xeCh,.2],['Audience Engagement',xeEngS,.2]]};
const XE_ACTSTAT={live:m=>(m.sing+m.dance)/2,talk:m=>m.variety,guest:m=>m.pop,photo:xeApp,fashion:xeApp,cm:m=>m.pop,mc:m=>m.variety,promo:m=>m.pas};
const XE_EN={live:r=>6+(r.songs||1)*4,talk:()=>5,guest:()=>6,photo:()=>6,fashion:()=>10,cm:r=>8+Math.round((r.et-r.st)/60)*2,mc:()=>8,promo:()=>7};
const XE_REACH={music:[1,.05],corp:[1,.02],media:[25,.0025],school:[1,.04],fashion:[3,.012],cm:[40,.0012],charity:[1,.03],special:[2,.02]};
const xeGrade=v=>v>=85?'Excellent':v>=72?'Great':v>=58?'Good':v>=45?'Average':'Poor';
function xeOut(a,l){finOut(a,l)} // central Financial Engine (js/core/finance.js)
// ---- running the event -----------------------------------------------------------------------------------------------------------
// floor: an event that went reasonably well brings more new group fans than an average Theater show of the booked group(s)
function xeFanFloor(r,q){if(q<=-.1)return 0;let n=0,c=0;try{((r.gr&&r.gr.length)?r.gr.map(e=>e.gid):[gsAg()]).forEach(gid=>gsWith(gid,()=>((S.th&&S.th.pf)||[]).slice(-12).forEach(p=>{const a=p.aud||{};if(a.trial==null&&a.liveNew==null)return;n+=(a.liveNew||0)+(a.trial||0)*(a.conv||0);c++})))}catch(e){}
 const th=c?n/c:40,lv=Math.max(0,Math.min(5,r.lv|0));return Math.round(th*(1.6+.4*lv)*Math.max(.25,Math.min(1.25,(q+.25)/1.3))*(.9+Math.random()*.2))}
function xeRun(r){if(!r||r.status!='accepted')return;const X=xeS(),org=X.orgs[r.org];const want=(r.sel||[]).slice(),here=want.filter(id=>xeOk(get(id))),miss=want.filter(id=>!here.includes(id));
 if(!here.length){xeCancel(r,'company','Every participating member is unavailable on the day (health, leave or departure)',true);return}
 const M=here.map(get),gid0=r.gid??gsGid(M[0]);
 const song=(()=>{try{if(r.ch=='mp')return gsWith(r.gid,()=>thSongPop(S.songs[r.song]));const L=(r.set||[]).map(z=>gsWith(z.gid,()=>thSongPop(S.songs[z.song])));return L.length?avg(L):50}catch(e){return 40}})();
 const cnt={};M.forEach(m=>{const k=m.tid?'t'+m.tid:'g'+gsGid(m);cnt[k]=(cnt[k]||0)+1});const coord=Math.round(50+50*Math.max(...Object.values(cnt))/M.length);
 const eff=m=>{const w=wlOf(m);return(.6+.4*Math.min(1,(m.en|0)/50))*(w.mh<40?.9:1)*(w.ph<40?.9:1)};
 const c={song,coord,eff,brand:m=>((m.aff||{})[r.brand])??50},CR=XE_EVAL[r.cat]||XE_MUS,notes=[];
 // visibility: solo bookings, Centers and front positions stand out
 const vis={};M.forEach(m=>{let v=r.mode=='org'?(M.length==1?1.8:1.1):1;if(r.set&&r.set.length){const cn=r.set.filter(z=>z.center==m.id).length,fr=r.set.filter(z=>z.o.indexOf(m.id)>=0&&z.o.indexOf(m.id)<3).length;v+=.45*cn/r.set.length+.15*fr/r.set.length}if(r.ch=='mp'&&(r.cen||[]).includes(m.id))v+=.6;vis[m.id]=+v.toFixed(2)});
 const crit=CR.map(([n])=>[n,0]);
 const mem=M.map(m=>{let b=0;CR.forEach(([n,fn,w],i)=>{const v=cl(Math.round(+fn(m,c)||0));crit[i][1]+=v/M.length;b+=v*w});const w=wlOf(m),e=eff(m);let sc=b*e+(Math.random()-.5)*12,note='';
  if(((m.en|0)<25||w.mh<30||w.ph<30)&&Math.random()<.4){sc-=12;note='Made a mistake (low energy / health)'}return{id:m.id,nm:m.name,gn:(grp(gsGid(m))||{}).name||'',sc:Math.round(cl(sc)),eff:+e.toFixed(2),vis:vis[m.id],note}});
 const avgSc=avg(mem.map(z=>z.sc)),acts=r.acts.map(k=>{const f=XE_ACTSTAT[k]||(m=>m.pop);return[XE_ACT[k]?XE_ACT[k][0]:k,Math.round(cl(.6*avgSc+.4*avg(M.map(m=>+f(m)||50))+(Math.random()-.5)*10))]});
 let overall=.6*avgSc+.4*avg(acts.map(a=>a[1]));if(r.mode=='player'&&r.n&&here.length<r.n)overall-=Math.min(15,(r.n-here.length)*3);if(miss.length)overall-=Math.min(20,miss.length*8);overall=Math.round(cl(overall));
 const g=xeGrade(overall),aPop=avg(M.map(m=>m.pop)),orgSat=Math.round(cl(overall+(aPop-50)*.15+(r.mode=='org'?4:0)-miss.length*12)),aud=['music','school','charity','mp'].includes(r.cat)||r.acts.includes('live')?Math.round(cl(overall*.8+aPop*.2+(Math.random()-.5)*8)):null;
 // impact
 const q=Math.max(-.3,Math.min(1.4,(overall-45)/40)),RC=r.ch=='mp'?[(r.prog&&r.prog.aud||2e6)/XE_LV[r.lv][3],.0006]:XE_REACH[r.cat]||[1,.02],reach=XE_LV[r.lv][3]*RC[0];
 const ids=new Set(here);let G=Math.max(0,Math.round(reach*RC[1]*Math.max(0,q+.25)*(.8+Math.random()*.4)));
 G=Math.max(G,xeFanFloor(r,q));
 if(G>0){try{fbWith('xe',()=>{S.fans+=G},{org:(r.ch=='mp'?'Music program · ':'External event · ')+r.name})}catch(e){S.fans+=G}}
 const wsum=mem.reduce((a,z)=>a+z.vis*Math.pow(Math.max(1,z.sc),2),0)||1;
 mem.forEach(z=>{const m=get(z.id);if(!m)return;const p0=m.pop,f0=m.fans,ps0=m.pas;const share=Math.round(G*z.vis*Math.pow(Math.max(1,z.sc),2)/wsum);if(share>0){m.fans+=share}
  const d=fbRound(Math.max(0,Math.log10(1+reach)/2.2*z.vis*Math.max(0,q)*(z.sc/70)));if(d>0)gainPop(m,d);else{m.buzz=cl(m.buzz+(q>0?1:0));m.pop=popOf(m)}
  if(z.sc>=70&&(m.en|0)>=30&&Math.random()<.5)m.pas=cl(m.pas+1);if(z.note||(m.en|0)<20)m.pas=cl(m.pas-1);if((r.cat=='media'||r.cat=='special')&&q>.5&&Math.random()<.25&&m.variety<100)m.variety++;
  const en=r.acts.reduce((a,k)=>a+(XE_EN[k]?XE_EN[k](r):6),0)+((r.et-r.st)>=480?10:0);const e0=m.en|0;m.en=Math.max(0,e0-en);try{wlWork([m.id],{load:Math.round(en/2),str:q<0?3:1,mh:q>.6?1:0},'external event')}catch(e){}
  try{fbExp(m.id,+(z.vis*Math.max(0,q)*.6).toFixed(2))}catch(e){}Object.assign(z,{dPop:m.pop-p0,fans:m.fans-f0,en:e0-m.en,pas:m.pas-ps0})});
 if(g=='Excellent'||g=='Great'){try{fbBoost(s=>ids.has(s.k),1,1);fbApply()}catch(e){}}
 // finance (once)
 let fin=null;if(!r.paid){const E=xeExp({...r,sel:here});earn(r.pay,(r.ch=='mp'?'Music program: ':'External event: ')+r.name);E.it.forEach(([n,a])=>xeOut(a,`${n}: ${r.name}`));fin={gross:r.pay,it:E.it,exp:E.t,net:r.pay-E.t};r.paid=1}
 // reputation & organizer
 const k=Math.max(-1.5,Math.min(2,(overall-60)/25))*Math.sqrt(r.lv+1)/2,X2=xeS();X2.rep.co=+((X2.rep.co||0)+k*.6).toFixed(2);const gids=[...new Set(M.map(m=>gsGid(m)))],gd={};gids.forEach(gid=>{X2.rep.g[gid]=+((X2.rep.g[gid]||0)+k).toFixed(2);gd[gid]=+k.toFixed(2)});
 let orel=null;if(org){const b=org.sat;org.sat=cl(org.sat+(orgSat-60)/3);if(!org.ev.includes(r.id))org.ev.push(r.id);orel={b:Math.round(b),a:Math.round(org.sat),st:xeOrgSt(org)};
  if(org.sat>=80&&Math.random()<.25){const cat=org.cat&&XE_CAT[org.cat]?org.cat:'special',ref=xeMake('direct',{cat});if(ref){ref.ref=org.nm;ref.cond=[`Referred by ${org.nm}.`,...ref.cond];xeNote(`🤝 <b>${esc(org.nm)}</b> referred the company to <b>${esc(ref.orgNm)}</b>: ${esc(ref.name)} · ${yen(ref.pay)}.`,ref.id)}}}
 // music program: the single and its Title Track
 let mpx=null;if(r.ch=='mp'){try{gsWith(r.gid,()=>{const x=S.singles.find(z=>z.rid==r.rid),o=S.songs[r.song];const vis1=Math.round((r.prog.aud/1e5)*Math.max(0,q)*(.8+Math.random()*.4));if(x)x.vis=(x.vis||0)+vis1;let tp=0;if(o){tp=+(Math.max(0,q)*1.6*r.prog.pre/100).toFixed(2);o.thPop=Math.min(30,(o.thPop||0)+tp)}mpx={vis:vis1,tp}})}catch(e){}}
 r.status='done';r.end=S.day;r.fin=fin||r.fin;r.res={g,overall,orgSat,aud,crit:crit.map(([n,v])=>[n,Math.round(v)]),acts,mem,miss:miss.map(id=>(ctMem(id)||{}).name||'#'+id),fans:{G,mem:mem.reduce((a,z)=>a+(z.fans||0),0)},rep:{co:+(k*.6).toFixed(2),g:gd},org:orel,mp:mpx,reach:Math.round(reach)};
 gsSched().res.forEach(z=>{if(z.xe==r.id&&z.st=='ok')z.st='done'});
 xeNote(`${r.ch=='mp'?'📺':'🎟'} <b>${esc(r.name)}</b> — <b>${g}</b> · organizer satisfaction ${orgSat}${aud!=null?` · audience ${aud}`:''} · ${fin?yen(fin.net)+' net':''} · +${G.toLocaleString()} fans`,r.id)}
// ---- cancellation -------------------------------------------------------------------------------------------------------------------
function xeCancel(r,by,why,valid){if(!r||r.status!='accepted')return;const X=xeS(),org=X.orgs[r.org],E=xeExp(r),inPrep=S.day>=r.day-r.prep,inc=inPrep?Math.round(E.t*.35):0;let pen=0;
 if(by=='company'){if(!valid){pen=Math.round(r.pay*.3);xeOut(pen,`Contract penalty: ${r.name}`)}if(inc)xeOut(inc,`Expenses incurred: ${r.name}`);if(org)org.sat=cl(org.sat-(valid?5:20));if(!valid)X.rep.co=+((X.rep.co||0)-.5).toFixed(2)}
 r.status='cancelled';r.end=S.day;r.cx={by,why,valid:!!valid,pen,inc,reimb:by=='org'?inc:0,day:S.day};if(org&&!org.ev.includes(r.id))org.ev.push(r.id);
 gsSched().res.forEach(z=>{if(z.xe==r.id&&z.st=='ok')z.st='cx'});xeNote(`⚠ <b>${esc(r.name)}</b> was cancelled by ${by=='org'?'the organizer':'the company'}: ${esc(why)}.${pen?` Contract penalty ${yen(pen)}.`:''}${by=='org'&&inc?` Expenses incurred (${yen(inc)}) are reimbursed.`:''}`,r.id)}
function xeCancelAsk(id){const r=xeGet(id);if(!r||r.status!='accepted')return;const bad=(r.sel||[]).map(get).filter(m=>!xeOk(m)||(wlOf(m).ph<40||wlOf(m).mh<40)),pen=Math.round(r.pay*.3);
 ui.mod={t:'html',h:`<h2 class="ht">Cancel “${esc(r.name)}”?</h2><p class="st">After acceptance, a cancellation without a valid reason costs a contract penalty of 30% (${yen(pen)}) and hurts the relationship with ${esc(r.orgNm)}. A valid reason (a participant's health or departure) has no penalty.</p>
 ${bad.length?`<p class="ok">Valid reason available: ${bad.map(m=>esc(m?m.name:'a member')).join(', ')} (health / availability).</p>`:'<p class="thwarn">No valid reason right now: every participant is available and healthy.</p>'}
 <div class="row">${bad.length?`<button class="b p" onclick="xeCancelGo('${id}',1)">Cancel — member health / availability</button>`:''}<button class="b s" onclick="xeCancelGo('${id}',0)">Cancel anyway (${yen(pen)} penalty)</button><button class="b s" onclick="ui.mod=null;render()">Keep the booking</button></div>`};render()}
function xeCancelGo(id,valid){const r=xeGet(id);if(!r)return;ui.mod=null;xeCancel(r,'company',valid?'Member health / availability':'Company decision (no valid reason)',!!valid);render()}
// ---- daily: organizer cancellations (with a reason) and event days ---------------------------------------------------------------------
const XE_OCX=['Heavy rain and wind forecast — the outdoor programme was called off','The venue had to close for safety inspections','The organizer postponed the campaign indefinitely','The broadcast schedule changed'];
function xeDay2(){const X=xeS();if(!X)return;X.list.forEach(r=>{if(r.status!='accepted')return;if(r.day>S.day){const out=r.cat=='music'&&/Outdoor|City|Festival/.test(r.type)||r.cat=='charity';if(r.ch!='mp'&&Math.random()<(out?.003:.0008))xeCancel(r,'org',out?XE_OCX[0]:xePick(XE_OCX.slice(1)),true);return}xeRun(r)})}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{xeDay2()}catch(e){console.error(e)}return r}}
// ---- reports ------------------------------------------------------------------------------------------------------------------------------
function xeReportHtml(r){if(r.status=='cancelled'&&r.cx){const c=r.cx;return`<div class="c xerep"><h3>Cancellation</h3><p>Cancelled by <b>${c.by=='org'?'the organizer':'the company'}</b> on ${jd(c.day)} — ${esc(c.why)}.</p><div class="gekg">${thKpi('Contract penalty',yen(c.pen||0),c.valid?'valid reason':'no valid reason')}${thKpi('Expenses incurred',yen(c.inc||0),c.reimb?'reimbursed by the organizer':'paid by the company')}</div></div>`}
 const R=r.res;if(!R)return'';const F=r.fin||{gross:0,it:[],exp:0,net:0};
 return`<div class="c xerep"><h3>Event report</h3><div class="gekg">${thKpi('Result',`<span class="xeg ${R.g}">${R.g}</span>`,`overall ${R.overall}`)}${thKpi('Organizer satisfaction',R.orgSat)}${R.aud!=null?thKpi('Audience satisfaction',R.aud):''}${thKpi('Reach',R.reach.toLocaleString(),r.ch=='mp'?'viewers (thousands-scaled)':'people reached')}${thKpi('New group fans','+'+R.fans.G.toLocaleString(),`member recognition +${R.fans.mem.toLocaleString()}`)}</div>
 ${R.miss&&R.miss.length?`<p class="st thwarn">Absent: ${R.miss.map(esc).join(', ')} (no automatic replacement).</p>`:''}
 <h4>Evaluation criteria (${esc(r.ch=='mp'?'Music Program':(XE_CAT[r.cat]||{}).n||'')})</h4><div class="xecrit">${R.crit.map(([n,v])=>`<div><small>${esc(n)}</small><span class="sebar"><i style="width:${v}%"></i></span><b>${v}</b></div>`).join('')}</div>
 <h4>Activity results</h4><div class="xecrit">${R.acts.map(([n,v])=>`<div><small>${esc(n)}</small><span class="sebar"><i style="width:${v}%"></i></span><b>${v} · ${xeGrade(v)}</b></div>`).join('')}</div>
 <h4>Member results</h4><div class="wrap"><table><tr><th>Member</th><th>Score</th><th>Energy</th><th>Passion</th><th>Popularity</th><th>Fans</th></tr>${R.mem.slice().sort((a,b)=>b.sc-a.sc).map(z=>`<tr><td>${(()=>{const m=ctMem(z.id);return m?ptc(m,24):''})()} ${esc(z.nm)}<small class="st"> ${esc(z.gn||'')}${z.note?' · '+esc(z.note):''}</small></td><td>${z.sc}</td><td>−${z.en|0}</td><td>${z.pas>0?'+':''}${z.pas|0}</td><td>${z.dPop>0?'+':''}${z.dPop|0}</td><td>+${(z.fans|0).toLocaleString()}</td></tr>`).join('')}</table></div>
 <h4>Financial results</h4><table class="gskv"><tr><th>Gross income (fixed payment)</th><td>${yen(F.gross)}</td></tr>${F.it.map(([n,a])=>`<tr><th>${esc(n)}</th><td>−${yen(a)}</td></tr>`).join('')}<tr><th>Total expenses</th><td>−${yen(F.exp)}</td></tr><tr><th><b>Net profit / loss</b></th><td><b>${yen(F.net)}</b></td></tr></table>
 <h4>Reputation</h4><p class="st">Company ${R.rep.co>=0?'+':''}${R.rep.co} · ${Object.entries(R.rep.g).map(([g,v])=>`${esc((grp(+g)||{}).name||'Group')} ${v>=0?'+':''}${v}`).join(' · ')}${R.org?` · ${esc(r.orgNm)}: satisfaction ${R.org.b} → ${R.org.a} (${R.org.st})`:''}</p>
 ${R.mp?`<h4>Music program impact</h4><p class="st">Single visibility +${R.mp.vis.toLocaleString()} · Title Track popularity +${R.mp.tp}</p>`:''}</div>`}
V.xerep=function(){const L=xeS().list.filter(r=>r.status=='done').sort((a,b)=>b.day-a.day);const tot=L.reduce((a,r)=>{const F=r.fin||{gross:0,exp:0,net:0};a.g+=F.gross;a.e+=F.exp;a.n+=F.net;return a},{g:0,e:0,n:0});
 return`<h2 class="ht">Event Reports</h2><div class="gekg">${thKpi('Completed events',L.length)}${thKpi('Gross income',yen(tot.g))}${thKpi('Expenses',yen(tot.e))}${thKpi('Net profit',yen(tot.n))}</div><div class="xegrid">${L.slice(0,30).map(r=>xeCard(r,`<span class="tag xeg ${(r.res||{}).g}">${(r.res||{}).g||''}</span>`)).join('')||emptyBox('No completed event yet.','📊')}</div>`};
V.xehist=function(){const F=ui.xehf=ui.xehf||{st:'',cat:'',q:''},q=(F.q||'').toLowerCase(),L=xeS().list.filter(r=>r.status!='open'&&(!F.st||r.status==F.st)&&(!F.cat||r.cat==F.cat)&&(!q||(r.name+' '+r.orgNm+' '+(r.selN||r.req||[]).map(z=>z.nm).join(' ')).toLowerCase().includes(q))).sort((a,b)=>b.day-a.day);
 return`<h2 class="ht">Event History</h2><p class="st">Every booking is kept with its artwork, members (as they were at the time), results and money — also after members graduate, transfer or change teams.</p><div class="c"><div class="row"><input placeholder="Search event, organizer or member" value="${esc(F.q)}" onchange="ui.xehf.q=this.value;render()"><select onchange="ui.xehf.st=this.value;render()"><option value="">All statuses</option>${['done','accepted','cancelled','declined','expired'].map(s=>`<option value="${s}" ${F.st==s?'selected':''}>${XE_ST[s]}</option>`).join('')}</select><select onchange="ui.xehf.cat=this.value;render()"><option value="">All categories</option>${[...Object.entries(XE_CAT).map(([c,v])=>[c,v.n]),['mp','Music Program']].map(([c,n])=>`<option value="${c}" ${F.cat==c?'selected':''}>${esc(n)}</option>`).join('')}</select></div></div>
 <div class="c">${L.slice(0,ui.xehn||60).map(r=>`<button class="fbrow xerow" onclick="xeOpen('${r.id}')">${xeArt(r,'xs')}<span>${jd(r.day)}</span><b>${esc(r.name)}</b>${xeTag(r)}${r.res?`<span class="tag xeg ${r.res.g}">${r.res.g}</span>`:''}<span>${r.fin?yen(r.fin.net):yen(r.pay)}</span></button>`).join('')||'<p class="st">No history yet.</p>'}${L.length>(ui.xehn||60)?`<button class="b s" onclick="ui.xehn=(ui.xehn||60)+60;render()">Show more</button>`:''}</div>`};

// =====================================================================================
//  MUSIC PROGRAM APPEARANCES (generated by every new single)
// =====================================================================================
const XE_MP=[
 {id:'mst',nm:'Music Station Tonight',net:'Star Asahi TV (fictional)',fmt:'Major national music show',pop:92,aud:9000000,pre:95,style:'Full live performance on a large studio set',iv:'Short talk with the host',req:'Full Title Track Senbatsu · Title Track costume',seg:['Title Track live performance','Short artist introduction','Group interview'],acts:['live','talk'],dow:5,st:20*60,et:21*60+54,stu:'Roppongi Studio A',hue:210},
 {id:'cdl',nm:'Countdown Live Live!',net:'TBN Tokyo (fictional)',fmt:'Live performance and chart show',pop:80,aud:5000000,pre:80,style:'Live performance + weekly ranking',iv:'Chart comment from the Center',req:'Title Track Senbatsu · live vocals',seg:['Title Track live performance','Member introduction','Chart ranking segment'],acts:['live','talk'],dow:1,st:19*60,et:20*60+57,stu:'Akasaka Studio G',hue:330},
 {id:'v101',nm:'Venue 101 Next',net:'Nippon Public Broadcast (fictional)',fmt:'Contemporary performance and interview',pop:66,aud:2500000,pre:72,style:'Studio performance with a live band feel',iv:'Center interview',req:'Title Track Senbatsu · interview prepared',seg:['Title Track live performance','Center interview','Behind-the-scenes segment'],acts:['live','talk'],dow:6,st:23*60,et:23*60+45,stu:'Shibuya Hall 101',hue:270},
 {id:'bzr',nm:'Buzz Rhythm 03',net:'Nichiyo TV (fictional)',fmt:'Music performance and artist talk',pop:70,aud:3000000,pre:70,style:'Performance + relaxed talk corner',iv:'Group talk with comedians',req:'Title Track Senbatsu · variety talk',seg:['Title Track live performance','Group interview','Special music program segment'],acts:['live','talk'],dow:5,st:23*60+30,et:24*60-5,stu:'Shiodome Studio 3',hue:20},
 {id:'yng',nm:'Youth Beat Tokyo',net:'Sakura TV (fictional)',fmt:'Youth-oriented music program',pop:58,aud:1800000,pre:55,style:'Bright set, dance-focused stage',iv:'Member introduction game',req:'Title Track Senbatsu · dance version',seg:['Title Track live performance','Member introduction','Behind-the-scenes segment'],acts:['live','guest'],dow:3,st:18*60,et:18*60+55,stu:'Odaiba Studio 7',hue:140},
 {id:'sfs',nm:'Seasonal Music Festival Special',net:'Star Asahi TV (fictional)',fmt:'Special seasonal music broadcast',pop:88,aud:12000000,pre:90,style:'Multi-hour live broadcast, festival stage',iv:'Short group comment',req:'Title Track Senbatsu · festival stage costume',seg:['Title Track live performance','Special music program segment','Group interview'],acts:['live','talk'],dow:6,st:18*60,et:22*60,stu:'Makuhari Broadcast Stage',hue:45,season:[5,6,11]}];
function xeMpGen(x){if(!x||x.mpGen)return[];x.mpGen=1;const X=xeS(),o=S.songs[x.mainId];if(!o)return[];const line=(o.slots||[]).filter(Boolean).filter(id=>get(id));if(!line.length)return[];
 const gid=gsAg(),g=grp(gid),rep=xeGRep(gid),mon=dt().getMonth(),P=XE_MP.filter(p=>!p.season||p.season.includes(mon)).sort((a,b)=>(b.pop*(.5+Math.random())-(a.pop*(.5+Math.random()))));
 const n=Math.max(1,Math.min(3,1+(Math.random()<.35+rep/200?1:0)+(Math.random()<.15+rep/250?1:0))),out=[],used=new Set();
 for(const p of P){if(out.length>=n)break;let day=null;for(let d=S.day+2;d<=S.day+24;d++){if(dowOf(d)!=p.dow%7||used.has(d))continue;if(line.every(id=>xeFree(id,d))){day=d;break}}if(day==null)continue;used.add(day);
  const org=xeOrg('media',p.net),lv=p.pre>=88?5:p.pre>=75?4:p.pre>=65?3:2;
  const r={id:'xe'+(++X.seq),ch:'mp',cat:'mp',type:p.fmt,name:`${p.nm} — “${o.title}”`,org:org.id,orgNm:p.net,lv,venue:p.stu,loc:'Tokyo',dist:0,st:p.st,et:Math.min(1439,p.et),acts:p.acts.slice(),songs:1,perfMin:5,mode:'org',made:S.day,status:'open',
   prog:{id:p.id,nm:p.nm,net:p.net,fmt:p.fmt,pop:p.pop,aud:p.aud,pre:p.pre,style:p.style,iv:p.iv,req:p.req,seg:p.seg.slice()},gid,rid:x.rid,song:x.mainId,title:o.title,single:x.title,cen:(o.centers||[]).slice(),
   req:line.map(id=>{const m=get(id);return{mid:id,gid,nm:m.name,gn:g?g.name:''}}),gr:[{gid,gn:g?g.name:''}],day};r.n=r.req.length;r.prep=1;r.dl=Math.max(S.day+1,day-1);
  const sp=avg(line.map(id=>get(id).pop)),sales=Math.log10(1+(x.sales||0));r.pay=Math.max(30000,Math.round(62500*(p.pre/50)*Math.pow(p.aud/3e6,.35)*(.6+rep/100)*(.7+sp/120)*(.75+sales/14)*(.8+line.length/40)/10000)*10000);
  r.cond=['Fixed appearance fee — no negotiation.','Performers: exactly the Title Track Senbatsu of the single (no changes, no substitutes).',`Program requirements: ${p.req}.`,'Cancellation by the company without a valid reason: 30% of the fee.'];
  r.art=xeArtMake(r,line,x.mainId);r.art.prog={nm:p.nm,net:p.net};r.art.hue=p.hue;X.list.push(r);out.push(r)}
 return out}
{const f=doRelease;doRelease=function(){const n=S.singles.length;const r=f.apply(this,arguments);try{const x=S.singles[n];if(x&&S.singles.length>n){const L=xeMpGen(x);if(L.length)xeNote(`📺 Music program offers for “${esc(x.title)}”: ${L.map(r=>`${esc(r.prog.nm)} (${jd(r.day)}, ${yen(r.pay)})`).join(' · ')}. Accept them in External Events › Music Programs.`,L[0].id);if(L.length&&ui.mod&&ui.mod.t=='html')ui.mod.h+=`<div class="c xempn"><h3>📺 Music program offers for “${esc(x.title)}”</h3><p class="st">The Title Track Senbatsu is invited to ${L.length} music program(s). Accept them in External Events › Music Programs.</p>${L.map(r=>`<div class="fbrow"><b>${esc(r.prog.nm)}</b><span>${wd(r.day)} ${xeHM(r.st)}</span><span>${yen(r.pay)}</span><button class="b s" onclick="xeOpen('${r.id}')">Open</button></div>`).join('')}</div>`}}catch(e){console.error(e)}return r}}
function xeMpHtml(r){const p=r.prog||{};return`<div class="c xemp"><h3>📺 ${esc(p.nm||'')}</h3><div class="gekg">${thKpi('Format',esc(p.fmt||''))}${thKpi('Network',esc(p.net||''))}${thKpi('Program popularity',p.pop)}${thKpi('Audience size',(p.aud||0).toLocaleString(),'viewers')}${thKpi('Prestige',p.pre)}${thKpi('Interview',esc(p.iv||'—'))}</div>
 <p class="st">${esc(p.style||'')} · Requirements: ${esc(p.req||'')}</p><p>Single <b>“${esc(r.single||'')}”</b> · Title Track <b>“${esc(r.title||'')}”</b> · broadcast ${wd(r.day)} ${xeHM(r.st)}–${xeHM(r.et)}</p><p class="st">Segments: ${(p.seg||[]).map(esc).join(' · ')}</p><p class="st">🔒 Lineup = the Title Track Senbatsu saved with the single. It cannot be changed and members are not substituted.</p></div>`}
V.xemp=function(){const L=xeS().list.filter(r=>r.ch=='mp').sort((a,b)=>(a.status=='open'?0:1)-(b.status=='open'?0:1)||b.day-a.day);
 return`<h2 class="ht">Music Program Appearances</h2><p class="st">Every new single brings 1–3 invitations to music programs (fictional programs inspired by Japanese music-show formats). The performers are exactly the single's Title Track Senbatsu. Fixed fee; accept or decline.</p>
 <div class="xegrid">${L.map(r=>xeCard(r,r.status=='open'?`<span class="row"><span class="b s p" onclick="event.stopPropagation();xeAccept('${r.id}')">Accept</span><span class="b s" onclick="event.stopPropagation();xeDecline('${r.id}')">Decline</span></span>`:r.res?`<span class="tag xeg ${r.res.g}">${r.res.g}</span>`:'')).join('')||emptyBox('No music program offer yet. Release a single to receive invitations.','📺')}</div>`};

// =====================================================================================
//  Performance: keep the hidden portrait sprite small. Every face ever drawn (every costume / expression /
//  size) used to stay in #ptspr (up to 4,000 portraits ≈ hundreds of thousands of SVG nodes), so every screen
//  update had to restyle all of them and "Next day" got slower the longer the game ran. After a render the
//  portraits that nothing on screen uses any more are removed (they are rebuilt on demand).
// =====================================================================================
const PT_KEEP=260,PT_GONE=new Map();let PT_PRT=0;
// the portrait <symbol> markup of a sprite key (from the art cache or rebuilt)
function ptSymAdd(id,t){const body=t.split('§').join(id+'_'),mm=body.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/);if(!mm)return false;const vbm=mm[1].match(/viewBox="([^"]+)"/),vb=(vbm?vbm[1]:'0 0 100 120');
 try{const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg"><symbol id="${id}" viewBox="${vb}" overflow="hidden">${mm[2]}</symbol></svg>`,'image/svg+xml');const sym=doc.querySelector('symbol');if(!sym||doc.querySelector('parsererror'))return false;ptSprite().appendChild(document.importNode(sym,true));return true}catch(e){return false}}
function ptPrune(force){try{if(typeof PT_SPR=='undefined'||(!force&&PT_SPR.size<=PT_KEEP))return 0;const sp=document.getElementById('ptspr');if(!sp)return 0;
 const used=new Set();document.querySelectorAll('use').forEach(u=>{const h=u.getAttribute('href')||u.getAttribute('xlink:href')||'';if(h.startsWith('#ps'))used.add(h.slice(1))});
 if(PT_GONE.size>6000){const K=[...PT_GONE.keys()].slice(0,2000);K.forEach(k=>PT_GONE.delete(k))}let n=0;for(const [k,y] of PT_SPR){const id=(y.u.match(/href="#([^"]+)"/)||[])[1];if(id&&!used.has(id)){const t=ART.cache.get(k),el=document.getElementById(id);PT_GONE.set(id,{k,y,t,html:el?el.outerHTML:null});PT_SPR.delete(k);if(el)el.remove();n++}}return n}catch(e){return 0}}
// HTML kept from earlier (e.g. a window restored by ◀ Back) may point to a removed portrait: put it back
function ptRepair(){try{document.querySelectorAll('use').forEach(u=>{const h=u.getAttribute('href')||'';if(!h.startsWith('#ps'))return;const id=h.slice(1);if(document.getElementById(id))return;const g=PT_GONE.get(id);if(!g)return;let ok=false;if(g.html){try{const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${g.html}</svg>`,'image/svg+xml');const sym=doc.querySelector('symbol');if(sym&&!doc.querySelector('parsererror')){ptSprite().appendChild(document.importNode(sym,true));ok=true}}catch(e){}}if(!ok&&g.t)ok=ptSymAdd(id,g.t);if(ok){PT_SPR.set(g.k,g.y);PT_GONE.delete(id);document.querySelectorAll(`use[href="#${id}"]`).forEach(z=>{z.setAttribute('href','');z.setAttribute('href','#'+id)})}})}catch(e){}}
{const f=render;render=function(){const r=f.apply(this,arguments);try{if(PT_GONE.size){clearTimeout(ptRepair.t);ptRepair.t=setTimeout(ptRepair,0)}}catch(e){}if(PT_SPR&&PT_SPR.size>PT_KEEP){clearTimeout(PT_PRT);PT_PRT=setTimeout(()=>ptPrune(),0)}return r}}
