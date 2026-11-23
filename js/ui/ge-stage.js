// =====================================================================================
//  IDOLVERSE48: Select Bloom! — the General Election ceremony as a grand televised event (presentation only)
// -------------------------------------------------------------------------------------
//  · Wide shot: a huge stage — LED wall with the election branding, side screens, classical columns, a lighting
//    truss with beams, a central staircase rising to a gold throne, tiered seating and a penlight audience.
//  · Tiered seating: one individual seat for EVERY ranked member, by the election's own ranking groups — the last
//    group on the lowest, front level, each higher group on a higher level behind it, the first group (Senbatsu)
//    at the top. 1st place has the throne (only she). Seats are empty until the member's rank is announced; then
//    she sits there in her ceremony outfit. The stage grows with the number of ranked members (no overlap).
//  · Close-up: the announced member stands at a microphone stand under a spotlight; a gold / silver / bronze
//    result graphic shows every existing detail (rank, change badge, group / team, votes, election history,
//    Center, cape, speech, mood).
//  · The two permanent hosts (ge-hosts.js) open, introduce, react and close, alternating with their own voices.
//  Results, votes, steps and saved data are untouched: this file only re-draws js/ui/election.js's ceremony.
// =====================================================================================
const GX_W=1600,GX_CX=800,GX_GC=[['#f6d27a','#a87b22'],['#ff9ec4','#b8406e'],['#b9a6ff','#6a54c8'],['#8fe0d0','#2f9a86'],['#9cc8ff','#3d6fc0'],['#ffc49a','#c06a2f'],['#d6f08a','#7c9a22']];
const gxGC=gi=>GX_GC[gi%GX_GC.length];
const gxH=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h};
const gxR=n=>Math.round(n*10)/10;
// cached member drawings (the ceremony re-renders on every click)
const GX_FC=new Map();
function gxFig(e,id,rank,pose,w,ex){const k=[e.id,id,rank|0,pose|0,gxR(w),ex|0,(e.czS&&e.czS.name)||''].join('|');let v=GX_FC.get(k);if(v==null){v=geFig(e.snap[id],rank,{pose,w:gxR(w),e,ex});if(GX_FC.size>600)GX_FC.clear();GX_FC.set(k,v)}return v}
// ---- layout of the tiered seating --------------------------------------------------------------------------------------
function gxLayout(e){const R=e.final.rows.filter(r=>r.rank&&!r.withdrawn),win=R.find(r=>r.rank==1),G=e.groups.length,rows=[];
 for(let gi=0;gi<G;gi++){const ids=R.filter(r=>r.gi==gi&&r.rank!=1).sort((a,b)=>a.rank-b.rank);const nr=Math.ceil(ids.length/20),per=Math.ceil(ids.length/Math.max(1,nr));for(let k=0;k<ids.length;k+=per)rows.push({gi,first:k==0,L:ids.slice(k,k+per)})}
 const n=rows.length,T=392;rows.forEach((row,k)=>{row.sc=Math.max(.72,1-.045*(n-1-k));row.h=88*row.sc});let y=T+118;rows.forEach((row,k)=>{row.y=y;if(k+1<n)y+=rows[k+1].h});
 const floorY=(rows.length?rows[n-1].y:T+60)+64,stair=y0=>{const t=Math.max(0,Math.min(1,(y0-T)/Math.max(1,floorY-T)));return 96+t*58};
 rows.forEach((row,k)=>{const st=row.sc*48,hw=stair(row.y),off=k%2?st*.5:0;row.seats=row.L.map((r,i)=>{const side=i%2==0?-1:1,j=Math.floor(i/2);return{id:r.id,rank:r.rank,x:GX_CX+side*(hw+30*row.sc+j*st+st/2+off)}})});
 return{rows,T,floorY,H:floorY+322,win,stair}}
// ---- pieces -----------------------------------------------------------------------------------------------------------
function gxDefs(id){return`<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07051a"/><stop offset=".45" stop-color="#1b0f3c"/><stop offset="1" stop-color="#2c0f33"/></linearGradient>
 <linearGradient id="${id}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b8"/><stop offset=".45" stop-color="#e8b94a"/><stop offset="1" stop-color="#8a5a12"/></linearGradient>
 <linearGradient id="${id}led" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1260"/><stop offset=".5" stop-color="#5b1f8a"/><stop offset="1" stop-color="#1a2f7a"/></linearGradient>
 <linearGradient id="${id}beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8dc" stop-opacity=".55"/><stop offset="1" stop-color="#fff8dc" stop-opacity="0"/></linearGradient>
 <linearGradient id="${id}col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f8aa8"/><stop offset=".35" stop-color="#f4f1fb"/><stop offset=".7" stop-color="#c9c3dc"/><stop offset="1" stop-color="#6f6a88"/></linearGradient>
 <linearGradient id="${id}floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b1d5a"/><stop offset="1" stop-color="#120a24"/></linearGradient>
 <linearGradient id="${id}carp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a0b22"/><stop offset=".5" stop-color="#d0203f"/><stop offset="1" stop-color="#7a0b22"/></linearGradient>
 <radialGradient id="${id}halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff1b0" stop-opacity=".95"/><stop offset=".5" stop-color="#f3c85a" stop-opacity=".35"/><stop offset="1" stop-color="#f3c85a" stop-opacity="0"/></radialGradient>
 <radialGradient id="${id}spot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe6" stop-opacity=".8"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></radialGradient>
 <filter id="${id}blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter></defs>`}
function gxColumn(id,x,y0,y1,w){return`<g><rect x="${x-w*.62}" y="${y0}" width="${w*1.24}" height="${w*.32}" fill="url(#${id}gold)"/><circle cx="${x-w*.5}" cy="${y0+w*.42}" r="${w*.16}" fill="url(#${id}gold)"/><circle cx="${x+w*.5}" cy="${y0+w*.42}" r="${w*.16}" fill="url(#${id}gold)"/><rect x="${x-w/2}" y="${y0+w*.32}" width="${w}" height="${y1-y0-w*.6}" fill="url(#${id}col)"/>${[-.3,-.1,.1,.3].map(f=>`<line x1="${x+w*f}" y1="${y0+w*.5}" x2="${x+w*f}" y2="${y1-w*.35}" stroke="#7d7896" stroke-width="1.2" opacity=".55"/>`).join('')}<rect x="${x-w*.66}" y="${y1-w*.3}" width="${w*1.32}" height="${w*.3}" fill="url(#${id}gold)"/></g>`}
function gxThrone(id,x,y,s){return`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-46 4L-50 -96Q-52 -132 -24 -146Q-12 -170 0 -178Q12 -170 24 -146Q52 -132 50 -96L46 4Z" fill="url(#${id}gold)" stroke="#7a4f0c" stroke-width="2"/><path d="M-34 0L-37 -90Q-38 -118 -16 -128Q-6 -146 0 -150Q6 -146 16 -128Q38 -118 37 -90L34 0Z" fill="#b3122f"/><path d="M-26 -96Q0 -120 26 -96" stroke="#f3c85a" stroke-width="2.4" fill="none"/>
 <path d="M-14 -168L-8 -186L0 -174L8 -186L14 -168Z" fill="url(#${id}gold)" stroke="#7a4f0c" stroke-width="1.2"/><circle cx="0" cy="-160" r="5" fill="#e8213b" stroke="#fff2b8" stroke-width="1.4"/>
 <rect x="-62" y="-30" width="18" height="40" rx="6" fill="url(#${id}gold)" stroke="#7a4f0c" stroke-width="1.5"/><rect x="44" y="-30" width="18" height="40" rx="6" fill="url(#${id}gold)" stroke="#7a4f0c" stroke-width="1.5"/>
 <rect x="-48" y="-4" width="96" height="18" rx="7" fill="#c41a3a" stroke="#7a0b22" stroke-width="1.5"/><path d="M-50 14H50L44 52H-44Z" fill="url(#${id}gold)" stroke="#7a4f0c" stroke-width="1.5"/><path d="M-30 30H30" stroke="#7a4f0c" stroke-width="1.2" opacity=".6"/></g>`}
