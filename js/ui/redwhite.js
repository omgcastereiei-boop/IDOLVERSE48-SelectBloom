// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Red & White Grand Music Festival (31 December)
// -------------------------------------------------------------------------------------
//  · Year-end TV music festival. Female acts are the Red team, male acts the White team; a mixed
//    band always follows its (fixed) lead vocal — see indTeam() in industry2.js.
//  · 25 November: the line-up is announced from the year's real results (fans, chart points of
//    the year, best chart position, momentum) with room for rookies, soloists, bands and K-pop.
//    OMG4ki, WINÉR4, SUMÉR4 and Sefira are likely but never guaranteed.
//  · The player's best group of the year may be invited. Accept or decline until 20 December
//    (no answer = declined). Accepting books the 31 December in the schedule of the chosen members.
//  · Preparation: one released song (a second one for a medley), the members who perform
//    (members who are busy that day or below 30 energy cannot), the Center, the costume (the song's
//    own costumes or one library design) and the style: Standard, Special Arrangement or Medley.
//  · 31 December: every act performs in the running order, the judges and the audience vote, and
//    the team with more points wins. The result comes from the acts' performance scores, so it is
//    usually close but never fixed.
//  · Effects use existing systems only: performer popularity (gainPop), fans through the fanbase,
//    the song's chart interest, energy cost, news. History of every year is kept in S.rw.years.
// =====================================================================================
const RW_NAME='Red & White Grand Music Festival';
const RW_LINE=[10,25],RW_DL=[11,20],RW_DAY=[11,31],RW_N=12;
const RW_STY={std:['Standard','The song as fans know it.',0,0],arr:['Special Arrangement','A new arrangement for the night — more impressive, a little riskier.',4,5],med:['Medley','Two songs in one performance — big impact, more tiring.',3,8]};
function rwS(){if(!S)return null;if(!S.rw||typeof S.rw!='object')S.rw={v:1,years:{}};S.rw.years=S.rw.years||{};return S.rw}
const rwDay=y=>awDayOf(y,RW_DAY);
// ---- line-up -------------------------------------------------------------------------------------------------------------------
function rwScore(a,y,end){const R=awRel(y,end).filter(r=>r.aid==a.id),pts=R.reduce((s,r)=>s+(r.yp[y]||0),0),pk=Math.min(99,...R.map(awPk)),gid=awPlayerGid(a),fans=gid!=null?awGFans(gid):a.fans;
 return{pts,pk,fans,sc:awLog(fans)*14+Math.sqrt(pts)*.1+(pk<99?(21-pk)*.9:0)+(a.mom||0)*.8+(gid!=null?0:indPop(a)*.15)+(R.length?0:-12)}}
function rwKind(a){const gid=awPlayerGid(a);if(gid!=null)return'idol';if(a.cat=='band')return'band';if(a.cat=='kpop')return'kpop';if(a.cat=='fsolo'||a.cat=='msolo')return'solo';return'idol'}
function rwLineup(y){const Y=rwS().years[y]=rwS().years[y]||{y};if(Y.line)return Y;const end=awDayOf(y,RW_LINE),I=S.ind;try{(S.groups||[]).forEach(g=>gsWith(g.id,()=>indPlayerArtist()))}catch(e){}
 const C=Object.values(I.A).filter(a=>a.st!='disbanded'&&a.st!='hiatus'&&(a.cat!='player'||(S.groups||[]).some(g=>!g.dis&&'P'+g.id==a.id))).map(a=>{const s=rwScore(a,y,end);return{a,...s,fin:s.sc*awNoise('rw'+y+a.id),team:a.cat=='player'?'red':indTeam(a),kind:rwKind(a),rookie:awDeb(a)>end-400}});
 Y.line={red:[],white:[]};Y.lineDay=S.day;let inv=null;
 ['red','white'].forEach(t=>{const L=C.filter(c=>c.team==t).sort((a,b)=>b.fin-a.fin),pick=[];const add=c=>{if(c&&!pick.includes(c)&&pick.length<RW_N)pick.push(c)};
  L.filter(c=>c.a.cat!='player').slice(0,RW_N-3).forEach(add);['rookie','solo','band','kpop'].forEach(k=>add(L.find(c=>!pick.includes(c)&&c.a.cat!='player'&&(k=='rookie'?c.rookie:c.kind==k))));L.filter(c=>c.a.cat!='player').forEach(add);
  // the player's best group is invited when its year is as good as the line-up's
  if(t=='red'){const P=L.filter(c=>c.a.cat=='player').sort((a,b)=>b.fin-a.fin)[0],cut=pick.length?pick.slice().sort((a,b)=>b.fin-a.fin)[Math.min(pick.length-1,RW_N-2)].fin:0;if(P&&P.fin>=cut*.92&&P.pts>0){if(pick.length>=RW_N)pick.pop();pick.push(P);inv={gid:awPlayerGid(P.a),st:'pending',day:S.day,dl:awDayOf(y,RW_DL)}}}
  Y.line[t]=pick.map(c=>({id:c.a.id,nm:awArtistName(c.a),kind:c.kind,rookie:c.rookie?1:0,sc:+c.sc.toFixed(2),fans:c.fans,pts:c.pts,pk:c.pk<99?c.pk:null,gid:awPlayerGid(c.a)}))});
 Y.inv=inv;if(inv)Y.prep={song:null,song2:null,sty:'std',mem:[],cen:null,cz:'song'};rwLineNews(Y);return Y}
