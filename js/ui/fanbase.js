// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Fanbase Management System
// -------------------------------------------------------------------------------------
//  Aggregate fan simulation stored in the save (S.fb), so every save / slot has its own.
//  · Fans live in SEGMENTS: {id,n,ft,org,k,o,pat,loy,eng,sp,reg,ng}. A segment has zero or
//    one Kami Oshi (k) for all of its n fans and an Oshi distribution o{memberId: fans}
//    (overlapping; o[j] ≤ n and never the segment's own Kami Oshi).
//  · Group fanbase = Σ n (each fan is in exactly one segment) and is kept equal to S.fans,
//    so every existing formula keeps using the group fan count.
//  · Unique member supporters = Kami Oshi fans + Oshi fans (a fan is never both for one member).
//  · Fan gains made by the existing systems (releases, concerts, events, handshakes,
//    roadshows) arrive through the GROUP channel; growth of a member's recognition
//    (m.fans, which drives Popularity) arrives through the MEMBER channel.
//  · Monthly simulation: acquisition, loss, type evolution, loyalty/engagement, Kami Oshi
//    and Oshi changes, team/unit stats, history. Events are processed once (ids in fb.done).
//  · Revenue: daily merch & streaming, single/album sales and concert/roadshow turnout
//    are driven by fanbase composition, loyalty, engagement and spending power.
// =====================================================================================
const FB_TYPES=[['casual','Casual'],['dedicated','Dedicated'],['oshi','Oshi Fan'],['hardcore','Hardcore'],['collector','Collector']];
const FB_TN=Object.fromEntries(FB_TYPES);
const FB_PAT={strong:[.95,'Strong Kami'],focus:[.9,'Kami-focused'],balanced:[.75,'Balanced'],multi:[.6,'Multi-Oshi']};
const FB_CHURN={casual:.04,dedicated:.016,oshi:.014,hardcore:.005,collector:.008};
const FB_BASE={casual:[30,42,32],dedicated:[56,56,45],oshi:[60,62,50],hardcore:[80,74,62],collector:[66,60,78]}; // loyalty, engagement, spending targets
const FB_ON={strong:.4,focus:.8,balanced:1.4,multi:2.4}; // average number of Oshi per fan by pattern
const FB_K='#d6457f',FB_O='#7a6ad8',FB_UP='#2f8f62',FB_DN='#c4513a'; // Kami Oshi / Oshi (validated pair), gain / loss
let FBW=null,FBORG=null,FBC={s:null,v:-1,val:null};

// ---- helpers --------------------------------------------------------------------------
const fbCl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v)),fbJ=(c,s)=>fbCl(c+(Math.random()*2-1)*s),fbJit=(a,b)=>a+Math.random()*(b-a);
const fbRound=x=>{const f=Math.floor(x);return f+(Math.random()<x-f?1:0)};
const fbActive=()=>(S&&S.members||[]).filter(m=>m.status!='graduated');
const fbMon=()=>{const d=dt();return d.getFullYear()*12+d.getMonth()};
const fbMonName=k=>new Date(Math.floor(k/12),k%12,1).toLocaleDateString('en-US',{month:'short',year:'numeric'});
const fbN=n=>Math.round(n||0).toLocaleString(),fbPct=x=>(x>=0?'+':'')+(Math.round(x*1000)/10)+'%',fbSg=n=>(n>0?'+':n<0?'−':'±')+Math.abs(Math.round(n)).toLocaleString();
const fbAcc=()=>({newG:0,newM:0,lost:0,kch:0,src:{},lossBy:{},kc:{},kmove:{},rev:{stream:0,merch:0,mem:{}},grad:[],evo:0});
const fbKC=(mid)=>{const A=S.fb.acc;return A.kc[mid]=A.kc[mid]||{kg:0,kl:0,og:0,ol:0}};
function fbLife(mid,k,v){const L=S.fb.life[mid]=S.fb.life[mid]||{kg:0,kl:0,og:0,ol:0};L[k]+=v;fbKC(mid)[k]+=v}
function fbNew(o){const fb=S.fb,s={id:'f'+(++fb.seq),n:Math.max(0,Math.round(o.n)),ft:o.ft||'casual',org:o.org||'Group',k:o.k||null,o:{},pat:o.pat||'balanced',loy:fbCl(o.loy??40),eng:fbCl(o.eng??50),sp:fbCl(o.sp??40),reg:o.reg||'Japan',ng:o.ng?1:0,born:S.day};fb.segs.push(s);fb.ver++;return s}
// move n fans of a segment into a new segment (same attributes, Oshi counts scaled) — counts are preserved
function fbSplit(s,n){n=Math.min(s.n,Math.max(0,Math.round(n)));const t=fbNew({...s,n});const r=s.n?n/s.n:0;for(const j in s.o){const c=Math.min(n,s.o[j],Math.round(s.o[j]*r));if(c>0)t.o[j]=c;s.o[j]-=c}s.n-=n;fbFix(s);fbFix(t);return t}
function fbFix(s){for(const j in s.o){if(+j==s.k||!(s.o[j]>0))delete s.o[j];else s.o[j]=Math.min(s.n,Math.round(s.o[j]))}}
function fbOshiFill(s,act,avgN){const C=act.filter(m=>m.id!=s.k);if(!C.length||!s.n)return;const w=C.map(m=>(m.pop+5)*(1+((S.fb.exp||{})[m.id]||0)*.3)),W=w.reduce((a,b)=>a+b,0);C.forEach((m,i)=>{const c=Math.min(s.n,Math.round(s.n*Math.min(.85,avgN*w[i]/W)));if(c>0)s.o[m.id]=(s.o[m.id]||0)+c});fbFix(s)}
const fbPick=pat=>pat||(()=>{const r=Math.random();return r<.12?'strong':r<.42?'focus':r<.8?'balanced':'multi'})();
function fbAbroad(){try{const L=Object.values(RSL).filter(l=>l.kind=='as').map(l=>[l.n,rsG(l.id)]).sort((a,b)=>b[1]-a[1]);if(L[0]&&L[0][1]>0)return L[0][0]}catch(e){}return pick(['Taiwan','Thailand','South Korea','Hong Kong'])}
const fbNatReg=m=>m&&m.nat&&m.nat!='JP'&&NAT[m.nat]?NAT[m.nat].n:null;
const fbNewestGen=()=>Math.max(1,...fbActive().map(m=>m.gen||1));

// ---- state ----------------------------------------------------------------------------
function fbState(){if(!S)return null;if(!S.fb||S.fb.v!==1)fbInit();return S.fb}
function fbInit(){const fb=S.fb={v:1,seq:0,ver:0,segs:[],hist:[],done:{},doneQ:[],mf:{},carry:{},exp:{},life:{},peak:{},alum:{},grads:[],flops:0,lastRel:null,mon:fbMon(),lastS:0,acc:null,snap:null,start:S.day};
 fb.acc=fbAcc();const act=fbActive(),total=Math.max(0,Math.round(S.fans||0));act.forEach(m=>fb.mf[m.id]=m.fans);
 if(total>0&&act.length){ // seed from the existing save: unique group fans split into Kami Oshi segments by recognition
  const w=act.map(m=>Math.pow(Math.max(1,m.fans),.85)*(.6+m.pop/100)),W=w.reduce((a,b)=>a+b,0),kTot=Math.round(total*.68);let used=0;
  const mix=[['oshi',.45,'balanced'],['dedicated',.25,'balanced'],['hardcore',.14,'strong'],['collector',.07,'focus'],['casual',.09,'multi']];
  act.forEach((m,i)=>{const km=i==act.length-1?kTot-used:Math.round(kTot*w[i]/W);used+=km;if(km<=0)return;const ab=fbNatReg(m)||null,ov=Math.round(km*(ab?.3:.05));
   mix.forEach(([ft,sh,pat],j)=>{let c=j==mix.length-1?0:Math.round((km-ov)*sh);if(j==mix.length-1)c=(km-ov)-mix.slice(0,-1).reduce((a,[,s])=>a+Math.round((km-ov)*s),0);if(c<=0)return;const b=FB_BASE[ft],s=fbNew({n:c,ft,org:'Existing fans',k:m.id,pat,loy:fbJ(b[0]+(55-m.pop)*.1,4),eng:fbJ(b[1],4),sp:fbJ(b[2],4),ng:(m.gen||1)==fbNewestGen()&&fbNewestGen()>1});fbOshiFill(s,act,FB_ON[pat])});
   if(ov>0){const s=fbNew({n:ov,ft:'oshi',org:'Existing fans',k:m.id,pat:'balanced',loy:fbJ(52,5),eng:fbJ(58,5),sp:fbJ(48,5),reg:ab||fbAbroad()});fbOshiFill(s,act,1)}});
  const g=total-kTot,gd=Math.round(g*.35);[['casual',g-gd],['dedicated',gd]].forEach(([ft,c])=>{if(c>0){const b=FB_BASE[ft],s=fbNew({n:c,ft,org:'Existing fans',pat:'multi',loy:fbJ(b[0],4),eng:fbJ(b[1],4),sp:fbJ(b[2],4)});fbOshiFill(s,act,.5)}})}
 fb.lastS=fbTotal();S.fans=fb.lastS;fb.snap=fbSnapshot();fb.ver++}
const fbTotal=()=>S.fb.segs.reduce((a,s)=>a+s.n,0);
function fbApply(){const fb=S.fb;fbClean();fb.ver++;if(FBW)return; // inside a running formula: the outer call settles S.fans afterwards
 S.fans=fbTotal();fb.lastS=S.fans}
