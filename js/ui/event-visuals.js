// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Event images & Roadshow single synchronization
// -------------------------------------------------------------------------------------
//  1) Event images. Release Day Mini Concert, Roadshow and Handshake Event each get ONE
//     image. When the event first takes place, an image record is stored on the event
//     (ev.img) and copied to its history records (single promo records, Roadshow history):
//        { v, k:'release'|'road'|'hs', rid, song, t:single title, loc, vt, day, center,
//          m:[{id, n, h, ap, c:costumeIndex|null, of, oh}], cd:[costume design snapshots] }
//     The record holds who took part, how each idol looked and the costume of the single's
//     title-track Senbatsu at that moment, so the picture is drawn identically every time
//     (also after save/load), even if designs or looks change later. Rewards and results
//     are untouched: the record is only a description of the picture.
//  2) Roadshows always promote the LATEST RELEASED single. A single in production does not
//     count until its Release Day. The per-location "once per single" rule is the original
//     one (keyed by single), so locations open again for each new release while Regional
//     Fanbase Growth and Roadshow history keep accumulating.
// =====================================================================================
const latestSingle=()=>(S&&S.singles&&S.singles.length)?S.singles.reduce((a,b)=>((b.relDay??b.day??0)>=(a.relDay??a.day??0)?b:a)):null;

// ---- image records -------------------------------------------------------------------
function evCostume(o,m){const cd=o&&typeof czFor=='function'?czFor(o,m.id):null;if(cd)return{cd};const c=o&&o.cid!=null&&COS[o.cid];if(c&&o.cid!==(typeof CZ_COS!='undefined'?CZ_COS:-1))return{of:c[1],oh:o.coh!=null?o.coh:c[2]};const a=ap(m);return{of:a.of,oh:a.oh}}
function evSpec(k,rid,songId,ids,ex={}){const o=songId&&S.songs[songId],keys=[],cds=[];
 const m=(ids||[]).map(get).filter(Boolean).map(mm=>{const c=evCostume(o,mm);let ci=null;if(c.cd){const key=JSON.stringify(c.cd);ci=keys.indexOf(key);if(ci<0){keys.push(key);cds.push(JSON.parse(key));ci=cds.length-1}}return{id:mm.id,n:mm.name,h:mm.hue|0,ap:JSON.parse(JSON.stringify(ap(mm))),c:ci,of:c.of,oh:c.oh}});
 return{v:1,k,eid:ex.eid||null,rid:rid||null,song:songId||null,t:ex.t||'',loc:ex.loc||'',vt:ex.vt||'',day:ex.day??S.day,center:o&&o.center||null,m,cd:cds,retro:ex.retro?1:undefined}}
const evSingle=rid=>S.singles.find(s=>s.rid==rid);
function evRoadSpec(ev,retro){const x=evSingle(ev.rid),l=RSL[ev.loc||ev.locId];return evSpec('road',ev.rid,x?x.mainId:null,ev.members,{t:x?x.title:(ev.st||''),loc:l?l.n:(ev.loc||''),vt:l?l.vt:'',day:ev.day,retro,eid:ev.id})}
// Handshake image = Top 5 participants by New Fans Gained (ties: interactions, popularity, member ID).
// Only the picture is limited; every participant's results stay exactly as calculated.
function evHsTop(ev,P){let rank;if(P&&Array.isArray(P.rows)&&P.rows.length)rank=P.rows.map(r=>({id:r.mid,g:r.gain||0,i:r.inter||0}));
 else{const ids=[...new Set([...((ev.r1&&ev.r1.present)||[]),...((ev.r2&&ev.r2.present)||[])])];rank=(ids.length?ids:(ev.members||[])).map(id=>({id,g:0,i:0}))}
 rank.forEach(x=>{const m=get(x.id);x.p=m?m.pop:0});rank.sort((a,b)=>b.g-a.g||b.i-a.i||b.p-a.p||a.id-b.id);return rank.slice(0,5)}
