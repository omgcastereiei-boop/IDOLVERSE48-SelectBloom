// =====================================================================================
//  IDOLVERSE48: Select Bloom!  —  Illustrated environments (UI only)
//  Each main screen is a different place inside the same idol agency. Drawn as layered
//  2D SVG illustrations (1600x900, scaled to cover the viewport) — walls, windows, city,
//  furniture, lighting and depth. Contract kept from the previous version: SCN(key) -> svg,
//  setScene(key) cross-fades the fixed #scene layer.
// =====================================================================================
const SCN=(()=>{
 const R=(x,y,w,h,f,o='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${o}/>`,
  E=(cx,cy,rx,ry,f,o='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${o}/>`,
  P=(d,f,o='')=>`<path d="${d}" fill="${f}" ${o}/>`,
  lg=(id,stops,v=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${v?0:1}" y2="${v?1:0}">${stops.map((c,i)=>`<stop offset="${(i/(stops.length-1)).toFixed(3)}" stop-color="${c}"/>`).join('')}</linearGradient>`,
  rg=(id,c1,c2,o2=0)=>`<radialGradient id="${id}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}" stop-opacity="${o2}"/></radialGradient>`,
  rnd=s=>{let a=s|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 // ---------- reusable building blocks
 const defsCommon=`<defs>${lg('sky',['#9fd2ff','#cfe9ff','#fff1f6'])}${lg('skyEve',['#7b8fe0','#d7a6e6','#ffd3c2'])}${lg('skyNight',['#1d2350','#3b3a7a','#7c5aa8'])}${rg('glow','#fff7e6','#fff7e6')}${rg('pinkGlow','#ffd0e4','#ffd0e4')}${rg('blueGlow','#cfe6ff','#cfe6ff')}${lg('shaft',['#fffdf5','#fffdf5'],0)}${lg('wood',['#d9b48c','#c49870'])}${lg('woodD',['#a8794f','#8a5f3c'])}${lg('floorW',['#e6c9a6','#cfa983'])}${lg('cream',['#fff8ee','#f3e4cf'])}${lg('mir',['#eef6ff','#cfe0f5','#f6fbff'])}${lg('glass',['#dff1ff','#bcdcf6'])}</defs>`;
 function room(o){const{wall=['#fbeee6','#f3dfd3'],floor=['#e8cfb2','#c9a37d'],hz=600,vp=800,planks=1,mold='#fffaf4',base='#d8bfa4',wp=0}=o;
  let s=lg('wl',wall)+lg('fl',floor);s=`<defs>${s}</defs>`+R(0,0,1600,hz,'url(#wl)');
  if(wp=='stripe'){for(let x=0;x<1600;x+=64)s+=R(x,0,32,hz,'#ffffff','opacity=".22"')}
  if(wp=='dots'){const r=rnd(5);for(let y=30;y<hz-40;y+=60)for(let x=(y/60%2)*40;x<1600;x+=80)s+=`<path d="M${x} ${y}l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#fff" opacity=".35"/>`}
  if(wp=='panel'){for(let x=40;x<1600;x+=260)s+=R(x,hz-230,220,180,'none','stroke="#ffffff" stroke-width="5" opacity=".5" rx="6"')}
  s+=R(0,0,1600,26,mold)+R(0,26,1600,8,'#000','opacity=".04"');
  s+=P(`M0 ${hz}H1600V900H0Z`,'url(#fl)');
  if(planks){for(let i=-14;i<=14;i++){const x=vp+i*150;s+=`<path d="M${vp+i*12} ${hz}L${x*1.0+(x-vp)*.9} 900" stroke="#000" stroke-opacity=".07" stroke-width="2"/>`}
   for(let k=1;k<7;k++){const y=hz+Math.pow(k/7,1.6)*(900-hz);s+=`<path d="M0 ${y.toFixed(1)}H1600" stroke="#000" stroke-opacity=".05" stroke-width="2"/>`}}
  s+=R(0,hz-22,1600,22,base)+R(0,hz-24,1600,4,'#fff','opacity=".6"')+R(0,hz,1600,10,'#000','opacity=".06"');return s}
 function windowW(x,y,w,h,o={}){const{sky='url(#sky)',city=1,curt='#f7c9da',night=0,seed=3}=o,r=rnd(seed);let s=R(x-14,y-14,w+28,h+28,'#fffaf3','rx="6"')+R(x,y,w,h,sky);
  s+=E(x+w*.75,y+h*.32,90,60,'#fff','opacity=".55"')+E(x+w*.25,y+h*.22,70,26,'#fff','opacity=".7"')+E(x+w*.35,y+h*.2,50,22,'#fff','opacity=".8"');
  if(city){let cx=x;while(cx<x+w){const bw=30+r()*60,bh=h*(.18+r()*.38);s+=R(cx,y+h-bh,bw,bh,night?'#3a3770':'#b9c6e6',`opacity="${night?1:.85}"`);for(let wy=y+h-bh+10;wy<y+h-8;wy+=16)for(let wx=cx+6;wx<cx+bw-8;wx+=12)if(r()<.5)s+=R(wx,wy,5,7,night?'#ffe9a8':'#e8eefb');cx+=bw+4}}
  s+=R(x+w/2-4,y,8,h,'#fffaf3')+R(x,y+h/2-4,w,8,'#fffaf3')+R(x-24,y+h+10,w+48,14,'#fffaf3','rx="4"');
  if(curt){s+=P(`M${x-60} ${y-40}Q${x-30} ${y+h*.5} ${x-50} ${y+h+60}L${x+40} ${y+h+60}Q${x+10} ${y+h*.5} ${x+70} ${y-40}Z`,curt,'opacity=".95"')+P(`M${x+w+60} ${y-40}Q${x+w+30} ${y+h*.5} ${x+w+50} ${y+h+60}L${x+w-40} ${y+h+60}Q${x+w-10} ${y+h*.5} ${x+w-70} ${y-40}Z`,curt,'opacity=".95"');
   s+=`<path d="M${x-30} ${y-30}Q${x-6} ${y+h*.5} ${x-24} ${y+h+50}M${x+w+30} ${y-30}Q${x+w+6} ${y+h*.5} ${x+w+24} ${y+h+50}" stroke="#fff" stroke-width="6" opacity=".35" fill="none"/>`+R(x-90,y-56,w+180,16,'#d9b48c','rx="8"')}
  return s}
 const shafts=(x,y,n=3,op=.18,ang=26)=>{let s='';for(let i=0;i<n;i++){const xx=x+i*90;s+=P(`M${xx} ${y}L${xx+70} ${y}L${xx+70+Math.tan(ang*Math.PI/180)*620+160} 900L${xx+Math.tan(ang*Math.PI/180)*620} 900Z`,'#fffbe9',`opacity="${op}"`)}return s};
 const plant=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${P('M-34 0L34 0L26 70L-26 70Z','#f2e6d6','stroke="#d8c3a6" stroke-width="3"')}${R(-36,-4,72,10,'#e7d6bd','rx="4"')}${[[-70,-120,-20],[60,-140,15],[-30,-170,-5],[20,-180,8],[-80,-60,-40],[85,-70,35],[0,-150,0]].map(([lx,ly,r])=>`<path d="M0 0Q${lx*.4} ${ly*.5} ${lx} ${ly}Q${lx*.2+10} ${ly*.4} 0 0Z" fill="${r%2?'#8fcf9c':'#76b98a'}" stroke="#5f9c72" stroke-width="2"/>`).join('')}</g>`;
 const sparkle=(n,seed,col='#fff',y0=0,y1=900)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*1600,y=y0+r()*(y1-y0),z=4+r()*10;s+=`<path d="M${x} ${y-z}Q${x+z*.15} ${y-z*.15} ${x+z} ${y}Q${x+z*.15} ${y+z*.15} ${x} ${y+z}Q${x-z*.15} ${y+z*.15} ${x-z} ${y}Q${x-z*.15} ${y-z*.15} ${x} ${y-z}Z" fill="${col}" opacity="${(.4+r()*.5).toFixed(2)}"/>`}return s};
 const bokeh=(n,seed,cols=['#ffd6e8','#e3d6ff','#d3ecff','#fff2c9'],y0=0,y1=900)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++)s+=`<circle cx="${(r()*1600).toFixed(0)}" cy="${(y0+r()*(y1-y0)).toFixed(0)}" r="${(10+r()*46).toFixed(0)}" fill="${cols[i%cols.length]}" opacity="${(.18+r()*.3).toFixed(2)}"/>`;return s};
 const petals=(n,seed)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*1600,y=r()*900,a=r()*360;s+=`<path d="M0 0C6 -8 14 -6 12 2C10 9 2 8 0 0Z" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${a.toFixed(0)}) scale(${(1+r()*1.4).toFixed(2)})" fill="#ffc6dc" opacity=".8"/>`}return s};
 const frame=(x,y,w,h,inner,c='#d9b48c')=>R(x-10,y-10,w+20,h+20,c,'rx="4"')+R(x,y,w,h,'#fff')+inner;
 const poster=(x,y,w,h,hue,seed)=>{const r=rnd(seed);return frame(x,y,w,h,`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="hsl(${hue} 70% 86%)"/><circle cx="${x+w/2}" cy="${y+h*.42}" r="${w*.22}" fill="hsl(${hue} 60% 70%)"/><path d="M${x+w*.2} ${y+h*.95}Q${x+w/2} ${y+h*.5} ${x+w*.8} ${y+h*.95}Z" fill="hsl(${hue} 60% 70%)"/><path d="M${x+w*.12} ${y+h*.14}h${w*.5}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>${sparkleAt(x+w*.8,y+h*.2,10)}`,'#f0d9b5')};
 const sparkleAt=(x,y,z,c='#fff')=>`<path d="M${x} ${y-z}Q${x+z*.15} ${y-z*.15} ${x+z} ${y}Q${x+z*.15} ${y+z*.15} ${x} ${y+z}Q${x-z*.15} ${y+z*.15} ${x-z} ${y}Q${x-z*.15} ${y-z*.15} ${x} ${y-z}Z" fill="${c}"/>`;
 const shelf=(x,y,w,rows=3,seed=9)=>{const r=rnd(seed);let s=R(x,y,w,rows*80+20,'url(#woodD)','rx="6"')+R(x+10,y+10,w-20,rows*80,'#6f4a2e');for(let i=0;i<rows;i++){let bx=x+16;const by=y+10+i*80;while(bx<x+w-30){const bw=12+r()*16,bh=46+r()*26;s+=R(bx,by+80-bh,bw,bh,`hsl(${Math.floor(r()*360)} 55% ${70+Math.floor(r()*14)}%)`,'rx="2"');bx+=bw+2;if(r()<.12){s+=`<circle cx="${bx+14}" cy="${by+62}" r="14" fill="#ffe2a8"/>`;bx+=32}}s+=R(x+10,by+78,w-20,8,'#c49870')}return s};
 const lamp=(x,y)=>`<g transform="translate(${x} ${y})">${E(0,-140,120,120,'url(#glow)','opacity=".55"')}${P('M-46 -180L46 -180L30 -120L-30 -120Z','#fff6e0','stroke="#e8d3a8" stroke-width="3"')}${R(-4,-120,8,120,'#c9a77a')}${E(0,0,40,10,'#c9a77a')}</g>`;
 const clock=(x,y,r=46)=>`<g transform="translate(${x} ${y})"><circle r="${r+8}" fill="#e9d2ad"/><circle r="${r}" fill="#fffdf8"/>${[...Array(12)].map((_,i)=>`<circle cx="${Math.sin(i*Math.PI/6)*r*.8}" cy="${-Math.cos(i*Math.PI/6)*r*.8}" r="3" fill="#c8a6d8"/>`).join('')}<path d="M0 0V${-r*.6}M0 0L${r*.42} ${r*.1}" stroke="#7a5d8f" stroke-width="5" stroke-linecap="round"/></g>`;
 const rug=(cx,cy,rx,ry,c1,c2)=>E(cx,cy,rx,ry,c1)+E(cx,cy,rx-26,ry-12,'none',`stroke="${c2}" stroke-width="6" stroke-dasharray="18 10"`);
 const garland=(y,seed)=>{const r=rnd(seed);let s=`<path d="M0 ${y}Q400 ${y+70} 800 ${y}T1600 ${y}" stroke="#e8c27a" stroke-width="3" fill="none"/>`;for(let i=0;i<26;i++){const x=i*64+20,yy=y+Math.sin(i/25*Math.PI*2)*-0+(i%13<6.5?1:1)*Math.sin((x/1600)*Math.PI*2)*35+35*Math.sin(x/1600*Math.PI*2*1)*0;s+=P(`M${x-16} ${y+8+Math.abs(Math.sin(x/800*Math.PI))*50}l16 34 16-34Z`,['#f7bcd2','#c9b6ef','#a9d8f5','#f1dcae'][i%4])}return s};
 const sofa=(x,y,w,c)=>`<g transform="translate(${x} ${y})">${R(0,-70,w,90,c,'rx="28"')}${R(-24,-30,48,80,c,'rx="20"')}${R(w-24,-30,48,80,c,'rx="20"')}${R(16,-6,w-32,40,'#fff','opacity=".35" rx="14"')}${R(20,40,14,30,'#b48c63')}${R(w-34,40,14,30,'#b48c63')}<circle cx="${w*.3}" cy="-24" r="22" fill="#fff" opacity=".7"/><circle cx="${w*.7}" cy="-24" r="22" fill="#ffd9e8"/></g>`;
 const spot=(x,y,tx,c='#fff8e0',op=.22)=>P(`M${x-14} ${y}L${x+14} ${y}L${tx+170} 900L${tx-170} 900Z`,c,`opacity="${op}"`)+E(x,y,18,10,'#fffbe9');
 const crowd=(y,seed,n=160,night=1)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*1640-20,yy=y+r()*120,c=['#ff8fc0','#b9a2ff','#8fd0ff','#fff08a','#9ff0c4'][i%5];s+=E(x,yy+40,22,28,night?'#2a2350':'#d8cfe6')+`<path d="M${x+8} ${yy+24}L${x+18+r()*14} ${yy-30}" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`+`<circle cx="${(x+18).toFixed(0)}" cy="${(yy-26).toFixed(0)}" r="12" fill="${c}" opacity=".35"/>`}return s};
 const S={
 office(){let s=room({wall:['#fdf1e8','#f4e1d4'],wp:'panel'})+windowW(560,90,480,330,{seed:4})+shafts(620,90,3,.16);
  s+=shelf(90,170,300,4,11)+clock(1300,150)+poster(1180,250,110,150,330,2)+poster(1340,250,110,150,260,5);
  s+=rug(800,780,520,90,'#f6d6e3','#fff');
  s+=`<g>${P('M380 560L1220 560L1300 690L300 690Z','url(#wood)','stroke="#b48c63" stroke-width="3"')}${R(300,690,1000,26,'#b48c63')}${R(330,716,30,150,'#a37a51')}${R(1240,716,30,150,'#a37a51')}${R(560,520,180,40,'#fff','rx="6"')}${R(580,470,140,80,'#3e3550','rx="6"')}${R(588,478,124,62,'#9fd2ff')}${R(880,530,90,30,'#f7c9da','rx="4"')}${R(890,515,70,18,'#c9b6ef','rx="4"')}${E(1060,545,30,12,'#fff')}${R(1046,500,28,45,'#fffaf3','rx="6"')}${P('M1074 512q18 2 0 22','none','stroke="#fffaf3" stroke-width="6"')}${R(420,530,80,30,'#ffe9a8','rx="4"')}</g>`;
  s+=plant(1460,640,1.2)+plant(160,660,1)+lamp(1530,560)+sparkle(18,7,'#fff',0,560);return s},
 lounge(){let s=room({wall:['#f2ecfb','#e6dcf5'],floor:['#f0dcc5','#d4b48f'],wp:'dots'})+windowW(980,110,420,300,{curt:'#c9b6ef',seed:9})+shafts(1040,110,2,.14);
  s+=frame(160,150,200,140,`<rect x="160" y="150" width="200" height="140" fill="#ffe3ef"/><circle cx="210" cy="220" r="30" fill="#f7bcd2"/><circle cx="270" cy="210" r="34" fill="#c9b6ef"/><circle cx="320" cy="225" r="28" fill="#a9d8f5"/>`)+frame(420,170,130,120,`<rect x="420" y="170" width="130" height="120" fill="#e3f3ff"/>${sparkleAt(485,230,26,'#ffd96a')}`);
  s+=rug(760,770,560,100,'#fbe3ec','#fff')+sofa(420,640,520,'#f4b8cf')+`${R(640,700,200,16,'#fffaf3','rx="8"')}${R(660,716,12,50,'#d9b48c')}${R(808,716,12,50,'#d9b48c')}${E(700,694,18,8,'#fff')}${R(740,680,40,16,'#c9b6ef','rx="3"')}`;
  s+=plant(1480,650,1.1)+plant(120,680,.9)+lamp(1180,600)+garland(40,3)+bokeh(14,4,undefined,0,500);return s},
 dressing(){let s=room({wall:['#fff0f5','#f8dbe6'],floor:['#f3e3d3','#d9bea1'],wp:'stripe'});
  for(let i=0;i<3;i++){const x=180+i*440;s+=R(x-20,120,320,300,'#f6e1c2','rx="16"')+R(x,140,280,260,'url(#mir)','rx="10"')+P(`M${x+40} 160L${x+120} 160L${x+40} 380Z`,'#fff','opacity=".45"');for(let k=0;k<6;k++)s+=`<circle cx="${x-10+k*60}" cy="112" r="13" fill="#fff6d0" stroke="#f0d9a0" stroke-width="3"/><circle cx="${x-10+k*60}" cy="112" r="34" fill="url(#glow)" opacity=".6"/>`;
   s+=R(x-40,440,360,30,'#f1dcc0','rx="8"')+R(x-30,470,340,110,'#fff4ea','rx="6"')+R(x+20,410,30,30,'#f7c9da','rx="6"')+R(x+70,400,16,40,'#c9b6ef','rx="4"')+E(x+200,428,30,10,'#ffe9a8')}
  // costume rack
  s+=R(60,520,1480,10,'#c9a77a','rx="5"');const r=rnd(12);for(let i=0;i<22;i++){const x=90+i*66,h=['#f7bcd2','#c9b6ef','#a9d8f5','#f1dcae','#fff','#9fe0c0'][i%6];s+=P(`M${x} 530L${x+30} 530L${x+46} ${640+r()*40}L${x-16} ${640+r()*40}Z`,h,'stroke="#e2cfd8" stroke-width="2"')+`<path d="M${x+15} 520v10" stroke="#a37a51" stroke-width="3"/>`}
  s+=sparkle(26,13,'#fff',0,600);return s},
 rehearsal(){let s=room({wall:['#eef4fb','#dbe7f4'],floor:['#e7cba6','#c79f74'],planks:1});
  s+=R(0,100,1600,420,'url(#mir)')+[...Array(7)].map((_,i)=>R(i*240,100,8,420,'#cfdced')).join('')+P('M200 120L340 120L120 500L0 500Z','#fff','opacity=".35"')+P('M900 120L960 120L780 500L720 500Z','#fff','opacity=".3"');
  s+=R(0,470,1600,14,'#d9b48c','rx="7"')+[...Array(9)].map((_,i)=>R(60+i*190,484,10,90,'#c9a77a')).join('');
  s+=`<g transform="translate(1340 640)">${R(-60,-110,120,160,'#3e3550','rx="12"')}<circle cy="-60" r="36" fill="#5b5070"/><circle cy="-60" r="18" fill="#2a2338"/><circle cy="10" r="20" fill="#5b5070"/></g>${R(1200,700,90,24,'#a9d8f5','rx="12"')}${E(1130,720,26,26,'#f7bcd2')}`;
  s+=R(0,0,1600,40,'#fffaf4')+[...Array(6)].map((_,i)=>E(140+i*270,50,70,14,'#fffbe9')+E(140+i*270,60,220,90,'url(#glow)','opacity=".35"')).join('');return s},
 studio(){let s=room({wall:['#efe8f6','#ddd3ec'],floor:['#cfc2dc','#a99bbd'],planks:0});
  for(let y=60;y<520;y+=70)for(let x=(y/70%2)*35;x<1600;x+=70)s+=P(`M${x} ${y}l35 20v35l-35 20l-35-20v-35z`,'#e3dbf0','stroke="#cfc4e2" stroke-width="2"');
  s+=R(880,110,620,360,'#2c2742','rx="14"')+R(900,130,580,320,'url(#glass)','opacity=".85" rx="8"')+P('M960 130L1060 130L960 450L900 450Z','#fff','opacity=".35"');
  s+=`<g transform="translate(1180 300)">${R(-4,0,8,170,'#5b5070')}<circle cy="-24" r="28" fill="#7a6f90"/><circle cy="-24" r="40" fill="none" stroke="#7a6f90" stroke-width="6"/>${E(0,170,60,12,'#5b5070')}</g>${R(1060,190,110,90,'#fff','opacity=".6" rx="4"')}`;
  s+=P('M60 600L760 600L820 720L0 720Z','#4a4166','stroke="#2c2742" stroke-width="3"')+R(0,720,820,30,'#2c2742');for(let i=0;i<14;i++)s+=R(70+i*48,618,30,60,'#2c2742','rx="4"')+R(80+i*48,630+((i*37)%30),10,18,['#ff8fc0','#8fd0ff','#fff08a'][i%3],'rx="3"');
  s+=`<g transform="translate(110 420)">${R(-60,-120,120,170,'#2c2742','rx="10"')}<circle cy="-60" r="40" fill="#4a4166"/><circle cy="-60" r="18" fill="#1b172a"/></g><g transform="translate(720 420)">${R(-60,-120,120,170,'#2c2742','rx="10"')}<circle cy="-60" r="40" fill="#4a4166"/><circle cy="-60" r="18" fill="#1b172a"/></g>`;
  s+=E(1190,200,260,180,'url(#pinkGlow)','opacity=".35"')+frame(300,140,140,140,`<circle cx="370" cy="210" r="56" fill="#2c2742"/><circle cx="370" cy="210" r="20" fill="#f7bcd2"/>`,'#e5c98e')+frame(500,160,120,120,`<circle cx="560" cy="220" r="48" fill="#2c2742"/><circle cx="560" cy="220" r="16" fill="#a9d8f5"/>`,'#e5c98e');return s},
 photo(){let s=R(0,0,1600,900,'#efe6ea')+`<defs>${lg('bd',['#fde3ec','#f6d0de','#efc4d4'])}</defs>`+P('M420 0H1180V620Q800 700 420 620Z','url(#bd)')+R(400,0,800,40,'#cdb7a0','rx="12"');
  s+=P('M420 620Q800 700 1180 620L1260 900H340Z','#f8e1ea');
  const box=(x,y,flip)=>`<g transform="translate(${x} ${y}) scale(${flip?-1:1} 1)">${R(-4,0,8,420,'#5b5070')}${P('M-20 420L20 420L60 520L-60 520Z','none','stroke="#5b5070" stroke-width="8"')}${P('M-110 -110L110 -110L80 60L-80 60Z','#fffdf6','stroke="#cfc4d8" stroke-width="5"')}${E(0,-20,150,140,'url(#glow)','opacity=".6"')}</g>`;
  s+=box(180,300)+box(1420,300,1)+shafts(250,180,2,.12,-10)+shafts(1180,180,2,.12,10);
  s+=`<g transform="translate(800 700)">${P('M-80 0L80 0L120 200M-80 0L-120 200M0 0V200','none','stroke="#3e3550" stroke-width="8"')}${R(-70,-90,140,80,'#3e3550','rx="12"')}<circle cx="0" cy="-50" r="30" fill="#6b6085"/><circle cx="0" cy="-50" r="16" fill="#a9d8f5"/></g>`+sparkle(30,21,'#fff',0,700);return s},
 stage(t=1){let s=R(0,0,1600,900,'url(#skyNight)')+E(800,330,900,420,'url(#pinkGlow)','opacity=".35"');
  s+=P('M0 0H1600V90Q800 130 0 90Z','#7b2f5a')+P('M0 0H260Q230 400 120 900H0Z','#8e3566')+P('M1600 0H1340Q1370 400 1480 900H1600Z','#8e3566');for(let i=0;i<10;i++)s+=P(`M${i*26} 0Q${i*26+20} 400 ${i*12} 900`,'none','stroke="#6e244e" stroke-width="5" opacity=".7"')+P(`M${1600-i*26} 0Q${1580-i*26} 400 ${1600-i*12} 900`,'none','stroke="#6e244e" stroke-width="5" opacity=".7"');
  s+=R(380,150,840,300,'#1b1838','rx="12"')+R(396,166,808,268,'#3a2f6e','rx="8"')+(t?`<text x="800" y="330" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="80" fill="#ffd0e4" opacity=".85">LIVE ✦ BLOOM</text>`:sparkle(24,77,'#ffd0e4',170,430));
  s+=spot(300,90,520,'#ffd6ea')+spot(800,90,800,'#fffbe0',.25)+spot(1300,90,1080,'#d6e8ff');
  s+=P('M180 560H1420L1600 680H0Z','#4b3a7a')+P('M0 680H1600V720H0Z','#2c2350')+E(800,600,520,40,'#ffffff','opacity=".14"');
  s+=crowd(720,3,170)+sparkle(50,5,'#fff6c0',0,520);return s},
 tour(){let s=R(0,0,1600,900,'url(#skyEve)')+E(1240,250,160,160,'#fff2d0','opacity=".8"')+E(1240,250,300,300,'url(#glow)','opacity=".5"');
  const r=rnd(31);let x=0;while(x<1600){const w=60+r()*90,h=160+r()*260;s+=R(x,560-h,w,h+40,'#8a7bb8','opacity=".75"');for(let wy=560-h+14;wy<580;wy+=22)for(let wx=x+8;wx<x+w-10;wx+=16)if(r()<.45)s+=R(wx,wy,8,10,'#ffe9a8','opacity=".85"');x+=w+8}
  s+=P('M0 600H1600V900H0Z','#d9c6e8')+P('M640 600L960 600L1400 900H200Z','#c2b0d6')+[...Array(8)].map((_,i)=>R(790,620+i*36,20,20,'#fff','opacity=".7"')).join('');
  s+=`<g transform="translate(240 560)">${R(-120,-180,240,180,'#fff6ec','rx="10"')}${R(-130,-200,260,30,'#f7bcd2','rx="8"')}<text x="0" y="-178" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">TOUR BUS</text>${R(-100,-150,60,50,'#a9d8f5','rx="6"')}${R(-20,-150,60,50,'#a9d8f5','rx="6"')}${R(60,-150,40,50,'#a9d8f5','rx="6"')}<circle cx="-70" cy="0" r="24" fill="#3e3550"/><circle cx="70" cy="0" r="24" fill="#3e3550"/></g>`;
  s+=petals(30,7)+sparkle(16,9,'#fff',0,300);return s},
 fanclub(){let s=room({wall:['#fff3e8','#fde3ef'],floor:['#f6dfc8','#e0bf9c'],wp:'dots'});
  s+=R(0,120,1600,60,'#f7bcd2')+`<text x="800" y="162" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="40" fill="#fff">✦ FAN MEETING ✦ ありがとう ✦</text>`;
  for(let i=0;i<5;i++)s+=poster(120+i*300,230,150,200,(i*70+300)%360,40+i);
  s+=garland(200,8);for(let i=0;i<4;i++){const x=150+i*400;s+=R(x,560,300,40,'#fffaf3','rx="10"')+R(x+10,600,280,150,'#f8e4ec','rx="6"')+R(x+40,520,90,40,'#c9b6ef','rx="6"')+R(x+170,510,90,50,'#a9d8f5','rx="6"')+`<path d="M${x+60} 590h180" stroke="#f7bcd2" stroke-width="8" stroke-linecap="round"/>`}
  s+=bokeh(16,12)+sparkle(20,14);return s},
 charts(){let s=R(0,0,1600,900,'#22204a')+`<defs>${lg('scr',['#2f2b66','#1d1a44'])}</defs>`;for(let x=0;x<1600;x+=80)s+=R(x,0,2,600,'#ffffff','opacity=".04"');
  s+=R(120,90,1360,440,'url(#scr)','rx="18" stroke="#6c62c8" stroke-width="6"');const r=rnd(17);for(let i=0;i<12;i++){const h=60+r()*300;s+=R(200+i*104,500-h,64,h,['#f7a3c8','#b9a2ec','#8cc8ef'][i%3],'rx="8" opacity=".85"')}
  s+=`<path d="M200 420${[...Array(12)].map((_,i)=>`L${232+i*104} ${180+r()*200}`).join('')}" stroke="#ffe08a" stroke-width="6" fill="none"/><text x="180" y="150" font-family="Dela Gothic One,sans-serif" font-size="46" fill="#fff">WEEKLY RANKING</text><text x="1440" y="150" text-anchor="end" font-family="M PLUS Rounded 1c,sans-serif" font-size="30" fill="#ffd0e4">オリコン風チャート</text>`;
  s+=P('M0 600H1600V900H0Z','#2c2856')+P('M300 640H1300L1420 820H180Z','#3b3570','stroke="#6c62c8" stroke-width="4"')+[...Array(6)].map((_,i)=>spot(160+i*256,0,160+i*256,['#ffd6ea','#d6e8ff','#fffbe0'][i%3],.08)).join('')+sparkle(30,19,'#fff',0,600);return s},
 audition(){let s=room({wall:['#f4efe8','#e9e0d4'],floor:['#e2c8a8','#c6a37d'],wp:'panel'});
  s+=R(500,110,600,260,'#fff','rx="10" stroke="#e2cfa8" stroke-width="6"')+`<text x="800" y="200" text-anchor="middle" font-family="Dela Gothic One,sans-serif" font-size="54" fill="#e57aa6">AUDITION</text><text x="800" y="260" text-anchor="middle" font-family="M PLUS Rounded 1c,sans-serif" font-size="30" fill="#8f80a6">オーディション会場 ・ 第一次審査</text>${sparkleAt(560,160,18,'#f1c15f')}${sparkleAt(1040,320,14,'#c9b6ef')}`;
  s+=P('M200 620H1400L1460 700H140Z','#fffaf3','stroke="#d8bfa4" stroke-width="3"')+R(140,700,1320,140,'#f7e3ea','stroke="#e6c4d2" stroke-width="3"');
  for(let i=0;i<4;i++){const x=320+i*320;s+=R(x-60,640,120,40,'#fff','rx="6" stroke="#e2cfa8" stroke-width="3"')+`<text x="${x}" y="667" text-anchor="middle" font-size="20" font-weight="700" fill="#8f80a6">JUDGE ${i+1}</text>`+R(x-20,600,40,40,'#a9d8f5','rx="4" opacity=".8"')}
  s+=E(800,560,180,30,'#fff','opacity=".45"')+spot(800,0,800,'#fffbe9',.18)+plant(80,640,1)+plant(1520,640,1);return s},
 manage(){let s=room({wall:['#f1f3f8','#e1e6f0'],floor:['#d9cdbd','#b9a68f'],wp:'panel'})+windowW(1040,100,440,320,{curt:'#cfd8ea',seed:21});
  s+=shelf(100,150,260,4,33)+R(420,180,520,300,'#fff','rx="10" stroke="#d8c3a6" stroke-width="5"');for(let i=0;i<5;i++)s+=R(450,210+i*52,220,30,['#f7bcd2','#c9b6ef','#a9d8f5','#f1dcae','#9fe0c0'][i],'rx="6"');
  s+=`<path d="M720 440L760 360L800 390L860 280L900 320" stroke="#e57aa6" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<3;i++)s+=R(1060+i*130,520,110,200,'#e6dfd3','rx="6" stroke="#cbbfa9" stroke-width="3"')+R(1080+i*130,550,70,10,'#b7a68f','rx="4"')+R(1080+i*130,620,70,10,'#b7a68f','rx="4"');
  s+=P('M200 640H900L960 720H140Z','url(#wood)','stroke="#b48c63" stroke-width="3"')+R(140,720,820,22,'#b48c63')+R(300,600,120,40,'#3e3550','rx="6"')+R(560,610,80,30,'#fff','rx="4"')+plant(1500,660,1)+clock(980,140,40);return s},
 backstage(){let s=room({wall:['#e9e2f2','#d8cde9'],floor:['#b9aac9','#9a89ad'],planks:0});
  s+=R(80,140,240,420,'#5b5070','rx="8"')+R(100,160,200,380,'#6b6085')+`<text x="200" y="250" text-anchor="middle" font-size="26" font-weight="800" fill="#ffd0e4">STAGE →</text>`;
  for(let i=0;i<5;i++)s+=R(420+i*230,180,180,260,'#3e3550','rx="8"')+R(430+i*230,190,160,60,'#4a4166','rx="6"')+`<circle cx="${510+i*230}" cy="330" r="40" fill="#2c2742"/>`;
  s+=R(0,460,1600,14,'#ffd36a')+[...Array(16)].map((_,i)=>R(i*100,460,50,14,'#2c2742')).join('')+sparkle(20,51,'#fff6c0',0,450);return s},
 title(){return S.stage(0)+petals(40,113)}};
 S.default=S.office;
 return k=>`<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defsCommon}${(S[k]||S.office)()}</svg>`.replace(/id="(\w+)"/g,`id="${k}_$1"`).replace(/url\(#(\w+)\)/g,`url(#${k}_$1)`)})();
const _scCache={};let _scKey=null;
function setScene(k){const el=document.getElementById('scene');if(!el||_scKey===k)return;_scKey=k;const svg=_scCache[k]||(_scCache[k]=SCN(k));const old=[...el.children];old.forEach(o=>{o.classList.add('out');setTimeout(()=>o.remove(),700)});const d=document.createElement('div');d.className='lyr';d.dataset.k=k;d.innerHTML=svg;el.appendChild(d)}
