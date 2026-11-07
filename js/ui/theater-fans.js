// =====================================================================================
//  Theater — Random Member Fan acquisition (songs, MC, Encore, Breakthroughs)
// -------------------------------------------------------------------------------------
//  · Theater builds INDIVIDUAL member fanbases only (m.fans, the existing member fan count that
//    drives Popularity). It never creates Group Fans: S.fans is not changed, and the Aggregate
//    Fanbase System's member baseline (fb.mf) moves with the gain so it is not converted into
//    group fans. The show gives the members exposure (fb.exp) instead, which lets EXISTING fans
//    pick them as Oshi.
//  · Every member has her own pool: viewers who are not yet HER fans (live + weighted online).
//    A viewer can become a fan of several members.
//  · Performance Quality (Poor … Outstanding) is rolled once per performance from the performers'
//    Dance, Vocal and Passion, the show's satisfaction and luck.
//  · Songs: for every song she performs, an expected gain is computed —
//      pool × base × (position × song exposure, capped) × skill × popularity × fanbase saturation
//      × Stage repetition × quality × song fatigue —
//    and the actual gain is drawn at random (gamma-Poisson: zero, small, moderate or large).
//  · MC: a separate calculation per MC segment (Variety first, then Passion and Popularity, a
//    random MC quality for each participant, talk time shared by the participants), with its own
//    fatigue across segments. Encore MC uses exactly the same calculation.
//  · Breakthroughs (Audience Favorite, Unexpected Spotlight, Viral Performance, Hidden Gem) are
//    rare, independent of popularity, and give one extra random gain.
//  · The per-performance expected total is softly capped. Everything is recorded once with the
//    performance (sources: songs, MC, Encore songs, Encore MC, Breakthrough; per song / segment).
// =====================================================================================
const TH_MF={
 pos:{center:1.5,front:1.25,middle:1,back:.8},
 exp:[[1,1.6],[2,1.4],[4,1.3],[7,1.15],[12,1.05],[16,1],[Infinity,.9]], // [max performers, multiplier]
 stack:2.0,           // position × song exposure never exceeds this (no excessive stacking)
 base:.0045,          // song: new fans per eligible viewer before multipliers
 mcBase:.004,         // MC: new fans per eligible viewer before multipliers
 online:.3,           // an online viewer counts this much of a live viewer (online viewers are separate people)
 skill:{dance:.3,sing:.3,variety:.15,pas:.25},skA:.4,skB:1.2,    // song skill factor = A + B × score
 popA:.85,popB:.3,    // popularity factor = A + B × Popularity/100 (does not overpower skills)
 mcSk:{variety:.7,pas:.3},mcA:.3,mcB:1.4, // MC skill factor
 fanBase:5000,        // share of viewers already her fans = her fans / max(Group Fans, this, 1.2 × her fans)
 big:6000,            // fanbase saturation: ÷ √(1 + fans / big)
 fatigue:.2,mcFatigue:.35, // k-th song / MC of a member in one show: ÷ (1 + fatigue × k)
 cap:.05,             // soft cap of the expected total: share of her eligible pool
 stFloor:.45,stScale:40, // repeats of the same Stage: floor + (1-floor) × e^(-performances/scale)
 shape:2,             // randomness of each draw (gamma shape; lower = more swingy)
 luck:[.12,.15,1.5],  // chance of a favourable night = a + b × skill; then × c
 Q:[['Poor',.7,.5],['Average',1,1],['Good',1.15,1],['Excellent',1.35,1.3],['Outstanding',1.6,2]], // [level, fan multiplier, breakthrough chance multiplier]
 Qcut:[.32,.47,.6,.75],
 MCQ:[['Quiet',.5],['Good',1],['Fun',1.4],['Memorable',1.9]],
 bt:{p:.006,favorite:.018,spotlight:.018,viral:.035,gem:.024}   // chance per member per show; extra gain per eligible viewer
};
const thMfExp=n=>{for(const[k,v]of TH_MF.exp)if(n<=k)return v;return 1};
const thMfR={u:()=>Math.random(),gamma(k){let s=0;for(let i=0;i<k;i++)s-=Math.log(1-Math.random());return s/k},
 pois(l){if(!(l>0))return 0;if(l>30)return Math.max(0,Math.round(l+Math.sqrt(l)*(Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random()))));const L=Math.exp(-l);let k=0,p=1;do{k++;p*=Math.random()}while(p>L);return k-1},
 draw(l){return thMfR.pois(l*thMfR.gamma(TH_MF.shape))}};
