// =====================================================================================
//  Member Relationship System — automatic social simulation (the Producer only observes)
// -------------------------------------------------------------------------------------
//  Data: S.rel = { p:{ "a-b" (a<b): pair }, news:[], circ:[], seq, wk }
//   pair = { a, b, x:[bondA→B, bondB→A], f:[{feeling:{v,s}}, {...}] (A's / B's feelings; s: o observed ·
//            i inferred · p private), d:[dynamics labels], r: rivalry, c: conflict, cn: conflicts so far,
//            mt: mentoring moments, pk:[peak A→B, peak B→A], h:[history], w:{s,u,t,tm} (this week's
//            shared songs / Theater Units / Theater shows / team weeks), t0: first meeting, ls: last
//            interaction, fl:{flags} }
//  · Shared activities are counted when they happen (Theater performances and Units, single releases,
//    team membership); relationships are evaluated once a week — never every pair every day.
//  · Personality (existing m.pers + traits) and a per-member profile m.rp (sociability, competitiveness,
//    kindness, sensitivity, independence, romance tendency, interests) shape probabilities, not outcomes.
//  · Feelings, dynamics, events, milestones, Social Circles and news emerge from these records.
//  · Effects are moderate and use existing systems only (stress via wlAdj, Passion for rivalry).
//  · Romance: only between adult members (18+), rare, non-explicit; feelings stay private until shown.
// =====================================================================================
const REL_LV=[[90,'Deeply Connected'],[75,'Close Friends'],[60,'Friends'],[40,'Familiar'],[20,'Acquaintances'],[0,'Barely Acquainted']];
const relLv=v=>(REL_LV.find(([t])=>v>=t)||REL_LV.at(-1))[1];
const REL_F={adm:'Admiration',aff:'Affection',tru:'Trust',car:'Care',res:'Respect',apr:'Appreciation',pro:'Protectiveness',jea:'Jealousy',rsn:'Resentment',dis:'Disappointment',fru:'Frustration',ins:'Insecurity',pre:'Pressure',dsl:'Dislike',rom:'Special feelings'};
const REL_NEG=new Set(['jea','rsn','dis','fru','ins','pre','dsl']);
const REL_PB={Genki:{soc:1.3,comp:1,kind:1.1,sens:.9,ind:.8},Cool:{soc:.85,comp:1.2,kind:.85,sens:.8,ind:1.3},Shy:{soc:.7,comp:.7,kind:1.05,sens:1.3,ind:1},Elegant:{soc:1,comp:.9,kind:1.2,sens:1,ind:1},Airhead:{soc:1.2,comp:.6,kind:1,sens:.8,ind:.9},Serious:{soc:.9,comp:1.2,kind:1,sens:1,ind:1.1}};
const REL_HOB=['baking','anime','fashion','photography','games','cafés','karaoke','reading','travel','cooking','manga','skincare','music production','sports','drawing'];
function relS(){if(!S.rel)S.rel={p:{},news:[],circ:[],seq:0,wk:null};const R=S.rel;R.p=R.p||{};R.news=R.news||[];R.circ=R.circ||[];return R}
const relKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const relM=id=>get(id)||(S.alumni||[]).find(m=>m.id==id)||null;
const relAct=m=>!!m&&S.members.includes(m);
function relRp(m){if(m.rp)return m.rp;const B=REL_PB[m.pers]||REL_PB.Serious,v=()=>.8+Math.random()*.4,T=m.traits||[];
 return m.rp={soc:+(B.soc*v()*(T.includes('Energetic')?1.1:1)*(T.includes('Shy')?.85:1)).toFixed(2),comp:+(B.comp*v()).toFixed(2),kind:+(B.kind*v()).toFixed(2),sens:+(B.sens*v()*(T.includes('Shy')?1.1:1)).toFixed(2),ind:+(B.ind*v()).toFixed(2),rom:+(Math.random()<.35?Math.random():Math.random()*.25).toFixed(2),hob:[...REL_HOB].sort(()=>Math.random()-.5).slice(0,2)}}
// directional view: d=0 → A's perspective toward B
function relGet(a,b,ctx){if(a==b)return null;const R=relS(),k=relKey(a,b);let P=R.p[k];if(!P&&ctx){const A=relM(Math.min(a,b)),B=relM(Math.max(a,b));if(!A||!B)return null;const cp=+(Math.random()*2-1).toFixed(2),base=m=>8+((A.gen||1)==(B.gen||1)?6:0)+(A.tid&&A.tid==B.tid?6:0)+cp*5+(relRp(m).soc-1)*10;
  P=R.p[k]={a:A.id,b:B.id,x:[+cl(base(A),0,40).toFixed(1),+cl(base(B),0,40).toFixed(1)],f:[{},{}],d:[],r:0,c:0,cn:0,mt:0,pk:[0,0],h:[],w:{s:0,u:0,t:0,tm:0},t0:S.day,ls:S.day,cp,fl:{}};relHist(P,'ms','First Meeting',ctx)}return P}
