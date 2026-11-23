// =====================================================================================
//  Costume Studio expansion 4a — full-size hats, more head accessories, twin-tail & ponytail ribbons
// -------------------------------------------------------------------------------------
//  Added to the existing component system (cz-core.js): nothing is replaced and saved designs draw
//  exactly as before. Head frame: 0..100 × 0..120 (hair top ≈ y 4, eyes ≈ y 63, chin ≈ y 80).
//  · Hats (new storage category "hat"): real hats that sit over the head and hair — beret, peaked
//    military cap, marching shako, sailor cap, sailor bucket hat, bonnet, newsboy cap, stage top hat,
//    wide-brim picture hat, boater, bicorne, knotted head wrap.
//  · Head accessories (existing category "hd"): only pieces the game did not have yet.
//  · Hair ribbons (new storage category "hrb"): drawn on the real tie points of the member's
//    hairstyle (backHair().tie / its tails), so twin-tail ribbons sit on both tails, ponytail ribbons
//    on the ponytail base (or a bun), on every hairstyle that has one.
// =====================================================================================
czxCat('hat','Hats','帽子',{tags:['Head','Hat']});
czxCat('hrb','Hair ribbons (twin tails & ponytails)','髪リボン',{tags:['Head','Hair']});
const HAT={z:'head',ax:50,ay:10,sc:[.85,1.2],mv:5,rot:14};
const hat=(k,n,tags,o,fn)=>czxAdd('hat',k,n,{...HAT,tags,...o,head:fn});
const h4L=(c,w=.7)=>`stroke="${czxL(c)}" stroke-width="${w}" stroke-linejoin="round"`;
const h4Sh=(d,o=.16)=>`<path d="${d}" fill="#2a1830" opacity="${o}"/>`;
const h4Hi=(d,o=.45)=>`<path d="${d}" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="${o}"/>`;

// ---- A. Hats ---------------------------------------------------------------------------------------------------------------
// Full beret: a large soft disc that slouches to one side and covers the crown, with a headband and a stalk
hat('beret2','Full-size beret',['Cute','Retro','Casual'],{col:['#c8324a','#7a1f2e','#f3c35c']},E=>`<path d="M10 20Q2 4 18 -8Q38 -20 64 -16Q92 -11 96 6Q98 18 88 22Q70 15 50 15Q28 15 10 20Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +h4Sh('M10 20Q30 13 50 13.4Q72 14 88 22Q80 25 62 21Q40 19 18 24Z',.2)+h4Hi('M26 -6Q46 -14 70 -10',.4)
 +`<path d="M15 17Q50 9 86 18L87 23Q50 14 14 22Z" fill="${E.c2}" ${h4L(E.c2,.5)}/><path d="M58 -16q1 -4 4 -4" stroke="${E.c1}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`
 +`<path d="M36 -12Q50 -2 52 14M66 -14Q62 0 64 15M20 -2Q34 6 32 16" stroke="${E.l}" stroke-width=".35" fill="none" opacity=".5"/>`);
