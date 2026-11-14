// =====================================================================================
//  Captain System — positions, eligibility, recommendations, history, leadership events
// -------------------------------------------------------------------------------------
//  Extends the EXISTING leadership data (no second system):
//    · Group Captain        g.cap            (existing)
//    · Group Vice Captain   g.vcap           (new field on the same group record)
//    · Team Captain         g.tl[tid].cap    (existing)
//    · Team Vice Captain    g.tl[tid].vice   (existing)
//  Every group (Main and Sister Groups) and every team has its own independent positions.
//  · Optional positions, unlimited terms, immediate appointment / removal, no automatic
//    promotion or Acting Captain. Only active full members of that group (and team) qualify.
//  · History: S.capH (one record per appointment period, never deleted). A reconciler keeps it
//    in step with the positions whatever changed them (Groups page, restructuring, graduation,
//    dismissal, transfer, demotion, disbanding) and gives the real reason for every end.
//  · Recommendations (advisory): computed on demand from existing data — personality and
//    relationship profile (m.pers, traits, m.rp), Passion, Loyalty, Mental Health, seniority,
//    team experience, existing Relationships (S.rel), past positions and leadership events.
//    Different priorities per position; level Excellent / Good / Average / Poor + reasons.
//  · Leadership events: checked once a week from real triggers (new members, low Mental Health,
//    conflicts, recent Center / election results / Theater shows, generation gaps, Captain pressure).
//    Effects go through the existing systems only: Relationship pairs (bond, feelings, history,
//    news), wlAdj (Mental Health), m.pas, rarely m.loy. Outcomes are probabilistic; cooldowns
//    prevent repeats. No stat, fan, revenue, Senbatsu, Center or election influence.
// =====================================================================================
const CAP_POS={gcap:'Group Captain',gvice:'Group Vice Captain',tcap:'Team Captain',tvice:'Team Vice Captain'};
const CAP_SH={gcap:'GC',gvice:'GVC',tcap:'TC',tvice:'TVC'};
const CAP_DUTY={gcap:'Represents the whole group, supports members from every team, welcomes new members and encourages unity across teams.',gvice:'Supports the Group Captain, helps members across teams feel included and takes part in group-wide support.',tcap:'Represents the team, supports teammates after Theater shows and hard days, helps new members settle in and eases misunderstandings.',tvice:'Supports the Team Captain, helps teammates feel included and takes part in team support.'};
const capLvl=s=>s>=72?'Excellent':s>=58?'Good':s>=45?'Average':'Poor';
function capS(){if(!S.capH||!Array.isArray(S.capH))S.capH=[];if(!S.capE||!Array.isArray(S.capE))S.capE=[];S.capX=S.capX||{};S.capSeq=+S.capSeq||0;return S}
const capMem=id=>get(id)||(S.alumni||[]).find(m=>m.id==id)||null;
const capTeam=(g,tid)=>(g.teams||[]).find(t=>t.id==tid)||null;
// ---- positions ------------------------------------------------------------------------------------------------------------
function capGet(g,pos,tid){if(pos=='gcap')return g.cap??null;if(pos=='gvice')return g.vcap??null;const L=(g.tl||{})[tid]||{};return(pos=='tcap'?L.cap:L.vice)??null}
function capPut(g,pos,tid,v){if(pos=='gcap')g.cap=v;else if(pos=='gvice')g.vcap=v;else{g.tl=g.tl||{};g.tl[tid]=g.tl[tid]||{cap:null,vice:null};g.tl[tid][pos=='tcap'?'cap':'vice']=v}}
function capSlots(){const L=[];(S.groups||[]).forEach(g=>{if(g.dis)return;L.push({g,pos:'gcap',tid:null},{g,pos:'gvice',tid:null});(g.teams||[]).forEach(t=>L.push({g,pos:'tcap',tid:t.id,t},{g,pos:'tvice',tid:t.id,t}))});return L}
function capOf(mid){return capSlots().filter(z=>capGet(z.g,z.pos,z.tid)==mid)}
// why a member cannot hold this position ('' = eligible)
function capWhy(m,g,pos,tid){if(!m||!S.members.includes(m))return'No longer with the company';if(m.status=='graduated')return'Graduated';if(m.status=='trainee')return`${TL()}s cannot hold Captain positions`;if(!isAct(m))return'Not an active full member';
 if(gsGid(m)!=g.id)return'Not a member of '+g.name;if((pos=='tcap'||pos=='tvice')&&m.tid!=tid)return'Not a member of this team';if(wlAway(m))return'';return''}
// same-level conflict ('' = none)
function capConf(m,g,pos,tid){const other=pos=='gcap'?'gvice':pos=='gvice'?'gcap':pos=='tcap'?'tvice':'tcap';if(capGet(g,other,tid)==m.id)return`${m.name} is already ${CAP_POS[other]}${tid?' of '+(capTeam(g,tid)||{}).name:''}. A member cannot hold two positions at the same level — remove her from that position first.`;
 if(pos=='tcap'||pos=='tvice'){const o=(g.teams||[]).find(t=>t.id!=tid&&((g.tl||{})[t.id]||{})[pos=='tcap'?'cap':'vice']==m.id);if(o)return`${m.name} already holds a Team position in ${o.name}.`}return''}
// ---- history reconciler ---------------------------------------------------------------------------------------------------
function capEndWhy(r,holder){const m=capMem(r.mid),g=grp(r.gid);if(r.pend)return r.pend;if(!m)return'Left the company';if(m.status=='graduated')return(m.dep&&m.dep.kind=='dismiss')||(m.grad&&m.grad.kind=='dismiss')?'Dismissal':'Graduation';
 if(!g||g.dis)return'Group disbanded';if(gsGid(m)!=r.gid)return'Transfer to another group';if(r.tid&&!capTeam(g,r.tid))return'Team disbanded';if(m.status=='trainee')return`Became a ${TL()}`;if(r.tid&&m.tid!=r.tid)return m.tid?'Moved to another team':'Left the team';
 if(holder!=null&&holder!=r.mid)return'Replaced by '+((capMem(holder)||{}).name||'another member');return'Removed by Producer'}
