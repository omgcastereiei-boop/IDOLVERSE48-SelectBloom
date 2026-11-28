// =====================================================================================
//  Group Media — original illustrated studio backgrounds, program logos and posters (SVG).
//  GMART.bg(key) → 1200×675 SVG string (cached): 'var' colourful variety studio (LED wall, quiz podiums,
//  buzzers, props, lighting rig) · 'mus' music theater stage (red curtains, spotlights, LED screens) ·
//  'talk' interview corner (sofa, lamp, backstage wall) · 'radio' FM radio booth (mics, mixer, acoustic
//  panels, wooden desk, ON AIR sign). Variants v (0..2) shift the palette.
//  GMART.logo(p,w) program logo · GMART.poster(p,mids) poster · built only from shapes + the game's character art.
// =====================================================================================
const GMART=(()=>{
 const C={};let U=0;const uid=()=>'gma'+(++U);
 const R=(s)=>{let x=s>>>0||1;return()=>((x=Math.imul(x^x>>>15,2246822507)^Math.imul(x^x>>>13,3266489909))>>>0)/4294967296};
 const rect=(x,y,w,h,f,o='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${o}/>`;
 // ---- variety studio ---------------------------------------------------------------------------------
 function vr(v){const r=R(11+v*7),id=uid(),P=[['#ff5fa2','#ffd23f','#3fa9ff','#ff4d4d'],['#7c5cff','#ffcf3a','#22c7a9','#ff6b9a'],['#ff8a3d','#47c6ff','#ff4fae','#ffe066']][v%3];
  let s=`<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1548"/><stop offset="1" stop-color="#4b2a7a"/></linearGradient><radialGradient id="${id}s" cx=".5" cy=".2" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c9e4"/><stop offset="1" stop-color="#b98ad6"/></linearGradient></defs>`;
  s+=rect(0,0,1200,675,`url(#${id}w)`);
  // lighting truss
  s+=rect(0,26,1200,14,'#9aa3b8')+[...Array(24)].map((_,i)=>`<path d="M${i*50} 26l25 14l25-14" stroke="#6f7790" stroke-width="2" fill="none"/>`).join('');
  for(let i=0;i<9;i++){const x=70+i*132,c=P[i%4];s+=`<path d="M${x} 40l-70 430h140z" fill="${c}" opacity=".10"/><rect x="${x-12}" y="38" width="24" height="20" rx="4" fill="#2c2f3a"/><circle cx="${x}" cy="60" r="7" fill="${c}"/>`}
  // LED wall: grid of tiles + big heart/star
  s+=`<g>`+rect(220,80,760,300,'#120a24','rx="14"');for(let y=0;y<10;y++)for(let x=0;x<25;x++){const c=P[(x+y+v)%4];s+=rect(226+x*30.2,86+y*29.2,28,27,c,`opacity="${(.18+r()*.5).toFixed(2)}" rx="3"`)}
  s+=`<path d="M600 150c-40-48-120-12-92 46c18 36 92 80 92 80s74-44 92-80c28-58-52-94-92-46z" fill="#fff" opacity=".85"/><path d="M600 168c-30-34-86-8-66 32c13 25 66 57 66 57s53-32 66-57c20-40-36-66-66-32z" fill="${P[0]}"/></g>`;
  // side screens
  [[40,120],[1010,120]].forEach(([x,y],k)=>{s+=rect(x,y,150,220,'#160c2c','rx="10"')+rect(x+8,y+8,134,204,P[(k+1)%4],'opacity=".5" rx="6"');for(let i=0;i<6;i++)s+=rect(x+20,y+24+i*30,110*r()+10,10,'#fff','opacity=".5" rx="5"')});
  // floor
  s+=`<path d="M0 470h1200v205H0z" fill="url(#${id}f)"/>`;for(let i=0;i<14;i++)s+=`<path d="M${i*92-60} 675L${600+(i-7)*30} 470" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
  s+=`<ellipse cx="600" cy="560" rx="420" ry="70" fill="${P[1]}" opacity=".35"/><ellipse cx="600" cy="560" rx="300" ry="46" fill="#fff" opacity=".25"/>`;
  // quiz podiums with buzzers
  for(let i=0;i<5;i++){const x=150+i*200,c=P[i%4];s+=`<g><path d="M${x} 470h140l-12 120h-116z" fill="${c}"/><path d="M${x} 470h140v18h-140z" fill="#fff" opacity=".55"/><rect x="${x+30}" y="${510}" width="80" height="34" rx="8" fill="#1d1430" opacity=".75"/><text x="${x+70}" y="534" font-size="20" text-anchor="middle" fill="#fff" font-family="Quicksand,sans-serif" font-weight="800">${i+1}</text><ellipse cx="${x+70}" cy="466" rx="22" ry="8" fill="#333"/><path d="M${x+52} 466a18 14 0 0 1 36 0z" fill="#ff3b3b"/></g>`}
  // props: giant dice + question cards + confetti
  s+=`<g transform="translate(70 520) rotate(-12)"><rect width="70" height="70" rx="12" fill="#fff"/><circle cx="20" cy="20" r="7" fill="#ff4d6d"/><circle cx="50" cy="50" r="7" fill="#ff4d6d"/><circle cx="35" cy="35" r="7" fill="#ff4d6d"/></g>`;
  s+=`<g transform="translate(1060 510) rotate(10)"><rect width="80" height="100" rx="10" fill="${P[2]}"/><text x="40" y="70" font-size="60" text-anchor="middle" fill="#fff" font-family="Quicksand,sans-serif" font-weight="800">?</text></g>`;
  for(let i=0;i<60;i++)s+=rect(r()*1200,r()*420,6,10,P[i%4],`transform="rotate(${r()*90} ${r()*1200} ${r()*420})" opacity=".7"`);
  s+=rect(0,0,1200,675,`url(#${id}s)`);return s}
 // ---- music theater stage --------------------------------------------------------------------------
 function mu(v){const id=uid(),r=R(31+v*5),ac=['#ff3d7f','#7c6cff','#ffb22e'][v%3];
  let s=`<defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14060f"/><stop offset="1" stop-color="#3b0d1e"/></linearGradient><linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a0b1c"/><stop offset=".5" stop-color="#c8183a"/><stop offset="1" stop-color="#6d0918"/></linearGradient><radialGradient id="${id}l" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a24"/><stop offset="1" stop-color="#100509"/></linearGradient></defs>`;
  s+=rect(0,0,1200,675,`url(#${id}b)`);
  // LED screens (back)
  s+=rect(330,70,540,250,'#0b0612','rx="10"');for(let y=0;y<8;y++)for(let x=0;x<18;x++)s+=rect(336+x*29.6,76+y*30,27,28,ac,`opacity="${(.12+r()*.45).toFixed(2)}" rx="2"`);
  s+=`<text x="600" y="215" font-size="64" text-anchor="middle" fill="#fff" opacity=".9" font-family="'Dela Gothic One','M PLUS Rounded 1c',sans-serif" letter-spacing="6">LIVE</text>`;
  [[120,110],[930,110]].forEach(([x,y])=>{s+=rect(x,y,150,200,'#0b0612','rx="8"');for(let i=0;i<5;i++)for(let j=0;j<4;j++)s+=rect(x+8+j*35,y+8+i*38,32,34,ac,`opacity="${(.15+r()*.4).toFixed(2)}" rx="2"`)});
  // spotlights
  [[200,'#fff3c4'],[420,'#ffd0e8'],[780,'#d8d0ff'],[1000,'#fff3c4']].forEach(([x,c])=>{s+=`<path d="M${x} 0l-130 600h260z" fill="${c}" opacity=".12"/><circle cx="${x}" cy="8" r="16" fill="#ddd"/>`});
  s+=`<ellipse cx="600" cy="20" rx="700" ry="420" fill="url(#${id}l)"/>`;
  // stage floor with lights rows
  s+=`<path d="M0 470h1200v205H0z" fill="url(#${id}f)"/><path d="M60 470h1080l60 40H0z" fill="#5a2232"/>`;for(let i=0;i<30;i++)s+=`<circle cx="${30+i*40}" cy="520" r="4" fill="${i%2?ac:'#ffe7a3'}" opacity=".8"/>`;
  s+=`<ellipse cx="600" cy="590" rx="380" ry="50" fill="#ffe7a3" opacity=".12"/>`;
  // red curtains: side drapes + valance
  const drape=(x,dir)=>{let d='';for(let i=0;i<6;i++){const xx=x+dir*i*22;d+=`<path d="M${xx} 0c${dir*14} 160 ${dir*-10} 340 ${dir*18} 560" stroke="#4d0611" stroke-opacity=".35" stroke-width="5" fill="none"/>`}return`<path d="M${x} 0h${dir*170}c${dir*-50} 200 ${dir*-90} 380 ${dir*-30} 560c${dir*-60} 10 ${dir*-110} 0 ${dir*-140} -20z" fill="url(#${id}c)"/>`+d};
  s+=drape(0,1)+drape(1200,-1);
  s+=`<path d="M0 0h1200v58c-50 26-100 26-150 0c-50 26-100 26-150 0c-50 26-100 26-150 0c-50 26-100 26-150 0c-50 26-100 26-150 0c-50 26-100 26-150 0c-50 26-100 26-150 0c-50 26-100 26-150 0z" fill="url(#${id}c)"/><path d="M0 58h1200" stroke="#f3c35c" stroke-width="4" opacity=".7"/>`;
  return s}
 // ---- interview corner ------------------------------------------------------------------------------
 function tk(v){const id=uid(),r=R(51+v),c=['#f6d6e4','#dfe6fb','#fbe6cf'][v%3];
  let s=`<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#fff7ef"/></linearGradient><radialGradient id="${id}g" cx=".3" cy=".3" r=".6"><stop offset="0" stop-color="#fff3c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff3c8" stop-opacity="0"/></radialGradient></defs>`;
  s+=rect(0,0,1200,675,`url(#${id}w)`);
  // wall panels + framed photos (backstage wall)
  for(let i=0;i<8;i++)s+=rect(i*150+6,40,138,380,'#fff','opacity=".45" rx="8"');
  for(let i=0;i<6;i++){const x=90+i*180,y=90+(i%2)*40;s+=rect(x,y,110,80,'#fff','rx="4"')+rect(x+6,y+6,98,68,['#f5a3c4','#a9c4f5','#f6d28a','#b9e3c6'][i%4],'opacity=".8"')}
  s+=`<ellipse cx="330" cy="200" rx="360" ry="260" fill="url(#${id}g)"/>`;
  // floor + rug
  s+=rect(0,430,1200,245,'#c99b74')+[...Array(12)].map((_,i)=>rect(0,430+i*21,1200,2,'#a7795a','opacity=".5"')).join('');
  s+=`<ellipse cx="600" cy="560" rx="430" ry="70" fill="#e9b7c8" opacity=".75"/>`;
  // sofa
  s+=`<path d="M300 400h600a30 30 0 0 1 30 30v110h-660v-110a30 30 0 0 1 30-30z" fill="#e57aa6"/><path d="M270 470h660v60H270z" fill="#d1608f"/><rect x="250" y="440" width="60" height="110" rx="24" fill="#c95687"/><rect x="890" y="440" width="60" height="110" rx="24" fill="#c95687"/>`;
  for(let i=0;i<3;i++)s+=rect(340+i*190,420,150,60,'#f39ac0','rx="22"');
  // floor lamp + plant + side table with mic
  s+=`<path d="M150 600V260" stroke="#4a3b30" stroke-width="6"/><path d="M110 260h80l-18-60h-44z" fill="#fff1c2"/><ellipse cx="150" cy="603" rx="40" ry="8" fill="#4a3b30"/>`;
  s+=`<path d="M1050 600c-30-90-60-140-10-200c20 60 40 110 10 200z" fill="#5aa46c"/><path d="M1070 600c20-80 60-120 40-190c-40 60-50 110-40 190z" fill="#4c915d"/><rect x="1030" y="580" width="70" height="40" rx="8" fill="#b07a54"/>`;
  s+=`<rect x="930" y="520" width="90" height="12" rx="4" fill="#8b6a4f"/><path d="M975 520v-46" stroke="#555" stroke-width="5"/><rect x="964" y="450" width="22" height="34" rx="11" fill="#333"/>`;
  s+=`<g opacity=".9"><rect x="40" y="60" width="200" height="50" rx="25" fill="#fff"/><text x="140" y="94" font-size="24" text-anchor="middle" fill="#e05a8a" font-family="Quicksand,sans-serif" font-weight="800">TALK</text></g>`;
  return s}
 // ---- radio booth ----------------------------------------------------------------------------------
 function ra(v){const id=uid(),r=R(71+v),w=['#3b2b2a','#2d3242','#3a2f3e'][v%3];
  let s=`<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w}"/><stop offset="1" stop-color="#1c1514"/></linearGradient><radialGradient id="${id}g" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient><linearGradient id="${id}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98457"/><stop offset="1" stop-color="#7a4f2f"/></linearGradient></defs>`;
  s+=rect(0,0,1200,675,`url(#${id}w)`);
  // acoustic panels
  for(let y=0;y<4;y++)for(let x=0;x<10;x++){const px=40+x*114,py=40+y*92;s+=rect(px,py,104,82,['#5b4a45','#4c3f3c','#6a5550'][(x+y)%3],'rx="6"');for(let k=0;k<4;k++)s+=rect(px+8+k*24,py+8,16,66,'#000','opacity=".12" rx="4"')}
  // window to control room
  s+=rect(720,90,380,200,'#1a2a36','rx="10"')+rect(730,100,360,180,'#24435a','rx="6" opacity=".9"');for(let i=0;i<8;i++)s+=rect(745+i*42,220,30,40,'#9ad0ff','opacity=".25" rx="3"');
  // ON AIR sign
  s+=`<g><rect x="430" y="40" width="300" height="80" rx="14" fill="#1a0a0a" stroke="#ff3b3b" stroke-width="4"/><text x="580" y="98" font-size="46" text-anchor="middle" fill="#ff4747" font-family="'Dela Gothic One','M PLUS Rounded 1c',sans-serif" letter-spacing="6" class="gmonair">ON AIR</text></g>`;
  s+=`<ellipse cx="600" cy="330" rx="620" ry="380" fill="url(#${id}g)"/>`;
  // wooden desk
  s+=`<path d="M60 470h1080l40 205H20z" fill="url(#${id}d)"/><path d="M60 470h1080v18H60z" fill="#d6a679"/>`;
  // mixer
  s+=`<g><rect x="470" y="490" width="260" height="110" rx="10" fill="#2b2b33"/>`;for(let i=0;i<10;i++){s+=rect(486+i*24,505,14,70,'#16161c','rx="3"')+rect(484+i*24,510+r()*50,18,10,'#ddd','rx="2"')+`<circle cx="${493+i*24}" cy="590" r="4" fill="${i%3?'#4be37a':'#ffb02e'}"/>`}s+=`</g>`;
  // mics on boom arms + headphones
  [[230,'#3a3a44'],[970,'#3a3a44']].forEach(([x,c],k)=>{s+=`<path d="M${x+(k?80:-80)} 470L${x} 330" stroke="#555" stroke-width="8"/><rect x="${x-22}" y="270" width="44" height="80" rx="22" fill="${c}"/><rect x="${x-26}" y="300" width="52" height="10" fill="#777"/><g transform="translate(${x+(k?-140:90)} 500)"><path d="M0 30a40 40 0 0 1 80 0" stroke="#222" stroke-width="10" fill="none"/><rect x="-8" y="26" width="22" height="34" rx="8" fill="#e05a8a"/><rect x="66" y="26" width="22" height="34" rx="8" fill="#e05a8a"/></g>`});
  s+=`<rect x="1040" y="420" width="70" height="50" rx="6" fill="#f2efe8"/><path d="M1052 432h46M1052 444h40M1052 456h30" stroke="#999" stroke-width="3"/>`;
  return s}
 const B={var:vr,mus:mu,talk:tk,radio:ra};
 function bg(key,v=0){const k=key+'|'+v;if(!C[k])C[k]=`<svg viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${(B[key]||vr)(v)}</svg>`;return C[k]}
 const URLS={};function url(svg,key){if(key&&URLS[key])return URLS[key];let u='';try{u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}))}catch(e){}if(key)URLS[key]=u;return u}
 const bgUrl=(key,v=0)=>url(bg(key,v),'bg|'+key+'|'+v);
 // ---- logo ------------------------------------------------------------------------------------------
 const LOGO_ST=[['#ff5fa2','#ffd23f'],['#3fa9ff','#ff6bcb'],['#ff4d4d','#ffe066'],['#7c5cff','#5ce1e6'],['#22c7a9','#ffcf3a'],['#ff8a3d','#ff4fae']];
 function logo(p,w=260){const st=(p.logo&&p.logo.st)|0,[a,b]=LOGO_ST[st%LOGO_ST.length],id=uid(),t=String(p.name||'').replace(/[<>&"]/g,'').slice(0,28),sz=t.length>18?30:t.length>12?38:46,shape=((p.logo&&p.logo.sh)|0)%4;
  const bgS=shape==0?`<rect x="8" y="14" width="384" height="112" rx="56" fill="url(#${id})"/>`:shape==1?`<path d="M30 20h340l-20 100H10z" fill="url(#${id})"/>`:shape==2?`<path d="M200 6l40 30h130l-30 50 30 40H240l-40 20-40-20H30l30-40-30-50h130z" fill="url(#${id})"/>`:`<rect x="10" y="20" width="380" height="100" rx="14" fill="url(#${id})"/><circle cx="40" cy="20" r="18" fill="${b}"/><circle cx="360" cy="120" r="14" fill="${a}"/>`;
  const sub={var:'VARIETY',mus:'MUSIC SHOW',radio:'RADIO'}[p.type]||'';
  return`<svg viewBox="0 0 400 140" width="${w}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>${bgS}<text x="200" y="${72+sz/3}" font-size="${sz}" text-anchor="middle" ${t.length*sz*.66>350?'textLength="350" lengthAdjust="spacingAndGlyphs"':''} fill="#fff" stroke="#3a1a40" stroke-width="5" paint-order="stroke" font-family="'Dela Gothic One','M PLUS Rounded 1c',sans-serif">${t}</text><text x="200" y="128" font-size="15" text-anchor="middle" fill="#fff" font-family="Quicksand,sans-serif" font-weight="800" letter-spacing="5">${sub}</text></svg>`}
 // ---- poster / thumbnail ----------------------------------------------------------------------------
 function embed(svg,x,y,w,h){return String(svg).replace(/^\s*<svg([^>]*)>/,(m,at)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}"${at.replace(/\s(width|height|x|y)="[^"]*"/g,'')}>`)}
 function poster(p,mids,W=300){const bgk={var:'var',mus:'mus',radio:'radio'}[p.type]||'var',v=((p.logo&&p.logo.st)|0)%3,L=(mids||[]).map(get).filter(Boolean).slice(0,5);
  let figs='';const n=L.length;L.forEach((m,i)=>{const w=n<=2?260:n<=3?220:180,x=600-((n-1)*w*.72)/2+i*w*.72-w/2;try{figs+=embed(CHAR_ASSETS.half(m,w),x,330-(i%2)*14,w,w*1.4)}catch(e){}});
  return`<svg viewBox="0 0 1200 1600" width="${W}" xmlns="http://www.w3.org/2000/svg"><svg x="-500" y="0" width="2200" height="1240" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">${(B[bgk])(v)}</svg><rect y="1100" width="1200" height="500" fill="#1d1030"/><rect y="1060" width="1200" height="60" fill="#1d1030" opacity=".6"/>${figs}${embed(logo(p,900),150,1170,900,315)}</svg>`}
 function thumb(p,ep,mids,W=320){const bgk=ep&&ep.seg=='talk'?'talk':({var:'var',mus:'mus',radio:'radio'}[p.type]||'var'),v=(ep?ep.no:0)%3,L=(mids||[]).map(get).filter(Boolean).slice(0,3);
  let figs='';L.forEach((m,i)=>{const w=300,x=600-((L.length-1)*240)/2+i*240-w/2;try{figs+=embed(CHAR_ASSETS.half(m,w),x,250,w,w*1.4)}catch(e){}});
  return`<svg viewBox="0 0 1200 675" width="${W}" xmlns="http://www.w3.org/2000/svg">${(B[bgk])(v)}${figs}<rect x="0" y="560" width="1200" height="115" fill="#000" opacity=".55"/>${embed(logo(p,360),24,550,360,126)}<text x="1170" y="640" font-size="64" text-anchor="end" fill="#fff" font-family="'Dela Gothic One','M PLUS Rounded 1c',sans-serif">EP.${String(ep?ep.no:0).padStart(2,'0')}</text></svg>`}
 return{bg,bgUrl,url,logo,poster,thumb,LOGO_ST}})();