function evHsSpec(ev,retro){const x=evSingle(ev.rid),top=evHsTop(ev,ev.plan||ev.res||null),sp=evSpec('hs',ev.rid,x?x.mainId:null,top.map(t=>t.id),{t:x?x.title:(ev.st||''),day:ev.day,retro,eid:ev.id});sp.top5=1;sp.rank=top.map(t=>({id:t.id,g:t.g}));return sp}
// upgrade an older handshake image (all members) to the Top 5, keeping the looks/costumes it recorded
function evHsUpgrade(sp,ev){if(!sp||sp.k!='hs'||sp.top5)return;const top=evHsTop(ev,ev.plan||ev.res||null),byId=new Map(sp.m.map(z=>[z.id,z]));let m=top.map(t=>byId.get(t.id)).filter(Boolean);if(!m.length)m=sp.m.slice(0,5);sp.m=m;sp.rank=top.filter(t=>byId.has(t.id)).map(t=>({id:t.id,g:t.g}));sp.top5=1;if(sp.eid==null)sp.eid=ev.id;EV_SVG.delete(sp)}
// attach exactly once, when the event first happens
const _evRsRun=rsRun;rsRun=function(ev,part){if(ev&&!ev.img&&!ev[('d'+part)])try{ev.img=evRoadSpec(ev)}catch(e){}return _evRsRun.apply(this,arguments)};
const _evHsRun=hsRun;hsRun=function(ev,part){const r=_evHsRun.apply(this,arguments);if(ev&&ev.done&&!(ev.img&&ev.img.top5))try{ev.img=evHsSpec(ev)}catch(e){}return r};
const _evHsRun2=hsRun2;hsRun2=function(ev,part){const r=_evHsRun2.apply(this,arguments);if(ev&&ev.done&&!(ev.img&&ev.img.top5))try{ev.img=evHsSpec(ev)}catch(e){}return r};
const _evConcert=holdConcert;holdConcert=function(p,x){const ev=_evConcert.apply(this,arguments);if(ev&&!ev.img)try{ev.img=evSpec('release',x&&x.rid,p.mainId,(ev.result&&ev.result.members)||ev.members,{t:x?x.title:p.title,day:S.day,eid:ev.id})}catch(e){}return ev};
// copy image records to history; give events from older saves one image built from their record
function evSync(){if(!S||!S.singles)return;const cal=S.cal||[];
 cal.forEach(e=>{if(e.img&&e.img.eid==null)e.img.eid=e.id;if(e.type=='handshake'&&e.img)evHsUpgrade(e.img,e)});
 S.singles.forEach(x=>(x.promo||[]).forEach(r=>{if(r.img){if(r.img.eid==null)r.img.eid=r.id;if(r.type=='handshake')evHsUpgrade(r.img,{...r,plan:r.res&&r.res.rows?r.res:null})}}));
 S.singles.forEach(x=>{(x.promo||[]).forEach(r=>{if(r.img)return;const src=cal.find(e=>e.id==r.id&&e.img)||(r.type=='road'&&typeof rsGet=='function'&&rsGet(r.id));if(src&&src.img){r.img=src.img;return}
  try{if(r.type=='concert')r.img=evSpec('release',x.rid,x.mainId,(r.res&&r.res.members)||r.members,{t:x.title,day:r.day,retro:1});else if(r.type=='road'&&r.v==2)r.img=evRoadSpec({...r,loc:r.locId,st:x.title,rid:x.rid},1);else if(r.type=='handshake')r.img=evHsSpec({...r,rid:x.rid,st:x.title},1)}catch(e){}})});
 if(S.rs&&S.rs.hist)Object.values(S.rs.hist).forEach(H=>H.forEach(h=>{if(h.img)return;const src=cal.find(e=>e.id==h.id&&e.img)||S.singles.flatMap(x=>x.promo||[]).find(r=>r.id==h.id&&r.img);h.img=src?src.img:evRoadSpec(h,1)}))}
const evImgOf=id=>{const cal=(S.cal||[]).find(e=>e.id==id&&e.img);if(cal)return cal.img;const r=S.singles.flatMap(x=>x.promo||[]).find(r=>r.id==id&&r.img);if(r)return r.img;const h=S.rs&&Object.values(S.rs.hist).flat().find(h=>h.id==id&&h.img);return h?h.img:null};

// ---- drawing ---------------------------------------------------------------------------
// Characters are grounded: each idol's sole line is computed from her own leg length, then
// her feet are placed on the floor of the stage drawn in the same picture (rows go back in
// depth: smaller and higher), with a contact shadow under the feet.
const EV_SVG=new WeakMap();
const evT=s=>typeof tr=='function'?tr(s):s;
const EV_POSES=[2,1,6,8,5,4,9,14,0,7,12,2,1,6];   // standing performance poses (no sitting / kneeling)
function evFoot(z){try{return 80+94*dz({id:z.id,hue:z.h,ap:z.ap}).lf+9.4}catch(e){return 183}}
function evFigOne(sp,z,pose,ex,cx,fy,s,shadow=1){const mem={id:z.id,name:z.n,hue:z.h,ap:z.ap,_x:1},cd=z.c!=null&&sp.cd?sp.cd[z.c]:null;let g='';
 try{g=fig(mem,{pose,of:z.of!=null?z.of:z.ap.of,oh:z.oh!=null?z.oh:z.ap.oh,ac:z.ap.ac,ex,...(cd?{cd}:{})})}catch(e){g=''}
 return(shadow?`<ellipse cx="${cx.toFixed(1)}" cy="${(fy-.5).toFixed(1)}" rx="${(21*s).toFixed(1)}" ry="${(4.6*s).toFixed(1)}" fill="#0b0618" opacity=".32"/>`:'')+`<g class="evm" data-id="${z.id}" data-fy="${fy}" transform="translate(${(cx-50*s).toFixed(1)} ${(fy-evFoot(z)*s).toFixed(1)}) scale(${s.toFixed(3)})">${g}</g>`}