let CAP_N=[];
function capSync(first){capS();if(!S.capInit){first=true;S.capInit=1}const H=S.capH,open=H.filter(r=>r.act),seen=new Set();
 // validate holders (the existing leadFix covers Group / Team positions; the Group Vice Captain is new)
 capSlots().forEach(z=>{const id=capGet(z.g,z.pos,z.tid);if(id==null)return;const m=get(id);if(capWhy(m,z.g,z.pos,z.tid))capPut(z.g,z.pos,z.tid,null)});
 const slot=new Map();capSlots().forEach(z=>slot.set(z.g.id+'|'+z.pos+'|'+(z.tid||''),z));
 open.forEach(r=>{const key=r.gid+'|'+r.pos+'|'+(r.tid||''),z=slot.get(key),holder=z?capGet(z.g,z.pos,z.tid):null;if(z&&holder==r.mid&&!seen.has(key)){seen.add(key);return}
  const why=capEndWhy(r,holder);r.act=0;r.to=S.day;r.why=why;delete r.pend;const m=capMem(r.mid);if(m&&!/Replaced|Removed/.test(why))hev(m,{t:'cap_end',pos:r.pos,gname:r.gn,tname:r.tn||'',why});
  if(!/Removed by Producer|Replaced/.test(why)&&!first){CAP_N.push(`<li>👑 <b>${esc(r.nm)}</b> is no longer ${CAP_POS[r.pos]} of ${esc(r.tn?r.gn+' · '+r.tn:r.gn)} (${esc(why)}). The position is <b>vacant</b> — open Groups to see recommended candidates, or leave it vacant.</li>`);capGrad(r,why)}});
 slot.forEach((z,key)=>{const id=capGet(z.g,z.pos,z.tid);if(id==null||seen.has(key))return;const m=capMem(id);H.push({id:'ch'+(++S.capSeq),mid:id,nm:m?m.name:'#'+id,gid:z.g.id,gn:z.g.name,tid:z.tid||null,tn:z.t?z.t.name:'',pos:z.pos,from:first?null:S.day,to:null,why:'',act:1})});
 CAP_REC={}}
{const f=leadFix;leadFix=function(){const r=f.apply(this,arguments);try{capSync()}catch(e){console.error(e)}return r}}
{const f=setLead;setLead=function(){const r=f.apply(this,arguments);try{capSync()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{capS();(S.groups||[]).forEach(g=>{if(g.vcap===undefined)g.vcap=null});capSync()}catch(e){console.error(e)}return r}}
{const f=roles;roles=function(m){const r=f.apply(this,arguments);try{(S.groups||[]).forEach(g=>{if(g.vcap==m.id)r.push(`Group Vice Captain (${g.name})`)})}catch(e){}return r}}
// ---- appointment / removal ------------------------------------------------------------------------------------------------
function capAppoint(gid,pos,tid,mid){const g=grp(gid),m=get(+mid);if(!g||!m)return;tid=tid||null;const w=capWhy(m,g,pos,tid);if(w)return toast(`${m.name} cannot be ${CAP_POS[pos]}: ${w}.`,'err');
 const c=capConf(m,g,pos,tid);if(c){ui.mod={t:'html',h:`<h2 class="ht">Position conflict</h2><p>${esc(c)}</p><p class="st">Nothing was changed.</p><div class="row"><button class="b p" onclick="capOpen(${gid},'${pos}','${tid||''}')">Back to candidates</button><button class="b" onclick="ui.mod=null;render()">Close</button></div>`};return render()}
 const cur=capGet(g,pos,tid);if(cur==m.id){ui.mod=null;return render()}
 const go=()=>{const r=S.capH.find(x=>x.act&&x.gid==gid&&x.pos==pos&&(x.tid||null)==tid);if(r)r.pend='Replaced by '+m.name;if(cur!=null&&get(cur))hev(get(cur),{t:'cap_end',pos,gname:g.name,tname:tid?(capTeam(g,tid)||{}).name:'',why:'Replaced by '+m.name});
  capPut(g,pos,tid,m.id);hev(m,{t:'cap_start',pos,gname:g.name,tname:tid?(capTeam(g,tid)||{}).name:''});capSync();ui.mod=null;toast(`${m.name} is now ${CAP_POS[pos]}${tid?' of '+(capTeam(g,tid)||{}).name:' of '+g.name}.`);render()};
 if(cur!=null){const o=capMem(cur);ask(`Replace ${o?o.name:'the current holder'} with ${m.name} as ${CAP_POS[pos]}? ${o?o.name:'She'} keeps her other positions; her time as ${CAP_POS[pos]} stays in the history.`,go,'Replace')}else go()}
function capRemove(gid,pos,tid){const g=grp(gid);tid=tid||null;if(!g)return;const cur=capGet(g,pos,tid);if(cur==null){ui.mod=null;return render()}const o=capMem(cur);
 ask(`Remove ${o?o.name:'the holder'} from ${CAP_POS[pos]}? The position becomes vacant (nobody is promoted automatically).`,()=>{const r=S.capH.find(x=>x.act&&x.gid==gid&&x.pos==pos&&(x.tid||null)==tid);if(r)r.pend='Removed by Producer';if(o&&get(cur))hev(o,{t:'cap_end',pos,gname:g.name,tname:tid?(capTeam(g,tid)||{}).name:'',why:'Removed by Producer'});capPut(g,pos,tid,null);capSync();ui.mod=null;toast(`${CAP_POS[pos]} is now vacant.`);render()},'Remove')}
// ---- recommendations ------------------------------------------------------------------------------------------------------
let CAP_REC={};
const capRp=m=>{try{return relRp(m)}catch(e){return{soc:1,kind:1,sens:1,ind:1,comp:1}}};
const capBond=(a,b)=>{const P=relS().p[relKey(a,b)];return P?(P.x[0]+P.x[1])/2:null};
const capStrained=(a,b)=>{const P=relS().p[relKey(a,b)];return!!P&&(P.d||[]).some(l=>l=='Conflict'||l=='Strained Relationship')};
const CAP_RESP={Serious:.85,Elegant:.75,Genki:.65,Cool:.6,Shy:.45,Airhead:.35};
const capDur=d=>{d=Math.max(0,d|0);const y=Math.floor(d/365),mo=Math.floor((d%365)/30);return y?`${y} year${y>1?'s':''}${mo?' '+mo+' month'+(mo>1?'s':''):''}`:mo?`${mo} month${mo>1?'s':''}`:`${d} day${d!=1?'s':''}`};
function capEval(m,g,pos,tid){const rp=capRp(m),w=wlOf(m),grpM=S.members.filter(x=>x.id!=m.id&&gsGid(x)==g.id&&isAct(x)),scope=pos[0]=='t'?grpM.filter(x=>x.tid==tid):grpM;
 const bonds=scope.map(x=>capBond(m.id,x.id)).map(v=>v==null?0:v),close=bonds.filter(v=>v>=60).length,avgB=bonds.length?avg(bonds):0,strain=scope.filter(x=>capStrained(m.id,x.id)).length;
 const teams=new Set(grpM.filter(x=>x.tid&&x.tid!=m.tid&&(capBond(m.id,x.id)||0)>=45).map(x=>x.tid)),otherTeams=new Set(grpM.filter(x=>x.tid&&x.tid!=m.tid).map(x=>x.tid)).size;
 const gTen=Math.max(0,S.day-(m.joined??S.day)),tTen=m.tjoined!=null?Math.max(0,S.day-m.tjoined):0,maxG=Math.max(30,...grpM.map(x=>S.day-(x.joined??S.day)),gTen),maxT=Math.max(30,...scope.map(x=>x.tjoined!=null?S.day-x.tjoined:0),tTen);
 const past=(S.capH||[]).filter(r=>r.mid==m.id),served=past.reduce((a,r)=>a+((r.to??S.day)-(r.from??S.day)),0),evs=(S.capE||[]).filter(e=>e.mid==m.id&&e.out=='pos').length;
 const capId=pos=='gvice'?g.cap:pos=='tvice'?((g.tl||{})[tid]||{}).cap:null,coop=capId!=null&&capId!=m.id?capBond(m.id,capId):null;
 const F={rel:pos[0]=='g'?Math.min(1,(avgB/60)*.5+(otherTeams?teams.size/otherTeams:.5)*.5):Math.min(1,avgB/60*.6+(scope.length?close/scope.length:0)*.8),exp:pos[0]=='g'?gTen/maxG:(tTen/maxT)*.7+(gTen/maxG)*.3,
  resp:CAP_RESP[m.pers]??.55,supp:fbCl((rp.kind-.7)/.6*100,0,100)/100,pas:(m.pas||0)/100,loy:(m.loy||0)/100,mh:w.mh/100,lead:Math.min(1,served/365*.6+evs*.08),coop:coop==null?.6:Math.min(1,coop/65)};
 const W={gcap:{rel:.22,exp:.15,resp:.14,supp:.1,pas:.1,loy:.1,mh:.12,lead:.07},gvice:{supp:.22,resp:.18,rel:.2,coop:.15,mh:.1,pas:.05,loy:.05,lead:.05},tcap:{rel:.24,exp:.16,resp:.14,supp:.1,pas:.1,loy:.08,mh:.12,lead:.06},tvice:{supp:.24,resp:.18,rel:.2,coop:.15,mh:.1,pas:.05,loy:.03,lead:.05}}[pos];
 let sc=0;for(const k in W)sc+=W[k]*F[k];sc=Math.round(sc*100-strain*3);if(w.mh<35)sc=Math.min(sc,57);
 const P=[],N=[],cn=capId!=null?capMem(capId):null;
 if(pos[0]=='g'){if(teams.size>=2)P.push([F.rel,`Has strong relationships with members across ${teams.size} other teams.`]);else if(otherTeams&&teams.size==0)N.push([1-F.rel,'Has limited relationships with members outside her own team.']);}
 else{if(close>=2)P.push([F.rel,`Close to ${close} of ${scope.length} teammates.`]);else if(scope.length)N.push([1-F.rel,'Has few close relationships in this team yet.'])}
 if(F.exp>=.6)P.push([F.exp,pos[0]=='g'?`Has been in the group for ${capDur(gTen)}.`:`Has extensive experience within this team (${capDur(tTen)}).`]);else if(gTen<120)N.push([.5,`Joined recently (${capDur(gTen)} ago).`]);
 if(F.resp>=.75)P.push([F.resp,`Her ${m.pers} personality is reliable and responsible.`]);else if(F.resp<=.45)N.push([1-F.resp,`Her ${m.pers} personality may find extra responsibility difficult.`]);
 if(F.supp>=.6)P.push([F.supp,'Kind and supportive toward other members.']);
 if((m.pas||0)>=70&&(m.loy||0)>=60)P.push([.7,`High Passion (${m.pas}) and Loyalty (${m.loy}).`]);else if((m.pas||0)<40)N.push([.6,`Low Passion (${m.pas}) at the moment.`]);else if((m.loy||0)<35)N.push([.55,`Low Loyalty (${m.loy}) toward the group.`]);
 if(w.mh<45)N.push([1,`Currently has low Mental Health (${Math.round(w.mh)}) and may struggle with additional responsibilities.`]);
 if(coop!=null&&cn){if(coop>=55)P.push([coop/100,`Gets along well with ${cn.name} (${pos=='gvice'?'Group':'Team'} Captain).`]);else if(capStrained(m.id,capId)||coop<20)N.push([.8,`Has a distant or strained relationship with ${cn.name} (${pos=='gvice'?'Group':'Team'} Captain).`])}
 if(served>=60){const r=past.slice().sort((a,b)=>((b.to??S.day)-(b.from??S.day))-((a.to??S.day)-(a.from??S.day)))[0];P.push([.6,`Previously served as ${CAP_POS[r.pos]}${r.tn?' of '+r.tn:''} (${capDur((r.to??S.day)-(r.from??S.day))}).`])}
 if(evs>=2)P.push([.5,`Supported members in ${evs} leadership moments.`]);if(strain)N.push([.7,`Has ${strain} strained relationship${strain>1?'s':''} ${pos[0]=='t'?'in this team':'in the group'}.`]);
 const reasons=[...P.sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>['+',x[1]]),...N.sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>['−',x[1]])];return{m,sc:fbCl(sc),lvl:capLvl(sc),reasons}}