const relDir=(P,id)=>P.a==id?0:1;
function relHist(P,k,t,x,priv){P.h.push({d:S.day,k,t,x:x||'',p:priv?1:0});if(P.h.length>24){const keep=P.h[0];P.h=[keep,...P.h.slice(-23)]}}
function relNews(P,t,x){const R=relS();R.news.unshift({d:S.day,k:P?relKey(P.a,P.b):null,t,x});if(R.news.length>120)R.news.length=120}
const relFeel=(P,dir,k,v,s)=>{const F=P.f[dir],o=F[k]||{v:0,s:s||'i'};o.v=cl(Math.round(o.v+v),0,100);if(s&&(s=='o'||o.s=='p'))o.s=s;F[k]=o;if(o.v<5)delete F[k]};
const relFv=(P,dir,k)=>((P.f[dir]||{})[k]||{}).v||0;
const relNm=m=>m?(m.stage||m.name):'?';
const relSenior=(A,B)=>(A.gen||1)<(B.gen||1)||((A.gen||1)==(B.gen||1)&&(B.joined??0)-(A.joined??0)>=180);
// ---- recording shared activities ----------------------------------------------------------------------------------------
function relShare(ids,kind,ctx){ids=[...new Set(ids)].filter(id=>relAct(get(id)));for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const P=relGet(ids[i],ids[j],ctx);if(!P)continue;P.w[kind]=(P.w[kind]||0)+1;P.ls=S.day;P.lc=ctx||P.lc}}
{const f=thPerform;thPerform=function(x){const H=thS(),n0=H.pf.length;const r=f.apply(this,arguments);try{if(H.pf.length>n0){const rec=H.pf.at(-1),st=rec.nm||'';relShare(rec.mem||[],'t',`First shared Theater performance (“${st}”)`);(H.snap[rec.snap]||[]).forEach(z=>{if(z.k=='song'&&z.pt=='unit'&&(z.mem||[]).length>1)relShare(z.mem,'u',`First shared Theater Unit (“${z.title}”${z.unit?' · '+z.unit.name:''})`)})}}catch(e){console.error(e)}return r}}
{const f=doRelease;doRelease=function(){const n=S.singles.length;const r=f.apply(this,arguments);try{const x=S.singles[n];if(x){const T=[x.mainId,...(x.coup||[])];T.forEach(id=>{const o=S.songs[id];if(o)relShare((o.slots||[]).filter(Boolean),'s',`First shared song (“${o.title}”)`)});relCenter(x)}}catch(e){console.error(e)}return r}}
// Title Track Center: competition only for members who were close contenders (popularity, front row, competitive)
function relCenter(x){const o=S.songs[x.mainId];if(!o)return;const C=(o.centers||[]).map(get).filter(Boolean);if(!C.length)return;const fr=new Set(((o.fm&&o.fm.sl)||[]).filter(z=>z.r==0&&z.m).map(z=>z.m));
 C.forEach(c=>{S.members.filter(m=>m.id!=c.id&&gsGid(m)==gsGid(c)&&isAct(m)&&(Math.abs((m.pop||0)-(c.pop||0))<=12||fr.has(m.id))).forEach(m=>{const P=relGet(m.id,c.id,`First shared song (“${o.title}”)`);if(!P)return;const d=relDir(P,m.id),rp=relRp(m),b=P.x[d];
  const wanted=(m.pop||0)>=(c.pop||0)-6&&rp.comp>=.95;if(wanted){P.r=cl(P.r+18*rp.comp,0,100);relFeel(P,d,'jea',(rp.sens*14+rp.comp*6)*(b>=75?.8:1),rp.sens>1.1?'p':'i');relFeel(P,1-d,'pre',8,'i')}else relFeel(P,d,'adm',8+((m.gen||1)>(c.gen||1)?10:4),'i');
  P.fl.cen=(P.fl.cen||0)+1;P.lcen={d:S.day,c:c.id,t:x.title}})})}
// ---- weekly evaluation -------------------------------------------------------------------------------------------------------
function relWeekly(){const R=relS();(S.groups||[]).forEach(g=>{(g.teams||[]).forEach(t=>{const ids=S.members.filter(m=>m.group==g.id&&m.tid==t.id&&isAct(m)).map(m=>m.id);relShare(ids,'tm',`Same team (${t.name})`)})});
 const ev=[];Object.values(R.p).forEach(P=>{const A=get(P.a),B=get(P.b);if(!relAct(A)||!relAct(B)){P.w={s:0,u:0,t:0,tm:0};return}relEval(P,A,B,ev)});
 ev.sort((a,b)=>b.pr-a.pr).slice(0,8).forEach(e=>{try{e.go()}catch(x){console.error(x)}});relCheckGE();if(S.day%28<7)relCircles()}
function relEval(P,A,B,EV){const w=P.w,act=(w.s||0)+(w.u||0)+(w.t||0)+(w.tm||0);const old=[...P.x],oldD=[...P.d];
 [[A,B,0],[B,A,1]].forEach(([m,o,d])=>{const rp=relRp(m),b=P.x[d];const cap=Math.min(100,42+26*(P.cp+1)+(rp.soc-1)*20+(m.pers=='Shy'&&P.cp>.3?8:0));let g=((w.s||0)*1.5+(w.u||0)*1.5+Math.min(w.t||0,4)*.3+(w.tm||0)*.35)*rp.soc*(.85+.3*rp.kind)*Math.max(-.2,1-b/cap);
  if(m.pers=='Shy'&&b>=60)g*=1.25;if(rp.ind>1.15&&b>=70)g*=.8;g-=P.c*.04+relFv(P,d,'jea')*.012+relFv(P,d,'dsl')*.02;
  const idle=S.day-(P.ls||P.t0);if(!act&&idle>60)g-=b>=75?(idle>180?.1:0):.4;P.x[d]=+cl(b+cl(g,-6,3.5),0,100).toFixed(1);P.pk[d]=Math.max(P.pk[d],P.x[d]);
  const F=P.f[d];Object.keys(F).forEach(k=>{if(k=='rom')return;F[k].v=Math.round(F[k].v*(k=='jea'||k=='rsn'||k=='res'||k=='adm'?.93:.85));if(F[k].v<5)delete F[k]});if(P.x[d]>=60){relFeel(P,d,'car',1);relFeel(P,d,'tru',P.x[d]>=75?1:0)}});
 P.r=+(P.r*.97).toFixed(1);P.c=+(P.c*(.85-.05*Math.max(relRp(A).kind,relRp(B).kind)+.05)).toFixed(1);
 relDyn(P,A,B);relMilestones(P,A,B,old,oldD);relEvents(P,A,B,EV,act);P.w={s:0,u:0,t:0,tm:0}}
