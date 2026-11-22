// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Rival groups, industry balance & the final boss (OMG4ki)
// -------------------------------------------------------------------------------------
//  Extends the existing industry (industry.js / industry2.js, S.ind). Nothing is duplicated:
//  artists, releases, charts, fans and news stay the same systems.
//  · Established acts keep their identity; their top members are now:
//      OMG4ki  Naevis 👑 · Riko · NuMinnie · Sherbelle      (Japan's No.1, the final boss)
//      WINÉR4  Center · Midorin · Cara · Lovetan            (winter · elegant, cool, mysterious)
//      SUMÉR4  Yuki · Sunny · Ranran                        (summer · bright, energetic)
//      Sefira  Layla · Miso · Sunji · Riel · Mirae          (K-pop · exactly five, permanent)
//    Old saves are renamed once (the old star records become these members; nothing is added twice).
//  · Every group now has its whole roster as real members (a.mx): unique names, Vocal / Dance /
//    Variety, popularity, a persistent appearance (ap) and a member id for portraits (pid).
//    Generated once and saved; never regenerated on load.
//  · CD sales of rival releases: active fans × buyer rate × copies per buyer × the release's
//    quality, momentum, Center appeal and release fatigue — no fixed targets. With their current
//    fanbases OMG4ki usually lands around 1–3 million, WINÉR4 / SUMÉR4 around 0.5–1 million, Sefira
//    as a K-pop act in Japan far lower; singles can flop or explode. Fans follow results with
//    a soft market ceiling (no endless growth) and decay once per artist per week.
//  · Rivals develop on their own (monthly): new members, rising stars, graduations of non-core
//    members, new Centers, hits and underperforming singles, tours, controversies, sister rivalry —
//    each with news through the existing news engine.
//  · Industry Ranking (Charts › Industry Ranking): sales, charts, fanbase, fan loyalty, member
//    popularity, music quality, live, awards, media and consistency, each 0–100; the overall
//    standing needs several of them.
// =====================================================================================
const RV_STARS={
 omg4ki:[['Naevis','Ace · Center','Legendary',92,91,88,1],['Riko','Main Vocal','Graceful',90,74,68],['NuMinnie','Main Dancer','Cute',74,92,78],['Sherbelle','Visual · Variety','Elegant',76,78,88]],
 winer4:[['Center','Center','Cool',82,80,60],['Midorin','Main Dancer','Mysterious',70,93,58],['Cara','Main Vocal','Elegant',92,66,56],['Lovetan','Visual','Calm',72,74,70]],
 sumer4:[['Yuki','Center','Energetic',78,84,80],['Sunny','Variety','Cheerful',68,74,94],['Ranran','Main Dancer','Genki',70,91,76]],
 sefira:[['Layla','Leader · Main Dancer','Charismatic',76,94,72],['Miso','Main Vocal','Warm',95,72,70],['Sunji','Main Rapper','Bold',80,86,82],['Riel','Visual · Sub Vocal','Elegant',76,76,72],['Mirae','Maknae · Lead Dancer','Playful',72,88,84]]};
// old star names of earlier versions → the established members (one-time rename)
const RV_REN={'Shion Amagi':'Riko','Rina Kurosaki':'NuMinnie','Momoka Sakuraba':'Sherbelle','Yukino Shiraishi':'Center','Sayuri Hyodo':'Midorin','Rei Fuyutsuki':'Cara','Mafuyu Kagami':'Lovetan','Natsumi Hinata':'Yuki','Kaho Minazuki':'Sunny','Hikari Asahi':'Ranran','Seoa':'Layla','Hayul':'Miso','Dain':'Sunji'};
const RV_NAMED=new Set(Object.values(RV_STARS).flat().map(x=>x[0]));
// identity & market position of the established acts (fans = Japanese fanbase, br = share that buys, cp = copies per buyer)
const RV_PROF={omg4ki:{fans:10000000,mix:{r:.4,d:.25,h:.15},sp:70,types:4,hs:1,q:.9,loy:88,size:24,img:"Japan's No.1 · pink & yellow idol elegance"},winer4:{fans:3500000,mix:{r:.4,d:.25,h:.15},sp:65,types:3,hs:1,q:.82,loy:80,size:16},sumer4:{fans:3500000,mix:{r:.4,d:.25,h:.15},sp:65,types:3,hs:1,q:.8,loy:78,size:16},sefira:{fans:1500000,mix:{r:.4,d:.25,h:.15},sp:55,types:2,hs:0,q:.86,loy:74,size:5}};
const RV_CEIL=25000000;
// fan mix (share of Regular / Dedicated / Hardcore; the rest are Casual fans who never buy) by kind of act
// every act uses the same standard fan mix (Casual 20% · Regular 40% · Dedicated 25% · Hardcore 15%); acts differ by fans, popularity and support
const RV_STD={r:.4,d:.25,h:.15};
const RV_MIX={fidol:RV_STD,midol:RV_STD,kpop:RV_STD,fsolo:RV_STD,msolo:RV_STD,band:RV_STD};
// keep the constants of industry2.js in line so new games start with the right names
try{const conv=k=>RV_STARS[k].map(([nm,pos,per,vo,da,va])=>[nm,pos,per,vo,da,va]);OMG_MX.splice(0,OMG_MX.length,...conv('omg4ki'));NAEVIS.splice(0,NAEVIS.length,...OMG_MX[0]);IND_FIX.forEach(o=>{if(RV_STARS[o.id])o.mx=conv(o.id)})}catch(e){console.error(e)}

