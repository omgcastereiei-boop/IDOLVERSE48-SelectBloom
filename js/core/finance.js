// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Central Financial Engine
// -------------------------------------------------------------------------------------
//  Every yen that enters or leaves the company passes through finPost(). earn() / spend() and the older project
//  helpers (ccPay, xeOut, rcPay …) are thin wrappers around it.
//  · one currency (JPY), whole yen, Math.round everywhere
//  · every transaction: unique id (TX…), day, signed amount, category, source, description, group, optional
//    member / project / dedupe key, gross and deductions for sales
//  · a dedupe key can be posted only once (salaries, job payments, revenue shares, recurring costs)
//  · reversals post the opposite amount and point back to the original (rev)
//  · company money (S.money) is separate from member earnings (m.earn / m.payH)
//  · monthly aggregates (S.fx.mon) are built from the same postings, so reports equal the ledger
// =====================================================================================
const FIN_START=50000000;           // starting capital for a new company (Normal · Balanced)
const FIN_LEGACY_START=3000000;     // starting capital of saves made before the overhaul
const FIN_TAX=.30;                  // simplified corporate tax on taxable profit of the fiscal year (April–March)
// categories ------------------------------------------------------------------------------------------------------
const FIN_INC={cd:'CD & album sales',digital:'Digital & streaming',concert:'Concert tickets',online:'Online tickets & memberships',theater:'Theater tickets',dvd:'DVD & video',merch:'Merchandise',fanev:'Fan events',deals:'Sponsorship, commercial & appearances',license:'Licensing & drama',other:'Other income',refund:'Refunds received'};
const FIN_EXP={prod:'Production costs',ops:'Operating expenses',msal:'Member salaries',mjob:'Member job payments',mshare:'Member revenue sharing',staff:'Staff salaries',mkt:'Marketing',tax:'Taxes',debt:'Debt repayments',int:'Loan interest'};
const FIN_FIN={loan:'Loan proceeds',adj:'Economy rebalance adjustment'}; // financing / adjustments: not revenue, not expense
// label → category; for sales: gross receipts and the deduction taken before the company receives its share
//  k: gross per allocated yen (CD: retail ¥1,600 per CD, company allocation ¥300 per CD)
//  d: share of the gross kept by the channel (ticketing / platform / manufacturing) — the company receives the rest
const FIN_RULES=[
 [/^(Election )?CD sales|^Sales: |^Album sales/,'cd',{k:1600/300,dl:'Retail, distribution, manufacturing & royalties'}],
 [/^Merch & streaming/,'digital',{d:.50,dl:'Platform fees, merchandise manufacturing & online shop'}],
 [/merchandise/i,'merch',{d:.50,dl:'Merchandise manufacturing, stock & venue sales'}],
 [/Hi-Touch tickets|^Handshake Event day \d+:/,'fanev',{d:.08,dl:'Ticketing fees'}],
 [/Online Theater Membership/,'online',{d:.50,dl:'Streaming platform fees & broadcast production'}],
 [/Concert online tickets/,'online',{}],
 [/Theater tickets|Graduation Stage tickets/,'theater',{d:.05,dl:'Ticketing fees'}],
 [/Concert tickets|ceremony tickets|Mini Concert|^Road Show: /,'concert',{}],
 [/^External event|^Music program/,'deals',{d:.15,dl:'Advertising agency & booking commissions'}],
 [/Screening tickets|TV ads|Streaming (license|views)/,'license',{}],
 [/DVD|Blu-ray/,'dvd',{}],
 [/refund/i,'refund',{}],
];
const FIN_XRULES=[[/salar/i,'msal'],[/^Job payment/,'mjob'],[/revenue share/i,'mshare'],[/^Staff salaries/,'staff'],[/Marketing|Promotion campaign|Advertising/i,'mkt'],[/Corporate tax|^Tax/i,'tax'],[/Loan repayment/,'debt'],[/Loan interest/,'int'],
 [/^Production|MV production|^Album|Costume|Request Hour CDs|cover|Drama (production|distribution)|Recording|CD manufacturing|Song production/i,'prod']];