function fbClean(){const fb=S.fb,ids=new Set(fbActive().map(m=>m.id));fb.segs.forEach(s=>{s.n=Math.max(0,Math.round(s.n));if(s.k!=null&&!ids.has(s.k))s.k=null;for(const j in s.o)if(!ids.has(+j))delete s.o[j];fbFix(s)});fb.segs=fb.segs.filter(s=>s.n>0)}
function fbMerge(){const fb=S.fb,M=new Map();fb.segs.forEach(s=>{const key=s.n<6?`${s.k}|${s.ft}`:`${s.k}|${s.ft}|${s.pat}|${s.reg}|${s.ng}|${Math.floor(s.loy/20)}`;const t=M.get(key);if(!t){M.set(key,s);return}
  const N=t.n+s.n;['loy','eng','sp'].forEach(f=>t[f]=(t[f]*t.n+s[f]*s.n)/N);for(const j in s.o)t.o[j]=(t.o[j]||0)+s.o[j];if(s.n>t.n)t.org=s.org;t.born=Math.min(t.born,s.born);t.n=N;fbFix(t)});fb.segs=[...M.values()];fb.ver++}
function fbDone(key){const fb=S.fb;if(fb.done[key])return true;fb.done[key]=S.day;fb.doneQ.push(key);if(fb.doneQ.length>600){delete fb.done[fb.doneQ.shift()]}return false}

// ---- statistics (computed from the segments; cached per change) -----------------------
function fbStats(){const fb=fbState();if(!fb)return null;if(FBC.s===S&&FBC.v===fb.ver&&FBC.d===S.day)return FBC.val;
 const act=fbActive(),M={},G={total:0,loy:0,eng:0,sp:0,types:{},ovs:0,ng:0,noK:0,pat:{},reg:{},merch:0,goods:0};FB_TYPES.forEach(([k])=>G.types[k]=0);Object.keys(FB_PAT).forEach(k=>G.pat[k]=0);
 act.forEach(m=>M[m.id]={id:m.id,k:0,o:0,kl:0,ol:0,eng:0,mp:0,co:{},reg:{}});
 fb.segs.forEach(s=>{const n=s.n;G.total+=n;G.loy+=s.loy*n;G.eng+=s.eng*n;G.sp+=s.sp*n;G.types[s.ft]+=n;if(s.reg!='Japan')G.ovs+=n;G.reg[s.reg]=(G.reg[s.reg]||0)+n;if(s.ng)G.ng+=n;if(s.k==null)G.noK+=n;else G.pat[s.pat]+=n;
  const on=Object.values(s.o).reduce((a,b)=>a+b,0)/Math.max(1,n),sh=s.k!=null?FB_PAT[s.pat][0]:0,B=120*(s.sp/50)*(.5+s.eng/100)*(.25+.6*s.loy/100)*(s.ft=='collector'?1.6:s.ft=='hardcore'?1.3:s.ft=='casual'?.5:1);
  if(s.k!=null&&M[s.k]){const X=M[s.k];X.k+=n;X.kl+=s.loy*n;X.eng+=s.eng*n;X.mp+=n*B*sh;for(const j in s.o)X.co[j]=(X.co[j]||0)+s.o[j];X.reg[s.reg]=(X.reg[s.reg]||0)+n}
  const op=s.k!=null?(1-sh):.6;for(const j in s.o){const X=M[j];if(!X)continue;const c=s.o[j];X.o+=c;X.ol+=s.loy*.8*c;X.eng+=s.eng*.8*c;X.mp+=c*B*op/Math.max(1,on)}
  if(s.k==null)G.goods+=n*B*.4});
 const T=G.total||1;G.loy=G.total?G.loy/T:0;G.eng=G.total?G.eng/T:0;G.sp=G.total?G.sp/T:0;
 Object.values(M).forEach(X=>{const m=get(X.id);X.sup=X.k+X.o;X.kl=X.k?X.kl/X.k:0;X.ol=X.o?X.ol/X.o:0;X.loy=X.sup?(X.kl*X.k+X.ol*X.o)/X.sup:0;X.eng=X.sup?X.eng/X.sup:0;X.mp=Math.round(X.mp);X.pop=m.pop;G.merch+=X.mp;
  const sn=(fb.snap&&fb.snap.mem[X.id])||null;X.net=sn?X.sup-sn.s:X.sup;X.kNet=sn?X.k-sn.k:X.k;X.oNet=sn?X.o-sn.o:X.o;const c=fb.acc.kc[X.id]||{kg:0,kl:0,og:0,ol:0};X.gain=c.kg+c.og;X.loss=c.kl+c.ol;X.kg=c.kg;X.kl2=c.kl});
 G.goods=Math.round(G.goods);G.pop=act.length?avg(act.map(m=>m.pop)):0;
 // teams & units: unique followers per segment (Kami Oshi in the team → 90%, each Oshi in it → 70%, independent)
 const teams=[],units=[];(S.groups||[]).forEach(g=>{const gm=act.filter(m=>m.group==g.id);units.push({key:'g'+g.id,name:g.name,color:g.color,ids:new Set(gm.map(m=>m.id)),n:gm.length});(g.teams||[]).forEach(t=>{const tm=gm.filter(m=>m.tid==t.id);teams.push({key:g.id+':'+t.id,name:t.name,gname:g.name,color:t.color||g.color,ids:new Set(tm.map(m=>m.id)),n:tm.length})})});
 [...teams,...units].forEach(U=>{U.sup=0;U.loy=0;U.eng=0;fb.segs.forEach(s=>{let miss=s.k!=null&&U.ids.has(s.k)?.1:1;for(const j in s.o)if(U.ids.has(+j))miss*=1-.7*s.o[j]/s.n;const f=s.n*(1-miss);U.sup+=f;U.loy+=f*s.loy;U.eng+=f*s.eng});U.loy=U.sup?U.loy/U.sup:0;U.eng=U.sup?U.eng/U.sup:0;U.sup=Math.round(U.sup);const ms=[...U.ids].map(get).filter(Boolean);U.pop=ms.length?avg(ms.map(m=>m.pop)):0;const sn=fb.snap&&(fb.snap.team[U.key]??null);U.net=sn==null?U.sup:U.sup-sn});
 const val={G,M,teams,units,act};FBC={s:S,v:fb.ver,d:S.day,val};return val}
function fbSnapshot(){const st=fbStatsRaw();return{total:st.G.total,day:S.day,mem:Object.fromEntries(Object.values(st.M).map(X=>[X.id,{k:X.k,o:X.o,s:X.sup}])),team:Object.fromEntries([...st.teams,...st.units].map(U=>[U.key,U.sup]))}}
function fbStatsRaw(){FBC.v=-1;return fbStats()}

// ---- acquisition ------------------------------------------------------------------------
function fbAcquire(n,o={}){const fb=fbState();n=Math.round(n);if(!fb||!Number.isFinite(n)||n<=0)return;const act=fbActive(),org=o.org||'Group activity',m=o.mid!=null?get(o.mid):null;fb.acc.src[org]=(fb.acc.src[org]||0)+n;
 if(o.via!='member'||!m||m.status=='graduated'){const ov=o.reg&&o.reg!='Japan'?n:fbRound(n*.04),jp=n-ov,nd=fbRound(jp*fbJit(.18,.3));
  [['casual',jp-nd,'Japan'],['dedicated',nd,'Japan'],['casual',ov,o.reg&&o.reg!='Japan'?o.reg:fbAbroad()]].forEach(([ft,c,reg])=>{if(c<=0)return;const b=FB_BASE[ft],s=fbNew({n:c,ft,org,pat:'multi',loy:fbJ(b[0]-4,5),eng:fbJ(b[1]+3,5),sp:fbJ(b[2],6),reg});fbOshiFill(s,act,.3)});fb.acc.newG+=n}
 else{const pk=fbCl(.42+.22*m.pop/100+(o.kb||0),.25,.78),nk=fbRound(n*pk),no=n-nk,ab=fbNatReg(m),ng=(m.gen||1)==fbNewestGen()&&fbNewestGen()>1,ub=(55-m.pop)*.12;
  const mk=(c,ft,k,reg)=>{if(c<=0)return null;const b=FB_BASE[ft],pat=k!=null?fbPick():'multi',s=fbNew({n:c,ft,org,k,pat,loy:fbJ(b[0]-6+ub,6),eng:fbJ(b[1]+4,6),sp:fbJ(b[2],6),reg,ng});return s};
  const ovk=ab?fbRound(nk*.3):o.reg&&o.reg!='Japan'?nk:0,ovo=ab?fbRound(no*.3):o.reg&&o.reg!='Japan'?no:0,reg2=o.reg&&o.reg!='Japan'?o.reg:(ab||'Japan');
  const kc=fbRound((nk-ovk)*.45);[mk(kc,'oshi',m.id,'Japan'),mk(nk-ovk-kc,'casual',m.id,'Japan'),mk(ovk,'oshi',m.id,reg2)].forEach(s=>{if(s)fbOshiFill(s,act,FB_ON[s.pat]*.5)});
  [mk(no-ovo,'casual',null,'Japan'),mk(ovo,'casual',null,reg2)].forEach(s=>{if(s){s.o[m.id]=s.n;fbOshiFill(s,act,.25);s.o[m.id]=s.n}});
  fbLife(m.id,'kg',nk);fbLife(m.id,'og',no);fb.acc.newM+=n}
 fb.ver++}