// ---- names ---------------------------------------------------------------------------------------------------------------------
const RV_GN=['Akari','Haruka','Honoka','Miyu','Airi','Yuzuki','Kokona','Mahiro','Nanami','Rino','Tsumugi','Wakana','Hinata','Ayane','Karin','Konomi','Mizuki','Natsuki','Nonoka','Rika','Saya','Suzu','Uta','Yuika','Chika','Ema','Fuuka','Hiyori','Iroha','Kanon','Kurumi','Mitsuki','Noa','Sana','Shiho','Yua','Amane','Kotori','Minori','Miu','Seira','Riona','Moe','Yurika','Hazuki','Asuka','Momone','Kiara'];
const RV_FN=['Aizawa','Kudo','Mizuhara','Sakaki','Tachibana','Kanzaki','Shiina','Asakura','Minami','Takane','Ozora','Morino','Fujishiro','Amamiya','Kurose','Hiiragi','Izumi','Hoshino','Kamiya','Nishino','Shirasaki','Arisugawa','Kirishima','Hayase','Sakurai','Toyama','Yagami','Onodera','Kisaragi','Mikami'];
const RV_KN=['Jiwoo','Seoyeon','Yuna','Minji','Chaeyoung','Dahyun','Soyeon','Eunbi','Haerin','Jisoo','Nayeon','Yerin','Sohee','Gaeun','Bora','Hyejin','Seulgi','Yeji','Jieun','Sumin','Ahyeon','Rora','Hayoon','Siyeon'];
function rvI(){const I=S&&S.ind;if(!I)return null;I.mn=I.mn||[];I.pseq=I.pseq||900000;return I}
function rvName(a,r){const I=rvI(),taken=new Set([...I.mn,...(S.members||[]).map(m=>m.name),...RV_NAMED]);const male=indSexOf(a)=='m';
 for(let i=0;i<80;i++){let n;if(a.cat=='kpop')n=RV_KN[Math.floor(r()*RV_KN.length)]+(i>20?' '+String.fromCharCode(65+Math.floor(r()*26)):'');else if(male)n=INDW.mg[Math.floor(r()*INDW.mg.length)]+' '+RV_FN[Math.floor(r()*RV_FN.length)];else n=RV_GN.concat(INDW.fg)[Math.floor(r()*(RV_GN.length+INDW.fg.length))]+' '+RV_FN.concat(INDW.fam)[Math.floor(r()*(RV_FN.length+INDW.fam.length))];if(!taken.has(n)){I.mn.push(n);return n}}
 const n=`${a.nm} #${++I.pseq}`;I.mn.push(n);return n}

// ---- appearance: persistent and unique for every rival member (same renderer as the player's members) -------------------------
const RV_HUE={omg4ki:330,winer4:220,sumer4:175,sefira:285};
function rvAp(pid,seed,style){const r=mulb(seed|0),p=n=>Math.floor(r()*n),pers=['Genki','Cool','Shy','Elegant','Airhead','Serious'][p(6)];let a=newAp({id:pid,hue:p(360),pers},p(9999));
 const n=(o,d)=>{try{return o&&o.length?o.length:d}catch(e){return d}};
 a={...a,fc:p(4),sk:[0,0,1,1,1,1,2,2,3,4][p(10)],ey:p(n(typeof EYG!='undefined'?EYG:null,6)),br:p(n(typeof APBR!='undefined'?APBR:null,4)),mt:p(n(typeof APMT!='undefined'?APMT:null,5)),ft:p(n(typeof BANGS!='undefined'?BANGS:null,11)),bk:p(n(typeof BKN!='undefined'?BKN:null,12)),ah:r()<.3?1+p(5):0};
 if(style=='kpop'&&r()<.5)a.hc=[0,0,1,4,5,6,7][p(7)];return{pers,ap:a}}
function rvMem(a,o,r,day){const I=rvI(),pid=++I.pseq,b=Math.max(0,Math.min(1,a.q==null?.6:a.q));const st=v=>Math.round(Math.max(25,Math.min(96,v)));
 const L=rvAp(pid,Math.floor(r()*1e9),a.cat=='kpop'?'kpop':'jp');
 return{nm:o.nm,pos:o.pos||'Member',per:o.per||L.pers,vo:o.vo??st(38+r()*40+b*12),da:o.da??st(38+r()*40+b*12),va:o.va??st(32+r()*44+b*8),off:o.off??Math.round(-22+r()*16),pid,ap:L.ap,st:'act',jn:day,gen:o.gen||1,...(o.legend?{legend:1}:{}),...(o.star?{star:1}:{})}}
// figure / portrait stand-in for a rival member (never stored as a player member)
function rvPm(a,s){return{id:s.pid,hue:(RV_HUE[a.id]??a.hue??330)|0,name:s.nm,ap:s.ap,_x:1,pers:s.per,bgc:`hsl(${(RV_HUE[a.id]??a.hue??330)|0},55%,88%)`}}
function rvCanDraw(a){return a&&a.cat!='player'&&indSexOf(a)!='m'&&a.cat!='band'}

