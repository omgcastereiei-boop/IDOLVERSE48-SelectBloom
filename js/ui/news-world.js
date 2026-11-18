// =====================================================================================
//  Media & PR · Part 3: Random World News — positive member / group / company stories and
//  industry news. Stories describe attention, praise, invitations and nominations; they never
//  claim a booking, sale, rank or completed event that is not in the game records. Industry
//  stories only use the existing competitor simulation (S.ind).
// =====================================================================================
const NW_AWARD=['Japan Idol Music Awards','ジャパン・アイドル・ミュージック・アワード'];
function nwPickMember(o={}){const L=S.members.filter(m=>(o.tr||m.status!='graduated')&&(typeof isAct!='function'||isAct(m)||(o.tr&&m.status=='trainee'))&&!(typeof wlAway=='function'&&wlAway(m)));if(!L.length)return null;const N=nwS();
 // everyone can be picked: low-popularity members and trainees get a fair share
 const w=L.map(m=>{if(N.cd['wm:'+m.id]&&S.day-N.cd['wm:'+m.id]<35)return 0;const p=m.pop||1;return o.low?Math.max(1,110-p):Math.sqrt(p)+6});const T=w.reduce((a,b)=>a+b,0);if(!T)return null;let r=Math.random()*T;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0){N.cd['wm:'+L[i].id]=S.day;return L[i]}}return null}