function capRec(gid,pos,tid){const key=[gid,pos,tid||'',S.day,S.members.length].join('|');if(CAP_REC[key])return CAP_REC[key];const g=grp(gid);if(!g)return[];
 const L=S.members.filter(m=>!capWhy(m,g,pos,tid)).map(m=>capEval(m,g,pos,tid)).sort((a,b)=>b.sc-a.sc);return CAP_REC[key]=L}
// ---- leadership events (weekly, trigger-based) --------------------------------------------------------------------------------
const CAP_OK=m=>!!m&&S.members.includes(m)&&isAct(m)&&!wlAway(m);
function capCd(k,days){const X=S.capX;return!(X[k]!=null&&S.day-X[k]<days)}
function capMark(k){S.capX[k]=S.day;const K=Object.keys(S.capX);if(K.length>800)K.slice(0,200).forEach(x=>delete S.capX[x])}
function capPair(a,b,ctx){try{return relGet(a,b,ctx||'Leadership')}catch(e){return null}}
function capB(a,b,d,ctx){const P=capPair(a,b,ctx);if(!P)return null;P.x=[cl(P.x[0]+d),cl(P.x[1]+d)].map(v=>+v.toFixed(1));P.ls=S.day;return P}
function capLog(o){const E=S.capE;E.unshift({id:'ce'+(++S.capSeq),d:S.day,...o});if(E.length>400)E.length=400;const L=capMem(o.mid);if(L)hev(L,{t:'cap_ev',k:o.k,txt:o.priv?'':o.txt})}
const capNm=m=>m?(m.stage||m.name):'?';
const capPick=a=>a[Math.floor(Math.random()*a.length)];
// leaders of a scope: [{m,pos,role:'cap'|'vice'}], captain first
function capLeaders(g,tid){const A=tid?[['tcap',((g.tl||{})[tid]||{}).cap],['tvice',((g.tl||{})[tid]||{}).vice]]:[['gcap',g.cap],['gvice',g.vcap]];return A.map(([pos,id])=>({m:get(id),pos})).filter(x=>CAP_OK(x.m))}
// captain leads more often; vice captains take part less often
function capWho(L,used){const c=L.filter(x=>!used.has(x.m.id));if(!c.length)return null;if(c.length==1)return Math.random()<(c[0].pos.endsWith('vice')?.55:1)?c[0]:null;return Math.random()<.68?c[0]:c[1]}
function capEvents(){if(!S||!S.groups)return;capS();const used=new Set();
 S.groups.forEach(g=>{if(g.dis)return;const mem=S.members.filter(m=>gsGid(m)==g.id&&CAP_OK(m));if(mem.length<3)return;
  (g.teams||[]).forEach(t=>{const L=capLeaders(g,t.id);if(!L.length||!capCd(`T${t.id}`,9))return;const T=mem.filter(m=>m.tid==t.id);if(capRun(g,t,L,T,used))capMark(`T${t.id}`)});
  const L=capLeaders(g,null);if(L.length&&capCd(`G${g.id}`,10)&&capRun(g,null,L,mem,used))capMark(`G${g.id}`)})}