// fans from an activity: part found the group, part found a member (by exposure)
function fbSpread(n,sig,org,reg){const ids=Object.keys(sig).filter(id=>get(+id)),W=ids.reduce((a,id)=>a+sig[id],0);if(!W)return fbAcquire(n,{via:'group',org,reg});let left=n;ids.sort((a,b)=>sig[b]-sig[a]).forEach((id,i)=>{const c=i==ids.length-1?left:Math.min(left,fbRound(n*sig[id]/W));left-=c;if(c>0)fbAcquire(c,{via:'member',mid:+id,org,reg})})}
function fbSync(ctx){if(!S||FBW)return;const fb=fbState();if(!fb)return;const org=(ctx&&ctx.org)||FBORG||'Group activity',reg=ctx&&ctx.reg;
 const sig={};let W=0;fbActive().forEach(m=>{const b=fb.mf[m.id];fb.mf[m.id]=m.fans;if(b==null)return;const d=m.fans-b;if(Number.isFinite(d)&&d>0){sig[m.id]=d;W+=d}});
 if(!Number.isFinite(S.fans))S.fans=fb.lastS;const dG=Math.round((S.fans||0)-fb.lastS);
 if(dG>0){const ms=W>0?Math.min(.55,.2+.45*W/(W+dG)):0,nm=Math.round(dG*ms);fbAcquire(dG-nm,{via:'group',org,reg});if(nm>0)fbSpread(nm,sig,org,reg)}
 // recognition growth turns a few people into supporters of that member (fractions carried over)
 Object.entries(sig).forEach(([id,d])=>{const c=(fb.carry[id]||0)+d*.03,n=Math.floor(c);fb.carry[id]=c-n;if(n>0)fbAcquire(n,{via:'member',mid:+id,org:dG>0?org:'Member buzz',reg})});
 if(dG<0||dG>0||W>0)fbApply();else if(S.fans!==fb.lastS)fbApply()}
// run an existing formula with the fan count it should "see" (buyers / audience), keep its fan gains
function fbWith(kind,fn,ctx){const fb=fbState();if(!fb)return fn();fbSync();const f=fbFactor(kind),outer=FBW;const cur=S.fans,E=Math.max(0,Math.round(cur*f/(outer?outer.f:1)));FBW={f};S.fans=E;let r;try{r=fn()}finally{const d=S.fans-E;S.fans=cur+d;FBW=outer}if(!FBW)fbSync(ctx);return r}
function fbFactor(kind){const st=fbStats();if(!st||!st.G.total)return 1;const G=st.G,T=G.total,sh=k=>G.types[k]/T;
 if(kind=='cd')return fbCl(.85+.5*(sh('dedicated')+sh('hardcore')+sh('oshi')*.5)+.5*(G.loy-50)/100,.6,1.4);
 if(kind=='album')return fbCl(.88+.9*(sh('hardcore')+sh('collector'))+.4*(G.loy-50)/100+.3*(G.sp-45)/100,.6,1.45);
 if(kind=='concert')return fbCl(.62+.45*G.eng/100+.2*G.pop/100+.2*G.loy/100,.6,1.4);return 1}

// ---- event-driven updates -----------------------------------------------------------------
function fbExp(mid,v){const fb=S.fb;if(get(mid))fb.exp[mid]=(fb.exp[mid]||0)+v}
function fbBoost(pred,de,dl){S.fb.segs.forEach(s=>{if(pred(s)){s.eng=fbCl(s.eng+de);if(dl)s.loy=fbCl(s.loy+dl)}});S.fb.ver++}
function fbOnAnnounce(p){if(!p||!p.id||fbDone('ann:'+p.id))return;const ids=[p.mainId,...(p.coup||[])];ids.forEach((id,i)=>{const o=S.songs[id];if(!o)return;const w=i?.5:1;(o.slots||[]).filter(Boolean).forEach(mid=>fbExp(mid,1.2*w));(o.centers||[]).forEach(mid=>{fbExp(mid,3*w);if(i==0){const m=get(mid);if(m)fbAcquire(fbRound((8+m.pop*.5)*fbJit(.7,1.3)),{via:'member',mid,org:'Center announcement',kb:.08})}});(o.fm&&o.fm.sl||[]).filter(x=>x.r==0&&x.m).forEach(x=>fbExp(x.m,.6*w))});
 const sen=new Set((S.songs[p.mainId]?.slots||[]).filter(Boolean));fbBoost(s=>s.k!=null&&sen.has(s.k),3,1);fbApply()}
function fbOnRelease(x){if(!x||fbDone('rel:'+x.rid))return;const fb=S.fb,prev=S.singles.filter(y=>y!==x&&y.sales).slice(-3),av=prev.length?avg(prev.map(y=>y.sales)):0;
 if(av&&x.sales<av*.7)fb.flops=Math.min(5,fb.flops+1);else fb.flops=Math.max(0,fb.flops-1);fb.lastRel=S.day;
 const mn=S.songs[x.mainId],sen=new Set((mn&&mn.slots||[]).filter(Boolean));(mn&&mn.centers||[]).forEach(mid=>fbExp(mid,2));sen.forEach(mid=>fbExp(mid,1));(x.videos||[]).forEach(v=>{const o=S.songs[v.song];(o&&o.centers||[]).forEach(mid=>fbExp(mid,1))});
 // team songs attract fans to their team's members
 uniq((x.types||[]).flatMap(t=>t.songs)).map(i=>S.songs[i]).filter(o=>o&&o.tm).forEach(o=>(o.slots||[]).filter(Boolean).forEach(mid=>{const m=get(mid);fbExp(mid,1);if(m)fbAcquire(fbRound((3+m.pop*.15)*fbJit(.6,1.4)),{via:'member',mid,org:'Team song: '+o.title})}));
 fbBoost(()=>true,5,0);fbBoost(s=>s.k!=null&&sen.has(s.k),3,1.5);fbApply()}
function fbOnAlbum(a){if(!a||fbDone('alb:'+a.id))return;S.fb.lastRel=S.day;fbBoost(s=>s.ft=='hardcore'||s.ft=='collector',5,1);fbBoost(()=>true,3,0);fbApply()}
function fbOnShow(key,ids,grade){if(fbDone(key))return;const set=new Set(ids);ids.forEach(mid=>fbExp(mid,grade=='S'?1.5:grade=='A'?1:.5));fbBoost(s=>s.k!=null&&set.has(s.k),2,grade=='S'?1:0);if(grade=='S'&&ids.length){const top=ids.map(get).filter(Boolean).sort((a,b)=>b.pop-a.pop)[0];if(top)fbExp(top.id,1.5)}fbApply()}
function fbOnTransfer(m){if(!m||fbDone(`tr:${m.id}:${m.tid}:${S.day}`))return;fbExp(m.id,.8);fbBoost(s=>s.k==m.id,0,-1.5);fbApply()}

// ---- graduation ---------------------------------------------------------------------------
function fbGraduate(mid){const fb=fbState(),m=get(mid);if(!fb||!m||fbDone('grad:'+mid))return null;const act=fbActive().filter(x=>x.id!=mid);
 const R={mid,name:m.name,day:S.day,cont:0,trans:0,att:0,left:0,kami:0,oshi:0},to={};
 fb.segs.slice().forEach(s=>{if(s.o[mid]){R.oshi+=s.o[mid];fbLife(mid,'ol',s.o[mid]);delete s.o[mid]}if(s.k!=mid)return;R.kami+=s.n;const n=s.n,l=s.loy/100;
  const att=fbRound(n*(.12+.2*l)),left=fbRound(n*fbCl(.28-.18*l,.06,.3)),trans=act.length?fbRound(n*.38):0,cont=n-att-left-trans;
  if(left>0){const t=fbSplit(s,left);t.n=0;R.left+=left}
  if(att>0){const t=fbSplit(s,att);t.n=0;R.att+=att}
  if(trans>0){const W=act.map(x=>(1+3*(s.o[x.id]||0)/Math.max(1,s.n))*(x.pop+5)),Wt=W.reduce((a,b)=>a+b,0);let rem=trans;act.map((x,i)=>[x,W[i]]).sort((a,b)=>b[1]-a[1]).slice(0,4).forEach(([x,w],i,arr)=>{const c=i==arr.length-1?rem:Math.min(rem,fbRound(trans*w/arr.reduce((a,z)=>a+z[1],0)));rem-=c;if(c<=0)return;const t=fbSplit(s,c);t.k=x.id;delete t.o[x.id];t.loy=fbCl(t.loy*.85);t.org='Graduation transfer';fbLife(x.id,'kg',c);to[x.id]=(to[x.id]||0)+c});R.trans+=trans}
  s.k=null;s.loy=fbCl(s.loy*.9);s.ft=s.ft=='hardcore'?'dedicated':s.ft;R.cont+=s.n});
 fbLife(mid,'kl',R.kami);fb.acc.lost+=R.left+R.att;fb.acc.lossBy.Graduation=(fb.acc.lossBy.Graduation||0)+R.left+R.att;R.to=to;
 fb.alum[mid]={name:m.name,n:R.att,day:S.day,peak:(fb.peak[mid]||{}).k||R.kami};fb.grads.push(R);fb.acc.grad.push(R);fbApply();return R}