function gxChair(x,y,sc,col){return`<g><path d="M${x-12*sc} ${y-42*sc}Q${x} ${y-50*sc} ${x+12*sc} ${y-42*sc}V${y}H${x-12*sc}Z" fill="#fbf6ee" stroke="${col}" stroke-width="${1.6*sc}"/><rect x="${x-14*sc}" y="${y-2*sc}" width="${28*sc}" height="${6*sc}" rx="${2*sc}" fill="#f1e6d4" stroke="${col}" stroke-width="${sc}"/><path d="M${x-11*sc} ${y+4*sc}V${y+24*sc}M${x+11*sc} ${y+4*sc}V${y+24*sc}" stroke="${col}" stroke-width="${2*sc}"/></g>`}
function gxPlate(x,y,sc,rank,col){return`<g><rect x="${x-13*sc}" y="${y+25*sc}" width="${26*sc}" height="${12*sc}" rx="${3*sc}" fill="#120a24" stroke="${col}" stroke-width="${.8*sc}"/><text x="${x}" y="${y+34*sc}" text-anchor="middle" font-size="${9*sc}" font-weight="800" fill="${col}" font-family="sans-serif">${rank}</text></g>`}
function gxMic(x,y,s,lit,L){L=L||150*s;const t=y-L;return`<g><ellipse cx="${x}" cy="${y}" rx="${16*s}" ry="${4*s}" fill="#0b0b12" opacity=".85"/><path d="M${x-14*s} ${y}L${x} ${y-6*s}L${x+14*s} ${y}" stroke="#2a2a33" stroke-width="${2.4*s}" fill="none"/><rect x="${x-1.6*s}" y="${t}" width="${3.2*s}" height="${L-4*s}" fill="#34343f"/><rect x="${x-.6*s}" y="${t}" width="${1*s}" height="${L-4*s}" fill="#9a9ab0" opacity=".6"/><rect x="${x-3*s}" y="${t+L*.38}" width="${6*s}" height="${8*s}" rx="${1.5*s}" fill="#22222a"/>
 <path d="M${x} ${t}Q${x+1*s} ${t-8*s} ${x+3*s} ${t-13*s}" stroke="#2a2a33" stroke-width="${2.6*s}" fill="none"/><g transform="translate(${x+3.6*s} ${t-18*s}) rotate(-22)"><rect x="${-3.4*s}" y="${-1*s}" width="${6.8*s}" height="${14*s}" rx="${2.6*s}" fill="#1c1c24"/><ellipse cx="0" cy="${-1*s}" rx="${5*s}" ry="${6*s}" fill="#8d8f9e" stroke="#2d2d36" stroke-width="${.8*s}"/>${[-3,-1,1,3].map(d=>`<line x1="${(d-.6)*s}" y1="${-6*s}" x2="${(d+.6)*s}" y2="${4*s}" stroke="#4a4a56" stroke-width="${.4*s}"/>`).join('')}${lit?`<circle cx="0" cy="${8*s}" r="${.9*s}" fill="#5cff9b"/>`:''}</g></g>`}
function gxAudience(id,y0,H,seed){const r=mulb(seed|0),cols=['#ff7eb6','#7ee8ff','#ffe066','#c99bff','#ffffff','#ff9d5c','#8dff9e'];let s=`<rect x="0" y="${y0}" width="${GX_W}" height="${H-y0}" fill="#07040f"/>`;
 for(let row=0;row<5;row++){const yy=y0+24+row*((H-y0-20)/5),n=46+row*4,st=GX_W/n;for(let i=0;i<n;i++){const x=i*st+st/2+(row%2?st/2:0)+(r()-.5)*6,hr=7+row*1.6;s+=`<ellipse cx="${gxR(x)}" cy="${gxR(yy)}" rx="${gxR(hr)}" ry="${gxR(hr*1.12)}" fill="#160d26"/>`;
  if(r()<.78){const c=cols[Math.floor(r()*cols.length)],a=(r()-.5)*.9,len=18+row*3,tx=x+Math.sin(a)*len,ty=yy-hr-Math.cos(a)*len;s+=`<line x1="${gxR(x+(r()<.5?-hr:hr)*.6)}" y1="${gxR(yy-hr*.4)}" x2="${gxR(tx)}" y2="${gxR(ty)}" stroke="${c}" stroke-width="${2.6+row*.4}" stroke-linecap="round" opacity=".95"/><circle cx="${gxR(tx)}" cy="${gxR(ty)}" r="${4+row}" fill="${c}" opacity=".28"/>`}}}
 return s}
function gxTruss(id){let s=`<rect x="0" y="0" width="${GX_W}" height="16" fill="#1a1a24"/><rect x="0" y="16" width="${GX_W}" height="3" fill="#3a3a48"/>`;for(let i=0;i<22;i++){const x=40+i*72;s+=`<rect x="${x-8}" y="12" width="16" height="12" rx="3" fill="#2b2b36"/><circle cx="${x}" cy="24" r="4" fill="#fff6d0" opacity=".9"/>`}return s}
function gxBeam(id,x0,x1,y1,w,o){return`<path d="M${x0-6} 22L${x0+6} 22L${x1+w} ${y1}L${x1-w} ${y1}Z" fill="url(#${id}beam)" opacity="${o||.55}"/>`}
function gxLed(id,x,y,w,h,inner){return`<g><rect x="${x-6}" y="${y-6}" width="${w+12}" height="${h+12}" rx="6" fill="#0d0a18" stroke="url(#${id}gold)" stroke-width="3"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}led)"/>${Array.from({length:Math.floor(h/6)},(_,i)=>`<line x1="${x}" y1="${y+i*6+3}" x2="${x+w}" y2="${y+i*6+3}" stroke="#000" stroke-width=".8" opacity=".18"/>`).join('')}${inner}</g>`}
const gxTxt=(x,y,sz,t,o)=>{const fit=o&&o.fit,str=String(t),est=str.length*sz*.56;if(fit&&est>fit){sz=Math.max(14,sz*fit/est)}const tl=fit&&str.length*sz*.56>fit?` textLength="${fit}" lengthAdjust="spacingAndGlyphs"`:'';return gxTxt0(x,y,sz,str,o).replace('<text ','<text'+tl+' ')};
// long titles: two lines (split at the space nearest the middle)
function gxTxt2(x,y,sz,t,o){const str=String(t);if(str.length<=28)return gxTxt(x,y,sz,str,o);let k=-1,mid=str.length/2;for(let i=0;i<str.length;i++)if(str[i]==' '&&(k<0||Math.abs(i-mid)<Math.abs(k-mid)))k=i;if(k<0)k=Math.floor(mid);
 const a=str.slice(0,k).trim(),b=str.slice(k).trim(),s2=Math.min(sz*.62,(o.fit||600)/(Math.max(a.length,b.length)*.56));return gxTxt(x,y-s2*.62,s2,a,o)+gxTxt(x,y+s2*.5,s2,b,o)}
