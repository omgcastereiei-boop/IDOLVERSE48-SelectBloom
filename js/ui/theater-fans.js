// =====================================================================================
//  Theater — Member Fan acquisition & Song exposure
// -------------------------------------------------------------------------------------
//  · Theater performances build INDIVIDUAL member fanbases (m.fans, the existing member fan
//    count that drives Popularity). They never create Group Fans (S.fans is not changed, and
//    the member gain is not turned into group fans by the Aggregate Fanbase System: its member
//    baseline fb.mf is moved with the gain). In the Aggregate Fanbase System the performance
//    gives the members exposure (fb.exp), which lets EXISTING fans pick them as Oshi.
//  · Each participating member gets her own calculation, song by song, using the formation
//    actually performed for that song:
//      song gain = eligible audience × base rate
//                  × position (Center / Front / Middle / Back)
//                  × song exposure (number of performers)
//                  × ability (Popularity, Dance, Vocal, Variety, Passion)
//                  × large-fanbase diminishing return
//                  × audience saturation (repeats of the Stage, theater frequency)
//                  × performance quality (satisfaction)
//      eligible audience = viewers who are not already her fans (live + weighted online).
//    Songs later in the show give less (attention fatigue) and the total of one performance is
//    capped at a share of her eligible audience. The expected total is rounded randomly to whole
//    fans (zero is a valid result) and split back over the songs for the breakdown.
//  · Applied once per completed performance (the record keeps the per-song breakdown).
// =====================================================================================
const TH_MF={
 pos:{center:1.5,front:1.25,middle:1,back:.8},
 exp:[[1,1.6],[2,1.4],[4,1.3],[7,1.15],[12,1.05],[16,1],[Infinity,.9]], // [max performers, multiplier]
 base:.005,          // new fans per eligible viewer per song before multipliers
 online:.3,           // an online viewer counts this much of a live viewer
 abil:{pop:.3,dance:.2,sing:.2,variety:.15,pas:.15},abilA:.35,abilB:1.3, // ability factor = A + B × weighted score
 big:6000, 
 fanBase:5000,        // share of viewers already her fans = her fans / max(Group Fans, this, 1.2 × her fans)
           // fanbase size where the diminishing return reaches 1/√2
 fatigue:.2,          // k-th song of a member in one show: ÷ (1 + fatigue × k)
 cap:.04,             // at most this share of her eligible audience per performance
 stFloor:.45,stScale:40, // repeats of the same Stage: floor + (1-floor) × e^(-performances/scale)
 noise:.2
};
const thMfExp=n=>{for(const[k,v]of TH_MF.exp)if(n<=k)return v;return 1};
// position of every performer in one song as performed: center / front / middle / back
function thMfPos(s,it,R){const ids=(R&&R.ids)||thMem(s,it),F=thForm(s,it,ids),o=F.o.filter(id=>ids.includes(id)),rows=F.rows&&F.rows.reduce((a,b)=>a+b,0)==o.length?F.rows:[o.length],out={},cen=new Set([R&&R.c,F.c2].filter(x=>x!=null));
 if(o.length==1){out[o[0]]='center';return out}let i=0;rows.forEach((n,r)=>{for(let k=0;k<n&&i<o.length;k++,i++){const id=o[i];out[id]=o.length>2&&cen.has(id)?'center':r==0?'front':r==rows.length-1?'back':'middle'}});return out}
const thMfAbil=m=>{const W=TH_MF.abil,sc=(W.pop*(m.pop||0)+W.dance*(m.dance||0)+W.sing*(m.sing||0)+W.variety*(m.variety||0)+W.pas*(m.pas||0))/100;return TH_MF.abilA+TH_MF.abilB*sc};
// one performance: member fan gains per song (no group fans)
function thMfCalc(x,s,L,res,A,sat){const ids=new Set(L.map(m=>m.id)),gf=Math.max(1,S.fans|0),perfs=s.perfs|0,st=TH_MF.stFloor+(1-TH_MF.stFloor)*Math.exp(-perfs/TH_MF.stScale),dim=A.dim||1,satF=st*Math.sqrt(dim),qF=.6+.8*(sat||0)/100;
 const songs=thAll(s).filter(it=>res&&res[it.id]&&(res[it.id].ids||[]).length),cnt={},E={},U={},M={};
 songs.forEach(it=>{const R=res[it.id],P=thMfPos(s,it,R),n=R.ids.filter(id=>ids.has(id)).length;if(!n)return;const ex=thMfExp(n);R.ids.forEach(id=>{if(!ids.has(id))return;const m=get(id);if(!m)return;
  if(!M[id]){const p=Math.min(.9,(m.fans||0)/Math.max(gf,TH_MF.fanBase,1.2*(m.fans||0),1)),elig=Math.max(0,A.live-A.liveFan*p)+TH_MF.online*Math.max(0,A.online-A.onFan*p);M[id]={elig,big:1/Math.sqrt(1+(m.fans||0)/TH_MF.big),ab:thMfAbil(m),k:0}}
  const z=M[id],u=z.elig*TH_MF.base*(TH_MF.pos[P[id]||'middle'])*ex*z.ab*z.big*satF*qF,v=u/(1+TH_MF.fatigue*z.k);(U[id]=U[id]||{})[it.id]={u,pos:P[id]||'middle',n};z.k++;(E[id]=E[id]||{})[it.id]=v;cnt[id]=(cnt[id]||0)+1})});
 const mem={},bySong={};Object.entries(E).forEach(([id,S1])=>{const z=M[id];let tot=Object.values(S1).reduce((a,b)=>a+b,0);const cap=z.elig*TH_MF.cap;if(tot>cap){const f=cap/tot;Object.keys(S1).forEach(k=>S1[k]*=f);tot=cap}
  const n=fbRound(tot*(1-TH_MF.noise+2*TH_MF.noise*Math.random()));mem[id]=n;bySong[id]=n?{...Object.fromEntries(Object.keys(S1).map(k=>[k,0])),...thSplitN(n,S1)}:Object.fromEntries(Object.keys(S1).map(k=>[k,0]))});
 const songsInfo=songs.map(it=>({id:it.id,lbl:thLbl(s,it),title:(S.songs[it.song]||{}).title||'',n:(res[it.id].ids||[]).length}));
 return{U,mem,bySong,songs:songsInfo,tot:Object.values(mem).reduce((a,b)=>a+b,0),satF:+satF.toFixed(2),stF:+st.toFixed(2)}}
