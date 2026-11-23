// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Request Hour concert (built on the existing Concert system)
// -------------------------------------------------------------------------------------
//  · When voting closes a "Request Hour" concert is created in the Concert system: the event's date,
//    its performances (≤ 50 ranked songs each, lowest ranks first) and one setlist per performance
//    holding the ranked songs in countdown order. Ranked songs are LOCKED (they cannot be removed,
//    replaced, reordered or moved to another performance); the producer can still edit members,
//    Center, formation, costumes, add MC corners and add Encore songs (Encore songs never get a rank).
//  · Defaults: the ORIGINAL performance — original members & center (Theater songs: the original
//    stage / unit lineup, never the Revival lineup) and the original costume ("Original song costume").
//    A graduated original member's place is taken by a current member (Revival performer of that
//    song, then a member of the original team, then the most popular member).
//  · Big screen: a large concert stage (wide stage, LED wall and side screens, lighting rig, penlight
//    audience) with a two-sided Hina-dan BEHIND the stage (2 × 50 tiered seats). A member sits there
//    after performing, wearing the costume of the LAST song she performed in that show, and leaves
//    before rank N+2 begins when her next song is rank N (e.g. next #15 → she leaves before #17).
//    Seats never overlap; with more than 100 members the absent members' seats are reused and the
//    rest wait backstage. Seated members react to each song (original members, former centers,
//    close friends, team mates…).
//  · After ranks #3, #2 and #1 the original center (or an original member / current performer) gives
//    a speech that depends on the song's story.
// =====================================================================================
CC_TYPE.rh='Request Hour';
{const f=ccTypeF;ccTypeF=function(C){return C&&C.type=='rh'?1.12:f.apply(this,arguments)}}
const rhOfC=C=>C&&C.rh?rhGet(C.rh):null;
const RH_SLOTS={1:[[0,'e']],2:[[0,'e'],[1,'e']],3:[[0,'e'],[1,'e'],[2,'e']],4:[[0,'e'],[1,'a'],[1,'e'],[2,'e']],5:[[0,'e'],[1,'a'],[1,'e'],[2,'a'],[2,'e']]};
function rhVenue(){const L=Object.values(CC_V||{});const pick=c=>L.filter(v=>v.cat==c).sort((a,b)=>(b.cap.seat||b.cap.stand||0)-(a.cap.seat||a.cap.stand||0))[0];return pick('arena')||pick('lhall')||pick('dome')||L[0]||null}
// a current member for an empty original place: Revival performer → original team → popularity
function rhFill(C,it,M){const used=new Set(it.pos.map(z=>z.m).filter(x=>x!=null)),P=new Set(C.parts),ok=id=>{const m=get(id);return m&&P.has(id)&&m.status!='graduated'&&!used.has(id)};
 const rev=[];try{rhRevivals(it.gid+':'+it.song).forEach(R=>R.mem.forEach(id=>rev.push(id)))}catch(e){}
 const team=M&&M.team?S.members.filter(m=>m.tid==M.team).map(m=>m.id):[],grp=S.members.filter(m=>(m.group==it.gid||(typeof gsGid=='function'&&gsGid(m)==it.gid))).sort((a,b)=>(b.pop||0)-(a.pop||0)).map(m=>m.id);
 const Q=[...rev,...team,...grp].filter((id,i,a)=>a.indexOf(id)==i);
 it.pos.forEach(z=>{if(z.m!=null)return;const id=Q.find(ok);if(id==null)return;z.m=id;z.rf=1;used.add(id)})}
function rhMakeConcert(E){if(!E||E.cc||!E.rank||!E.rank.length)return null;const X=ccS(),id='cc'+(++X.seq),V=rhVenue(),G=rhGroups(E),gids=new Set(G.map(g=>g.id));
 const C={id,name:E.name,type:'rh',host:E.gid,anni:null,grad:[],vid:V?V.id:null,vcfg:'seat',start:Math.max(E.date,S.day+21),pf:[],parts:[],sets:{},snap:{},status:'plan',created:S.day,log:[],rh:E.id};
 C.parts=S.members.filter(m=>m.status!='graduated'&&(isAct(m)||m.status=='trainee')&&gids.has(typeof gsGid=='function'?gsGid(m):m.group)).map(m=>m.id);
 const PR=rhPerfRanks(E.rank.length,E.nperf);
 PR.forEach(([hi,lo],i)=>{const sid='rh'+(i+1)+'_'+Date.now().toString(36).slice(-4),items=[];
  for(let r=hi;r>=lo;r--){const z=E.rank.find(q=>q.r==r);if(!z)continue;const o=ccSong(z.gid,z.id);if(!o)continue;
   const it={id:ccIid(),k:'song',gid:z.gid,song:z.id,title:o.title,pos:ccCopyPos(C,o),orig:ccOrigPos(o).map(q=>({m:q.m,r:q.r,c:q.c})),cz:{mode:'orig'},rh:{eid:E.id,r,v:z.v}};
   try{if(o.th)ccThApply(C,it)}catch(e){console.error(e)}try{rhFill(C,it,rhMeta({key:z.key,gid:z.gid,id:z.id,title:z.title,cats:new Set(),via:[]}))}catch(e){console.error(e)}items.push(it)}
  C.sets[sid]={id:sid,name:`${rhT('Show','รอบ')} ${i+1} · #${hi}–#${lo}`,items,rh:1};
  const sl=(RH_SLOTS[PR.length]||RH_SLOTS[1])[i];const p=ccPfNew(C,sl[0],sl[1]);p.set=sid;p.rhR=[hi,lo];C.pf.push(p)});
 try{ccRenum(C)}catch(e){}X.list.push(C);E.cc=C.id;E.status='concert';E.log.push({d:S.day,t:'concert',cc:C.id});
 try{const h=rhS().hist.find(x=>x.eid==E.id);if(h)h.cc=C.id}catch(e){}return C}
