// =====================================================================================
//  Online Theater Membership — one company-wide membership
// -------------------------------------------------------------------------------------
//  · Every theater (all groups, all teams) shows the same membership: packages, members, history and
//    revenue are shared (S.thM). It is billed once a month for the whole company.
//  · Existing saves: the per-theater numbers are added together (members and history per package).
// =====================================================================================
function thMShared(){const H=thS();if(S.thM&&Array.isArray(S.thM.pk))return S.thM;const M={pk:[],subs:{},subH:[],bill:null};const by=new Map();
 Object.values(H.T||{}).forEach(T=>{(T.pk||[]).forEach(pk=>{if(!M.pk.some(z=>z.id==pk.id))M.pk.push({...pk})});Object.entries(T.subs||{}).forEach(([k,v])=>{M.subs[k]=(M.subs[k]|0)+(v|0)});
  (T.subH||[]).forEach(r=>{let R=by.get(r.mon);if(!R){R={mon:r.mon,pk:{},rev:0};by.set(r.mon,R)}R.rev+=r.rev||0;Object.entries(r.pk||{}).forEach(([k,x])=>{const z=R.pk[k]=R.pk[k]||{act:0,new:0,can:0,rev:0};['act','new','can','rev'].forEach(f=>z[f]+=x[f]||0)})});if(T.bill!=null&&(M.bill==null||T.bill>M.bill))M.bill=T.bill});
 if(!M.pk.length)M.pk=[{id:'pkb',name:'Basic Online Membership',price:980,on:1,ben:'Live stream of every performance'},{id:'pkp',name:'Premium Online Membership',price:1980,on:1,ben:'Live streams, 7-day archive'}];
 M.subH=[...by.values()].sort((a,b)=>a.mon-b.mon).slice(-36);S.thM=M;return M}
// every theater points at the shared membership
{const f=thOf;thOf=function(key){const T=f.apply(this,arguments);try{if(T&&S){const M=thMShared();T.pk=M.pk;T.subs=M.subs;T.subH=M.subH;if(M.bill!=null)T.bill=M.bill}}catch(e){console.error(e)}return T}}
// monthly billing once for the whole company
thMonthly=function(){const M=thMShared(),mk=dt().getFullYear()*12+dt().getMonth();if(M.bill===mk)return;const H=thS(),A=S.members.filter(m=>m.status=='trainee'||isAct(m)),pop=A.length?avg(A.map(m=>m.pop)):0,shows=H.pf.filter(p=>p.day>S.day-31),sat=shows.length?avg(shows.map(p=>p.sat)):50,nT=Math.max(1,new Set(shows.map(p=>p.k)).size);
 const G=S.fb&&S.fb.segs?avg(S.fb.segs.filter(z=>z.n).map(z=>z.eng||50)):50,row={mon:mk,pk:{},rev:0};
 M.pk.forEach(pk=>{const cur=M.subs[pk.id]|0;if(!pk.on){row.pk[pk.id]={act:0,new:0,can:cur,rev:0};M.subs[pk.id]=0;return}
  const tgt=Math.max(0,S.fans*.035*(.4+pop/90)*Math.min(1.6,Math.sqrt((shows.length/nT+1)/10))*(1+.25*(nT-1))*(.6+G/120)*(.7+sat/160)*Math.pow(980/Math.max(100,pk.price),1.1)*(pk.id=='pkp'?.45:1));
  const can=Math.round(cur*(.04+.05*Math.max(0,(60-sat)/60)+.03*Math.max(0,pk.price/980-1))*(.8+Math.random()*.4)),nw=Math.max(0,Math.round(Math.max(0,tgt-cur+can)*.4*(.8+Math.random()*.4)));const act=Math.max(0,cur-can+nw),rev=act*pk.price;M.subs[pk.id]=act;row.pk[pk.id]={act,new:nw,can,rev};row.rev+=rev});
 M.bill=mk;M.subH.push(row);if(M.subH.length>36)M.subH.shift();Object.values(H.T||{}).forEach(T=>{T.bill=mk});if(row.rev)earn(row.rev,`Online Theater Membership (${fbMonName(mk)})`)};
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S){thMShared();Object.keys(thS().T).forEach(k=>thOf(k))}}catch(e){console.error(e)}return r}}