function finCatOf(a,l){l=String(l||'');if(a>=0){for(const[re,c,o]of FIN_RULES)if(re.test(l))return[c,o];return['other',{}]}for(const[re,c]of FIN_XRULES)if(re.test(l))return[c,{}];return['ops',{}]}
// project key from a description (single / album / MV / concert / roadshow / event / drama / theater)
function finProjOf(l){l=String(l||'');let m;
 if((m=l.match(/^(?:Production|Sales|CD sales|Election CD sales|Release Day Mini Concert|Handshake Event day \d+(?: cost)?|MV production(?: \(revised budget\))?|MV refund|Costume production|Single production|Job payment · (?:recording|MV filming|handshake event)): (.+?)(?: \(.*\))?$/)))return'single:'+m[1].replace(/^.*“|”$/g,'');
 if((m=l.match(/^Album(?: sales)?: (.+)$/)))return'album:'+m[1];
 if((m=l.match(/^Concert [^:]*: (.+?)(?: · Performance \d+| \(.*\))?$/))||(m=l.match(/^Job payment · concert: (.+?)(?: · .*)?$/)))return'concert:'+m[1];
 if((m=l.match(/^Road ?[Ss]how[^:]*: (.+?)(?: day \d| \(.*\))?$/))||(m=l.match(/^Job payment · roadshow: (.+?)(?: day \d)?$/)))return'road:'+m[1];
 if((m=l.match(/^(?:External event|Music program): (.+)$/))||(m=l.match(/^(?:Transportation|Accommodation|Staff \/ Crew|Equipment|Other operational expenses): (.+)$/))||(m=l.match(/^Job payment · (?:external event|music program): (.+)$/)))return'event:'+m[1];
 if((m=l.match(/^(?:Drama [^:]*|Screening tickets & goods|TV ads & sponsors \(ep \d+\)|Streaming[^:]*|Job payment · drama): (.+)$/)))return'drama:'+m[1];
 if((m=l.match(/^Theater (?:tickets|operating cost): ([^(]+?)(?: \(.*)?$/)))return'theater:'+m[1].trim();
 return null}
// store ---------------------------------------------------------------------------------------------------------------
function finS(){if(!S)return null;let X=S.fx;if(!X||typeof X!='object')X=S.fx={};X.v=X.v||1;X.mon=X.mon&&typeof X.mon=='object'?X.mon:{};X.keys=X.keys&&typeof X.keys=='object'?X.keys:{};
 X.loans=Array.isArray(X.loans)?X.loans:[];X.tax=X.tax&&typeof X.tax=='object'?X.tax:{nol:0,due:[],hist:[]};X.tax.due=X.tax.due||[];X.tax.hist=X.tax.hist||[];X.tax.nol=+X.tax.nol||0;
 X.proj=X.proj&&typeof X.proj=='object'?X.proj:{};X.facil=Array.isArray(X.facil)?X.facil:[];X.cf=X.cf||{};return X}
const finYM=d=>{const t=new Date(2026,3,1+d);return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')};
const finFY=d=>{const t=new Date(2026,3,1+d);return t.getMonth()>=3?t.getFullYear():t.getFullYear()-1}; // fiscal year starts in April
function finLedger(){try{if(typeof gsFin=='function')return gsFin()}catch(e){}S.fin=S.fin||{seq:0,tx:[]};S.fin.tx=S.fin.tx||[];return S.fin}
let FIN_GID=null; // a caller may name the group a posting belongs to
// the one place where the company's money changes
function finPost(o){if(!S)return null;let a=Math.round(+o.a);if(!isFinite(a)||a===0&&!o.zero)return null;const X=finS(),key=o.key||null;
 if(key&&X.keys[key])return null; // duplicate payment / income prevented
 try{moneyOk()}catch(e){}
 const l=String(o.l||'');let cat=o.cat,opt={};if(!cat){[cat,opt]=finCatOf(a,l)}else if(a>=0){const r=FIN_RULES.find(z=>z[1]==cat);opt=o.rule||{}}
 // sales: gross receipts and channel deductions; the company receives the allocated (net) amount only
 let gross=null,ded=0,cash=a;
 if(a>0&&!o.net){if(o.gross!=null){gross=Math.round(o.gross);ded=Math.max(0,gross-a)}else if(opt.k){gross=Math.round(a*opt.k);ded=gross-a}else if(opt.d){gross=a;ded=Math.round(a*opt.d);cash=a-ded}}
 S.money+=cash;if(cash>=0){if(!FIN_FIN[cat])S.inc=(+S.inc||0)+cash}else{if(!FIN_FIN[cat])S.exp=(+S.exp||0)-cash}S.mOk=S.money;
 const F=finLedger(),id='TX'+(++F.seq);let gid=o.gid!=null?o.gid:FIN_GID;if(gid==null){try{gid=typeof GS_TXG!='undefined'&&GS_TXG!=null?GS_TXG:(typeof gsAg=='function'?gsAg():S.ag)}catch(e){gid=S.ag}}
 const proj=o.proj!==undefined?o.proj:finProjOf(l);
 const tx={id,co:S.co,gid,type:o.type||(typeof gsType=='function'?gsType(l):cat),io:cash>=0?'in':'out',amt:Math.abs(cash),day:S.day,desc:l,cat,src:o.src||finSrcOf(cat,l),v:2};
 if(gross!=null){tx.gross=gross;tx.ded=ded;tx.dl=opt.dl||o.dl||'Deductions'}if(o.mid!=null)tx.mid=o.mid;if(proj)tx.proj=proj;if(key)tx.key=key;if(o.rev)tx.rev=o.rev;if(o.units)tx.units=o.units;if(o.note)tx.note=o.note;
 F.tx.push(tx);if(F.tx.length>60000)F.tx.splice(0,F.tx.length-60000);
 S.led.unshift({d:S.day,l,a:cash,_t:1,id});S.led.length=Math.min(S.led.length,80);
 if(key)X.keys[key]=id;
 // monthly aggregate
 const ym=finYM(S.day),M=X.mon[ym]=X.mon[ym]||{inc:{},exp:{},fin:{},gross:0,ded:0,n:0};M.n++;
 if(FIN_FIN[cat])M.fin[cat]=(M.fin[cat]||0)+cash;else if(cash>=0)M.inc[cat]=(M.inc[cat]||0)+cash;else M.exp[cat]=(M.exp[cat]||0)-cash;if(gross!=null){M.gross+=gross;M.ded+=ded}
 if(proj){const P=X.proj[proj]=X.proj[proj]||{k:proj,inc:0,exp:0,d0:S.day,d1:S.day,n:0};if(FIN_FIN[cat]){}else if(cash>=0)P.inc+=cash;else P.exp-=cash;P.d1=S.day;P.n++}
 return tx}
function finSrcOf(cat,l){if(/Theater/.test(l))return'theater';if(/Concert/.test(l))return'concert';if(/Road ?[Ss]how/.test(l))return'roadshow';if(/Handshake|Hi-Touch/.test(l))return'fan events';if(/External event|Music program/.test(l))return'external events';if(/Election/.test(l))return'election';if(/Drama/.test(l))return'drama';if(/MV|Music Video/.test(l))return'music video';if(/Album/.test(l))return'album';if(/Production|CD sales|Sales:/.test(l))return'single';if(/Audition/.test(l))return'audition';if(/salar|Job payment|revenue share/i.test(l))return'members';return'company'}
// reversal of a posted transaction (refund / cancellation): posts the opposite amount once
function finReverse(txid,why){const F=finLedger(),t=F.tx.find(x=>x.id==txid);if(!t)return null;const a=t.io=='in'?-t.amt:t.amt;return finPost({a,l:`Reversal: ${t.desc}${why?' — '+why:''}`,cat:t.cat,net:1,key:'rev:'+txid,rev:txid,mid:t.mid,proj:t.proj||null,gid:t.gid})}
// income & expenses through the engine ---------------------------------------------------------------------------------
earn=function(a,l,o){a=+a;if(!isFinite(a)){console.error('earn: invalid amount for "'+l+'":',a);return}if(!a)return;finPost({...(o||{}),a,l})};
spend=function(a,l,o){a=+a;if(!isFinite(a)||a<0){console.error('spend: invalid amount for "'+l+'":',a);toast('That cost could not be calculated, so nothing was charged or bought.','err');return false}moneyOk();if(a>S.money){toast(`Not enough money: need ${yen(a)}, you have ${yen(S.money)}.`,'err');return false}finPost({...(o||{}),a:-a,l});return true};
// an obligation that is paid even when cash is short (salaries, contracts already performed, operating costs)
function finOut(a,l,o){a=Math.round(+a);if(!isFinite(a)||a<=0)return null;return finPost({...(o||{}),a:-a,l})}
// ---- members: employment, positions, salaries -----------------------------------------------------------------------
const FIN_SAL={trainee:80000,member:180000,tvice:230000,tcap:280000,gvice:280000,gcap:350000};
const FIN_POSN={trainee:'Trainee',member:'Active Member',tvice:'Team Vice-Captain',tcap:'Team Captain',gvice:'Group Vice-Captain',gcap:'Group Captain'};
const FIN_SEN=10000; // per completed year of employment
const finDate=d=>new Date(2026,3,1+d);
function finMem(id){if(!S)return null;let m=null;try{m=get(id)}catch(e){}if(!m)m=(S.alumni||[]).find(a=>a.id==id)||null;if(!m&&typeof ctMem=='function'){try{m=ctMem(id)}catch(e){}}return m}
function finEmpStart(m){if(!m)return 0;if(m.emp==null){let d=m.joined;if(d==null&&m.ct&&m.ct.start!=null)d=m.ct.start;m.emp=d==null?(S?S.day:0):d}return m.emp}
function finYears(m,day){const a=finDate(finEmpStart(m)),b=finDate(day==null?S.day:day);let y=b.getFullYear()-a.getFullYear();if(b.getMonth()<a.getMonth()||(b.getMonth()==a.getMonth()&&b.getDate()<a.getDate()))y--;return Math.max(0,y)}
function finNextAnniv(m){const a=finDate(finEmpStart(m)),y=finYears(m)+1;const n=new Date(a.getFullYear()+y,a.getMonth(),a.getDate());return Math.round((n-finDate(0))/864e5)}
const finRealGroup=g=>g&&!g.dis&&!g.ext&&g.type!='unit'&&g.type!='solo';
function finUnitActive(g){if(!g||g.dis)return false;try{if(typeof uState=='function'&&uState(g)!='active')return false}catch(e){}return true}
function finRoster(g){try{if(typeof uRoster=='function')return uRoster(g)}catch(e){}return g.type=='solo'?(g.solo&&!g.solo.end?[g.solo.mid]:[]):((g.unit&&g.unit.roster)||[])}
// the official position of a member in one group
function finPosIn(m,g){if(!m||!g)return null;if(g.type=='unit'||g.type=='solo')return'member';
 if(g.cap==m.id)return'gcap';if(g.vcap==m.id)return'gvice';const tl=g.tl||{};for(const k in tl){if(tl[k]&&tl[k].cap==m.id)return'tcap'}for(const k in tl){if(tl[k]&&tl[k].vice==m.id)return'tvice'}
 return m.status=='trainee'?'trainee':'member'}
// the groups a member officially belongs to (each one is paid separately)
function finGroupsOf(m){if(!m||!S)return[];const out=[],grad=m.status=='graduated'||!S.members.includes(m);
 (S.groups||[]).forEach(g=>{if(finRealGroup(g)){if(grad)return;const main=(typeof gsGid=='function'?gsGid(m):m.group)==g.id,kn=m.kn&&m.kn.gid==g.id;if(main||kn)out.push(g)}else if((g.type=='unit'||g.type=='solo')&&finUnitActive(g)&&finRoster(g).includes(m.id))out.push(g)});return out}
function finSalaryOf(m,day){const y=finYears(m,day),inc=y*FIN_SEN;const rows=finGroupsOf(m).map(g=>{const pos=finPosIn(m,g),base=FIN_SAL[pos]||FIN_SAL.member;return{gid:g.id,gn:g.name,pos,pn:FIN_POSN[pos],base,inc,amt:base+inc}});return{y,inc,rows,total:rows.reduce((a,r)=>a+r.amt,0)}}
// member earnings (kept apart from the company's money)
function finMemPay(m,k,a,l,o){if(!m||!(a>0))return;const E=m.earn=m.earn&&typeof m.earn=='object'?m.earn:{sal:0,job:0,ge:0};E[k]=(E[k]||0)+a;m.payH=Array.isArray(m.payH)?m.payH:[];m.payH.unshift({d:S.day,k,a,l,...(o||{})});if(m.payH.length>150)m.payH.length=150}
// everyone who may receive a salary: current members + graduated members in an active unit / solo
function finPayees(){const L=S.members.slice(),seen=new Set(L.map(m=>m.id));(S.groups||[]).forEach(g=>{if((g.type=='unit'||g.type=='solo')&&finUnitActive(g))finRoster(g).forEach(id=>{if(seen.has(id))return;const m=finMem(id);if(m){L.push(m);seen.add(id)}})});return L}
function finPayroll(ym){let n=0,t=0;finPayees().forEach(m=>{const P=finSalaryOf(m);P.rows.forEach(r=>{const tx=finPost({a:-r.amt,l:`Member salaries: ${m.name} (${r.gn} · ${r.pn})`,cat:'msal',key:`sal:${ym}:${m.id}:${r.gid}`,mid:m.id,gid:r.gid,proj:null});if(tx){n++;t+=r.amt;finMemPay(m,'sal',r.amt,`Salary ${ym} · ${r.gn} · ${r.pn}`,{gid:r.gid,pos:r.pos,base:r.base,inc:r.inc,ym})}})});return{n,t}}
// ---- job payments ------------------------------------------------------------------------------------------------------
// [label, base per unit (yen)] — unit = song recorded, filming day, performance, event day, appearance
const FIN_JOB={rec:['Recording',12000],mv:['MV filming',20000],concert:['Concert performance',25000],theater:['Theater performance',8000],special:['Special Stage performance',8000],road:['Roadshow',15000],hs:['Handshake event',10000],xe:['External work',20000],mp:['Music program',20000],award:['Awards ceremony',15000],drama:['Drama',30000],ge:['Election ceremony',15000],reunion:['Special appearance',40000]};
// pay = base × units (+ extra yen for workload); one transaction per member; the key prevents paying the same work twice
function finJob(ids,kind,o){o=o||{};const J=FIN_JOB[kind];if(!J)return 0;let t=0;[...new Set(ids||[])].forEach(id=>{const m=finMem(id);if(!m)return;const units=Math.max(1,+(typeof o.units=='function'?o.units(id):o.units)||1),extra=Math.round(+(typeof o.extra=='function'?o.extra(id):o.extra)||0);
  let a=Math.round(J[1]*units+extra);if(o.min)a=Math.max(a,o.min);if(!(a>0))return;const grad=m.status=='graduated'||!S.members.includes(m);
  const tx=finPost({a:-a,l:`Job payment · ${o.lbl||J[0].toLowerCase()}: ${o.desc||''}${grad?' (special appearance)':''} — ${m.name}`,cat:'mjob',key:`job:${o.key}:${id}`,mid:id,gid:o.gid,proj:o.proj||null});
  if(tx){t+=a;finMemPay(m,'job',a,`${J[0]}: ${o.desc||''}`,{kind,units})}});return t}
// ---- operating costs (monthly, by size of the company) ------------------------------------------------------------------
function finOpsPlan(){const act=S.members.filter(m=>m.status!='graduated'),N=act.length,real=(S.groups||[]).filter(finRealGroup),G=Math.max(1,real.length),T=real.reduce((a,g)=>a+((g.teams||[]).length),0),U=(S.groups||[]).filter(g=>(g.type=='unit'||g.type=='solo')&&finUnitActive(g)).length;
 const staffN=4+Math.ceil(N/3)+2*G+2*T+U,thL=(()=>{try{const P=(S.th&&S.th.pf)||[];return new Set(P.filter(p=>p.day>S.day-60).map(p=>String(p.k).split(':')[0])).size?G:0}catch(e){return 0}})(),fans=Math.max(0,S.fans||0);return{N,G,T,U,staffN,rows:[
  ['Office rent','ops',1200000+400000*(G-1)+8000*N],
  ['Utilities & administration','ops',350000+3000*N],
  ['Staff salaries',`staff`,staffN*320000],
  ['Marketing & public relations','mkt',500000+200000*G+Math.min(10000000,Math.round(fans))],
  ['Theater lease','ops',thL*3000000],
  ['Training facilities & maintenance','ops',600000+250000*(G-1)],
  ['Coaches & instructors','ops',150000*Math.ceil(N/12)],
  ['Insurance & legal','ops',150000+1000*N],
  ['Fan club & ticketing systems','ops',300000+Math.min(6000000,Math.round(fans*1.5))],
  ...finS().facil.filter(f=>f.on).map(f=>[`Facility upkeep: ${f.n}`,'ops',f.upk])]}}
function finOps(ym){const P=finOpsPlan();let t=0;P.rows.forEach(([n,c,a])=>{if(a>0&&finPost({a:-a,l:`${n} (${ym})`,cat:c,key:`op:${ym}:${n}`,proj:null,gid:FIN_GID!=null?FIN_GID:(S.groups.find(finRealGroup)||{}).id}))t+=a});return t}
// ---- loans --------------------------------------------------------------------------------------------------------------
function finLoanPay(P,r,n){if(r<=0)return Math.round(P/n);const i=r/12;return Math.round(P*i/(1-Math.pow(1+i,-n)))}
function finLoanTake(P,months,rate,why){P=Math.round(P);if(!(P>0))return null;const X=finS(),id='LN'+(X.loans.length+1)+'-'+S.day,pay=finLoanPay(P,rate,months);const L={id,P,rate,months,pay,bal:P,start:S.day,paid:0,int:0,why:why||'Bank loan',st:'active',hist:[]};X.loans.push(L);
 finPost({a:P,l:`Loan proceeds: ${L.why} (${id})`,cat:'loan',key:'loan:'+id,proj:null});return L}
function finLoanMonth(ym){finS().loans.forEach(L=>{if(L.st!='active'||L.start>=S.day)return;const i=Math.round(L.bal*L.rate/12),prin=Math.min(L.bal,Math.max(0,L.pay-i));
  if(i>0)finPost({a:-i,l:`Loan interest: ${L.id}`,cat:'int',key:`li:${ym}:${L.id}`,proj:null});if(prin>0&&finPost({a:-prin,l:`Loan repayment: ${L.id}`,cat:'debt',key:`lp:${ym}:${L.id}`,proj:null})){L.bal-=prin;L.paid+=prin;L.int+=i;L.hist.push({ym,i,p:prin,bal:L.bal})}if(L.bal<=0){L.bal=0;L.st='repaid'}})}
function finLoanRepayAll(id){const L=finS().loans.find(x=>x.id==id&&x.st=='active');if(!L)return;if(L.bal>S.money)return toast(`Not enough money to repay ${yen(L.bal)}.`,'err');finPost({a:-L.bal,l:`Loan repayment: ${L.id} (early, in full)`,cat:'debt',key:'lpf:'+L.id,proj:null});L.paid+=L.bal;L.bal=0;L.st='repaid';render()}
// ---- tax (fiscal year April–March, paid two months after year end) -----------------------------------------------------
function finFYResult(fy){const X=finS();let rev=0,exp=0;Object.entries(X.mon).forEach(([ym,M])=>{const[y,m]=ym.split('-').map(Number);const f=m>=4?y:y-1;if(f!=fy)return;rev+=Object.values(M.inc).reduce((a,b)=>a+b,0);exp+=Object.entries(M.exp).filter(([c])=>c!='tax'&&c!='debt').reduce((a,[,b])=>a+b,0)});return{rev,exp,profit:rev-exp}}
function finTaxYearEnd(fy){const X=finS(),T=X.tax;if(T.hist.some(h=>h.fy==fy)||(T.from!=null&&fy<T.from))return;const R=finFYResult(fy);let base=R.profit,used=0;if(base>0&&T.nol>0){used=Math.min(T.nol,base);base-=used;T.nol-=used}else if(base<0){T.nol+=-base;base=0}
 const amt=Math.round(Math.max(0,base)*FIN_TAX);const h={fy,rev:R.rev,exp:R.exp,profit:R.profit,nolUsed:used,base,amt,paid:0,due:S.day+60};T.hist.push(h);if(amt>0)T.due.push({fy,amt,due:h.due})}
function finTaxPay(){const T=finS().tax;T.due=T.due.filter(d=>{if(S.day<d.due)return true;finPost({a:-d.amt,l:`Corporate tax: fiscal year ${d.fy}`,cat:'tax',key:'tax:'+d.fy,proj:null});const h=T.hist.find(x=>x.fy==d.fy);if(h)h.paid=d.amt;return false})}
// ---- the monthly accounting cycle (1st of each month; runs once per month) -------------------------------------------------
function finMonthly(){if(!S)return;const X=finS(),ym=finYM(S.day);if(X.lastMon==ym)return;X.lastMon=ym;
 const pr=finPayroll(ym),op=finOps(ym);finLoanMonth(ym);
 const t=finDate(S.day);if(t.getMonth()==3)finTaxYearEnd(t.getFullYear()-1); // April 1: close the fiscal year that just ended
 finTaxPay();
 // Normal difficulty: a company that cannot cover its obligations receives an automatic bank loan (24 months, 3%/year)
 if(S.money<0){const need=Math.ceil((-S.money+20000000)/1000000)*1000000;finLoanTake(need,24,.03,'Emergency operating loan');try{toast(`Funds ran short — an emergency bank loan of ${yen(need)} covered this month's obligations.`,'err')}catch(e){}}
 X.cf[ym]={pay:pr.t,ops:op}}
// ---- reports ---------------------------------------------------------------------------------------------------------------
function finMonthSum(ym){const M=finS().mon[ym]||{inc:{},exp:{},fin:{},gross:0,ded:0};const inc=Object.values(M.inc).reduce((a,b)=>a+b,0),exp=Object.values(M.exp).reduce((a,b)=>a+b,0);return{ym,M,inc,exp,net:inc-exp,gross:M.gross,ded:M.ded}}
// recompute a month straight from the transaction list (the reports must match it)
function finMonthFromTx(ym){const F=finLedger();let inc=0,exp=0;F.tx.forEach(t=>{if(t.v!=2||finYM(t.day)!=ym||FIN_FIN[t.cat])return;if(t.io=='in')inc+=t.amt;else exp+=t.amt});return{inc,exp,net:inc-exp}}
function finLiab(){const X=finS();const debt=X.loans.filter(l=>l.st=='active').reduce((a,l)=>a+l.bal,0),tax=X.tax.due.reduce((a,d)=>a+d.amt,0);return{debt,tax,total:debt+tax}}
function finAssets(){const X=finS(),fac=X.facil.filter(f=>f.on).reduce((a,f)=>a+Math.round(f.cost*Math.max(.2,1-(S.day-f.day)/3650)),0);return{cash:S.money,fac,total:S.money+fac}}
// ---- estimates for projects (before confirming) ----------------------------------------------------------------------------
function finEst(key,rev,exp,lbl){if(!S||!key)return;const P=finS().proj[key]=finS().proj[key]||{k:key,inc:0,exp:0,d0:S.day,d1:S.day,n:0};P.er=Math.round(rev||0);P.ee=Math.round(exp||0);if(lbl)P.lbl=lbl;P.ed=S.day}