// ---- locks: ranked songs keep their place; Encore songs are extra ---------------------------------------------------------------
const rhLockMsg=()=>rhT('Ranked songs are fixed by the fans\' votes — they cannot be removed, replaced or reordered. You can edit members, Center, formation and costumes, add MC corners and Encore songs.','เพลงในอันดับถูกกำหนดโดยผลโหวตของแฟน ลบ แทนที่ หรือสลับลำดับไม่ได้ แต่แก้สมาชิก เซ็นเตอร์ ฟอร์เมชัน ชุด เพิ่ม MC และเพลงอังกอร์ได้');
const rhCi=()=>{const C=ccCur();return C&&C.rh?C:null};
{const f=ccItemDel;ccItemDel=function(iid){const C=rhCi();if(C){const r=ccItem(C,iid);if(r&&r.it.rh)return toast(rhLockMsg(),'err')}return f.apply(this,arguments)}}
{const f=ccItemMove;ccItemMove=function(iid,dir){const C=rhCi();if(C){const r=ccItem(C,iid);if(r){const L=r.s.items,i=L.indexOf(r.it),j=i+dir,o=L[j];if(r.it.rh&&o&&(o.rh||o.enc))return toast(rhLockMsg(),'err');if(o&&o.rh&&(r.it.enc))return toast(rhLockMsg(),'err');if(r.it.rh&&!o)return}}return f.apply(this,arguments)}}
{const f=ccAddSong;ccAddSong=function(key){const C=rhCi(),s=C&&C.sets[ui.ccs],n=s?s.items.length:0;const r=f.apply(this,arguments);if(C&&s&&s.items.length>n){const it=s.items[s.items.length-1];it.enc=true;toast(rhT('Added as an Encore song (Encore songs have no rank).','เพิ่มเป็นเพลงอังกอร์แล้ว (เพลงอังกอร์ไม่มีอันดับ)'));render()}return r}}
if(typeof ccEncTog=='function'){const f=ccEncTog;ccEncTog=function(iid){const C=rhCi();if(C){const r=ccItem(C,iid);if(r&&(r.it.rh||r.it.enc))return toast(rhT('In a Request Hour concert ranked songs stay ranked and added songs stay Encore songs.','ในคอนเสิร์ต Request Hour เพลงในอันดับคงเป็นเพลงในอันดับ และเพลงที่เพิ่มเป็นเพลงอังกอร์'),'err')}return f.apply(this,arguments)}}
{const f=ccSetDel;ccSetDel=function(sid){const C=rhCi();if(C&&C.sets[sid]&&C.sets[sid].rh)return toast(rhLockMsg(),'err');return f.apply(this,arguments)}}
{const f=ccPfAdd;ccPfAdd=function(){if(rhCi())return toast(rhT('The number of performances follows the Request Hour settings.','จำนวนรอบเป็นไปตามการตั้งค่า Request Hour'),'err');return f.apply(this,arguments)}}
{const f=ccPfDel;ccPfDel=function(){if(rhCi())return toast(rhT('The number of performances follows the Request Hour settings.','จำนวนรอบเป็นไปตามการตั้งค่า Request Hour'),'err');return f.apply(this,arguments)}}
{const f=ccPfSet;ccPfSet=function(pid,k,v){const C=rhCi();if(C&&k=='set')return toast(rhLockMsg(),'err');return f.apply(this,arguments)}}
{const f=ccLibUse;ccLibUse=function(){if(rhCi())return toast(rhLockMsg(),'err');return f.apply(this,arguments)}}
{const f=ccSet;ccSet=function(k,v){const C=ccCur();if(C&&C.rh&&(k=='type'||k=='host'))return toast(rhT('A Request Hour concert keeps its type and host group.','คอนเสิร์ต Request Hour คงประเภทและวงเจ้าภาพไว้'),'err');if(C&&!C.rh&&k=='type'&&v=='rh')return toast(rhT('Request Hour concerts are created from the Request Hour page.','คอนเสิร์ต Request Hour สร้างจากหน้า Request Hour'),'err');return f.apply(this,arguments)}}
// setlist rows: show the rank and the lock
{const f=ccSongRow;ccSongRow=function(C,s,it){let h=f.apply(this,arguments);try{if(C&&C.rh&&it&&it.rh){const b=`<span class="rhrk" title="${esc(rhLockMsg())}">🔒 #${it.rh.r}</span>`;const i=h.indexOf('>');if(i>0)h=h.slice(0,i+1)+b+h.slice(i+1)}}catch(e){}return h}}
{const f=ccSetHtml;ccSetHtml=function(C){let h=f.apply(this,arguments);try{const E=rhOfC(C);if(E)h=`<div class="c rhbanner">🎤 <b>${esc(E.name)}</b> · ${rhLockMsg()}</div>`+h}catch(e){}return h}}
// ---- Hina-dan plan for one performance ---------------------------------------------------------------------------------------
const RH_SEATS=50,RH_ROWS=5,RH_COLS=10;
// seat order: front tier first, centre seats first, alternating left / right blocks
const RH_SEAT_ORDER=(()=>{const L=[];for(let r=0;r<RH_ROWS;r++){const cols=[];for(let k=0;k<RH_COLS;k++)cols.push(k);cols.sort((a,b)=>Math.abs(a-4.5)-Math.abs(b-4.5));cols.forEach(c=>{L.push([0,r,9-c]);L.push([1,r,c])})}return L})();
let RH_HP={};
function rhPerfIds(C,p,it){const out=((p&&p.res)||{}).out||{};return(it.pos||[]).map(z=>z.m).filter(m=>m!=null&&!out[m]&&ccMem(m))}
function rhHinaPlan(C,p,set){const songs=[];set.items.forEach((it,idx)=>{if(it.k=='song')songs.push({it,idx,P:rhPerfIds(C,p,it)})});
 const key=C.id+'|'+(p&&p.id)+'|'+set.id+'|'+songs.map(s=>s.P.join(',')).join(';');if(RH_HP[key])return RH_HP[key];if(Object.keys(RH_HP).length>12)RH_HP={};
 const J={};songs.forEach((s,j)=>s.P.forEach(m=>(J[m]=J[m]||[]).push(j)));
 const seatOf={},taken=new Map(),freeSeat=()=>RH_SEAT_ORDER.find(s=>!taken.has(s.join(',')));
 const states=songs.map((s,j)=>{const perf=new Set(s.P),want=[];
  for(const m in J){const L=J[m],last=L.filter(a=>a<j).pop();if(last==null||perf.has(+m))continue;const next=L.find(b=>b>j);if(next!=null&&j>=next-2)continue;want.push({m:+m,last,next:next??null})}
  const wantSet=new Set(want.map(w=>w.m));
  // members who are away keep their seat while there is room; with more than 100 members the seats of absent members are reused
  want.sort((a,b)=>(seatOf[a.m]?0:1)-(seatOf[b.m]?0:1)||a.last-b.last);const seated=[],wait=[];
  want.forEach(w=>{let st=seatOf[w.m];if(!st){st=freeSeat();if(!st){const ev=[...taken.entries()].find(([k,mm])=>!wantSet.has(mm));if(ev){taken.delete(ev[0]);delete seatOf[ev[1]];st=ev[0].split(',').map(Number)}}if(!st){wait.push(w.m);return}seatOf[w.m]=st;taken.set(st.join(','),w.m)}seated.push({m:w.m,seat:st,czIdx:songs[w.last].idx})});
  return{idx:s.idx,seated,wait,perf:s.P}});
 const R={songs,states};RH_HP[key]=R;return R}