// ---- rosters -----------------------------------------------------------------------------------------------------------------------
function rvRoster(a){if(!a||a.cat=='player'||a.rv3)return;const I=rvI(),r=mulb(String(a.id).split('').reduce((h,c)=>h*31+c.charCodeAt(0)|0,7)),P=RV_PROF[a.id],FX=RV_STARS[a.id];a.rv3=1;
 if(P){a.q=P.q;a.mix=P.mix;a.sp=P.sp;a.types=P.types;a.hsk=P.hs;if(!Array.isArray(a.hs))a.hs=[];a.loy=P.loy;if(!a.fx4){a.fx4=1;a.fx3=1;a.fans=Math.max(a.fans|0,P.fans)}if(P.img&&a.id=='omg4ki')a.img=P.img}
 else{const K=IND_K[a.cat]||IND_K.fidol;a.q=a.q??+(.35+r()*.5).toFixed(2);a.cp=a.cp??(a.cat=='fidol'?1.6:a.cat=='midol'||a.cat=='kpop'?1.5:1.1);a.br=a.br??+(K.buy/a.cp).toFixed(3);a.loy=a.loy??Math.round(40+r()*40)}
 const old=Array.isArray(a.mx)?a.mx:[];old.forEach(s=>{if(RV_REN[s.nm])s.nm=RV_REN[s.nm]});
 const solo=a.cat=='fsolo'||a.cat=='msolo',size=P?P.size:solo?1:Math.max(old.length,(a.mem||[]).length,a.cat=='band'?3:4),L=[];
 if(FX)FX.forEach(([nm,pos,per,vo,da,va,lg],i)=>{const s=old.find(x=>x.nm==nm)||{};L.push({...rvMem(a,{nm,pos,per,vo,da,va,off:Math.max(-6,8-i*4),legend:lg,star:1},r,a.deb),...(s.pid?{pid:s.pid,ap:s.ap}:{})})});
 old.forEach(s=>{if(L.some(x=>x.nm==s.nm)||L.length>=size)return;L.push(s.pid?{...s,st:s.st||'act'}:{...rvMem(a,{...s,star:1},r,a.deb)})});
 if(solo&&!L.length)L.push(rvMem(a,{nm:a.nm,pos:'Solo artist',off:0,star:1},r,a.deb));
 while(L.length<size)L.push(rvMem(a,{nm:rvName(a,r),pos:'Member'},r,a.deb+Math.round(r()*Math.max(0,S.day-a.deb))));
 L.forEach(s=>{if(!I.mn.includes(s.nm))I.mn.push(s.nm)});a.mx=L;a.mem=L.filter(s=>s.st!='grad').map(s=>s.nm)}
function rvAll(){const I=rvI();if(!I)return;Object.values(I.A).forEach(a=>{try{rvRoster(a)}catch(e){console.error('rv',a.id,e)}})}
// awards / festival read the active members only (graduated rival members stay in the record)
{const f=indStars;indStars=function(a){if(a&&a.cat!='player'&&!a.rv3)rvRoster(a);return(f.apply(this,arguments)||[]).filter(s=>s.st!='grad')}}
const rvAct=a=>(a&&a.mx||[]).filter(s=>s.st!='grad');
{const f=indS;indS=function(){const I=f.apply(this,arguments);try{if(I&&I.rv3v!=1){I.rv3v=1;rvAll()}}catch(e){console.error(e)}return I}}
{const f=indNewArtist;indNewArtist=function(){const a=f.apply(this,arguments);try{if(S&&S.ind&&S.ind.rv3v)rvRoster(a)}catch(e){}return a}}
// card: the established members by name
{const f=indArtistCard;indArtistCard=function(a){let h=f.apply(this,arguments);try{if(a&&a.mx&&a.mx.length>4){const st=rvAct(a).filter(s=>s.star).map(s=>`${esc(s.nm)}${s.legend?' 👑':''}`);if(st.length)h=h.replace(/<p class="st">⭐[^]*?<\/p>/,`<p class="st">⭐ ${st.join(' · ')} · ${rvAct(a).length} members</p>`)}}catch(e){}return h}}