function graduateMember(mid){const m=get(mid);if(!m)return;const p=S.pj;if(p&&p.status=='producing'&&plTracks(p).some(i=>(S.songs[i].slots||[]).includes(mid)))return toast(`${m.name} is in the Senbatsu of "${p.title}", which is in production. Graduation is possible after its release.`,'err');
 const st=fbStats(),X=st&&st.M[mid];ask(`Graduate ${m.name}? She leaves the group for good (history and songs are kept). Her fans: ${fbN(X?X.k:0)} Kami Oshi and ${fbN(X?X.o:0)} Oshi supporters. Some will follow another member, some stay with the group, some stay attached to her, some leave.`,()=>{
  const R=fbGraduate(mid);const t=teamOf(m);if(t)hev(m,{t:'team_leave',tid:t.id,tname:t.name});setTeamOf(m,null);m.status='graduated';m.gradDay=S.day;hev(m,{t:'graduate'});
  if(S.pj&&S.pj.status=='draft')[S.pj.mainId,...S.pj.coup].forEach(i=>{const o=S.songs[i];if(o&&o.fm){let ch=0;o.fm.sl.forEach(x=>{if(x.m==mid){x.m=null;ch=1}});if(ch)fmSync(o)}});
  (S.cal||[]).forEach(e=>{if(!e.done&&Array.isArray(e.members))e.members=e.members.filter(x=>x!=mid)});S.alumni=S.alumni||[];S.alumni.push(m);S.members=S.members.filter(x=>x.id!=mid);leadFix(true);ui.mod={t:'html',h:fbGradHtml(R)};toast(`${m.name} has graduated.`);render()},'Graduate')}
function fbGradHtml(R){if(!R)return'';const T=Object.entries(R.to||{}).map(([id,n])=>[get(+id),n]).filter(x=>x[0]).sort((a,b)=>b[1]-a[1]);
 return`<h2 class="ht">🎓 ${esc(R.name)} graduates</h2><p class="st">Her ${fbN(R.kami)} Kami Oshi fans and ${fbN(R.oshi)} Oshi supporters:</p><div class="fbkv">${[['Stay with the group',R.cont],['New Kami Oshi in the group',R.trans],['Stay attached to her (leave the active fanbase)',R.att],['Leave the group',R.left]].map(([a,b])=>`<div><small>${a}</small><b>${fbN(b)}</b></div>`).join('')}</div>${T.length?`<h3>New Kami Oshi</h3>${T.map(([m,n])=>`<div class="fbrow">${ptc(m,30)}<b>${esc(m.name)}</b><span class="fbkami">+${fbN(n)} Kami Oshi</span></div>`).join('')}`:''}`}

// ---- monthly simulation -------------------------------------------------------------------
function fbCtx(){const x=S.singles[S.singles.length-1],act=fbActive(),mn=x&&S.songs[x.mainId],sen=new Set((mn&&mn.slots||[]).filter(Boolean)),cen=new Set((mn&&mn.centers||[])),since=S.fb.lastRel!=null?S.day-S.fb.lastRel:(x?S.day-(x.relDay??x.day):999);
 const last3=S.singles.slice(-3).map(y=>new Set((S.songs[y.mainId]?.slots||[]).filter(Boolean))),seen=id=>!last3.length||last3.some(s=>s.has(id));
 const front=new Set(((mn&&mn.lib&&mn.lib.form)||(mn&&mn.fm&&mn.fm.sl)||[]).filter(s=>s.r==0&&s.m).map(s=>s.m));return{x,act,sen,cen,front,since,recent:since<=45,stale:since>90,seen}}
function fbAppeal(m,c){const e=S.fb.exp[m.id]||0;let a=m.pop*.25+e*3+(c.cen.has(m.id)?18:0)+(c.sen.has(m.id)?6:0)+(c.front.has(m.id)?4:0)+(m.sing>=80?5:0)+(m.dance>=80?5:0)+((m.traits||[]).length>1?2:0)+(m.variety>=75?3:0);
 return a*(.6+m.pop/100)*(isAct(m)?1:.5)*(c.stale?.7:1)*Math.sqrt(1+S.fans/20000)}
function fbWhy(m,c){return c.cen.has(m.id)?'Center exposure':c.sen.has(m.id)?'Senbatsu exposure':m.sing>=80?'Vocal talent':m.dance>=80?'Dance talent':(S.fb.exp[m.id]||0)>1?'Performance':'Member appeal'}
function fbMonthly(){const fb=S.fb,c=fbCtx(),act=c.act,A=fb.acc,start=fb.snap?fb.snap.total:fbTotal();if(!act.length){fbRecord(start);return}
 // 1. acquisition: word of mouth (group) and members' own appeal
 const gp=avg(act.map(m=>m.pop));fbAcquire(fbRound((10+gp*2.5)*fbJit(.75,1.25)*(c.recent?1.4:c.stale?.6:1)),{via:'group',org:'Word of mouth'});
 act.forEach(m=>{const n=fbRound(fbAppeal(m,c)*fbJit(.6,1.4));if(n>0)fbAcquire(n,{via:'member',mid:m.id,org:fbWhy(m,c)})});
 // fans without a Kami Oshi slowly choose one (prefers an existing Oshi)
 fb.segs.filter(s=>s.k==null&&s.n>0).forEach(s=>{const mv=fbRound(s.n*.07*(s.eng/60));if(mv<=0)return;const W=act.map(m=>[m,(m.pop+5)*(1+4*(s.o[m.id]||0)/s.n)*(1+(fb.exp[m.id]||0)*.2)]).sort((a,b)=>b[1]-a[1]).slice(0,3),Wt=W.reduce((a,b)=>a+b[1],0);let left=mv;
  W.forEach(([m,w],i)=>{const n=i==W.length-1?left:Math.min(left,fbRound(mv*w/Wt));left-=n;if(n<=0)return;const t=fbSplit(s,n),had=t.o[m.id]||0;t.k=m.id;delete t.o[m.id];t.pat=fbPick();if(t.ft=='casual')t.ft='oshi';fbLife(m.id,'kg',n);if(had)fbLife(m.id,'ol',had)})});
 // 2. fan loss (type, loyalty, activity, exposure over several singles)
 fb.segs.forEach(s=>{const km=s.k!=null?get(s.k):null;let r=FB_CHURN[s.ft]*(1.5-s.loy/100)*(c.stale?1.5:1)*(1+.15*fb.flops);if(km&&!c.seen(km.id))r*=1.25;if(km&&!isAct(km))r*=1.1;r=Math.min(.1,r*fbJit(.85,1.15));
  const L=fbRound(s.n*r);if(L<=0)return;const f=L/s.n;if(s.k!=null)fbLife(s.k,'kl',L);for(const j in s.o){const d=Math.round(s.o[j]*f);s.o[j]-=d;fbLife(+j,'ol',d)}s.n-=L;A.lost+=L;A.lossBy[FB_TN[s.ft]]=(A.lossBy[FB_TN[s.ft]]||0)+L});
 // 3. fan type evolution (gradual: a few % of a segment per month)
 const EVO=[['casual',s=>s.k!=null&&s.loy>30&&s.eng>42,'oshi',.07],['casual',s=>s.eng>46&&s.loy>32,'dedicated',.06],['dedicated',s=>s.loy>62,'hardcore',.04],['oshi',s=>s.sp>52,'collector',.04],['oshi',s=>s.loy>66,'hardcore',.03],['hardcore',s=>s.eng<42,'dedicated',.05],['collector',s=>s.sp<40,'oshi',.04]];
 fb.segs.slice().forEach(s=>{const e=EVO.find(([f,p])=>f==s.ft&&p(s));if(!e)return;const n=fbRound(s.n*e[3]*fbJit(.7,1.3));if(n<=0)return;const t=fbSplit(s,n);t.ft=e[2];const b=FB_BASE[e[2]];t.loy=fbCl(t.loy+(b[0]-t.loy)*.2);t.sp=fbCl(t.sp+(b[2]-t.sp)*.2);A.evo+=n});
 // 4. loyalty & engagement drift (popularity is separate: underrated members can have very loyal fans)
 fb.segs.forEach(s=>{const b=FB_BASE[s.ft],km=s.k!=null?get(s.k):null;let tl=b[0],te=b[1]+(c.recent?10:c.stale?-12:0);if(km){tl+=(55-km.pop)*.12+(km.mor-50)*.06+(c.sen.has(km.id)?2:c.seen(km.id)?0:-3);te+=(fb.exp[km.id]||0)*1.5}
  tl+=Math.min(15,(S.day-s.born)/15)+(c.recent?3:0);s.loy=fbCl(s.loy+(tl-s.loy)*.12+fbJit(-1.2,1.2));s.eng=fbCl(s.eng+(te-s.eng)*.25+fbJit(-1.5,1.5));s.sp=fbCl(s.sp+(b[2]-s.sp)*.05+fbJit(-1,1))});
 // 5. Kami Oshi changes (uncommon; exposure raises the chance, high loyalty lowers it)
 fb.segs.slice().forEach(s=>{const km=s.k!=null?get(s.k):null;if(!km||s.n<2)return;const C=act.filter(m=>m.id!=s.k).map(m=>[m,(fb.exp[m.id]||0)+(c.cen.has(m.id)?2:0)+Math.max(0,m.pop-km.pop)/20+2*(s.o[m.id]||0)/s.n]).filter(x=>x[1]>.4).sort((a,b)=>b[1]-a[1]);if(!C.length)return;
  const r=Math.min(.03,(.003+.006*Math.min(1,C[0][1]/5)+(c.seen(km.id)?0:.008)+(isAct(km)?0:.006))*(1.4-s.loy/100)),n=fbRound(s.n*r*fbJit(.7,1.3));if(n<=0)return;
  const to=C[Math.random()<.7?0:Math.min(C.length-1,1)][0],t=fbSplit(s,n),had=t.o[to.id]||0;t.k=to.id;delete t.o[to.id];if(had)fbLife(to.id,'ol',had);const keep=fbRound(n*.6);if(keep>0){t.o[km.id]=keep;fbLife(km.id,'og',keep)}t.loy=fbCl(t.loy*.97);t.org='Kami Oshi change';
  fbLife(km.id,'kl',n);fbLife(to.id,'kg',n);A.kch+=n;const key=km.id+'>'+to.id;A.kmove[key]=(A.kmove[key]||0)+n});
 // 6. Oshi preferences: add exposed / popular members, drop members out of sight
 fb.segs.forEach(s=>{if(s.n<3)return;const mult=s.k==null?.8:{strong:.3,focus:.6,balanced:1,multi:1.5}[s.pat];act.forEach(m=>{if(m.id==s.k)return;const cur=s.o[m.id]||0,e=fb.exp[m.id]||0,add=fbRound((s.n-cur)*Math.min(.06,.008*mult*(m.pop/50)*(1+e*.4))),drop=fbRound(cur*(c.seen(m.id)?.015:.04));const d=add-drop;if(d){s.o[m.id]=Math.min(s.n,Math.max(0,cur+d));fbLife(m.id,d>0?'og':'ol',Math.abs(d))}});fbFix(s)});
 fbMerge();fbApply();fbRecord(start)}