function relDyn(P,A,B){const[x,y]=P.x,D=[],mn=Math.min(x,y);if(mn>=90)D.push('Best Friends');else if(mn>=75)D.push('Close Friends');else if(mn>=60)D.push('Good Friends');
 const [s,j]=relSenior(A,B)?[0,1]:relSenior(B,A)?[1,0]:[null,null];if(s!=null&&P.x[s]>=45&&P.x[j]>=45)D.push(P.mt>=2?'Mentor & Mentee':'Senpai & Kouhai');
 if(P.r>=40)D.push(mn>=60?'Friendly Rivals':mn<40?'Professional Competitors':'Rivals');
 if(P.c>=50)D.push('Conflict');else if(P.c>=25)D.push('Strained Relationship');if(Math.max(...P.pk)>=60&&Math.max(x,y)<40)D.push('Distant Relationship');
 if(mn>=60&&(relFv(P,0,'jea')>=40||relFv(P,1,'jea')>=40||relFv(P,0,'rsn')>=30||relFv(P,1,'rsn')>=30))D.push('Complicated Relationship');
 const r0=relFv(P,0,'rom'),r1=relFv(P,1,'rom');if(r0>=60&&r1>=60)D.push('Mutual Romantic Feelings');else if((r0>=60&&r1<20)||(r1>=60&&r0<20))D.push('Unrequited Feelings');else if(r0>=50||r1>=50)D.push('Romantic Interest');P.d=D}
// labels shown to the Producer: romantic labels only once observed
function relDynVis(P){return P.d.filter(l=>!/Romantic|Unrequited/.test(l)||(P.fl.romObs))}
function relMilestones(P,A,B,old,oldD){const mn=Math.min(...P.x),om=Math.min(...old),nA=relNm(A),nB=relNm(B),add=(t,x,news)=>{relHist(P,'ms',t,x);if(news)relNews(P,t,x)};
 if(om<60&&mn>=60&&!P.fl.f60){P.fl.f60=1;add('Became Friends',`${nA} and ${nB} have become friends.`)}
 if(om<75&&mn>=75&&!P.fl.f75){P.fl.f75=1;add('Became Close Friends',relTxt('close',A,B,P),1)}
 if(om<90&&mn>=90&&!P.fl.f90){P.fl.f90=1;add('Became Best Friends',`${nA} and ${nB} are now inseparable — best friends.`,1)}
 const has=l=>P.d.includes(l),had=l=>oldD.includes(l);
 if(P.d.some(l=>/Rivals|Competitors/.test(l))&&!oldD.some(l=>/Rivals|Competitors/.test(l))&&!P.fl.riv){P.fl.riv=1;add('Became Rivals',relTxt('rivals',A,B,P),1)}
 if(has('Mentor & Mentee')&&!had('Mentor & Mentee')&&!P.fl.men){P.fl.men=1;const[s,j]=relSenior(A,B)?[A,B]:[B,A];add('Became Mentors',`${relNm(s)} has become a mentor to ${relNm(j)}.`,1);if((relS().p&&Object.values(relS().p).some(Q=>Q!==P&&Q.d.includes('Mentor & Mentee')&&((Q.a==s.id||Q.b==s.id)&&!relSenior(s,relM(Q.a==s.id?Q.b:Q.a)))))){relNews(P,'From mentee to mentor',`${relNm(s)}, once guided by her own senpai, now guides ${relNm(j)}.`)}}
 if(had('Distant Relationship')==false&&has('Distant Relationship')){add('Drifted Apart',`${nA} and ${nB}, once close, have drifted apart.`,1)}
 if(Math.max(P.pk[0]-P.x[0],P.pk[1]-P.x[1])>=20&&!P.fl.sig){P.fl.sig=1;add('Relationship Changed Significantly',`${nA} and ${nB} are not as close as they used to be.`)}
 if((P.fl.cOn&&P.c<12)){P.fl.cOn=0;add('Reconciled',relTxt('recon',A,B,P),1)}if(P.c>=50)P.fl.cOn=1}