// how a seated member reacts to the song being performed
function rhReact(C,it,m,perf,rank){const r=mulb(rhSeedN(C.id+'|'+it.id+'|'+m.id)),orig=(it.orig||[]).filter(z=>z.m!=null),wasC=orig.some(z=>z.m==m.id&&z.c),wasM=orig.some(z=>z.m==m.id);
 let bond=0;try{if(typeof capBond=='function')perf.forEach(id=>{const b=capBond(m.id,id);if(b!=null&&b>bond)bond=b})}catch(e){}
 const cen=(it.pos||[]).find(z=>z.c&&z.m!=null),cm=cen&&ccMem(cen.m),sameTeam=cm&&cm.tid&&cm.tid==m.tid;
 if(wasC)return r()<.55?{k:'own',pose:3,ex:6,ic:'🥹',stand:1}:{k:'own',pose:15,ex:3,ic:'⭐',stand:1};
 if(wasM)return r()<.5?{k:'nost',pose:0,ex:6,ic:'😢'}:{k:'nost',pose:3,ex:1,ic:'💗'};
 if(rank<=3)return{k:'top',pose:15,ex:3,ic:r()<.5?'🙌':'👏',stand:1};
 if(bond>=75)return{k:'friend',pose:r()<.5?15:1,ex:3,ic:'📣',stand:r()<.4?1:0};
 if(sameTeam&&r()<.6)return{k:'team',pose:1,ex:11,ic:'',pen:1};
 const L=[{k:'clap',pose:5,ex:1,ic:'👏'},{k:'pen',pose:1,ex:2,ic:'',pen:1},{k:'sing',pose:0,ex:2,ic:'🎵'},{k:'smile',pose:0,ex:2,ic:''},{k:'laugh',pose:0,ex:1,ic:'😆'},{k:'wow',pose:0,ex:5,ic:'😮'},{k:'hype',pose:15,ex:3,ic:'✨',stand:r()<.3?1:0},{k:'pen',pose:6,ex:11,ic:'',pen:1}];
 return L[Math.floor(r()*L.length)]}