const NW_POS={
 viral:(m,n)=>({att:46,fx:{pop:[[m.id,1.2]],matt:[[m.id,16]]},img:'mem',cat:'member',
  en:{h:`${n} goes viral with a fan-filmed clip`,s:'A short performance clip spreads far beyond idol fans.',b:`A short clip of ${n} filmed by a fan has spread widely online over the past few days, reaching many viewers who had never followed the group. Comments praise her expression and natural charm.`},
  th:{h:`${n} กลายเป็นไวรัล! คลิปจากแฟนแคมถูกแชร์ทั่วโซเชียล`,s:'คลิปการแสดงสั้น ๆ ถูกส่งต่อไปไกลเกินกลุ่มแฟนไอดอล',b:`คลิปสั้นของ ${n} ที่แฟนคลับถ่ายไว้ถูกแชร์ต่อกันอย่างกว้างขวางตลอดหลายวันที่ผ่านมา และเข้าถึงผู้ชมจำนวนมากที่ไม่เคยติดตามวงมาก่อน หลายความเห็นชื่นชมทั้งสีหน้าท่าทางและเสน่ห์ที่เป็นธรรมชาติของเธอ`}}),
 brand:(m,n)=>({att:30,fx:{matt:[[m.id,9]],mrep:[[m.id,1]]},img:'mem',cat:'member',
  en:{h:`Beauty brands take notice of ${n}`,s:'Industry sources say several brands are interested — nothing has been signed.',b:`According to industry sources, several beauty and fashion brands have shown interest in working with ${n}. No agreement has been announced, but stylists point to her recent photo shoots as the reason for the buzz.`},
  th:{h:`แบรนด์บิวตี้หลายเจ้าจับตา ${n}`,s:'แหล่งข่าวเผยมีหลายแบรนด์สนใจ แต่ยังไม่มีการเซ็นสัญญาใด ๆ',b:`แหล่งข่าวในวงการเผยว่าแบรนด์ความงามและแฟชั่นหลายแห่งให้ความสนใจที่จะร่วมงานกับ ${n} แม้ยังไม่มีการประกาศข้อตกลงใด ๆ อย่างเป็นทางการ แต่สไตลิสต์หลายคนมองว่าภาพถ่ายชุดล่าสุดของเธอคือเหตุผลที่ทำให้ชื่อของเธอเป็นที่พูดถึง`}}),
 interview:(m,n)=>({att:22,fx:{matt:[[m.id,6]],mrep:[[m.id,1]]},img:'mem',cat:'member',
  en:{h:`${n} invited for a magazine interview`,s:'An entertainment magazine wants to feature her story.',b:`An entertainment magazine has reached out to feature ${n} in an upcoming interview about her path as an idol. The magazine describes her as “one of the members readers want to know more about.”`},
  th:{h:`${n} ได้รับเชิญสัมภาษณ์ลงนิตยสาร`,s:'นิตยสารบันเทิงอยากนำเสนอเรื่องราวของเธอ',b:`นิตยสารบันเทิงฉบับหนึ่งติดต่อขอสัมภาษณ์ ${n} เพื่อเล่าถึงเส้นทางการเป็นไอดอลของเธอ โดยทางนิตยสารระบุว่าเธอเป็น “หนึ่งในเมมเบอร์ที่ผู้อ่านอยากรู้จักให้มากขึ้น”`}}),
 praise:(m,n)=>({att:26,fx:{mrep:[[m.id,2]],matt:[[m.id,6]],pop:[[m.id,.5]]},img:'mem',cat:'member',
  en:{h:`Veteran choreographer praises ${n}`,s:'“Her growth this year has been remarkable.”',b:`A well-known choreographer singled out ${n} in a recent talk-show segment, saying her growth this year has been remarkable and that she “understands the stage better than many seniors.”`},
  th:{h:`นักออกแบบท่าเต้นรุ่นใหญ่ชื่นชม ${n}`,s:'“พัฒนาการของเธอในปีนี้น่าทึ่งมาก”',b:`นักออกแบบท่าเต้นชื่อดังพูดถึง ${n} ในรายการทอล์กโชว์ล่าสุดว่า พัฒนาการของเธอในปีนี้น่าทึ่งมาก และเธอ “เข้าใจเวทีได้ดีกว่ารุ่นพี่หลายคนเสียอีก”`}}),
 rising:(m,n)=>({att:32,fx:{pop:[[m.id,.9]],matt:[[m.id,10]]},img:'mem',cat:'member',low:1,
  en:{h:`${n}: the member everyone is suddenly talking about`,s:'A quiet member steps into the spotlight.',b:`Without a center position or a big campaign, ${n} has become one of the most-mentioned members this week. Fans say her sincerity and hard work are finally getting noticed.`},
  th:{h:`${n} เมมเบอร์ที่จู่ ๆ ทุกคนก็พูดถึง`,s:'เมมเบอร์ที่เคยเงียบ ๆ ก้าวขึ้นมาอยู่ในสปอตไลต์',b:`แม้จะไม่ได้ยืนเซ็นเตอร์หรือมีแคมเปญใหญ่ แต่ ${n} กลายเป็นหนึ่งในเมมเบอร์ที่ถูกพูดถึงมากที่สุดในสัปดาห์นี้ แฟน ๆ บอกว่าความจริงใจและความพยายามของเธอได้รับการมองเห็นเสียที`}}),
 talent:(m,n)=>{const t=(m.traits||[])[0]||'';return{att:24,fx:{matt:[[m.id,7]],mrep:[[m.id,1]]},img:'mem',cat:'member',low:1,
  en:{h:`${n}'s ${t?t.toLowerCase()+' side':'hidden talent'} wins new fans`,s:'A variety-show moment shows a new side of her.',b:`A short variety segment showed a side of ${n} that many viewers had never seen${t?` — her ${t.toLowerCase()} personality`:''}. Viewers' reactions were overwhelmingly warm.`},
  th:{h:`มุมใหม่ของ ${n} ทำแฟนหน้าใหม่ตกหลุมรัก`,s:'ช่วงหนึ่งในรายการวาไรตี้เผยให้เห็นอีกด้านของเธอ',b:`ช่วงสั้น ๆ ในรายการวาไรตี้ได้เผยให้เห็นอีกด้านหนึ่งของ ${n} ที่ผู้ชมหลายคนไม่เคยเห็นมาก่อน${t?` โดยเฉพาะบุคลิกแบบ “${typeof tr=='function'?trCore(t):t}” ของเธอ`:''} ซึ่งได้รับเสียงตอบรับที่อบอุ่นอย่างล้นหลาม`}}},
 tvinterest:(m,n)=>({att:28,fx:{matt:[[m.id,8]]},img:'mem',cat:'member',
  en:{h:`TV producers interested in ${n}`,s:'Talks are at an early stage; no appearance has been confirmed.',b:`Producers of a popular variety program are said to be interested in inviting ${n} as a guest. The talks are at an early stage and no appearance has been confirmed.`},
  th:{h:`โปรดิวเซอร์รายการทีวีสนใจ ${n}`,s:'อยู่ระหว่างการพูดคุยเบื้องต้น ยังไม่มีการยืนยันการออกรายการ',b:`มีรายงานว่าทีมผู้ผลิตรายการวาไรตี้ชื่อดังสนใจเชิญ ${n} มาเป็นแขกรับเชิญ อย่างไรก็ตาม การพูดคุยยังอยู่ในขั้นเริ่มต้นและยังไม่มีการยืนยันการออกรายการแต่อย่างใด`}}),
 nominate:(m,n)=>({att:38,fx:{mrep:[[m.id,3]],matt:[[m.id,12]]},img:'mem',cat:'member',
  en:{h:`${n} nominated for Best New Idol at the ${NW_AWARD[0]}`,s:'Winners will be announced at the awards ceremony.',b:`${n} has been nominated in the Best New Idol category of the ${NW_AWARD[0]}. The nomination recognises her performances this year; the winners will be announced later.`},
  th:{h:`${n} เข้าชิงไอดอลหน้าใหม่ยอดเยี่ยมเวที ${NW_AWARD[0]}`,s:'ผู้ชนะจะประกาศในงานประกาศรางวัล',b:`${n} ได้รับการเสนอชื่อเข้าชิงสาขาไอดอลหน้าใหม่ยอดเยี่ยมบนเวที ${NW_AWARD[0]} ซึ่งเป็นการยกย่องผลงานการแสดงของเธอในปีนี้ ส่วนผู้ชนะจะประกาศให้ทราบในภายหลัง`}})};