// ---- event candidates (contextual, rate-limited) --------------------------------------------------------------------------------
function relCool(P,k,days){P.fl.cd=P.fl.cd||{};if(P.fl.cd[k]&&S.day-P.fl.cd[k]<days)return false;return true}
function relEvents(P,A,B,EV,act){const add=(k,pr,cd,go)=>{if(relCool(P,k,cd))EV.push({pr:pr+Math.random()*.5,go:()=>{P.fl.cd=P.fl.cd||{};P.fl.cd[k]=S.day;go()}})};const[x,y]=P.x,rpA=relRp(A),rpB=relRp(B);
 // friendship
 if(act&&x>=45&&y>=45&&Math.random()<.18*(rpA.soc+rpB.soc)/2)add('meal',1,35,()=>{relHist(P,'ev','Time together',relTxt('meal',A,B,P));P.x[0]=Math.min(100,P.x[0]+1.5);P.x[1]=Math.min(100,P.x[1]+1.5)});
 const hob=rpA.hob.find(h=>rpB.hob.includes(h));if(hob&&!P.fl.hob&&act&&x>=25&&x<65&&Math.random()<.3)add('hob',1.5,9999,()=>{P.fl.hob=1;relHist(P,'ev','Shared interest',`${relNm(A)} and ${relNm(B)} found out they both love ${hob}. They haven't stopped talking about it since.`);P.x[0]+=3;P.x[1]+=3});
 [[A,B,0],[B,A,1]].forEach(([m,o,d])=>{const rp=relRp(m),b=P.x[d],wo=wlOf(o);
  if(o.bd&&o.bdY==ctY(S.day)&&S.day-ctBdDay(o,ctY(S.day))<7&&S.day>=ctBdDay(o,ctY(S.day))&&b>=60&&!P.fl['bd'+d+o.bdY])add('bd'+d,2,300,()=>{P.fl['bd'+d+o.bdY]=1;relHist(P,'ev','Birthday gift',relTxt('gift',m,o,P));P.x[1-d]=Math.min(100,P.x[1-d]+2);relFeel(P,1-d,'apr',12,'o')});
  if(b>=60&&((wo.mh??70)<40||(o.mh||[]).some(e=>e.t=='sel_miss'&&S.day-e.day<7))&&Math.random()<.5*rp.kind)add('comfort'+d,2.5,40,()=>{relHist(P,'ev','Comfort',relTxt('comfort',m,o,P));wlAdj(o,{str:-4,mh:2},`comforted by ${m.name}`);P.x[1-d]=Math.min(100,P.x[1-d]+3);relFeel(P,1-d,'tru',10,'o');relFeel(P,d,'pro',10,'i')});
  // senior → junior
  if(relSenior(m,o)&&act&&(m.dance||0)>=(o.dance||0)+12&&b>=35&&Math.random()<.25*rp.kind)add('teach'+d,2,45,()=>{P.mt++;relHist(P,'ev','Lesson from a senpai',relTxt('teach',m,o,P));P.x[1-d]=Math.min(100,P.x[1-d]+3);relFeel(P,1-d,'adm',12,'o');relFeel(P,d,'pro',8,'i')});
  if(relSenior(o,m)&&act&&rp.sens>=1&&b>=45&&Math.random()<.18)add('adv'+d,1.5,60,()=>{P.mt++;relHist(P,'ev','Asking for advice',relTxt('advice',m,o,P));P.x[1-d]=Math.min(100,P.x[1-d]+2);relFeel(P,d,'tru',8,'o')});
  if(relSenior(m,o)&&P.mt>=1&&(o.mh||[]).some(e=>(e.t=='first_center'||e.t=='first_sen')&&S.day-e.day<7))add('proud'+d,3,90,()=>{relHist(P,'ev','Proud senpai',relTxt('proud',m,o,P));relNews(P,'A proud senpai',`${relNm(m)} could not hide how proud she was of ${relNm(o)}.`);relFeel(P,d,'apr',10,'o')});
  // rivalry → motivation / respect
  if(P.r>=40&&Math.random()<.3)add('rmot'+d,2,60,()=>{relHist(P,'ev','Motivated by a rival',relTxt('rmot',m,o,P));if(Math.random()<.5)m.pas=cl((m.pas||50)+1);relFeel(P,d,'res',10,'o')});
  // romance (adults only, rare, private until shown)
  if((m.age||0)>=18&&(o.age||0)>=18&&b>=70&&P.cp>.55&&rp.rom>.6&&!relFv(P,d,'rom')&&Math.random()<.05)add('rom'+d,1,365,()=>{relFeel(P,d,'rom',55,'p');relHist(P,'ev','Special feelings',`${relNm(m)} has started to feel something special for ${relNm(o)}.`,1);relHist(P,'ms','Developed Romantic Feelings','',1)});
  if(relFv(P,d,'rom')>=50&&!P.fl['rh'+d]&&Math.random()<.2)add('romh'+d,1.5,120,()=>{P.fl['rh'+d]=1;relHist(P,'ev','Nervous',`${relNm(m)} gets unusually flustered whenever ${relNm(o)} is around.`);relFeel(P,d,'rom',5,'i')});
  if(relFv(P,d,'rom')>0&&relFv(P,1-d,'rom')<20&&b<60){const F=P.f[d];F.rom.v=Math.max(0,F.rom.v-8);if(F.rom.v<5){delete F.rom;relHist(P,'ev','Feelings faded','',1)}}});
 const r0=relFv(P,0,'rom'),r1=relFv(P,1,'rom');if(r0>=55&&r1>=55&&!P.fl.romObs&&Math.random()<.25)add('romm',2,365,()=>{P.fl.romObs=1;['rom'].forEach(k=>{P.f[0].rom.s='i';P.f[1].rom.s='i'});P.f[0].rom.v=Math.max(P.f[0].rom.v,62);P.f[1].rom.v=Math.max(P.f[1].rom.v,62);relHist(P,'ms','Feelings reciprocated',`${relNm(A)} and ${relNm(B)} seem to share feelings for each other — something the two of them keep to themselves.`);relNews(P,'Something special?',`${relNm(A)} and ${relNm(B)} have grown remarkably close. Their friends have noticed, though nobody says it out loud.`)});
 // conflict: needs friction + shared activity
 const fr=relFv(P,0,'jea')+relFv(P,1,'jea')+P.r*.4+P.c*.5+((wlOf(A).str??0)+(wlOf(B).str??0))*.15;if(act&&fr>=35&&Math.random()<.12*Math.max(rpA.sens,rpA.comp,rpB.sens,rpB.comp))add('conf',2.5,30,()=>{const first=!P.cn;P.cn++;P.c=cl(P.c+20+Math.random()*15,0,100);P.x[0]=Math.max(0,P.x[0]-4);P.x[1]=Math.max(0,P.x[1]-4);const[s,t]=rpA.sens>=rpB.sens?[A,B]:[B,A],ds=relDir(P,s.id);relFeel(P,ds,'fru',18,'o');relFeel(P,1-ds,'fru',10,'i');relHist(P,first?'ms':'ev',first?'First Major Disagreement':'Disagreement',relTxt('conf',s,t,P));if(first||P.c>=50)relNews(P,'Tension',relTxt('confn',s,t,P));if(P.cn>=3&&Math.min(...P.x)<40)relHist(P,'ev','Repeated disagreements',`${relNm(A)} and ${relNm(B)} keep their distance after one argument too many.`)});
 if(P.c>=25){const M=relMediator(P,A,B);if(M&&Math.random()<.35)add('med',2.2,30,()=>{P.c=Math.max(0,P.c-20);relHist(P,'ev','A friend steps in',relTxt('med',A,B,P,M));relNews(P,'Peacemaker',`${relNm(M)} helped ${relNm(A)} and ${relNm(B)} talk things through.`)});
  else if(Math.random()<.2*Math.max(rpA.kind,rpB.kind)&&Math.min(x,y)>=50)add('apol',2,30,()=>{P.c=Math.max(0,P.c-18);relHist(P,'ev','An apology',relTxt('apol',A,B,P))})}}