// ---- the large Request Hour stage ----------------------------------------------------------------------------------------------
function rhStageSvg(C,p,set,idx,W=1400,H=760){const it=set.items[idx],E=rhOfC(C),plan=rhHinaPlan(C,p,set),stt=plan.states.find(s=>s.idx==idx)||{seated:[],perf:[]},id='rh'+(++PTC[0]);
 const pos=(it.pos||[]).filter(z=>z.m!=null&&stt.perf.includes(z.m)),cds={};pos.forEach(z=>{cds[z.m]=ccCzFor(C,set,idx,z.m)});
 const P=ccPal(Object.values(cds),it.song+it.id),style=(ccLedPlan(set)||{})[it.id]||'rays',r=mulb(rhSeedN(C.id+it.id)),rank=it.rh?it.rh.r:null;
 let s=`<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030c"/><stop offset=".55" stop-color="${czHsl(260,40,10)}"/><stop offset="1" stop-color="#0a0614"/></linearGradient>
 <linearGradient id="fl${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2140"/><stop offset="1" stop-color="#0e0a18"/></linearGradient><linearGradient id="lg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.bg}"/><stop offset="1" stop-color="${P.bg2}"/></linearGradient>
 <filter id="gl${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter><clipPath id="cl${id}"><rect x="500" y="70" width="400" height="230" rx="4"/></clipPath>
 <radialGradient id="sp${id}" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="${P.c}" stop-opacity=".35"/><stop offset="1" stop-color="${P.c}" stop-opacity="0"/></radialGradient></defs>
 <rect width="${W}" height="${H}" fill="url(#bg${id})"/>`;
 // roof truss with moving heads
 s+=`<rect x="20" y="10" width="${W-40}" height="14" fill="#2b2740"/><rect x="20" y="10" width="${W-40}" height="3" fill="${P.a}" opacity=".7"/>`;for(let i=0;i<22;i++){const x=40+i*(W-80)/21;s+=`<line x1="${x}" y1="10" x2="${x+((i%2)?14:-14)}" y2="24" stroke="#4a4466" stroke-width="2"/><rect x="${x-7}" y="24" width="14" height="10" rx="2" fill="#1c1a28"/><circle cx="${x}" cy="36" r="5" fill="${i%3?P.c:P.a}"/>`}
 for(let i=0;i<14;i++){const x=60+i*(W-120)/13,tx=x+(r()-.5)*380;s+=`<path d="M${x-5} 38L${tx-60} ${H-150}H${tx+60}L${x+5} 38Z" fill="${i%2?P.a:P.b}" opacity=".08"/>`}
 // side towers + side screens
 [[18,1],[W-118,0]].forEach(([x,k])=>{s+=`<rect x="${x}" y="40" width="100" height="${H-200}" fill="#141222"/>${[0,1,2,3,4,5].map(i=>`<rect x="${x+8}" y="${60+i*80}" width="84" height="4" fill="${P.a}" opacity=".5"/>`).join('')}`});
 const lead=pos.find(z=>z.c)||pos[0],lm=lead&&ccMem(lead.m);
 [[26,120],[W-110,120]].forEach(([x,y],k)=>{s+=`<rect x="${x-4}" y="${y-4}" width="92" height="148" rx="4" fill="#2b2740"/><rect x="${x}" y="${y}" width="84" height="140" fill="url(#lg${id})"/>`;if(lm){const a=ap(lm);s+=`<svg x="${x}" y="${y}" width="84" height="140" viewBox="22 4 56 96" preserveAspectRatio="xMidYMid slice">${fig(lm,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:k?3:2,...(cds[lm.id]?{cd:cds[lm.id]}:{})})}</svg>`}});
 // Hina-dan: two tiered blocks behind the stage, 5 tiers × 10 seats each
 const HX=[[130,500],[900,1270]],TY=r0=>396-r0*46,cw=37;
 HX.forEach(([x0,x1],side)=>{for(let row=RH_ROWS-1;row>=0;row--){const y=TY(row);s+=`<path d="M${x0-8+row*(side?-6:6)} ${y+8}H${x1+8-row*(side?6:-6)}V${y+40}H${x0-8+row*(side?-6:6)}Z" fill="${row%2?'#2d2347':'#342a52'}" stroke="${P.a}" stroke-opacity=".35"/>`}});
 const seatXY=([side,row,col])=>{const[x0,x1]=HX[side];return[x0+(x1-x0)*(col+.5)/RH_COLS+(side?-1:1)*row*3,TY(row)]};
 // seats like the General Election ceremony: a chair on every seat, members sit on them (sitting pose), back tier first
 const RSC=.8,seatY=y=>y+32;
 const seated=stt.seated.slice().sort((a,b)=>b.seat[1]-a.seat[1]),bySeat=new Map(seated.map(z=>[z.seat.join(','),z]));let pens='';
 for(let row=RH_ROWS-1;row>=0;row--)for(let side=0;side<2;side++)for(let col=0;col<RH_COLS;col++){const[x,y]=seatXY([side,row,col]),sy=seatY(y);s+=gxChair(+x.toFixed(1),+sy.toFixed(1),RSC,P.a);
  const z=bySeat.get([side,row,col].join(','));if(!z)continue;const m=ccMem(z.m);if(!m)continue;const cd=ccCzFor(C,set,z.czIdx,m.id),a=ap(m),R=rhReact(C,it,m,stt.perf,rank??99),fw=46*RSC,fh=fw*202/80,F=pose=>`<svg viewBox="10 -4 80 202" width="${fw.toFixed(1)}" height="${fh.toFixed(1)}" overflow="visible">${fig(m,{pose,of:a.of,oh:a.oh,ac:a.ac,ex:R.ex,...(cd?{cd}:{})})}</svg>`;
  let top;if(R.stand){top=sy+24*RSC-196*fw/80;s+=`<g transform="translate(${(x-fw/2).toFixed(1)} ${top.toFixed(1)})">${F(R.pose)}</g>`}else{top=sy-84*fw/80+6*RSC;s+=`<g transform="translate(${(x-fw/2).toFixed(1)} ${top.toFixed(1)})">${F(10)}</g>`}
  const hy=top+18*fw/80;
  if(R.pen)pens+=`<line x1="${(x+7).toFixed(1)}" y1="${(hy+20).toFixed(1)}" x2="${(x+12).toFixed(1)}" y2="${(hy+2).toFixed(1)}" stroke="${P.c}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${(x+12).toFixed(1)}" cy="${(hy+2).toFixed(1)}" r="3.4" fill="${P.c}" opacity=".6" filter="url(#gl${id})"/>`;
  if(R.ic)pens+=`<text x="${(x+8).toFixed(1)}" y="${(hy-4).toFixed(1)}" font-size="11">${R.ic}</text>`}
 s+=pens;
 // main LED wall + top banner + rank screen
 s+=`<rect x="482" y="52" width="436" height="266" rx="22" fill="${P.a}" opacity=".25" filter="url(#gl${id})"/><rect x="492" y="62" width="416" height="246" rx="6" fill="#1a1726"/><g clip-path="url(#cl${id})">${ccLed(style,P,500,70,400,230,r,id,it.title)}</g>
 <rect x="130" y="40" width="1140" height="22" rx="4" fill="#1a1726"/><text x="700" y="56" text-anchor="middle" font-size="13" letter-spacing="3" fill="${P.c}">REQUEST HOUR · SETLIST BEST ${E?E.size:''} · ${rank?`#${rank}`:it.enc?'ENCORE':''} ${esc(String(it.title||'').slice(0,30))}</text>`;
 // stage floor (wide and deep) with runways
 s+=`<path d="M70 440H${W-70}L${W} 640H0Z" fill="url(#fl${id})"/><path d="M70 440H${W-70}" stroke="${P.a}" stroke-width="4" opacity=".9"/><ellipse cx="700" cy="540" rx="520" ry="90" fill="url(#sp${id})"/>`;
 for(let i=0;i<13;i++){const t=i/12;s+=`<path d="M${70+(W-140)*t} 440L${(W+120)*t-60} 640" stroke="${P.c}" stroke-opacity=".08"/>`}
 s+=`<path d="M640 640H760L790 ${H}H610Z" fill="#221a36" stroke="${P.c}" stroke-opacity=".5"/>`;[0,1].forEach(k=>{s+=`<path d="M${k?W-70:70} 440L${k?W-10:10} 470V640H${k?W:0}Z" fill="#1a1428"/>`});
 // performers on the main stage (rows from the formation, everyone the same size)
 const rows=[...new Set(pos.map(z=>z.r))].sort((a,b)=>a-b).map(rr=>pos.filter(z=>z.r==rr)),RN=rows.length,maxN=Math.max(1,...rows.map(x=>x.length)),fw=Math.min(118,1100/maxN*1.15,(250)/(1.9+.35*Math.max(0,RN-1)));
 rows.slice().reverse().forEach((row,ri)=>{const back=RN-1-ri,feet=620-back*Math.min(46,fw*.55),step=Math.min(1150/Math.max(1,row.length),fw*1.25),x0=700-step*(row.length-1)/2+(back%2&&row.length==(rows[back-1]||[]).length?step/2:0);
  row.forEach((z,i)=>{const m=ccMem(z.m);if(!m)return;const a=ap(m),x=x0+step*i,ww=z.c?fw*1.08:fw;s+=`<ellipse cx="${x.toFixed(1)}" cy="${(feet+1).toFixed(1)}" rx="${(ww*.3).toFixed(1)}" ry="${(ww*.06).toFixed(1)}" fill="#000" opacity=".4"/>`+stFig(m,x,feet+(z.c?4:0),ww,fig(m,{pose:z.c?3:TH_MICP[Math.floor(r()*TH_MICP.length)],of:a.of,oh:a.oh,ac:a.ac,ex:2,prop:1,...(cds[m.id]?{cd:cds[m.id]}:{})}))})});
 // audience with penlights in the song's colours
 let crowd=`<rect x="0" y="${H-118}" width="${W}" height="118" fill="#07050d"/>`;for(let i=0;i<150;i++){const x=(i%50)*W/49+(r()-.5)*14,yy=H-100+Math.floor(i/50)*36+(r()-.5)*8,c=[P.c,P.a,P.b][i%3];crowd+=`<circle cx="${x.toFixed(0)}" cy="${yy.toFixed(0)}" r="11" fill="#120e1c"/><line x1="${(x+6).toFixed(0)}" y1="${(yy-6).toFixed(0)}" x2="${(x+12+r()*6).toFixed(0)}" y2="${(yy-30).toFixed(0)}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`}
 s+=crowd;
 return`<svg viewBox="0 0 ${W} ${H}" class="ccstg rhstg" role="img" aria-label="${esc(it.title||'')}" preserveAspectRatio="xMidYMid meet">${s}</svg>`}
{const f=ccStageSvg;ccStageSvg=function(C,p,set,idx){if(C&&C.rh&&set&&set.items&&set.items[idx]&&set.items[idx].k=='song'){try{return rhStageSvg(C,p,set,idx)}catch(e){console.error(e)}}return f.apply(this,arguments)}}
// ---- Top 3 speeches ----------------------------------------------------------------------------------------------------------
function rhSpeaker(C,p,set,idx){const it=set.items[idx],out=((p&&p.res)||{}).out||{},P=new Set(C.parts),ok=id=>{const m=ccMem(id);return m&&m.status!='graduated'&&P.has(id)&&!out[id]};
 const orig=(it.orig||[]).filter(z=>z.m!=null),oc=orig.filter(z=>z.c).map(z=>z.m).find(ok);if(oc!=null)return{m:oc,why:'center'};
 const om=orig.map(z=>z.m).filter(ok).sort((a,b)=>(ccMem(b).pop||0)-(ccMem(a).pop||0))[0];if(om!=null)return{m:om,why:'orig'};
 const perf=rhPerfIds(C,p,it),cc=(it.pos||[]).find(z=>z.c&&perf.includes(z.m));if(cc)return{m:cc.m,why:'perf'};return perf.length?{m:perf[0],why:'perf'}:null}