// ---- CD sales of rival releases: buyers × copies × quality / momentum / Center / fatigue -------------------------------------------
const rvGauss=r=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
function rvCenter(a,r){const M=rvAct(a);if(!M.length)return null;const W=M.map(s=>Math.pow(Math.max(1,indStarPop(a,s)),3)*(s.star?1.5:1)*(.7+r()*.6));let t=W.reduce((x,y)=>x+y,0)*r();for(let i=0;i<M.length;i++){t-=W[i];if(t<=0)return a.mx.indexOf(M[i])}return a.mx.indexOf(M[0])}
{const f=indRelease;indRelease=function(a,k,day,o){if(!a||a.cat=='player'||(o&&o.F!=null)||!S||!S.ind||!S.ind.rv3v)return f.apply(this,arguments);
 if(!a.rv3)rvRoster(a);const r=Math.random,alb=k=='a',gap=a.last!=null?day-a.last:999,fat=gap>=70?1:Math.max(.78,.78+.22*gap/70);
 const q=Math.max(.5,Math.min(1.5,.82+.3*(a.q||.6)+rvGauss(r)*.17)),hype=Math.pow(Math.max(.25,1+(a.mom||0)/30),.6),ci=rvCenter(a,r),cs=ci!=null?a.mx[ci]:null,cen=cs?Math.pow(Math.max(.6,indStarPop(a,cs)/Math.max(1,indPop(a))),.25):1;
 const F=Math.round(rvCds(a,q,hype,cen,gap)*(alb?.72:1));const R=f.call(this,a,k,day,{...(o||{}),F});
 try{R.q=+q.toFixed(3);if(ci!=null){R.cen=ci;const M=rvAct(a),n=Math.min(M.length,a.cat=='fidol'?16:M.length);R.sen=M.slice().sort((x,y)=>indStarPop(a,y)+(y.star?6:0)-indStarPop(a,x)-(x.star?6:0)+(r()-.5)*8).slice(0,n).map(s=>a.mx.indexOf(s));if(!R.sen.includes(ci))R.sen[R.sen.length-1]=ci}
  if(a.lock&&a.rel.length>1)rvRelNews(a,R)}catch(e){console.error(e)}return R}}
// fans follow the results: buyers and listeners become fans, a soft market ceiling, one decay per artist and week
// rival CD sales: the same fan purchase model as the player's singles (cd-demand.js) with the act's own fanbase,
// fan mix, spending power, Types and incentives; release quality, momentum and the Center are the interest
function rvCds(a,q,hype,cen,gap){const X=a.mix||RV_MIX[a.cat]||RV_MIX.fidol,N=a.fans||0,I=(q-1)*.8+(hype-1)*.5+(cen-1)*.5,fat=gap<45?.35:gap<70?.2:gap<95?.08:0,idol=['fidol','midol'].includes(a.cat);
 const M=cdModel({casual:N*Math.max(0,1-X.r-X.d-X.h),oshi:N*X.r,dedicated:N*X.d,hardcore:N*X.h},I,{types:a.types||(idol?3:a.cat=='kpop'?2:1),hs:a.hsk!=null?!!a.hsk:idol,sp:a.sp||(idol?55:45),loy:a.loy||55,fat});a.cpb=M.buyers?M.copies/M.buyers:1.5;
 return M.copies+cdmPublic(N*.5,.55+(q-1)*.6,hype)}
indFansAfter=function(w,rows){const I=S.ind,G={};rows.forEach(x=>{const a=I.A[x.r.aid];if(!a||a.cat=='player')return;G[a.id]=(G[a.id]||0)+((x.cd/Math.max(1,a.cpb||1.5))*.06+x.st*.0004)*(x.r.q||1)});
 Object.values(I.A).forEach(a=>{if(a.cat=='player'||a.st=='disbanded')return;const sat=Math.max(.04,1-a.fans/RV_CEIL),g=(G[a.id]||0)*sat*(a.st=='hiatus'?.3:1);a.fans=Math.max(200,Math.round(a.fans*(1-(a.st=='hiatus'?.003:.0009))+g))});
 if(w%4==0){Object.values(I.A).forEach(indLife);try{rvMonth()}catch(e){console.error(e)}}
 const act=Object.values(I.A).filter(a=>a.cat!='player'&&a.st!='disbanded'&&a.st!='hiatus').length,p=Math.max(.08,Math.min(.8,.95-act/110));if(Math.random()<p)indDebut(indWs(w+1)+Math.floor(iR(0,7)))};
// OMG4ki: strong but not invincible — its momentum is no longer held up artificially
// the established acts: momentum from their own management quality (no age decline, no fixed bonus)
{const f=indLife;indLife=function(a){if(a&&RV_PROF[a.id]){const m=a.mom,st=a.st;f.apply(this,arguments);a.mom=Math.max(-15,Math.min(15,m*.85+iR(-3,3)+((a.q||.8)-.78)*2.5));if(a.id=='omg4ki')a.st='established';return}return f.apply(this,arguments)}}