function relMediator(P,A,B){let best=null,bv=0;S.members.forEach(m=>{if(m.id==A.id||m.id==B.id)return;const p=relGet(m.id,A.id),q=relGet(m.id,B.id);if(!p||!q)return;const v=Math.min(p.x[relDir(p,m.id)],q.x[relDir(q,m.id)]);if(v>=65&&v>bv){bv=v;best=m}});return best}
// varied dialogue, built from personalities and the pair's real history
function relTxt(k,A,B,P,M){const a=relNm(A),b=relNm(B),pa=A.pers,pb=B.pers,lc=(P.lc||'').replace(/^First shared [^(]*\(“?|”?\)$/g,''),song=P.lcen&&P.lcen.t||lc,pk=a=>a[Math.floor(Math.random()*a.length)];
 const V={close:[`After all the time spent together${lc?` since “${lc}”`:''}, ${a} and ${b} now share almost everything.`,`${a} saves the seat next to her for ${b} without even thinking about it anymore.`,`${b} is the first person ${a} texts after a long day.`],
  rivals:[`${a} and ${b} both want the center — and both know it.`,`Since “${song}”, ${a} keeps a quiet eye on ${b}'s every move in rehearsal.`,`${a} and ${b} have become each other's measuring stick.`],
  recon:[`${a} and ${b} finally talked it out. Things feel lighter between them again.`,`After weeks of awkward silence, ${a} and ${b} laughed together at rehearsal.`],
  meal:{Genki:[`“Ramen after practice? My treat!” ${a} dragged ${b} out before she could say no.`,`${a} found a new dessert café and immediately invited ${b}.`],Shy:[`${a} quietly asked ${b} if she wanted to grab dinner. ${b} said yes right away.`],Cool:[`${a} and ${b} shared a late, quiet dinner after the show.`],Elegant:[`${a} invited ${b} for afternoon tea on their day off.`],Airhead:[`${a} got lost on the way to the restaurant, so ${b} came to find her. They ate together anyway.`],Serious:[`${a} and ${b} stayed back to review the show over convenience-store bento.`]}[pa]||[`${a} and ${b} went to eat together after practice.`],
  gift:[`${a} gave ${b} a hand-written card and a small present for her birthday.`,`${a} remembered exactly what ${b} wanted for her birthday.`,`${a} organised a tiny surprise in the dressing room for ${b}'s birthday.`],
  comfort:{Genki:[`${a} sat with ${b} and talked nonsense until she smiled again.`],Shy:[`${a} didn't say much — she just stayed next to ${b} until she felt better.`],Cool:[`“You'll get it next time.” ${a}'s few words meant a lot to ${b}.`],Elegant:[`${a} made ${b} a cup of tea and listened for a long time.`],Airhead:[`${a} brought ${b} her favourite snacks — and three she'd never heard of.`],Serious:[`${a} helped ${b} go through what went wrong, step by step.`]}[pa]||[`${a} comforted ${b}.`],
  teach:[`${a} stayed after rehearsal to go through the choreography with ${b}, count by count.`,`“Your arms, like this.” ${a} showed ${b} the move that had been troubling her.`,`${a} lent ${b} her old practice notes from her first Stage.`],
  advice:[`${a} asked ${b} how she handles nerves before a show.`,`${a} went to ${b} for advice about her future.`],
  proud:[`${a} was the first to congratulate ${b} — her kouhai has grown so much.`,`${a} watched ${b}'s big moment from the wings with tears in her eyes.`],
  rmot:[`Seeing ${b}'s performance, ${a} quietly added an extra hour to her own practice.`,`${a} won't admit it, but ${b} is the reason she keeps pushing.`],
  conf:{Genki:[`${a} snapped at ${b} during rehearsal and regretted it at once.`],Shy:[`${a} felt hurt by something ${b} said, and couldn't bring herself to say so.`],Cool:[`${a} and ${b} disagreed sharply about the formation — neither backed down.`],Elegant:[`${a} found ${b}'s remark careless. She said nothing, but kept her distance.`],Airhead:[`A misunderstanding between ${a} and ${b} snowballed into an argument.`],Serious:[`${a} criticised ${b}'s preparation in front of everyone. It didn't go well.`]}[pa]||[`${a} and ${b} argued.`],
  confn:[`There is tension between ${a} and ${b}.`,`${a} and ${b} have not been speaking much lately.`],
  med:[`${M?relNm(M):'A friend'} sat ${a} and ${b} down and helped them talk it through.`,`${M?relNm(M):'A friend'} quietly made sure ${a} and ${b} ended up on the same side of the dressing room — and talking again.`],apol:[`${pk([a,b])} apologised first. It wasn't easy, but it helped.`,`${a} left a note in ${b}'s locker: “Sorry about the other day.”`]}[k];
 const hob=(relRp(A).hob||[]).find(h=>(relRp(B).hob||[]).includes(h))||(relRp(A).hob||[])[0]||'music',stg=(P.lc||'').match(/“([^”]+)”/),place=stg?stg[1]:'the show';
 const X={meal:[`After ${place}, ${a} and ${b} shared a late snack backstage and lost track of time.`,`${a} and ${b} walked to the station together, talking the whole way.`,`${a} dragged ${b} into a little ${hob} shop on the way home.`,`${a} and ${b} spent their day off together — mostly talking about ${hob}.`,`${b} taught ${a} her favourite convenience-store snack combination.`,`${a} and ${b} stayed in the practice room after everyone left, just chatting.`]}[k]||[];
 const used=new Set((P.h||[]).slice(-8).map(e=>e.x)),pool=[...(V||[]),...X].filter(t=>!used.has(t));return pk(pool.length?pool:(V||['…']))}
// General Election: adjacent ranks create admiration / pressure / rivalry (only once per election)
function relCheckGE(){try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>(geS().list||[]).forEach(e=>{if(e.st!='done'||!e.final||e.relDone)return;e.relDone=1;const L=e.final.rows.filter(r=>r.rank).sort((a,b)=>a.rank-b.rank).slice(0,16);
 for(let i=0;i+1<L.length;i++){const A=get(L[i].id),B=get(L[i+1].id);if(!A||!B)continue;const P=relGet(A.id,B.id,`${e.name}`);if(!P)continue;const dB=relDir(P,B.id),rpB=relRp(B);P.r=cl(P.r+8*rpB.comp,0,100);relFeel(P,dB,rpB.comp>1.1?'jea':'adm',10,'i');relFeel(P,1-dB,'res',6,'i')}})))}catch(x){console.error(x)}}