function capRun(g,t,L,M,used){const lead=capWho(L,used);if(!lead)return false;const C=lead.m,others=M.filter(m=>m.id!=C.id),scopeN=t?t.name:g.name,rk=capRp(C);if(!others.length)return false;
 const T=[];// candidate triggers with weights (all from real data)
 const newM=others.filter(m=>((t?m.tjoined:m.joined)??-999)>=S.day-21&&capCd(`W${m.id}|${t?t.id:g.id}`,9999));if(newM.length)T.push(['welcome',3,newM]);
 const low=others.filter(m=>wlOf(m).mh<45&&capCd(`S${C.id}|${m.id}`,30));if(low.length)T.push(['support',3,low]);
 const con=[];for(let i=0;i<others.length&&con.length<6;i++)for(let j=i+1;j<others.length;j++){const a=others[i],b=others[j];if(capStrained(a.id,b.id)&&capCd(`C${a.id}|${b.id}`,45))con.push([a,b]);if(con.length>=6)break}
 if(con.length&&(!t||con.some(([a,b])=>a.tid==t.id&&b.tid==t.id)))T.push(['conflict',2,con]);
 const x=S.singles&&S.singles.at(-1),cid=x&&x.relDay!=null&&S.day-x.relDay<=10?((S.songs[x.mainId]||{}).center||((S.songs[x.mainId]||{}).centers||[])[0]):null,cm=cid&&others.find(m=>m.id==cid);if(cm&&capCd(`R${C.id}|${cm.id}|${x.rid}`,9999))T.push(['center',2,[cm],x]);
 const ge=typeof geS=='function'?geS().list.filter(e=>e.st=='done'&&e.doneDay!=null&&S.day-e.doneDay<=10).at(-1):null;if(ge){const rows=ge.final.rows.filter(r=>others.some(m=>m.id==r.id));const top=rows.filter(r=>r.rank&&r.rank<=3),down=rows.filter(r=>r.prev&&r.prev!='out'&&(!r.rank||r.rank>r.prev+3));if(top.length&&capCd(`E${C.id}|${ge.id}`,9999))T.push(['geTop',2,top.map(r=>get(r.id)).filter(Boolean),ge]);if(down.length&&capCd(`D${C.id}|${ge.id}`,9999))T.push(['geDown',2,down.map(r=>get(r.id)).filter(Boolean),ge])}
 if(t&&typeof thS=='function'){const pf=(thS().pf||[]).filter(p=>p.k=='t'+t.id&&p.day>=S.day-4).at(-1);if(pf&&capCd(`P${t.id}|${pf.id}`,9999))T.push([pf.sat<55?'thLow':pf.sat>=80?'thHigh':'thOk',pf.sat<55||pf.sat>=80?2:.6,others,pf])}
 if(t){const gens=[...new Set(others.map(m=>m.gen||1))];if(gens.length>=2&&capCd(`G${t.id}|gen`,60)){const a=others.filter(m=>(m.gen||1)==Math.min(...gens)),b=others.filter(m=>(m.gen||1)==Math.max(...gens));const pairs=[];a.forEach(p=>b.forEach(q=>{const v=capBond(p.id,q.id);if(v==null||v<30)pairs.push([p,q])}));if(pairs.length>=2)T.push(['gens',1,pairs])}}
 else{const pairs=[];for(let i=0;i<others.length&&pairs.length<8;i++){const a=others[i];const b=others.find(z=>z.tid&&a.tid&&z.tid!=a.tid&&(capBond(a.id,z.id)??0)<25);if(b)pairs.push([a,b])}if(pairs.length>=2&&capCd(`X${g.id}`,45))T.push(['cross',1,pairs])}
 const recent=S.capE.filter(e=>e.mid==C.id&&S.day-e.d<=45);if(wlOf(C).mh<40&&capCd(`Pr${C.id}`,40))T.push(['pressure',1.5,[C]]);if(recent.filter(e=>e.out=='pos').length>=3&&capCd(`Ap${C.id}`,60))T.push(['thanks',1.5,others]);
 if(!T.length)return false;if(Math.random()>.6)return false;
 let r=Math.random()*T.reduce((a,z)=>a+z[1],0),pk=T[0];for(const z of T){r-=z[1];if(r<=0){pk=z;break}}used.add(C.id);return capDo(g,t,lead,pk,scopeN,rk)}