// ---- rival development & news ------------------------------------------------------------------------------------------------------
function rvNews(o){try{return nwPublish({src:'game',cat:'industry',type:o.type,sent:o.sent||'neu',att:o.att||28,imp:o.imp||2,refs:{},img:o.img||{k:'edit',th:'industry'},alt:nwAlt(o.alt||'Industry','วงการเพลง'),en:o.en,th:o.th})}catch(e){}}
function rvAvgF(a,ex){const I=S.ind,L=(a.rel||[]).map(id=>I.R[id]).filter(r=>r&&r.k=='s'&&r.id!=ex).slice(-6);return L.length?L.reduce((s,r)=>s+r.F,0)/L.length:null}
function rvRelNews(a,R){if(R.k!='s')return;const av=rvAvgF(a,R.id);if(!av)return;const x=R.F/av,cs=R.cen!=null?a.mx[R.cen]:null,prev=(a.rel||[]).map(id=>S.ind.R[id]).filter(r=>r&&r.k=='s'&&r.id!=R.id).slice(-1)[0],nc=cs&&prev&&prev.cen!=null&&prev.cen!=R.cen;
 if(nc)rvNews({type:'rv_cen',att:30,alt:a.nm,en:{h:`${cs.nm} is the new Center of ${a.nm}`,s:`“${R.t}” changes the face of the group.`,b:`${a.nm} announced its new single “${R.t}” with ${cs.nm} as Center${prev.cen!=null&&a.mx[prev.cen]?`, taking over from ${a.mx[prev.cen].nm}`:''}.`},th:{h:`${cs.nm} คือเซ็นเตอร์คนใหม่ของ ${a.nm}`,s:`“${R.t}” เปลี่ยนหน้าตาของวง`,b:`${a.nm} ประกาศซิงเกิลใหม่ “${R.t}” โดยมี ${cs.nm} เป็นเซ็นเตอร์${prev.cen!=null&&a.mx[prev.cen]?` ต่อจาก ${a.mx[prev.cen].nm}`:''}`}});
 if(x>=1.3)rvNews({type:'rv_hit',sent:'pos',att:36,alt:a.nm,en:{h:`${a.nm}'s “${R.t}” is heading for a huge hit`,s:`Pre-orders point to about ${indFmt(R.F)} copies.`,b:`Industry insiders expect “${R.t}” to sell around ${indFmt(R.F)} copies — far above ${a.nm}'s recent average of ${indFmt(av)}.`},th:{h:`“${R.t}” ของ ${a.nm} ส่อแววฮิตถล่มทลาย`,s:`ยอดพรีออเดอร์ชี้ว่าอาจถึงราว ${indFmt(R.F)} แผ่น`,b:`คนในวงการคาดว่า “${R.t}” จะขายได้ราว ${indFmt(R.F)} แผ่น สูงกว่าค่าเฉลี่ยช่วงหลังของ ${a.nm} ที่ ${indFmt(av)} แผ่นอย่างมาก`}});
 else if(x<=.75)rvNews({type:'rv_flop',sent:'neg',att:30,alt:a.nm,en:{h:`Slow start for ${a.nm}'s “${R.t}”`,s:'The new single trails the group\'s usual numbers.',b:`“${R.t}” is expected to sell about ${indFmt(R.F)} copies, below ${a.nm}'s recent average of ${indFmt(av)}. Critics point at the song choice.`},th:{h:`“${R.t}” ของ ${a.nm} เปิดตัวช้ากว่าที่คาด`,s:'ซิงเกิลใหม่ทำยอดต่ำกว่าปกติของวง',b:`“${R.t}” คาดว่าจะขายได้ราว ${indFmt(R.F)} แผ่น ต่ำกว่าค่าเฉลี่ยช่วงหลังของ ${a.nm} ที่ ${indFmt(av)} แผ่น นักวิจารณ์มองว่าเป็นเพราะการเลือกเพลง`}})}