const NW_GPOS={
 trend:(g,G)=>({att:34,fx:{gatt:[[g.id,8]],grep:[[g.id,1]]},th0:'fan',
  en:{h:`${G} trends among young music fans`,s:'Playlists and dance covers spread the group’s songs.',b:`${G} has become a trending topic among young music fans, with dance covers and playlists spreading the group’s songs to a new audience.`},
  th:{h:`${G} กลายเป็นกระแสในกลุ่มคอเพลงวัยรุ่น`,s:'เพลย์ลิสต์และคลิปคัฟเวอร์แดนซ์ช่วยส่งเพลงของวงไปไกล',b:`${G} กลายเป็นหัวข้อที่ถูกพูดถึงในกลุ่มคอเพลงวัยรุ่น ทั้งคลิปคัฟเวอร์แดนซ์และเพลย์ลิสต์ต่าง ๆ ช่วยพาเพลงของวงไปถึงผู้ฟังกลุ่มใหม่`}}),
 intl:(g,G)=>({att:38,fx:{gatt:[[g.id,10]],grep:[[g.id,2]]},th0:'industry',
  en:{h:`${G} attracts attention overseas`,s:'Overseas fans discover the group through its music videos.',b:`Fan communities outside Japan have started discussing ${G}, with translated clips of its music videos and Theater performances circulating online. Some overseas media have mentioned the group as one to watch.`},
  th:{h:`${G} เริ่มเป็นที่จับตาในต่างประเทศ`,s:'แฟนต่างชาติรู้จักวงผ่านมิวสิกวิดีโอ',b:`คอมมูนิตี้แฟนคลับนอกญี่ปุ่นเริ่มพูดถึง ${G} มากขึ้น ทั้งคลิปมิวสิกวิดีโอและการแสดงที่เธียเตอร์ที่มีคำแปลถูกแชร์กันในโลกออนไลน์ สื่อต่างประเทศบางแห่งยังจัดให้วงเป็นหนึ่งในศิลปินที่น่าจับตามอง`}}),
 groupnom:(g,G)=>({att:40,fx:{gatt:[[g.id,10]],grep:[[g.id,3]]},th0:'award',
  en:{h:`${G} nominated for Group of the Year at the ${NW_AWARD[0]}`,s:'A recognition of the group’s performances this year.',b:`${G} is among the nominees for Group of the Year at the ${NW_AWARD[0]}. The winners will be revealed at the ceremony later in the season.`},
  th:{h:`${G} เข้าชิงรางวัลศิลปินกลุ่มแห่งปีเวที ${NW_AWARD[0]}`,s:'การยอมรับในผลงานของวงตลอดปีที่ผ่านมา',b:`${G} ติดหนึ่งในผู้เข้าชิงรางวัลศิลปินกลุ่มแห่งปีบนเวที ${NW_AWARD[0]} โดยผู้ชนะจะประกาศในพิธีมอบรางวัลช่วงปลายฤดูกาล`}})};
const NW_CPOS={
 mgmt:(C)=>({att:24,fx:{crep:2,trust:1,catt:4},th0:'company',
  en:{h:`${C} praised for how it develops young talent`,s:'An industry column highlights the agency’s training approach.',b:`An entertainment business column has highlighted ${C}'s approach to developing young performers, pointing to its Theater system and member care as an example for other agencies.`},
  th:{h:`${C} ได้รับคำชมเรื่องการพัฒนาศิลปินรุ่นใหม่`,s:'คอลัมน์ธุรกิจบันเทิงพูดถึงแนวทางการฝึกฝนของค่าย',b:`คอลัมน์ธุรกิจบันเทิงฉบับล่าสุดพูดถึงแนวทางการปั้นศิลปินรุ่นใหม่ของ ${C} โดยยกระบบเธียเตอร์และการดูแลเมมเบอร์ขึ้นมาเป็นตัวอย่างที่ค่ายอื่นน่าเรียนรู้`}}),
 biz:(C)=>({att:22,fx:{crep:1,catt:5},th0:'company',
  en:{h:`Business partners show interest in ${C}`,s:'Several companies are said to be exploring collaborations.',b:`Several companies are reportedly exploring collaboration opportunities with ${C}. Nothing has been agreed yet, but the interest reflects the agency's rising profile.`},
  th:{h:`พันธมิตรธุรกิจหลายรายสนใจร่วมงานกับ ${C}`,s:'มีรายงานว่าหลายบริษัทกำลังมองหาโอกาสร่วมมือ',b:`มีรายงานว่าบริษัทหลายแห่งกำลังพิจารณาโอกาสในการร่วมงานกับ ${C} แม้ยังไม่มีข้อตกลงใดเกิดขึ้น แต่ความสนใจนี้สะท้อนถึงชื่อเสียงของค่ายที่เพิ่มขึ้นอย่างต่อเนื่อง`}})};