function fbRecord(start){const fb=S.fb,A=fb.acc,st=fbStatsRaw(),G=st.G,mon=fb.mon;
 const mem={};Object.values(st.M).forEach(X=>{mem[X.id]=[X.k,X.o,X.sup,Math.round(X.loy),X.pop,X.net,X.kNet,X.mp];const p=fb.peak[X.id]=fb.peak[X.id]||{k:0,s:0,loy:0,pop:0};p.k=Math.max(p.k,X.k);p.s=Math.max(p.s,X.sup);p.loy=Math.max(p.loy,Math.round(X.loy));p.pop=Math.max(p.pop,X.pop)});
 fb.hist.push({mon,label:fbMonName(mon),day:S.day,start,total:G.total,newG:A.newG,newM:A.newM,lost:A.lost,net:G.total-start,rate:start?(G.total-start)/start:0,ret:Math.max(0,1-A.lost/Math.max(1,start+A.newG+A.newM)),loy:Math.round(G.loy),eng:Math.round(G.eng),sp:Math.round(G.sp),types:{...G.types,overseas:G.ovs,newgen:G.ng},
  mem,team:Object.fromEntries(st.teams.map(U=>[U.key,[U.sup,U.net,U.name]])),unit:Object.fromEntries(st.units.map(U=>[U.key,[U.sup,U.net,U.name]])),rev:{stream:Math.round(A.rev.stream),merch:Math.round(A.rev.merch)},kch:A.kch,kmove:A.kmove,src:A.src,lossBy:A.lossBy,grad:A.grad.map(g=>g.name),evo:A.evo});
 if(fb.hist.length>60)fb.hist.shift();fb.acc=fbAcc();fb.exp={};fb.snap=fbSnapshot()}

// ---- hooks into the existing game -----------------------------------------------------------
const _fbTick=tick;tick=function(){const r=_fbTick.apply(this,arguments);try{if(S&&S.fb){fbSync(FBORG?null:{org:'Member buzz'});const mk=fbMon();if(mk!==S.fb.mon){fbMonthly();S.fb.mon=mk}}else fbState()}catch(e){console.error(e)}return r};
const _fbEarn=earn;earn=function(a,l){if(l=='Merch & streaming'&&S&&S.fb&&!FBW){try{const st=fbStats(),G=st.G,str=G.total*(.7+.8*G.eng/100),mer=(G.merch+G.goods)/30*fbJit(.92,1.08);a=Math.round(str+mer);const R=S.fb.acc.rev;R.stream+=str;R.merch+=mer;Object.values(st.M).forEach(X=>{R.mem[X.id]=(R.mem[X.id]||0)+X.mp/30})}catch(e){console.error(e)}}return _fbEarn.call(this,a,l)};
const _fbRel=doRelease;doRelease=function(){const p=S.pj,n=S.singles.length;const r=fbWith('cd',()=>_fbRel.apply(this,arguments),{org:p?'Single release: '+p.title:'Single release'});const x=S.singles[n];if(x&&S.singles.length>n)try{fbOnRelease(x)}catch(e){console.error(e)}return r};
const _fbAlb=alRelease;alRelease=function(){const n=(S.albums||[]).length,t=S.al&&S.al.title;const r=fbWith('album',()=>_fbAlb.apply(this,arguments),{org:'Album release: '+(t||'')});const a=(S.albums||[])[n];if(a)try{fbOnAlbum(a)}catch(e){console.error(e)}return r};
const _fbConc=holdConcert;holdConcert=function(p,x){const ev=fbWith('concert',()=>_fbConc.apply(this,arguments),{org:'Release Day Mini Concert'});if(ev)try{fbOnShow('conc:'+ev.id,ev.members||[],'A')}catch(e){}return ev};
const _fbRs=rsRun;rsRun=function(ev,part){const l=RSL[ev.loc]||{};return fbWith('concert',()=>_fbRs.apply(this,arguments),{org:'Roadshow · '+(l.n||''),reg:l.kind=='as'?l.n:'Japan'})};
const _fbHs2=hsRun2;hsRun2=function(ev,d){fbSync();const r=_fbHs2.apply(this,arguments);fbSync({org:'Handshake event'});return r};
const _fbHs=hsRun;hsRun=function(ev,d){fbSync();const r=_fbHs.apply(this,arguments);fbSync({org:'Handshake event'});return r};
const _fbRunEv=runEv;runEv=function(){const M=ui.mod,sel=M&&M.sel?M.sel.slice():[],k=M&&M.k,d0=S.day;fbSync();FBORG=(EV[k]&&EV[k].n)||'Event';let r;try{r=_fbRunEv.apply(this,arguments)}finally{FBORG=null}if(S.day>d0){fbSync({org:(EV[k]&&EV[k].n)||'Event'});const g=(/Grade (\w)/.exec((ui.mod&&ui.mod.h)||'')||[])[1];fbOnShow(`ev:${k}:${d0}`,sel,g);render()}return r};
const _fbStart=startSingle;startSingle=function(){const p=S.pj,w=p&&p.status;const r=_fbStart.apply(this,arguments);if(p&&w=='draft'&&p.status=='producing')try{fbOnAnnounce(p)}catch(e){console.error(e)}return r};
const _fbJoin=joinTeam;joinTeam=function(m,t){const was=m&&m.tid;const r=_fbJoin.apply(this,arguments);if(was&&m.tid!==was)try{fbOnTransfer(m)}catch(e){}return r};
const _fbMig=migrate;migrate=function(){const r=_fbMig.apply(this,arguments);try{S.alumni=S.alumni||[];fbState();fbSync({org:'Group activity'})}catch(e){console.error(e)}return r};
const _fbRender=render;render=function(){try{if(S&&!ui.t)fbSync()}catch(e){console.error(e)}return _fbRender.apply(this,arguments)};
const _fbEvText=evText;evText=function(e){return e&&e.t=='graduate'?'Graduated from the group':_fbEvText.apply(this,arguments)};
const _fbMem=memAct;memAct=function(mid,v){if(v=='grad')return graduateMember(mid);return _fbMem.apply(this,arguments)};
const _fbCardT=mcardT;mcardT=function(){return _fbCardT.apply(this,arguments).replace('<option value="prof">Open profile</option>','<option value="prof">Open profile</option><option value="grad">Graduate…</option>')};

// ---- save slots (each slot holds a whole save, fanbase included) --------------------------------
const FB_SLOTS=3,slotKey=n=>KEY+'_slot'+n;
function slotInfo(n){try{const s=JSON.parse(localStorage.getItem(slotKey(n)));return s&&Array.isArray(s.members)?s:null}catch(e){return null}}
function slotSave(n){if(!S)return;const go=()=>{try{fbSync();S.savedAt=Date.now();localStorage.setItem(slotKey(n),JSON.stringify(S));toast(`Saved to slot ${n}.`)}catch(e){toast('Could not save: browser storage is full or blocked.','err')}render()};if(slotInfo(n))ask(`Overwrite save slot ${n}?`,go,'Overwrite');else go()}
function slotLoad(n){const s=slotInfo(n);if(!s)return toast('That slot is empty.','err');ask(`Load slot ${n}? Unsaved progress in the current game is replaced (the current game is still in the autosave until you act).`,()=>{S=s;migrate();ui.mod=null;ui.t=false;view='dash';FBC={s:null,v:-1,val:null};toast(`Slot ${n} loaded.`);render()},'Load')}
function slotDel(n){if(!slotInfo(n))return;ask(`Delete save slot ${n}?`,()=>{localStorage.removeItem(slotKey(n));render()},'Delete')}
const _fbManage=V.manage;V.manage=function(){const h=_fbManage.call(V);const card=`<div class="c fbslots"><h3>Save slots</h3><p class="st">Three extra save slots. Each one keeps its own game, including its own fanbase.</p>${Array.from({length:FB_SLOTS},(_,i)=>{const n=i+1,s=slotInfo(n);return`<div class="uprow"><b>Slot ${n}</b><span class="st" style="flex:1">${s?`${esc(s.co||'')} · Day ${s.day} · ♥ ${fbN(s.fans)}`:'Empty'}</span><button class="b s p" onclick="slotSave(${n})">Save</button><button class="b s" ${s?'':'disabled'} onclick="slotLoad(${n})">Load</button><button class="b s" ${s?'':'disabled'} onclick="slotDel(${n})">Delete</button></div>`}).join('')}</div>`;const i=h.lastIndexOf('</div>');return h.slice(0,i)+card+h.slice(i)};