// audience model (unchanged) + member fans; the newcomers no longer join the group fanbase
{const f=thAud;thAud=function(x,s,T,L,res,att,online,sat){const A=f.apply(this,arguments);try{const MF=thMfCalc(x,s,L,res,A.rep,sat);A.mem=MF.mem;A.recog=MF.mem;A.nf=MF.tot;Object.assign(A.rep,{mem:MF.mem,mfs:MF.bySong,mfSongs:MF.songs,mfTot:MF.tot,nf:MF.tot,groupNew:0,mfv:1,satF:MF.satF,stF:MF.stF})}catch(e){console.error(e)}return A}}
// member fans are added once; the Aggregate Fanbase System sees them as member exposure, not as new group fans
thGainM=function(m,A,sat){if(!A)return;const g=(A.mem&&A.mem[m.id])|0,D=A.done||(A.rep&&A.rep.done)||{};A.done=D;if(A.rep)A.rep.done=D;if(D[m.id])return;D[m.id]=1;
 if(g>0){m.fans=Math.max(0,Math.round((m.fans||0)+g));try{const fb=S.fb;if(fb&&fb.mf&&fb.mf[m.id]!=null)fb.mf[m.id]=m.fans;if(fb&&typeof fbExp=='function')fbExp(m.id,Math.min(1.5,g/12))}catch(e){}}
 m.buzz=cl(Math.round(m.buzz+(sat>=60?1:0)+(g>0?1:0)));m.pop=popOf(m)};
thAudApply=function(x,A){if(A&&A.rep)A.rep.groupNew=0}; // Theater never creates Group Fans
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length,g0=S.fans;const r=f.apply(this,arguments);try{if(H.pf.length>n0){const rec=H.pf.at(-1);if(rec.aud&&rec.aud.mfv)rec.nf=rec.aud.mfTot}}catch(e){console.error(e)}return r}}
// performance report: member fans with the song breakdown
function thMfHtml(p,A){if(!A||!A.mfv)return null;const S1=A.mfSongs||[],B=A.mfs||{},ids=(p.mem||[]).slice().sort((a,b)=>((A.mem||{})[b]|0)-((A.mem||{})[a]|0)),K=thKpi;
 const used=S1.filter(it=>ids.some(id=>(B[id]||{})[it.id]>0));
 return`<h3>Member Fan Report</h3><div class="gekg">${K('New Member Fans','+'+(A.mfTot|0).toLocaleString(),'total of every participating member')}${K('Stage repetition',`×${A.stF}`,`${A.recent} show(s) in 30 days · audience saturation ×${A.satF}`)}</div>
 <p class="st">Theater builds each member's own fanbase: one viewer can become a fan of several members. It does not add Group Fans. Gains depend on the viewers who are not yet her fans, her Popularity and skills, her position in each song's formation and how many members perform the song.</p>
 <div class="wrap"><table class="thmft"><tr><th>Member</th>${used.map(it=>`<th title="${esc(it.title)} · ${it.n} performer(s)">${it.lbl}<small>${it.n==1?'Solo':it.n==2?'Duo':it.n+' mem.'}</small></th>`).join('')}<th>Total</th></tr>
 ${ids.map(id=>{const m=get(id),b=B[id]||{};return`<tr><td class="thmxn">${m?ptc(m,24):''} ${esc(m?m.name:'#'+id)}</td>${used.map(it=>`<td>${b[it.id]>0?'+'+b[it.id]:b[it.id]===0?'0':'–'}</td>`).join('')}<td><b>+${((A.mem||{})[id]|0).toLocaleString()}</b></td></tr>`}).join('')}</table></div>`}
{const f=thOpenPerf;thOpenPerf=function(id){const r=f.apply(this,arguments);try{const p=thS().pf.find(z=>z.id==id),h=p&&p.aud&&thMfHtml(p,p.aud);if(h&&ui.mod&&ui.mod.h){const a=ui.mod.h.indexOf('<h3>Fanbase Report</h3>'),b=ui.mod.h.indexOf('<h3>Performance Report</h3>');if(a>=0&&b>a){ui.mod.h=ui.mod.h.slice(0,a)+h+ui.mod.h.slice(b);render()}}}catch(e){console.error(e)}return r}}