function capDo(g,t,lead,[k,,L,X],scopeN,rk){const C=lead.m,cn=capNm(C),role=CAP_POS[lead.pos],vice=lead.pos.endsWith('vice'),ctx=`${role} · ${scopeN}`,base={gid:g.id,tid:t?t.id:null,mid:C.id,pos:lead.pos,k};
 const tryOk=(m,bonus=0)=>{const b=capBond(C.id,m.id)??20,rp=capRp(m);return Math.random()<Math.min(.9,.35+b/200+(rk.kind-1)*.4+bonus-(rp.ind-1)*.3-(capStrained(C.id,m.id)?.3:0))};
 const feel=(P,from,f,v)=>{try{relFeel(P,relDir(P,from),f,v,'i')}catch(e){}};const hist=(P,txt,priv)=>{try{relHist(P,'ld',txt,ctx,priv)}catch(e){}};
 if(k=='welcome'){const m=capPick(L);capMark(`W${m.id}|${t?t.id:g.id}`);const ok=tryOk(m,.15),P=capB(C.id,m.id,ok?5:2,ctx);
  const txt=ok?`${cn} (${role}) welcomed ${capNm(m)} to ${scopeN}${m.pers=='Shy'?' and gently helped her talk with the others':''}. ${capNm(m)} is starting to feel at home.`:`${cn} (${role}) welcomed ${capNm(m)} to ${scopeN}. ${capNm(m)} is still a little nervous around everyone.`;
  if(P){feel(P,m.id,'apr',ok?8:3);hist(P,txt)}if(ok){wlAdj(m,{mh:2},'welcomed by the '+role);m.loy=cl((m.loy||0)+1)}capLog({...base,ids:[m.id],out:ok?'pos':'neu',txt});try{relNews(P,`🤝 ${txt}`,'')}catch(e){}return true}
 if(k=='support'){const m=capPick(L);capMark(`S${C.id}|${m.id}`);const rp=capRp(m),space=rp.ind>1.15&&Math.random()<.5,ok=!space&&tryOk(m);let txt,out;const P=capPair(C.id,m.id,ctx);
  if(space){txt=`${cn} noticed ${capNm(m)} seemed down, but sensed she needed some space and gave it to her instead of pressing her.`;out='neu';if(P){capB(C.id,m.id,1);feel(P,m.id,'res',4)}}
  else if(ok){txt=`${cn} quietly checked on ${capNm(m)} after a hard stretch${vice?'':', and listened for a long time'}. ${capNm(m)} felt a little lighter afterwards.`;out='pos';wlAdj(m,{mh:vice?2:3},'support from the '+role);if((m.pas||0)<70)m.pas=cl((m.pas||0)+1);if(P){capB(C.id,m.id,4);feel(P,m.id,'tru',6);feel(P,C.id,'car',5)}}
  else{txt=`${cn} tried to support ${capNm(m)}, but ${capNm(m)} wasn't ready to open up${capStrained(C.id,m.id)?' — the two are not close':''}.`;out=capStrained(C.id,m.id)?'neg':'neu';if(P&&out=='neg'){capB(C.id,m.id,-1);feel(P,m.id,'pre',4)}wlAdj(C,{mh:-1},'a support attempt that did not work')}
  if(P)hist(P,txt,1);capLog({...base,ids:[m.id],out,txt,priv:1});return true}
 if(k=='conflict'){const[a,b]=capPick(L);capMark(`C${a.id}|${b.id}`);const P=capPair(a.id,b.id),sb=((capBond(C.id,a.id)??20)+(capBond(C.id,b.id)??20))/2,pr=.3+sb/250+(rk.kind-1)*.3;let txt,out;const roll=Math.random();
  if(roll<pr){txt=`${cn} (${role}) listened to both ${capNm(a)} and ${capNm(b)} after their disagreement. They understand each other's side a little better now.`;out='pos';if(P){P.c=Math.max(0,(P.c||0)-1);capB(a.id,b.id,3);hist(P,txt)}capB(C.id,a.id,1);capB(C.id,b.id,1)}
  else if(roll<pr+.35){txt=`${cn} tried to ease the tension between ${capNm(a)} and ${capNm(b)}. Nothing changed for now — it is too personal to fix in one talk.`;out='neu';if(P)hist(P,txt)}
  else{txt=`${cn}'s attempt to help ${capNm(a)} and ${capNm(b)} made one of them feel she was taking sides.`;out='neg';const side=Math.random()<.5?a:b;capB(C.id,side.id,-2);const Q=capPair(C.id,side.id);if(Q)feel(Q,side.id,'fru',5);if(P)hist(P,txt,1)}
  capLog({...base,ids:[a.id,b.id],out,txt});try{relNews(P,`🕊 ${txt}`,'')}catch(e){}return true}
 if(k=='center'){const m=L[0];capMark(`R${C.id}|${m.id}|${X.rid}`);const P=capB(C.id,m.id,3,ctx),txt=`${cn} congratulated ${capNm(m)} on becoming Center of “${X.title}”.`;if(P){feel(P,m.id,'apr',5);hist(P,txt)}if((m.pas||0)<90)m.pas=cl((m.pas||0)+1);capLog({...base,ids:[m.id],out:'pos',txt});return true}
 if(k=='geTop'){capMark(`E${C.id}|${X.id}`);const m=capPick(L),P=capB(C.id,m.id,2,ctx),r=X.final.rows.find(z=>z.id==m.id),txt=`${cn} congratulated ${capNm(m)} on ${ordN(r.rank)} place in ${X.name}.`;if(P){feel(P,m.id,'apr',4);hist(P,txt)}capLog({...base,ids:[m.id],out:'pos',txt});return true}
 if(k=='geDown'){capMark(`D${C.id}|${X.id}`);const m=capPick(L),r=X.final.rows.find(z=>z.id==m.id),ok=tryOk(m),P=capPair(C.id,m.id,ctx),txt=ok?`${cn} sat with ${capNm(m)} after ${X.name} (${r.rank?ordN(r.rank):'unranked'}; ${ordN(r.prev)} last time) and reminded her what she means to the team.`:`${cn} reached out to ${capNm(m)} after ${X.name}, but ${capNm(m)} preferred to be alone for a while.`;
  if(ok){wlAdj(m,{mh:2},'encouraged after the election');if(P){capB(C.id,m.id,3);feel(P,m.id,'tru',4)}}if(P)hist(P,txt,1);capLog({...base,ids:[m.id],out:ok?'pos':'neu',txt,priv:1});return true}
 if(k=='thLow'||k=='thHigh'||k=='thOk'){capMark(`P${t.id}|${X.id}`);const M=L.filter(m=>(X.mem||[]).includes(m.id)).slice(0,5);if(!M.length)return false;let txt,out='pos';
  if(k=='thLow'){const ok=M.filter(m=>tryOk(m));ok.forEach(m=>{wlAdj(m,{mh:1},'encouraged after a tough Theater show');capB(C.id,m.id,1)});txt=`After a tough Theater show (satisfaction ${X.sat}), ${cn} gathered ${t.name} and encouraged everyone${ok.length<M.length?' — not everyone was in the mood to talk':''}.`;out=ok.length?'pos':'neu'}
  else if(k=='thHigh'){for(let i=0;i<Math.min(3,M.length-1);i++)capB(M[i].id,M[i+1].id,1,ctx);txt=`${t.name} celebrated a great Theater show together (satisfaction ${X.sat}); ${cn} thanked everyone for their work.`}
  else{txt=`${cn} reminded ${t.name} after the show what went well and what to try next time.`;out='neu'}
  capLog({...base,ids:M.map(m=>m.id),out,txt});return true}
 if(k=='gens'||k=='cross'){capMark(k=='gens'?`G${t.id}|gen`:`X${g.id}`);const prs=L.slice().sort(()=>Math.random()-.5).slice(0,2),ok=[];prs.forEach(([a,b])=>{if(Math.random()<.6+(rk.soc-1)*.3){const P=capB(a.id,b.id,2,ctx);if(P)hist(P,`${cn} brought them together`);ok.push([a,b])}});
  const txt=k=='gens'?`${cn} noticed that different generations in ${t.name} rarely talked and invited ${prs.map(([a,b])=>capNm(a)+' & '+capNm(b)).join(', ')} to practice together.${ok.length?'':' It was a little awkward for now.'}`:`${cn} (Group ${vice?'Vice ':''}Captain) introduced members from different teams to each other — ${prs.map(([a,b])=>capNm(a)+' & '+capNm(b)).join(', ')}.${ok.length?'':' They stayed polite but distant.'}`;
  capLog({...base,ids:prs.flat().map(m=>m.id),out:ok.length?'pos':'neu',txt});return true}
 if(k=='pressure'){capMark(`Pr${C.id}`);const txt=`${cn} has been carrying a lot as ${role} lately and seems tired.`;wlAdj(C,{mh:-2},'pressure of being '+role);
  // a Vice Captain / Captain close to her may notice
  const partner=(t?capLeaders(g,t.id):capLeaders(g,null)).find(x=>x.m.id!=C.id);let txt2='';if(partner&&(capBond(partner.m.id,C.id)??0)>=40&&Math.random()<.6){wlAdj(C,{mh:3},'support from the '+CAP_POS[partner.pos]);capB(partner.m.id,C.id,3,ctx);txt2=` ${capNm(partner.m)} (${CAP_POS[partner.pos]}) noticed and helped share the load.`}
  capLog({...base,ids:[C.id],out:txt2?'pos':'neg',txt:txt+txt2,priv:txt2?0:1});return true}
 if(k=='thanks'){capMark(`Ap${C.id}`);const M=L.filter(m=>(capBond(C.id,m.id)??0)>=45).slice(0,4);if(!M.length)return false;M.forEach(m=>{const P=capB(C.id,m.id,2,ctx);if(P)feel(P,m.id,'apr',4)});wlAdj(C,{mh:3},'appreciation from members');if((C.pas||0)<90)C.pas=cl((C.pas||0)+2);
  const txt=`${M.map(capNm).join(', ')} thanked ${cn} for always looking out for them as ${role}.`;capLog({...base,ids:M.map(m=>m.id),out:'pos',txt});try{relNews(null,`💐 ${txt}`,'')}catch(e){}return true}
 return false}