// ---- invitation --------------------------------------------------------------------------------------------------------------
function rwCur(){const ys=Object.keys(rwS().years).map(Number).sort((a,b)=>b-a);return ys.length?rwS().years[ys[0]]:null}
function rwAnswer(ok){const Y=rwCur();if(!Y||!Y.inv||Y.inv.st!='pending')return;Y.inv.st=ok?'accepted':'declined';Y.inv.ans=S.day;const g=grp(Y.inv.gid);
 if(!ok){Y.line.red=Y.line.red.filter(x=>x.gid!=Y.inv.gid);rwNews({type:'rw_decl',sent:'neu',att:30,refs:{gid:Y.inv.gid},en:{h:`${g.name} turns down the ${RW_NAME}`,s:'The group will not appear this year.',b:`${g.name} has declined its invitation to the ${RW_NAME} ${Y.y}.`},th:{h:`${g.name} ปฏิเสธคำเชิญ ${RW_NAME}`,s:'ปีนี้วงจะไม่ขึ้นแสดง',b:`${g.name} ปฏิเสธคำเชิญเข้าร่วม ${RW_NAME} ${Y.y}`}})}
 else{rwAutoPrep(Y);rwBook(Y);rwNews({type:'rw_acc',att:45,imp:4,refs:{gid:Y.inv.gid},fx:{gatt:[[Y.inv.gid,8]],grep:[[Y.inv.gid,2]]},en:{h:`${g.name} will perform at the ${RW_NAME}!`,s:'A big stage to close the year.',b:`${g.name} accepted its invitation to the ${RW_NAME} ${Y.y} and joins the Red team on ${longDate(rwDay(Y.y))}.`},th:{h:`${g.name} จะขึ้นแสดงใน ${RW_NAME}!`,s:'เวทีใหญ่ส่งท้ายปี',b:`${g.name} ตอบรับคำเชิญ ${RW_NAME} ${Y.y} และจะร่วมทีมแดงในวันที่ ${longDate(rwDay(Y.y))}`}})}render()}
// songs of the invited group that were released (or debuted on the Theater stage)
function rwSongs(gid){const SG=gsCtx(gid,'songs')||{};return Object.values(SG).filter(o=>o&&(o.rel||o.relDay!=null)).sort((a,b)=>(b.pref&&b.pref.s||0)-(a.pref&&a.pref.s||0)||(b.relDay||0)-(a.relDay||0))}
function rwSong(gid,id){return id?(gsCtx(gid,'songs')||{})[id]||null:null}
function rwFree(Y,m){const d=rwDay(Y.y),ev=Y.inv&&Y.inv.ev;let b=[];try{b=gsWith(Y.inv.gid,()=>busy(m.id,[d],ev))}catch(e){}return{ok:!b.length&&(m.en|0)>=30&&isAct(m),why:b.length?`busy: ${b[0].title||b[0].type}`:(m.en|0)<30?`energy ${m.en|0}`:''}}
function rwAutoPrep(Y){const P=Y.prep,gid=Y.inv.gid;if(!P.song){const L=rwSongs(gid);P.song=L[0]?L[0].id:null}const o=rwSong(gid,P.song),M=gsMem(gid).filter(m=>rwFree(Y,m).ok);
 if(!P.mem.length){const orig=(o&&o.fm&&o.fm.sl||[]).map(z=>z.m).filter(id=>M.some(m=>m.id==id));P.mem=(orig.length>=3?orig:M.slice().sort((a,b)=>b.pop-a.pop).slice(0,16).map(m=>m.id)).slice(0,16)}
 if(P.cen==null||!P.mem.includes(P.cen)){const c=o&&o.fm&&(o.fm.sl||[]).find(z=>z.c&&P.mem.includes(z.m));P.cen=c?c.m:P.mem.map(get).filter(Boolean).sort((a,b)=>b.pop-a.pop).map(m=>m.id)[0]??null}}