// Peaked military idol cap: tall rounded crown, braided band, glossy visor, emblem
hat('milcap','Military idol cap',['Military','Cool','Uniform'],{col:['#1f2a52','#d9b36a','#e8394f'],ay:8},E=>`<path d="M14 12Q10 -8 34 -16Q50 -20 66 -16Q92 -8 86 12Q50 4 14 12Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +h4Hi('M28 -10Q50 -16 72 -10',.35)+`<path d="M16 9Q50 1 84 9L84 18Q50 11 16 18Z" fill="${E.c3}" ${h4L(E.c3,.5)}/>`
 +`<path d="M17 11.6Q50 4 83 11.6" stroke="${E.c2}" stroke-width="1.2" fill="none"/><path d="M17 15.4Q50 8 83 15.4" stroke="${E.c2}" stroke-width=".6" fill="none" stroke-dasharray="1.2 .8"/>`
 +`<path d="M18 17Q50 9 82 17Q78 26 50 25Q22 26 18 17Z" fill="#1e1a28" stroke="#0e0a14" stroke-width=".6"/>`+h4Hi('M28 20Q50 15 72 20',.55)
 +czxStar(50,4,4.6,E.c2)+`<circle cx="50" cy="4" r="1.6" fill="${E.c3}"/><path d="M40 7Q34 3 30 6M60 7Q66 3 70 6" stroke="${E.c2}" stroke-width=".9" fill="none"/>`);
// Marching shako: tall drum, top rim, visor, chin chain and a tall plume
hat('shako','Marching shako with plume',['Military','Stage','Cool'],{col:['#e8f0ff','#d9b36a','#e8394f'],ay:2},E=>`<path d="M58 -40Q54 -60 64 -70Q66 -56 72 -48Q74 -38 62 -34Z" fill="${E.c3}" ${h4L(E.c3,.5)}/><path d="M60 -38Q60 -54 66 -64" stroke="#fff" stroke-width=".6" fill="none" opacity=".6"/>`
 +`<path d="M28 -30Q50 -36 72 -30L76 12Q50 6 24 12Z" fill="${E.f}" ${h4L(E.c1)}/><ellipse cx="50" cy="-31" rx="22" ry="4" fill="${mixc(E.c1,'#ffffff',.35)}" ${h4L(E.c1,.5)}/>`
 +`<path d="M28 -26Q50 -31 72 -26" stroke="${E.c2}" stroke-width="2" fill="none"/><path d="M25 6Q50 0 75 6L76 12Q50 6 24 12Z" fill="${E.c2}" ${h4L(E.c2,.4)}/>`
 +`<path d="M40 -6L50 -20L60 -6L56 4H44Z" fill="${E.c2}" ${h4L(E.c2,.4)}/><circle cx="50" cy="-7" r="2.6" fill="${E.c3}"/>`
 +`<path d="M22 11Q50 4 78 11Q74 19 50 18Q26 19 22 11Z" fill="#1e1a28"/>`+h4Hi('M32 13Q50 9 68 13',.5)
 +czxChain(czxCurve(24,12,76,12,10,14),E.c2,1.6));
// Sailor cap: flat white crown, dark band with a name ribbon and two long ribbon tails
hat('sailorcap','Sailor cap with ribbon tails',['Marine','Cute','Uniform'],{col:['#ffffff','#1f2a52','#e8394f']},E=>`<path d="M80 14Q92 30 90 54L86 52Q88 32 76 16ZM76 15Q84 32 80 56L76 54Q80 34 72 17Z" fill="${E.c2}" ${h4L(E.c2,.4)}/>`
 +`<ellipse cx="50" cy="-2" rx="38" ry="9" fill="${E.f}" ${h4L(E.c1)}/>`+h4Hi('M24 -5Q50 -10 76 -5',.5)
 +`<path d="M16 2Q50 12 84 2L84 15Q50 24 16 15Z" fill="${E.c2}" ${h4L(E.c2,.5)}/><path d="M20 9Q50 18 80 9" stroke="${E.c3}" stroke-width="1" fill="none"/>`
 +`<path d="M14 0Q50 10 86 0" stroke="${E.l}" stroke-width=".5" fill="none"/><path d="M42 12h16" stroke="${mixc(E.c3,'#fff',.5)}" stroke-width=".8" stroke-dasharray="1.6 .9"/>`);
// Sailor (dixie) hat: white rounded crown with a stitched, upturned brim
hat('dixie','Sailor bucket hat',['Marine','Casual','Cute'],{col:['#ffffff','#9fd3ff','#1f2a52']},E=>`<g transform="translate(50 15) scale(1.2) translate(-50 -10)">`+`<path d="M22 12Q20 -14 50 -16Q80 -14 78 12Z" fill="${E.f}" ${h4L(E.c1)}/>`+h4Hi('M32 -8Q50 -14 68 -8',.4)
 +`<path d="M14 18Q12 6 22 6Q50 12 78 6Q88 6 86 18Q50 10 14 18Z" fill="${E.f}" ${h4L(E.c1)}/>${[0,1,2].map(i=>`<path d="M${17+i*.5} ${15.6-i*2.6}Q50 ${8.6-i*2.6} ${83-i*.5} ${15.6-i*2.6}" stroke="${E.c2}" stroke-width=".45" fill="none" stroke-dasharray="1 .7"/>`).join('')}`
 +`<path d="M22 4Q50 9 78 4" stroke="${E.c3}" stroke-width="1.6" fill="none"/>`+czxStar(74,8,2.4,E.c3)+`</g>`);
// Bonnet: a deep brim that frames the face, frilled edge, ribbons tied in a bow under the chin
hat('bonnet','Ribbon bonnet',['Lolita','Romantic','Cute'],{col:['#fff4f8','#f7a8c8','#f27aa6'],ay:20},E=>`<path d="M14 40Q12 72 22 82L26 80Q18 70 19 44ZM86 40Q88 72 78 82L74 80Q82 70 81 44Z" fill="${E.c3}" ${h4L(E.c3,.4)}/>`
 +`<path d="M6 54Q0 6 50 -6Q100 6 94 54L84 50Q86 14 50 6Q14 14 16 50Z" fill="${E.f}" ${h4L(E.c1)}/>`+h4Sh('M16 50Q14 14 50 6Q86 14 84 50L80 48Q80 18 50 11Q20 18 20 48Z',.14)
 +czxAlong(czxCurve(16,50,84,50,-46,22),2.4,(x,y)=>`<circle cx="${Q(x)}" cy="${Q(y)}" r="1.7" fill="${E.c2}" stroke="${czxL(E.c2)}" stroke-width=".25"/>`)
 +h4Hi('M14 30Q24 4 50 -1',.4)+`<path d="M20 38Q24 18 50 10Q76 18 80 38" stroke="${E.l}" stroke-width=".35" fill="none" opacity=".5"/>`+czxBow(50,84,1.3,E.c3,czxL(E.c3),1));
// Newsboy cap: eight puffed panels, top button, short visor
hat('newsboy','Newsboy cap',['Casual','Cool','Retro'],{col:['#8a8f9a','#4a4f5a','#2b2436'],pat:'check'},E=>`<path d="M12 16Q4 -2 26 -12Q50 -20 76 -12Q98 -2 90 16Q50 8 12 16Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +[[24,-9,22,14],[38,-15,36,11],[50,-16,50,10],[62,-15,64,11],[76,-9,78,14]].map(([x0,y0,x1,y1])=>`<path d="M${x0} ${y0}Q${(x0+x1)/2+2} ${(y0+y1)/2} ${x1} ${y1}" stroke="${E.l}" stroke-width=".45" fill="none" opacity=".7"/>`).join('')
 +`<circle cx="50" cy="-16" r="2.4" fill="${E.c2}" ${h4L(E.c2,.4)}/><path d="M16 14Q50 6 84 14L84 17Q50 10 16 17Z" fill="${E.c2}"/>`
 +`<path d="M24 16Q50 10 76 16Q72 24 50 24Q28 24 24 16Z" fill="${E.c3}" ${h4L(E.c3,.5)}/>`+h4Hi('M34 18Q50 15 66 18',.4));
// Large stage top hat: tall crown, wide curled brim, sequin band, feather plume and bow, worn tilted
hat('stagetop','Large stage top hat',['Stage','Elegant','Magical'],{col:['#2b2436','#e8394f','#f3c35c'],ay:0,pat:'sparkle',pc:'#ffffff'},E=>`<g transform="rotate(-8 50 10)"><path d="M30 -38Q50 -42 70 -38L68 10Q50 13 32 10Z" fill="${E.f}" ${h4L(E.c1)}/><ellipse cx="50" cy="-38" rx="20" ry="3.4" fill="${mixc(E.c1,'#ffffff',.25)}" ${h4L(E.c1,.5)}/>`
 +`<path d="M32 0Q50 3 68 0V8Q50 11 32 8Z" fill="${E.c2}"/>${czxAlong([[33,4],[67,4]],1.7,(x,y)=>`<circle cx="${Q(x)}" cy="${Q(y)}" r=".55" fill="#fff" opacity=".8"/>`)}`
 +`<path d="M12 14Q8 6 18 6Q50 14 82 6Q92 6 88 14Q50 20 12 14Z" fill="${E.f}" ${h4L(E.c1)}/>`+h4Hi('M36 -32V-4',.35)
 +`<path d="M66 2Q86 -24 82 -46Q78 -30 70 -24Q78 -36 74 -50Q68 -30 64 -2Z" fill="${E.c3}" ${h4L(E.c3,.4)}/>`+czxBow(66,4,1,E.c2,czxL(E.c2),0)+`</g>`);