function rhSpeech(C,p,set,idx,used){const it=set.items[idx],E=rhOfC(C),z=E&&E.rank?E.rank.find(q=>q.r==it.rh.r):null,sp=rhSpeaker(C,p,set,idx);if(!sp)return null;const m=ccMem(sp.m),th=rhTh();
 const M=rhMeta({key:it.gid+':'+it.song,gid:it.gid,id:it.song,title:it.title,cats:new Set(),via:[]}),T=it.title,R=it.rh.r,V=(it.rh.v||0).toLocaleString(),yrs=M.last!=null?Math.floor((S.day-M.last)/365):0,gap=M.last!=null?S.day-M.last:0;
 const grad=m.grad&&m.grad.ann!=null&&m.status!='graduated',origC=(M.cen||[]).map(id=>ccMem(id)).filter(Boolean),gone=origC.filter(x=>x.status=='graduated');
 const ctx=[];if(grad)ctx.push('grad');if(M.teamGone)ctx.push('team');if(M.kind=='unit')ctx.push('unit');if(gap>540)ctx.push('long');if(sp.why!='center'&&gone.length)ctx.push('succ');if(z&&z.prev!=null&&z.prev>R+5)ctx.push('rise');const firstRH=!rhEverRanked(E).size;if(z&&z.prev==null&&!z.re&&!firstRH)ctx.push('new');if(firstRH)ctx.push('first');if(sp.why=='center')ctx.push('cen');if(z&&z.re)ctx.push('back');if(M.kind=='title')ctx.push('single');if(M.kind=='th')ctx.push('stage');ctx.push('gen');
 const N={T,R,V,y:Math.max(1,yrs),team:M.teamName||(th?'ทีมเดิม':'our old team'),unit:M.unit||'Unit',stage:M.origin,old:gone.map(x=>x.name).join(' & ')};
 const LIB={grad:[[`“${T}” at #${R}… Since I announced my graduation I kept wondering whether I would get to sing this again. Thank you for giving me this stage one more time.`,`“${T}” อันดับ ${R}… ตั้งแต่ประกาศจบการศึกษา ฉันคิดตลอดว่าจะได้ร้องเพลงนี้อีกไหม ขอบคุณที่มอบเวทีนี้ให้ฉันอีกครั้งนะคะ`],[`I will carry the ${V} votes for “${T}” with me after I graduate. This song is where my story started.`,`ฉันจะเก็บ ${V} โหวตของ “${T}” ไว้ในใจหลังจบการศึกษา เพลงนี้คือจุดเริ่มต้นของเรื่องราวของฉัน`]],
  team:[[`${N.team} doesn't exist anymore, but tonight it felt like we were all back together. “${T}” is ours forever.`,`${N.team} ไม่มีอีกแล้ว แต่คืนนี้รู้สึกเหมือนเราได้กลับมาอยู่ด้วยกันอีกครั้ง “${T}” จะเป็นเพลงของพวกเราตลอดไป`],[`When the team was disbanded I thought this song would disappear with it. You didn't let it. Thank you.`,`ตอนทีมถูกยุบ ฉันนึกว่าเพลงนี้จะหายไปด้วย แต่ทุกคนไม่ปล่อยให้มันหายไป ขอบคุณนะคะ`]],
  unit:[[`Thank you for remembering the ${N.unit} version of “${T}”. We rehearsed it every night after the theater show… I never thought it would reach #${R}.`,`ขอบคุณที่ยังจำ “${T}” เวอร์ชัน ${N.unit} ได้ เราซ้อมกันทุกคืนหลังการแสดงเธียเตอร์… ไม่เคยคิดเลยว่าจะได้ถึงอันดับ ${R}`],[`A unit song is so small on the theater stage. Seeing it on this huge stage with all of you — I'm a little overwhelmed.`,`เพลงยูนิตบนเวทีเธียเตอร์มันเล็กนิดเดียว ได้เห็นมันบนเวทีใหญ่ขนาดนี้กับทุกคน ฉันตื้นตันจนพูดไม่ออก`]],
  long:[[`We hadn't performed “${T}” for about ${N.y} year(s). I was scared I'd forgotten the choreography — my body remembered everything.`,`เราไม่ได้แสดง “${T}” มาประมาณ ${N.y} ปีแล้ว กลัวมากว่าจะลืมท่าเต้น แต่ร่างกายจำได้ทุกอย่างเลย`],[`It has been so long since “${T}”… Thank you for waiting for it all this time.`,`นานมากแล้วที่ไม่ได้แสดง “${T}”… ขอบคุณที่รอเพลงนี้มาตลอดนะคะ`]],
  succ:[[`This was ${N.old}'s song. I tried to protect it tonight, with all the love the fans gave it.`,`เพลงนี้เป็นเพลงของ ${N.old} คืนนี้ฉันพยายามรักษามันไว้ ด้วยความรักทั้งหมดที่แฟน ๆ มอบให้เพลงนี้`]],
  rise:[[`Last year “${T}” was #${z&&z.prev}. To come all the way up to #${R}… I'm really speechless.`,`ปีที่แล้ว “${T}” อยู่อันดับ ${z&&z.prev} การขึ้นมาถึงอันดับ ${R} ได้… ฉันพูดไม่ออกจริง ๆ`]],
  new:[[`The first Request Hour for “${T}” and it's #${R}! ${V} votes… thank you, everyone!`,`Request Hour ครั้งแรกของ “${T}” ก็ได้อันดับ ${R} เลย! ${V} โหวต… ขอบคุณทุกคนนะคะ!`]],
  first:[[`Our very first Request Hour… and “${T}” is #${R}. I will never forget this night.`,`Request Hour ครั้งแรกของพวกเรา… และ “${T}” ได้อันดับ ${R} ฉันจะไม่มีวันลืมคืนนี้เลย`],[`I didn't know what to expect from the first Request Hour. ${V} votes for “${T}” — now I know how much you love it.`,`ไม่รู้เลยว่า Request Hour ครั้งแรกจะเป็นยังไง ${V} โหวตให้ “${T}” ตอนนี้รู้แล้วว่าทุกคนรักเพลงนี้มากแค่ไหน`]],
  cen:[[`Standing at the center of “${T}” again, I remembered the day I first got this position. Thank you for letting me come back here.`,`ได้ยืนเซ็นเตอร์ของ “${T}” อีกครั้ง ทำให้นึกถึงวันแรกที่ได้ตำแหน่งนี้ ขอบคุณที่ให้ฉันได้กลับมาตรงนี้อีกครั้ง`],[`“${T}” is the song that made me who I am. Being its center at #${R} tonight… I'm so proud.`,`“${T}” คือเพลงที่ทำให้ฉันเป็นฉันในวันนี้ ได้เป็นเซ็นเตอร์ของมันที่อันดับ ${R} คืนนี้… ภูมิใจมากเลยค่ะ`]],
  back:[[`“${T}” came back to the ranking! I'm so happy it isn't forgotten.`,`“${T}” กลับมาติดอันดับอีกครั้ง! ดีใจมากที่ทุกคนไม่ลืมเพลงนี้`]],
  single:[[`You keep supporting “${T}” long after its release. Hearing everyone sing along tonight — this is why I stand on stage.`,`ทุกคนยังสนับสนุน “${T}” แม้จะผ่านมานานแล้ว ได้ยินทุกคนร้องตามคืนนี้ นี่แหละคือเหตุผลที่ฉันยืนบนเวที`],[`${V} votes for “${T}”. I'll make sure this song keeps growing with all of you.`,`${V} โหวตให้ “${T}” ฉันจะทำให้เพลงนี้เติบโตไปพร้อมกับทุกคนนะคะ`]],
  stage:[[`“${T}” was born on the theater stage of ${N.stage}. Tonight it's #${R} on the biggest stage of the year.`,`“${T}” เกิดบนเวทีเธียเตอร์ของ ${N.stage} คืนนี้มันได้อันดับ ${R} บนเวทีที่ใหญ่ที่สุดของปี`]],
  gen:[[`#${R}… ${V} votes. I can't believe it. Thank you for loving “${T}” this much!`,`อันดับ ${R}… ${V} โหวต ยังไม่อยากเชื่อเลย ขอบคุณที่รัก “${T}” ขนาดนี้นะคะ!`],[`Every vote is someone saying “I want to see it again”. We heard you. Thank you!`,`ทุกโหวตคือเสียงของใครสักคนที่บอกว่า “อยากดูอีกครั้ง” พวกเราได้ยินแล้วนะคะ ขอบคุณค่ะ!`]]};
 used=used||new Set();let txt=null,r=mulb(rhSeedN(C.id+it.id+m.id));
 // the most specific story first; a line already used in this show is never used again (tracked by template, not by the filled-in text)
 for(const k of ctx){const L=(LIB[k]||[]).map((x,i)=>[k+i,x]).filter(([id])=>!used.has(id));if(L.length){const[id,x]=L[Math.floor(r()*L.length)];used.add(id);txt=x;break}}if(!txt)txt=LIB.gen[0];
 return{m,why:sp.why,en:txt[0],th:txt[1]}}