const RV_DEV=['omg4ki','winer4','sumer4','sefira'];
function rvMonth(){const I=S.ind,r=Math.random;
 Object.values(I.A).forEach(a=>{if(a.cat=='player'||a.st=='disbanded'||!a.mx||a.cat=='fsolo'||a.cat=='msolo')return;const big=RV_DEV.includes(a.id)||(a.st=='established'&&a.fans>80000);if(!big)return;const M=rvAct(a);
  // members' popularity moves with the group's results and their own skills
  M.forEach(s=>{s.off=Math.max(-30,Math.min(14,(s.off||0)+(r()-.5)*1.6+((s.vo+s.da+s.va)/300-.6)*.4))});
  // rising star
  if(r()<.12){const c=M.filter(s=>!s.star&&!s.legend);const s=c.sort((x,y)=>(y.vo+y.da+y.va)-(x.vo+x.da+x.va))[Math.floor(r()*Math.min(5,c.length))];if(s){s.off=Math.min(14,(s.off||0)+5+Math.round(r()*4));if(s.off>2&&!s.star){s.star=1;s.rise=S.day}
   if(RV_DEV.includes(a.id))rvNews({type:'rv_rise',sent:'pos',att:26,alt:a.nm,en:{h:`${s.nm} of ${a.nm} is the name everyone is talking about`,s:'A rising star in one of Japan\'s top groups.',b:`${s.nm} (${a.nm}) keeps winning new fans with her ${s.da>=s.vo&&s.da>=s.va?'dance':s.vo>=s.va?'vocals':'variety talk'}. Fans call her the group's next big star.`},th:{h:`${s.nm} แห่ง ${a.nm} ชื่อที่ใคร ๆ ก็พูดถึง`,s:'ดาวรุ่งในหนึ่งในวงท็อปของญี่ปุ่น',b:`${s.nm} (${a.nm}) ได้ใจแฟนใหม่ไม่หยุดด้วย${s.da>=s.vo&&s.da>=s.va?'การเต้น':s.vo>=s.va?'เสียงร้อง':'ความสนุกในรายการวาไรตี้'} แฟน ๆ ยกให้เธอเป็นดาวดวงต่อไปของวง`}})}}
  // graduation of a long-serving member (the established named members stay)
  if(!a.fixed5&&M.length>6&&r()<.09){const c=M.filter(s=>!RV_NAMED.has(s.nm)&&S.day-(s.jn||a.deb)>365*3);const s=c[Math.floor(r()*c.length)];if(s){s.st='grad';s.gd=S.day;a.mem=rvAct(a).map(x=>x.nm);a.mom=Math.max(-15,a.mom-(s.star?1.5:.4));
   if(RV_DEV.includes(a.id)||s.star)rvNews({type:'rv_grad',att:s.star?34:22,alt:a.nm,en:{h:`${s.nm} announces her graduation from ${a.nm}`,s:'A farewell concert is planned.',b:`${s.nm} will graduate from ${a.nm} after ${Math.max(1,Math.round((S.day-(s.jn||a.deb))/365))} years. ${s.star?'Fans of the group are shocked by the news.':'Her fans thanked her for every stage.'}`},th:{h:`${s.nm} ประกาศจบการศึกษาจาก ${a.nm}`,s:'มีแผนจัดคอนเสิร์ตอำลา',b:`${s.nm} จะจบการศึกษาจาก ${a.nm} หลังอยู่กับวงมา ${Math.max(1,Math.round((S.day-(s.jn||a.deb))/365))} ปี ${s.star?'แฟน ๆ ต่างตกใจกับข่าวนี้':'แฟน ๆ ขอบคุณเธอสำหรับทุกเวที'}`}})}}
  // new members (new generation) when the roster gets small
  const P=RV_PROF[a.id],want=P?P.size:Math.max(4,(a.mx||[]).length);if(!a.fixed5&&M.length<want-1&&r()<.35){const n=Math.min(want-M.length,1+Math.floor(r()*4)),g=Math.max(...a.mx.map(s=>s.gen||1))+1,rr=mulb(Math.floor(r()*1e9)),nw=[];for(let i=0;i<n;i++){const s=rvMem(a,{nm:rvName(a,rr),pos:'Member',gen:g,off:-24},rr,S.day);a.mx.push(s);nw.push(s.nm)}a.mem=rvAct(a).map(x=>x.nm);
   if(RV_DEV.includes(a.id))rvNews({type:'rv_new',sent:'pos',att:26,alt:a.nm,en:{h:`${a.nm} welcomes generation ${g}`,s:nw.join(', '),b:`${a.nm} introduced ${n} new member(s): ${nw.join(', ')}. They will join the group's next activities.`},th:{h:`${a.nm} ต้อนรับสมาชิกรุ่นที่ ${g}`,s:nw.join(', '),b:`${a.nm} เปิดตัวสมาชิกใหม่ ${n} คน: ${nw.join(', ')} ซึ่งจะร่วมกิจกรรมต่อไปของวง`}})}
  if(!RV_DEV.includes(a.id))return;
  // tours and controversies
  if(r()<.08){a.mom=Math.min(15,a.mom+1.2);a.fans=Math.round(a.fans*1.004);rvNews({type:'rv_tour',sent:'pos',att:28,alt:a.nm,en:{h:`${a.nm} sells out its ${['dome','arena','stadium'][Math.floor(r()*3)]} tour`,s:'Tickets were gone within hours.',b:`${a.nm}'s new tour sold out in record time, another sign of the group's strength on stage.`},th:{h:`${a.nm} ขายบัตรทัวร์หมดเกลี้ยง`,s:'บัตรหมดภายในไม่กี่ชั่วโมง',b:`ทัวร์ใหม่ของ ${a.nm} ขายหมดในเวลาทำลายสถิติ อีกหนึ่งสัญญาณของความแข็งแกร่งบนเวที`}})}
  else if(r()<.03){a.mom=Math.max(-15,a.mom-3);const s=M[Math.floor(r()*M.length)];rvNews({type:'rv_scandal',sent:'neg',att:34,alt:a.nm,en:{h:`Controversy around ${a.nm}`,s:`${s?s.nm:'A member'} apologises after a backstage clip spreads online.`,b:`A clip from backstage caused criticism online. ${a.nm}'s agency issued an apology; the group's next activities continue as planned.`},th:{h:`ดราม่ารอบ ${a.nm}`,s:`${s?s.nm:'สมาชิกคนหนึ่ง'} ขอโทษหลังคลิปหลังเวทีแพร่ในโลกออนไลน์`,b:`คลิปจากหลังเวทีถูกวิจารณ์ในโลกออนไลน์ ต้นสังกัดของ ${a.nm} ออกแถลงขอโทษ และกิจกรรมต่อไปของวงยังเดินหน้าตามแผน`}})}});
 // sister rivalry: who leads the year so far
 const y=indYr(S.day),yp=a=>(a.rel||[]).reduce((s,id)=>{const R=I.R[id];return s+((R&&R.yp&&R.yp[y])||0)},0),W=I.A.winer4,U=I.A.sumer4,O=I.A.omg4ki;
 if(W&&U){const lead=yp(W)>=yp(U)?W:U,k='rvsis'+y;I.rvL=I.rvL||{};if(I.rvL[k]&&I.rvL[k]!=lead.id){const o=lead.id==W.id?U:W;rvNews({type:'rv_sis',att:30,alt:'WINÉR4 · SUMÉR4',en:{h:`${lead.nm} overtakes ${o.nm} this year`,s:'The sister groups trade places on the year chart.',b:`${lead.nm} now leads ${o.nm} on this year's combined chart points. The two sister groups of OMG4ki keep pushing each other.`},th:{h:`${lead.nm} แซง ${o.nm} ในปีนี้`,s:'วงน้องสาวสลับอันดับกันบนชาร์ตประจำปี',b:`ตอนนี้ ${lead.nm} นำ ${o.nm} ในคะแนนชาร์ตรวมของปีนี้ วงน้องสาวทั้งสองของ OMG4ki ยังคงผลักดันกันและกันต่อไป`}})}I.rvL[k]=lead.id;
  if(O){const best=[W,U].sort((a,b)=>yp(b)-yp(a))[0],kk='rvomg'+y;if(yp(best)>yp(O)&&!I.rvL[kk]){I.rvL[kk]=1;rvNews({type:'rv_beat',sent:'pos',att:38,alt:best.nm,en:{h:`${best.nm} ahead of OMG4ki this year`,s:'A rare moment in the industry.',b:`For now, ${best.nm} has more chart points this year than its senior group OMG4ki — a rare sight in Japan's idol industry.`},th:{h:`${best.nm} นำหน้า OMG4ki ในปีนี้`,s:'ภาพที่หาได้ยากในวงการ',b:`ตอนนี้ ${best.nm} มีคะแนนชาร์ตปีนี้มากกว่ารุ่นพี่ OMG4ki ภาพที่หาได้ยากในวงการไอดอลญี่ปุ่น`}})}}}}

