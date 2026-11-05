// =====================================================================================
//  IDOLVERSE48: Select Bloom! — small gameplay fixes
//  · Default dance formation rows alternate odd / even (single Center) or even / odd (twin Centers)
//    so the Center(s) stand exactly in the middle: 12 → 3-4-5, 16 → 5-6-5, 24 → 7-8-9.
//    Used by every new / auto-generated formation and the Theater (saved formations unchanged).
//  · New Single Production songs start with a 16-member Senbatsu.
//  · Start Single starts directly (no extra "Please confirm" dialog; requirements and funds
//    are still checked by startSingle).
// =====================================================================================
// rows alternate parity so the Center(s) are always exactly in the middle and every row stands in
// the gaps of the row in front: single Center → odd, even, odd …; twin Centers → even, odd, even …
// (only the last row may break the pattern when the total makes it impossible). Rows grow gently to the back.
function fxRows(n,nc){n=Math.max(1,n|0);nc=Math.max(1,Math.min(nc|0||1,n));let R=n<=5?1:n<=10?2:n<=24?3:n<=34?4:5;R=Math.min(R,CFG.maxRows||5);if(R==1)return[n];
 const par=i=>((nc%2?0:1)+i)%2==0?1:0;let best=null,bs=1e9;const t=i=>n/R+(i-(R-1)/2)*.5;
 const rec=(i,left,acc,sc)=>{if(sc>=bs)return;if(i==R-1){if(left<1)return;const v=sc+(left-t(i))**2+(left%2!=par(i)?1.5:0)+(left<acc[i-1]?2:0);if(v<bs){bs=v;best=[...acc,left]}return}
  for(let x=1;x<=left-(R-1-i);x++){if(i==0&&x<nc)continue;rec(i+1,left-x,[...acc,x],sc+(x-t(i))**2+(x%2!=par(i)?100:0)+(i>0&&x<acc[i-1]?2:0)+(i==0&&n>=10&&x<3?2:0))}};
 rec(0,n,[],0);return best||[n]}
defForm=function(size,nc){return buildForm(fxRows(size,nc),Math.max(1,nc|0))};
confirmProd=function(){const p=S.pj;if(!p||p.status!='draft')return toast('This single has already started.','err');try{czSyncPlan()}catch(e){}startSingle()};
// new songs in Single Production start with a 16-member Senbatsu (or every eligible member when fewer)
{const f=mkSong;mkSong=function(role,x={}){const o=f.apply(this,arguments);try{if((role=='Main'||role=='Coupling')&&!x.th&&o.fm&&!(o.slots||[]).length){const n=Math.max(1,Math.min(16,elig(o).length||16));o.fm.size=n;o.fm.nc=1;o.fm.sl=genForm(n,1)}}catch(e){}return o}}