function evOrder(sp){const ord=[...sp.m],ci=ord.findIndex(z=>z.id==sp.center);if(ci>0){const[c]=ord.splice(ci,1);ord.unshift(c)}return ord}
// center-out slot order so the Center stands in the middle of the front row
function evSlots(n){const mid=Math.floor((n-1)/2),o=[mid];for(let d=1;o.length<n;d++){if(mid+d<n)o.push(mid+d);if(mid-d>=0&&o.length<n)o.push(mid-d)}return o}
function evStageRows(sp,G,seed){const ord=evOrder(sp),N=ord.length;if(!N)return'';const r=mulb(seed);const front=N<=G.single?ord:ord.slice(0,Math.ceil(N/2)),back=N<=G.single?[]:ord.slice(front.length);
 const row=(L,g,first)=>{const n=L.length,w=g.x1-g.x0,step=w/n,s=Math.min(g.smax,step/66),sl=evSlots(n),xs=[];L.forEach((z,i)=>xs.push([z,g.x0+step*(sl[i]+.5),i]));
  // draw from the edges toward the middle so the Center is on top
  return xs.sort((a,b)=>Math.abs(b[1]-400)-Math.abs(a[1]-400)).map(([z,cx,i])=>{const pose=first&&i==0?13:EV_POSES[(i*3+Math.floor(r()*5))%EV_POSES.length];return evFigOne(sp,z,pose,[1,3,11,2][(i+Math.floor(r()*4))%4],cx,g.y,s)}).join('')};
 return(back.length?row(back,G.back,0):'')+row(front,back.length?G.front:G.one,1)}
function evGlowCrowd(rows,seed){const r=mulb(seed),hair=['#2b1f2e','#3b2418','#5b3a29','#1e1a28','#6e3414','#45558a','#8f4c33','#c9a23a'],shirt=['#f7bcd2','#c9b6ef','#a9d8f5','#fff4c8','#ffffff','#9fe0c0','#f5a3c4'],glow=['#ff6fae','#b98bff','#5fc8ff','#ffe45c','#7bf0b4','#ff9d5c'];let s='';
 rows.forEach(([y,hr,n,dark])=>{for(let i=0;i<n;i++){const x=(i+.5)*(820/n)-10+(r()-.5)*(600/n),yy=y+(r()-.5)*hr*.6,hc=dark?mixc(hair[i%hair.length],'#1a1030',.35):hair[Math.floor(r()*hair.length)],sc=dark?mixc(shirt[i%shirt.length],'#2a2350',.55):shirt[Math.floor(r()*shirt.length)],g=glow[Math.floor(r()*glow.length)],side=r()<.5?-1:1,up=r();
  s+=`<path d="M${(x-hr*1.5).toFixed(1)} ${(yy+hr*4).toFixed(1)}Q${(x-hr*1.6).toFixed(1)} ${(yy+hr*1.1).toFixed(1)} ${x.toFixed(1)} ${(yy+hr*.9).toFixed(1)}Q${(x+hr*1.6).toFixed(1)} ${(yy+hr*1.1).toFixed(1)} ${(x+hr*1.5).toFixed(1)} ${(yy+hr*4).toFixed(1)}Z" fill="${sc}"/>`;
  const ax=x+side*hr*1.05,ay=yy+hr*1.3,hx=x+side*hr*(1.4+up*.8),hy=yy-hr*(1.1+up*1.2);
  s+=`<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${hx.toFixed(1)} ${hy.toFixed(1)}" stroke="${sc}" stroke-width="${(hr*.55).toFixed(1)}" stroke-linecap="round"/>`;
  if(r()<.82){const tx=hx+side*hr*.25,ty=hy-hr*1.5;s+=`<path d="M${hx.toFixed(1)} ${hy.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="${g}" stroke-width="${(hr*.32).toFixed(1)}" stroke-linecap="round" opacity=".55" style="filter:blur(${(hr*.12).toFixed(1)}px)"/><path d="M${hx.toFixed(1)} ${hy.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="${mixc(g,'#ffffff',.45)}" stroke-width="${(hr*.17).toFixed(1)}" stroke-linecap="round"/>`}
  else s+=`<circle cx="${hx.toFixed(1)}" cy="${(hy-hr*.6).toFixed(1)}" r="${(hr*.9).toFixed(1)}" fill="#fff" stroke="${g}" stroke-width="${(hr*.14).toFixed(1)}"/><path d="M${hx.toFixed(1)} ${(hy-hr*.25).toFixed(1)}c${(-hr*.7).toFixed(1)} ${(-hr*.5).toFixed(1)} ${(-hr*.35).toFixed(1)} ${(-hr*1.05).toFixed(1)} 0 ${(-hr*.6).toFixed(1)}c${(hr*.35).toFixed(1)} ${(-hr*.45).toFixed(1)} ${(hr*.7).toFixed(1)} ${(hr*.1).toFixed(1)} 0 ${(hr*.6).toFixed(1)}z" fill="${g}"/>`;
  s+=`<ellipse cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" rx="${hr.toFixed(1)}" ry="${(hr*1.05).toFixed(1)}" fill="${hc}"/><path d="M${(x-hr*.7).toFixed(1)} ${(yy-hr*.55).toFixed(1)}q${(hr*.7).toFixed(1)} ${(-hr*.45).toFixed(1)} ${(hr*1.3).toFixed(1)} ${(hr*.1).toFixed(1)}" stroke="#ffffff" stroke-width="${(hr*.12).toFixed(1)}" fill="none" opacity="${dark?.12:.3}"/>`}});return s}
