// =====================================================================================
//  IDOLVERSE48: Select Bloom! — CD Cover Studio location backgrounds
//  11 real places × 3 different compositions (camera angle / layout) × 3 times of day.
//  Every scene is a vector illustration on a 512 × 683 board (tall enough for album 3:4
//  covers; square covers frame a part of it). Time of day changes the sky, sun/moon,
//  clouds, window glass, lamps and lit windows, light shafts and a final light grade.
//  CVLOC.svg(k, v, t, uid) → markup; CVLOC.LOCS = [[key, name, [variant names]]].
// =====================================================================================
const CVLOC=(()=>{
 const W=512,H=683;
 const R=(x,y,w,h,f,o='')=>`<rect x="${+x.toFixed?x.toFixed(1):x}" y="${+y.toFixed?y.toFixed(1):y}" width="${w.toFixed?w.toFixed(1):w}" height="${h.toFixed?h.toFixed(1):h}" fill="${f}" ${o}/>`,
  P=(d,f,o='')=>`<path d="${d}" fill="${f}" ${o}/>`,E=(cx,cy,rx,ry,f,o='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${o}/>`,
  C=(cx,cy,r,f,o='')=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${o}/>`,
  L=(d,c,w,o='')=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" ${o}/>`,
  lg=(id,st,x2=0,y2=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st.map((c,i)=>`<stop offset="${(i/Math.max(1,st.length-1)).toFixed(3)}" stop-color="${c}"/>`).join('')}</linearGradient>`,
  rg=(id,c,o=1)=>`<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`,
  rnd=s=>{let a=s|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}},
  mx=(a,b,t)=>{try{return mixc(a,b,t)}catch(e){return a}};
 // ---------- time of day
 const TOD={
  m:{n:'Morning',sky:['#86c3f0','#c4e3f6','#fbe6d3'],sun:{c:'#fffbe8',g:'#ffe7a8',r:26,x:.2,y:.42},cloud:'#ffffff',cs:'#e8d8e8',glass:['#a9d6f2','#e8f5fc'],lit:0,lamp:0,ov:['#fff1cf','#d6e6ff'],om:'soft-light',oo:.4,shaft:'#fff2cc',so:.32,amb:'#fff9ee',dk:0,sea:['#5fb7de','#9fd9ee'],moon:0},
  a:{n:'Afternoon',sky:['#3b97e6','#86c4f0','#d6eefc'],sun:{c:'#ffffff',g:'#fffbe0',r:22,x:.8,y:.16},cloud:'#ffffff',cs:'#d3e0f0',glass:['#94cdf0','#e6f5ff'],lit:0,lamp:0,ov:['#fff7e3','#ffffff'],om:'soft-light',oo:.18,shaft:'#ffffff',so:.22,amb:'#ffffff',dk:0,sea:['#2f9fd8','#7fd0ec'],moon:0},
  e:{n:'Evening',sky:['#2c2f6e','#6d4a94','#d96a8a','#ffa868','#ffd796'],sun:{c:'#ffe1a0',g:'#ff8a5a',r:36,x:.72,y:.86},cloud:'#f49a86',cs:'#7c5590',glass:['#e99a7c','#ffd3a6'],lit:1,lamp:1,ov:['#ff9a6a','#4c3a86'],om:'multiply',oo:.36,shaft:'#ffb27a',so:.38,amb:'#ffd9b0',dk:1,sea:['#7a5aa0','#f0a080'],moon:1}};
 // ---------- building blocks
 let U='l';const id=k=>U+k;
 const sky=(T,y0,y1)=>`<defs>${lg(id('sk'),T.sky)}${rg(id('sg'),T.sun.g,.85)}</defs>`+R(0,y0,W,y1-y0,`url(#${id('sk')})`);
 const skyR=(T,x,y,w,h)=>`<defs>${lg(id('sk2'),T.sky)}${rg(id('sg'),T.sun.g,.85)}</defs>`+R(x,y,w,h,`url(#${id('sk2')})`)+C(x+w*T.sun.x,y+h*Math.min(.8,T.sun.y),T.sun.r*.6,T.sun.c)+C(x+w*T.sun.x,y+h*Math.min(.8,T.sun.y),T.sun.r*1.8,`url(#${id('sg')})`);
 const sun=(T,y0,y1,x)=>{const s=T.sun,cx=(x!=null?x:s.x)*W,cy=y0+(y1-y0)*s.y;let o=C(cx,cy,s.r*3.2,`url(#${id('sg')})`)+C(cx,cy,s.r,s.c);if(T.moon)o+=C(W*.16,y0+(y1-y0)*.18,9,'#fff8e0','opacity=".85"')+[[.3,.1],[.5,.22],[.12,.34],[.88,.08]].map(([x,y])=>C(W*x,y0+(y1-y0)*y,1.2,'#fff','opacity=".8"')).join('');return o};
 const cloud=(T,x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})">${E(0,6,46,12,T.cs,'opacity=".8"')}${C(-22,0,16,T.cloud)}${C(0,-8,22,T.cloud)}${C(22,0,15,T.cloud)}${E(0,6,44,10,T.cloud)}</g>`;
 const clouds=(T,seed,n,y0,y1,s=1)=>{const r=rnd(seed);let o='';for(let i=0;i<n;i++)o+=cloud(T,r()*W,y0+r()*(y1-y0),(.5+r()*.7)*s);return`<g opacity="${T.dk?.85:.95}">${o}</g>`};
 const glass=T=>`url(#${id('gl')})`,glassDef=T=>`<defs>${lg(id('gl'),T.glass,.4,1)}</defs>`;
 const win=(T,x,y,w,h,seed,lit=.4)=>{const r=rnd(seed),on=T.lit&&r()<lit;return R(x,y,w,h,on?'#ffd98a':glass(T))+(on?'':P(`M${x} ${y+h*.7}L${x+w*.6} ${y}H${x+w*.85}L${x} ${y+h}Z`,'#fff','opacity=".28"'))};
 const bldg=(T,x,y,w,h,col,seed,o={})=>{const r=rnd(seed);let s=R(x,y,w,h,col)+R(x,y,w,3,mx(col,'#000',.15));const cw=o.cw||10,ch=o.ch||13,gx=o.gx||6,gy=o.gy||8;
  for(let yy=y+gy;yy<y+h-ch-2;yy+=ch+gy)for(let xx=x+gx;xx<x+w-cw-2;xx+=cw+gx)s+=win(T,xx,yy,cw,ch,seed*97+xx*7+yy,o.lit||.35);return s+R(x+w-w*.18,y,w*.18,h,'#000','opacity=".08"')};
 const tree=(x,y,s,k,T)=>{const g=T.dk?'#4f7a62':'#5fae6a',g2=T.dk?'#3d6650':'#4c9a5c',hl=T.dk?'#6e8f74':'#8fd08a';
  if(k=='sakura'){const p=T.dk?'#e8a0b8':'#ffc4d8',p2=T.dk?'#d58aa6':'#ffb0c9';return`<g transform="translate(${x} ${y}) scale(${s})">${L('M0 0Q-2 -30 -4 -50M-3 -36Q-16 -46 -24 -58M-2 -42Q12 -52 20 -62',T.dk?'#4a3438':'#6e4a44',5,'stroke-linecap="round"')}${C(-22,-62,20,p2)}${C(18,-66,22,p2)}${C(-2,-74,24,p)}${C(-30,-50,14,p)}${C(30,-52,15,p)}${C(-8,-60,18,p)}${C(-6,-80,8,'#fff','opacity=".35"')}</g>`}
  if(k=='pine')return`<g transform="translate(${x} ${y}) scale(${s})">${R(-3,-10,6,12,'#6e4a34')}${P('M0 -70L16 -40H8L22 -14H-22L-8 -40H-16Z',g2)}${P('M0 -70L8 -40H2L10 -14H0Z',g,'opacity=".6"')}</g>`;
  if(k=='palm')return`<g transform="translate(${x} ${y}) scale(${s})">${P('M-3 0Q2 -40 -4 -90L2 -90Q8 -40 4 0Z',T.dk?'#7a5a48':'#b8875a')}${[[-46,-74],[-34,-104],[0,-112],[34,-104],[48,-76],[20,-70],[-20,-70]].map(([a,b])=>P(`M0 -90Q${a*.5} ${b-14} ${a} ${b}Q${a*.45} ${b*.92-6} 0 -90Z`,g2)).join('')}</g>`;
  return`<g transform="translate(${x} ${y}) scale(${s})">${R(-4,-26,8,28,T.dk?'#4e3a32':'#7a5440')}${C(-16,-40,18,g2)}${C(16,-42,18,g2)}${C(0,-58,22,g)}${C(-6,-64,9,hl,'opacity=".6"')}</g>`};
 const lamp=(T,x,y,h,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${R(-2,-h,4,h,'#4a4a5a')}${P(`M-10 ${-h-2}H10L6 ${-h-12}H-6Z`,'#4a4a5a')}${T.lamp?C(0,-h+2,26,'#ffd98a','opacity=".35"')+C(0,-h+1,6,'#fff1c0'):C(0,-h+1,5,'#dfe6ee')}</g>`;
 const shaft=(T,d)=>`<path d="${d}" fill="${T.shaft}" opacity="${T.so}"/>`;
 const grade=T=>`<defs>${lg(id('ov'),T.ov,.6,1)}</defs><rect width="${W}" height="${H}" fill="url(#${id('ov')})" style="mix-blend-mode:${T.om}" opacity="${T.oo}"/>`+(T.dk?`<rect width="${W}" height="${H}" fill="#ffb070" style="mix-blend-mode:screen" opacity=".08"/>`:'');
 const people=(T,seed,n,x0,x1,y,s)=>{const r=rnd(seed);let o='';for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),k=s*(.8+r()*.4),c=['#5a6a9a','#9a5a7a','#4a7a6a','#7a6a5a','#3a3a5a'][i%5];o+=`<g transform="translate(${x.toFixed(1)} ${y}) scale(${k.toFixed(2)})" opacity=".75">${C(0,-30,4.5,T.dk?'#6a4a5a':'#c99a84')}${P('M-5 -25H5L6 -8H-6Z',c)}${R(-4.6,-8,3.6,8,'#3a3a4a')}${R(1,-8,3.6,8,'#3a3a4a')}</g>`}return o};
 const wood=(x,y,w,h,c='#c99a6a')=>R(x,y,w,h,c)+R(x,y,w,3,'#fff','opacity=".25"')+R(x,y+h-3,w,3,'#000','opacity=".15"');
 // one-point room: back wall box + walls/floor/ceiling to the canvas edges
 const room=(bx0,by0,bx1,by1,c)=>P(`M0 0H${W}L${bx1} ${by0}H${bx0}Z`,c.ceil)+P(`M0 0L${bx0} ${by0}V${by1}L0 ${H}Z`,c.lw)+P(`M${W} 0L${bx1} ${by0}V${by1}L${W} ${H}Z`,c.rw)+P(`M0 ${H}L${bx0} ${by1}H${bx1}L${W} ${H}Z`,c.fl)+R(bx0,by0,bx1-bx0,by1-by0,c.bw);
 // ---------- scenes: S[key] = [variant0, variant1, variant2], each (T) → markup
 const S={};
 // SCHOOL
 S.school=[
  T=>{let s=sky(T,0,420)+sun(T,0,420)+clouds(T,11,5,30,220);
   s+=R(0,330,W,90,T.dk?'#7c8aa0':'#bcd7a8')+bldg(T,40,250,432,170,'#f4ede2',3,{cw:22,ch:28,gx:14,gy:16})+R(206,170,100,250,'#efe6d8')+C(256,212,26,'#fff')+C(256,212,22,'#f7f2ea','stroke="#7a6a5a" stroke-width="2"')+L('M256 212V196M256 212L268 218','#3a3550',3)+P('M196 172L256 130L316 172Z',T.dk?'#7a5a6a':'#b86a5a')+R(230,330,52,90,'#8a6a52')+R(234,334,20,86,glass(T))+R(258,334,20,86,glass(T));
   s+=R(0,410,W,273,T.dk?'#8a7f86':'#d8cdbb')+P('M196 683L236 420H276L316 683Z',T.dk?'#a2969a':'#e8dfcf')+tree(40,470,1.6,'sakura',T)+tree(470,480,1.8,'sakura',T)+tree(110,430,.9,'sakura',T)+tree(410,432,.95,'sakura',T);
   s+=R(0,560,W,14,'#8a8f9a')+Array.from({length:22},(_,i)=>R(i*24,520,4,52,'#9aa0aa')).join('')+lamp(T,170,560,90)+lamp(T,342,560,90);return s+glassDef(T)},
  T=>{let s=sky(T,0,380)+sun(T,0,380,.85)+clouds(T,21,4,20,200);
   s+=P('M0 380L512 300V430L0 520Z',T.dk?'#6a7a90':'#cfe0c0')+P('M110 160L512 110V380L110 420Z','#f3ebdf');for(let i=0;i<5;i++)for(let j=0;j<3;j++){const x=130+i*74,y=170-i*8+j*70;s+=P(`M${x} ${y}L${x+50} ${y-6}V${y+40}L${x} ${y+46}Z`,T.lit&&((i+j)%3==0)?'#ffd98a':glass(T))}
   s+=P('M110 160L512 110V96L110 146Z','#d8cbbb')+R(0,400,W,283,T.dk?'#7e7480':'#d9cdb9');
   s+=R(18,250,60,300,'#d8d0c4')+R(22,256,52,40,'#5a5a6a')+`<text x="48" y="282" font-size="20" fill="#fff" text-anchor="middle" font-family="serif">学園</text>`+R(434,280,46,270,'#d8d0c4');
   s+=L('M78 300H434M78 330H434',T.dk?'#4a4a5a':'#6a6a7a',4)+Array.from({length:18},(_,i)=>L(`M${96+i*19} 300V340`,T.dk?'#4a4a5a':'#6a6a7a',3)).join('');
   s+=P('M150 683L226 440H300L380 683Z',T.dk?'#998e94':'#ece3d2')+tree(-10,560,2.1,'sakura',T)+tree(520,600,2.3,'sakura',T)+Array.from({length:26},(_,i)=>{const r=rnd(i+7);return E(r()*W,420+r()*260,3,1.8,T.dk?'#e8a0b8':'#ffc4d8',`transform="rotate(${r()*180} ${0} ${0})" opacity=".8"`)}).join('');return s+glassDef(T)},
  T=>{let s=sky(T,0,330)+sun(T,0,330,.25)+clouds(T,31,4,20,160);
   s+=bldg(T,60,190,392,140,'#f2eadf',5,{cw:18,ch:24,gx:12,gy:14})+R(226,140,60,190,'#ece2d4')+C(256,172,16,'#fff','stroke="#7a6a5a" stroke-width="2"');
   s+=R(0,320,W,363,T.dk?'#a08070':'#d9a56f')+P(`M0 330H${W}V340H0Z`,'#fff','opacity=".3"');
   s+=E(256,520,220,90,'none','stroke="#fff" stroke-width="5" opacity=".85"')+E(256,520,170,62,'none','stroke="#fff" stroke-width="3" opacity=".6"')+L('M36 520H476','#fff',3,'opacity=".5"');
   s+=R(0,300,W,26,'#5f8f5a')+Array.from({length:34},(_,i)=>L(`M${i*16} 300V326`,'#4a7a4a',2)).join('')+tree(30,330,1,'round',T)+tree(482,330,1.1,'round',T);
   s+=R(400,430,8,110,'#e8e8f0')+R(470,430,8,110,'#e8e8f0')+R(400,430,78,6,'#e8e8f0')+L('M404 436L474 436',"#fff",1)+people(T,4,6,60,380,560,1.3);return s+glassDef(T)}];
 // CLASSROOM
 S.classroom=[
  T=>{const c={ceil:'#efe8dc',lw:'#e9dfd0',rw:'#e2d6c4',fl:T.dk?'#9a7a5c':'#c99d70',bw:'#f2eadd'};let s=room(96,96,416,380,c)+glassDef(T);
   s+=R(140,150,232,120,'#2f5a48')+R(136,146,240,128,'none','stroke="#a07a54" stroke-width="5"')+`<text x="256" y="200" text-anchor="middle" font-size="16" fill="#e8f0e8" opacity=".8" font-family="sans-serif">♪ Today's lesson</text>`+L('M170 230Q210 216 250 232T330 230','#e8f0e8',1.4,'opacity=".7"')+R(140,270,232,6,'#c8b89a');
   s+=R(232,300,100,46,'#a87a52')+R(232,300,100,8,'#c08f62');
   for(let i=0;i<4;i++){const y=0,x0=22+i*0;s+=P(`M0 ${120+i*10}L96 ${140+i*8}V${226+i*10}L0 ${226+i*40}Z`,'none')}
   s+=P('M0 60L96 120V300L0 360Z',glass(T))+L('M48 90V330M0 210L96 210','#f7f2ea',5)+shaft(T,'M0 60L96 120V300L0 360L180 683H520L320 360Z');
   for(let r=0;r<4;r++)for(let k=0;k<4;k++){const y=430+r*68+r*r*6,sp=(r+1)*0.16+.75,x=256+(k-1.5)*112*sp;s+=`<g transform="translate(${x.toFixed(1)} ${y}) scale(${sp.toFixed(2)})">${R(-38,-8,76,10,'#c49c6e')+R(-38,2,76,4,'#9a7650')+R(-34,6,4,40,'#7a7a8a')+R(30,6,4,40,'#7a7a8a')+R(-20,-38,40,26,'#b98d60')+R(-22,-12,44,6,'#a07a50')}</g>`}
   return s+R(0,0,W,30,'#fff','opacity=".25"')+C(256,60,0,'none')+R(220,18,72,10,'#fff')+R(80,18,60,8,'#fff')+R(372,18,60,8,'#fff')},
  T=>{let s=R(0,0,W,H,'#f1e8da')+glassDef(T);
   s+=sky(T,40,330)+sun(T,40,330,.35)+clouds(T,41,3,60,200,.8)+bldg(T,0,230,120,100,'#d8d2e2',9)+bldg(T,140,250,90,80,'#e2dccf',8)+tree(300,330,1.4,'sakura',T)+tree(420,330,1.2,'round',T);
   for(let i=0;i<4;i++)s+=R(i*128,40,10,300,'#f7f2ea');s+=R(0,40,W,10,'#f7f2ea')+R(0,330,W,22,'#e8ddcc')+R(0,180,W,6,'#f7f2ea');
   s+=E(60,190,40,170,'#f6e7f0','opacity=".85"')+E(470,190,34,170,'#f6e7f0','opacity=".85"');
   s+=R(0,352,W,331,T.dk?'#9a7a5c':'#c99d70')+shaft(T,'M40 352L170 352L330 683H120Z')+shaft(T,'M300 352L420 352L512 560V683H460Z');
   for(let i=0;i<3;i++){const x=70+i*170,y=520;s+=R(x-60,y-30,120,14,'#c49c6e')+R(x-60,y-16,120,6,'#9a7650')+R(x-54,y-10,6,90,'#7a7a8a')+R(x+48,y-10,6,90,'#7a7a8a')+R(x-26,y-88,52,44,'#b98d60')+R(x-30,y-44,60,10,'#a07a50')+R(x-28,y-44,4,110,'#7a7a8a')+R(x+24,y-44,4,110,'#7a7a8a')}
   s+=R(250,476,46,6,'#5a8ad8')+R(254,470,38,6,'#ff8fb5');return s},
  T=>{const c={ceil:'#eee6d8',lw:'#e7dccb',rw:'#e0d3c0',fl:T.dk?'#94765a':'#c4986c',bw:'#efe6d7'};let s=room(130,110,382,360,c)+glassDef(T);
   s+=R(150,140,212,110,'#d9b88a')+[[160,150,'#fff7c0'],[220,156,'#ffd1e6'],[290,148,'#cfe8ff'],[172,200,'#d8f5d0'],[246,206,'#fff'],[310,198,'#ffe0c0']].map(([x,y,f],i)=>R(x,y,48,36,f,`transform="rotate(${(i%3-1)*4} ${x} ${y})"`)+C(x+24,y+3,3,'#e8446a')).join('');
   for(let i=0;i<6;i++)s+=R(140+i*40,270,36,88,'#9fb8d8')+R(140+i*40,270,36,88,'none','stroke="#7a96bd" stroke-width="2"')+C(170+i*40,312,2,'#5a6a8a');
   s+=P('M512 40L382 120V330L512 420Z',glass(T))+L('M447 80V375','#f7f2ea',5)+shaft(T,'M512 40L382 120V330L512 420L512 683H300L382 330Z');
   for(let r=0;r<3;r++)for(let k=0;k<3;k++){const sp=.85+r*.35,y=430+r*90,x=256+(k-1)*150*sp;s+=`<g transform="translate(${x.toFixed(1)} ${y}) scale(${sp.toFixed(2)})">${R(-36,-8,72,10,'#c49c6e')+R(-32,2,4,40,'#7a7a8a')+R(28,2,4,40,'#7a7a8a')+R(-18,-34,36,22,'#b98d60')}</g>`}
   return s+R(150,50,212,12,'#fff','opacity=".7"')}];
 // SCHOOL ROOFTOP
 S.rooftop=[
  T=>{let s=sky(T,0,470)+sun(T,0,470,.3)+clouds(T,51,6,30,300,1.1);
   const r=rnd(5);for(let i=0;i<14;i++){const w=24+r()*40,h=40+r()*120;s+=bldg(T,i*38-10,470-h,w,h,['#c8cfe0','#d8d6e6','#b9c4d8'][i%3],i+60,{cw:5,ch:6,gx:4,gy:5})}
   s+=R(0,470,W,213,T.dk?'#8a8790':'#b8bcc4')+P('M0 560H512V683H0Z','#000','opacity=".06"');
   s+=R(0,330,W,8,'#e8ecf0')+R(0,450,W,10,'#e8ecf0');for(let i=0;i<=32;i++)s+=R(i*16,330,3,130,'#c8d0d8');
   s+=`<g opacity=".55">${Array.from({length:40},(_,i)=>L(`M${i*14-140} 338L${i*14-20} 450M${i*14+120} 338L${i*14} 450`,'#9aa6b4',1)).join('')}</g>`;
   s+=R(30,560,170,14,'#7a6a5a')+R(36,574,8,30,'#5a4a3a')+R(186,574,8,30,'#5a4a3a')+R(30,540,170,8,'#8a7a6a');return s+glassDef(T)},
  T=>{let s=sky(T,0,520)+sun(T,0,520,.78)+clouds(T,61,5,40,340);
   s+=R(0,470,W,213,T.dk?'#88858e':'#bcc0c8');
   s+=R(60,250,200,260,'#e9e4dc')+R(60,240,210,16,'#d4cdc2')+R(120,350,70,160,'#7a8494')+R(126,356,58,90,glass(T))+C(178,440,3,'#e8e8e8')+R(80,290,22,30,glass(T));
   s+=R(300,280,150,120,'#dfe3ea')+E(375,280,75,16,'#cfd4dc')+R(320,400,8,90,'#9aa2ac')+R(422,400,8,90,'#9aa2ac')+L('M324 430L426 480M426 430L324 480','#9aa2ac',3)+R(360,300,30,4,'#aab')+`<text x="375" y="350" text-anchor="middle" font-size="16" fill="#8a94a4" font-family="sans-serif">TANK</text>`;
   s+=R(0,452,W,8,'#e8ecf0');for(let i=0;i<=32;i++)s+=R(i*16,400,2,60,'#c8d0d8');s+=R(0,400,W,5,'#e8ecf0');
   return s+P('M0 683L0 600Q120 580 200 620T512 600V683Z','#000','opacity=".05"')+glassDef(T)},
  T=>{let s=sky(T,0,683)+sun(T,0,600,.18)+clouds(T,71,7,20,420,1.2);
   s+=P('M0 683L512 430V683Z',T.dk?'#86838c':'#b6bac2')+P('M0 520L512 300',"none")+P('M0 470L512 290L512 300L0 486Z','#eef1f4');
   for(let i=0;i<=22;i++){const x=i*24,y0=470-x*.352,y1=683-x*.494;s+=L(`M${x} ${y0}L${x} ${y0+((683-470)*(1-x/512))*.0+ (y1-y0)*.72}`,'#c8d0d8',2.4)}
   s+=P('M0 640L512 400',"none")+L('M0 640L512 400','#eef1f4',8);
   s+=`<g transform="translate(330 560)">${R(-80,-10,160,12,'#7a6a5a')}${R(-74,2,8,32,'#5a4a3a')}${R(66,2,8,32,'#5a4a3a')}${R(-80,-30,160,8,'#8a7a6a')}</g>`;
   return s+glassDef(T)}];
 // SCHOOL CORRIDOR
 S.corridor=[
  T=>{const c={ceil:'#efeae2',lw:'#e7ded0',rw:'#ece4d8',fl:T.dk?'#8a8a7a':'#b8b8a8',bw:'#e9e1d4'};let s=room(216,250,296,350,c)+glassDef(T);
   for(let i=0;i<5;i++){const t=i/5,x0=t*216,x1=(t+.14)*216,y0=t*250+40*(1-t),y1=H-(t)*(H-350)-120*(1-t);s+=P(`M${x0} ${y0+30}L${x1} ${y0+30+(x1-x0)*.8}V${y1-80}L${x0} ${y1-60}Z`,glass(T))}
   s+=shaft(T,'M0 70L40 102V500L0 600Z')+shaft(T,'M0 600L216 350H240L60 683H0Z');
   for(let i=0;i<4;i++){const t=.1+i*.2,x=W-t*216,y=t*250+30;s+=P(`M${x} ${y+20}L${x-30*(1-t*.6)} ${y+20+24*(1-t)}V${H-t*(H-350)-40}L${x} ${H-t*(H-350)-20}Z`,'#c9a27a')+R(x-28*(1-t*.6),y-6,24*(1-t*.6),12*(1-t*.6),'#fff')}
   for(let i=0;i<6;i++){const t=i/6,y=t*250;s+=R(W/2-60*(1-t),y+12,120*(1-t),6*(1-t)+1,'#fff','opacity=".9"')}
   s+=P(`M216 350H296L512 683H0Z`,'#fff','opacity=".08"');return s},
  T=>{let s=R(0,0,W,H,'#efe8dc')+glassDef(T);
   s+=R(0,420,W,263,T.dk?'#8e8a80':'#c6c0b2');for(let k=0;k<4;k++)s+=L(`M0 ${470+k*50}H${W}`,'#000',1,'opacity=".07"');
   for(let c=0;c<6;c++)for(let r=0;r<5;r++){const x=24+c*78,y=110+r*62;s+=R(x,y,72,56,'#d9dee6')+R(x+4,y+4,64,48,'#c6ccd6')+R(x+30,y+24,12,4,'#8a94a4')+(r==4?'':R(x+6,y+8,22,10,(c+r)%3?'#ffffff':'#ff9ec4','opacity=".9"'))}
   s+=R(16,100,480,8,'#b8bec8')+R(16,420,480,10,'#a8aeb8')+R(0,0,W,90,'#f5f0e7')+R(80,20,140,50,glass(T))+R(292,20,140,50,glass(T))+shaft(T,'M80 70H220L260 300H120Z');
   s+=R(30,480,120,40,'#6a8ad0','rx="6"')+R(360,500,80,28,'#e86a8a','rx="6"')+E(256,640,180,20,'#000','opacity=".06"');return s},
  T=>{let s=R(0,0,W,H,'#ece5da')+glassDef(T);
   s+=R(140,40,232,250,'#f7f2ea')+skyR(T,150,50,212,230)+R(150,200,212,80,'#c8cfe0','opacity=".7"')+tree(330,280,.8,'round',T)+L('M256 50V280M150 165H362','#f7f2ea',6)+shaft(T,'M150 280H362L470 683H40Z');
   for(let i=0;i<9;i++){const y=330+i*40,x=60-i*6;s+=R(x,y,W-2*x,40,T.dk?(i%2?'#9a948a':'#a8a296'):(i%2?'#cfc8ba':'#ddd6c8'))+R(x,y,W-2*x,4,'#fff','opacity=".35"')}
   s+=L('M40 300L80 683','#b89a7a',8)+L('M472 300L432 683','#b89a7a',8)+L('M40 300H140','#b89a7a',6)+L('M472 300H372','#b89a7a',6);return s}];
 // CITY STREET
 S.street=[
  T=>{let s=sky(T,0,360)+sun(T,0,360,.5)+clouds(T,81,3,20,160,.8);
   s+=P('M0 0L200 250V420L0 683Z','#d9c8b8')+P('M512 0L312 250V420L512 683Z','#c8c2d6');
   for(let i=0;i<6;i++){const t=i/6,x=200*t,y0=250*t+30,h=(1-t)*300;s+=win(T,x+6,y0+20,12*(1-t)+4,h*.3,200+i)+win(T,x+6,y0+30+h*.4,12*(1-t)+4,h*.3,210+i);const X=W-x-18*(1-t)-6;s+=win(T,X,y0+20,12*(1-t)+4,h*.3,220+i)+win(T,X,y0+30+h*.4,12*(1-t)+4,h*.3,230+i)}
   s+=P('M0 683L200 420H312L512 683Z',T.dk?'#5a5866':'#7a7886')+P('M0 683L200 420H218L60 683Z','#b8b2aa')+P('M512 683L312 420H294L452 683Z','#b8b2aa');
   for(let i=0;i<8;i++){const t=i/8,y=440+t*240,w=(.2+t)*80;s+=R(256-w*1.4,y,w*2.8,(t+.2)*14,'#f2f2f2','opacity=".9"').replace(/width="[^"]+"/,m=>m)}
   s+=Array.from({length:7},(_,i)=>{const t=i/7,y=430+t*250;return R(250-2-t*4,y,4+t*8,10+t*24,'#ffe066')}).join('');
   s+=lamp(T,90,560,170,.9)+lamp(T,422,560,170,.9)+lamp(T,170,440,80,.5)+lamp(T,342,440,80,.5)+people(T,9,5,30,160,600,1.6)+people(T,10,4,360,480,610,1.6)+glassDef(T);
   s+=R(20,160,50,90,'#ff8fb5')+`<text x="45" y="214" font-size="22" text-anchor="middle" fill="#fff" font-family="sans-serif" transform="rotate(0)">花</text>`+R(440,170,50,80,'#5ab0e8')+`<text x="465" y="220" font-size="20" text-anchor="middle" fill="#fff" font-family="sans-serif">CAFÉ</text>`;return s},
  T=>{let s=sky(T,0,330)+sun(T,0,330,.15)+clouds(T,91,4,20,170);
   s+=bldg(T,-10,120,150,300,'#d7cfc4',301,{cw:14,ch:16})+bldg(T,150,170,110,250,'#c9d2e0',302)+bldg(T,270,90,120,330,'#e2d8cc',303,{cw:16,ch:18})+bldg(T,400,150,130,270,'#cfc7dc',304);
   s+=R(0,420,W,263,T.dk?'#5c5a68':'#7d7b88')+R(0,410,W,16,'#bdb6ac');for(let i=0;i<10;i++)s+=R(30+i*48,470,30,90,'#f2f2f2','opacity=".9"');
   s+=R(0,600,W,83,'#c2bbb0')+R(0,596,W,6,'#e0dad0');
   s+=`<g transform="translate(400 600)">${R(-4,-260,8,260,'#4a4a5a')}${R(-4,-260,90,8,'#4a4a5a')}${R(54,-262,34,84,'#3a3a46','rx="6"')}${C(71,-246,9,T.dk?'#ff5050':'#7a2a2a')}${C(71,-222,9,'#6a5a2a')}${C(71,-198,9,T.dk?'#3a6a4a':'#3ae07a')}${R(-50,-150,46,46,'#3a7ae0','rx="4"')}${P('M-27 -142L-15 -112H-39Z','#fff')}</g>`;
   s+=lamp(T,60,600,200)+people(T,12,7,20,500,690,2)+glassDef(T);return s},
  T=>{let s=sky(T,0,420)+sun(T,0,420,.6)+clouds(T,101,5,20,220);
   const r=rnd(7);for(let i=0;i<16;i++){const w=30+r()*44,h=60+r()*170;s+=bldg(T,i*34-12,420-h,w,h,['#c2cadb','#d8d2e0','#b6c0d4','#e0d8cc'][i%4],i+400,{cw:5,ch:7,gx:4,gy:6,lit:.5})}
   s+=R(0,420,W,60,T.dk?'#4a4a58':'#6a6a78');for(let i=0;i<9;i++){const x=(i*61+20)%W;s+=R(x,436,26,12,['#e86a6a','#f2f2f2','#5a8ad8','#ffd066'][i%4],'rx="3"')+(T.lamp?C(x+26,444,3,'#fff6c0')+C(x,444,3,'#ff5050'):'')}
   s+=R(0,480,W,20,'#d8d2c8')+R(0,500,W,183,'#9aa0aa')+Array.from({length:12},(_,i)=>R(i*44,500,4,40,'#c8ccd4')).join('')+R(0,496,W,8,'#e8ecf0')+R(0,540,W,143,T.dk?'#8a8690':'#b8b4bc');
   s+=lamp(T,120,540,40,.8)+lamp(T,400,540,40,.8)+glassDef(T);return s}];
 // SHOPPING DISTRICT
 const shop=(T,x,y,w,h,c,sign,seed)=>{let s=R(x,y,w,h,c)+R(x,y,w,h*.18,mx(c,'#000',.2))+`<text x="${x+w/2}" y="${y+h*.13}" text-anchor="middle" font-size="${Math.max(8,h*.1)}" fill="#fff" font-family="sans-serif" font-weight="700">${sign}</text>`;
  s+=R(x+w*.08,y+h*.36,w*.84,h*.5,T.lit?'#ffe6b0':glass(T))+P(`M${x} ${y+h*.2}H${x+w}L${x+w-6} ${y+h*.34}H${x+6}Z`,['#ff8fb5','#5ab0e8','#ffd066','#7ed6a0'][seed%4])+Array.from({length:Math.max(2,Math.round(w/14))},(_,i)=>R(x+6+i*14,y+h*.2,7,h*.14,'#fff','opacity=".45"')).join('');return s};
 S.shopping=[
  T=>{let s=R(0,0,W,H,T.dk?'#4a3e58':'#d8d0c8')+glassDef(T);
   s+=P('M0 0H512L360 200H152Z',T.dk?'#3a3248':'#e8e2da');for(let i=0;i<8;i++){const t=i/8;s+=L(`M${152-152*(1-t)*0} ${200-200*t}`,'none',0)}
   for(let i=0;i<7;i++){const y=200-i*30,x0=152-i*22,x1=360+i*22;s+=L(`M${x0} ${y}H${x1}`,'#fff',2,'opacity=".5"');}
   s+=sky(T,0,0)+P('M150 0H362L340 60H172Z',glass(T),'opacity=".7"');
   for(let i=3;i>=0;i--){const t=i/4,x=152*t,s0=(1-t);s+=shop(T,x-140*s0*0,200*t+60*(1-t),(152-152*t)*.6+30,260*s0+70,['#e9c8a8','#d6c4e4','#f2d6c6','#c8dcd0'][i],['ベーカリー','CAFÉ','ほん','花'][i],i);const X=W-x-((152-152*t)*.6+30);s+=shop(T,X,200*t+60*(1-t),(152-152*t)*.6+30,260*s0+70,['#c8d6ea','#f0d0dc','#e2dcc4','#d0c8e8'][i],['SWEETS','雑貨','MUSIC','FASHION'][i],i+1)}
   s+=P('M0 683L152 330H360L512 683Z',T.dk?'#7a7080':'#cfc6ba')+Array.from({length:9},(_,i)=>{const t=i/9;return L(`M${152-152*t} ${330+353*t}H${360+152*t}`,'#000',1,'opacity=".06"')}).join('');
   s+=Array.from({length:6},(_,i)=>{const x=100+i*64;return`<g transform="translate(${x} ${60+(i%2)*14})">${L('M0 -60V0','#7a6a5a',1)}${E(0,10,12,15,['#ff6a6a','#fff0d0'][i%2],'stroke="#8a4a3a" stroke-width="1"')}${T.lamp?C(0,10,22,'#ffb070','opacity=".35"'):''}</g>`}).join('')+people(T,14,8,90,420,560,1.8);return s},
  T=>{let s=sky(T,0,120)+R(0,90,W,593,'#e8dccb')+glassDef(T);
   s+=R(0,90,W,30,'#6a4a3a')+`<text x="256" y="114" text-anchor="middle" font-size="22" fill="#fff4e0" font-family="serif" letter-spacing="4">Café Bloom</text>`;
   s+=P('M0 120H512L490 200H22Z','#ff8fb5')+Array.from({length:9},(_,i)=>P(`M${i*57} 120h28l-4 80h-26z`,'#fff','opacity=".8"')).join('')+P('M22 200Q34 214 46 200Q58 214 70 200Q82 214 94 200Q106 214 118 200Q130 214 142 200Q154 214 166 200Q178 214 190 200Q202 214 214 200Q226 214 238 200Q250 214 262 200Q274 214 286 200Q298 214 310 200Q322 214 334 200Q346 214 358 200Q370 214 382 200Q394 214 406 200Q418 214 430 200Q442 214 454 200Q466 214 478 200Q490 214 490 200Z','#ff8fb5');
   s+=R(40,230,280,250,T.lit?'#ffe1a8':glass(T))+R(40,230,280,250,'none','stroke="#6a4a3a" stroke-width="8"')+L('M180 230V480M40 355H320','#6a4a3a',5);
   s+=(T.lit?'':P('M40 300L130 230H170L40 380Z','#fff','opacity=".25"'))+[[80,330],[140,320],[220,400],[270,330]].map(([x,y])=>C(x,y,12,T.lit?'#c98a5a':'#a8b8c8','opacity=".5"')).join('');
   s+=R(350,230,120,330,'#7a5a42')+R(362,244,96,170,glass(T))+C(446,400,5,'#e8c46a')+`<g transform="translate(410 560)">${R(-36,-10,72,8,'#5a4a3a')}</g>`;
   s+=R(0,480,330,80,'#d8cbb8')+[[60,'#ff8fb5'],[120,'#ffd066'],[180,'#ff6a8a'],[240,'#c3a6ff'],[290,'#ffb3d1']].map(([x,c])=>`<g transform="translate(${x} 520)">${R(-16,-6,32,30,'#a87a52')}${C(-6,-10,10,'#5fae6a')}${C(6,-12,10,'#5fae6a')}${C(-4,-14,5,c)}${C(6,-16,5,c)}${C(0,-8,5,c)}</g>`).join('');
   s+=R(0,560,W,123,T.dk?'#8a8288':'#cfc6b8')+`<g transform="translate(70 640)">${R(-24,-60,48,58,'#3a3550','rx="3"')}<text x="0" y="-36" text-anchor="middle" font-size="9" fill="#fff" font-family="sans-serif">MENU</text>${L('M-14 -26H14M-14 -18H10M-14 -10H12','#fff',1.2)}</g>`;return s},
  T=>{let s=sky(T,0,260)+glassDef(T);const dk=1;
   s+=P('M0 0L190 260V683H0Z',T.dk?'#3a3448':'#a8a0b8')+P('M512 0L322 260V683H512Z',T.dk?'#342f44':'#9a94ae');
   const sg=[['#ff4fa0','IDOL'],['#3ae0ff','LIVE'],['#ffd23a','SALE'],['#a06aff','KARAOKE'],['#5aff9a','GAME']];
   sg.forEach(([c,t],i)=>{const y=40+i*80,on=T.dk||i%2==0;s+=R(20+i*6,y,100-i*8,46,on?'#1a1428':'#5a5068','rx="4"')+`<text x="${70}" y="${y+31}" text-anchor="middle" font-size="18" font-weight="800" font-family="sans-serif" fill="${on?c:'#ddd'}" ${on&&T.dk?`style="filter:drop-shadow(0 0 4px ${c})"`:''}>${t}</text>`;
    const X=W-120+i*6;s+=R(X,y+20,100-i*8,40,on?'#1a1428':'#5a5068','rx="4"')+`<text x="${X+50-i*4}" y="${y+47}" text-anchor="middle" font-size="16" font-weight="800" font-family="sans-serif" fill="${on?sg[(i+2)%5][0]:'#ddd'}">${['渋谷','ポップ','映画','CD','ファッション'][i]}</text>`});
   s+=R(200,60,112,80,'#1a1428')+R(206,66,100,68,T.dk?'#ff6fae':'#8ad0ff')+`<text x="256" y="108" text-anchor="middle" font-size="18" fill="#fff" font-weight="800" font-family="sans-serif">NEW SINGLE</text>`;
   s+=bldg(T,186,180,140,222,T.dk?'#2a2438':'#8a86a0',777,{cw:8,ch:10,lit:.7})+R(206,250,100,30,'#1a1428','rx="3"')+`<text x="256" y="271" text-anchor="middle" font-size="16" font-weight="800" font-family="sans-serif" fill="${T.dk?'#ffd23a':'#eee'}">109</text>`;
   s+=P('M0 683L190 400H322L512 683Z',T.dk?'#4a4258':'#a8a4b0');for(let i=0;i<7;i++)s+=R(150+i*30-i*4,500+i*0,20+i*2,180,'#f2f2f2','opacity=".85"');
   s+=people(T,16,12,20,490,640,2.2)+(T.dk?`<rect width="${W}" height="${H}" fill="#ff4fa0" opacity=".06" style="mix-blend-mode:screen"/>`:'');return s}];
 // PARK
 S.park=[
  T=>{let s=sky(T,0,330)+sun(T,0,330,.7)+clouds(T,111,4,20,180);
   s+=R(0,300,W,383,T.dk?'#6a8a5c':'#8fcf72')+tree(30,330,1.4,'round',T)+tree(120,320,1,'round',T)+tree(400,320,1.1,'round',T)+tree(490,330,1.5,'round',T)+tree(200,305,.6,'round',T)+tree(320,305,.6,'round',T);
   s+=P('M0 683L226 310H286L512 683Z',T.dk?'#b0988a':'#e8d4b0')+P('M0 683L226 310H236L40 683Z','#000','opacity=".05"');
   [[.25,1],[.55,1.6],[.85,2.3]].forEach(([t,k])=>{const y=310+t*373,xl=226-226*t-30*k,xr=286+226*t+30*k;s+=`<g transform="translate(${xl} ${y}) scale(${k})">${R(-26,-14,46,6,'#a0703a')}${R(-26,-22,46,5,'#a0703a')}${R(-22,-8,3,10,'#4a4a4a')}${R(14,-8,3,10,'#4a4a4a')}</g>`+lamp(T,xr,y,60*k,k*.9)});
   s+=tree(-40,700,3,'round',T)+tree(560,720,3.2,'round',T);return s+glassDef(T)},
  T=>{let s=sky(T,0,280)+sun(T,0,280,.3)+clouds(T,121,4,20,160);
   s+=R(0,250,W,433,T.dk?'#6a8a5c':'#8ccf70')+tree(40,280,1,'round',T)+tree(150,270,.8,'sakura',T)+tree(380,272,.9,'round',T)+tree(470,284,1.2,'sakura',T);
   s+=`<defs>${lg(id('wa'),T.sea)}</defs>`+E(256,470,300,150,`url(#${id('wa')})`)+E(256,470,300,150,'none','stroke="#c8b89a" stroke-width="8"');
   s+=sky(T,0,0)+`<g opacity=".35" transform="translate(0 0)">${E(256,470,260,40,'#fff')}</g>`;
   s+=P('M60 470Q256 330 452 470','none','stroke="#c0503a" stroke-width="14"')+L('M60 470Q256 350 452 470','#e86a4a',6)+Array.from({length:9},(_,i)=>{const x=100+i*39,y=470-Math.sin((x-60)/392*Math.PI)*112;return R(x-2,y-30,4,30,'#c0503a')}).join('')+L('M80 440Q256 320 432 440','#c0503a',3);
   s+=[[120,560],[380,590],[300,520]].map(([x,y])=>E(x,y,24,6,'#5fae6a')+C(x-4,y-4,5,'#ffc4d8')).join('');return s+glassDef(T)},
  T=>{let s=sky(T,0,420)+sun(T,0,420,.22)+clouds(T,131,6,20,300);
   s+=P('M0 420Q256 380 512 420V683H0Z',T.dk?'#6a8a5c':'#93d277')+P('M0 520Q256 470 512 520V683H0Z',T.dk?'#5f7f52':'#82c266');
   s+=tree(340,470,3.2,'round',T)+E(340,474,90,14,'#000','opacity=".1"');
   s+=`<g transform="translate(130 560)">${E(0,0,70,18,'#c8d0d8')}${E(0,-4,58,13,`url(#${id('fw')})`)}${R(-8,-60,16,56,'#d8dde4')}${E(0,-60,26,8,'#c8d0d8')}${L('M0 -64Q-20 -100 -34 -70M0 -64Q20 -100 34 -70M0 -66V-96','#cfeaff',3,'opacity=".9"')}</g><defs>${lg(id('fw'),T.sea)}</defs>`;
   s+=`<g transform="translate(470 520)">${R(-4,-60,4,60,'#e86a6a')}${R(30,-60,4,60,'#e86a6a')}${R(-6,-64,42,6,'#e86a6a')}${L('M2 -58V-20M30 -58V-20','#888',1)}${R(-2,-22,34,6,'#ffd066')}</g>`;
   s+=Array.from({length:40},(_,i)=>{const r=rnd(i+3);return C(r()*W,560+r()*120,1.6+r()*2,['#fff','#ffd8e6','#fff6a0'][i%3])}).join('')+people(T,18,4,60,280,600,1.4);return s+glassDef(T)}];
 // FLOWER GARDEN
 const bed=(x0,x1,y,h,c,c2,seed,sz)=>{const r=rnd(seed);let s=P(`M${x0} ${y}H${x1}L${x1+10} ${y+h}H${x0-10}Z`,'#6aa85a');for(let i=0;i<(x1-x0)/sz*1.6;i++){const x=x0+r()*(x1-x0),yy=y+r()*h;s+=L(`M${x.toFixed(1)} ${(yy+sz).toFixed(1)}V${yy.toFixed(1)}`,'#4f8a4a',sz*.18)+E(x.toFixed(1),yy.toFixed(1),sz*.45,sz*.6,r()<.3?c2:c)}return s};
 S.garden=[
  T=>{let s=sky(T,0,330)+sun(T,0,330,.75)+clouds(T,141,4,20,170);
   s+=R(0,300,W,383,T.dk?'#6a8a5c':'#86c76c')+tree(30,310,.9,'round',T)+tree(480,312,1,'round',T)+R(150,250,212,60,'#f2ece4')+P('M140 252L256 210L372 252Z','#c87a6a')+R(236,270,40,40,glass(T));
   const cols=[['#ff5f8a','#ffd1e0'],['#ffd23a','#fff4b0'],['#a86aff','#e8d4ff'],['#ff8a3a','#ffd0a0'],['#ffffff','#ffc4d8']];
   for(let k=0;k<5;k++){const t0=k/5,t1=(k+.7)/5;s+=P(`M${256-30-226*t0} ${320+363*t0}L${256-30-226*t1} ${320+363*t1}L${-20-60*t1} ${320+363*t1}L${-10-30*t0} ${320+363*t0}Z`,'none');}
   for(let r=0;r<6;r++){const y=330+r*r*9+r*30,h=12+r*9,sz=4+r*2.6,sp=(r+1)/6;s+=bed(0,226-sp*200,y,h,cols[r%5][0],cols[r%5][1],r+1,sz)+bed(286+sp*200,W,y,h,cols[(r+2)%5][0],cols[(r+2)%5][1],r+9,sz)}
   s+=P('M0 683L226 320H286L512 683Z',T.dk?'#a89a8a':'#e8dcc4');return s+glassDef(T)},
  T=>{let s=sky(T,0,683)+sun(T,0,600,.5)+clouds(T,151,4,20,240);
   s+=R(0,430,W,253,T.dk?'#6a8a5c':'#86c76c')+P('M150 683L226 430H286L362 683Z',T.dk?'#a89a8a':'#e8dcc4');
   const arch=(cx,y,w,h,k)=>{let o=L(`M${cx-w/2} ${y}V${y-h}Q${cx-w/2} ${y-h-w/2} ${cx} ${y-h-w/2}Q${cx+w/2} ${y-h-w/2} ${cx+w/2} ${y-h}V${y}`,'#f4f0ea',10*k);const r=rnd(Math.round(cx+w));for(let i=0;i<60;i++){const a=r(),side=r()<.5?-1:1;let x,yy;if(a<.4){x=cx+side*w/2;yy=y-r()*h}else{const th=r()*Math.PI;x=cx-Math.cos(th)*w/2;yy=y-h-Math.sin(th)*w/2}o+=C((x+(r()-.5)*14*k).toFixed(1),(yy+(r()-.5)*14*k).toFixed(1),(3+r()*4)*k,r()<.3?'#5fae6a':r()<.5?'#ff7aa0':'#ffb3c9')}return o};
   s+=arch(256,470,90,90,.5)+arch(256,540,180,170,.8)+arch(256,700,360,330,1.3);
   s+=bed(0,140,600,80,'#ff7aa0','#fff',3,10)+bed(372,W,600,80,'#ffb3c9','#ff5f8a',4,10);return s+glassDef(T)},
  T=>{let s=sky(T,0,360)+sun(T,0,360,.3)+clouds(T,161,5,20,220);
   s+=R(0,330,W,353,T.dk?'#6a7a4c':'#7fbf5c')+tree(470,340,.9,'round',T)+tree(40,345,.8,'round',T);
   const r=rnd(21),fl=`${Array.from({length:14},(_,j)=>E(0,-12,3.6,8.5,j%2?'#ffd23a':'#ffc21a',`transform="rotate(${j*25.7})" stroke="#e0a010" stroke-width=".5"`)).join('')}${C(0,0,7,'#7a4a28')}${C(-2,-2,3,'#9a6a40')}`;
   for(let row=0;row<8;row++){const y=350+row*row*4.6+row*16,sz=2.4+row*row*.7+row*.8,n=Math.ceil(W/(sz*2.4))+1;s+=R(0,y+sz*.6,W,sz*3,T.dk?'#4f6a34':'#5e9a3a');
    for(let i=0;i<n;i++){const x=(i+(row%2)*.5+(r()-.5)*.3)*(W/(n-1))-sz,yy=y+(r()-.5)*sz*.5;s+=`<g transform="translate(${x.toFixed(1)} ${yy.toFixed(1)}) scale(${(sz/10).toFixed(2)})">${L('M0 0V40','#4f8a3a',3)}${E(-8,22,8,3.4,'#5fae4a','transform="rotate(-30 -8 22)"')}${fl}</g>`}}
   return s+glassDef(T)}];
 // BEACH
 S.beach=[
  T=>{let s=sky(T,0,330)+sun(T,0,330,.55)+clouds(T,171,5,20,220);
   s+=`<defs>${lg(id('se'),T.sea)}</defs>`+R(0,330,W,170,`url(#${id('se')})`)+Array.from({length:14},(_,i)=>{const r=rnd(i+40);return L(`M${(r()*W).toFixed(0)} ${(340+r()*150).toFixed(0)}h${(20+r()*40).toFixed(0)}`,'#fff',1.4,'opacity=".5"')}).join('')+(T.dk?R(W*.62,330,60,170,'#ffd096','opacity=".35"'):'');
   s+=P('M0 500Q128 486 256 500T512 496V683H0Z',T.dk?'#d8b090':'#f4dfb4')+P('M0 500Q128 486 256 500T512 496V512Q384 520 256 510T0 516Z','#fff','opacity=".7"');
   s+=Array.from({length:6},(_,i)=>{const r=rnd(i+9);return`<g transform="translate(${(r()*W).toFixed(0)} ${(560+r()*100).toFixed(0)})">${P('M-6 0Q0 -8 6 0Q0 4 -6 0Z',['#ffb3c9','#fff','#ffd8a0'][i%3])}</g>`}).join('');return s+glassDef(T)},
  T=>{let s=sky(T,0,300)+sun(T,0,300,.7)+clouds(T,181,4,20,180);
   s+=`<defs>${lg(id('se'),T.sea)}</defs>`+R(0,300,W,383,`url(#${id('se')})`)+R(0,560,W,123,T.dk?'#d8b090':'#f4dfb4')+P('M0 560Q256 540 512 560V572Q256 556 0 576Z','#fff','opacity=".7"');
   s+=P('M200 683L246 310H266L312 683Z','#b88a5a')+Array.from({length:12},(_,i)=>{const t=i/12,y=310+373*t*t;return L(`M${246-46*t*t} ${y}H${266+46*t*t}`,'#8a6a42',1+t*2)}).join('')+[0,.25,.5,.75,1].map(t=>{const y=310+373*t*t;return R(240-48*t*t-3,y,4+t*3,20+t*40,'#7a5a3a')+R(270+46*t*t,y,4+t*3,20+t*40,'#7a5a3a')}).join('');
   s+=`<g transform="translate(256 300)">${R(-6,-30,12,30,'#fff')}${P('M-8 -30L0 -42L8 -30Z','#e86a6a')}${T.lamp?C(0,-36,14,'#fff6c0','opacity=".6"'):''}</g>`;return s+glassDef(T)},
  T=>{let s=sky(T,0,380)+sun(T,0,380,.4)+clouds(T,191,4,20,200);
   s+=`<defs>${lg(id('se'),T.sea)}</defs>`+R(0,380,W,90,`url(#${id('se')})`)+R(0,460,W,223,T.dk?'#d8b090':'#f2dcae')+P('M0 460Q256 450 512 462V470Q256 460 0 472Z','#fff','opacity=".8"');
   s+=tree(70,560,1.9,'palm',T)+tree(140,520,1.2,'palm',T)+tree(470,600,2.2,'palm',T);
   s+=`<g transform="translate(310 610)">${L('M0 0L-10 -120','#eee',4)}${P('M-80 -110Q-10 -170 60 -130Z','#ff6a8a')}${P('M-46 -122Q-10 -165 20 -136','#fff','opacity=".8"')}${E(-30,4,70,10,'#000','opacity=".1"')}${R(-70,-10,80,8,'#5ab0e8','rx="3"')}</g>`;
   s+=`<g transform="translate(430 470)">${R(-30,-90,60,8,'#fff')}${R(-30,-130,60,40,'#e86a6a')}${L('M-26 -82L-34 0M26 -82L34 0M-30 -40H30','#fff',4)}</g>`+C(200,600,16,'#fff','stroke="#ff6a8a" stroke-width="8" stroke-dasharray="12 12"');return s+glassDef(T)}];
 // PHOTOGRAPHY STUDIO
 const softbox=(T,x,y,s,flip)=>`<g transform="translate(${x} ${y}) scale(${flip?-s:s} ${s})">${L('M0 0V180M0 180L-20 210M0 180L20 210M0 180V210','#3a3a46',3)}${P('M-30 -50L30 -40V40L-30 50Z','#2a2a34')}${P('M-26 -42L26 -34V34L-26 42Z',T.dk?'#ffe2b8':'#ffffff')}${C(0,0,60,T.dk?'#ffcf90':'#fff',`opacity="${T.dk?.18:.12}"`)}</g>`;
 S.studio=[
  T=>{let s=R(0,0,W,H,T.dk?'#4a4450':'#6a6670');const bg=T.dk?['#e8c6b0','#f4ddd0']:T.n=='Morning'?['#e8eef6','#f6f8fb']:['#f4eef0','#fbf8f8'];
   s+=`<defs>${lg(id('pp'),bg)}${rg(id('sp'),'#fff',.8)}</defs>`+P('M80 0H432V420Q432 520 512 560V683H0V560Q80 520 80 420Z',`url(#${id('pp')})`)+E(256,380,200,180,`url(#${id('sp')})`,'opacity=".5"')+R(70,0,372,14,'#2a2a34')+C(76,7,10,'#3a3a46')+C(436,7,10,'#3a3a46');
   s+=softbox(T,34,260,1)+softbox(T,478,260,1,1)+E(256,640,200,24,'#000','opacity=".06"')+L('M0 683L60 600','#2a2a34',3);return s},
  T=>{let s=R(0,0,W,H,'#efe8e0')+glassDef(T);
   s+=R(300,40,190,330,'#fff')+skyR(T,310,50,170,310)+tree(420,360,1,'round',T)+L('M395 50V360M310 205H480','#fff',6)+shaft(T,'M310 360H480L360 683H60Z');
   s+=R(0,470,W,213,T.dk?'#9a8270':'#c9a27a')+Array.from({length:8},(_,i)=>L(`M0 ${490+i*26}H${W}`,'#000',1,'opacity=".06"')).join('');
   s+=`<g transform="translate(150 520)">${R(-110,-60,220,70,'#f2b8c8','rx="20"')}${R(-120,-100,240,60,'#f6c4d2','rx="24"')}${R(-130,-60,30,80,'#eaa8bc','rx="14"')}${R(100,-60,30,80,'#eaa8bc','rx="14"')}${R(-100,10,8,16,'#7a5a42')}${R(92,10,8,16,'#7a5a42')}${C(-60,-80,18,'#fff','opacity=".8"')}</g>`;
   s+=`<g transform="translate(450 560)">${P('M-20 0L-14 -40H14L20 0Z','#e8d8c8')}${C(0,-60,26,'#5fae6a')}${C(-16,-80,16,'#6fbe7a')}${C(18,-78,18,'#4f9e5a')}</g>`+`<g transform="translate(40 300)">${R(-4,0,8,200,'#3a3a46')}${C(0,0,40,'#fff','opacity=".85"')}${C(0,0,30,T.dk?'#ffe2b0':'#fdfdfd')}</g>`;return s},
  T=>{let s=R(0,0,W,H,T.dk?'#3e3a48':'#5a5866');const c=T.dk?'#f0c8a8':'#dfe8f0';
   s+=P('M0 60H330V460L512 560V683H0Z',c)+P('M330 60L512 0V560L330 460Z',mx(c,'#000',.08))+P('M0 460H330L512 560V683H0Z',mx(c,'#fff',.2));
   s+=`<g transform="translate(420 380)">${L('M0 0L-30 200M0 0L30 200M0 0V200','#2a2a34',3)}${R(-26,-24,52,32,'#2a2a34','rx="4"')}${C(-26,-8,14,'#3a3a46')}${C(-30,-8,9,'#6a8ad8')}${R(-10,-32,20,8,'#2a2a34')}</g>`;
   s+=`<g transform="translate(70 230)">${L('M0 0V260M0 260L-20 290M0 260L20 290','#2a2a34',3)}${P('M0 -10Q-70 -60 -80 20Q-40 -10 0 -10Z','#fff')}${P('M0 -10Q70 -60 80 20Q40 -10 0 -10Z','#f0f0f4')}${C(0,0,70,'#fff','opacity=".14"')}</g>`+E(200,620,150,20,'#000','opacity=".08"');return s}];
 // CONCERT HALL
 S.hall=[
  T=>{const live=T.dk,reh=T.n=='Afternoon';let s=R(0,0,W,H,live?'#120a24':'#2a2238');
   s+=R(0,0,W,90,'#1a1228')+Array.from({length:9},(_,i)=>R(i*60,60,40,14,'#2a2a3a')+C(i*60+20,82,6,live?['#ff4fa0','#3ae0ff','#ffd23a'][i%3]:reh?'#fff2c0':'#6a6a7a')).join('');
   s+=R(110,120,292,170,'#0a0a14')+R(116,126,280,158,live?'#ff6fae':reh?'#3a5a8a':'#222234')+`<text x="256" y="215" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" font-family="sans-serif" opacity="${live?1:.6}">LIVE</text>`;
   s+=P('M40 330H472L512 420H0Z',live?'#2a2040':'#4a4058')+R(0,420,W,24,'#1a1428')+(live||reh?Array.from({length:5},(_,i)=>P(`M${80+i*88} 0L${40+i*88} 420H${120+i*88}Z`,live?['#ff4fa0','#3ae0ff','#ffd23a','#a06aff','#5aff9a'][i]:'#fff4d0',`opacity="${live?.22:.12}"`)).join(''):'');
   s+=R(0,444,W,239,live?'#0c0818':'#1e1828');for(let r=0;r<6;r++){const y=470+r*36;for(let i=0;i<22;i++){const x=i*24+(r%2)*12-6;s+=C(x,y,9+r*.8,live?'#1a1426':'#3a2a48')+(live?L(`M${x+4} ${y}L${x+8} ${y-22-r*2}`,['#ff4fa0','#3ae0ff','#ffd23a','#fff','#a06aff'][(i+r)%5],3,'stroke-linecap="round"'):'')}}
   return s+(T.n=='Morning'?R(0,0,W,H,'#fff','opacity=".06"'):'')},
  T=>{const live=T.dk;let s=R(0,0,W,H,live?'#0e0820':'#3a3050');
   for(let t=0;t<8;t++){const y=120+t*t*6+t*34,w=W*(.5+t*.1);s+=P(`M${256-w/2} ${y}H${256+w/2}L${256+w/2+20} ${y+30+t*4}H${256-w/2-20}Z`,live?'#1a1030':mx('#8a3a4a','#000',.2*(7-t)/7))}
   for(let t=0;t<8;t++){const y=128+t*t*6+t*34,w=W*(.5+t*.1),n=10+t*2;for(let i=0;i<n;i++){const x=256-w/2+(i+.5)*w/n;s+=live?L(`M${x} ${y+8}L${x+3} ${y-6-t}`,['#ff4fa0','#3ae0ff','#ffd23a','#fff','#a06aff'][(i+t)%5],2+t*.4,'stroke-linecap="round"')+C(x,y+12,3+t*.6,'#1a1426'):R(x-4-t*.5,y,8+t,10+t,'#a84a5a','rx="2"')}}
   s+=R(0,0,W,110,live?'#0a0614':'#2a2040')+Array.from({length:6},(_,i)=>C(40+i*86,40,10,live?'#fff6c0':T.n=='Afternoon'?'#ffe8b0':'#d8d0e8')).join('');
   s+=P('M0 600H512V683H0Z',live?'#2a2040':'#5a4a6a')+R(0,596,W,6,'#e8c46a')+(live?Array.from({length:3},(_,i)=>P(`M${100+i*156} 683L${60+i*156} 0H${140+i*156}Z`,'#fff','opacity=".05"')).join(''):'');return s},
  T=>{let s=R(0,0,W,H,'#4a2a2a');const warm=T.dk?'#ffcf8a':T.n=='Afternoon'?'#fff0d0':'#f6ead8';
   s+=`<defs>${rg(id('ch'),warm,.9)}</defs>`+R(0,0,W,H,'#6a3a34')+P('M0 0H512V120H0Z','#7a4a3a');for(let i=0;i<9;i++)s+=R(i*60+8,130,44,200,'#5a2e2a')+R(i*60+12,134,36,192,'#7a3e36');
   s+=R(0,330,W,20,'#e8c46a')+R(0,350,W,60,'#5a2a2a')+Array.from({length:16},(_,i)=>R(i*32+6,360,20,30,'#a8444a','rx="4"')).join('')+R(0,410,W,12,'#e8c46a');
   s+=C(256,90,120,`url(#${id('ch')})`)+L('M256 0V50','#e8c46a',2)+Array.from({length:12},(_,i)=>{const a=i/12*Math.PI;return C(256+Math.cos(a)*60,70+Math.sin(a)*24,4,'#fff8e0')+L(`M256 50L${256+Math.cos(a)*60} ${70+Math.sin(a)*24}`,'#e8c46a',1)}).join('')+E(256,92,40,12,'#e8c46a');
   s+=R(0,422,W,261,'#3a1e1e');for(let r=0;r<6;r++){const y=450+r*40;for(let i=0;i<12;i++)s+=R(i*44+(r%2)*22-10,y,36,30,'#a8343a','rx="6"')+R(i*44+(r%2)*22-10,y+22,36,8,'#7a2028')}
   return s}];
 const LOCS=[['school','School',['Front building','School gate','Schoolyard']],['classroom','Classroom',['From the back','Window side','Back wall']],['rooftop','School rooftop',['City view','Stairwell door','Fence corner']],['corridor','School corridor',['Long corridor','Shoe lockers','Staircase window']],['street','City street',['Avenue','Crossing','Skyline bridge']],['shopping','Shopping district',['Shopping arcade','Café front','Neon street']],['park','Park',['Park path','Pond bridge','Big tree lawn']],['garden','Flower garden',['Flower beds','Rose arches','Sunflower field']],['beach','Beach',['Shoreline','Pier','Palm beach']],['studio','Photography studio',['Paper backdrop','Window set','Cyclorama']],['hall','Concert hall',['Stage view','From the stage','Classical hall']]];
 function svg(k,v,t,uid){const f=(S[k]||S.school)[v|0]||S[k][0],T=TOD[t]||TOD.a;U=(uid||'l')+'_';try{return`<g>${f(T)}${grade(T)}</g>`}catch(e){console.error(e);return R(0,0,W,H,'#ccc')}}
 return{LOCS,TOD,svg,W,H}})();