// position of every performer in one song as performed: center / front / middle / back
function thMfPos(s,it,R){const ids=(R&&R.ids)||thMem(s,it),F=thForm(s,it,ids),o=(R&&R.o?R.o:F.o).filter(id=>ids.includes(id)),rows=F.rows&&F.rows.reduce((a,b)=>a+b,0)==o.length?F.rows:[o.length],out={},cen=new Set([R&&R.c,R&&R.o?R.c2:F.c2].filter(x=>x!=null));
 if(o.length==1){out[o[0]]='center';return out}let i=0;rows.forEach((n,r)=>{for(let k=0;k<n&&i<o.length;k++,i++){const id=o[i];out[id]=o.length>2&&cen.has(id)?'center':r==0?'front':r==rows.length-1?'back':'middle'}});return out}
const thMfSkill=m=>{const W=TH_MF.skill;return(W.dance*(m.dance||0)+W.sing*(m.sing||0)+W.variety*(m.variety||0)+W.pas*(m.pas||0))/100};
const thMfAbil=m=>TH_MF.skA+TH_MF.skB*thMfSkill(m);
const thMfPop=m=>TH_MF.popA+TH_MF.popB*(m.pop||0)/100;
const thMfMc=m=>TH_MF.mcA+TH_MF.mcB*(TH_MF.mcSk.variety*(m.variety||0)+TH_MF.mcSk.pas*(m.pas||0))/100;
// Performance Quality of one show: performers' Dance / Vocal / Passion, satisfaction and luck
function thMfQuality(L,sat){const sk=L.length?avg(L.map(m=>(.35*(m.dance||0)+.35*(m.sing||0)+.3*(m.pas||0))/100)):.3,g=(Math.random()+Math.random()+Math.random()-1.5)*.22,v=.55*sk+.25*(sat||0)/100+.1+g;let i=0;while(i<TH_MF.Qcut.length&&v>=TH_MF.Qcut[i])i++;const q=TH_MF.Q[i];return{lvl:q[0],i,f:q[1],bt:q[2],v:+v.toFixed(3)}}
function thMfMcQ(m){const r=.6*Math.random()+.4*(m.variety||0)/100,i=r<.3?0:r<.55?1:r<.75?2:3;return TH_MF.MCQ[i]}
// one performance: random member fan gains by song, MC segment and Breakthrough (no group fans)
function thMfCalc(x,s,L,res,A,sat,opt){opt=opt||{};const pf=new Set(L.map(m=>m.id)),gf=Math.max(1,S.fans|0),perfs=s.perfs|0,st=TH_MF.stFloor+(1-TH_MF.stFloor)*Math.exp(-perfs/TH_MF.stScale),dim=A.dim||1,satF=st*Math.sqrt(dim);
 const Q=opt.q||thMfQuality(L,sat),M={},U={},items=[],encS=new Set(thEnc(s).map(i=>i.id));
 const pool=m=>{if(!M[m.id]){const p=Math.min(.9,(m.fans||0)/Math.max(gf,TH_MF.fanBase,1.2*(m.fans||0),1)),elig=Math.max(0,A.live-A.liveFan*p)+TH_MF.online*Math.max(0,A.online-A.onFan*p);
   M[m.id]={elig,big:1/Math.sqrt(1+(m.fans||0)/TH_MF.big),sk:thMfSkill(m),ab:thMfAbil(m),pop:thMfPop(m),mc:thMfMc(m),k:0,j:0,lam:{},pos:{}}}return M[m.id]};
 // songs
 thAll(s).forEach(it=>{const R=res&&res[it.id];if(!R||!(R.ids||[]).length)return;const ids=R.ids.filter(id=>pf.has(id)&&get(id));if(!ids.length)return;const P=thMfPos(s,it,R),ex=thMfExp(ids.length),enc=encS.has(it.id);
  items.push({id:it.id,kind:'song',enc:enc?1:0,lbl:thLbl(s,it),title:(S.songs[it.song]||{}).title||'',n:ids.length});
  ids.forEach(id=>{const m=get(id),z=pool(m),ps=P[id]||'middle',mul=Math.min(TH_MF.stack,TH_MF.pos[ps]*ex),u=z.elig*TH_MF.base*mul*z.ab*z.pop*z.big*satF*Q.f;(U[id]=U[id]||{})[it.id]={u,pos:ps,n:ids.length,kind:'song'};z.lam[it.id]=u/(1+TH_MF.fatigue*z.k);z.k++;z.pos[it.id]=ps})});
 // MC segments (Setlist and Encore): only the actual participants
 if(typeof thMcAll=='function')thMcAll(s);const X=opt.x||(typeof TH5_X!='undefined'&&TH5_X)||x,MCs=[...s.items.filter(i=>i.k=='mc').map(i=>[i,0]),...thEncSeq(s).filter(i=>i.k=='mc').map(i=>[i,1])];const mcq={};
 MCs.forEach(([it,enc])=>{let ids=opt.mc&&opt.mc[it.id]?opt.mc[it.id]:typeof thMcIds=='function'?thMcIds(s,it,X,res):(it.mem||[]);ids=ids.filter(id=>get(id));if(!ids.length)return;const talk=Math.min(1.3,Math.sqrt(4/ids.length));
  items.push({id:it.id,kind:'mc',enc,lbl:enc?'Encore MC':'MC',title:it.name||'MC',n:ids.length,mm:it.mm||null});
  ids.forEach(id=>{const m=get(id),z=pool(m),q=thMfMcQ(m),u=z.elig*TH_MF.mcBase*z.mc*z.pop*z.big*satF*talk*q[1];(mcq[id]=mcq[id]||{})[it.id]=q[0];(U[id]=U[id]||{})[it.id]={u,n:ids.length,kind:'mc',q:q[0]};z.lam[it.id]=u/(1+TH_MF.mcFatigue*z.j);z.j++})});
 // soft cap of the expected total, a favourable night, then a random draw for every song / segment
 const mfs={},src={},exp={},bt=[];Object.entries(M).forEach(([id,z])=>{const lam=z.lam,tot=Object.values(lam).reduce((a,b)=>a+b,0),cap=Math.max(1,z.elig*TH_MF.cap),f=tot>0?cap*(1-Math.exp(-tot/cap))/tot:1,lucky=Math.random()<TH_MF.luck[0]+TH_MF.luck[1]*z.sk?TH_MF.luck[2]:1;
  const b=mfs[id]={},sc=src[id]={song:0,mc:0,esong:0,emc:0,bt:0};exp[id]=+(tot*f).toFixed(2);Object.entries(lam).forEach(([iid,l])=>{const n=thMfR.draw(l*f*lucky),I=items.find(i=>i.id==iid);b[iid]=n;sc[I.kind=='mc'?(I.enc?'emc':'mc'):(I.enc?'esong':'song')]+=n});
  // Breakthrough: rare, not tied to popularity; Hidden Gem only for small fanbases / low popularity, Spotlight away from the front
  const m=get(+id),P=Object.values(z.pos),away=P.length&&P.every(p=>p=='middle'||p=='back'),small=(m.fans||0)<800||(m.pop||0)<25;if(Math.random()<TH_MF.bt.p*Q.bt*(small?1.4:1)){const T=[['favorite',3],['viral',1]];if(away)T.push(['spotlight',3]);if(small)T.push(['gem',3]);let r=Math.random()*T.reduce((a,t)=>a+t[1],0),type=T[0][0];for(const t of T){r-=t[1];if(r<0){type=t[0];break}}
   const n=Math.min(Math.round(z.elig*.08),thMfR.draw(z.elig*TH_MF.bt[type]*z.big*satF*(type=='gem'?1.2:1)));b.bt=n;sc.bt=n;bt.push({mid:+id,type,n})}});
 const mem=Object.fromEntries(Object.entries(src).map(([id,sc])=>[id,sc.song+sc.mc+sc.esong+sc.emc+sc.bt]));
 return{U,lam:Object.fromEntries(Object.entries(M).map(([id,z])=>[id,z.lam])),mem,mfs,src,exp,items,q:Q,bt,mcq,tot:Object.values(mem).reduce((a,b)=>a+b,0),satF:+satF.toFixed(2),stF:+st.toFixed(2)}}