// when a Captain graduates: only members genuinely close to her react (no automatic sadness)
function capGrad(r,why){if(why!='Graduation')return;const close=S.members.filter(m=>(capBond(m.id,r.mid)??0)>=70).slice(0,3);if(!close.length)return;const txt=`${close.map(capNm).join(', ')} will miss ${r.nm}, who led ${r.tn||r.gn} as ${CAP_POS[r.pos]}.`;capLog({gid:r.gid,tid:r.tid,mid:r.mid,pos:r.pos,k:'farewell',ids:close.map(m=>m.id),out:'neu',txt});try{relNews(null,`🌸 ${txt}`,'')}catch(e){}}
// daily: keep positions valid; weekly: leadership events; notifications in one pop-up
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{capS();capSync();if(S.day%7==4)capEvents()}catch(e){console.error(e)}return r}}
{const f=render;render=function(){try{if(S&&CAP_N.length&&!ui.mod&&!ui.t){ui.mod={t:'html',h:`<h2 class="ht">👑 Leadership</h2><ul class="ms wln">${CAP_N.join('')}</ul><div class="row"><button class="b p" onclick="ui.mod=null;goView('groups')">Open Groups</button><button class="b" onclick="ui.mod=null;render()">Close</button></div>`};CAP_N=[]}}catch(e){}return f.apply(this,arguments)}}
// member history texts
{const f=evText;evText=function(e){if(e&&e.t=='cap_start')return`Appointed ${CAP_POS[e.pos]} of ${esc(e.tname?e.gname+' · '+e.tname:e.gname)}`;if(e&&e.t=='cap_end')return`${CAP_POS[e.pos]} of ${esc(e.tname?e.gname+' · '+e.tname:e.gname)} ended — ${esc(e.why)}`;if(e&&e.t=='cap_ev')return e.txt?esc(e.txt):'A private leadership moment';if(e&&e.t=='gvice')return`Appointed Group Vice Captain`;return f.apply(this,arguments)}}
// ---- UI ---------------------------------------------------------------------------------------------------------------------
const capLvTag=l=>`<span class="tag caplv ${l.toLowerCase()}">${l}</span>`;
function capRow(g,pos,tid){const id=capGet(g,pos,tid),m=id!=null?get(id):null,r=(S.capH||[]).find(x=>x.act&&x.gid==g.id&&x.pos==pos&&(x.tid||null)==(tid||null));
 return`<div class="caprow"><span class="capb ${pos}">${CAP_SH[pos]}</span><b class="capt">${CAP_POS[pos]}</b>${m?`<button class="capm" onclick="capDetail(${g.id},'${pos}','${tid||''}')">${ptc(m,30)}<span><b>${esc(m.name)}</b><small>since ${r&&r.from!=null?jd(r.from):'before records'}</small></span></button>`:'<span class="tag capvac">Vacant</span>'}<span style="flex:1"></span><button class="b s ${m?'':'p'}" onclick="capOpen(${g.id},'${pos}','${tid||''}')">${m?'Replace':'Appoint'}</button>${m?`<button class="b s" onclick="capRemove(${g.id},'${pos}','${tid||''}')">Remove</button>`:''}</div>`}