// the three speeches of a show never repeat a line: ranks #3 → #1 are written in order
function rhSpeechFor(C,p,set,idx){const used=new Set(),R=set.items[idx].rh.r;let out=null;set.items.map((it,i)=>[it,i]).filter(([it])=>it.rh&&it.rh.r<=3&&it.rh.r>=R).sort((a,b)=>b[0].rh.r-a[0].rh.r).forEach(([it,i])=>{const sp=rhSpeech(C,p,set,i,used);if(i==idx)out=sp});return out}
// ---- big-screen show: ranks, speeches ------------------------------------------------------------------------------------------
{const f=ccShSteps;ccShSteps=function(){const St=f.apply(this,arguments),out=[];St.forEach(z=>{out.push(z);if(z.k=='song'&&z.C&&z.C.rh&&z.it&&z.it.rh){z.lb='#'+z.it.rh.r;if(z.it.rh.r<=3)out.push({k:'rhsp',qi:z.qi,C:z.C,p:z.p,set:z.set,it:z.it,idx:z.idx})}});return out}}
{const f=ccShHtml;ccShHtml=function(){let h=f.apply(this,arguments);try{const s=ui.ccsh,St=ccShSteps(s.q),i=Math.min(s.i,St.length-1),z=St[i];if(!z||!z.C||!z.C.rh)return h;const th=rhTh();
 const swap=body=>{const a=h.indexOf('<div class="gebody"'),b=h.indexOf('<div class="geact">');if(a<0||b<0)return h;const c=h.indexOf('>',a)+1;return h.slice(0,c)+body+'</div>'+h.slice(b)};
 if(z.k=='song'&&z.it.rh){const kick=`<div class="gekicker">${z.lb}</div>`;h=h.replace(kick,`<div class="gekicker rhkick">REQUEST HOUR · <b>#${z.it.rh.r}</b> · ${(z.it.rh.v||0).toLocaleString()} ${th?'โหวต':'votes'}</div>`)}
 else if(z.k=='rhsp'){const sp=rhSpeechFor(z.C,z.p,z.set,z.idx);if(!sp)return h;const m=sp.m,cd=ccCzFor(z.C,z.set,z.idx,m.id),a=ap(m);
  h=swap(`<div class="gestage"><div class="gekicker">#${z.it.rh.r} · ${esc(z.it.title)} · ${th?'สุนทรพจน์':'Speech'}</div><div class="rhspk"><svg viewBox="10 -2 80 200" width="150">${fig(m,{pose:3,of:a.of,oh:a.oh,ac:a.ac,ex:z.it.rh.r==1?3:6,...(cd?{cd}:{})})}</svg><div class="rhbub"><b>${esc(m.name)}</b><small>${sp.why=='center'?(th?'เซ็นเตอร์ดั้งเดิม':'original center'):sp.why=='orig'?(th?'สมาชิกดั้งเดิม':'original member'):(th?'ผู้แสดงในคืนนี้':'tonight\'s performer')}</small><p>“${esc(th?sp.th:sp.en)}”</p></div></div></div>`)}
 }catch(e){console.error(e)}return h}}