function rwBook(Y){const gid=Y.inv.gid,d=rwDay(Y.y);try{gsWith(gid,()=>{S.cal=S.cal||[];let e=S.cal.find(x=>x.id==Y.inv.ev);if(!e){e={id:'rw'+Y.y+'_'+gid,type:'rw',day:d,title:`🎤 ${RW_NAME} ${Y.y}`,members:[],done:false};S.cal.push(e);Y.inv.ev=e.id}e.members=Y.prep.mem.slice()})}catch(e){console.error(e)}}
function rwSet(k,v){const Y=rwCur();if(!Y||!Y.inv||Y.res||Y.inv.st=='declined')return;const P=Y.prep;if(k=='song'||k=='song2'){P[k]=v||null;if(k=='song'){P.mem=[];P.cen=null;rwAutoPrep(Y)}}else if(k=='sty')P.sty=v;else if(k=='cz')P.cz=v;else if(k=='cen')P.cen=+v;
 if(Y.inv.st=='accepted')rwBook(Y);render()}
function rwTog(id){const Y=rwCur();if(!Y||!Y.inv||Y.res)return;const P=Y.prep,i=P.mem.indexOf(id);if(i>=0){P.mem.splice(i,1);if(P.cen==id)P.cen=P.mem[0]??null}else{const m=get(id);if(!m||!rwFree(Y,m).ok)return;P.mem.push(id);if(P.cen==null)P.cen=id}if(Y.inv.st=='accepted')rwBook(Y);render()}
function rwCzOf(Y,mid){const P=Y.prep;if(P.cz&&P.cz!='song'){const d=czD(P.cz);if(d)return d.p}const o=rwSong(Y.inv.gid,P.song);try{return gsWith(Y.inv.gid,()=>czFor(o,mid))||null}catch(e){return null}}
// ---- the festival ---------------------------------------------------------------------------------------------------------------
function rwPlayerAct(Y){const P=Y.prep,gid=Y.inv.gid,M=P.mem.map(get).filter(m=>m&&rwFree(Y,m).ok),o=rwSong(gid,P.song);if(!M.length||!o)return null;const st=RW_STY[P.sty]||RW_STY.std,c=get(P.cen)||M[0];
 const skill=avg(M.map(m=>((m.sing|0)+(m.dance|0))/2)),pop=avg(M.map(m=>m.pop|0)),en=avg(M.map(m=>m.en|0)),song=o.pref&&o.pref.s||55;
 let sc=skill*.34+pop*.3+song*.16+(c.pop|0)*.08+Math.min(8,M.length*.5)+st[2];sc*=(.85+.15*Math.min(1,en/80));if(P.sty=='arr')sc*=awNoise('rwarr'+Y.y+gid)>.95?1:.96+.08*awJ('rwa'+Y.y);
 if(P.sty=='med'&&!rwSong(gid,P.song2))sc-=st[2];return{sc:Math.max(20,Math.min(100,sc)),M,o,c}}
