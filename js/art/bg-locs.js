// =====================================================================================
//  IDOLVERSE48: Select Bloom! — new Location Backgrounds for the shared library (640 × 480 boards)
//  10 environments × 3 compositions. Each composition differs from the existing MV scenes of a similar
//  place (e.g. the MV "Aquarium" is one wide tank panorama — here: underwater tunnel, jellyfish hall,
//  reef porthole wall). Places with visible sky offer Morning / Afternoon / Evening; enclosed places
//  offer lighting presets instead (applied by BGLIB.render).
// =====================================================================================
(function(){const W=640,H=480,f=v=>Math.round(v*10)/10;
 function kit(u){let n=0,defs='';const K={};const id=p=>u+p+(++n);
  K.R=(x,y,w,h,c,o='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${o}/>`;K.P=(d,c,o='')=>`<path d="${d}" fill="${c}" ${o}/>`;
  K.C=(x,y,r,c,o='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${o}/>`;K.E=(x,y,rx,ry,c,o='')=>`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${o}/>`;
  K.L=(d,c,w,o='')=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" ${o}/>`;
  K.lg=(st,x2=0,y2=1)=>{const i=id('g');defs+=`<linearGradient id="${i}" x1="0" y1="0" x2="${x2}" y2="${y2}">${st.map((c,j)=>`<stop offset="${(j/Math.max(1,st.length-1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`;return`url(#${i})`};
  K.rg=(c,o=1,c2)=>{const i=id('r');defs+=`<radialGradient id="${i}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c2||c}" stop-opacity="0"/></radialGradient>`;return`url(#${i})`};
  K.blur=(s)=>{const i=id('b');defs+=`<filter id="${i}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;return`filter="url(#${i})"`};
  K.rnd=s=>{let a=s|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
  K.glow=(x,y,r,c,o=.7)=>K.C(x,y,r,K.rg(c,o));
  // one-point perspective room: back wall (x,y,w,h) toward the canvas edges
  K.room=(x,y,w,h,c)=>K.P(`M0 0H${W}L${x+w} ${y}H${x}Z`,c.ce||'#e8e2d8')+K.P(`M0 0L${x} ${y}V${y+h}L0 ${H}Z`,c.lw||'#d8d0c4')+K.P(`M${W} 0L${x+w} ${y}V${y+h}L${W} ${H}Z`,c.rw||c.lw||'#d0c8bc')+K.P(`M0 ${H}L${x} ${y+h}H${x+w}L${W} ${H}Z`,c.fl||'#b89a78')+K.R(x,y,w,h,c.bw||'#f0ebe2');
  K.sky=(t,x,y,w,h)=>{const S={m:['#8fc2ec','#cfe6f7','#fde5cc'],a:['#3f8fe0','#88c4f0','#dcefff'],e:['#232a66','#7a4a86','#e0807a','#ffbd80']}[t]||['#3f8fe0','#dcefff'];let s=K.R(x,y,w,h,K.lg(S));
   if(t=='e'){const r=K.rnd(9);for(let i=0;i<24;i++)s+=K.C(x+r()*w,y+r()*h*.5,r()<.2?1.4:.8,'#fff',`opacity="${(.4+r()*.5).toFixed(2)}"`)}else s+=K.glow(x+w*(t=='m'?.2:.78),y+h*(t=='m'?.6:.25),40,t=='m'?'#fff1c8':'#ffffff',.9);return s};
  K.cloud=(x,y,s,c='#fff',o=.9)=>`<g fill="${c}" opacity="${o}">${K.E(x,y,28*s,9*s,c)}${K.C(x-12*s,y-4*s,10*s,c)}${K.C(x+6*s,y-8*s,14*s,c)}${K.C(x+20*s,y-2*s,8*s,c)}</g>`;
  K.stars=(n,x,y,w,h,seed,c='#fff')=>{const r=K.rnd(seed);let s='';for(let i=0;i<n;i++)s+=K.C(x+r()*w,y+r()*h,r()<.15?1.8:r()<.5?1:.6,c,`opacity="${(.35+r()*.65).toFixed(2)}"`);return s};
  K.fish=(x,y,s,c,flip)=>`<g transform="translate(${f(x)} ${f(y)}) scale(${flip?-s:s} ${s})">${K.E(0,0,12,6,c)}${K.P('M10 0l9 -6v12z',c)}${K.C(-6,-1.5,1.3,'#0a1a30')}</g>`;
  K.bulbs=(pts,c,on)=>pts.map(([x,y])=>(on?K.glow(x,y,7,c,.6):'')+K.C(x,y,2.2,on?'#fff7d0':c)).join('');
  K.uid=()=>id('c');K.flw=x=>{let o='';for(let i=0;i<9;i++)o+=K.C(x-50+i*12,322+(i%3)*5,4,['#ff7a9a','#ffd27a','#ffffff'][i%3]);return o};
  K.out=b=>`<defs>${defs}</defs>${b}`;return K}
 const add=(id,n,setting,col,views,d,ext)=>BGLIB.add({id:'nl:'+id,n,kind:'loc',src:'lib',cat:'venue',setting,col,vars:views.map(v=>v[0]),W,H,tier:ext&&ext.tier||'tk+',city:ext&&ext.city||'Tokyo',
  tods:setting=='out'||(ext&&ext.tod)?['m','a','e']:null,lts:setting=='out'||(ext&&ext.tod)?null:['std','warm','cool','drama','neon'],space:ext&&ext.space||'center',
  draw:(o)=>{const K=kit(o.u);return K.out(views[o.v][1](K,o.tod||'a'))}});
 // ---------------------------------------------------------------- 1 Aquarium
 add('aquarium','Aquarium','in',['summer','fantasy'],[
  ['Underwater tunnel',K=>{let s=K.R(0,0,W,H,K.lg(['#0a4a8a','#0a2a5a','#04142e']));const r=K.rnd(4);for(let i=0;i<9;i++)s+=K.P(`M${f(r()*W)} 0l${f(30+r()*40)} 0l${f(-120+r()*60)} ${H}l-40 0z`,'#7fd0ff',`opacity="${(.05+r()*.06).toFixed(2)}"`);
   for(let i=0;i<14;i++)s+=K.fish(r()*W,40+r()*260,.8+r()*1.4,['#ffb347','#7ff0ff','#ffe066','#ff7fa6','#bfe8ff'][i%5],r()<.5);
   for(let k=7;k>=0;k--){const t=k/7,rx=40+t*300,ry=30+t*250,cy=230+t*30;s+=K.L(`M${f(320-rx)} ${f(cy+ry*.55)}V${f(cy)}A${f(rx)} ${f(ry)} 0 0 1 ${f(320+rx)} ${f(cy)}V${f(cy+ry*.55)}`,'#bfe9ff',2+t*6,`opacity="${(.25+t*.5).toFixed(2)}"`)}
   s+=K.P(`M300 300L340 300L${W} ${H}L0 ${H}Z`,K.lg(['#1a3a5a','#2a6a8a']))+K.P(`M310 300h20l90 ${H-300}h-200z`,'#3aa0c8','opacity=".35"');for(let i=0;i<30;i++)s+=K.C(r()*W,r()*H*.8,1+r()*3,'none',`stroke="#d8f6ff" stroke-width="1" opacity=".5"`);return s}],
  ['Jellyfish hall',K=>{let s=K.R(0,0,W,H,K.lg(['#0b0b2a','#160c38','#05051a']))+K.R(0,360,W,120,K.lg(['#120a30','#05051a']));const T=[[120,'#ff6fd8'],[320,'#6fe6ff'],[520,'#b88aff']];
   T.forEach(([x,c],i)=>{const w=i==1?150:110,top=i==1?40:80,h=i==1?320:270;s+=K.glow(x,top+h/2,w*1.3,c,.35)+K.R(x-w/2,top,w,h,K.lg([c,'#120a30']),`rx="${w/2}" opacity=".55"`)+K.R(x-w/2,top,w,h,'none',`rx="${w/2}" stroke="${c}" stroke-width="3" opacity=".8"`);
    const r=K.rnd(i+3);for(let j=0;j<(i==1?6:4);j++){const jx=x-w/3+r()*w*.66,jy=top+40+r()*(h-120),js=8+r()*12;s+=K.P(`M${f(jx-js)} ${f(jy)}A${f(js)} ${f(js*.8)} 0 0 1 ${f(jx+js)} ${f(jy)}Z`,'#fff',`opacity=".75"`)+[0,1,2,3].map(q=>K.L(`M${f(jx-js*.6+q*js*.4)} ${f(jy)}q${f(4-q*2)} ${f(js)} 0 ${f(js*2.2)}`,'#fff',1.2,'opacity=".55"')).join('')}
    s+=K.E(x,top+h+12,w*.7,10,c,'opacity=".25"')+K.R(x-w/2,top+h+40,w,30,c,`opacity=".08" rx="15"`)});return s}],
  ['Reef porthole wall',K=>{let s=K.R(0,0,W,H,K.lg(['#1d3c58','#0f2236']))+K.R(0,390,W,90,'#0b1826');const P=[[160,170,70],[320,200,120],[480,170,70]];
   P.forEach(([x,y,r],i)=>{s+=K.C(x,y,r+14,'#55708a')+K.C(x,y,r+6,'#9fb8cc');const cid=K.uid();s+=`<clipPath id="${cid}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><g clip-path="url(#${cid})">${K.R(x-r,y-r,r*2,r*2,K.lg(['#2ab0e8','#0a5a9a']))}${K.P(`M${x-r} ${y+r*.5}q${r*.4} ${-r*.3} ${r*.8} 0t${r*.8} 0t${r*.8} 0V${y+r}H${x-r}Z`,'#e8c890')}
    ${[[-.5,'#ff7f7f'],[-.15,'#ffb347'],[.25,'#ff6fb8'],[.55,'#9b7bff']].map(([o,c],j)=>K.P(`M${f(x+o*r)} ${f(y+r*.6)}q${f(-r*.15)} ${f(-r*.35)} 0 ${f(-r*.55)}q${f(r*.12)} ${f(r*.2)} ${f(r*.08)} ${f(r*.55)}z`,c)+K.C(x+o*r,y+r*.05,r*.08,c)).join('')}
    ${K.fish(x-r*.3,y-r*.3,r/45,'#ffe066')}${K.fish(x+r*.3,y-r*.1,r/60,'#7ff0ff',1)}${K.P(`M${x-r} ${y-r}l${r*.6} 0l${-r*.5} ${r*2}h-30z`,'#fff','opacity=".12"')}</g>`});
   s+=K.R(60,330,180,16,'#6a4a3a',`rx="6"`)+K.R(400,330,180,16,'#6a4a3a',`rx="6"`)+K.R(0,388,W,4,'#4a6a88');return s}]]);
 // ---------------------------------------------------------------- 2 Planetarium
 add('planetarium2','Planetarium Dome','in',['fantasy','cool'],[
  ['Star projector',K=>{let s=K.R(0,0,W,H,'#05061a')+K.E(320,400,420,400,K.lg(['#141a4a','#070a24']))+K.stars(220,0,0,W,330,11);
   for(let i=0;i<10;i++){const a=-160+i*14;s+=K.P(`M320 300L${f(320+Math.cos(a*Math.PI/180)*700)} ${f(300+Math.sin(a*Math.PI/180)*700)}l14 6z`,'#cfe0ff','opacity=".06"')}
   s+=K.L('M80 120Q200 60 300 140T560 110','#9fb4ff',1,'opacity=".35"')+K.R(312,300,16,70,'#3a3f60')+K.C(282,290,30,'#4a5078')+K.C(358,290,30,'#4a5078')+K.R(282,284,76,12,'#3a3f60');
   for(let i=0;i<8;i++)s+=K.C(266+i*9,282,1.6,'#fff')+K.C(342+i*9,282,1.6,'#fff');
   for(let k=0;k<4;k++)s+=K.P(`M0 ${380+k*28}Q320 ${350+k*30} ${W} ${380+k*28}v18Q320 ${370+k*30} 0 ${398+k*28}Z`,'#2a1838',`opacity="${.9}"`)+K.L(`M0 ${380+k*28}Q320 ${350+k*30} ${W} ${380+k*28}`,'#5a3a6a',2);return s}],
  ['Observatory telescope',K=>{let s=K.R(0,0,W,H,K.lg(['#3a3f58','#22263a']))+K.P(`M260 0H380L360 240H280Z`,K.lg(['#0a1030','#2a2a6a','#6a4a86']))+K.stars(60,262,0,116,220,4);
   s+=K.P(`M0 0H260L280 240L0 300Z`,'#4a5070')+K.P(`M${W} 0H380L360 240L${W} 300Z`,'#444a68');for(let i=0;i<6;i++)s+=K.L(`M${i*48} ${i*6}L${280-i*2} ${240}`,'#5a6080',2)+K.L(`M${W-i*48} ${i*6}L${360+i*2} 240`,'#565c7c',2);
   s+=K.P('M0 300L280 240H360L640 300V480H0Z',K.lg(['#2a2e44','#14161f']))+`<g transform="rotate(-38 320 330)">${K.R(240,300,250,56,K.lg(['#e8eaf0','#9aa0b4']),'rx="10"')}${K.R(470,292,40,72,'#c8ccd8','rx="6"')}${K.R(250,306,30,44,'#6a7088','rx="4"')}</g>`+K.R(300,330,40,110,'#5a6078')+K.P('M250 440h140l-20 -24h-100z','#40465c')+K.glow(320,100,80,'#a0a8ff',.25);return s}],
  ['Cosmic exhibition',K=>{let s=K.room(140,60,360,250,{ce:'#0a0a1e',lw:'#10102a',rw:'#0d0d24',fl:'#16162e',bw:'#0c0c22'})+K.stars(80,140,60,360,200,6);
   const PL=[[200,140,38,'#ff9a5a','#ffd0a0',0],[330,110,60,'#e8c890','#a07850',1],[470,160,30,'#6ab8ff','#2a5aa8',0],[420,250,18,'#ff6a6a','#8a2a2a',0],[250,250,22,'#b0f0c8','#3a8a6a',0]];
   PL.forEach(([x,y,r,a,b,ring])=>{s+=K.L(`M${x} 0V${y-r}`,'#8a8aa8',1,'opacity=".6"')+K.glow(x,y,r*2,a,.25)+K.C(x,y,r,K.lg([a,b],1,1))+(ring?K.E(x,y,r*1.8,r*.4,'none',`stroke="#f0e0b0" stroke-width="5" opacity=".8"`):'')});
   [[90,430],[320,450],[550,430]].forEach(([x,y])=>{s+=K.R(x-40,y-40,80,40,'#22224a')+K.P(`M${x-50} ${y-40}L${x} ${y-300}L${x+50} ${y-40}Z`,'#bfc8ff','opacity=".06"')});return s}]],{space:'center'});
 // ---------------------------------------------------------------- 3 Art Museum
 add('artmuseum','Art Museum','in',['elegant','luxury'],[
  ['Painting gallery',K=>{let s=K.room(120,70,400,250,{ce:'#efe6d6',lw:'#7a2230',rw:'#6e1e2a',fl:'#6a4a32',bw:'#8a2838'})+K.R(200,0,240,40,K.lg(['#dfefff','#ffffff']))+K.R(196,0,248,4,'#c8b68a');
   const FR=[[140,95,70,90],[230,90,120,80],[370,95,60,70],[450,90,52,96],[140,200,90,70],[250,190,140,110],[410,200,90,70]],G=[['#f6c8a0','#6a8ab8'],['#ffe0a0','#e07850'],['#a8d8c8','#3a6a8a'],['#f0d0e0','#8a5a9a'],['#c8e0a0','#5a8a4a'],['#ffd8b0','#4a6ab0'],['#e8e0c8','#9a6a4a']];
   FR.forEach(([x,y,w,h],i)=>{s+=K.R(x-6,y-6,w+12,h+12,K.lg(['#e8c060','#9a7020'],1,1))+K.R(x,y,w,h,K.lg(G[i]))+K.P(`M${x} ${y+h}l${w*.3} ${-h*.4}l${w*.25} ${h*.2}l${w*.45} ${-h*.35}V${y+h}Z`,'#000','opacity=".15"')});
   s+=K.R(250,380,140,22,'#3a2418','rx="4"')+K.R(260,402,10,30,'#2a180e')+K.R(370,402,10,30,'#2a180e')+K.R(120,318,400,3,'#c8a060');return s}],
  ['Sculpture rotunda',K=>{let s=K.R(0,0,W,H,K.lg(['#f2efe8','#dcd6ca']))+K.E(320,0,330,120,'#e6e0d4')+K.C(320,-10,70,'#fffdf4')+K.P('M250 0L180 480H460L390 0Z','#fffbe8','opacity=".35"');
   for(let i=0;i<7;i++){const x=40+i*93,sc=1-Math.abs(i-3)*.08;s+=K.R(x-14*sc,110,28*sc,260,K.lg(['#ffffff','#d8d2c4','#ffffff'],1,0))+K.R(x-20*sc,104,40*sc,12,'#e8e2d4')+K.R(x-20*sc,366,40*sc,12,'#e8e2d4')}
   s+=K.P('M0 380H640V480H0Z',K.lg(['#e8e2d6','#cfc8ba']))+K.E(320,430,240,30,'#c8bea8','opacity=".5"');
   [[160,'bust'],[320,'sphere'],[480,'figure']].forEach(([x,t])=>{s+=K.R(x-36,320,72,90,'#f4f0e8')+K.R(x-42,316,84,10,'#e2dccf');
    if(t=='bust')s+=K.E(x,300,26,18,'#fbf8f2')+K.C(x,262,22,'#fbf8f2');else if(t=='sphere')s+=K.C(x,276,40,K.lg(['#ffffff','#cfc8ba'],1,1))+K.C(x-12,262,10,'#fff','opacity=".8"');else s+=K.P(`M${x-20} 316q-6 -60 10 -90q-16 -20 10 -30q26 10 10 30q16 30 10 90z`,'#fbf8f2')});return s}],
  ['Modern exhibition',K=>{let s=K.room(110,60,420,270,{ce:'#f4f4f4',lw:'#ebebeb',rw:'#e4e4e4',fl:'#b8b8b8',bw:'#fafafa'})+K.P('M0 480L110 330H530L640 480Z',K.lg(['#c8c8c8','#9a9a9a']));
   s+=K.glow(320,190,170,'#ff4fa8',.3)+K.C(320,190,110,'none',`stroke="#ff4fa8" stroke-width="10"`)+K.C(320,190,110,'none',`stroke="#fff" stroke-width="3"`)+K.E(320,420,140,14,'#ff4fa8','opacity=".2"');
   s+=K.R(150,290,60,60,'#2ad1c9')+K.P('M150 290l14 -12h60l-14 12z','#6ae8e2')+K.P('M210 290l14 -12v60l-14 12z','#1aa8a0')+K.R(440,250,46,100,'#ffcf3a')+K.P('M440 250l12 -10h46l-12 10z','#ffe07a')+K.P('M486 250l12 -10v100l-12 10z','#d8a820');
   s+=K.L('M520 60v40M500 100h40M500 100v30M540 100v50','#555',1.4)+K.C(500,138,8,'#ff6a3a')+K.C(540,158,10,'#3a6aff')+K.C(520,112,6,'#222');return s}]],{space:'center'});
 // ---------------------------------------------------------------- 4 Game Center
 add('arcade2','Game Center','in',['cool','city','retro'],[
  ['Arcade aisle',K=>{let s=K.R(0,0,W,H,'#0d0a1e')+K.P('M0 480L290 230H350L640 480Z',K.lg(['#2a1450','#4a1a6a']));const r=K.rnd(8);for(let i=0;i<60;i++)s+=K.C(r()*W,240+r()*240,2,['#ff4fd8','#4fd8ff','#ffe04f'][i%3],'opacity=".35"');
   for(let k=0;k<6;k++){const t=1-k/6,sc=.35+t*.65;[-1,1].forEach(side=>{const x=320+side*(40+t*250),w=70*sc,h=170*sc,y=230-h*.45+t*60,cx=side<0?x-w:x;
    s+=K.R(cx,y,w,h,'#1e1a3a')+K.R(cx+w*.12,y+h*.12,w*.76,h*.32,['#ff4fd8','#4fd8ff','#ffe04f','#7aff8a'][(k+(side>0?1:0))%4])+K.glow(cx+w/2,y+h*.28,w*.8,'#ff9af0',.25)+K.R(cx+w*.05,y+h*.55,w*.9,h*.1,'#3a3460')+K.C(cx+w*.3,y+h*.6,2.5*sc,'#ff3a3a')+K.C(cx+w*.6,y+h*.6,2.5*sc,'#3a8aff')})}
   s+=K.R(0,0,W,24,'#16122c');for(let i=0;i<4;i++)s+=K.P(`M${300-i*8} ${30+i*14}H${340+i*8}`,'none')+K.R(160-i*40,30+i*16,320+i*80,3,['#ff4fd8','#4fd8ff'][i%2],'opacity=".7"');return s}],
  ['Photo sticker booths',K=>{let s=K.R(0,0,W,H,K.lg(['#fff0f8','#ffe0f0']))+K.R(0,380,W,100,K.lg(['#f8d8ec','#e8bcd8']));const B=[['#ff8ac8','#ffd0ec'],['#8ad0ff','#d8f0ff'],['#c8a0ff','#ece0ff'],['#ffd27a','#fff0c8']];
   B.forEach(([a,b],i)=>{const x=20+i*155;s+=K.R(x,70,145,320,K.lg([b,a]),'rx="14"')+K.R(x+12,90,121,90,'#fff','rx="10" opacity=".85"');
    const r=K.rnd(i+20);for(let j=0;j<7;j++){const hx=x+24+r()*97,hy=100+r()*70;s+=j%2?K.P(`M${f(hx)} ${f(hy)}l3 -6l3 6l6 0l-5 4l2 6l-6 -4l-6 4l2 -6l-5 -4z`,a):K.P(`M${f(hx)} ${f(hy+6)}c-8 -6 -6 -12 0 -9c6 -3 8 3 0 9z`,a)}
    s+=K.P(`M${x+20} 200h105v170h-105z`,a,'opacity=".9"')+[0,1,2,3,4,5].map(q=>K.L(`M${x+28+q*18} 200v170`,'#fff',1.5,'opacity=".35"')).join('')+K.R(x+12,192,121,10,'#fff','rx="5"')});
   for(let i=0;i<12;i++)s+=K.glow(30+i*55,40,16,'#fff8d0',.8);return s}],
  ['Rhythm game area',K=>{let s=K.R(0,0,W,H,K.lg(['#140a2a','#0a0614']))+K.R(0,400,W,80,'#1a1030');
   [[150,'#ff4fd8'],[490,'#4fd8ff']].forEach(([x,c])=>{s+=K.glow(x,150,180,c,.25)+K.R(x-90,40,180,250,'#221a40','rx="10"')+K.R(x-75,55,150,110,'#08061a','rx="6"');
    for(let j=0;j<5;j++)s+=K.R(x-68+j*28,70,20,80,['#ff4fd8','#ffe04f','#4fd8ff','#7aff8a','#ff7a4f'][j],`opacity="${.35+((j*37)%5)/8}" rx="3"`);
    s+=K.R(x-110,330,220,70,'#2a2250','rx="6"');const A=[[0,-1],[-1,0],[1,0],[0,1]];A.forEach(([dx,dy],j)=>{const ax=x+dx*52,ay=365+dy*18;s+=K.R(ax-22,ay-11,44,22,'#3a3270','rx="4"')+K.P(`M${ax} ${ay-7}l9 9h-5v6h-8v-6h-5z`,c,`transform="rotate(${[0,-90,90,180][j]} ${ax} ${ay})"`)});
    s+=K.R(x-100,180,28,110,'#181230')+K.R(x+72,180,28,110,'#181230')+K.C(x-86,210,10,'#2a2450')+K.C(x+86,210,10,'#2a2450')});
   for(let i=0;i<5;i++)s+=K.P(`M${80+i*120} 0L${40+i*120} 400h90z`,['#ff4fd8','#4fd8ff','#ffe04f'][i%3],'opacity=".07"');return s}]],{space:'center'});
 // ---------------------------------------------------------------- 5 Luxury Hotel
 add('grandhotel','Grand Hotel','in',['luxury','elegant'],[
  ['Atrium lobby',K=>{let s=K.R(0,0,W,H,K.lg(['#f6ead6','#e6d2b0']));for(let k=0;k<5;k++){const y=40+k*62;[-1,1].forEach(sd=>{s+=K.P(sd<0?`M0 ${y}L230 ${y+30}V${y+50}L0 ${y+40}Z`:`M${W} ${y}L410 ${y+30}V${y+50}L${W} ${y+40}Z`,'#c8a878')+K.P(sd<0?`M0 ${y+40}L230 ${y+50}V${y+58}L0 ${y+52}Z`:`M${W} ${y+40}L410 ${y+50}V${y+58}L${W} ${y+52}Z`,'#e8c880');for(let q=0;q<6;q++)s+=K.R(sd<0?q*38+6:W-q*38-12,y+46-q*1.6,3,14,'#b08850')})}
   s+=K.R(230,30,180,330,'#efe0c4')+K.P('M0 480L230 360H410L640 480Z',K.lg(['#f2ece4','#d8ccbc']))+K.P('M280 360h80l70 120h-220z','#8a1a2a','opacity=".8"');
   for(let i=0;i<5;i++)s+=K.P(`M${250-i*12} ${360-i*14}h${140+i*24}v8h-${140+i*24}z`,'#f8f0e2');
   s+=K.L('M320 0V70','#b08850',2)+K.glow(320,110,110,'#ffe8b0',.6);for(let r=0;r<3;r++)for(let i=0;i<9;i++){const a=i/9*Math.PI*2;s+=K.L(`M${f(320+Math.cos(a)*(20+r*16))} ${70+r*18}v${20+r*6}`,'#fff8e0',1.6,'opacity=".9"')+K.C(320+Math.cos(a)*(20+r*16),92+r*24,2.6,'#fffdf2')}return s}],
  ['Mirror ballroom',K=>{let s=K.room(200,90,240,200,{ce:'#f0e4cc',lw:'#e6d6b4',rw:'#e2d0ac',fl:'#9a6a3a',bw:'#efe0c0'});
   for(let k=0;k<5;k++){const t=k/5;[-1,1].forEach(sd=>{const x0=sd<0?t*200:W-t*200,x1=sd<0?(t+.16)*200:W-(t+.16)*200,yt=t*90+30,yb=H-t*190-30;s+=K.P(`M${f(x0)} ${f(yb)}L${f(x0)} ${f(yt+30)}Q${f((x0+x1)/2)} ${f(yt-6)} ${f(x1)} ${f(yt+32)}L${f(x1)} ${f(yb-8)}Z`,K.lg(['#dfe8f2','#b8c8d8','#eef4fa'],1,1))+K.P(`M${f(x0)} ${f(yb)}L${f(x0)} ${f(yt+30)}Q${f((x0+x1)/2)} ${f(yt-6)} ${f(x1)} ${f(yt+32)}L${f(x1)} ${f(yb-8)}Z`,'none',`stroke="#c8a050" stroke-width="${3-t*2}"`)})}
   for(let k=0;k<4;k++){const t=k/4,y=20+t*70,sc=1-t*.7;s+=K.L(`M320 0V${y}`,'#b08850',1)+K.glow(320,y+14*sc,50*sc,'#fff0c0',.7)+[0,1,2,3,4,5,6].map(q=>K.L(`M${f(320+(q-3)*8*sc)} ${f(y)}v${f(22*sc)}`,'#fffbe8',2*sc)).join('')}
   s+=K.P('M0 480L200 290H440L640 480Z','#fff','opacity=".12"');return s}],
  ['Penthouse suite',K=>{let s=K.R(0,0,W,H,'#2a2420')+K.R(40,40,560,300,K.lg(['#141a3a','#3a2a5a','#b05a6a']));const r=K.rnd(5);let x=40;while(x<600){const w=16+r()*30,h=40+r()*170;s+=K.R(x,340-h,w,h,'#1a1a30');for(let yy=340-h+6;yy<334;yy+=9)for(let xx=x+3;xx<x+w-4;xx+=7)if(r()<.5)s+=K.R(xx,yy,3,4,'#ffd98a');x+=w+2}
   s+=K.stars(30,40,40,560,120,2)+K.C(500,100,14,'#fff6d8');for(let i=1;i<5;i++)s+=K.R(40+i*112-2,40,4,300,'#1a1612');s+=K.R(30,30,580,10,'#1a1612')+K.R(0,0,40,H,'#6a2a2a')+K.R(600,0,40,H,'#6a2a2a');
   s+=K.R(0,340,W,140,K.lg(['#3a302a','#1e1814']))+K.R(150,350,340,60,'#d8ccb8','rx="16"')+K.R(130,330,380,40,'#e8dccb','rx="18"')+K.R(240,420,160,16,'#5a3a2a','rx="4"')+K.glow(570,300,60,'#ffd890',.6)+K.R(560,300,20,90,'#c8a060');return s}]],{space:'center'});
 // ---------------------------------------------------------------- 6 Amusement Park
 add('themepark','Theme Park','out',['fantasy','cute','summer'],[
  ['Carousel',(K,t)=>{let s=K.sky(t,0,0,W,300)+K.cloud(120,70,1.2)+K.cloud(520,50,1)+K.R(0,300,W,180,K.lg(['#e8d8c0','#c8b090']));const on=t=='e';
   s+=K.E(320,410,250,40,'#b08860')+K.R(80,380,480,30,'#f6e6c8')+K.P('M60 170L320 70L580 170Z','#ff7a9a');for(let i=0;i<10;i++)s+=K.P(`M320 70L${60+i*52} 170h26z`,'#fff4e8');s+=K.R(60,170,520,26,'#ffd27a');
   for(let i=0;i<14;i++)s+=K.P(`M${60+i*37.1} 196q18 18 37 0z`,['#ff7a9a','#fff4e8'][i%2]);s+=K.C(320,62,12,'#ffd27a')+K.bulbs(Array.from({length:14},(_,i)=>[67+i*37.5,184]),'#ffd27a',on);
   [130,225,320,415,510].forEach((x,i)=>{const y=280+(i%2)*20;s+=K.L(`M${x} 196V380`,'#e8c060',4)+`<g transform="translate(${x} ${y}) scale(${i%2?-1:1} 1)">${K.P('M-34 0q6 -26 30 -24l10 -18q10 -4 12 8l-6 12q20 4 22 22q-2 14 -14 16l-4 26h-8l2 -22h-34l-2 22h-8z',['#fff','#ffe0ec','#fff','#e0f0ff','#fff'][i])}${K.R(-12,-14,20,10,'#ff7a9a','rx="3"')}</g>`});return s}],
  ['Fantasy castle',(K,t)=>{let s=K.sky(t,0,0,W,320)+K.cloud(90,90,1)+K.cloud(560,70,1.3)+K.R(0,300,W,180,'#8ac86a')+K.P('M260 480L300 300H340L380 480Z','#efe2c8');
   const tw=(x,y,w,h,c)=>K.R(x,y,w,h,c)+K.P(`M${x-6} ${y}L${x+w/2} ${y-h*.45}L${x+w+6} ${y}Z`,'#6a7ae8')+K.R(x+w/2-4,y+h*.3,8,14,'#4a3a6a','rx="4"');
   s+=tw(200,170,50,140,'#f4eef8')+tw(390,170,50,140,'#f4eef8')+tw(285,90,70,210,'#fbf6ff')+tw(250,200,40,110,'#ece2f6')+tw(350,200,40,110,'#ece2f6')+K.R(240,240,160,70,'#f4eef8')+K.P('M300 310v-36a20 20 0 0 1 40 0v36z','#4a3a6a');
   for(let i=0;i<8;i++)s+=K.R(240+i*20,232,10,8,'#f4eef8');if(t=='e')s+=K.glow(320,200,180,'#ffd8ff',.35)+K.stars(10,0,0,W,80,3);
   [80,560].forEach(x=>s+=K.E(x,330,70,22,'#5aa850')+K.flw(x));[150,490].forEach(x=>s+=K.R(x-2,250,4,90,'#3a3a4a')+K.C(x,250,7,t=='e'?'#fff4c0':'#e8e0d0')+(t=='e'?K.glow(x,250,26,'#ffe8a0',.6):''));
   [[120,120,'#ff7a9a'],[150,100,'#7ad0ff'],[500,130,'#ffd27a']].forEach(([x,y,c])=>s+=K.L(`M${x} ${y+16}q-6 30 4 60`,'#888',1)+K.E(x,y,12,15,c));return s}],
  ['Giant Ferris wheel',(K,t)=>{let s=K.sky(t,0,0,W,H)+K.cloud(100,380,1.4,'#fff',.8);const cx=420,cy=300,R=300,on=t=='e';
   for(let i=0;i<24;i++){const a=i/24*Math.PI*2;s+=K.L(`M${cx} ${cy}L${f(cx+Math.cos(a)*R)} ${f(cy+Math.sin(a)*R)}`,'#f0f0f8',2.5,'opacity=".9"')}
   s+=K.C(cx,cy,R,'none','stroke="#ffffff" stroke-width="8"')+K.C(cx,cy,R-24,'none','stroke="#ff9ac8" stroke-width="3"')+K.C(cx,cy,24,'#f0f0f8');
   for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;if(x<-30||y>H+20)continue;s+=K.L(`M${f(x)} ${f(y)}v10`,'#ddd',2)+K.R(x-15,y+10,30,26,['#ff7a9a','#7ad0ff','#ffd27a','#9b7bff','#7aff9a'][i%5],'rx="8"')+K.R(x-10,y+14,20,9,'#e8f6ff','rx="3" opacity=".8"');
    if(on)s+=K.glow(x,y,12,'#fff0a0',.7)}
   if(on)s+=K.C(cx,cy,R,'none','stroke="#fff6b0" stroke-width="3" stroke-dasharray="2 14"');s+=K.P(`M${cx-120} ${H}L${cx} ${cy}L${cx+120} ${H}`,'none','stroke="#e8e8f0" stroke-width="10"');return s}]],{tier:'tk++',city:'Chiba',space:'left'});
 // ---------------------------------------------------------------- 7 Grand Library
 add('grandlibrary','Grand Library','in',['elegant','school','fantasy'],[
  ['Towering shelves',K=>{let s=K.room(220,60,200,300,{ce:'#3a2416',lw:'#5a3a22',rw:'#553620',fl:'#6a4a2e',bw:'#4a2e1a'});const r=K.rnd(3),bc=['#8a2a2a','#2a4a7a','#3a6a3a','#b08a3a','#5a2a5a','#c8b090'];
   const shelfRow=(x0,x1,y0,y1,yb0,yb1,steps)=>{let o='';for(let k=0;k<steps;k++){const ty=y0+(y1-y0)*k/steps,by=y0+(y1-y0)*(k+1)/steps;for(let i=0;i<22;i++){const t=i/22,x=x0+(x1-x0)*t,w=(x1-x0)/22,yt=ty+(yb0-ty)*0,hh=(by-ty)*.82;o+=K.R(x,by-hh+(1-t)*0,w*.86,hh,bc[Math.floor(r()*6)])}o+=K.R(x0,by-2,x1-x0,4,'#2a180c')}return o};
   s+=shelfRow(230,410,70,350,0,0,6);for(let k=0;k<7;k++){const t=k/7;[-1,1].forEach(sd=>{const xa=sd<0?0:W,xb=sd<0?220:420,ya=t*H,yb=60+t*300;s+=K.P(`M${xa} ${f(ya)}L${xb} ${f(yb)}L${xb} ${f(yb+300/7*.85)}L${xa} ${f(ya+H/7*.85)}Z`,bc[(k+(sd>0?2:0))%6],'opacity=".85"')+K.L(`M${xa} ${f(ya+H/7)}L${xb} ${f(yb+300/7)}`,'#2a180c',4)})}
   s+=K.L('M110 40L150 470M150 40L190 470','#c89a5a',4)+[0,1,2,3,4,5,6,7].map(q=>K.L(`M${114+q*5} ${80+q*50}h40`,'#c89a5a',3)).join('')+K.glow(320,40,120,'#ffd890',.35);return s}],
  ['Reading hall',K=>{let s=K.room(170,80,300,200,{ce:'#e8dcc4',lw:'#cdbb98',rw:'#c8b490',fl:'#8a6440',bw:'#dccca8'});for(let i=0;i<3;i++){const x=200+i*90;s+=K.P(`M${x} 260V140a30 30 0 0 1 60 0V260Z`,K.lg(['#cfe6ff','#ffffff']))+K.L(`M${x+30} 110V260M${x} 200h60`,'#a08a60',2)}
   for(let i=0;i<5;i++)s+=K.R(0,i*16,W,3,'#d8c8a8','opacity=".6"');for(let k=0;k<4;k++){const t=k/4,y=300+t*t*180,w=200+t*360,sc=.5+t*.7;[-1,1].forEach(sd=>{const x=320+sd*(60+t*130);s+=K.P(`M${f(x-w/4*sd*0-w*.18)} ${f(y)}h${f(w*.36)}l${f(10*sc)} ${f(14*sc)}h${f(-w*.36-20*sc)}z`,'#5a3a22')+K.R(x-3*sc,y-26*sc,6*sc,26*sc,'#c8a050')+K.P(`M${f(x-14*sc)} ${f(y-26*sc)}h${f(28*sc)}l${f(-6*sc)} ${f(-10*sc)}h${f(-16*sc)}z`,'#2a7a4a')+K.glow(x,y-20*sc,30*sc,'#fff0b0',.6)})}return s}],
  ['Antique spiral stair',K=>{let s=K.R(0,0,W,H,K.lg(['#4a2c1a','#2a180e']));const bc=['#8a2a2a','#2a4a7a','#3a6a3a','#b08a3a','#5a2a5a'],r=K.rnd(9);for(let row=0;row<8;row++){const y=20+row*56;for(let i=0;i<40;i++){const x=i*16;if(x>240&&x<400)continue;s+=K.R(x+1,y,13,46,bc[Math.floor(r()*5)],`opacity="${.75+r()*.25}"`)}s+=K.R(0,y+46,W,6,'#2a160a')}
   s+=K.R(312,0,16,H,'#6a4a2a');for(let i=0;i<16;i++){const a=i*.62,x=320+Math.cos(a)*120,y=460-i*28;s+=K.P(`M320 ${y}L${f(x)} ${f(y-6)}L${f(320+Math.cos(a+.5)*120)} ${f(y-2)}Z`,Math.sin(a)>0?'#8a5a32':'#6a4426')+K.L(`M${f(x)} ${f(y-6)}v-30`,'#c8a060',2)}
   s+=K.C(120,400,40,K.lg(['#4a8ab8','#2a5a3a'],1,1))+K.R(116,440,8,30,'#5a3a22')+K.E(120,474,30,6,'#3a2418')+K.glow(520,120,90,'#ffd080',.45)+K.R(510,120,20,40,'#c8a050');return s}]],{space:'center'});
 // ---------------------------------------------------------------- 8 Airport
 add('airport2','International Airport','in',['city','summer'],[
  ['Departure terminal',(K,t)=>{let s=K.R(0,0,W,H,'#e8ecf0')+K.R(0,40,W,220,'#000')+K.sky(t,0,40,W,220)+K.P('M0 0Q320 80 640 0V50Q320 120 0 50Z','#f4f6f8');for(let i=0;i<13;i++)s+=K.L(`M${i*53} ${40}V260`,'#cfd6de',3)+K.L(`M${i*53} 20L${i*53+26} 60L${i*53+53} 20`,'#c8d0d8',2);
   s+=K.R(0,250,W,10,'#c0c8d0')+K.P('M0 480L0 260H640V480Z',K.lg(['#dfe4ea','#b8c0ca']));for(let i=0;i<6;i++)s+=K.R(30+i*102,300,84,46,'#f4f6f8')+K.R(30+i*102,290,84,10,'#2a6ab8')+K.R(40+i*102,270,64,14,'#1a1e2a','rx="2"')+[0,1,2].map(q=>K.R(44+i*102,273+q*4,30+((i*17+q*11)%26),2,['#ffd23a','#7ae0ff','#fff'][q])).join('');
   s+=K.R(240,150,160,70,'#141824','rx="4"');for(let q=0;q<7;q++)s+=K.R(250,158+q*8,90+((q*29)%50),4,['#ffd23a','#ffffff','#7ae0ff'][q%3],'opacity=".85"');s+=K.P('M420 140l90 -14l-20 8l30 -2l-26 10z','#fff','opacity=".9"');return s}],
  ['Gate window',(K,t)=>{let s=K.sky(t,0,0,W,300)+K.cloud(120,80,1.4)+K.R(0,260,W,60,'#8a909a')+K.R(0,300,W,180,'#2a2e36');for(let i=0;i<8;i++)s+=K.R(i*90,290,50,4,'#f2f2f2');
   s+=K.P('M120 250Q140 170 260 160H560V250Z','#f4f6f8')+K.P('M120 250Q140 170 260 160H300V250Z','#e4e8ee')+K.P('M150 196Q170 176 210 174l6 16H160Z','#2a3a5a')+K.R(260,196,300,8,'#2a6ab8')+K.R(330,180,10,14,'#9ab0c8','rx="2"')+K.R(360,180,10,14,'#9ab0c8','rx="2"')+K.R(390,180,10,14,'#9ab0c8','rx="2"');
   s+=K.P('M560 190L640 170V230L560 236Z','#c8ccd4')+K.R(470,250,8,40,'#555')+K.C(474,292,10,'#222')+K.R(180,250,8,40,'#555')+K.C(184,292,10,'#222');
   for(let i=0;i<=6;i++)s+=K.R(i*107-4,0,8,330,'#3a3e48');s+=K.R(0,326,W,10,'#3a3e48')+K.P('M0 336H640V480H0Z',K.lg(['#6a7080','#40444e']));for(let i=0;i<4;i++)s+=K.R(40+i*150,400,120,30,'#2a5aa8','rx="6"')+K.R(40+i*150,380,120,22,'#3a6ab8','rx="6"');return s}],
  ['Boarding bridge',(K,t)=>{let s=K.R(0,0,W,H,'#d8dce2');for(let k=0;k<6;k++){const t2=k/6,x0=t2*230,y0=t2*170,x1=W-t2*230,y1=H-t2*150;s+=K.P(`M${f(x0)} ${f(y0)}H${f(x1)}V${f(y1)}H${f(x0)}Z`,'none',`stroke="#b8bec8" stroke-width="${8-t2*6}"`)}
   for(let k=0;k<5;k++){const t2=(k+.3)/6,x=t2*230,y=t2*170+40*(1-t2),h=(H-t2*150-t2*170)*.35;s+=K.R(x+4,y+30,24*(1-t2)+6,h,'#000')+`<svg x="${f(x+4)}" y="${f(y+30)}" width="${f(24*(1-t2)+6)}" height="${f(h)}" viewBox="0 0 30 100" preserveAspectRatio="none">${K.sky(t,0,0,30,100)}</svg>`}
   s+=K.P('M0 480L230 330H410L640 480Z',K.lg(['#3a4a6a','#22304a']))+K.R(270,190,100,140,'#eef0f4','rx="10"')+K.R(285,205,70,40,'#9ab4d8','rx="20"')+K.glow(320,40,120,'#ffffff',.6);return s}]],{tier:'tk++',city:'Haneda, Tokyo',tod:1,space:'center'});
 // ---------------------------------------------------------------- 9 Ice Rink
 add('icerink','Ice Rink','in',['winter','cool'],[
  ['Skating rink',K=>{let s=K.R(0,0,W,H,K.lg(['#2a3a5a','#4a6a8a']))+K.P('M0 240H640V280H0Z','#2a2e3a');for(let i=0;i<4;i++)s+=K.P(`M0 ${130+i*28}H640V${150+i*28}H0Z`,'#38425a')+K.stars(40,0,130+i*28,W,20,i+2,'#c8d0e0');
   s+=K.P('M0 480L0 300H640V480Z',K.lg(['#e8f4ff','#b8dcf2']))+K.R(0,280,W,26,'#ffffff')+K.R(0,290,W,8,'#2a6ab8')+K.L('M60 420Q320 340 580 420','#ff5a6a',3,'opacity=".6"')+K.E(320,390,60,16,'none','stroke="#2a6ab8" stroke-width="3" opacity=".5"');
   for(let i=0;i<6;i++)s+=K.glow(60+i*104,30,40,'#ffffff',.7)+K.R(40+i*104,20,40,8,'#e8eef8');for(let i=0;i<20;i++)s+=K.L(`M${i*34} ${330+i%3*20}q20 4 40 0`,'#fff',1.5,'opacity=".5"');return s}],
  ['Competition arena',K=>{let s=K.R(0,0,W,H,'#06070f');const r=K.rnd(7);for(let i=0;i<500;i++){const y=40+r()*200;s+=K.C(r()*W,y,1.4,['#ff4fa8','#4fd8ff','#ffffff','#ffe04f'][i%4],`opacity="${(.25+r()*.5).toFixed(2)}"`)}
   s+=K.E(320,370,420,130,K.lg(['#cfe8ff','#7aa8d8']))+K.E(320,370,420,130,'none','stroke="#fff" stroke-width="10"')+K.E(320,370,420,130,'none','stroke="#2a6ab8" stroke-width="3"');
   [[200,'#ff9ad8'],[320,'#ffffff'],[440,'#9ad8ff']].forEach(([x,c])=>s+=K.P(`M${x} 0L${x-80} 380H${x+80}Z`,c,'opacity=".12"')+K.E(x,380,80,18,c,'opacity=".35"'));s+=K.glow(320,370,160,'#ffffff',.3);return s}],
  ['Ice stadium',K=>{let s=K.R(0,0,W,H,'#1a1e2c');const r=K.rnd(2);for(let k=0;k<9;k++){const rx=330-k*16,ry=230-k*16;s+=K.E(320,250,rx,ry,k%2?'#2a3046':'#323a54');}for(let i=0;i<700;i++){const a=r()*Math.PI*2,d=.62+r()*.36;s+=K.C(320+Math.cos(a)*330*d,250+Math.sin(a)*230*d,1.2,['#ff6a8a','#6ad0ff','#fff','#ffd27a'][i%4],'opacity=".55"')}
   s+=K.E(320,280,180,96,K.lg(['#e6f4ff','#a8d0ee']))+K.E(320,280,180,96,'none','stroke="#fff" stroke-width="6"')+K.L('M320 186V374','#ff5a6a',3,'opacity=".7"')+K.E(320,280,30,16,'none','stroke="#2a6ab8" stroke-width="2"');
   s+=K.L('M320 0V70','#555',2)+K.R(280,70,80,56,'#0e1018','rx="6"')+K.R(288,78,64,40,K.lg(['#2a6ab8','#ff5aa8'],1,0),'rx="3" opacity=".8"')+K.glow(320,98,70,'#7ab0ff',.3);return s}]],{space:'center'});
 // ---------------------------------------------------------------- 10 Cinema
 add('cinema','Cinema','in',['stage','cool'],[
  ['Movie theater',K=>{let s=K.R(0,0,W,H,'#120a10')+K.R(90,50,460,200,K.lg(['#c8d8ff','#7a8ad8','#ff9ac8'],1,1))+K.glow(320,150,300,'#a0b0ff',.3)+K.R(60,30,40,260,'#6a0e1a')+K.R(540,30,40,260,'#6a0e1a');
   for(let i=0;i<6;i++)s+=K.L(`M${64+i*6} 30V290M${544+i*6} 30V290`,'#4a0810',1.5);for(let k=0;k<5;k++){const y=300+k*38,w=480+k*80,n=10+k*2;for(let i=0;i<n;i++){const x=320-w/2+i*w/n;s+=K.R(x+2,y,w/n-6,30+k*4,'#5a0e1e','rx="8"')+K.R(x+2,y,w/n-6,8,'#7a1a2c','rx="4"')}}
   s+=K.P('M320 480L300 260h40z','#fff','opacity=".03"');return s}],
  ['Private screening room',K=>{let s=K.R(0,0,W,H,K.lg(['#3a2218','#22140e']));for(let i=0;i<10;i++)s+=K.R(i*64,0,60,300,'#4a2c1e','rx="4"');s+=K.R(170,60,300,150,K.lg(['#ffe2b0','#ff9a7a','#8a5ab8'],1,1))+K.R(160,52,320,166,'none','stroke="#1a0e08" stroke-width="10"');
   [60,580].forEach(x=>s+=K.glow(x,100,50,'#ffc880',.7)+K.R(x-8,90,16,24,'#e8c080','rx="4"'));s+=K.R(0,300,W,180,'#2a1a14');
   [[150,330,1],[490,330,1],[230,400,1.2],[410,400,1.2]].forEach(([x,y,sc])=>s+=K.R(x-60*sc,y,120*sc,60*sc,'#8a1a22','rx="14"')+K.R(x-60*sc,y-30*sc,120*sc,40*sc,'#a02430','rx="16"')+K.R(x-70*sc,y+10*sc,20*sc,50*sc,'#7a141c','rx="8"')+K.R(x+50*sc,y+10*sc,20*sc,50*sc,'#7a141c','rx="8"'));return s}],
  ['Cinema lobby',K=>{let s=K.room(120,70,400,230,{ce:'#1e1428',lw:'#3a1e3a',rw:'#361c36',fl:'#5a1a2a',bw:'#2a1a34'});const r=K.rnd(4);for(let i=0;i<40;i++)s+=K.C(r()*W,320+r()*160,6,['#ffd27a','#3a2a5a'][i%2],'opacity=".35"');
   [[150,'#ff5aa8','#3a2a8a'],[260,'#5ad8ff','#1a3a6a'],[370,'#ffd27a','#8a3a2a']].forEach(([x,a,b])=>s+=K.R(x-6,90,104,140,'#e8c060')+K.R(x,96,92,128,K.lg([a,b]))+K.C(x+46,150,22,'#fff','opacity=".25"')+K.glow(x+46,90,40,'#fff6c8',.5));
   s+=K.R(470,180,50,120,'#1a1018');s+=K.R(140,250,360,50,'#e8d8c8')+K.R(140,244,360,10,'#c83a4a');[[200,'#ff5a5a'],[250,'#ffd27a'],[300,'#ff5a5a']].forEach(([x,c])=>s+=K.P(`M${x-12} 244l4 -26h16l4 26z`,c)+K.C(x-4,214,6,'#fff6d8')+K.C(x+4,212,6,'#fff6d8')+K.C(x,208,6,'#fff6d8'));
   for(let i=0;i<5;i++)s+=K.glow(160+i*80,20,24,'#fff0c8',.8);return s}]],{space:'center'});
 // small helper used by the castle composition
})();