// ---- validation (used by tests; also guards the UI) ---------------------------------------------
function fbValidate(){const fb=S.fb,E=[],ids=new Set(fbActive().map(m=>m.id));let t=0;fb.segs.forEach(s=>{if(!(s.n>=0)||s.n!==Math.round(s.n))E.push(`${s.id}: bad count`);t+=s.n;if(s.k!=null&&!ids.has(s.k))E.push(`${s.id}: Kami Oshi not active`);for(const j in s.o){if(+j==s.k)E.push(`${s.id}: Oshi duplicates Kami Oshi`);if(s.o[j]>s.n)E.push(`${s.id}: Oshi count above fans`);if(!ids.has(+j))E.push(`${s.id}: Oshi not active`)}});
 if(t!==S.fans)E.push(`group total ${t} ≠ S.fans ${S.fans}`);if(S.fans<0)E.push('negative fans');return E}

// ---- charts (inline SVG, tooltips via <title>) ---------------------------------------------------
function fbLineChart(pts,o={}){if(pts.length<2)return`<div class="fbempty">${esc(o.empty||'The chart appears after the first month is recorded.')}</div>`;const W=560,H=170,P={l:46,r:12,t:12,b:26},xs=pts.map((_,i)=>P.l+i*(W-P.l-P.r)/(pts.length-1)),mn=o.min!=null?o.min:Math.min(...pts.map(p=>p.v)),mx=Math.max(mn+1,...pts.map(p=>p.v)),y=v=>P.t+(H-P.t-P.b)*(1-(v-mn)/(mx-mn));
 const ticks=[mn,(mn+mx)/2,mx],fmt=o.fmt||(v=>fbN(v));return`<svg class="fbchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'')}">${ticks.map(v=>`<line x1="${P.l}" x2="${W-P.r}" y1="${y(v)}" y2="${y(v)}" class="fbgrid"/><text x="${P.l-6}" y="${y(v)+4}" class="fbax" text-anchor="end">${fmt(v)}</text>`).join('')}
 <path d="${pts.map((p,i)=>`${i?'L':'M'}${xs[i].toFixed(1)} ${y(p.v).toFixed(1)}`).join('')}" fill="none" stroke="${o.color||FB_K}" stroke-width="2" stroke-linejoin="round"/>${pts.map((p,i)=>`<g class="fbpt"><circle cx="${xs[i]}" cy="${y(p.v)}" r="4" fill="${o.color||FB_K}" stroke="#fff" stroke-width="2"/><rect x="${xs[i]-14}" y="${P.t}" width="28" height="${H-P.t-P.b}" fill="transparent"><title>${esc(p.l)}: ${fmt(p.v)}</title></rect></g>`).join('')}
 ${pts.map((p,i)=>i%Math.ceil(pts.length/7)==0||i==pts.length-1?`<text x="${xs[i]}" y="${H-8}" class="fbax" text-anchor="middle">${esc(p.l)}</text>`:'').join('')}</svg>`}
function fbBarsPN(rows){if(!rows.length)return`<div class="fbempty">No monthly history yet.</div>`;const W=560,H=180,P={l:46,r:10,t:10,b:26},mx=Math.max(1,...rows.map(r=>Math.max(r.a,r.b))),bw=Math.min(18,(W-P.l-P.r)/rows.length/2.6),mid=P.t+(H-P.t-P.b)/2,h=v=>(H-P.t-P.b)/2*v/mx;
 return`<svg class="fbchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="New and lost fans per month"><line x1="${P.l}" x2="${W-P.r}" y1="${mid}" y2="${mid}" class="fbaxl"/><text x="${P.l-6}" y="${P.t+8}" class="fbax" text-anchor="end">+${fbN(mx)}</text><text x="${P.l-6}" y="${H-P.b}" class="fbax" text-anchor="end">−${fbN(mx)}</text>${rows.map((r,i)=>{const cx=P.l+(i+.5)*(W-P.l-P.r)/rows.length;return`<g><rect x="${cx-bw/2}" y="${mid-h(r.a)}" width="${bw}" height="${Math.max(0,h(r.a)-1)}" rx="3" fill="${FB_UP}"><title>${esc(r.l)}: +${fbN(r.a)} new</title></rect><rect x="${cx-bw/2}" y="${mid+1}" width="${bw}" height="${Math.max(0,h(r.b)-1)}" rx="3" fill="${FB_DN}"><title>${esc(r.l)}: −${fbN(r.b)} lost</title></rect>${i%Math.ceil(rows.length/7)==0||i==rows.length-1?`<text x="${cx}" y="${H-8}" class="fbax" text-anchor="middle">${esc(r.l)}</text>`:''}</g>`}).join('')}</svg>`}
const fbHBar=(v,mx,color)=>`<span class="fbhb"><i style="width:${mx?fbCl(100*v/mx):0}%;background:${color}"></i></span>`;
function fbKO(k,o,mx){const t=Math.max(1,mx);return`<span class="fbko" title="Kami Oshi ${fbN(k)} · Oshi ${fbN(o)}"><i class="k" style="width:${100*k/t}%"></i><i class="o" style="width:${100*o/t}%"></i></span>`}

// ---- dashboard ---------------------------------------------------------------------------------------
SECS.find(s=>s.k=='fans').v.unshift(['fanbase','Fanbase']);SUBLOC.fanbase='Fan Meeting Hall · Fanbase Management';
const FB_TABS=[['over','Overview','概要'],['rank','Member Ranking','ランキング'],['oshi','Kami Oshi & Oshi','神推し・推し'],['team','Team / Unit','チーム'],['grow','Fan Growth','成長']];
const FB_CATS=[['k','Kami Oshi'],['sup','Total Supporters'],['loy','Loyalty'],['pop','Popularity'],['net','Fan Growth']];
function fbUI(){return ui.fb=ui.fb||{tab:'over',team:'all',gen:'all',per:'cur',sort:'k',dir:-1}}
function fbSet(k,v){const u=fbUI();if(k=='sort'){if(u.sort==v)u.dir*=-1;else{u.sort=v;u.dir=-1}}else u[k]=v;render()}
const fbTeamName=m=>{const t=teamOf(m);return t?t.name:TL()};
// rows for the ranking: All Time = current totals & all-time net; Current Month = now, change this month; Last Month = end of last month
function fbRows(st){const u=fbUI(),fb=S.fb,last=fb.hist[fb.hist.length-1];let R=st.act.map(m=>{const X=st.M[m.id],L=fb.life[m.id]||{kg:0,kl:0,og:0,ol:0};let r={m,k:X.k,o:X.o,sup:X.sup,loy:X.loy,kl:X.kl,ol:X.ol,eng:X.eng,pop:m.pop,mp:X.mp};
  if(u.per=='cur')r.net=X.net;else if(u.per=='all')r.net=L.kg+L.og-L.kl-L.ol;else{const h=last&&last.mem[m.id];r=h?{...r,k:h[0],o:h[1],sup:h[2],loy:h[3],pop:h[4],net:h[5],mp:h[7]}:{...r,k:0,o:0,sup:0,net:0,loy:0}}return r});
 if(u.team!='all')R=R.filter(r=>String(r.m.tid||'none')==u.team);if(u.gen!='all')R=R.filter(r=>(r.m.gen||1)==+u.gen);R.sort((a,b)=>u.dir*((a[u.sort]||0)-(b[u.sort]||0))||a.m.id-b.m.id);return R}
function fbFilters(st,showPer=true){const u=fbUI(),T=uniq(st.act.map(m=>m.tid||'none')),gens=uniq(st.act.map(m=>m.gen||1)).sort((a,b)=>a-b),tn=id=>{const m=st.act.find(x=>(x.tid||'none')==id);return id=='none'?TL()+'s':m?fbTeamName(m):id};
 return`<div class="row fbfil"><label class="st">Team <select onchange="fbSet('team',this.value)"><option value="all">All teams</option>${T.map(t=>`<option value="${t}" ${String(u.team)==String(t)?'selected':''}>${esc(tn(t))}</option>`).join('')}</select></label><label class="st">Generation <select onchange="fbSet('gen',this.value)"><option value="all">All generations</option>${gens.map(g=>`<option value="${g}" ${String(u.gen)==String(g)?'selected':''}>${ord(g)} Gen</option>`).join('')}</select></label>${showPer?`<span class="fbseg">${[['cur','Current Month'],['last','Last Month'],['all','All Time']].map(([k,n])=>`<button class="${u.per==k?'on':''}" onclick="fbSet('per','${k}')">${n}</button>`).join('')}</span>`:''}</div>`}