function rwRun(y){const Y=rwS().years[y];if(!Y||!Y.line||Y.res)return;const I=S.ind,acts=[];if(Y.inv&&Y.inv.st=='pending'){Y.inv.st='declined';Y.line.red=Y.line.red.filter(x=>x.gid!=Y.inv.gid)}
 ['red','white'].forEach(t=>Y.line[t].forEach(x=>{if(x.gid!=null){if(!(Y.inv&&Y.inv.st=='accepted'&&Y.inv.gid==x.gid))return;rwAutoPrep(Y);const p=rwPlayerAct(Y);if(!p)return;acts.push({t,id:x.id,nm:x.nm,gid:x.gid,sc:+(p.sc*awNoise('rwp'+y)).toFixed(1),song:p.o.title,song2:Y.prep.sty=='med'?(rwSong(x.gid,Y.prep.song2)||{}).title||null:null,mem:p.M.map(m=>m.id),cen:p.c.id,sty:Y.prep.sty});return}
  const a=I.A[x.id];if(!a)return;const R=Object.values(I.R).filter(r=>r.aid==a.id).sort((p,q)=>(q.yp[y]||0)-(p.yp[y]||0)||q.day-p.day)[0];acts.push({t,id:a.id,nm:a.nm,kind:x.kind,sc:+Math.max(20,Math.min(99,(indPop(a)*.55+awLog(a.fans)*7+(a.mom||0)*.6)*awNoise('rwa'+y+a.id))).toFixed(1),song:R?R.t:''})}));
 // running order: teams alternate, the strongest acts close the show (the last act is the "tori")
 const ord=[],Rd=acts.filter(a=>a.t=='red').sort((a,b)=>a.sc-b.sc),Wt=acts.filter(a=>a.t=='white').sort((a,b)=>a.sc-b.sc);while(Rd.length||Wt.length){if(Rd.length)ord.push(Rd.shift());if(Wt.length)ord.push(Wt.shift())}
 const tm=t=>{const L=acts.filter(a=>a.t==t);return L.length?avg(L.map(a=>a.sc))+Math.min(3,L.length*.15):0},R=tm('red'),W=tm('white'),sh=R+W?R/(R+W):.5;
 // 3 judges' panels (11 votes), audience (2 points) and the hall (2 points) — close but data-based
 const dif=(sh-.5)*2.5;let jr=0;for(let i=0;i<11;i++)if(.5+dif+(awJ('rwj'+y+i)-.5)*.9>.5)jr++;const aud=Math.round(3200000+awJ('rwv'+y)*900000),ar=Math.round(aud*Math.max(.38,Math.min(.62,.5+dif*.18+(awJ('rwav'+y)-.5)*.1))),hall=Math.round(3000*Math.max(.35,Math.min(.65,.5+dif*.2+(awJ('rwh'+y)-.5)*.14)));
 const pts={red:jr+(ar*2>aud?2:0)+(hall*2>3000?2:0),white:(11-jr)+(ar*2<aud?2:0)+(hall*2<3000?2:0)};if(pts.red==pts.white)pts[R>=W?'red':'white']+=1;
 Y.res={acts:ord,R:+R.toFixed(2),W:+W.toFixed(2),jr,jw:11-jr,aud,ar,aw:aud-ar,hall,hr:hall*2>3000,pts,win:pts.red>pts.white?'red':'white',day:S.day};rwEffects(Y);rwResNews(Y)}
function rwEffects(Y){const I=S.ind,me=Y.res.acts.find(a=>a.gid!=null);
 Y.res.acts.filter(a=>a.gid==null).forEach(a=>{const x=I.A[a.id];if(x){x.fans=Math.round(x.fans*(1.01+a.sc/5000));x.mom=Math.min(15,(x.mom||0)+.8)}});
 if(me){const win=Y.res.win=='red',d=me.sc>=75?3:me.sc>=60?2:1.2;const en=15+(RW_STY[me.sty]||RW_STY.std)[3];me.mem.forEach(id=>{const m=get(id);if(!m)return;gainPop(m,d+(id==me.cen?1:0));m.en=Math.max(-100,(m.en|0)-en);hev(m,{t:'rw',yr:Y.y,song:me.song,cen:id==me.cen?1:0,win:win?1:0})});
  const n=Math.round(Math.min(90000,4000+(S.fans|0)*.01*(me.sc/60)));try{gsWith(me.gid,()=>fbAcquire(n,{via:'group',org:`${RW_NAME} ${Y.y}`}))}catch(e){}Y.res.fans=n;
  try{gsWith(me.gid,()=>{const e=(S.cal||[]).find(x=>x.id==Y.inv.ev);if(e){e.done=true;e.result={sc:me.sc}}})}catch(e){}
  // the song gets more chart interest
  Object.values(I.R).filter(r=>r.aid=='P'+me.gid&&r.act&&r.t==me.song).forEach(r=>r.hit=+Math.min(2.6,(r.hit||1)*1.2).toFixed(3))}}