// ---- records: performed lineups go into the Request Hour history (the songs' original history is never changed) ----------------------
{const f=ccPerform;ccPerform=function(C,p){const r=f.apply(this,arguments);try{const E=rhOfC(C);if(E&&p&&p.res&&!p.res.err){const H=rhS().hist.find(h=>h.eid==E.id);const set=C.sets[p.res.sid]||p.res.set;if(H&&set){
 if(!H.perfs.some(x=>x.pid==p.id))H.perfs.push({pid:p.id,no:p.no,day:p.res.day??(C.start+p.d),ranks:p.rhR||null,mc:set.items.filter(x=>x.k=='mc').length,enc:set.items.filter(x=>x.enc).map(x=>x.title)});
 set.items.forEach(it=>{if(it.rh)H.lineups[it.gid+':'+it.song]=rhPerfIds(C,p,it)})}}}catch(e){console.error(e)}return r}}
{const f=ccFinish;ccFinish=function(C){const r=f.apply(this,arguments);try{const E=rhOfC(C);if(E&&E.status=='concert'){E.status='done';E.log.push({d:S.day,t:'done'})}}catch(e){console.error(e)}return r}}
// if the concert is cancelled the Request Hour still keeps its results
{const f=ccCancel;ccCancel=function(id){const r=f.apply(this,arguments);try{const C=ccGet(id),E=rhOfC(C);if(E&&(C.status=='cancel'||C.status=='cancelled')&&E.status=='concert'){E.status='done';E.log.push({d:S.day,t:'cancel'})}}catch(e){}return r}}