function fbTile(l,v,sub,cls=''){return`<div class="fbtile ${cls}"><small>${l}</small><b>${v}</b>${sub?`<span>${sub}</span>`:''}</div>`}
function fbMemModal(mid){const st=fbStats(),m=get(mid),X=st&&st.M[mid];if(!X)return;const L=S.fb.life[mid]||{kg:0,kl:0,og:0,ol:0},co=Object.entries(X.co).map(([id,n])=>[get(+id),n]).filter(x=>x[0]).sort((a,b)=>b[1]-a[1]).slice(0,5),rg=Object.entries(X.reg).sort((a,b)=>b[1]-a[1]).slice(0,4),H=S.fb.hist.filter(h=>h.mem[mid]).slice(-12);
 ui.mod={t:'html',h:`<h2 class="ht">${esc(m.name)} · Fanbase</h2><div class="fbmm">${ptc(m,90)}<div class="fbkv">${[['Kami Oshi',fbN(X.k),'k'],['Oshi',fbN(X.o),'o'],['Total supporters',fbN(X.sup)],['Popularity',m.pop],['Kami Oshi loyalty',Math.round(X.kl)],['Oshi loyalty',Math.round(X.ol)],['Average fan loyalty',Math.round(X.loy)],['Engagement',Math.round(X.eng)],['Fan growth (month)',fbN(X.gain)],['Fan loss (month)',fbN(X.loss)],['Monthly net growth',fbSg(X.net)],['Merch sales potential',yen(X.mp)+'/mo']].map(([a,b,c])=>`<div class="${c?'fb'+c:''}"><small>${a}</small><b>${b}</b></div>`).join('')}</div></div>
 <div class="g2"><div><h3>Her Kami Oshi fans also support</h3>${co.map(([o,n])=>`<div class="fbrow">${ptc(o,26)}<b>${esc(o.name)}</b>${fbHBar(n,X.k,FB_O)}<span>${fbN(n)}</span></div>`).join('')||'<p class="st">No Oshi overlap yet.</p>'}</div><div><h3>Where her fans are</h3>${rg.map(([r,n])=>`<div class="fbrow"><b>${esc(r)}</b>${fbHBar(n,X.k,FB_K)}<span>${fbN(n)}</span></div>`).join('')||'<p class="st">No Kami Oshi fans yet.</p>'}<p class="st">All time: +${fbN(L.kg)} / −${fbN(L.kl)} Kami Oshi · +${fbN(L.og)} / −${fbN(L.ol)} Oshi</p></div></div>
 <h3>Supporters by month</h3>${fbLineChart(H.map(h=>({l:h.label,v:h.mem[mid][2]})),{label:'Supporters by month',min:0,color:FB_O})}`};render()}