// ---- news -----------------------------------------------------------------------------------------------------------------------
function rwNews(o){return awNews({...o,altEn:RW_NAME,altTh:'งานเพลงส่งท้ายปี'})}
function rwLineNews(Y){const L=[...Y.line.red,...Y.line.white],rk=L.filter(x=>x.rookie).map(x=>x.nm),om=L.some(x=>x.id=='omg4ki');
 rwNews({type:'rw_line',att:50,imp:4,en:{h:`${RW_NAME} ${Y.y}: line-up announced`,s:`${Y.line.red.length} Red and ${Y.line.white.length} White acts.`,b:`The ${RW_NAME} ${Y.y} line-up is out. Red team: ${Y.line.red.map(x=>x.nm).join(', ')}. White team: ${Y.line.white.map(x=>x.nm).join(', ')}.${rk.length?` First-time rookies: ${rk.join(', ')}.`:''}`},th:{h:`${RW_NAME} ${Y.y} ประกาศรายชื่อศิลปินแล้ว`,s:`ทีมแดง ${Y.line.red.length} ทีมขาว ${Y.line.white.length} ศิลปิน`,b:`ประกาศรายชื่อศิลปิน ${RW_NAME} ${Y.y} แล้ว ทีมแดง: ${Y.line.red.map(x=>x.nm).join(', ')} ทีมขาว: ${Y.line.white.map(x=>x.nm).join(', ')}${rk.length?` หน้าใหม่: ${rk.join(', ')}`:''}`}});
 if(!om&&S.ind.A.omg4ki)rwNews({type:'rw_omg_out',sent:'neu',att:44,en:{h:`Shock: OMG4ki not in the ${RW_NAME} line-up`,s:'The No.1 group misses the year-end stage.',b:`For the first time in years OMG4ki is missing from the ${RW_NAME} line-up, a sign of how competitive ${Y.y} was.`},th:{h:`ช็อก! OMG4ki ไม่มีชื่อใน ${RW_NAME}`,s:'วงอันดับ 1 พลาดเวทีส่งท้ายปี',b:`ครั้งแรกในรอบหลายปีที่ OMG4ki ไม่มีชื่อใน ${RW_NAME} สะท้อนว่าปี ${Y.y} มีการแข่งขันสูงแค่ไหน`}});
 if(Y.inv){const g=grp(Y.inv.gid);rwNews({type:'rw_inv',cat:'company',att:46,imp:4,refs:{gid:g.id},en:{h:`${g.name} invited to the ${RW_NAME}`,s:`Reply by ${longDate(Y.inv.dl)}.`,b:`${g.name} has been invited to perform for the Red team at the ${RW_NAME} ${Y.y}. The agency must answer by ${longDate(Y.inv.dl)}.`},th:{h:`${g.name} ได้รับเชิญขึ้นเวที ${RW_NAME}`,s:`ตอบรับภายใน ${longDate(Y.inv.dl)}`,b:`${g.name} ได้รับเชิญให้แสดงในทีมแดงที่ ${RW_NAME} ${Y.y} ต้นสังกัดต้องตอบกลับภายใน ${longDate(Y.inv.dl)}`}})}}
function rwResNews(Y){const R=Y.res,wn=R.win=='red'?'Red':'White',wt=R.win=='red'?'แดง':'ขาว',me=R.acts.find(a=>a.gid!=null),tori=R.acts[R.acts.length-1];
 rwNews({type:'rw_res',att:55,imp:4,en:{h:`${wn} team wins the ${RW_NAME} ${Y.y}`,s:`${R.pts.red} – ${R.pts.white}`,b:`The ${wn} team won the ${RW_NAME} ${Y.y} by ${R.pts.red} to ${R.pts.white} points. The judges voted ${R.jr}–${R.jw}, the TV audience ${indFmt(R.ar)} to ${indFmt(R.aw)}.${tori?` ${tori.nm} closed the show${tori.song?` with “${tori.song}”`:''}.`:''}`},th:{h:`ทีม${wt}ชนะ ${RW_NAME} ${Y.y}`,s:`${R.pts.red} – ${R.pts.white}`,b:`ทีม${wt}ชนะ ${RW_NAME} ${Y.y} ด้วยคะแนน ${R.pts.red} ต่อ ${R.pts.white} กรรมการโหวต ${R.jr}–${R.jw} ผู้ชมทางบ้าน ${indFmt(R.ar)} ต่อ ${indFmt(R.aw)}${tori?` ${tori.nm} ปิดท้ายรายการ${tori.song?`ด้วยเพลง “${tori.song}”`:''}`:''}`}});
 if(me){const g=grp(me.gid),c=get(me.cen),good=me.sc>=60;rwNews({type:'rw_me',cat:'company',sent:good?'pos':'neu',att:good?50:32,imp:good?4:2,refs:{gid:me.gid,mids:c?[c.id]:[]},img:c?nwMemImg(c.id):undefined,fx:good?{gatt:[[me.gid,10]],grep:[[me.gid,3]],...(c?{pop:[[c.id,1]]}:{})}:null,
  en:{h:good?`${g.name}'s “${me.song}” lights up the ${RW_NAME}`:`${g.name} performs “${me.song}” at the ${RW_NAME}`,s:c?`Center: ${c.name}`:'',b:`${g.name} performed “${me.song}”${me.song2?` and “${me.song2}”`:''} (${RW_STY[me.sty][0]}) for the Red team${c?` with ${c.name} at the Center`:''}. ${good?'Viewers called it one of the highlights of the night.':'A solid stage to close the year.'}`},
  th:{h:good?`“${me.song}” ของ ${g.name} สะกดผู้ชม ${RW_NAME}`:`${g.name} แสดงเพลง “${me.song}” ที่ ${RW_NAME}`,s:c?`เซ็นเตอร์: ${c.name}`:'',b:`${g.name} แสดงเพลง “${me.song}”${me.song2?` และ “${me.song2}”`:''} (${RW_STY[me.sty][0]}) ให้ทีมแดง${c?` โดยมี ${c.name} เป็นเซ็นเตอร์`:''} ${good?'ผู้ชมยกให้เป็นหนึ่งในไฮไลต์ของคืนนี้':'เป็นเวทีส่งท้ายปีที่น่าประทับใจ'}`}})}}