// ---- Industry Ranking ------------------------------------------------------------------------------------------------------------------
const RV_DIM=[['sales','CD sales','ยอดขาย CD',.16],['chart','Charts','ชาร์ต',.12],['fans','Fanbase','ฐานแฟน',.12],['loy','Fan loyalty','ความภักดีของแฟน',.08],['mem','Member popularity','ความนิยมของสมาชิก',.1],['qual','Music quality','คุณภาพเพลง',.1],['live','Live & theater','การแสดงสด',.08],['aw','Awards','รางวัล',.1],['media','Media & reputation','สื่อและชื่อเสียง',.07],['cons','Consistency','ความสม่ำเสมอ',.07]];
function rvPlayerLoy(gid){let d=0,n=0;(S.fb&&S.fb.segs||[]).forEach(s=>{const k=typeof fdSegGroupN=='function'?fdSegGroupN(s,gid):0;if(!k)return;n+=k;if(s.ft=='dedicated'||s.ft=='hardcore')d+=k;else if(s.ft=='oshi')d+=k*.45});return n?Math.min(100,30+100*d/n):40}
function rvAwards(id,gid){let n=0;try{const A=awS(),y0=indYr(S.day)-3;Object.values(A.years).filter(Y=>Y.y>=y0&&Y.win).forEach(Y=>Object.values(Y.win).forEach(w=>{if(gid!=null?w.gid==gid:(w.aid==id||w.id==id))n+=1}))}catch(e){}return n}
function rvRank(){const I=indS();if(!I)return[];try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>indPlayerArtist()))}catch(e){}
 const yr=S.day-365,L=Object.values(I.A).filter(a=>a.st!='disbanded'&&['fidol','midol','kpop','player'].includes(a.cat)&&(a.cat!='player'||(S.groups||[]).some(g=>'P'+g.id==a.id))).map(a=>{const R=(a.rel||[]).map(id=>I.R[id]).filter(r=>r&&r.day>=yr),gid=awPlayerGid(a),sales=R.reduce((s,r)=>s+(r.tot||0),0);
  const pk=Math.min(99,...R.map(r=>{const h=I.H[(r.k=='a'?'ca':'cs')+':'+r.id];return h?h.pk:99})),pts=R.reduce((s,r)=>s+Object.values(r.yp||{}).reduce((x,y)=>x+y,0),0);
  let fans=a.fans,mem=0,qual=50,live=50,media=50,loy=a.loy||50;
  if(gid!=null){try{fans=awGFans(gid);const M=S.members.filter(m=>m.group==gid&&isAct(m)).sort((x,y)=>y.pop-x.pop).slice(0,5);mem=M.length?avg(M.map(m=>m.pop)):0;loy=rvPlayerLoy(gid);
    gsWith(gid,()=>{const X=(S.singles||[]).filter(x=>(x.relDay??x.day)>=yr);qual=X.length?Math.min(100,avg(X.map(x=>(x.comp||1)*55))):40;const P=(thS().pf||[]).filter(p=>p.day>=yr);live=P.length?Math.min(100,avg(P.map(p=>p.sat||50))+Math.min(15,P.length/10)):35});
    try{const C=ccS().list.filter(C=>C.status=='done'&&C.done>=yr);if(C.length)live=Math.min(100,live+8)}catch(e){}
    try{const g=grp(gid);media=g&&g.rep!=null?g.rep:Math.min(100,40+awLog(fans)*6)}catch(e){}}catch(e){}}
  else{const M=rvAct(a).map(s=>indStarPop(a,s)).sort((x,y)=>y-x).slice(0,5);mem=M.length?avg(M):indPop(a);qual=R.length?Math.min(100,avg(R.map(r=>(r.q||1)*60))):45;live=Math.min(100,indPop(a)*.6+(a.q||.5)*40);media=Math.min(100,45+(a.mom||0)*2.5+indPop(a)*.3)}
  const F=R.filter(r=>r.k=='s').map(r=>r.tot||r.F||0),mu=F.length?avg(F):0,sd=F.length>1?Math.sqrt(avg(F.map(v=>(v-mu)*(v-mu)))):0,cons=F.length>1?Math.max(0,100-100*sd/Math.max(1,mu)):F.length?55:20;
  return{a,gid,nm:awArtistName(a),raw:{sales,chart:Math.sqrt(pts)+(pk<99?(21-pk)*30:0),fans,loy,mem,qual,live,aw:rvAwards(a.id,gid),media,cons},pk,pts}});
 const mx={};RV_DIM.forEach(([k])=>mx[k]=Math.max(1e-9,...L.map(x=>x.raw[k])));
 L.forEach(x=>{x.d={};RV_DIM.forEach(([k])=>{const v=x.raw[k],m=mx[k];x.d[k]=Math.round(k=='sales'||k=='fans'||k=='chart'?100*Math.sqrt(Math.max(0,v)/m):k=='aw'?100*v/m:Math.max(0,Math.min(100,v)))});x.tot=Math.round(RV_DIM.reduce((s,[k,,,w])=>s+x.d[k]*w,0)*10)/10});
 L.sort((a,b)=>b.tot-a.tot);try{const me=L.findIndex(x=>x.gid!=null),H=I.rkH=I.rkH||{};if(me==0&&!H.n1){H.n1=S.day;rvNews({type:'rv_no1',sent:'pos',att:60,imp:5,alt:L[0].nm,en:{h:`${L[0].nm} is now Japan's No.1 idol group`,s:'The industry ranking has a new leader.',b:`After years of work, ${L[0].nm} has overtaken OMG4ki at the top of the industry ranking — sales, fans, music, live shows and awards together.`},th:{h:`${L[0].nm} ขึ้นเป็นวงไอดอลอันดับ 1 ของญี่ปุ่น`,s:'อันดับวงการมีผู้นำคนใหม่',b:`หลังจากทำงานหนักมาหลายปี ${L[0].nm} แซง OMG4ki ขึ้นสู่อันดับหนึ่งของวงการ ทั้งยอดขาย แฟน เพลง การแสดงสด และรางวัล`}})}}catch(e){}return L}