// ---- costume colour tools (every costume editor: Costume Designer, Single / member costumes, Theater)
// same pieces, new colours · new patterns · a harmonious palette built from one chosen main colour
const czHx=h=>{h=String(h||'#ffffff').replace('#','');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0)};
function czToHsl(hex){let[r,g,b]=czHx(hex).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!=mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx==r?(g-b)/d+(g<b?6:0):mx==g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s*100,l*100]}
const czHsl=(h,s,l)=>{h=((h%360)+360)%360;s=Math.max(0,Math.min(100,s))/100;l=Math.max(0,Math.min(100,l))/100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
function czPieces(p){const L=[];CZ_CATS.forEach(c=>{if(c.multi){Object.keys(p[c.k]||{}).forEach(t=>{const P=p[c.k][t];if(P)L.push([c.k,P])})}else{const P=p[c.k];if(P&&P.t&&P.t!='none')L.push([c.k,P])}});return L}
function czPaint(p,pal){const R=a=>a[Math.floor(Math.random()*a.length)];czPieces(p).forEach(([k,P])=>{const main=k=='top'||k=='bottom'||k=='outer'?pal.base:k=='shoes'?R([pal.base,pal.dark,'#ffffff']):R([pal.acc,pal.base,pal.acc2]);P.c1=main;P.c2=R([pal.light,pal.acc,'#ffffff']);P.c3=R([pal.acc2,pal.gold,pal.dark]);P.pc=R([pal.light,pal.acc,pal.acc2,'#ffffff']);P.dc=R([pal.gold,pal.acc2,pal.light])})}
function czEdP(){const E=ui.czE;if(!E||!E.p)return toast('Open or create a costume first.','err'),null;if(!E.scz&&!czEditing())return toast('Choose a design to edit first.','err'),null;return E}
function czRandColors(){const E=czEdP();if(!E)return;const R=a=>a[Math.floor(Math.random()*a.length)],h=Math.random()*360,sch=R(['analog','comp','triad','mono']),off=sch=='comp'?180:sch=='triad'?120:sch=='analog'?35:0,s=55+Math.random()*35;
 czPaint(E.p,{base:czHsl(h,s,62+Math.random()*20),light:czHsl(h,s*.6,90),dark:czHsl(h,s*.7,22),acc:czHsl(h+off,s,58),acc2:czHsl(h-off||h+20,s*.9,72),gold:R(['#f3c35c','#ffffff','#e9b949','#cfd4dc'])});E.dirty=1;toast('New colours on the same costume. Save to keep them.');render()}
function czRandPats(){const E=czEdP();if(!E)return;const R=a=>a[Math.floor(Math.random()*a.length)];czPieces(E.p).forEach(([k,P])=>{P.pat=Math.random()<.3?'solid':R(CZ_PATS.slice(1))[0];P.ps=+(0.6+Math.random()*1.2).toFixed(1);P.pd=+(0.45+Math.random()*.5).toFixed(2)});E.dirty=1;toast('New patterns on the same costume. Save to keep them.');render()}
function czFromMain(hex){const E=czEdP();if(!E)return;if(!/^#?[0-9a-f]{6}$/i.test(hex||''))return toast('Choose a main colour.','err');if(hex[0]!='#')hex='#'+hex;const[h,s,l]=czToHsl(hex),R=a=>a[Math.floor(Math.random()*a.length)],off=R([25,35,150,180,210]);
 czPaint(E.p,{base:hex,light:czHsl(h,Math.max(20,s*.5),Math.min(95,l+28)),dark:czHsl(h,s*.8,Math.max(12,l-35)),acc:czHsl(h+off,Math.max(40,s),Math.min(75,Math.max(45,l))),acc2:czHsl(h-off/2,Math.max(35,s*.8),Math.min(85,l+15)),gold:R(['#f3c35c','#ffffff','#e9b949'])});UIP.czMain=hex;try{localStorage.setItem('iv48ui',JSON.stringify(UIP))}catch(e){}E.dirty=1;toast('Colours built from your main colour (each press gives a new combination). Save to keep them.');render()}
{const f=czGridHtml;czGridHtml=function(){const h=f.apply(this,arguments),mc=UIP.czMain||'#f7a8c8';return h.replace('<div class="czact">',`<div class="row czcolt"><button class="b s" onclick="czRandColors()">🎨 Random colours</button><button class="b s" onclick="czRandPats()">🌀 Random patterns</button><label class="st czmc">Main colour <input type="color" id="czmainc" value="${mc}"></label><button class="b s" onclick="czFromMain($('#czmainc').value)">🎯 Colours from main colour</button></div><div class="czact">`)}}

// ---- Theater: random costume for a song (Team Theater makes a new random design; Trainees pick an existing one)
function thCzRand(id){const key=thCur(),s=thEd(),it=thItem(id);if(!thGuardEdit(s)||!it)return;const o=S.songs[it.song];
 if(thTr(key)){const L=czLib().ds;if(!L.length)return toast('The costume library is empty. Trainee Theater can only reuse existing costumes.','err');const d=L[Math.floor(Math.random()*L.length)];it.cz={did:d.id};toast(`${thLbl(s,it)}: random existing costume “${d.name}”.`);return render()}
 const d={id:czId(),name:cleanName(`${o?o.title:'Song'} costume`).slice(0,40)||'Random costume',p:czRandom(),style:'',created:S.day,updated:S.day,stg:s.id};czLib().ds.push(d);it.cz={did:d.id};toast(`${thLbl(s,it)}: new random costume “${d.name}” (edit it any time in Costume Designer).`);render()}
function thCzRandSel(){const key=thCur(),s=thEd();if(!thGuardEdit(s))return;const sel=ui.thcs&&ui.thcs.length?ui.thcs:thAll(s).map(i=>i.id),L=czLib().ds;let d;
 if(thTr(key)){if(!L.length)return toast('The costume library is empty.','err');d=L[Math.floor(Math.random()*L.length)]}else{d={id:czId(),name:cleanName(`${s.name} costume ${L.filter(x=>x.stg==s.id).length+1}`).slice(0,40),p:czRandom(),style:'',created:S.day,updated:S.day,stg:s.id};L.push(d)}
 thAll(s).forEach(it=>{if(sel.includes(it.id))it.cz={did:d.id}});toast(`Random costume “${d.name}” given to ${sel.length} song(s).`);render()}
{const f=thCzTab;thCzTab=function(s,tr){let h=f.apply(this,arguments);h=h.replace(/(<button class="b s p" onclick="thCzSongNew\('([^']+)'\)">✦ Design new<\/button>)/g,(m,a,id)=>`${a}<button class="b s" onclick="thCzRand('${id}')" title="Random costume">🎲</button>`);
 if(tr)h=h.replace(/(<select onchange="thCz\('([^']+)',this.value\)">)/g,(m,a,id)=>`<button class="b s" onclick="thCzRand('${id}')" title="Random existing costume">🎲</button>${a}`);
 const sel=(ui.thcs||[]).length;return h.replace('<label class="st">Assign to ',`<button class="b s" onclick="thCzRandSel()">🎲 Random costume for ${sel?sel+' selected':'all'} song(s)</button><label class="st">Assign to `)}}