const gxTxt0=(x,y,sz,t,o)=>`<text x="${x}" y="${y}" text-anchor="${(o&&o.a)||'middle'}" font-size="${sz}" font-weight="${(o&&o.w)||800}" fill="${(o&&o.f)||'#fff'}" font-family="${(o&&o.ff)||'sans-serif'}" letter-spacing="${(o&&o.ls)||0}">${esc(t)}</text>`;
// ---- the wide shot -------------------------------------------------------------------------------------------------------
// o: {seated:Set(ids), throne:bool, mic:'empty'|id|null, screen:[big,small,kicker], hosts:'mix'|'lucia'|'both'|null, confetti}
function gxWide(e,o){const id='gx'+(++PTC[0]),Lo=gxLayout(e),{rows,T,floorY,H,win}=Lo,seated=o.seated||new Set();let s=gxDefs(id);
 s+=`<rect width="${GX_W}" height="${H}" fill="url(#${id}bg)"/><ellipse cx="${GX_CX}" cy="${T-40}" rx="620" ry="300" fill="url(#${id}halo)" opacity=".35"/>`;
 // sunburst behind the throne
 s+=`<g opacity=".55">${Array.from({length:28},(_,i)=>{const a=Math.PI*(i/27),x2=GX_CX+Math.cos(a)*560,y2=T-60-Math.sin(a)*330;return`<line x1="${GX_CX}" y1="${T-60}" x2="${gxR(x2)}" y2="${gxR(y2)}" stroke="#f3c85a" stroke-width="${i%2?2:5}" opacity="${i%2?.35:.6}"/>`}).join('')}</g>`;
 s+=gxTruss(id);
 // LED wall + side screens
 const [big,small,kick]=o.screen||[e.name,gpT('RANKING ANNOUNCEMENT CEREMONY','งานประกาศผลการจัดอันดับ'),`${S.co||''} · ${e.year||''}`];
 s+=gxLed(id,446,34,708,226,`${gxTxt(GX_CX,86,20,kick,{f:'#f6d7ff',w:700,ls:4,fit:680})}${gxTxt2(GX_CX,166,72,big,{f:`url(#${id}gold)`,ff:'serif',ls:2,fit:680})}${gxTxt(GX_CX,222,22,small,{f:'#ffe7a3',ls:6,fit:680})}`);
 const sideL=gxTxt(312,118,16,gpT('GENERAL ELECTION','เลือกตั้งทั่วไป'),{f:'#ffe7a3',ls:3})+gxTxt(312,168,30,'総選挙',{f:'#fff',ff:'serif'}),sideR=(o.side||[]).map((t,i)=>gxTxt(1288,112+i*42,i?16:28,String(t).slice(0,16),{f:i?'#f6d7ff':`url(#${id}gold)`})).join('')||gxTxt(1288,150,22,`${(e.final.rows.filter(r=>r.rank).length)} ${gpT('RANKED','อันดับ')}`,{f:`url(#${id}gold)`});
 s+=gxLed(id,232,58,160,170,sideL)+gxLed(id,1208,58,160,170,sideR);
 // columns
 [[60,62],[176,52]].forEach(([x,w])=>{s+=gxColumn(id,x,40,floorY,w)+gxColumn(id,GX_W-x,40,floorY,w)});
 // tiers: one stepped platform per row, drawn back to front
 const outer=640;rows.forEach(row=>{const c=gxGC(row.gi),hw=Lo.stair(row.y),yt=row.y+26*row.sc;[[-1],[1]].forEach(([sd])=>{const x0=sd<0?GX_CX-outer:GX_CX+hw,x1=sd<0?GX_CX-hw:GX_CX+outer;
  s+=`<rect x="${gxR(x0)}" y="${gxR(yt)}" width="${gxR(x1-x0)}" height="${gxR(floorY-yt)}" fill="#24143e"/><rect x="${gxR(x0)}" y="${gxR(yt)}" width="${gxR(x1-x0)}" height="${gxR(6*row.sc)}" fill="${c[0]}" opacity=".9"/><rect x="${gxR(x0)}" y="${gxR(yt+6*row.sc)}" width="${gxR(x1-x0)}" height="${gxR(3*row.sc)}" fill="${c[1]}" opacity=".7"/>`})});
 // staircase to the throne
 const ty=T+46,sb=Lo.stair(floorY);s+=`<path d="M${GX_CX-96} ${ty}H${GX_CX+96}L${GX_CX+sb} ${floorY}H${GX_CX-sb}Z" fill="#f4ecf8"/>`;
 for(let y=ty+14;y<floorY;y+=16){const hw=Lo.stair(y);s+=`<line x1="${gxR(GX_CX-hw)}" y1="${y}" x2="${gxR(GX_CX+hw)}" y2="${y}" stroke="#bfb2cc" stroke-width="1.4"/>`}
 s+=`<path d="M${GX_CX-34} ${ty}H${GX_CX+34}L${GX_CX+52} ${floorY}H${GX_CX-52}Z" fill="url(#${id}carp)" opacity=".92"/><path d="M${GX_CX-96} ${ty}L${GX_CX-sb} ${floorY}M${GX_CX+96} ${ty}L${GX_CX+sb} ${floorY}" stroke="url(#${id}gold)" stroke-width="5"/>`;
 // throne platform + throne
 s+=`<rect x="${GX_CX-150}" y="${T+40}" width="300" height="14" rx="4" fill="url(#${id}gold)"/><rect x="${GX_CX-130}" y="${T+28}" width="260" height="14" rx="4" fill="url(#${id}gold)" opacity=".9"/>`+gxThrone(id,GX_CX,T-6,1);
 if(o.throne&&win){const fw=78;s+=`<ellipse cx="${GX_CX}" cy="${T-40}" rx="160" ry="120" fill="url(#${id}spot)"/><g transform="translate(${GX_CX-fw/2} ${gxR(T-6-84*fw/80+8)})">${gxFig(e,win.id,1,10,fw,3)}</g>`}
 else s+=`<text x="${GX_CX}" y="${T-60}" text-anchor="middle" font-size="26" font-weight="900" fill="#fff2b8" font-family="serif">1</text>`;
 // ranking-group LED labels on the stairs
 rows.filter(r=>r.first).forEach(row=>{const c=gxGC(row.gi),g=e.groups[row.gi],Rg=geRanges(e)[row.gi],w=176*row.sc,h=26*row.sc,yy=row.y-46*row.sc;
  s+=`<rect x="${gxR(GX_CX-w/2)}" y="${gxR(yy)}" width="${gxR(w)}" height="${gxR(h)}" rx="${4*row.sc}" fill="#0d0a18" stroke="${c[0]}" stroke-width="${2*row.sc}"/>${gxTxt(GX_CX,gxR(yy+h*.48),gxR(11.5*row.sc),String(g?g.name:'').toUpperCase().slice(0,22),{f:c[0],ls:1})}${gxTxt(GX_CX,gxR(yy+h*.88),gxR(8.5*row.sc),`TOP ${Rg[0]} – ${Rg[1]}`,{f:'#fff',w:700})}`});
 // seats (back rows first)
 rows.forEach(row=>{const c=gxGC(row.gi);row.seats.forEach(st=>{s+=gxChair(gxR(st.x),gxR(row.y),row.sc,c[1])});
  row.seats.forEach(st=>{if(seated.has(st.id)){const fw=46*row.sc,top=e.final.rows.find(r=>r.id==st.id);s+=`<g transform="translate(${gxR(st.x-fw/2)} ${gxR(row.y-84*fw/80+6*row.sc)})">${gxFig(e,st.id,top&&top.top,10,fw,2)}</g>`}s+=gxPlate(gxR(st.x),gxR(row.y),row.sc,st.rank,c[0])})});
 // front stage
 const fy=floorY;s+=`<rect x="0" y="${fy}" width="${GX_W}" height="190" fill="url(#${id}floor)"/><rect x="0" y="${fy}" width="${GX_W}" height="5" fill="url(#${id}gold)"/><ellipse cx="${GX_CX}" cy="${fy+100}" rx="520" ry="50" fill="#fff" opacity=".04"/>${Array.from({length:40},(_,i)=>`<circle cx="${20+i*40}" cy="${fy+184}" r="3" fill="${['#ff7eb6','#ffe066','#7ee8ff'][i%3]}" opacity=".85"/>`).join('')}`;
 // beams
 const tgt=[];if(o.mic)tgt.push([GX_CX,fy+160,90]);if(o.throne)tgt.push([GX_CX,T+20,120]);if(o.hosts)tgt.push([235,fy+160,80]);if(!tgt.length)tgt.push([GX_CX,fy+120,260]);
 tgt.forEach(([x,y,w],k)=>{s+=gxBeam(id,x+(k%2?-260:260),x,y,w,.45)+gxBeam(id,x+(k%2?380:-380),x,y,w*.8,.3)});
 // hosts
 if(o.hosts){const hl=o.hosts;[['mix',170],['lucia',300]].forEach(([k,x])=>{const w=66,on=hl=='both'||hl==k;s+=`<ellipse cx="${x}" cy="${fy+160}" rx="56" ry="12" fill="#fff6d0" opacity="${on?.35:.12}"/><g transform="translate(${x-w/2} ${gxR(fy+160-w*198/80)})" opacity="${on?1:.82}">${gehFig(k,w)}</g><rect x="${x-46}" y="${fy+164}" width="92" height="18" rx="4" fill="#0d0a18" stroke="#e8b94a"/>${gxTxt(x,fy+177,12,gehName(k),{f:'#ffe7a3'})}`})}
 // microphone (centre front) and the member speaking
 if(o.mic){if(o.mic!='empty'){const r=e.final.rows.find(z=>z.id==o.mic),w=70;s+=`<ellipse cx="${GX_CX}" cy="${fy+160}" rx="70" ry="14" fill="#fff6d0" opacity=".4"/><g transform="translate(${GX_CX-w/2} ${gxR(fy+160-w*198/80)})">${gxFig(e,o.mic,r&&r.top,0,w,2)}</g>`}else s+=`<ellipse cx="${GX_CX}" cy="${fy+160}" rx="70" ry="14" fill="#fff6d0" opacity=".45"/>`;s+=gxMic(GX_CX,fy+164,.62,o.mic!='empty',112)}
 s+=gxAudience(id,fy+190,H,gxH(e.id));
 if(o.confetti)s+=gxConfetti(GX_W,H,gxH(e.id+'c'));
 return`<svg class="gxwide" viewBox="0 0 ${GX_W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(e.name)} stage">${s}</svg>`}
function gxConfetti(W,H,seed){const r=mulb(seed|0),c=['#ffd45a','#ff7eb6','#ffffff','#7ee8ff','#f3c85a'];let s='';for(let i=0;i<120;i++){const x=r()*W,y=r()*H*.75,w=4+r()*6;s+=`<rect x="${gxR(x)}" y="${gxR(y)}" width="${gxR(w)}" height="${gxR(w*.45)}" fill="${c[i%c.length]}" transform="rotate(${Math.round(r()*180)} ${gxR(x)} ${gxR(y)})" opacity=".9"/>`}return s}
// ---- close-up: a member at the microphone stand ---------------------------------------------------------------------------
function gxClose(e,r){const id='gc'+(++PTC[0]),W=1000,H=660,g=e.groups[r.gi],c=r.top?GE_CAPE[r.top]:null,gc=gxGC(Math.max(0,r.gi)),fw=330;let s=gxDefs(id);
 s+=`<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>`;
 s+=`<g filter="url(#${id}blur)" opacity=".8">${gxLed(id,150,20,700,190,`${gxTxt(500,110,76,'TOP '+r.rank,{f:`url(#${id}gold)`,ff:'serif'})}${gxTxt(500,170,26,String(g?g.name:'').toUpperCase(),{f:'#f6d7ff',ls:6,fit:640})}`)}
  ${gxColumn(id,60,10,520,56)}${gxColumn(id,940,10,520,56)}${Array.from({length:3},(_,k)=>Array.from({length:12},(_,i)=>{const x=110+i*70+(k%2?35:0),y=300+k*70;return i>4&&i<7?'':`<rect x="${x-14}" y="${y}" width="28" height="40" rx="6" fill="#efe4f5" opacity=".55"/><circle cx="${x}" cy="${y-6}" r="11" fill="${gc[0]}" opacity=".45"/>`}).join('')).join('')}</g>`;
 s+=`<path d="M420 0H580L780 ${H}H220Z" fill="url(#${id}beam)" opacity=".55"/><ellipse cx="500" cy="${H-18}" rx="230" ry="30" fill="url(#${id}spot)"/><rect y="${H-40}" width="${W}" height="40" fill="url(#${id}floor)"/><rect y="${H-40}" width="${W}" height="3" fill="url(#${id}gold)"/>`;
 // bokeh
 const rr=mulb(gxH(e.id+r.id));for(let i=0;i<26;i++)s+=`<circle cx="${gxR(rr()*W)}" cy="${gxR(rr()*H*.6)}" r="${gxR(4+rr()*12)}" fill="${['#ff9ec4','#fff2b8','#9cc8ff'][i%3]}" opacity="${gxR(.08+rr()*.18)}"/>`;
 s+=`<g transform="translate(${500-fw/2} 30)">${gxFig(e,r.id,r.top,0,fw,r.top?3:2)}</g>`+gxMic(512,H+20,2.6,1,H+20-262);
 if(c)s+=`<rect x="0" y="0" width="${W}" height="6" fill="${c.c}"/>`;
 return`<svg class="gxclose" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(r.stage)}">${s}</svg>`}
// ---- the winner on the throne ---------------------------------------------------------------------------------------------
function gxThroneShot(e,r){const id='gt'+(++PTC[0]),W=1000,H=700,fw=230;let s=gxDefs(id);
 s+=`<rect width="${W}" height="${H}" fill="url(#${id}bg)"/><ellipse cx="500" cy="300" rx="480" ry="330" fill="url(#${id}halo)" opacity=".7"/>`;
 s+=`<g opacity=".75">${Array.from({length:36},(_,i)=>{const a=Math.PI*2*(i/36),x2=500+Math.cos(a)*700,y2=300+Math.sin(a)*700;return`<line x1="500" y1="300" x2="${gxR(x2)}" y2="${gxR(y2)}" stroke="#f3c85a" stroke-width="${i%2?3:8}" opacity="${i%2?.3:.55}"/>`}).join('')}</g>`;
 s+=`${gxColumn(id,70,0,H-60,70)}${gxColumn(id,930,0,H-60,70)}<rect x="250" y="${H-120}" width="500" height="30" rx="6" fill="url(#${id}gold)"/><rect x="200" y="${H-90}" width="600" height="30" rx="6" fill="url(#${id}gold)" opacity=".9"/><rect y="${H-60}" width="${W}" height="60" fill="url(#${id}floor)"/>`;
 s+=gxThrone(id,500,H-196,2.2)+`<g transform="translate(${500-fw/2} ${gxR(H-196-84*fw/80+16)})">${gxFig(e,r.id,1,10,fw,3)}</g>`;
 s+=`<path d="M380 0H620L760 ${H}H240Z" fill="url(#${id}beam)" opacity=".5"/>`+gxConfetti(W,H,gxH(e.id+'w'));
 s+=gxTxt(500,64,40,'WINNER',{f:`url(#${id}gold)`,ff:'serif',ls:10});
 return`<svg class="gxclose gxthr" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(r.stage)}">${s}</svg>`}
// ---- both hosts on stage --------------------------------------------------------------------------------------------------
function gxHostShot(e,on){const id='gh'+(++PTC[0]),W=1000,H=560,fw=170;let s=gxDefs(id);
 s+=`<rect width="${W}" height="${H}" fill="url(#${id}bg)"/>`+`<g filter="url(#${id}blur)" opacity=".85">${gxLed(id,160,24,680,190,`${gxTxt(500,90,20,`${S.co||''} · ${e.year||''}`,{f:'#f6d7ff',ls:4})}${gxTxt2(500,160,58,e.name,{f:`url(#${id}gold)`,ff:'serif',fit:640})}`)}${gxColumn(id,70,0,470,60)}${gxColumn(id,930,0,470,60)}</g>`;
 s+=`<rect y="${H-80}" width="${W}" height="80" fill="url(#${id}floor)"/><rect y="${H-80}" width="${W}" height="4" fill="url(#${id}gold)"/>`;
 [['mix',350],['lucia',650]].forEach(([k,x])=>{const lit=on=='both'||on==k;s+=`<path d="M${x-70} 0H${x+70}L${x+170} ${H-40}H${x-170}Z" fill="url(#${id}beam)" opacity="${lit?.6:.18}"/><ellipse cx="${x}" cy="${H-44}" rx="130" ry="20" fill="url(#${id}spot)" opacity="${lit?1:.4}"/><g transform="translate(${x-fw/2} ${gxR(H-44-fw*198/80)})">${gehFig(k,fw)}</g><rect x="${x-80}" y="${H-34}" width="160" height="26" rx="5" fill="#0d0a18" stroke="#e8b94a" stroke-width="1.5"/>${gxTxt(x,H-15,15,gehName(k)+' · MC',{f:'#ffe7a3'})}`});
 return`<svg class="gxclose" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mixmusa and Lucia">${s}</svg>`}
// ---- host dialogue --------------------------------------------------------------------------------------------------------
const GXD={
 open:{mix:[['Good evening, everyone! I\'m Mixmusa of Kisekiz Music, and it is my honour to host the {e} tonight!','สวัสดีค่ะทุกคน! มิกซ์มิวซ่าจาก Kisekiz Music ค่ะ เป็นเกียรติมากที่ได้เป็นพิธีกร {e} คืนนี้!'],['Welcome, welcome! Tonight {co} writes a new page of idol history — and I get the best seat in the house!','ยินดีต้อนรับค่ะ! คืนนี้ {co} จะเขียนหน้าใหม่ของประวัติศาสตร์ไอดอล และฉันได้ที่นั่งที่ดีที่สุดเลยค่ะ!']],
  lucia:[['And I\'m Lucia. Years ago I sat on a stage just like this one, waiting for my name. Tonight my heart is racing for every one of these girls.','และนี่คือลูเซียค่ะ หลายปีก่อนฉันเคยนั่งรอฟังชื่อตัวเองบนเวทีแบบนี้ คืนนี้หัวใจฉันเต้นแรงเพื่อเด็กๆ ทุกคนเลย'],['Good evening, darlings. I\'m Lucia. Look at this stage — every seat up there is a dream someone fought for.','สวัสดีค่ะที่รัก ลูเซียค่ะ ดูเวทีนี้สิคะ ทุกที่นั่งบนนั้นคือความฝันที่มีคนต่อสู้มาเพื่อมัน']]},
 host:[['mix','Welcome to the {e} of {co}! Tonight, the votes of our fans decide who stands where.','ยินดีต้อนรับสู่ {e} ของ {co}! คืนนี้คะแนนโหวตของแฟนๆ จะเป็นผู้ตัดสินว่าใครจะได้ยืนตรงไหน'],['lucia','Every CD bought for “{t}” was a voice — and tonight those voices will be heard, from the last ranked position to the very top.','ซีดี “{t}” ทุกแผ่นคือเสียงหนึ่งเสียง และคืนนี้เสียงเหล่านั้นจะถูกได้ยิน ตั้งแต่อันดับสุดท้ายไปจนถึงจุดสูงสุด'],['mix','Members, are you ready? Fans, please give them your loudest cheer!','เมมเบอร์พร้อมไหมคะ? แฟนๆ ส่งเสียงเชียร์ดังๆ ให้พวกเธอหน่อยค่ะ!']],
 ann:[['lucia','{cast} votes. Remember, every single one of them is somebody\'s heart.','{cast} คะแนน จำไว้นะคะ ทุกคะแนนคือหัวใจของใครสักคน'],['mix','We will now announce the rankings, starting from {N}th place. Here we go!','ต่อไปเราจะประกาศผลเริ่มจากอันดับที่ {N} ไปเลยค่ะ!']],
 grp:{mix:[['Now, the {g}! {n} members, TOP {a} to TOP {b}.','ต่อไปคือ {g}! {n} คน ตั้งแต่ TOP {a} ถึง TOP {b}'],['Next, the members of the {g}: TOP {a} to TOP {b}. Fans, get those penlights ready!','ต่อไปคือ {g}: TOP {a} ถึง TOP {b} แฟนๆ เตรียมแท่งไฟให้พร้อมนะคะ!']],
  lucia:[['The {g}… the first names tonight are where so many legends began.','{g}… ชื่อแรกๆ ของคืนนี้คือจุดเริ่มต้นของตำนานมากมาย'],['{g}. Being called here means the fans saw you — never forget that.','{g} การได้ถูกเรียกชื่อตรงนี้หมายความว่าแฟนๆ มองเห็นเธอ อย่าลืมเด็ดขาดนะ']],
  sen:[['lucia','And now… the Senbatsu. The girls who will stand in front of the whole nation in the next single.','และตอนนี้… เซ็มบัตสึ สาวๆ ที่จะยืนต่อหน้าคนทั้งประเทศในซิงเกิลหน้า'],['mix','The {g}: TOP {a} to TOP {b}! This is the moment everyone has been waiting for!','{g}: TOP {a} ถึง TOP {b}! นี่คือช่วงเวลาที่ทุกคนรอคอย!']]},
 pre:{mix:[['TOP {rk} goes to…','TOP {rk} ได้แก่…'],['And TOP {rk} is…','และ TOP {rk} คือ…'],['The member in TOP {rk}…','เมมเบอร์อันดับ TOP {rk}…'],['TOP {rk}! Please welcome…','TOP {rk}! ขอเชิญ…']],
  lucia:[['Breathe, everyone… TOP {rk} is…','หายใจลึกๆ นะทุกคน… TOP {rk} คือ…'],['TOP {rk}. A name that will be remembered tonight…','TOP {rk} ชื่อที่ทุกคนจะจดจำในคืนนี้…'],['TOP {rk}… I can feel the whole arena holding its breath.','TOP {rk}… ฉันรู้สึกได้เลยว่าทั้งฮอลล์กลั้นหายใจ'],['TOP {rk} — come up to the microphone…','TOP {rk} — เชิญออกมาที่ไมค์ค่ะ…']],
  cen:[['lucia','The Center of the {g}… TOP {rk} goes to…','เซ็นเตอร์ของ {g}… TOP {rk} ได้แก่…']],
  top3:[['mix','We are down to the top three. TOP {rk}…','เหลือเพียงสามอันดับแรกแล้วค่ะ TOP {rk}…'],['lucia','TOP {rk}. Only the strongest hearts reach this place.','TOP {rk} มีแต่หัวใจที่แข็งแกร่งที่สุดเท่านั้นที่มาถึงตรงนี้ได้']],
  one:[['mix','And now… the winner of the {e}…','และตอนนี้… ผู้ชนะของ {e}…'],['lucia','The throne has waited all night. TOP 1 is…','บัลลังก์รอมาทั้งคืนแล้ว TOP 1 คือ…']]},
 rv:{winner:{mix:['Congratulations, {nm}! The new Queen of {co}!','ยินดีด้วยนะคะ {nm}! ราชินีคนใหม่ของ {co}!'],lucia:['The crown is heavy, {nm}. I know. But tonight, it is yours — wear it proudly.','มงกุฎหนักนะ {nm} ฉันรู้ดี แต่คืนนี้มันเป็นของเธอ สวมมันอย่างภาคภูมิใจนะ']},
  top3:{mix:['{nm} in TOP {rk}! What an incredible result!','{nm} TOP {rk}! ผลลัพธ์ที่สุดยอดมากค่ะ!','A place on the podium! Congratulations, {nm}!','ได้ขึ้นโพเดียมแล้ว! ยินดีด้วยนะคะ {nm}!'],lucia:['TOP {rk}, {nm}. The higher you climb, the more the light shows — let it.','TOP {rk} นะ {nm} ยิ่งปีนสูง แสงก็ยิ่งส่อง ปล่อยให้มันส่องเถอะ','From here, {nm}, the view is beautiful… and lonely. Hold on to your friends.','จากตรงนี้ {nm} วิวสวยมาก… แต่ก็เหงา จับมือเพื่อนไว้ให้แน่นนะ']},
  groupCenter:{mix:['{nm} — the Center of the {g}!','{nm} — เซ็นเตอร์ของ {g}!'],lucia:['The Center, {nm}. Everyone behind you will follow your back now.','เซ็นเตอร์นะ {nm} ทุกคนข้างหลังจะมองแผ่นหลังของเธอนับจากนี้']},
  bigUp:{mix:['What a leap! {nm} climbs all the way to TOP {rk}!','ก้าวกระโดดมาก! {nm} ขึ้นมาถึง TOP {rk}!'],lucia:['That jump didn\'t happen tonight, {nm}. It happened in every lesson nobody saw.','การก้าวกระโดดนี้ไม่ได้เกิดคืนนี้หรอก {nm} มันเกิดในทุกบทเรียนที่ไม่มีใครเห็น']},
  up:{mix:['Up again for {nm}! Congratulations!','{nm} อันดับขึ้นอีกแล้ว! ยินดีด้วยค่ะ!','A step higher for {nm} — well done!','{nm} สูงขึ้นอีกขั้น เก่งมากค่ะ!'],lucia:['One step higher, {nm}. Steps are how queens are made.','สูงขึ้นอีกขั้นนะ {nm} ราชินีถูกสร้างจากทีละขั้นแบบนี้แหละ','Climbing steadily, {nm}. That\'s the kind of strength that lasts.','ค่อยๆ ไต่ขึ้นอย่างมั่นคงนะ {nm} ความแข็งแกร่งแบบนี้แหละที่อยู่ได้นาน']},
  same:{mix:['{nm} holds her ground in TOP {rk}!','{nm} รักษาตำแหน่ง TOP {rk} ไว้ได้!'],lucia:['Keeping your place is harder than people think, {nm}.','การรักษาตำแหน่งไว้ยากกว่าที่คนคิดนะ {nm}']},
  firstRanked:{mix:['Her very first ranking! Welcome, {nm}!','ติดอันดับครั้งแรก! ยินดีต้อนรับค่ะ {nm}!','{nm} enters the ranking for the first time!','{nm} ติดอันดับเป็นครั้งแรก!'],lucia:['The first time they call your name, {nm}… you never forget that sound.','ครั้งแรกที่ได้ยินชื่อตัวเอง {nm}… เสียงนั้นจะไม่มีวันลืมเลย','Remember this feeling, {nm}. It\'s the beginning of everything.','จำความรู้สึกนี้ไว้นะ {nm} นี่คือจุดเริ่มต้นของทุกอย่าง']},
  down:{mix:['{nm} in TOP {rk}. Thank you for fighting so hard!','{nm} TOP {rk} ขอบคุณที่สู้มาอย่างเต็มที่นะคะ!'],lucia:['A lower number isn\'t the end of a story, {nm}. Sometimes it\'s the chapter that makes it worth reading.','ตัวเลขที่ลดลงไม่ใช่ตอนจบนะ {nm} บางทีมันคือบทที่ทำให้เรื่องน่าอ่าน']},
  bigDown:{mix:['{nm}, the fans are still with you. TOP {rk}!','{nm} แฟนๆ ยังอยู่ข้างเธอนะ TOP {rk}!'],lucia:['I fell too, {nm}. Standing up again is what made me a queen.','ฉันก็เคยล้มนะ {nm} การลุกขึ้นอีกครั้งคือสิ่งที่ทำให้ฉันเป็นราชินี']}},
 rival:['My heart! I\'m so proud — but tonight I stay perfectly professional. Congratulations, {nm}!','ใจฉันจะระเบิดแล้ว! ภูมิใจมาก แต่คืนนี้ต้องเป็นมืออาชีพนะคะ ยินดีด้วยค่ะ {nm}!'],
 cen:[['mix','Here are the Centers who will lead every lineup of the next single!','นี่คือเซ็นเตอร์ที่จะนำทุกไลน์อัปของซิงเกิลหน้าค่ะ!'],['lucia','Centers… you carry the song and the people behind you. Be kind to them.','เซ็นเตอร์ทั้งหลาย… เธอแบกทั้งเพลงและคนข้างหลังไว้ ดูแลพวกเขาดีๆ นะ']],
 win:[['lucia','Please welcome {nm} to the throne.','ขอเชิญ {nm} ขึ้นสู่บัลลังก์ค่ะ'],['mix','{nm} becomes the overall Center of the next single! Congratulations!','{nm} จะเป็นเซ็นเตอร์ใหญ่ของซิงเกิลหน้า! ยินดีด้วยค่ะ!']],
 sp:[['lucia','Let\'s hear from the members who carried the most votes tonight.','มาฟังเสียงจากเมมเบอร์ที่ได้รับคะแนนมากที่สุดคืนนี้กันค่ะ']],
 photo:[['mix','Photo time! Everyone, your brightest smiles, please!','ได้เวลาถ่ายรูปแล้ว! ทุกคนยิ้มสวยๆ เลยค่ะ!']],
 close:[['mix','Thank you so much for watching the {e}! Kisekiz Music and I will be cheering for every one of you.','ขอบคุณมากที่ร่วมชม {e} นะคะ ฉันและ Kisekiz Music จะเป็นกำลังใจให้ทุกคนค่ะ'],['lucia','To every girl who heard her name tonight — and to every girl who didn\'t: this stage will wait for you. Goodnight.','ถึงทุกคนที่ได้ยินชื่อตัวเองคืนนี้ และทุกคนที่ยังไม่ได้ยิน เวทีนี้จะรอเธอเสมอ ราตรีสวัสดิ์ค่ะ']],
 sub:[['mix','And now the rankings of our sister group!','และนี่คืออันดับของวงน้องค่ะ!']]};
const gxTh=()=>typeof UIP!='undefined'&&UIP.lang=='th';
function gxFill(t,V){return String(t).replace(/\{(\w+)\}/g,(m,k)=>V[k]!=null?V[k]:m)}
const gxPick=(L,seed)=>L[((seed%L.length)+L.length)%L.length];
const GX_RIVAL=/omg4ki|win[ée]r4|sum[ée]r4/i;
function gxVars(e,r){const g=r&&e.groups[r.gi],R=r&&r.gi>=0?geRanges(e)[r.gi]:null;return{e:e.name,co:S.co||'',t:e.title||'',N:e.final.rows.filter(z=>z.rank).length,cast:(e.final.cast||0).toLocaleString(),nm:r?r.stage:'',rk:r?r.rank:'',g:g?g.name:'',a:R?R[0]:'',b:R?R[1]:'',n:R?R[1]-R[0]+1:''}}
function gxLines(e,St,i,s){const th=gxTh(),L=[],say=(h,en,tt,V)=>L.push({h,t:gxFill(th?tt:en,V)}),V0=gxVars(e,null),sd=gxH(e.id)+i*7;
 if(s.k=='open'){const a=gxPick(GXD.open.mix,sd),b=gxPick(GXD.open.lucia,sd>>3);say('mix',a[0],a[1],V0);say('lucia',b[0],b[1],V0)}
 else if(s.k=='host')GXD.host.forEach(([h,a,b])=>say(h,a,b,V0));
 else if(s.k=='ann')GXD.ann.forEach(([h,a,b])=>say(h,a,b,V0));
 else if(s.k=='r'){const r=geRow(e,s.id),V=gxVars(e,r),rv=e.cp.rv;
  if(!rv){const prev=St[i-1],firstOfGroup=!prev||prev.k!='r'||(geRow(e,prev.id)||{}).gi!=r.gi;
   if(firstOfGroup&&r.gi>=0){if(r.gi==0&&e.groups.length>1)GXD.grp.sen.forEach(([h,a,b])=>say(h,a,b,V));else{const a=gxPick(GXD.grp.mix,sd),b=gxPick(GXD.grp.lucia,sd>>2);say('mix',a[0],a[1],V);say('lucia',b[0],b[1],V)}}
   if(r.rank==1)GXD.pre.one.forEach(([h,a,b])=>say(h,a,b,V));else if(r.top){const z=GXD.pre.top3[r.rank%2];say(z[0],z[1],z[2],V)}else if(r.center){const z=GXD.pre.cen[0];say(z[0],z[1],z[2],V)}
   else{const h=i%2?'mix':'lucia',z=gxPick(GXD.pre[h],Math.floor(i/2)+(gxH(e.id)%4));say(h,z[0],z[1],V)}}
  else{const fx=(e.fx||{})[r.id]||{},sit=r.rank==1?'winner':r.top?'top3':r.center&&!['bigUp','firstRanked'].includes(fx.sit)?'groupCenter':fx.sit,T=GXD.rv[sit]||GXD.rv.up,m=get(r.id),gn=m&&grp(m.group)?grp(m.group).name:'';
   const both=r.rank<=3||r.center,h=i%2?'lucia':'mix',k=Math.floor(i/2)+(gxH(e.id+r.id)%3);
   // the mix / lucia arrays hold [en, th, en2, th2…] pairs
   const pair=hh=>{const L2=T[hh];const n=Math.max(1,Math.floor(L2.length/2)),j=k%n;return[L2[j*2]||L2[0],L2[j*2+1]||L2[1]]};
   if(GX_RIVAL.test(gn)){const z=GXD.rival;say('mix',z[0],z[1],V)}else if(both||h=='mix'){const z=pair('mix');say('mix',z[0],z[1],V)}
   if(both||h=='lucia'){const z=pair('lucia');say('lucia',z[0],z[1],V)}}}
 else if(s.k=='centers')GXD.cen.forEach(([h,a,b])=>say(h,a,b,V0));
 else if(s.k=='winner'){const r=e.final.rows.find(z=>z.rank==1),V=gxVars(e,r);GXD.win.forEach(([h,a,b])=>say(h,a,b,V))}
 else if(s.k=='speech')GXD.sp.forEach(([h,a,b])=>say(h,a,b,V0));
 else if(s.k=='photo')GXD.photo.forEach(([h,a,b])=>say(h,a,b,V0));
 else if(s.k=='close')GXD.close.forEach(([h,a,b])=>say(h,a,b,V0));
 else if(s.k=='sub')GXD.sub.forEach(([h,a,b])=>say(h,a,b,V0));
 return L}
// ---- the result graphic ----------------------------------------------------------------------------------------------------
// change mark: up / down / same / NEW / Comeback (drawn with CSS, no emoji)
function gxMark(from,to,o){o=o||{};if(to==null)return'';if(from==null)return o.isNew?`<span class="gxa new">NEW</span>`:o.cb?`<span class="gxa cb">${gpT('Comeback','คัมแบ็ก')}</span>`:'';const d=from-to;
 return d>0?`<span class="gxa up"><i></i>${d}</span>`:d<0?`<span class="gxa dn"><i></i>${-d}</span>`:`<span class="gxa eq">＝</span>`}
function gxAff(r){const m=get(r.id)||(S.alumni||[]).find(a=>a.id==r.id);if(!m)return{aff:[esc(r.team||'')],gen:''};const g=grp(m.group),t=teamOf(m),tn=t&&isAct(m)?t.name:TLm(m),L=[`${esc(g?g.name:'')} ${esc(tn||'')}`.trim()];
 if(m.kn){const kg=grp(m.kn.gid),kt=kg&&(kg.teams||[]).find(x=>x.id==m.kn.tid);if(kg)L.push(`${esc(kg.name)} ${esc(kt?kt.name:'')}`.trim())}
 return{aff:L,gen:`${esc(g?g.name:'')} ${gxTh()?'รุ่น':'Gen'} ${m.gen||1}`}}
function gxLower(e,r,o){o=o||{};const g=e.groups[r.gi],fx=(e.fx||{})[r.id]||{},cl=r.top?'t'+r.top:r.center?'cen':'',H=geHistOf(e,r),A=gxAff(r),rk=x=>x?`TOP ${x}`:`<span class="nr">${gpT('Not ranked','ไม่ติดอันดับ')}</span>`;
 const main=H.prevE?gxMark(H.prevRank??null,r.rank,{isNew:!H.everRanked,cb:H.everRanked&&H.prevRank==null}):`<span class="gxa new">NEW</span>`;
  const rows=[H.hasP1?[gpT('Preliminary 01','ผลด่วนรอบ 1'),rk(H.p1),'']:null,H.hasP2?[gpT('Preliminary 02','ผลด่วนรอบ 2'),rk(H.p2),H.p2&&H.p1?gxMark(H.p1,H.p2):H.p2&&!H.p1?'<span class="gxa new">NEW</span>':'']:null,[gpT('Last election','เลือกตั้งครั้งก่อน'),H.prevE?rk(H.prevRank):`<span class="nr">${gpT('First election','ครั้งแรก')}</span>`,'']].filter(Boolean);
 return`<div class="gxlt2 ${cl}"><span class="gxo l"></span><span class="gxo r"></span>
 <div class="gxl2a"><div class="gxl2r"><small>TOP</small><b>${r.rank}</b>${main}</div><div class="gxl2v"><b>${r.votes.toLocaleString()}</b><small>${gpT('votes','คะแนน')}</small></div></div>
 <div class="gxl2b"><div class="gxl2g">${A.aff.join('<em>/</em>')}</div><div class="gxl2n">${esc(r.stage)}</div><div class="gxl2m"><span>${A.gen}</span><i>·</i><span class="gxl2k">${esc(g?g.name:'')}${r.center?' · Center':''}</span>${r.top?`<i>·</i><span class="gxl2c">${esc(GE_CAPE[r.top].n)}</span>`:''}</div></div>
 <div class="gxl2h">${rows.map(([a,b,c])=>`<div><small>${a}</small><b>${b}</b>${c}</div>`).join('')}</div></div>
 ${!o.noSp&&fx.speech?`<div class="gxsp"><blockquote class="gesp">${esc(fx.speech)}</blockquote><div class="gemood">${WL.mood[fx.mood]?WL.mood[fx.mood][0]:''} ${esc(fx.mood||'')} · ${esc(fx.sitTxt||'')}</div></div>`:''}`}
// ---- ceremony screen -------------------------------------------------------------------------------------------------------
function gxRevealed(e,St,i,s){const n=i+(s.k=='r'&&e.cp.rv?1:0);return St.slice(0,n).filter(z=>z.k=='r').map(z=>z.id)}
function gxCer(e,h){const St=geSteps(e),i=Math.min(e.cp.i,St.length-1),s=St[i],rv=e.cp.rv,shown=gxRevealed(e,St,i,s),win=e.final.rows.find(z=>z.rank==1),past=k=>St.findIndex(z=>z.k==k)<=i&&St.some(z=>z.k==k);
 const a0=h.indexOf('<div class="gebody"'),a1=h.lastIndexOf('<div class="geact">');if(a0<0||a1<0)return h;const head=h.slice(0,a0),orig=h.slice(a0,a1),act=h.slice(a1),snap=id=>e.snap[id];
 const lines=gehSay(gxLines(e,St,i,s));let body='',cls='';
 const seated=new Set(shown.filter(id=>!(win&&id==win.id)));const curId=s.k=='r'&&rv?s.id:null;if(curId)seated.delete(curId);const onThrone=win&&shown.includes(win.id)&&(past('winner')||(s.k!='r'&&St.findIndex(z=>z.k=='r'&&z.id==win.id)<i));
 const wide=o=>`<div class="gxshot">${gxWide(e,{seated,throne:onThrone,...o})}</div>`;
 if(s.k=='open'){const ven=e.cer?e.cer.vn:'';body=wide({hosts:'both'})+`<div class="gxpanel op"><div class="gekicker">IDOLVERSE48 · ${esc(S.co)}</div><h1 class="getitle"${String(e.name).length>36?' style="font-size:clamp(20px,3.6vw,38px)"':''}>${esc(e.name)}</h1><div class="gesub">Ranking Announcement Ceremony</div><div class="geven">${esc(ven)} · ${longDate(e.cer.day)}</div><div class="gecap">👗 ${esc((e.czS&&e.czS.name)||geCosName(e))}</div>${lines}<div class="gecrowd">${e.final.rows.filter(r=>!r.withdrawn).map(r=>`<span>${gePor(snap(r.id),0,46)}</span>`).join('')}</div><p class="gecap">${e.final.rows.filter(r=>!r.withdrawn).length} candidates · ${e.final.rows.filter(r=>r.rank).length} ranked positions · ${e.groups.length} ranking group${e.groups.length>1?'s':''}</p></div>`}
 else if(s.k=='host'){body=`<div class="gxshot">${gxHostShot(e,'both')}</div><div class="gxpanel"><div class="gekicker">${gpT('Your hosts','พิธีกร')}</div><h2 class="geh">“Good evening, everyone!”</h2>${lines}</div>`}
 else if(s.k=='ann'){const R=geRanges(e);body=wide({hosts:'both',screen:[gpT('THE VOTES ARE IN','ผลโหวตมาแล้ว'),`${(e.final.cast||0).toLocaleString()} VOTES`,e.name]})+`<div class="gxpanel"><div class="gekicker">Election Announcement</div><h2 class="geh">The votes have been counted</h2><div class="gekpi">${[['Total CD sales',e.final.sales],['Voting tokens',e.final.tokens],['Votes cast',e.final.cast],['Expired tokens',e.final.expired]].map(([a,b])=>`<div><small>${a}</small><b>${(b||0).toLocaleString()}</b></div>`).join('')}</div><div class="gegrps">${e.groups.map((g,k)=>`<div style="--gc:${gxGC(k)[0]}"><b>${esc(g.name)}</b><span>${ordN(R[k][0])} – ${ordN(R[k][1])}</span></div>`).join('')}</div>${lines}<p class="gemc">We will now announce the rankings, starting from ${ordN(e.final.rows.filter(r=>r.rank).length)} place.</p></div>`}
 else if(s.k=='r'){const r=geRow(e,s.id),g=e.groups[r.gi];
  if(!rv){cls='pre';body=wide({mic:'empty',hosts:i%2?'mix':'lucia',screen:['TOP '+r.rank,String(g?g.name:'').toUpperCase(),e.name],side:['TOP '+r.rank,g?g.name:'']})+`<div class="gxpanel pre"><div class="gerkg">${esc(g?g.name:'')}</div><div class="gernum">${geTopN(r.rank)}</div>${lines}<p class="gemc">${gxTh()?(r.rank==1?'และแล้ว… ผู้ชนะของ '+esc(e.name)+' คือ…':r.rank<=3?'สามอันดับแรก… อันดับที่ '+r.rank+' ได้แก่…':r.center?'เซ็นเตอร์ของ '+esc(g.name)+'… อันดับที่ '+r.rank+' ได้แก่…':'อันดับที่ '+r.rank+' ได้แก่…'):(r.rank==1?'And now… the winner of the '+esc(e.name)+'…':r.rank<=3?'The top three… '+ordN(r.rank)+' place goes to…':r.center?'The Center of '+esc(g.name)+'… '+ordN(r.rank)+' place goes to…':ordN(r.rank)+' place goes to…')}</p><div class="gedrum"><i></i><i></i><i></i></div></div>`}
  else{cls='rv top'+r.top;body=`<div class="gxshot gxcl">${gxClose(e,r)}</div><div class="gxpanel rv">${gxLower(e,r)}${lines}</div>`}}
 else if(s.k=='centers'){body=wide({hosts:'both',screen:[gpT('CENTERS','เซ็นเตอร์'),e.name,'']})+`<div class="gxpanel"><div class="gekicker">Group Center Announcement</div><h2 class="geh">The Centers of ${esc(e.name)}</h2>${lines}<div class="gecens">${geLineups(e).map(L=>{const r=geRow(e,L.ids[0]);return`<div class="gecenc top${r.top}">${geFig(snap(r.id),r.top,{w:120})}<b>${esc(L.name)}</b><span>${esc(r.stage)} · ${ordN(r.rank)}</span><small>${L.gi==0?'Main song Center of the next single':'Center of a coupling song of the next single'}</small></div>`}).join('')}</div></div>`}
 else if(s.k=='winner'&&win){const fx=(e.fx||{})[win.id]||{};cls='win';body=`<div class="gxshot gxcl">${gxThroneShot(e,win)}</div><div class="gxpanel rv"><div class="gekicker">General Election Winner</div>${gxLower(e,win,{noSp:1})}<p class="gemc">${esc(win.stage)} becomes the overall Center of the next single.</p>${fx.speech?`<blockquote class="gesp">${esc(fx.speech)}</blockquote>`:''}${lines}</div>`}
 else if(s.k=='speech'){const L=e.final.rows.filter(r=>r.top||r.center).sort((a,b)=>a.rank-b.rank);body=wide({mic:L[0]?L[0].id:'empty',screen:[gpT('SPEECHES','สปีช'),e.name,'']})+`<div class="gxpanel"><div class="gekicker">Member Speeches</div>${lines}<div class="gesps">${L.map(r=>{const fx=(e.fx||{})[r.id]||{};return`<div class="gespc top${r.top}">${gePor(snap(r.id),r.top,74)}<div><b>${ordN(r.rank)} · ${esc(r.stage)}</b><small>${esc(r.gname)}${r.center?' Center':''}</small><q>${esc(fx.speech||'')}</q></div></div>`}).join('')}</div></div>`}
 else if(s.k=='close'){const w=win;body=wide({hosts:'both',confetti:1,screen:[gpT('THANK YOU!','ขอบคุณ!'),e.name,'']})+`<div class="gxpanel op"><div class="gekicker">Closing Ceremony</div><h1 class="getitle">Thank you!</h1><p class="gemc">The ${esc(e.name)} is over. Congratulations to ${esc(w?w.stage:'')} and to every ranked member — and thank you to every member who stood on this stage. The new lineups will lead the next single.</p>${lines}</div>`}
 else{// photo, sister-group rankings and any later step: the original content on the grand stage
  body=wide({hosts:s.k=='photo'?'mix':'both'})+`<div class="gxpanel">${lines}${orig}</div>`;return head.replace('<div class="gecer"','<div class="gecer gxcer"')+`<div class="gebody gxbody" data-step="${i}">${body}</div>`+act}
 const strip=shown.length&&s.k=='r'?`<div class="gestrip">${shown.slice(-10).reverse().map(id=>{const r=geRow(e,id);return`<span title="${esc(r.stage)}"><i>${ordN(r.rank)}</i>${gePor(snap(r.id),r.top,40)}</span>`}).join('')}</div>`:'';
 return head.replace('<div class="gecer"',`<div class="gecer gxcer"`)+`<div class="gebody gxbody ${cls}" data-step="${i}">${body}</div>${strip}`+act}
{const f=geCerHtml;geCerHtml=function(e){const h=f.apply(this,arguments);try{GE_CTX=e;return gxCer(e,h)}catch(x){console.error(x);return h}}}
// General Election page: the hosts
{const f=V.ge;V.ge=function(){let h=f.apply(this,arguments);try{const e=geCur();if(e&&['scheduled','ceremony'].includes(e.st))h+=gehCards()}catch(x){console.error(x)}return h}}