const TH_BT={favorite:['💖','Audience Favorite'],spotlight:['🔦','Unexpected Spotlight'],viral:['📈','Viral Performance'],gem:['💎','Hidden Gem']};
// audience model (unchanged) + member fans; the newcomers no longer join the group fanbase
{const f=thAud;thAud=function(x,s,T,L,res,att,online,sat){const A=f.apply(this,arguments);try{const MF=thMfCalc(x,s,L,res,A.rep,sat);A.mem=MF.mem;A.recog=MF.mem;A.nf=MF.tot;
 Object.assign(A.rep,{mem:MF.mem,mfs:MF.mfs,mfSrc:MF.src,mfExp:MF.exp,mfItems:MF.items,mfQ:{lvl:MF.q.lvl,i:MF.q.i,v:MF.q.v},mfBt:MF.bt,mfMcQ:MF.mcq,mfTot:MF.tot,nf:MF.tot,groupNew:0,mfv:2,satF:MF.satF,stF:MF.stF});delete A.rep.mfSongs}catch(e){console.error(e)}return A}}
// member fans are added once per member and performance; the Aggregate Fanbase System sees them as member exposure, not as new group fans
thGainM=function(m,A,sat){if(!A)return;const g=(A.mem&&A.mem[m.id])|0,D=A.done||(A.rep&&A.rep.done)||{};A.done=D;if(A.rep)A.rep.done=D;if(D[m.id])return;D[m.id]=1;
 if(g>0){m.fans=Math.max(0,Math.round((m.fans||0)+g));try{const fb=S.fb;if(fb&&fb.mf&&fb.mf[m.id]!=null)fb.mf[m.id]=m.fans;if(fb&&typeof fbExp=='function')fbExp(m.id,Math.min(1.5,g/12))}catch(e){}}
 m.buzz=cl(Math.round(m.buzz+(sat>=60?1:0)+(g>0?1:0)));m.pop=popOf(m)};