// ---- Social Circles: cliques of mutual bonds ---------------------------------------------------------------------------------
function relCircles(){const R=relS(),live=new Set(S.members.map(m=>m.id)),bd=(i,j)=>{const P=relGet(i,j);return P?Math.min(...P.x):0},mut=(i,ids)=>ids.filter(j=>j!=i).every(j=>bd(i,j)>=68);
 // 1. existing circles keep their identity: members who drift away leave, close newcomers join
 const keep=[];R.circ.forEach(c=>{const ids=c.ids.filter(i=>live.has(i)),gone=ids.filter(i=>{const o=ids.filter(j=>j!=i);return o.length&&o.reduce((a,j)=>a+bd(i,j),0)/o.length<55});let L=ids.filter(i=>!gone.includes(i));
  gone.forEach(i=>relNews(null,'Social Circle',`${relNm(get(i))} has been spending less time with ${L.slice(0,2).map(z=>relNm(get(z))).join(' and ')}.`));
  if(L.length<3){if(c.ids.filter(i=>live.has(i)).length>=3)relNews(null,'Social Circle',`The circle of ${c.ids.slice(0,3).map(z=>relNm(relM(z))).join(', ')} has drifted apart.`);return}
  S.members.forEach(m=>{if(L.length<7&&!L.includes(m.id)&&mut(m.id,L)){L.push(m.id);relNews(null,'Social Circle',`${relNm(m)} has been welcomed into the circle of ${L.filter(z=>z!=m.id).slice(0,2).map(z=>relNm(get(z))).join(' and ')}.`)}});
  keep.push({...c,ids:L,upd:S.day})});
 // 2. new circles: groups of 3+ mutually close members not already together
 const N=new Map([...live].map(i=>[i,new Set()]));Object.values(R.p).forEach(P=>{if(N.has(P.a)&&N.has(P.b)&&Math.min(...P.x)>=68){N.get(P.a).add(P.b);N.get(P.b).add(P.a)}});
 const out=[];const bk=(r,p,x)=>{if(!p.size&&!x.size){if(r.length>=3)out.push(r);return}if(out.length>200)return;const u=[...p,...x][0],nu=N.get(u);[...p].filter(v=>!nu.has(v)).forEach(v=>{bk([...r,v],new Set([...p].filter(z=>N.get(v).has(z))),new Set([...x].filter(z=>N.get(v).has(z))));p.delete(v);x.add(v)})};bk([],new Set([...live].filter(i=>N.get(i).size>=2)),new Set());
 out.sort((a,b)=>b.length-a.length).forEach(ids=>{ids=ids.slice(0,7);if(keep.some(c=>ids.filter(i=>c.ids.includes(i)).length>=Math.ceil(ids.length*2/3)))return;const c={id:'c'+(++R.seq),ids,since:S.day,upd:S.day};keep.push(c);relNews(null,'New Social Circle',`${ids.map(z=>relNm(get(z))).join(', ')} have become a close-knit group.`)});
 R.circ=keep.slice(0,16)}
// ---- graduation: friends react individually; history stays -------------------------------------------------------------------
{const f=ctComplete;ctComplete=function(m){const ok=m&&S.members.includes(m);const fr=[];try{if(ok)Object.values(relS().p).forEach(P=>{if(P.a!=m.id&&P.b!=m.id)return;const o=get(P.a==m.id?P.b:P.a);if(!o)return;const b=P.x[relDir(P,o.id)];if(b>=60)fr.push([o,b,P])})}catch(e){}const r=f.apply(this,arguments);
 try{fr.sort((a,b)=>b[1]-a[1]).slice(0,6).forEach(([o,b,P])=>{const t={Genki:`${relNm(o)} cried the loudest at ${relNm(m)}'s graduation — and then hugged everyone.`,Shy:`${relNm(o)} wrote ${relNm(m)} a long letter she couldn't read out loud.`,Cool:`${relNm(o)} kept her composure on stage, then disappeared backstage for a while.`,Elegant:`${relNm(o)} gave ${relNm(m)} a bouquet and a quiet "thank you for everything".`,Airhead:`${relNm(o)} insisted they would still meet every week. She means it.`,Serious:`${relNm(o)} promised ${relNm(m)} she would protect what they built together.`}[o.pers]||`${relNm(o)} said goodbye to ${relNm(m)}.`;relHist(P,'ms','Graduation',t);if(b>=85){wlAdj(o,{str:3},`${m.name}'s graduation`);relNews(P,'Farewell',t)}})}catch(e){console.error(e)}return r}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&S.members.length){S.members.forEach(m=>{if(!m.rp)relRp(m)});const R=relS(),wk=Math.floor(S.day/7);if(R.wk==null)R.wk=wk;if(wk!=R.wk){R.wk=wk;relWeekly()}}}catch(e){console.error(e)}return r}}