// ---- timeline -----------------------------------------------------------------------------------------------------------------------
function rwTick(){if(!S||!S.ind)return;const y=awY(S.day),[mo,d]=awMD(S.day),Y=rwS().years[y];
 if((mo==10&&d>=RW_LINE[1]||mo==11)&&!(Y&&Y.line))rwLineup(y);const Z=rwS().years[y];if(!Z)return;
 if(Z.inv&&Z.inv.st=='pending'&&S.day>Z.inv.dl){Z.inv.st='declined';Z.line.red=Z.line.red.filter(x=>x.gid!=Z.inv.gid);try{toast(`No answer was sent: the ${RW_NAME} invitation expired.`)}catch(e){}}
 if(Z.line&&!Z.res&&S.day>=rwDay(y)){rwRun(y);try{toast(`${RW_NAME} ${y}: ${Z.res.win=='red'?'Red':'White'} team wins! Open the festival page to watch.`)}catch(e){}}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&!(typeof GS_SCOPED!='undefined'&&GS_SCOPED))rwTick()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S)rwS()}catch(e){}return r}}
// ---- page --------------------------------------------------------------------------------------------------------------------------
function rwActLine(x){return`<li class="${x.gid!=null?'pl':''}"><b>${esc(x.nm)}</b> <small class="st">${{idol:'Idol',band:'Band',kpop:'K-pop',solo:'Solo'}[x.kind]||''}${x.rookie?' · Rookie':''}${x.pk?` · best #${x.pk}`:''}</small></li>`}
V.rwfest=function(){const A=rwS(),ys=Object.keys(A.years).map(Number).sort((a,b)=>b-a),sel=ui.rwy&&A.years[ui.rwy]?ui.rwy:ys[0],Y=sel?A.years[sel]:null,y=awY(S.day);
 const head=`<div class="c rwhead"><h2 class="ht">🎤 ${RW_NAME}</h2><p class="st">31 December · Red team (female acts) vs White team (male acts). Line-up announced on ${longDate(awDayOf(y,RW_LINE))}.</p>${ys.length>1?`<div class="row">${ys.map(v=>`<button class="b s ${v==sel?'p':''}" onclick="ui.rwy=${v};render()">${v}</button>`).join('')}</div>`:''}</div>`;
 if(!Y)return head+`<div class="c">${emptyBox(`The line-up of ${y} is announced on ${longDate(awDayOf(y,RW_LINE))}.`,'🎤')}</div>`;
 const line=`<div class="rwteams"><div class="c rwred"><h3>🔴 Red team</h3><ol>${Y.line.red.map(rwActLine).join('')}</ol></div><div class="c rwwhite"><h3>⚪ White team</h3><ol>${Y.line.white.map(rwActLine).join('')}</ol></div></div>`;
 let inv='';if(Y.inv){const g=grp(Y.inv.gid)||{name:''},I=Y.inv,P=Y.prep;
  if(I.st=='pending')inv=`<div class="c rwinv"><h3>✉️ Invitation · ${esc(g.name)}</h3><p>${esc(g.name)} is invited to perform for the Red team on ${longDate(rwDay(Y.y))}. Answer by ${longDate(I.dl)}.</p><div class="row"><button class="b p" onclick="rwAnswer(1)">Accept</button><button class="b s" onclick="rwAnswer(0)">Decline</button></div></div>`;
  else if(I.st=='declined')inv=`<div class="c"><p class="st">${esc(g.name)} declined the invitation this year.</p></div>`;
  if(I.st!='declined'&&!Y.res){const S1=rwSongs(I.gid),M=gsMem(I.gid).filter(m=>isAct(m)),o=rwSong(I.gid,P.song),lib=czLib().ds.filter(d=>d.p);
   inv+=`<div class="c rwprep"><h3>Preparation${I.st=='pending'?' (after accepting)':''}</h3>
   <div class="row"><label class="st">Song <select onchange="rwSet('song',this.value)"><option value="">Choose…</option>${S1.map(s=>`<option value="${s.id}" ${P.song==s.id?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label>
   <label class="st">Style <select onchange="rwSet('sty',this.value)">${Object.entries(RW_STY).map(([k,v])=>`<option value="${k}" ${P.sty==k?'selected':''}>${v[0]}</option>`).join('')}</select></label>
   ${P.sty=='med'?`<label class="st">Second song <select onchange="rwSet('song2',this.value)"><option value="">Choose…</option>${S1.filter(s=>s.id!=P.song).map(s=>`<option value="${s.id}" ${P.song2==s.id?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label>`:''}
   <label class="st">Costume <select onchange="rwSet('cz',this.value)"><option value="song" ${P.cz=='song'?'selected':''}>The song's costumes</option>${lib.map(d=>`<option value="${d.id}" ${P.cz==d.id?'selected':''}>${esc(d.name)}</option>`).join('')}</select></label>
   <label class="st">Center <select onchange="rwSet('cen',this.value)">${P.mem.map(get).filter(Boolean).map(m=>`<option value="${m.id}" ${P.cen==m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label></div>
   <p class="st">${esc(RW_STY[P.sty][1])} Energy cost ${15+RW_STY[P.sty][3]} per member.</p>
   ${o&&P.mem.length?`<div class="rwstage">${thStageSvg('rw'+Y.y,[P.cen,...P.mem.filter(id=>id!=P.cen)].filter(id=>get(id)),rwRows(P.mem.length),1,id=>rwCzOf(Y,id),()=>null,1,330)}</div>`:''}
   <h4>Members · ${P.mem.length} selected</h4><div class="awatt">${M.map(m=>{const on=P.mem.includes(m.id),f=rwFree(Y,m);return`<button class="c awa ${on?'on':''} ${f.ok?'':'off'}" onclick="rwTog(${m.id})" ${!on&&!f.ok?'disabled':''}>${ptc(m,44)}<b>${esc(m.name)}</b><small>${on?(P.cen==m.id?'★ Center':'✔'):f.ok?`⚡${m.en|0}`:esc(f.why)}</small></button>`}).join('')}</div></div>`}}
 let res='';if(Y.res){const R=Y.res;res=`<div class="c rwres"><h3>Result · ${longDate(R.day)}</h3><div class="rwscore"><span class="rwr">🔴 ${R.pts.red}</span><b>${R.win=='red'?'Red':'White'} team wins</b><span class="rww">${R.pts.white} ⚪</span></div><p class="st">Judges ${R.jr} – ${R.jw} · TV audience ${indFmt(R.ar)} – ${indFmt(R.aw)} · Hall ${R.hr?'Red':'White'}</p><div class="row"><button class="b p" onclick="rwShowOpen(${Y.y})">▶ Watch the festival</button></div>
  <h4>Running order</h4><ol class="rword">${R.acts.map(a=>`<li class="${a.t} ${a.gid!=null?'pl':''}">${a.t=='red'?'🔴':'⚪'} <b>${esc(a.nm)}</b>${a.song?` — “${esc(a.song)}”${a.song2?` + “${esc(a.song2)}”`:''}`:''} <small class="st">${a.sc}</small></li>`).join('')}</ol></div>`}
 return head+res+inv+line};
const rwRows=n=>n<=7?[n]:n<=14?[Math.ceil(n/2),Math.floor(n/2)]:[Math.ceil(n/3),Math.ceil(n/3),n-2*Math.ceil(n/3)];
// ---- big-screen show ----------------------------------------------------------------------------------------------------------
function rwShowSteps(Y){const A=Y.res.acts,St=[{k:'open'}],me=A.findIndex(a=>a.gid!=null);for(let i=0;i<A.length;){if(i==me){St.push({k:'me',i});i++;continue}const n=[];while(i<A.length&&n.length<4&&i!=me)n.push(i++);St.push({k:'acts',L:n})}St.push({k:'vote'},{k:'win'});return St}
function rwShowOpen(y){if(!rwS().years[y]||!rwS().years[y].res)return;ui.rwsh={y,i:0};render()}
function rwShowGo(d){const s=ui.rwsh;if(!s)return;const n=rwShowSteps(rwS().years[s.y]).length;s.i=Math.max(0,Math.min(n-1,s.i+d));render()}
function rwShowEnd(){ui.rwsh=null;render()}
function rwShowHtml(){const s=ui.rwsh,Y=rwS().years[s.y],R=Y.res,St=rwShowSteps(Y),i=Math.min(s.i,St.length-1),z=St[i],btn=(t,f,c='p')=>`<button class="geb ${c}" onclick="${f}">${t}</button>`;let body='';
 if(z.k=='open')body=`<div class="gestage op"><div class="gekicker">${Y.y} · 31 December</div><h1 class="getitle ccshsm">${RW_NAME}</h1><div class="rwvs"><span class="rwr">🔴 Red</span> vs <span class="rww">White ⚪</span></div><p class="gemc">${R.acts.length} acts · ${Y.line.red.length} Red · ${Y.line.white.length} White</p></div>`;
 else if(z.k=='acts')body=`<div class="gestage"><div class="gekicker">On stage</div><div class="rwacts">${z.L.map(j=>{const a=R.acts[j];return`<div class="rwact ${a.t}"><small>#${j+1} ${a.t=='red'?'🔴':'⚪'}</small><b>${esc(a.nm)}</b><span>${a.song?`“${esc(a.song)}”`:''}</span></div>`}).join('')}</div></div>`;
 else if(z.k=='me'){const a=R.acts[z.i],o=rwSong(a.gid,Y.prep.song);body=`<div class="gestage"><div class="gekicker">#${z.i+1} 🔴 ${esc(a.nm)} · ${esc(RW_STY[a.sty][0])}</div><h2 class="ccshtt">“${esc(a.song)}”${a.song2?` + “${esc(a.song2)}”`:''}</h2><div class="rwstage">${thStageSvg('rws'+Y.y,[a.cen,...a.mem.filter(id=>id!=a.cen)].filter(id=>get(id)),rwRows(a.mem.length),1,id=>rwCzOf(Y,id),()=>null,1,330)}</div><p class="gecap">Center: ${esc((get(a.cen)||{}).name||'')} · performance ${a.sc}</p></div>`}
 else if(z.k=='vote')body=`<div class="gestage"><div class="gekicker">The vote</div><div class="rwvote"><div><b>Judges</b><span class="rwr">${R.jr}</span> – <span class="rww">${R.jw}</span></div><div><b>TV audience</b><span class="rwr">${indFmt(R.ar)}</span> – <span class="rww">${indFmt(R.aw)}</span></div><div><b>Hall</b>${R.hr?'<span class="rwr">Red</span>':'<span class="rww">White</span>'}</div></div></div>`;
 else body=`<div class="gestage op"><div class="gekicker">${RW_NAME} ${Y.y}</div><h1 class="getitle">${R.win=='red'?'🔴 Red':'⚪ White'} team wins!</h1><div class="gesub">${R.pts.red} – ${R.pts.white}</div>${R.fans?`<p class="gemc">Your group gained ${indFmt(R.fans)} fans tonight.</p>`:''}</div>`;
 const last=i==St.length-1,prog=Math.round(100*i/Math.max(1,St.length-1));
 return`<div class="gecer ccsh rwsh" role="dialog"><div class="gebg"><i></i><i></i><i></i><i></i></div><div class="getop"><div><b>${RW_NAME} ${Y.y}</b><span>${longDate(R.day)}</span></div><div class="geprog"><i style="width:${prog}%"></i></div><div class="getopb">${last?'':btn('SKIP','rwShowEnd()','s')}</div></div><div class="gebody">${body}</div><div class="geact">${i>0?btn('BACK','rwShowGo(-1)','s'):''}${last?btn('CLOSE','rwShowEnd()'):btn('NEXT','rwShowGo(1)')}</div></div>`}
{const f=render;render=function(){const r=f.apply(this,arguments);try{const old=document.getElementById('rwshw');if(S&&!ui.t&&ui.rwsh){const a=document.getElementById('app'),d=old||document.createElement('div');d.id='rwshw';d.innerHTML=rwShowHtml();if(!old&&a)a.appendChild(d);document.body.classList.add('gecer-on')}else if(old){old.remove();if(!document.getElementById('gecerw')&&!document.getElementById('ccshw')&&!document.getElementById('awshw'))document.body.classList.remove('gecer-on')}}catch(x){console.error(x)}return r}}
// ---- profile / history -------------------------------------------------------------------------------------------------------------
{const f=histHtml;histHtml=function(m){const h=f.apply(this,arguments);try{const E=(m.mh||[]).filter(e=>e.t=='rw');if(!E.length)return h;return h+`<h3>${RW_NAME}</h3><ul class="pfl">${E.map(e=>`<li><b>${e.yr}</b> · “${esc(e.song||'')}”${e.cen?' · ★ Center':''} · ${e.win?'Red team won':'White team won'}</li>`).join('')}</ul>`}catch(e){return h}}}
{const f=evText;evText=function(e){if(e&&e.t=='rw')return`Performed “${e.song||''}” at the ${RW_NAME} ${e.yr}${e.cen?' as Center':''}`;return f.apply(this,arguments)}}
try{const C=SECS.find(s=>s.k=='charts');if(C&&!C.v.some(x=>x[0]=='rwfest'))C.v.push(['rwfest','Red & White']);SUBLOC.rwfest='Broadcast Hall · Red & White Grand Music Festival'}catch(e){}