thAudApply=function(x,A){if(A&&A.rep)A.rep.groupNew=0}; // Theater never creates Group Fans
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length;const r=f.apply(this,arguments);try{if(H.pf.length>n0){const rec=H.pf.at(-1),A=rec.aud;if(A&&A.mfv){
  // MC participants who did not sing (e.g. All Members MC with bench members) still receive their MC fans, once
  Object.keys(A.mem||{}).forEach(id=>{const m=get(+id);if(m&&!(A.done||{})[id])thGainM(m,A,rec.sat)});rec.nf=A.mfTot;
  (A.mfBt||[]).forEach(b=>{const m=get(b.mid),t=TH_BT[b.type];if(m&&t)thN(`<li>${t[0]} <b>${esc(t[1])}</b> — ${esc(m.name)} caught the audience's attention at ${esc(thLabel(rec.k))} (${jd(rec.day)}): +${b.n} extra member fan(s).</li>`)})}}}catch(e){console.error(e)}return r}}
// ---- performance report ---------------------------------------------------------------------------------
const thMfTag=(A,id)=>{const n=(A.mem||{})[id]|0,e=(A.mfExp||{})[id]||0,bt=(A.mfBt||[]).find(b=>b.mid==+id);if(bt)return['bt',`${TH_BT[bt.type][0]} ${TH_BT[bt.type][1]}`];if(!n)return['zero','No new fans'];if(n>=Math.max(3,1.6*e+1))return['hi','Higher than usual'];return['ok','Normal']};
function thMfHtml(p,A){if(!A||!A.mfv)return null;if(A.mfv<2)return thMfHtml1(p,A);const K=thKpi,I=A.mfItems||[],src=A.mfSrc||{},ids=[...new Set([...(p.mem||[]).map(String),...Object.keys(A.mem||{})])].sort((a,b)=>((A.mem||{})[b]|0)-((A.mem||{})[a]|0));
 const tot=k=>Object.values(src).reduce((a,s)=>a+(s[k]|0),0),QL=['Poor','Average','Good','Excellent','Outstanding'];
 const chip=(l,n,c)=>n?`<span class="thmfc ${c||''}">${l} +${n}</span>`:'';
 return`<h3>Member Fan Report</h3><div class="gekg">${K('Performance Quality',esc(A.mfQ.lvl),`${'★'.repeat(A.mfQ.i+1)}${'☆'.repeat(4-A.mfQ.i)}`)}${K('New Member Fans','+'+(A.mfTot|0).toLocaleString(),`songs +${tot('song')} · MC +${tot('mc')} · Encore +${tot('esong')} · Encore MC +${tot('emc')}${tot('bt')?` · Breakthrough +${tot('bt')}`:''}`)}${K('Breakthroughs',(A.mfBt||[]).length?(A.mfBt||[]).map(b=>TH_BT[b.type][0]).join(' '):'none',(A.mfBt||[]).length?(A.mfBt||[]).map(b=>`${esc((get(b.mid)||{}).name||'')}: ${TH_BT[b.type][1]}`).join(' · '):'rare moments when a member catches the audience')}${K('Stage repetition',`×${A.stF}`,`${A.recent} show(s) in 30 days`)}</div>
 <p class="st">Each member's new fans are drawn at random from viewers who are not yet her fans, so every show is different. Songs depend on Dance, Vocal, Variety, Passion, Popularity, her position in that song's formation and how many members perform it; MC depends mostly on Variety. Theater adds member fans only, never Group Fans. Tap a member for the details.</p>
 <div class="thmfl">${ids.map(id=>{const m=get(+id),s=src[id]||{},b=(A.mfs||{})[id]||{},[tc,tl]=thMfTag(A,id),n=(A.mem||{})[id]|0;
  const rows=I.filter(it=>b[it.id]!=null).map(it=>`<li><span class="thsln">${esc(it.lbl)}</span> ${esc(it.title)} <small class="st">${it.kind=='mc'?`MC · ${it.n} member(s)${(A.mfMcQ&&A.mfMcQ[id]&&A.mfMcQ[id][it.id])?' · '+esc(A.mfMcQ[id][it.id]):''}`:it.n==1?'Solo':it.n==2?'Duo':it.n+' members'}</small> <b>${b[it.id]?'+'+b[it.id]:'0'}</b></li>`).join('');
  return`<details class="thmfm ${tc}"><summary>${m?ptc(m,32):''}<span class="thmfn"><b>${esc(m?m.name:'#'+id)}</b><span class="thmfs">${chip('Songs',s.song)}${chip('MC',s.mc)}${chip('Encore',s.esong)}${chip('Encore MC',s.emc)}${chip(tc=='bt'?tl:'Breakthrough',s.bt,'bt')}</span></span><span class="thmft2"><b>+${n}</b><small class="tag thmft-${tc}">${esc(tc=='bt'?'Breakthrough':tl)}</small></span></summary><ul class="ms thmfd">${rows}${s.bt?`<li><span class="thsln">★</span> ${esc(tl)} <b>+${s.bt}</b></li>`:''}</ul></details>`}).join('')}</div>`}