function capGroupHtml(g){return`<div class="c capbox"><div class="row"><h3 style="margin:0">👑 Group Leadership</h3><span style="flex:1"></span><button class="b s" onclick="capHist(${g.id})">History</button></div>${capRow(g,'gcap')}${capRow(g,'gvice')}<p class="st">Optional positions with no fixed term. Recommendations are advice only — you decide.</p></div>`}
function capTeamHtml(g,t){return`<div class="capbox sm">${capRow(g,'tcap',t.id)}${capRow(g,'tvice',t.id)}</div>`}
function capOpen(gid,pos,tid){tid=tid||null;const g=grp(gid);if(!g)return;const L=capRec(gid,pos,tid),cur=capGet(g,pos,tid),best=L[0];
 const row=r=>{const m=r.m,pp=capOf(m.id).filter(z=>!(z.g.id==gid&&z.pos==pos&&(z.tid||null)==tid)),c=capConf(m,g,pos,tid),tm=teamOf(m);return`<div class="capcand ${cur==m.id?'on':''}"><div class="row">${ptc(m,44)}<div style="flex:1;min-width:0"><b>${esc(m.name)}</b> ${capLvTag(r.lvl)}<div class="st">${tm?esc(tm.name):esc(TLm(m))} · ${ord(m.gen||1)} Gen · Passion ${m.pas} · Loyalty ${m.loy} · Mental ${Math.round(wlOf(m).mh)}</div>${pp.length?`<div class="st">Holds: ${pp.map(z=>CAP_POS[z.pos]+(z.t?' ('+esc(z.t.name)+')':'')).join(', ')}</div>`:''}</div>${cur==m.id?'<span class="tag gsact">CURRENT</span>':`<button class="b s p" ${c?'title="'+esc(c)+'"':''} onclick="capAppoint(${gid},'${pos}','${tid||''}',${m.id})">Appoint</button>`}</div><ul class="capr">${r.reasons.map(([s,t])=>`<li class="${s=='+'?'pos':'neg'}">${s} ${esc(t)}</li>`).join('')||'<li class="st">No notable factors yet.</li>'}</ul>${c&&cur!=m.id?`<div class="st thwarn">⚠ ${esc(c)}</div>`:''}</div>`};
 ui.mod={t:'html',h:`<h2 class="ht">${CAP_POS[pos]} — ${esc(tid?g.name+' · '+(capTeam(g,tid)||{}).name:g.name)}</h2><p class="st">${esc(CAP_DUTY[pos])}</p><p class="st">Candidates are ranked from existing member data (personality, Passion, Loyalty, Mental Health, experience, relationships). The recommendation is advice only — any eligible member can be appointed. ${TL()}s are not eligible.</p>
 ${!best||best.lvl=='Poor'?'<p class="st thwarn">No strong candidate right now — leaving the position vacant is also fine.</p>':''}<div class="capcl">${L.map(row).join('')||'<p class="st">No eligible members.</p>'}</div>
 <div class="row"><button class="b" onclick="ui.mod=null;render()">Cancel</button>${cur!=null?`<button class="b s" onclick="capRemove(${gid},'${pos}','${tid||''}')">Leave vacant (remove current holder)</button>`:`<button class="b s" onclick="ui.mod=null;render()">Leave vacant</button>`}</div>`};render()}