// conflicts add some stress when the members keep working together (existing wellness system)
{const f=relWeekly;relWeekly=function(){f.apply(this,arguments);try{Object.values(relS().p).forEach(P=>{if(P.c>=40&&S.day-(P.ls||0)<7){const A=get(P.a),B=get(P.b);if(A&&B){wlAdj(A,{str:2},`tension with ${B.name}`);wlAdj(B,{str:2},`tension with ${A.name}`)}}})}catch(e){}}}
// ---- UI -----------------------------------------------------------------------------------------------------------------------
function relOf(id){return Object.values(relS().p).filter(P=>P.a==id||P.b==id)}
function relStats(){const P=Object.values(relS().p).filter(P=>relAct(get(P.a))&&relAct(get(P.b)));return{close:P.filter(p=>Math.min(...p.x)>=75).length,riv:P.filter(p=>p.d.some(l=>/Rivals|Competitors/.test(l))).length,con:P.filter(p=>p.d.some(l=>l=='Conflict'||l=='Strained Relationship')).length,circ:relS().circ.length}}
const relTag=l=>`<span class="tag reltag rel-${l.replace(/[^A-Za-z]/g,'').toLowerCase()}">${esc(l)}</span>`;
function relTeamTxt(A,B){if(!relAct(A)||!relAct(B))return'Former member'+(!relAct(A)&&!relAct(B)?'s':'');if(A.group!=B.group){const k=(A.kn&&A.kn.gid==B.group)||(B.kn&&B.kn.gid==A.group);return k?'Different groups · concurrent membership':'Different groups'}const ta=teamOf(A),tb=teamOf(B);if(ta&&tb&&ta.id==tb.id)return`Same team (${ta.name})`;return'Different teams'}
V.rel=function(){const R=relS(),st=relStats(),f=ui.relf=ui.relf||{mid:null,lv:'all',dy:'all',team:'all',q:'',sort:'d'};const all=[...S.members,...(S.alumni||[])];if(f.mid==null&&S.members[0])f.mid=S.members[0].id;const me=relM(f.mid);
 let L=me?relOf(me.id).map(P=>{const d=relDir(P,me.id),o=relM(d?P.a:P.b);return{P,o,b:P.x[d],d}}).filter(z=>z.o):[];
 L=L.filter(z=>(f.lv=='all'||relLv(z.b)==f.lv)&&(f.dy=='all'||relDynVis(z.P).includes(f.dy))&&(f.team=='all'||z.o.tid==+f.team)&&(!f.q||(z.o.name+' '+(z.o.stage||'')).toLowerCase().includes(f.q.toLowerCase()))).sort((a,b)=>f.sort=='a'?a.b-b.b:b.b-a.b);
 const teams=S.groups.flatMap(g=>(g.teams||[]).map(t=>[t.id,(S.groups.length>1?g.name+' · ':'')+t.name])),DY=['Best Friends','Close Friends','Good Friends','Senpai & Kouhai','Mentor & Mentee','Rivals','Friendly Rivals','Professional Competitors','Strained Relationship','Conflict','Complicated Relationship','Distant Relationship'];
 const op=(a,v)=>a.map(([k,n])=>`<option value="${k}" ${String(k)==String(v)?'selected':''}>${esc(n)}</option>`).join('');
 return`<div class="c"><h2 class="ht">Relationships</h2><p class="st">Members' private relationships develop on their own from what they live through together. You can observe them, but not change them.</p>
 <div class="gekg">${thKpi('Close relationships',st.close,'both members ≥ 75 Bond')}${thKpi('Active rivalries',st.riv,'')}${thKpi('Current conflicts',st.con,'conflict or strained')}${thKpi('Social Circles',st.circ,'')}</div></div>
 <div class="c"><div class="row"><label class="st">Member <select onchange="ui.relf.mid=+this.value;render()">${op(all.map(m=>[m.id,relNm(m)+(relAct(m)?'':' (former)')]),f.mid)}</select></label><input placeholder="Search" value="${esc(f.q)}" onchange="ui.relf.q=this.value;render()"><select onchange="ui.relf.lv=this.value;render()">${op([['all','All levels'],...REL_LV.map(([,n])=>[n,n])],f.lv)}</select><select onchange="ui.relf.dy=this.value;render()">${op([['all','All dynamics'],...DY.map(d=>[d,d])],f.dy)}</select><select onchange="ui.relf.team=this.value;render()">${op([['all','All teams'],...teams],f.team)}</select><select onchange="ui.relf.sort=this.value;render()">${op([['d','Bond: high → low'],['a','Bond: low → high']],f.sort)}</select></div>
 ${me?`<p class="st">${esc(relNm(me))}'s relationships — Bond from her perspective (${L.length})</p><div class="relgrid">${L.map(z=>`<button class="c m relrow" onclick="relOpen(${me.id},${z.o.id})">${ptc(z.o,40)}<div><b>${esc(relNm(z.o))}</b>${relAct(z.o)?'':' <small class="st">former</small>'}<div class="relbar"><i style="width:${z.b}%"></i></div><small>${Math.round(z.b)} · ${relLv(z.b)}</small><div>${relDynVis(z.P).map(relTag).join('')}</div></div></button>`).join('')||emptyBox('No recorded relationships yet — they form as members work together.')}</div>`:''}</div>
 <div class="c"><h3>Social Circles</h3>${R.circ.length?R.circ.map(c=>`<div class="relcirc"><div class="ctfaces">${c.ids.map(i=>{const m=relM(i);return m?`<span title="${esc(relNm(m))}">${ptc(m,34)}</span>`:''}).join('')}</div><span class="st">${c.ids.map(i=>esc(relNm(relM(i)))).join(', ')} · since ${jd(c.since)}</span></div>`).join(''):emptyBox('No Social Circles have formed yet.')}</div>
 <div class="c"><h3>Relationship News</h3>${R.news.length?`<ul class="ms">${R.news.slice(0,25).map(n=>`<li>${jd(n.d)} · <b>${esc(n.t)}</b> — ${esc(n.x)}${n.k?` <button class="b s" onclick="relOpenK('${n.k}')">View</button>`:''}</li>`).join('')}</ul>`:emptyBox('Nothing notable yet.')}</div>`};
function relOpenK(k){const[a,b]=k.split('-').map(Number);relOpen(a,b)}
function relOpen(a,b){const P=relGet(a,b),A=relM(a),B=relM(b);if(!A||!B)return;if(!P){ui.mod={t:'html',h:`<h2 class="ht">${esc(relNm(A))} & ${esc(relNm(B))}</h2>${emptyBox('They barely know each other yet.')}`};return render()}
 const dA=relDir(P,a),side=(m,d)=>{const F=P.f[d]||{},obs=Object.entries(F).filter(([,o])=>o.s=='o'&&(o.v>=10)),inf=Object.entries(F).filter(([,o])=>o.s=='i'&&o.v>=10),pr=Object.values(F).some(o=>o.s=='p');
  return`<div class="c relside">${ptc(m,64)}<b>${esc(relNm(m))}</b><small class="st">${esc(gn(m.group))} · ${relAct(m)?(teamOf(m)&&isAct(m)?esc(teamOf(m).name):esc(TL())):'former member ('+esc(CT_ST[ctStatus(m)]||'Graduated')+')'}</small>
  <div class="relbig">${Math.round(P.x[d])}<small>/100 · ${relLv(P.x[d])}</small></div><small class="st">Bond toward ${esc(relNm(d==dA?B:A))}</small>
  ${obs.length?`<div><small>Observed feelings</small><div>${obs.map(([k])=>`<span class="tag ${REL_NEG.has(k)?'relneg':'relpos'}">${REL_F[k]}</span>`).join('')}</div></div>`:''}${inf.length?`<div><small>Inferred (may feel)</small><div>${inf.map(([k])=>`<span class="tag relinf">${REL_F[k]}?</span>`).join('')}</div></div>`:''}${pr?'<div><small class="st">Some feelings remain undisclosed.</small></div>':''}</div>`};
 const H=P.h.filter(e=>!e.p).slice().sort((x,y)=>x.d-y.d);
 ui.mod={t:'html',h:`<h2 class="ht">${esc(relNm(A))} & ${esc(relNm(B))}</h2><div class="relpair">${side(A,dA)}${side(B,1-dA)}</div>
 <p class="st">${esc(relTeamTxt(A,B))} · known each other since ${jd(P.t0)}</p><div>${relDynVis(P).map(relTag).join('')||'<span class="st">No special relationship.</span>'}</div>
 <h3>Shared history</h3>${H.length?`<ul class="ms">${H.map(e=>`<li>${jd(e.d)} · <b>${esc(e.t)}</b>${e.x?' — '+esc(e.x):''}</li>`).join('')}</ul>`:emptyBox('No shared history yet.')}`};render()}
(function(){const M=SECS.find(s=>s.k=='members');if(!M)return;M.v.push(['rel','Relationships']);Object.assign(SUBLOC,{rel:'Members’ Lounge · Relationships'})})();
// profile: closest relationships (read only)
{const f=profHtml;profHtml=function(m,cand){let h=f.apply(this,arguments);try{if(cand||!m||!S.members.includes(m)||(ui.ptab||'stats')!='stats')return h;const L=relOf(m.id).map(P=>({P,o:relM(P.a==m.id?P.b:P.a),b:P.x[relDir(P,m.id)]})).filter(z=>z.o).sort((a,b)=>b.b-a.b).slice(0,4);
 h+=`<div class="c relprof"><h3>Relationships</h3>${L.length?L.map(z=>`<button class="b s ghost relmini" onclick="relOpen(${m.id},${z.o.id})">${ptc(z.o,26)} ${esc(relNm(z.o))} <small>${Math.round(z.b)} · ${relLv(z.b)}</small></button>`).join(''):'<p class="st">No close relationships yet.</p>'}<button class="b s" onclick="ui.mod=null;ui.relf=ui.relf||{};ui.relf.mid=${m.id};goView('rel')">All relationships</button></div>`}catch(e){console.error(e)}return h}}
{const f=ctFormerOpen;ctFormerOpen=function(id){f.apply(this,arguments);try{if(ui.mod&&ui.mod.h&&relOf(id).length)ui.mod.h+=`<div class="row"><button class="b s" onclick="ui.mod=null;ui.relf=ui.relf||{};ui.relf.mid=${id};goView('rel')">Relationships (${relOf(id).length})</button></div>`}catch(e){}}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{relS();S.members.forEach(relRp)}catch(e){console.error(e)}return r}}