// Wide-brim picture hat: very wide soft brim, low crown, ribbon band and flowers
hat('widebrim','Wide-brim picture hat',['Elegant','Romantic','Summer'],{col:['#f6e7c8','#f7a8c8','#ffffff'],ay:12},E=>`<path d="M-14 22Q-18 8 6 4Q50 -2 94 4Q118 8 114 22Q100 30 50 24Q0 30 -14 22Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +h4Sh('M-12 22Q2 28 50 22Q98 28 112 22Q100 26 50 26Q0 26 -12 22Z',.2)+`<path d="M26 8Q24 -16 50 -17Q76 -16 74 8Q50 12 26 8Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +`<path d="M26 2Q50 7 74 2V8Q50 13 26 8Z" fill="${E.c2}"/>`+czxFlower(70,4,5,6,E.c3,E.c2)+czxFlower(62,7,3.4,5,E.c2,E.c3)+czxLeaf(76,6,2.2,60,'#7cbf7a')
 +h4Hi('M-6 12Q20 4 50 3',.35));
// Straw boater: flat crown and flat brim, ribbon band with a side bow
hat('boater','Straw boater',['Summer','Retro','Cute'],{col:['#f1d79a','#2c3a6b','#ffffff'],pat:'weave',pc:'#c9a45c'},E=>`<g transform="translate(50 15) scale(1.2) translate(-50 -10)">`+`<path d="M6 18Q4 10 16 9Q50 13 84 9Q96 10 94 18Q50 24 6 18Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +`<path d="M24 12L26 -10Q50 -14 74 -10L76 12Q50 16 24 12Z" fill="${E.f}" ${h4L(E.c1)}/><ellipse cx="50" cy="-11" rx="24" ry="3" fill="${mixc(E.c1,'#ffffff',.2)}" ${h4L(E.c1,.4)}/>`
 +`<path d="M25 4Q50 8 75 4L76 11Q50 15 24 11Z" fill="${E.c2}"/><path d="M25 5.6Q50 9.6 75 5.6" stroke="${E.c3}" stroke-width=".5" fill="none"/>`+czxBow(30,8,1,E.c2,czxL(E.c2),1)+`</g>`);
// Plumed bicorne: two raised points edged in gold, cockade and a sweeping plume
hat('bicorne','Plumed idol bicorne',['Military','Royal','Stage'],{col:['#1f2a52','#d9b36a','#ffffff'],ay:4},E=>`<path d="M4 16Q14 -14 50 -10Q86 -14 96 16Q72 8 50 10Q28 8 4 16Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +`<path d="M5 15Q14 -12 50 -8Q86 -12 95 15" stroke="${E.c2}" stroke-width="1.6" fill="none"/><path d="M10 12Q30 4 50 6Q70 4 90 12" stroke="${E.c2}" stroke-width=".7" fill="none" stroke-dasharray="1.4 .8"/>`
 +czxFlower(50,-2,5.6,10,E.c3,E.c2,'pointed')+`<circle cx="50" cy="-2" r="2.2" fill="${E.c2}"/>`
 +`<path d="M40 -6Q30 -30 46 -40Q40 -26 52 -14Q46 -30 60 -38Q54 -22 56 -6Z" fill="${E.c3}" ${h4L(E.c3,.4)}/>`+h4Hi('M20 4Q34 -6 46 -6',.4));