function capDetail(gid,pos,tid){tid=tid||null;const g=grp(gid),id=capGet(g,pos,tid),m=get(id);if(!m)return;const r=(S.capH||[]).find(x=>x.act&&x.gid==gid&&x.pos==pos&&(x.tid||null)==tid),prev=(S.capH||[]).filter(x=>x.mid==m.id&&x!==r),EV=(S.capE||[]).filter(e=>e.mid==m.id).slice(0,8);
 ui.mod={t:'html',h:`<h2 class="ht">👑 ${CAP_POS[pos]}</h2><div class="fbrow">${ptc(m,64)}<div><b>${esc(m.name)}</b><div class="st">${esc(g.name)}${tid?' · '+esc((capTeam(g,tid)||{}).name||''):''} · appointed ${r&&r.from!=null?jd(r.from)+' · '+capDur(S.day-r.from)+' in office':'before records'}</div></div></div><p class="st">${esc(CAP_DUTY[pos])}</p>
 <h3>Leadership moments</h3>${EV.length?`<ul class="ms">${EV.map(e=>`<li>${jd(e.d)} — ${e.priv?'<span class="st">A private conversation.</span>':esc(e.txt)}</li>`).join('')}</ul>`:'<p class="st">None yet.</p>'}
 <h3>Other / previous positions</h3>${prev.length?`<ul class="ms">${prev.map(x=>`<li>${CAP_POS[x.pos]} · ${esc(x.tn?x.gn+' · '+x.tn:x.gn)} · ${x.from!=null?jd(x.from):'before records'} – ${x.act?'now':jd(x.to)+' ('+esc(x.why)+')'}</li>`).join('')}</ul>`:'<p class="st">None.</p>'}
 <div class="row"><button class="b s p" onclick="capOpen(${gid},'${pos}','${tid||''}')">Replace</button><button class="b s" onclick="capRemove(${gid},'${pos}','${tid||''}')">Remove from position</button><button class="b" onclick="ui.mod=null;render()">Close</button></div>`};render()}
function capHist(gid){const g=grp(gid);const L=(S.capH||[]).filter(r=>r.gid==gid).sort((a,b)=>(b.from??-1)-(a.from??-1)),EV=(S.capE||[]).filter(e=>e.gid==gid&&!e.priv).slice(0,12);
 ui.mod={t:'html',h:`<h2 class="ht">Leadership history — ${esc(g?g.name:'')}</h2><div class="ccscroll"><table class="cctab"><tr><th>Member</th><th>Position</th><th>Start</th><th>End</th><th>Reason</th></tr>${L.map(r=>`<tr><td>${esc(r.nm)}</td><td>${CAP_POS[r.pos]}${r.tn?' · '+esc(r.tn):''}</td><td>${r.from!=null?jd(r.from):'before records'}</td><td>${r.act?'<b>Current</b>':jd(r.to)}</td><td>${r.act?'':esc(r.why)}</td></tr>`).join('')||'<tr><td colspan="5" class="st">No appointments yet.</td></tr>'}</table></div>
 <h3>Recent leadership moments</h3>${EV.length?`<ul class="ms">${EV.map(e=>`<li>${jd(e.d)} — ${esc(e.txt)}</li>`).join('')}</ul>`:'<p class="st">None yet.</p>'}<div class="row"><button class="b" onclick="ui.mod=null;render()">Close</button></div>`};render()}
// member profile: current positions + previous positions
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(cand||!m||(ui.ptab||'stats')!='stats')return h;const cur=capOf(m.id),prev=(S.capH||[]).filter(r=>r.mid==m.id&&!r.act);if(!cur.length&&!prev.length)return h;
 h+=`<div class="c capprof"><h3>👑 Leadership</h3>${cur.map(z=>`<span class="capb ${z.pos}">${CAP_SH[z.pos]}</span> <b>${CAP_POS[z.pos]}</b> <span class="st">${esc(z.t?z.g.name+' · '+z.t.name:z.g.name)}</span><br>`).join('')}${prev.length?`<details><summary class="st">Previous positions (${prev.length})</summary><ul class="ms">${prev.map(r=>`<li>${CAP_POS[r.pos]} · ${esc(r.tn?r.gn+' · '+r.tn:r.gn)} · ${r.from!=null?jd(r.from):'before records'} – ${jd(r.to)} (${esc(r.why)})</li>`).join('')}</ul></details>`:''}</div>`}catch(e){console.error(e)}return h}}