function rvRankHtml(){const L=rvRank(),th=typeof UIP!='undefined'&&UIP.lang=='th',om=L.find(x=>x.a.id=='omg4ki'),mine=L.filter(x=>x.gid!=null);
 const beat=me=>om?RV_DIM.filter(([k])=>me.d[k]>om.d[k]).map(([k,en,t])=>th?t:en):[];
 const bar=v=>`<span class="rvbar"><i style="width:${v}%"></i></span>`;
 return`<div class="indbd"><h3>${th?'อันดับวงการไอดอล':'Industry Ranking'} <small class="st">${th?'12 เดือนล่าสุด · หลายมิติรวมกัน':'last 12 months · many dimensions together'}</small></h3>
 <p class="st">${th?'การเป็นอันดับ 1 ต้องแข็งแกร่งหลายด้านพร้อมกัน ไม่ใช่แค่ด้านเดียว':'Being No.1 needs strength in several areas at once — one metric is not enough.'}</p>
 ${mine.map(me=>{const b=beat(me),pos=L.indexOf(me)+1;return`<div class="c rvme"><b>${esc(me.nm)}</b> · #${pos} ${th?'โดยรวม':'overall'} (${me.tot})${om?` · OMG4ki #${L.indexOf(om)+1} (${om.tot})`:''}<p class="st">${b.length?`${th?'แซง OMG4ki ใน':'Ahead of OMG4ki in'}: ${b.join(', ')}`:(th?'ยังไม่แซง OMG4ki ในด้านใด':'Not yet ahead of OMG4ki in any dimension')}</p></div>`}).join('')}
 <div class="wrap"><table class="thmft rvrk"><tr><th>#</th><th>${th?'ศิลปิน':'Artist'}</th><th>${th?'รวม':'Total'}</th>${RV_DIM.map(([k,en,t])=>`<th>${th?t:en}</th>`).join('')}</tr>
 ${L.slice(0,20).map((x,i)=>`<tr class="${x.gid!=null?'pl':''} ${x.a.id=='omg4ki'?'boss':''}"><td>${i+1}</td><td><b>${esc(x.nm)}</b>${x.a.id=='omg4ki'?' 👑':''}</td><td><b>${x.tot}</b></td>${RV_DIM.map(([k])=>`<td>${x.d[k]}${bar(x.d[k])}</td>`).join('')}</tr>`).join('')}</table></div></div>`}
{const f=V.charts;V.charts=function(){if(ui.cht=='rk'){const h=f.call(this,...arguments);ui.cht='rk';const tabs=(h.match(/<div class="row">[\s\S]*?<\/div>/)||[''])[0].replace(/ on"/g,'"');return`<h2 class="ht">Charts &amp; Sales</h2>${tabs.replace(/<\/div>$/,`<button class="b s on" onclick="ui.cht='rk';render()">Industry Ranking</button></div>`)}${rvRankHtml()}`}
 const h=f.apply(this,arguments);return h.replace(/(<div class="row">[\s\S]*?)(<\/div>)/,`$1<button class="b s" onclick="ui.cht='rk';render()">Industry Ranking</button>$2`)}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S&&S.ind){S.ind.rv3v=0;indS()}}catch(e){console.error(e)}return r}}