const evLabel=(label,t,y=12)=>`<g><rect x="12" y="${y}" width="${Math.min(520,90+((label+t).length*7.2))}" height="44" rx="12" fill="#fffaf3" opacity=".93"/><text x="26" y="${y+19}" font-family="M PLUS Rounded 1c,Mitr,sans-serif" font-size="13" font-weight="800" fill="#c76a95">${esc(label)}</text><text x="26" y="${y+37}" font-family="M PLUS Rounded 1c,Mitr,sans-serif" font-size="14" font-weight="800" fill="#4b3a5e">${esc(t||'')}</text></g>`;
// ---- Release Day Mini Concert: indoor concert stage ----
function evReleaseSvg(sp){const seed=(sp.day|0)*31+sp.m.length;let s=`<defs><linearGradient id="evrb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1638"/><stop offset="1" stop-color="#3b2a6e"/></linearGradient><linearGradient id="evrf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3c86"/><stop offset="1" stop-color="#6e5bb0"/></linearGradient><linearGradient id="evled" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fc0"/><stop offset=".5" stop-color="#b98bff"/><stop offset="1" stop-color="#6fc8ff"/></linearGradient><radialGradient id="evpool"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient></defs>
 <rect width="800" height="450" fill="url(#evrb)"/><rect x="0" y="0" width="800" height="22" fill="#2a2350"/>${[...Array(9)].map((_,i)=>`<circle cx="${110+i*72}" cy="16" r="7" fill="#fff6d6"/>`).join('')}
 <rect x="182" y="34" width="436" height="128" rx="8" fill="#0d0a1f" stroke="#4a4166" stroke-width="5"/><rect x="190" y="42" width="420" height="112" rx="5" fill="url(#evled)" opacity=".85"/><text x="400" y="110" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="40" fill="#fff" opacity=".9">LIVE ✦ BLOOM</text><text x="400" y="138" text-anchor="middle" font-family="M PLUS Rounded 1c,sans-serif" font-size="15" font-weight="800" fill="#fff" opacity=".85">${esc(sp.t||'')}</text>
 <path d="M0 0H96Q78 120 92 250Q60 300 70 372H0Z" fill="#8e3566"/><path d="M800 0H704Q722 120 708 250Q740 300 730 372H800Z" fill="#8e3566"/>${[...Array(6)].map((_,i)=>`<path d="M${i*15} 0Q${i*15+12} 180 ${i*10} 372M${800-i*15} 0Q${788-i*15} 180 ${800-i*10} 372" stroke="#6e244e" stroke-width="4" fill="none" opacity=".7"/>`).join('')}
 <path d="M122 232H678L770 340H30Z" fill="url(#evrf)"/>${[...Array(13)].map((_,i)=>{const t=i/12;return`<path d="M${(122+556*t).toFixed(0)} 232L${(30+740*t).toFixed(0)} 340" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>`}).join('')}<path d="M100 258H700M70 292H730" stroke="#ffffff" stroke-opacity=".06" stroke-width="2"/>
 <ellipse cx="400" cy="318" rx="210" ry="24" fill="url(#evpool)"/><ellipse cx="220" cy="300" rx="90" ry="14" fill="url(#evpool)" opacity=".6"/><ellipse cx="580" cy="300" rx="90" ry="14" fill="url(#evpool)" opacity=".6"/>
 <rect x="30" y="340" width="740" height="30" fill="#241c45"/>${[...Array(37)].map((_,i)=>`<circle cx="${40+i*20}" cy="355" r="2.6" fill="${['#ff8fc0','#b98bff','#6fc8ff','#ffe45c'][i%4]}"/>`).join('')}`;
 s+=evStageRows(sp,{single:7,one:{y:330,x0:80,x1:720,smax:1.02},front:{y:332,x0:70,x1:730,smax:1},back:{y:266,x0:178,x1:622,smax:.78}},seed);
 s+=[[400,0,400,230],[180,0,240,300],[620,0,560,300]].map(([x,y,tx,ty])=>`<path d="M${x-12} ${y}L${x+12} ${y}L${tx+90} ${ty+60}L${tx-90} ${ty+60}Z" fill="#fffbe9" opacity=".09"/>`).join('');
 s+=`<rect y="370" width="800" height="80" fill="#140f2c"/>`+evGlowCrowd([[388,13,30,1],[420,17,22,1]],seed+3);
 return s+evLabel(evT('Release Day Mini Concert'),sp.t)}