V.fanbase=function(){const st=fbStats();if(!st)return'';const u=fbUI(),fb=S.fb,G=st.G,A=fb.acc,last=fb.hist[fb.hist.length-1],snap=fb.snap||{total:G.total},net=G.total-snap.total,newF=A.newG+A.newM;
 const tabs=`<div class="fbtabs" role="tablist">${FB_TABS.map(([k,n,j])=>`<button role="tab" aria-selected="${u.tab==k}" class="${u.tab==k?'on':''}" onclick="fbSet('tab','${k}')"><b>${n}</b><small>${j}</small></button>`).join('')}</div>`;
 const mon=fbMonName(fb.mon),head=`<h2 class="ht">Fanbase Management</h2><p class="st">${esc(mon)} so far · month closes on the 1st · every number comes from this save's simulated fans (${fb.segs.length} fan segments).</p>`;
 let body='';
 if(u.tab=='over'){const T=G.total||1,TY=[...FB_TYPES.map(([k,n])=>[n,G.types[k],FB_K]),['Overseas (trait)',G.ovs,'#8c8199'],['New Generation (trait)',G.ng,'#8c8199']],mx=Math.max(1,...TY.map(t=>t[1]));
  const rep=last?`<b>${esc(last.label)}</b>: ${fbSg(last.net)} fans (${fbPct(last.rate)}) · +${fbN(last.newG+last.newM)} new (${fbN(last.newM)} through members) · −${fbN(last.lost)} lost${Object.keys(last.lossBy||{}).length?` (mostly ${esc(Object.entries(last.lossBy).sort((a,b)=>b[1]-a[1])[0][0])})`:''} · ${fbN(last.kch)} Kami Oshi changes · retention ${Math.round(last.ret*1000)/10}% · merch & streaming ${yen(last.rev.stream+last.rev.merch)}${last.grad&&last.grad.length?` · graduation: ${last.grad.map(esc).join(', ')}`:''}`:'The first monthly report is written when this month closes.';
  const top=Object.entries(A.src).sort((a,b)=>b[1]-a[1]).slice(0,5);
  body=`<div class="fbtiles">${fbTile('Total group fans','♥ '+fbN(G.total),'unique people','big')}${fbTile('New fans',fbN(newF),'this month','up')}${fbTile('Lost fans',fbN(A.lost),'this month','dn')}${fbTile('Net growth',fbSg(net),'this month')}${fbTile('Monthly growth rate',snap.total?fbPct(net/snap.total):'—','vs. start of month')}${fbTile('Average loyalty',Math.round(G.loy),'0–100')}${fbTile('Average engagement',Math.round(G.eng),'0–100')}${fbTile('Spending power',Math.round(G.sp),'0–100')}</div>
  <div class="g2"><div class="c"><h3>Fan types</h3><p class="st">Main type of each fan, plus two traits a fan can also have.</p>${TY.map(([n,v,c])=>`<div class="fbrow"><b>${n}</b>${fbHBar(v,mx,c)}<span>${fbN(v)} · ${Math.round(100*v/T)}%</span></div>`).join('')}<p class="st">Fans without a Kami Oshi yet: ${fbN(G.noK)} · Support patterns: ${Object.entries(FB_PAT).map(([k,[s,n]])=>`${n} ${Math.round(s*100)}/${100-Math.round(s*100)}: ${fbN(G.pat[k])}`).join(' · ')}</p></div>
  <div class="c"><h3>Group fanbase</h3>${fbLineChart([...fb.hist.map(h=>({l:h.label,v:h.total})),{l:'Now',v:G.total}],{label:'Group fans by month',min:0})}<h3>Monthly fanbase report</h3><p class="fbrep">${rep}</p></div></div>
  <div class="g2"><div class="c"><h3>Revenue from the fanbase</h3><div class="fbkv">${[['Merch & streaming (this month)',yen(A.rev.stream+A.rev.merch)],['Member merchandise potential',yen(G.merch)+'/mo'],['Group goods potential',yen(G.goods)+'/mo'],['CD buyers factor',`×${fbFactor('cd').toFixed(2)}`],['Album buyers factor',`×${fbFactor('album').toFixed(2)}`],['Concert turnout factor',`×${fbFactor('concert').toFixed(2)}`]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div><p class="st">Single sales lean on Dedicated, Hardcore and Oshi fans and loyalty; albums on Hardcore and Collector fans and spending power; concerts and roadshows on engagement, popularity and loyalty.</p></div>
  <div class="c"><h3>Where new fans came from (this month)</h3>${top.map(([k,v])=>`<div class="fbrow"><b>${esc(k)}</b>${fbHBar(v,top[0][1],FB_UP)}<span>${fbN(v)}</span></div>`).join('')||'<p class="st">No new fans yet this month.</p>'}<p class="st">Overseas fans: ${fbN(G.ovs)} · ${Object.entries(G.reg).filter(([r])=>r!='Japan').sort((a,b)=>b[1]-a[1]).slice(0,4).map(([r,n])=>`${esc(r)} ${fbN(n)}`).join(' · ')||'none yet'}</p></div></div>`}
 if(u.tab=='rank'){const R=fbRows(st),mx=Math.max(1,...R.map(r=>r.k+r.o)),cols=[['k','Kami Oshi'],['o','Oshi'],['sup','Supporters'],['pop','Popularity'],['loy','Loyalty'],['net',u.per=='all'?'All-time growth':'Monthly growth']],arrow=k=>u.sort==k?(u.dir<0?' ▼':' ▲'):'';
  body=`<div class="c">${fbFilters(st)}<div class="row fbcats"><span class="st">Ranking</span>${FB_CATS.map(([k,n])=>`<button class="b s ${u.sort==k?'on':''}" onclick="ui.fb.sort='${k}';ui.fb.dir=-1;render()">${n}</button>`).join('')}</div><p class="st">${u.per=='last'?'Values at the end of last month and last month\'s growth.':u.per=='all'?'Current totals; growth = all-time gained minus lost.':'Current values; growth = net change this month.'} Click a column to sort, a member for details.</p>
  <div class="fbtbl" role="table"><div class="fbth" role="row"><span>#</span><span>Member</span>${cols.map(([k,n])=>`<button role="columnheader" onclick="fbSet('sort','${k}')">${n}${arrow(k)}</button>`).join('')}</div>${R.map((r,i)=>`<div class="fbtr" role="row" onclick="fbMemModal(${r.m.id})"><span class="rk ${i<3?'r'+(i+1):''}">${i+1}</span><span class="fbmem">${ptc(r.m,38)}<span><b>${esc(r.m.name)}</b><small>${esc(fbTeamName(r.m))} · ${ord(r.m.gen||1)} Gen</small>${fbKO(r.k,r.o,mx)}</span></span><span class="fbk">${fbN(r.k)}</span><span class="fbo">${fbN(r.o)}</span><span>${fbN(r.sup)}</span><span>${r.pop}</span><span>${Math.round(r.loy)}</span><span class="${r.net>0?'fbup':r.net<0?'fbdn':''}">${fbSg(r.net)}</span></div>`).join('')||'<p class="st">No members match.</p>'}</div></div>`}
 if(u.tab=='oshi'){const R=st.act.map(m=>({m,...st.M[m.id]})),K=[...R].sort((a,b)=>b.k-a.k),O=[...R].sort((a,b)=>b.o-a.o),mk=Math.max(1,...R.map(r=>r.k)),mo=Math.max(1,...R.map(r=>r.o)),mx=Math.max(1,...R.map(r=>r.k+r.o)),up=R.filter(r=>r.kNet>0).sort((a,b)=>b.kNet-a.kNet).slice(0,5),dn=R.filter(r=>r.kNet<0).sort((a,b)=>a.kNet-b.kNet).slice(0,5),K0=R.reduce((a,r)=>a+r.k,0),moves=Object.entries(A.kmove).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const li=(r,i,v,c,mxv,cls)=>`<div class="fbrow ${cls}" onclick="fbMemModal(${r.m.id})"><span class="rk ${i<3?'r'+(i+1):''}">${i+1}</span>${ptc(r.m,30)}<b>${esc(r.m.name)}</b>${fbHBar(v,mxv,c)}<span>${fbN(v)}</span></div>`;
  body=`<div class="fblegend"><span><i class="k"></i>Kami Oshi — a fan's one absolute favourite (95–60% of their support)</span><span><i class="o"></i>Oshi — other members a fan also supports (shares the rest)</span></div>
  <div class="g2"><div class="c fbkc"><h3>👑 Kami Oshi ranking</h3>${K.slice(0,10).map((r,i)=>li(r,i,r.k,FB_K,mk,'')).join('')}</div><div class="c fboc"><h3>💜 Oshi ranking</h3>${O.slice(0,10).map((r,i)=>li(r,i,r.o,FB_O,mo,'')).join('')}</div></div>
  <div class="c"><h3>Kami Oshi / Oshi distribution</h3><p class="st">${fbN(K0)} fans have a Kami Oshi (${Math.round(100*K0/Math.max(1,G.total))}% of the group); Oshi counts overlap because one fan can have several Oshi.</p>${R.sort((a,b)=>(b.k+b.o)-(a.k+a.o)).map(r=>`<div class="fbrow" onclick="fbMemModal(${r.m.id})">${ptc(r.m,26)}<b>${esc(r.m.name)}</b>${fbKO(r.k,r.o,mx)}<span><span class="fbk">${fbN(r.k)}</span> / <span class="fbo">${fbN(r.o)}</span> · ${r.k+r.o?Math.round(100*r.k/(r.k+r.o)):0}% Kami</span></div>`).join('')}</div>
  <div class="g2"><div class="c"><h3>▲ Gaining Kami Oshi fans (this month)</h3>${up.map((r,i)=>li(r,i,r.kNet,FB_UP,up[0].kNet,'')).join('')||'<p class="st">No member has gained Kami Oshi fans yet this month.</p>'}</div><div class="c"><h3>▼ Losing Kami Oshi fans (this month)</h3>${dn.map((r,i)=>li(r,i,-r.kNet,FB_DN,-dn[0].kNet,'')).join('')||'<p class="st">No member has lost Kami Oshi fans this month.</p>'}</div></div>
  <div class="g2"><div class="c"><h3>Kami Oshi growth</h3>${fbLineChart([...fb.hist.map(h=>({l:h.label,v:Object.values(h.mem).reduce((a,x)=>a+x[0],0)})),{l:'Now',v:K0}],{label:'Fans with a Kami Oshi',min:0})}</div><div class="c"><h3>Kami Oshi changes this month</h3><p class="st">${fbN(A.kch)} fans changed their Kami Oshi (no new fans are created; the previous Kami Oshi often stays as an Oshi).</p>${moves.map(([k,n])=>{const[a,b]=k.split('>').map(x=>get(+x));return a&&b?`<div class="fbrow">${ptc(a,24)}<span>→</span>${ptc(b,24)}<b>${esc(a.name.split(' ')[0])} → ${esc(b.name.split(' ')[0])}</b><span>${fbN(n)}</span></div>`:''}).join('')||'<p class="st">None so far.</p>'}</div></div>`}
 if(u.tab=='team'){const T=st.teams,U=st.units,ms=Math.max(1,...T.map(t=>t.sup)),mu=Math.max(1,...U.map(t=>t.sup));
  body=`<p class="st">Team and unit supporters are unique fans who follow that team (Kami Oshi in the team, or Oshi there). One fan can follow several teams, so the totals overlap.</p><div class="fbteams">${T.map(t=>`<div class="c fbteam" style="border-top:5px solid ${t.color||FB_O}"><h3>${esc(t.name)} <small class="st">${esc(t.gname)} · ${t.n} members</small></h3><div class="fbkv">${[['Supporters',fbN(t.sup)],['Popularity',Math.round(t.pop)],['Loyalty',Math.round(t.loy)],['Engagement',Math.round(t.eng)],['Growth (month)',fbSg(t.net)]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div><div class="row lnp">${[...t.ids].map(get).filter(Boolean).slice(0,10).map(m=>`<span class="lpi">${ptc(m,28)}</span>`).join('')}</div></div>`).join('')||'<div class="c"><p class="st">No teams yet.</p></div>'}</div>
  <div class="g2"><div class="c"><h3>Team comparison</h3>${T.map(t=>`<div class="fbrow"><b>${esc(t.name)}</b>${fbHBar(t.sup,ms,FB_O)}<span>${fbN(t.sup)} · loyalty ${Math.round(t.loy)} · eng. ${Math.round(t.eng)}</span></div>`).join('')}</div><div class="c"><h3>Unit supporters (groups)</h3>${U.map(t=>`<div class="fbrow"><b>${esc(t.name)}</b>${fbHBar(t.sup,mu,FB_K)}<span>${fbN(t.sup)} · ${fbSg(t.net)} this month</span></div>`).join('')}</div></div>`}
 if(u.tab=='grow'){const H=fb.hist.slice(-18),R=fbRows(st),mx=Math.max(1,...R.map(r=>Math.abs(r.net))),tm=st.teams,mt=Math.max(1,...tm.map(t=>Math.abs(t.net)));
  body=`<div class="fbtiles">${fbTile('New fans',fbN(newF),'this month','up')}${fbTile('Lost fans',fbN(A.lost),'this month','dn')}${fbTile('Net growth',fbSg(net),'this month')}${fbTile('Group acquisition',fbN(A.newG),'found the group')}${fbTile('Member acquisition',fbN(A.newM),'found a member')}${fbTile('Retention',snap.total+newF?Math.round(1000*(1-A.lost/(snap.total+newF)))/10+'%':'—','this month')}</div>
  <div class="g2"><div class="c"><h3>Growth by member</h3>${fbFilters(st)}${R.map(r=>`<div class="fbrow fbdiv" onclick="fbMemModal(${r.m.id})">${ptc(r.m,24)}<b>${esc(r.m.name)}</b><span class="fbpn"><i class="${r.net<0?'n':'p'}" style="width:${50*Math.abs(r.net)/mx}%"></i></span><span class="${r.net>0?'fbup':r.net<0?'fbdn':''}">${fbSg(r.net)}</span></div>`).join('')}</div>
  <div class="c"><h3>Growth by team</h3>${tm.map(t=>`<div class="fbrow fbdiv"><b>${esc(t.name)}</b><span class="fbpn"><i class="${t.net<0?'n':'p'}" style="width:${50*Math.abs(t.net)/mt}%"></i></span><span>${fbSg(t.net)}</span></div>`).join('')||'<p class="st">No teams yet.</p>'}<h3>Loss reasons (this month)</h3>${Object.entries(A.lossBy).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="fbrow"><b>${esc(k)}</b>${fbHBar(v,A.lost,FB_DN)}<span>${fbN(v)}</span></div>`).join('')||'<p class="st">No fans lost this month.</p>'}</div></div>
  <div class="g2"><div class="c"><h3>Monthly growth history</h3><div class="fblegend"><span><i style="background:${FB_UP}"></i>New fans</span><span><i style="background:${FB_DN}"></i>Lost fans</span></div>${fbBarsPN(H.map(h=>({l:h.label,a:h.newG+h.newM,b:h.lost})))}</div><div class="c"><h3>Fan retention trend</h3>${fbLineChart(H.map(h=>({l:h.label,v:Math.round(h.ret*1000)/10})),{label:'Monthly retention %',color:FB_O,fmt:v=>Math.round(v*10)/10+'%'})}</div></div>
  <div class="c"><h3>History table</h3><div class="fbhist"><table><tr><th>Month</th><th>Group fans</th><th>Group acq.</th><th>Member acq.</th><th>Lost</th><th>Net</th><th>Rate</th><th>Loyalty</th><th>Engagement</th><th>Kami changes</th></tr>${fb.hist.slice().reverse().map(h=>`<tr><td>${esc(h.label)}</td><td>${fbN(h.total)}</td><td>${fbN(h.newG)}</td><td>${fbN(h.newM)}</td><td>${fbN(h.lost)}</td><td>${fbSg(h.net)}</td><td>${fbPct(h.rate)}</td><td>${h.loy}</td><td>${h.eng}</td><td>${fbN(h.kch)}</td></tr>`).join('')||'<tr><td colspan="10" class="st">No month has closed yet.</td></tr>'}</table></div>${fb.grads.length?`<h3>Graduations</h3>${fb.grads.map(g=>`<p class="st">🎓 ${esc(g.name)} (${jd(g.day)}): ${fbN(g.kami)} Kami Oshi fans → ${fbN(g.cont)} stayed with the group, ${fbN(g.trans)} chose a new Kami Oshi, ${fbN(g.att)} stay attached to her, ${fbN(g.left)} left.</p>`).join('')}`:''}</div>`}
 return head+tabs+`<div class="fbbody">${body}</div>`};

// supporters for other screens (Fan Club list)
function fbSupOf(m){const st=fbStats();return st&&st.M[m.id]?st.M[m.id].sup:0}