// Knotted fabric head wrap: wide padded fabric band with a big top knot and two short ends
hat('headwrap','Knotted fabric head wrap',['Casual','Retro','Cute'],{col:['#e2455f','#ffffff','#f3c35c'],pat:'dots',pc:'#ffffff'},E=>`<path d="M12 30Q10 4 50 -2Q90 4 88 30L80 30Q78 10 50 7Q22 10 20 30Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +`<path d="M20 30Q22 12 50 8M80 30Q78 12 50 8" stroke="${E.l}" stroke-width=".4" fill="none" opacity=".6"/><path d="M42 -4Q34 -20 46 -16Q50 -12 50 -4ZM58 -4Q66 -20 54 -16Q50 -12 50 -4Z" fill="${E.f}" ${h4L(E.c1,.6)}/>`
 +`<ellipse cx="50" cy="-3" rx="5" ry="4" fill="${E.f}" ${h4L(E.c1,.6)}/>`+h4Hi('M18 22Q22 6 46 1',.35));
// Bucket hat: soft rounded crown, sloped brim, stitched rows
hat('bucket','Bucket hat',['Casual','Street','Cool'],{col:['#9fd3ff','#ffffff','#2b2436']},E=>`<g transform="translate(50 15) scale(1.2) translate(-50 -10)">`+`<path d="M22 8Q20 -16 50 -17Q80 -16 78 8Z" fill="${E.f}" ${h4L(E.c1)}/>`
 +`<path d="M22 6Q50 12 78 6L90 22Q50 30 10 22Z" fill="${E.f}" ${h4L(E.c1)}/>${[0,1,2].map(i=>`<path d="M${13+i*2.4} ${20.6-i*3.2}Q50 ${28-i*3.2} ${87-i*2.4} ${20.6-i*3.2}" stroke="${E.c2}" stroke-width=".4" fill="none" stroke-dasharray="1 .7"/>`).join('')}`
 +`<path d="M22 6Q50 12 78 6" stroke="${E.c3}" stroke-width="1.4" fill="none"/>`+h4Hi('M32 -8Q50 -14 68 -8',.4)+`</g>`);

// ---- B. More head accessories (category "hd") --------------------------------------------------------------------------------
const hd4=(k,n,tags,o,fn)=>czxAdd('hd',k,n,{...HD,tags,...o,head:fn});
// bow builder (shared with the hair ribbons): centre at 0,0, loops ±w
const h4Loop=(sx,w,h1,h2)=>`M0 0C${Q(sx*w*.3)} ${Q(-h1)} ${Q(sx*w*1.05)} ${Q(-h1*.95)} ${Q(sx*w)} ${Q(-h1*.1)}C${Q(sx*w*.95)} ${Q(h2)} ${Q(sx*w*.4)} ${Q(h2*.8)} 0 0Z`;
const h4Tail=(sx,len,w,sway=0)=>`M${Q(sx*.8)} .6C${Q(sx*(1.5+sway))} ${Q(len*.4)} ${Q(sx*(w*.4+sway))} ${Q(len*.7)} ${Q(sx*(w*.55+sway))} ${Q(len)}L${Q(sx*(w*.3+sway))} ${Q(len-1.8)}L${Q(sx*(w*.08+sway))} ${Q(len+.4)}C${Q(sx*(sway*.6-.2))} ${Q(len*.6)} ${Q(sx*.2)} ${Q(len*.3)} 0 1Z`;
const h4TailTo=(ex,ey,wd)=>`M-.9 .4C${Q(ex*.15-1)} ${Q(ey*.35)} ${Q(ex*.85-wd*.4)} ${Q(ey*.7)} ${Q(ex-wd*.5)} ${Q(ey)}L${Q(ex)} ${Q(ey-1.8)}L${Q(ex+wd*.5)} ${Q(ey+.3)}C${Q(ex*.85+wd*.3)} ${Q(ey*.65)} ${Q(ex*.2+1)} ${Q(ey*.3)} .9 .6Z`;
function h4Bow(st,E,o={}){const f=E.f,l=E.l,c2=E.c2,c3=E.c3,dc=E.dc,w=o.w||12,h=o.h||8,tl=o.tail??11;let s='';
 const loops=(w,h,fill,ln)=>[-1,1].map(sx=>`<path d="${h4Loop(sx,w,h,h*.7)}" fill="${fill}" stroke="${ln}" stroke-width=".6"/><path d="M${Q(sx*1.6)} -.8Q${Q(sx*w*.5)} ${Q(-h*.55)} ${Q(sx*w*.86)} ${Q(-h*.35)}" stroke="${ln}" stroke-width=".35" fill="none" opacity=".55"/><path d="M${Q(sx*w*.3)} ${Q(-h*.62)}Q${Q(sx*w*.62)} ${Q(-h*.82)} ${Q(sx*w*.86)} ${Q(-h*.55)}" stroke="#fff" stroke-width=".8" fill="none" opacity=".55" stroke-linecap="round"/>`).join('');
 const tails=(len,wd,fill,ln,sw=0)=>o.notail?'':o.out?[[-wd*1.05,len],[-wd*.1,len*.88]].map(([ex,ey])=>`<path d="${h4TailTo(ex,ey,wd*.75)}" fill="${fill}" stroke="${ln}" stroke-width=".5"/>`).join(''):[-1,1].map(sx=>`<path d="${h4Tail(sx,len,wd,sw)}" fill="${fill}" stroke="${ln}" stroke-width=".5"/>`).join('');
 const knot=(r=2.4,col=E.c1)=>`<ellipse rx="${r}" ry="${Q(r*1.15)}" fill="${mixc(col,'#ffffff',.18)}" stroke="${l}" stroke-width=".55"/><path d="M${-r*.5} ${-r*.6}Q0 ${-r*.2} ${r*.5} ${-r*.6}" stroke="${l}" stroke-width=".3" fill="none" opacity=".6"/>`;
 if(st=='classic'){s=tails(tl,w*.7,f,l)+loops(w,h,f,l)+knot()}
 else if(st=='puffy'){s=tails(tl*.8,w*.6,f,l)+[-1,1].map(sx=>`<path d="M0 0C${sx*w*.2} ${-h*1.3} ${sx*w*1.25} ${-h*1.25} ${sx*w*1.1} ${-h*.05}C${sx*w*1.05} ${h*1.05} ${sx*w*.2} ${h*.95} 0 0Z" fill="${f}" stroke="${l}" stroke-width=".6"/><path d="M${sx*w*.55} ${-h*.2}Q${sx*w*.75} ${h*.1} ${sx*w*.55} ${h*.45}" stroke="${l}" stroke-width=".35" fill="none" opacity=".5"/><ellipse cx="${Q(sx*w*.65)}" cy="${Q(-h*.5)}" rx="${Q(w*.2)}" ry="${Q(h*.18)}" fill="#fff" opacity=".4"/>`).join('')+knot(2.8)}
 else if(st=='double'){s=tails(tl,w*.75,c2,czxL(c2))+loops(w*1.25,h*1.2,c2,czxL(c2))+loops(w*.85,h*.85,f,l)+knot()}
 else if(st=='triple'){s=tails(tl*1.1,w*.75,f,l)+loops(w*1.35,h*1.25,f,l)+loops(w*1.05,h,c2,czxL(c2))+loops(w*.7,h*.7,f,l)+knot(2.2,c3)}
 else if(st=='frilly'){s=tails(tl,w*.7,f,l)+[-1,1].map(sx=>czxAlong(czxCurve(sx*w*.25,-h*.95,sx*w*1.02,-h*.15,-1,8).concat(czxCurve(sx*w*1.02,-h*.15,sx*w*.3,h*.65,1,6)),1.5,(x,y)=>`<circle cx="${Q(x)}" cy="${Q(y)}" r="1.15" fill="${dc}" stroke="${czxL(dc)}" stroke-width=".2"/>`)).join('')+loops(w,h,f,l)+knot()}
 else if(st=='long'){s=tails(o.long||34,w*.7,f,l,1.4)+loops(w,h,f,l)+knot()}
 else if(st=='butterfly'){s=tails(tl*.7,w*.5,f,l)+[-1,1].map(sx=>`<path d="${h4Loop(sx,w*.75,h*.6,h*1.2).replace(/^M0 0C/,'M0 0C')}" transform="rotate(${sx*28})" fill="${c2}" stroke="${czxL(c2)}" stroke-width=".55"/>`).join('')+[-1,1].map(sx=>`<path d="${h4Loop(sx,w*1.05,h*1.2,h*.3)}" transform="rotate(${-sx*12})" fill="${f}" stroke="${l}" stroke-width=".6"/>`).join('')+knot(2)}
 else if(st=='heart'){s=tails(tl,w*.6,f,l)+[-1,1].map(sx=>`<g transform="translate(${Q(sx*w*.55)} ${Q(-h*.15)}) rotate(${sx*-70})">${czxHeart(0,0,w*.32,f).replace(/stroke="[^"]*"/,`stroke="${l}"`)}</g>`).join('')+knot(2.2)}
 else if(st=='dblrib'){s=(o.notail?'':o.out?[[-w*1.15,tl*2.2,f,l],[-w*.75,tl*1.8,c2,czxL(c2)],[-w*.4,tl*2,f,l],[-w*.02,tl*1.6,c2,czxL(c2)]].map(([ex,ey,fi,ln])=>`<path d="${h4TailTo(ex,ey,w*.3)}" fill="${fi}" stroke="${ln}" stroke-width=".45"/>`).join(''):[-1,1].map(sx=>`<path d="${h4Tail(sx,tl*2.2,w*.35,.5)}" fill="${f}" stroke="${l}" stroke-width=".45"/><path d="${h4Tail(sx,tl*1.8,w*.35,2.2)}" fill="${c2}" stroke="${czxL(c2)}" stroke-width=".45"/>`).join(''))+loops(w*.65,h*.65,f,l)+knot(1.8)}
 else if(st=='lace'){s=tails(tl,w*.7,f,l)+[-1,1].map(sx=>`<path d="${h4Loop(sx,w*1.12,h*1.12,h*.8)}" fill="${dc}" stroke="${czxL(dc)}" stroke-width=".35" stroke-dasharray=".8 .5"/>`).join('')+loops(w,h,f,l)+knot()}
 else if(st=='jewel'){s=tails(tl,w*.7,f,l)+loops(w,h,f,l)+czxGem(0,.2,3.2,c3)+czxPearls(czxCurve(-w*.7,h*.3,w*.7,h*.3,3,10),'#fbf6ee',.55,1.3)}
 else if(st=='flower'){s=tails(tl,w*.7,f,l)+loops(w,h,f,l)+czxLeaf(-3,2,2,-120,'#7cbf7a')+czxLeaf(3,2,2,120,'#7cbf7a')+czxFlower(0,0,4.6,6,c3,c2)}
 else if(st=='stage'){s=tails(tl*1.6,w*.9,f,l,1)+loops(w*1.45,h*1.35,f,l)+loops(w*.95,h*.9,c2,czxL(c2))+czxGem(0,.2,3,c3)}
 else s=loops(w,h,f,l)+knot();
 return s}
hd4('topbow','Oversized top bow',['Cute','Idol','Lolita'],{ay:4,col:['#f27aa6','#ffffff','#f3c35c']},E=>`<g transform="translate(50 4) scale(1.45)">${h4Bow('puffy',E,{w:12,h:8,tail:9})}</g>`);
hd4('dbltopbow','Double stacked bow',['Cute','Idol','Romantic'],{lr:1,one:1,ax:72,ay:16,col:['#f7a8c8','#ffffff','#f3c35c']},E=>`<g transform="translate(72 16) rotate(22) scale(1.4)">${h4Bow('double',E,{w:9,h:6,tail:9})}</g>`);
hd4('minibows','Small bows trio',['Cute','Idol'],{lr:1,one:1,ax:26,ay:24,col:['#e2455f','#ffffff','#f3c35c']},E=>[[21,31,-30,.72],[29,21,-18,.86],[39,14,-8,.72]].map(([x,y,r,s])=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${h4Bow('classic',E,{w:9,h:6,tail:6})}</g>`).join(''));
hd4('ribrosette','Layered ribbon rosette',['Elegant','Idol','Stage'],{lr:1,one:1,ax:74,ay:22,col:['#3c4a78','#ffffff','#d9b36a']},E=>`<g transform="translate(74 22)">${[0,1].map(i=>`<path d="${h4Tail(-1,26,5,i?-1:1)}" fill="${i?E.c2:E.f}" stroke="${i?czxL(E.c2):E.l}" stroke-width=".45" transform="rotate(${i?18:-8})"/>`).join('')}${[...Array(12)].map((_,i)=>`<ellipse cy="-6.4" rx="2.2" ry="4.2" fill="${i%2?E.c2:E.f}" stroke="${E.l}" stroke-width=".3" transform="rotate(${i*30})"/>`).join('')}${[...Array(8)].map((_,i)=>`<ellipse cy="-3.6" rx="1.6" ry="2.6" fill="${E.c2}" stroke="${E.l}" stroke-width=".25" transform="rotate(${i*45+22})"/>`).join('')}<circle r="2.4" fill="${E.c3}" stroke="${czxL(E.c3)}" stroke-width=".3"/></g>`);
hd4('rose','Rose hair accessory',['Romantic','Elegant','Gothic'],{lr:1,one:1,ax:76,ay:24,col:['#c8203f','#7a1f3d','#3c9a6c']},E=>`<g transform="translate(76 24)">${czxLeaf(-5,3,3.4,-110,E.c3)}${czxLeaf(5,3,3.4,110,E.c3)}${czxLeaf(0,5,3,180,E.c3)}<circle r="6.4" fill="${E.c1}" stroke="${E.l}" stroke-width=".5"/>${[[0,0,5.2,0],[1,1,3.8,60],[-.6,.4,2.6,140],[.4,-.2,1.4,220]].map(([x,y,r,a])=>`<path d="M${x-r} ${y}A${r} ${r} 0 1 1 ${x+r*.6} ${y+r*.8}" fill="none" stroke="${E.c2}" stroke-width=".7" transform="rotate(${a} ${x} ${y})"/>`).join('')}<ellipse cx="-2" cy="-3" rx="1.6" ry=".9" fill="#fff" opacity=".35"/></g>`);
hd4('fabflower','Large fabric flower',['Romantic','Summer','Cute'],{lr:1,one:1,ax:74,ay:26,col:['#ffd3e6','#ffffff','#f3c35c']},E=>`<g transform="translate(74 26)">${[...Array(7)].map((_,i)=>`<path d="M0 0C-4 -6 -4 -12 0 -13C4 -12 4 -6 0 0Z" fill="${E.f}" stroke="${E.l}" stroke-width=".4" transform="rotate(${i*51.4})"/>`).join('')}${[...Array(7)].map((_,i)=>`<path d="M0 0C-2.6 -4 -2.6 -8 0 -8.6C2.6 -8 2.6 -4 0 0Z" fill="${E.c2}" stroke="${E.l}" stroke-width=".3" opacity=".9" transform="rotate(${i*51.4+25})"/>`).join('')}${[...Array(10)].map((_,i)=>`<circle cx="${Q(Math.cos(i*.63)*2)}" cy="${Q(Math.sin(i*.63)*2)}" r=".7" fill="${E.c3}"/>`).join('')}</g>`);
hd4('pearlstrand','Pearl strand side ornament',['Elegant','Bridal','Royal'],{lr:1,one:1,ax:74,ay:28,col:['#fbf6ee','#d9b36a','#a6dbff']},E=>czxPearls(czxCurve(62,12,86,40,4,12),E.c1,.9,1.9)+czxPearls(czxCurve(66,16,84,46,6,12),E.c1,.7,1.6)+czxAlong(czxCurve(62,12,86,40,4,12),5,(x,y)=>czxGem(x,y+1.4,1.2,E.c3))+`<circle cx="62" cy="12" r="2" fill="${E.c2}"/><circle cx="86" cy="40" r="2" fill="${E.c2}"/>`);
hd4('hearttiara','Heart tiara',['Cute','Princess','Idol'],{col:['#f3c35c','#ffffff','#f27aa6']},E=>`<g transform="translate(50 12) scale(1.45) translate(-50 -12)"><path d="M30 14Q50 8 70 14L70 16Q50 10 30 16Z" fill="${E.c1}" stroke="${czxL(E.c1)}" stroke-width=".5"/>${[[38,10,.8],[50,6,1.3],[62,10,.8]].map(([x,y,s])=>`<path d="M${x} ${y+3.2*s}C${x-5*s} ${y-.4*s} ${x-3.6*s} ${y-5*s} ${x} ${y-2.2*s}C${x+3.6*s} ${y-5*s} ${x+5*s} ${y-.4*s} ${x} ${y+3.2*s}Z" fill="none" stroke="${E.c1}" stroke-width="${1.1*s}"/><circle cx="${x}" cy="${y-.4*s}" r="${Q(1.2*s)}" fill="${E.c3}"/>`).join('')}${[34,44,56,66].map(x=>`<circle cx="${x}" cy="${12.6+Math.abs(x-50)*.05}" r=".7" fill="${E.c2}"/>`).join('')}</g>`);
hd4('laceband','Lace headband',['Lolita','Elegant','Gothic'],{col:['#ffffff','#2b2436','#f27aa6']},E=>czxHB(E.c2,czxL(E.c2))+czxAlong(czxCurve(20,34,80,34,-26,20),1.9,(x,y,k)=>`<path d="M${Q(x)} ${Q(y)}l-1 -2.6q1 -1.4 2 0z" fill="${E.c1}" stroke="${czxL(E.c1)}" stroke-width=".25" transform="rotate(${Q((x-50)*1.4)} ${Q(x)} ${Q(y)})"/>`)+czxBow(66,12,.8,E.c3,czxL(E.c3),1));
hd4('ribbonband','Ribbon headband (side bow)',['Cute','Idol','Alice'],{col:['#9fd3ff','#ffffff','#f3c35c']},E=>czxHB(E.f,E.l)+`<g transform="translate(70 12) rotate(28)">${h4Bow('classic',E,{w:9,h:6,tail:8})}</g>`);
hd4('wideband','Wide knotted fabric headband',['Casual','Retro','Cute'],{col:['#f7a8c8','#ffffff','#f3c35c'],pat:'gingham',pc:'#ffffff'},E=>`<path d="M16 36C18 10 34 3 50 3C66 3 82 10 84 36L77 37C75 16 64 10 50 10C36 10 25 16 23 37Z" fill="${E.f}" stroke="${E.l}" stroke-width=".6"/><path d="M44 4Q46 -2 50 2Q54 -2 56 4Q54 10 50 7Q46 10 44 4Z" fill="${E.f}" stroke="${E.l}" stroke-width=".55"/><path d="M24 34C26 16 36 9 50 9" stroke="${E.l}" stroke-width=".35" fill="none" opacity=".6"/>`);
hd4('fascinator','Net-veil fascinator',['Elegant','Mature','Retro'],{lr:1,one:1,ax:70,ay:16,col:['#2b2436','#d9b36a','#e8394f']},E=>`<path d="M54 16Q56 30 70 40Q84 36 90 22Q78 6 62 8Z" fill="none" stroke="${E.c1}" stroke-width=".3" opacity=".7"/>${czxAlong(czxCurve(56,14,88,22,8,10),2.2,(x,y)=>`<path d="M${Q(x)} ${Q(y)}l3 14" stroke="${E.c1}" stroke-width=".2" opacity=".6"/>`)}<ellipse cx="70" cy="14" rx="10" ry="5" fill="${E.f}" stroke="${E.l}" stroke-width=".6" transform="rotate(16 70 14)"/><path d="M72 10Q80 -6 90 -4Q82 2 78 10Z" fill="${E.c3}" stroke="${czxL(E.c3)}" stroke-width=".3"/>`+czxFlower(64,12,3,6,E.c3,E.c2));
hd4('sideorn','Side ornament with streamers',['Stage','Idol','Elegant'],{lr:1,one:1,ax:24,ay:30,col:['#f3c35c','#e8394f','#ffffff']},E=>`<g transform="translate(24 30)">${[-6,2,10].map((a,i)=>`<path d="${h4Tail(-1,30+i*6,4,1)}" fill="${[E.c2,E.c3,E.c2][i]}" stroke="${czxL(E.c2)}" stroke-width=".35" transform="rotate(${a})"/>`).join('')}${czxStar(0,-2,5.4,E.c1,8,.5)}${czxGem(0,-2,2.4,E.c3)}</g>`);
hd4('kogaibow','Japanese ribbon kanzashi (tsumami bow)',['Japanese','Festival','Cute'],{lr:1,one:1,ax:74,ay:20,col:['#e8394f','#ffffff','#f3c35c']},E=>`<g transform="translate(74 20) rotate(18)">${[-1,1].map(sx=>[0,1,2].map(i=>`<path d="M0 0Q${sx*(4+i*2.4)} ${-6+i*1.2} ${sx*(8+i*2.8)} ${-1+i*2.6}Q${sx*(4+i*2)} ${2+i*.6} 0 0Z" fill="${i%2?E.c2:E.f}" stroke="${E.l}" stroke-width=".35"/>`).join('')).join('')}${czxAlong([[0,2],[0,22]],3,(x,y)=>czxPearl(x,y,.8,E.c3))}<circle r="2" fill="${E.c3}"/></g>`);
// ---- C. Hair ribbons on the hairstyle's real tie points ----------------------------------------------------------------------
// kind: 'twin' (both tails of a twin-tail style, also double braids) · 'pony' (the ponytail / half-up tie, or a bun)
const HRB={};
const hrb=(k,n,kind,st,o,tags)=>{HRB[k]={kind,st,...o};czxAdd('hrb',k,(kind=='twin'?'Twin tails · ':'Ponytail · ')+n,{z:'head',hair:kind,ax:50,ay:20,sc:[.6,1.6],mv:6,rot:30,col:o.col||['#f27aa6','#ffffff','#f3c35c'],tags:['Hair',kind=='twin'?'Twin tails':'Ponytail',...(tags||[])],head:()=>''})};
hrb('tw_classic','Large classic bows','twin','classic',{w:12,h:8,tail:12},['Cute','Idol']);
hrb('tw_puffy','Puffy ribbon bows','twin','puffy',{w:11,h:8,tail:9},['Cute','Lolita']);
hrb('tw_double','Double-layer bows','twin','double',{w:10,h:7,tail:12,col:['#f7a8c8','#ffffff','#f3c35c']},['Cute','Romantic']);
hrb('tw_triple','Triple-layer bows','twin','triple',{w:10,h:7,tail:13,col:['#e2455f','#ffffff','#f3c35c']},['Stage','Idol']);
hrb('tw_frilly','Frilly bows','twin','frilly',{w:10,h:7,tail:11,col:['#9fd3ff','#ffffff','#ffffff']},['Lolita','Cute']);
hrb('tw_big','Oversized stage bows','twin','stage',{w:12,h:9,tail:16,col:['#e8394f','#ffffff','#a6dbff']},['Stage','Idol']);
hrb('tw_long','Long flowing ribbon bows','twin','long',{w:10,h:7,long:46},['Elegant','Romantic']);
hrb('tw_butterfly','Butterfly bows','twin','butterfly',{w:11,h:8,tail:9,col:['#c9b6ff','#ffffff','#f3c35c']},['Fantasy','Cute']);
hrb('tw_heart','Heart-shaped bows','twin','heart',{w:12,h:8,tail:10,col:['#ff6f9c','#ffffff','#f3c35c']},['Cute','Valentine']);
hrb('tw_dblrib','Decorative double ribbons','twin','dblrib',{w:12,h:8,tail:16,col:['#2c3a6b','#e2455f','#ffffff']},['Uniform','Elegant']);
hrb('tw_lace','Lace-trimmed bows','twin','lace',{w:10,h:7,tail:11,col:['#2b2436','#ffffff','#f27aa6']},['Lolita','Gothic']);
hrb('tw_jewel','Jewel-centred bows','twin','jewel',{w:11,h:7.5,tail:11,col:['#3c4a78','#ffffff','#a6dbff']},['Elegant','Royal']);
hrb('tw_flower','Flower & ribbon bows','twin','flower',{w:10,h:7,tail:11,col:['#ffd3e6','#ffffff','#f27aa6']},['Romantic','Spring']);
hrb('pt_big','Large ponytail bow','pony','puffy',{w:14,h:9.5,tail:12},['Cute','Idol']);
hrb('pt_classic','Classic ponytail ribbon','pony','long',{w:9,h:6,long:30,col:['#e2455f','#ffffff','#f3c35c']},['School','Cute']);
hrb('pt_double','Double-layer ponytail bow','pony','double',{w:11,h:7.5,tail:13},['Cute','Romantic']);
hrb('pt_trail','Long trailing ribbons','pony','dblrib',{w:10,h:7,tail:24,col:['#9fd3ff','#ffffff','#f3c35c']},['Elegant','Stage']);
hrb('pt_wrap','Ribbon wrap around the base','pony','wrap',{w:7},['Elegant','Casual']);
hrb('pt_puff','Puffy ponytail ornament (scrunchie)','pony','scrunchie',{w:8},['Casual','Cute']);
hrb('pt_frill','Frilly ponytail decoration','pony','frill',{w:9,col:['#ffffff','#f7a8c8','#f3c35c']},['Lolita','Cute']);
hrb('pt_flower','Flower & ribbon ponytail','pony','flower',{w:10,h:7,tail:12,col:['#f7a8c8','#ffffff','#f27aa6']},['Romantic','Spring']);
hrb('pt_band','Decorative ponytail band','pony','band',{w:7,col:['#d9b36a','#ffffff','#a6dbff']},['Elegant','Stage']);
hrb('pt_stage','Elegant stage ponytail bow','pony','stage',{w:12,h:8.5,tail:18,col:['#2b2436','#ffffff','#d9b36a']},['Stage','Elegant']);
// tie points of the hairstyle drawn for this member (main back hair + mixed layers), with the tail direction at each tie
function h4Ties(a,D,seed){const out=[];const one=(bk,xf)=>{let B;try{B=backHair(bk,D,seed)}catch(e){return}if(!B)return;const vt=B.vt||[],ties=B.tie&&B.tie.length?B.tie:vt.map(t=>t.P[0]);
  const P=(p)=>xf?[50+xf.x+xf.s*(p[0]-50),10+xf.y+xf.s*(p[1]-10)]:p,sc=xf?xf.s:1;
  ties.forEach(t=>{const T=vt.slice().sort((u,v)=>Math.hypot(u.P[0][0]-t[0],u.P[0][1]-t[1])-Math.hypot(v.P[0][0]-t[0],v.P[0][1]-t[1]))[0];const near=T&&Math.hypot(T.P[0][0]-t[0],T.P[0][1]-t[1])<8;
   const end=T&&!near&&T.P.length&&Math.hypot(T.P[T.P.length-1][0]-t[0],T.P[T.P.length-1][1]-t[1])<8;let dir=90;if(T&&near&&T.P[1])dir=Math.atan2(T.P[1][1]-T.P[0][1],T.P[1][0]-T.P[0][0])*180/Math.PI;
   out.push({p:P(t),dir,sc,end,w:T?T.W:12,braid:!!(T&&T.br)})});
  (B.parts||[]).filter(q=>q.k=='bun').forEach(q=>out.push({p:P([q.x,q.y+q.r*.78]),dir:90,sc,bun:1,w:q.r*1.4}))};
 one(a.bk);(Array.isArray(a.bkx)?a.bkx:[]).forEach(L=>{if(L&&!L.m&&L.k!=null)one(L.k,{x:+L.x||0,y:+L.y||0,s:Math.max(.5,Math.min(1.6,+L.s||1))})});return out}
function h4TieKind(T){const two=T.filter(t=>!t.bun);if(two.length>=2&&two.some(t=>t.p[0]<45)&&two.some(t=>t.p[0]>55))return'twin';if(two.length==1)return'pony';if(T.some(t=>t.bun))return'bun';return null}
// one ribbon at a tie
function h4AtTie(R,E,P,t,side){const s=czxC(P.s??1,.6,1.6)*t.sc*(t.end?.8:1),dx=czxC(P.dx,-6,6)*(side?-1:1),dy=czxC(P.dy,-6,6),rot=czxC(P.r,-30,30)*(side?-1:1);
 const x=t.p[0]+dx,y=t.p[1]+dy,mir=side?' scale(-1 1)':'';let tilt=t.bun?0:side?-12:12;if(t.p[1]>60)tilt*=.4;
 let g='';const st=R.st,bw=t.w||12;
 if(st=='wrap'||st=='band'||st=='scrunchie'||st=='frill'){const a=(t.dir||90)-90,W=Math.max(6,Math.min(12,bw*.55));
  if(st=='wrap')g=`<g transform="rotate(${Q(a)})">${[0,1,2].map(i=>`<path d="M${Q(-W)} ${i*2.4-2}Q0 ${i*2.4+.2} ${Q(W)} ${i*2.4-2}L${Q(W)} ${i*2.4}Q0 ${i*2.4+2.2} ${Q(-W)} ${i*2.4}Z" fill="${i%2?E.c2:E.f}" stroke="${E.l}" stroke-width=".35"/>`).join('')}<path d="${h4Tail(1,22,4,1.5)}" fill="${E.f}" stroke="${E.l}" stroke-width=".4" transform="translate(${Q(W*.6)} 4)"/><path d="${h4Tail(-1,18,4,1)}" fill="${E.c2}" stroke="${czxL(E.c2)}" stroke-width=".4" transform="translate(${Q(W*.4)} 4)"/></g>`;
  if(st=='band')g=`<g transform="rotate(${Q(a)})"><path d="M${Q(-W)} -3Q0 -1 ${Q(W)} -3V3Q0 5 ${Q(-W)} 3Z" fill="${E.f}" stroke="${E.l}" stroke-width=".5"/>${czxAlong([[-W+1.4,0],[W-1.4,0]],2.6,(x,y,k)=>k%2?czxPearl(x,y+1,.8):czxGem(x,y+1,1.2,E.c3))}<path d="M${Q(-W)} -2.4Q0 -.4 ${Q(W)} -2.4" stroke="#fff" stroke-width=".5" opacity=".5" fill="none"/></g>`;
  if(st=='scrunchie')g=`<g transform="rotate(${Q(a)})">${[...Array(9)].map((_,i)=>{const u=i/8,xx=-W+2*W*u;return`<ellipse cx="${Q(xx)}" cy="${Q(Math.sin(u*Math.PI)*1.4)}" rx="2.6" ry="3.8" fill="${i%2?E.f:mixc(E.c1,'#ffffff',.2)}" stroke="${E.l}" stroke-width=".35"/>`}).join('')}</g>`;
  if(st=='frill')g=`<g transform="rotate(${Q(a)})">${czxAlong(czxCurve(-W-2,1,W+2,1,2,12),1.6,(x,y)=>`<path d="M${Q(x)} ${Q(y)}l-1.2 4.4q1.2 1.2 2.4 0z" fill="${E.f}" stroke="${E.l}" stroke-width=".3"/>`)}<path d="M${Q(-W-1)} -1Q0 1.4 ${Q(W+1)} -1V2Q0 4.4 ${Q(-W-1)} 2Z" fill="${E.c2}" stroke="${czxL(E.c2)}" stroke-width=".4"/>${czxBow(0,0,.7,E.c3,czxL(E.c3),0)}</g>`}
 else g=h4Bow(st,E,{w:R.w,h:R.h,tail:R.tail,long:R.long,out:1,notail:t.bun&&t.p[1]<40});
 return`<g transform="translate(${Q(x)} ${Q(y)}) rotate(${Q(tilt+rot)})${mir} scale(${Q(s)})">${g}</g>`}
function h4HairRibbons(cd,a,D,seed){const L=czxPieces(cd).filter(([,D2])=>D2.hair);if(!L.length)return'';const T=h4Ties(a,D,seed);if(!T.length)return'';const kind=h4TieKind(T);let s='';const defs=[];
 L.forEach(([P,D2,key])=>{const R=HRB[key];if(!R)return;const E=czxE(P,D2,'§r',key,defs);let use=[];
  if(R.kind=='twin'){if(kind=='twin')use=T.filter(t=>!t.bun)}
  else{if(kind=='pony')use=T.filter(t=>!t.bun);else if(kind=='bun')use=T.filter(t=>t.bun);else if(kind=='twin')use=[]}
  use.forEach(t=>{s+=h4AtTie(R,E,P,t,t.p[0]>50?1:0)})});
 return(defs.length?`<defs>${defs.join('')}</defs>`:'')+s}
// which hair ribbons fit the member's hairstyle (for the designer hint)
function h4HairKind(a,D){try{return h4TieKind(h4Ties(a,D,131))}catch(e){return null}}
{const f=headParts;headParts=function(m,ex,id,opt={}){const r=f.apply(this,arguments);try{const a=r&&r.a;if(a&&a.cd&&a.cd.hrb){const add=h4HairRibbons(a.cd,a,r.D,((m.id|0)+1)*131);if(add)r.top=add+(r.top||'')}}catch(e){console.error(e)}return r}}