// ---- Roadshow: outdoor stage in the city / place of the visit ----
const EV_LANDMARK={Tokyo:'tower',Fukuoka:'tower',Osaka:'castle',Aichi:'castle',Kumamoto:'castle',Kyoto:'pagoda',Nara:'pagoda',China:'pagoda',Hokkaido:'snow',Aomori:'snow',Nagano:'snow',Niigata:'snow',Okinawa:'sea',Kagoshima:'sea',Miyazaki:'sea',Maldives:'sea','Sri Lanka':'sea',Philippines:'sea',Kanagawa:'ferris',Chiba:'ferris',Shizuoka:'fuji',Yamanashi:'fuji',Hiroshima:'torii',Miyagi:'torii',Thailand:'temple',Cambodia:'temple',Myanmar:'temple',Laos:'temple','South Korea':'tower2',Taiwan:'tall',Malaysia:'twin',Singapore:'marina','United Arab Emirates':'tall',Qatar:'tall'};
function evLandmark(loc){const k=EV_LANDMARK[loc];if(k)return k;const L=['tower','castle','pagoda','fuji','ferris','snow','sea','temple'];let h=0;for(const c of loc||'')h=(h*31+c.charCodeAt(0))|0;return L[Math.abs(h)%L.length]}
function evLandmarkSvg(k,x){const c='#9fb0d8',d='#8798c4';switch(k){
 case'tower':return`<path d="M${x} 70L${x+14} 230H${x-14}Z" fill="${c}"/><path d="M${x-9} 150H${x+9}M${x-12} 190H${x+12}" stroke="#ff8f8f" stroke-width="5"/><rect x="${x-10}" y="120" width="20" height="10" fill="#ff8f8f"/>`;
 case'tower2':return`<rect x="${x-4}" y="80" width="8" height="150" fill="${c}"/><ellipse cx="${x}" cy="110" rx="16" ry="9" fill="${d}"/><path d="M${x} 50V82" stroke="${c}" stroke-width="3"/>`;
 case'tall':return`<path d="M${x-16} 230L${x-10} 60H${x+10}L${x+16} 230Z" fill="${c}"/>${[0,1,2,3,4,5].map(i=>`<path d="M${x-13} ${80+i*24}H${x+13}" stroke="${d}" stroke-width="3"/>`).join('')}<path d="M${x} 30V60" stroke="${c}" stroke-width="3"/>`;
 case'twin':return`<rect x="${x-26}" y="70" width="18" height="160" rx="6" fill="${c}"/><rect x="${x+8}" y="70" width="18" height="160" rx="6" fill="${c}"/><path d="M${x-8} 140H${x+8}" stroke="${d}" stroke-width="5"/>`;
 case'marina':return`${[-34,0,34].map(o=>`<rect x="${x+o-10}" y="100" width="20" height="130" fill="${c}"/>`).join('')}<path d="M${x-50} 98Q${x} 84 ${x+50} 98V104H${x-50}Z" fill="${d}"/>`;
 case'castle':return`<rect x="${x-40}" y="190" width="80" height="40" fill="#cfd6e8"/><path d="M${x-48} 192L${x} 168L${x+48} 192Z" fill="${d}"/><rect x="${x-28}" y="150" width="56" height="22" fill="#e6eaf4"/><path d="M${x-36} 152L${x} 128L${x+36} 152Z" fill="${d}"/><rect x="${x-16}" y="112" width="32" height="20" fill="#e6eaf4"/><path d="M${x-24} 114L${x} 92L${x+24} 114Z" fill="${d}"/>`;
 case'pagoda':return[0,1,2,3,4].map(i=>`<path d="M${x-36+i*5} ${214-i*30}L${x} ${200-i*30}L${x+36-i*5} ${214-i*30}Z" fill="${d}"/><rect x="${x-20+i*3}" y="${214-i*30}" width="${40-i*6}" height="16" fill="#cfd6e8"/>`).join('')+`<path d="M${x} 50V72" stroke="${d}" stroke-width="3"/>`;
 case'fuji':return`<path d="M${x-200} 230L${x-40} 90Q${x} 76 ${x+40} 90L${x+200} 230Z" fill="#a9b8de"/><path d="M${x-62} 110L${x-40} 90Q${x} 76 ${x+40} 90L${x+62} 110L${x+34} 104L${x+12} 116L${x-10} 104L${x-34} 116Z" fill="#fff"/>`;
 case'snow':return`<path d="M${x-240} 230L${x-110} 110L${x-30} 170L${x+60} 80L${x+240} 230Z" fill="#a9b8de"/><path d="M${x-132} 130L${x-110} 110L${x-90} 128ZM${x+38} 100L${x+60} 80L${x+86} 104L${x+62} 98Z" fill="#fff"/>`;
 case'sea':return`<rect x="0" y="200" width="800" height="30" fill="#7fc4e8"/><path d="M0 206Q200 200 400 206T800 206" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><path d="M${x} 230Q${x-4} 170 ${x+10} 130" stroke="#8a6a50" stroke-width="7" fill="none"/>${[[-40,-10],[30,-14],[-30,20],[40,16]].map(([a,b])=>`<path d="M${x+10} 130q${a/2} ${b-12} ${a} ${b}" stroke="#5fae6e" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}`;
 case'ferris':return`<circle cx="${x}" cy="140" r="70" fill="none" stroke="${c}" stroke-width="5"/>${[...Array(12)].map((_,i)=>{const a=i*Math.PI/6;return`<path d="M${x} 140L${(x+70*Math.cos(a)).toFixed(0)} ${(140+70*Math.sin(a)).toFixed(0)}" stroke="${c}" stroke-width="2"/><circle cx="${(x+70*Math.cos(a)).toFixed(0)}" cy="${(140+70*Math.sin(a)).toFixed(0)}" r="6" fill="${['#f7bcd2','#c9b6ef','#a9d8f5'][i%3]}"/>`}).join('')}<path d="M${x} 140L${x-40} 230M${x} 140L${x+40} 230" stroke="${c}" stroke-width="5"/>`;
 case'torii':return`<rect x="0" y="205" width="800" height="25" fill="#9fd0ea"/><rect x="${x-40}" y="120" width="10" height="100" fill="#e2455f"/><rect x="${x+30}" y="120" width="10" height="100" fill="#e2455f"/><path d="M${x-58} 116Q${x} 106 ${x+58} 116V126H${x-58}Z" fill="#c0392b"/><rect x="${x-48}" y="138" width="96" height="8" fill="#e2455f"/>`;
 case'temple':return[0,1,2].map(i=>`<path d="M${x-50+i*50} 230V${150-(i==1?30:0)}L${x-40+i*50+(i==1?-5:0)} ${120-(i==1?40:0)}L${x-30+i*50} ${150-(i==1?30:0)}V230Z" fill="#f3d27a"/>`).join('')+`<path d="M${x-70} 230V180H${x+70}V230Z" fill="#e8bf5e"/>`}return''}
function evRoadSvg(sp){const r=mulb((sp.loc||'x').length*977+(sp.day|0)),vt=sp.vt||'Outdoor Event Stage',lm=evLandmark(sp.loc),lx=lm=='fuji'||lm=='snow'?560:620;
 let s=`<defs><linearGradient id="evsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fbfff"/><stop offset=".75" stop-color="#d4ebff"/><stop offset="1" stop-color="#fff0e2"/></linearGradient><linearGradient id="evstg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dcf7"/><stop offset="1" stop-color="#c9b6ef"/></linearGradient></defs><rect width="800" height="450" fill="url(#evsky)"/><circle cx="90" cy="70" r="34" fill="#fff6d6" opacity=".95"/>`;
 [[200,52,1.1],[470,36,.8],[720,72,.9]].forEach(([x,y,z])=>s+=`<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="${48*z}" ry="${15*z}"/><ellipse cx="${x+24*z}" cy="${y-9*z}" rx="${28*z}" ry="${15*z}"/></g>`);
 s+=evLandmarkSvg(lm,lx);
 if(/Shopping|City|Square/.test(vt)||lm=='tower'||lm=='tall'||lm=='twin'||lm=='marina'||lm=='tower2'){let x=0;while(x<800){const w=40+r()*60,h=50+r()*80;if(!(x+w>lx-50&&x<lx+50)){s+=`<rect x="${x.toFixed(0)}" y="${(230-h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="hsl(${Math.floor(210+r()*60)} 30% ${Math.floor(80+r()*8)}%)"/>`;for(let wy=230-h+8;wy<224;wy+=14)for(let wx=x+5;wx<x+w-7;wx+=12)s+=`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="6" height="7" fill="#fff" opacity=".65"/>`}x+=w+3}}
 else for(let i=0;i<16;i++){const x=i*52+r()*16,h=40+r()*40;s+=`<ellipse cx="${x.toFixed(0)}" cy="${(226-h*.3).toFixed(0)}" rx="${(22+r()*8).toFixed(0)}" ry="${(h*.42).toFixed(0)}" fill="hsl(${110+Math.floor(r()*40)} 40% ${58+Math.floor(r()*10)}%)"/>`}
 s+=`<rect y="226" width="800" height="224" fill="${/Plaza|Square/.test(vt)?'#e6dacc':'#cfe2b2'}"/>`;
 // truss, speakers and stage platform (floor top: back edge y=226, front edge y=280)
 s+=`<g fill="none" stroke="#7d8294" stroke-width="8"><path d="M118 282V42M682 282V42M110 44H690"/></g><g stroke="#7d8294" stroke-width="2" fill="none" opacity=".85">${[...Array(10)].map((_,i)=>`<path d="M${122+i*56} 48l28 -9l28 9"/>`).join('')}</g>${[[150,46],[650,46]].map(([x,y])=>`<rect x="${x-12}" y="${y}" width="24" height="16" rx="3" fill="#3e3550"/><path d="M${x-10} ${y+16}L${x-70} 280L${x+70} 280L${x+10} ${y+16}Z" fill="#fffbe0" opacity=".12"/>`).join('')}`;
 s+=`<rect x="236" y="54" width="328" height="48" rx="10" fill="#f39ac1" stroke="#fff" stroke-width="3"/><text x="400" y="75" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="16" fill="#fff">ROADSHOW</text><text x="400" y="95" text-anchor="middle" font-family="M PLUS Rounded 1c,sans-serif" font-size="15" font-weight="800" fill="#fff">${esc(sp.loc||'')}</text>`;
 s+=`<rect x="56" y="186" width="54" height="96" rx="6" fill="#2c2742"/><rect x="690" y="186" width="54" height="96" rx="6" fill="#2c2742"/>${[[83,212],[83,252],[717,212],[717,252]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="14" fill="#4a4166"/><circle cx="${x}" cy="${y}" r="6" fill="#1b172a"/>`).join('')}`;
 s+=`<path d="M150 226H650L700 282H100Z" fill="url(#evstg)"/>${[...Array(11)].map((_,i)=>{const t=i/10;return`<path d="M${(150+500*t).toFixed(0)} 226L${(100+600*t).toFixed(0)} 282" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.5"/>`}).join('')}<rect x="100" y="282" width="600" height="36" fill="#4a4166"/>${[...Array(30)].map((_,i)=>`<rect x="${100+i*20}" y="282" width="10" height="36" fill="#ffffff" opacity=".06"/>`).join('')}<rect x="100" y="282" width="600" height="5" fill="#f39ac1"/>`;
 s+=evStageRows(sp,{single:7,one:{y:275,x0:128,x1:672,smax:.86},front:{y:277,x0:120,x1:680,smax:.84},back:{y:240,x0:186,x1:614,smax:.7}},(sp.day|0)*17+3);
 s+=evGlowCrowd([[322,13,26,0],[356,18,18,0],[404,25,12,0]],(sp.day|0)*7+(sp.loc||'').length);
 return s+evLabel(evT('Roadshow')+(sp.loc?' · '+sp.loc:''),sp.t)}
// ---- Handshake Event: Top 5 members, one booth each ----
function evHsSvg(sp){let s=`<defs><linearGradient id="evtab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7fb"/><stop offset="1" stop-color="#f7dce8"/></linearGradient></defs>`;
 try{s+=SCN('fanclub').replace('<svg ','<svg x="0" y="0" width="800" height="450" ')}catch(e){s+='<rect width="800" height="450" fill="#fde3ec"/>'}
 const L=sp.m.slice(0,5),n=L.length,W=152,x0=400-W*n/2,hue=[330,270,200,40,150];
 L.forEach((z,i)=>{const cx=x0+W*(i+.5);s+=`<rect x="${x0+W*i+6}" y="150" width="${W-12}" height="186" rx="10" fill="hsl(${hue[i%5]} 70% 92%)" stroke="#fff" stroke-width="3"/><rect x="${cx-58}" y="160" width="116" height="26" rx="13" fill="hsl(${hue[i%5]} 60% 72%)"/><text x="${cx}" y="178" text-anchor="middle" font-family="M PLUS Rounded 1c,Mitr,sans-serif" font-size="12.5" font-weight="800" fill="#fff">${esc(z.n)}</text><circle cx="${cx-62}" cy="173" r="11" fill="#ffd36a" stroke="#fff" stroke-width="2"/><text x="${cx-62}" y="177.5" text-anchor="middle" font-family="M PLUS Rounded 1c,sans-serif" font-size="12" font-weight="800" fill="#7a5a10">${i+1}</text>`});
 L.forEach((z,i)=>{const cx=x0+W*(i+.5);s+=evFigOne(sp,z,[4,1,3,4,2][i],[1,2,11,1,3][i],cx,478,1.42,0)});
 s+=`<rect x="${x0-8}" y="330" width="${W*n+16}" height="20" rx="6" fill="url(#evtab)" stroke="#e7c9d6" stroke-width="2"/><rect x="${x0-8}" y="350" width="${W*n+16}" height="100" fill="#f3d3e2"/>${L.map((z,i)=>i?`<rect x="${x0+W*i-4}" y="150" width="8" height="300" fill="#e9cfe0"/>`:'').join('')}`;
 L.forEach((z,i)=>{const cx=x0+W*(i+.5)+(i%2?-8:8),hc=['#2b1f2e','#5b3a29','#1e1a28','#6e3414','#3b2418'][i%5],sc=['#a9d8f5','#c9b6ef','#fff4c8','#9fe0c0','#f7bcd2'][i%5];
  s+=`<path d="M${cx-38} 450Q${cx-40} 398 ${cx} 394Q${cx+40} 398 ${cx+38} 450Z" fill="${sc}"/><path d="M${cx+24} 402Q${cx+30} 370 ${cx+14} 344" stroke="${sc}" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="${cx+13}" cy="341" r="7" fill="#f8d9c6"/><ellipse cx="${cx}" cy="374" rx="24" ry="25" fill="${hc}"/><path d="M${cx-14} 360q14 -10 28 0" stroke="#fff" stroke-width="3" fill="none" opacity=".25"/>`});
 s+=`<rect x="536" y="14" width="250" height="40" rx="12" fill="#f39ac1" stroke="#fff" stroke-width="3"/><text x="661" y="40" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="16" fill="#fff">HANDSHAKE EVENT</text>`;
 return s+evLabel(evT('Handshake Event')+' · TOP 5',sp.t)}
function evImgSvg(sp){if(!sp||!sp.m)return'';if(EV_SVG.has(sp))return EV_SVG.get(sp);const body=sp.k=='release'?evReleaseSvg(sp):sp.k=='road'?evRoadSvg(sp):evHsSvg(sp),label=sp.k=='release'?'Release Day Mini Concert':sp.k=='road'?'Roadshow':'Handshake Event';
 const out=`<svg viewBox="0 0 800 450" class="evimg" role="img" aria-label="${esc(evT(label)+' — '+(sp.t||''))}" xmlns="http://www.w3.org/2000/svg"><clipPath id="evclip"><rect width="800" height="450" rx="14"/></clipPath><g clip-path="url(#evclip)">${body}</g></svg>`;EV_SVG.set(sp,out);return out}
function evImgBlock(sp,cap){if(!sp)return`<div class="evph"><span>🎤</span>${esc(evT('No event image for this record yet.'))}</div>`;let svg='';try{svg=evImgSvg(sp)}catch(e){svg=''}
 if(!svg)return`<div class="evph"><span>🎤</span>${esc(evT('Event image unavailable.'))}</div>`;return`<figure class="evfig">${svg}<figcaption>${esc(cap||'')} ${sp.m.length} ${esc(evT('members'))}${sp.retro?' · '+esc(evT('reconstructed from the record')):''}</figcaption></figure>`}
function evOpen(id){const sp=evImgOf(id);ui.mod={t:'html',h:`<h2 class="ht">${esc(sp?({release:'Release Day Mini Concert',road:'Roadshow',hs:'Handshake Event'}[sp.k]):'Event')}</h2>${evImgBlock(sp,sp?sp.t:'')}`};render()}

// ---- show the images where events are reviewed ---------------------------------------
const _evRsRes=rsResHtml;rsResHtml=function(id,tab){const e=rsGet(id);return(e?evImgBlock(e.img||evImgOf(id),e.st||''):'')+_evRsRes.apply(this,arguments)};
const _evHsRes=hsResHtml;hsResHtml=function(P){let sp=null;const ev=(S.cal||[]).find(e=>e.type=='handshake'&&e.plan===P);if(ev)sp=ev.img;if(!sp){const r=S.singles.flatMap(x=>x.promo||[]).find(r=>r.type=='handshake'&&r.res===P);if(r)sp=r.img}return evImgBlock(sp,P&&P.title)+_evHsRes.apply(this,arguments)};
const _evPromo=singlePromo;singlePromo=function(x){evSync();let h=_evPromo.apply(this,arguments);const P=x.promo||[],cal=S.cal||[],items=[];
 const cc=P.find(r=>r.type=='concert');if(cc&&cc.img)items.push([cc.id,cc.img,'Release Day Mini Concert']);
 const hs=cal.find(e=>e.type=='handshake'&&e.rid==x.rid&&e.img)||P.find(r=>r.type=='handshake'&&r.img);if(hs)items.push([hs.id,hs.img,'Handshake Event']);
 P.filter(r=>r.type=='road'&&r.img).forEach(r=>items.push([r.id,r.img,'Roadshow · '+(r.loc||'')]));
 cal.filter(e=>e.type=='road'&&e.rid==x.rid&&e.img&&!P.some(r=>r.id==e.id)).forEach(e=>items.push([e.id,e.img,'Roadshow · '+((RSL[e.loc]||{}).n||'')+' (in progress)']));
 if(!items.length)return h;const gal=`<div class="evgal">${items.map(([id,sp,n])=>`<button class="evthumb" onclick="evOpen('${id}')" title="${esc(n)}">${evImgSvg(sp)}<small>${esc(n)}</small></button>`).join('')}</div>`;
 return h.replace(/(<\/h3><div class="st">Released [^<]*<\/div>)/,'$1'+gal)};
const _evRelease=doRelease;doRelease=function(){const n=S.singles.length;_evRelease.apply(this,arguments);evSync();if(S.singles.length>n&&ui.mod&&ui.mod.t=='html'){const x=S.singles[S.singles.length-1],cc=(x.promo||[]).find(r=>r.type=='concert');if(cc&&cc.img)ui.mod.h=ui.mod.h.replace('</h2>','</h2>'+evImgBlock(cc.img,x.title));render()}};

// ---- Roadshow: always the latest released single --------------------------------------
// switching to a new single starts a clean plan: setlists, members and dates of the old single are never carried over
function evRsSync(){const L=latestSingle();ui.rsp=ui.rsp||{rid:null,tab:'jp',loc:null,plan:false};if(L&&ui.rsp.rid!==L.rid)ui.rsp={rid:L.rid,tab:ui.rsp.tab||'jp',loc:ui.rsp.loc||null,plan:false};if(L&&ui.rs&&ui.rs.rid!==L.rid){ui.rs.rid=L.rid;ui.rs.sel=[]}return L}
const _evRoad=V.roadshow;V.roadshow=function(){const L=evRsSync();let h=_evRoad.call(V);
 return h.replace(/<label class="st">Promoting <select[\s\S]*?<\/select><\/label>/,L?`<span class="pill evpromo">📣 Promoting: <b>#${L.num||''} ${esc(L.title)}</b> <span class="st">· latest released single${S.pj&&S.pj.status=='producing'?` · next single "${esc(S.pj.title)}" is in production`:''}</span></span>`:'')};
const _evPlan=rsPlanStart;rsPlanStart=function(){evRsSync();return _evPlan.apply(this,arguments)};
const _evBook=rsBook;rsBook=function(){if(ui.rsp){const L=latestSingle();if(L&&ui.rsp.rid!==L.rid){evRsSync();toast('A new single was released: the Roadshow planner now promotes it. Please review the plan.','err');return render()}}return _evBook.apply(this,arguments)};
const _evPromoV=V.promo;V.promo=function(){evRsSync();return _evPromoV.call(V)};
// keep image records in history in step (cheap, idempotent)
const _evRender=render;render=function(){try{if(S&&!ui.t)evSync()}catch(e){}return _evRender.apply(this,arguments)};