// performances recorded by the first version (one table by song)
function thMfHtml1(p,A){const S1=A.mfSongs||[],B=A.mfs||{},ids=(p.mem||[]).slice().sort((a,b)=>((A.mem||{})[b]|0)-((A.mem||{})[a]|0)),used=S1.filter(it=>ids.some(id=>(B[id]||{})[it.id]>0));
 return`<h3>Member Fan Report</h3><div class="gekg">${thKpi('New Member Fans','+'+(A.mfTot|0).toLocaleString(),'total of every participating member')}</div><div class="wrap"><table class="thmft"><tr><th>Member</th>${used.map(it=>`<th>${it.lbl}<small>${it.n==1?'Solo':it.n==2?'Duo':it.n+' mem.'}</small></th>`).join('')}<th>Total</th></tr>${ids.map(id=>{const m=get(id),b=B[id]||{};return`<tr><td class="thmxn">${m?ptc(m,24):''} ${esc(m?m.name:'#'+id)}</td>${used.map(it=>`<td>${b[it.id]>0?'+'+b[it.id]:b[it.id]===0?'0':'–'}</td>`).join('')}<td><b>+${((A.mem||{})[id]|0)}</b></td></tr>`}).join('')}</table></div>`}
{const f=thOpenPerf;thOpenPerf=function(id){const r=f.apply(this,arguments);try{const p=thS().pf.find(z=>z.id==id),h=p&&p.aud&&thMfHtml(p,p.aud);if(h&&ui.mod&&ui.mod.h){const a=ui.mod.h.indexOf('<h3>Fanbase Report</h3>'),b=ui.mod.h.indexOf('<h3>Performance Report</h3>');if(a>=0&&b>a){ui.mod.h=ui.mod.h.slice(0,a)+h+ui.mod.h.slice(b);render()}}}catch(e){console.error(e)}return r}}