function nwWorldDaily(){const N=nwS();if(!S.members.length)return;
 // member / group / company stories: about one every ten days
 if(Math.random()<.1){const r=Math.random();
  if(r<.7){const keys=Object.keys(NW_POS),k=keys[Math.floor(Math.random()*keys.length)],low=k=='rising'||k=='talent'||Math.random()<.35,m=nwPickMember({low,tr:k=='rising'});if(m){const n=m.name,o=NW_POS[k](m,n);nwPublish({...o,src:'world',type:'pos_'+k,sent:'pos',imp:2,refs:{gid:nwGid(m),mids:[m.id]},img:nwMemImg(m.id),alt:nwAlt(`Portrait of ${n}`,`ภาพของ ${n}`)})}}
  else if(r<.9){const L=nwGroups().filter(g=>typeof isLive!='function'||isLive(g));const g=L[Math.floor(Math.random()*L.length)];if(g&&!(N.cd['wg:'+g.id]&&S.day-N.cd['wg:'+g.id]<45)){N.cd['wg:'+g.id]=S.day;const keys=Object.keys(NW_GPOS),k=keys[Math.floor(Math.random()*keys.length)],G=g.name,o=NW_GPOS[k](g,G);const ids=S.members.filter(m=>nwGid(m)==g.id&&(typeof isAct!='function'||isAct(m))).sort((a,b)=>b.pop-a.pop).slice(0,7).map(m=>m.id);
   nwPublish({...o,src:'world',type:'gpos_'+k,cat:'company',sent:'pos',imp:3,refs:{gid:g.id},img:ids.length?{k:'grp',ids,hue:nwHash(G)%360}:{k:'edit',th:o.th0},alt:nwAlt(`${G} members`,`เมมเบอร์ ${G}`)})}}
  else if(!(N.cd.wc&&S.day-N.cd.wc<60)){N.cd.wc=S.day;const keys=Object.keys(NW_CPOS),k=keys[Math.floor(Math.random()*keys.length)],C=S.co||'the agency',o=NW_CPOS[k](C);nwPublish({...o,src:'world',type:'cpos_'+k,cat:'company',sent:'pos',imp:2,refs:{},img:{k:'edit',th:o.th0},alt:nwAlt('Agency illustration','ภาพประกอบบริษัท')})}}
 // industry trend story from the real chart (about every three weeks)
 const I=S.ind;if(I&&I.last!=null&&I.W&&I.W[I.last]&&Math.random()<.05&&!(N.cd.wi&&S.day-N.cd.wi<18)){N.cd.wi=S.day;const top=(I.W[I.last].cs||[]).map(([id])=>I.R[id]).filter(Boolean),gen={};top.forEach(r=>{if(r.g)gen[r.g]=(gen[r.g]||0)+1});const best=Object.entries(gen).sort((a,b)=>b[1]-a[1])[0];
  if(best&&best[1]>=3){const gTh=typeof trCore=='function'?trCore(best[0]):best[0];nwPublish({src:'world',type:'ind_trend',cat:'industry',sent:'neu',att:18,imp:1,refs:{},img:{k:'edit',th:'industry'},alt:nwAlt('Music industry illustration','ภาพประกอบวงการดนตรี'),facts:{genre:best[0],n:best[1]},
   en:{h:`${best[0]} dominates this week's Top 20`,s:`${best[1]} of the Top 20 combined singles are ${best[0]} songs.`,b:`${best[0]} is the sound of the moment: ${best[1]} of this week's Top 20 Combined Singles belong to the genre. Producers say listeners are gravitating to its energy, and more releases in the style are expected.`},
   th:{h:`แนวเพลง ${gTh} ครองท็อป 20 สัปดาห์นี้`,s:`เพลงแนว ${gTh} ติดท็อป 20 ชาร์ตซิงเกิลรวมถึง ${best[1]} เพลง`,b:`${gTh} คือแนวเพลงที่กำลังมาแรงที่สุดในตอนนี้ โดยในท็อป 20 ชาร์ตซิงเกิลรวมสัปดาห์นี้มีเพลงแนวนี้ถึง ${best[1]} เพลง โปรดิวเซอร์หลายคนมองว่าผู้ฟังชื่นชอบพลังของดนตรีแนวนี้ และคาดว่าจะมีผลงานสไตล์เดียวกันตามออกมาอีกมาก`}})}}}
