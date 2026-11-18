// =====================================================================================
//  Media & PR · Part 2: Member scandals, rumors, investigation & player-controlled crisis
//  management. Extends the Part 1 engine (one store S.news, one feed, nwPublish).
//  · A case (S.news.sc.list) has a category, severity 1–5 and a HIDDEN truth
//    (true / partial / false / unknown → can never be confirmed). Severity ≠ truth.
//  · Evidence is generated from the hidden truth and revealed only by investigation actions;
//    nothing is revealed just because an investigation starts.
//  · The player chooses every public response and every disciplinary step. Nothing is chosen
//    automatically; nobody is punished, suspended, made to graduate or leave automatically.
//    Suspension reuses the existing wellness leave (it ends on its own date).
//  · Outcomes depend on the hidden truth AND the chosen response: no response is always right.
//  · Every case keeps a permanent history (also after graduation / transfer).
// =====================================================================================
const SC_CAT={
 dating:{n:['Dating & relationship','ความรักและความสัมพันธ์'],sev:[1,3],tone:['mix','neg','pos','neu']},
 social:{n:['Personal social media','โซเชียลมีเดียส่วนตัว'],sev:[1,3],tone:['neg','mix']},
 private:{n:['Private life','ชีวิตส่วนตัว'],sev:[1,2],tone:['mix','neu','neg']},
 interpersonal:{n:['Interpersonal conflict','ความขัดแย้งระหว่างบุคคล'],sev:[2,3],tone:['neg','mix'],two:1},
 public:{n:['Public behavior','พฤติกรรมในที่สาธารณะ'],sev:[1,3],tone:['neg','mix']},
 professional:{n:['Professional conduct','ความเป็นมืออาชีพ'],sev:[2,3],tone:['neg','mix']},
 photo:{n:['Private photo leak','ภาพส่วนตัวหลุด'],sev:[2,4],tone:['neg','mix']},
 past:{n:['Past controversy','เรื่องในอดีต'],sev:[1,3],tone:['mix','neg','neu']},
 fan:{n:['Fan conflict','ความขัดแย้งในแฟนคลับ'],sev:[1,2],tone:['mix','neg']},
 internal:{n:['Internal conflict','ความขัดแย้งภายใน'],sev:[2,3],tone:['neg','mix'],two:1},
 rule:{n:['Rule violation','การฝ่าฝืนกฎ'],sev:[2,4],tone:['neg']},
 serious:{n:['Serious allegation','ข้อกล่าวหาร้ายแรง'],sev:[4,5],tone:['neg']}};
const SC_SEV=[null,['Minor','เล็กน้อย'],['Moderate','ปานกลาง'],['Major','ใหญ่'],['Severe','รุนแรง'],['Critical','วิกฤต']];
const SC_TRUTH={true:['True','จริง'],partial:['Partially true','จริงบางส่วน'],false:['False','ไม่เป็นความจริง'],unk:['Unconfirmed','ยังไม่ได้รับการยืนยัน']};
const SC_ST={developing:['Developing','กำลังพัฒนา'],investigating:['Under investigation','อยู่ระหว่างตรวจสอบ'],awaiting:['Awaiting response','รอการชี้แจง'],responded:['Response issued','ออกแถลงการณ์แล้ว'],reaction:['Public reaction','กระแสตอบรับ'],updated:['Updated','มีความคืบหน้า'],resolved:['Resolved','คลี่คลายแล้ว'],archived:['Archived','เก็บเข้าคลัง']};
const scS=()=>nwS().sc;
const scGet=id=>scS().list.find(c=>c.id==id)||null;
const scOpen=()=>scS().list.filter(c=>!['resolved','archived'].includes(c.st));
// ---- the reported story (both languages written natively) ----------------------------------------------------------------------
function scStory(c){const a=nwNm(c.mids[0]),b=c.mids[1]!=null?nwNm(c.mids[1]):null,d=nwDate(c.claim),dT=nwDate(c.claim,1),R=c.kind=='rumor',G=nwGn(c.gid);
 const S2={
 dating:[{h:`${a} spotted with a mystery companion?`,b:`A weekly magazine claims ${a} was seen leaving a café with an unidentified man on ${d}. The report includes no clear photographs, and the agency has not commented.`},{h:`วงในเผย ${a} ถูกพบเดินคู่หนุ่มปริศนา?`,b:`นิตยสารรายสัปดาห์ฉบับหนึ่งอ้างว่าพบเห็น ${a} เดินออกจากคาเฟ่พร้อมชายหนุ่มที่ไม่ทราบตัวตนเมื่อวันที่ ${dT} อย่างไรก็ตาม รายงานดังกล่าวไม่มีภาพถ่ายที่ชัดเจน และต้นสังกัดยังไม่ได้ออกมาให้ความเห็นแต่อย่างใด`}],
 social:[{h:`Old post by ${a} sparks debate online`,b:`A screenshot said to be from ${a}'s personal account has resurfaced, and some users are calling the wording insensitive. Others question whether the screenshot is authentic.`},{h:`โพสต์เก่าของ ${a} ถูกขุดจนเกิดดราม่า`,b:`ภาพแคปหน้าจอที่อ้างว่ามาจากบัญชีส่วนตัวของ ${a} ถูกนำกลับมาเผยแพร่อีกครั้ง ผู้ใช้บางส่วนมองว่าถ้อยคำไม่เหมาะสม ขณะที่อีกฝ่ายตั้งข้อสงสัยว่าภาพแคปนี้เป็นของจริงหรือไม่`}],
 private:[{h:`Report claims ${a} was at a private party`,b:`An entertainment site reports that ${a} attended a private gathering on ${d}. The story does not say who else was present, and its sources are anonymous.`},{h:`มีรายงานว่า ${a} ไปร่วมปาร์ตี้ส่วนตัว`,b:`เว็บไซต์บันเทิงแห่งหนึ่งรายงานว่า ${a} ไปร่วมงานสังสรรค์ส่วนตัวเมื่อวันที่ ${dT} โดยไม่ได้ระบุว่ามีใครร่วมงานบ้าง และอ้างอิงจากแหล่งข่าวที่ไม่เปิดเผยตัวตน`}],
 interpersonal:[{h:`Tension between ${a} and ${b}?`,b:`Fans have pointed to the body language of ${a} and ${b} at recent appearances, and an anonymous post claims the two had an argument backstage. Neither member has commented.`},{h:`${a} กับ ${b} บาดหมางกัน?`,b:`แฟน ๆ สังเกตเห็นท่าทีของ ${a} และ ${b} ในงานช่วงหลัง ประกอบกับมีโพสต์ไม่ระบุตัวตนอ้างว่าทั้งสองมีปากเสียงกันหลังเวที ขณะที่ทั้งคู่ยังไม่ได้ออกมาพูดถึงเรื่องนี้`}],
 public:[{h:`${a} criticised over behaviour at a public appearance`,b:`Videos from a public appearance on ${d} show a moment some viewers describe as rude toward staff. Others say the clip lacks context.`},{h:`${a} ถูกวิจารณ์เรื่องท่าทีระหว่างออกงาน`,b:`คลิปจากงานที่ ${a} ไปปรากฏตัวเมื่อวันที่ ${dT} มีช่วงหนึ่งที่ผู้ชมบางส่วนมองว่าเธอแสดงท่าทีไม่สุภาพกับทีมงาน ขณะที่อีกฝ่ายแย้งว่าคลิปถูกตัดมาไม่ครบบริบท`}],
 professional:[{h:`Questions raised over ${a}'s professionalism`,b:`An anonymous staff member claims ${a} has been difficult to work with during recent rehearsals. The agency has not confirmed the account.`},{h:`เกิดคำถามถึงความเป็นมืออาชีพของ ${a}`,b:`ทีมงานรายหนึ่งที่ไม่เปิดเผยตัวตนอ้างว่า ${a} ทำงานด้วยยากในช่วงซ้อมที่ผ่านมา ขณะที่ต้นสังกัดยังไม่ได้ยืนยันข้อมูลดังกล่าว`}],
 photo:[{h:`Photo said to show ${a} circulates online`,b:`A private-looking photo said to show ${a} has spread on message boards. It is unclear when it was taken, whether it has been edited, or whether it shows her at all. This outlet will not republish it.`},{h:`ภาพที่อ้างว่าเป็น ${a} ถูกส่งต่อในโลกออนไลน์`,b:`ภาพลักษณะส่วนตัวที่อ้างว่าเป็น ${a} ถูกแชร์ต่อในเว็บบอร์ดหลายแห่ง ยังไม่ชัดเจนว่าภาพถูกถ่ายเมื่อใด ผ่านการตัดต่อหรือไม่ หรือเป็นตัวเธอจริงหรือเปล่า ทางสำนักข่าวจะไม่นำภาพดังกล่าวมาเผยแพร่ซ้ำ`}],
 past:[{h:`${a}'s past comments resurface`,b:`Comments ${a} reportedly made before joining the group are being shared again, prompting debate about whether they still matter today.`},{h:`คำพูดในอดีตของ ${a} ถูกขุดกลับมา`,b:`คำพูดที่มีรายงานว่า ${a} เคยพูดไว้ก่อนเข้าวงถูกนำกลับมาแชร์อีกครั้ง จนเกิดการถกเถียงว่าเรื่องในอดีตควรนำมาตัดสินเธอในวันนี้หรือไม่`}],
 fan:[{h:`Fan clash over ${a} heats up`,b:`Arguments between groups of fans about ${a}'s position have spilled into public spaces, with some posts targeting other members.`},{h:`ศึกแฟนคลับเรื่อง ${a} ร้อนระอุ`,b:`การถกเถียงระหว่างแฟนคลับหลายกลุ่มเกี่ยวกับตำแหน่งของ ${a} ลุกลามจนกลายเป็นเรื่องสาธารณะ บางโพสต์ถึงขั้นพาดพิงเมมเบอร์คนอื่น`}],
 internal:[{h:`Report of disagreement inside ${G}`,b:`A gossip outlet claims there is friction between ${a} and ${b} over team decisions. The agency says it does not comment on rumours.`},{h:`มีรายงานความขัดแย้งภายใน ${G}`,b:`สื่อสายซุบซิบอ้างว่า ${a} และ ${b} มีความเห็นไม่ตรงกันเรื่องการตัดสินใจภายในทีม ด้านต้นสังกัดระบุว่าไม่ขอแสดงความเห็นต่อข่าวลือ`}],
 rule:[{h:`Did ${a} break agency rules?`,b:`A report alleges ${a} broke an agency rule during an event on ${d}. Details remain unverified.`},{h:`${a} ทำผิดกฎต้นสังกัด?`,b:`มีรายงานกล่าวหาว่า ${a} ฝ่าฝืนกฎของต้นสังกัดระหว่างงานเมื่อวันที่ ${dT} ซึ่งรายละเอียดยังไม่ได้รับการพิสูจน์`}],
 serious:[{h:`Serious allegation made against ${a}`,b:`A serious allegation of misconduct involving ${a} has been made by an anonymous source. It is an allegation only: no evidence has been published and nothing has been verified.`},{h:`${a} ถูกกล่าวหาในประเด็นร้ายแรง`,b:`มีแหล่งข่าวไม่เปิดเผยตัวตนออกมากล่าวหา ${a} ในประเด็นพฤติกรรมไม่เหมาะสมที่ร้ายแรง ทั้งนี้เป็นเพียงข้อกล่าวหาเท่านั้น ยังไม่มีการเผยแพร่หลักฐานและยังไม่มีสิ่งใดได้รับการพิสูจน์`}]}[c.cat];
 const pre=R?['Rumor: ','ลือหนัก: ']:['',''];return{en:{h:pre[0]+S2[0].h,s:R?'Unverified claims are circulating.':'An unverified report draws attention.',b:S2[0].b},th:{h:pre[1]+S2[1].h,s:R?'ข่าวลือที่ยังไม่ได้รับการยืนยันกำลังถูกพูดถึง':'รายงานที่ยังไม่ได้รับการยืนยันกำลังเป็นที่จับตา',b:S2[1].b}}}
// ---- evidence model (hidden; generated from the hidden truth) --------------------------------------------------------------------
const SC_EV={
 evidence:{sup:['The material appears genuine and is consistent with the report.','หลักฐานที่มีดูเป็นของจริงและสอดคล้องกับรายงาน'],con:['The material turns out to come from a public group activity, not a private one.','หลักฐานที่มีกลับเป็นภาพจากกิจกรรมสาธารณะของวง ไม่ใช่เรื่องส่วนตัว'],amb:['The material is too unclear to identify anyone with certainty.','หลักฐานไม่ชัดเจนพอที่จะระบุตัวบุคคลได้อย่างแน่ชัด']},
 info:{sup:['A second source independently confirms part of the story.','มีแหล่งข่าวที่สองยืนยันเนื้อหาบางส่วนอย่างเป็นอิสระ'],con:['The original source admits it was repeating hearsay.','แหล่งข่าวต้นเรื่องยอมรับว่าเพียงพูดต่อจากที่ได้ยินมา'],amb:['Additional sources give contradictory accounts.','แหล่งข่าวเพิ่มเติมให้ข้อมูลที่ขัดแย้งกันเอง']},
 meet:{sup:['In the private meeting, she admits the core of the story.','ในการพูดคุยส่วนตัว เธอยอมรับว่าแก่นของเรื่องเป็นความจริง'],con:['In the private meeting, she gives a detailed, consistent account that contradicts the report.','ในการพูดคุยส่วนตัว เธออธิบายรายละเอียดอย่างสอดคล้อง ซึ่งขัดแย้งกับรายงาน'],amb:['In the private meeting, she is upset and her account leaves questions open.','ในการพูดคุยส่วนตัว เธอค่อนข้างกังวลและคำอธิบายยังมีจุดที่ไม่ชัดเจน']},
 involved:{sup:['The other member confirms that the conflict happened.','เมมเบอร์อีกฝ่ายยืนยันว่ามีความขัดแย้งเกิดขึ้นจริง'],con:['The other member says the story was blown out of proportion.','เมมเบอร์อีกฝ่ายบอกว่าเรื่องถูกขยายเกินความจริง'],amb:['The two members describe the situation differently.','ทั้งสองคนเล่าเหตุการณ์ไม่ตรงกัน']},
 staff:{sup:['A staff member confirms seeing what was reported.','ทีมงานคนหนึ่งยืนยันว่าเห็นเหตุการณ์ตามที่มีการรายงาน'],con:['Staff who were present say the report is inaccurate.','ทีมงานที่อยู่ในเหตุการณ์ยืนยันว่ารายงานไม่ถูกต้อง'],amb:['Staff did not see the moment in question.','ทีมงานไม่ได้เห็นเหตุการณ์ในช่วงเวลาดังกล่าว']},
 wait:{sup:['New material surfaces that supports the report.','มีหลักฐานใหม่ที่สนับสนุนรายงานปรากฏขึ้น'],con:['A witness comes forward and contradicts the report.','มีพยานออกมาให้ข้อมูลที่ขัดแย้งกับรายงาน'],amb:['More posts appear, but nothing that settles the question.','มีโพสต์เพิ่มขึ้น แต่ยังไม่มีอะไรที่ชี้ชัดได้']}};
function scEvidence(c){const T=c.truth,two=c.mids.length>1,src=['evidence','info','meet','staff','wait',...(two?['involved']:[])];let kinds=T=='true'?['sup','sup','sup','amb']:T=='partial'?['sup','sup','con','con']:T=='false'?['con','con','con','amb']:['amb','amb','amb','amb'];
 const L=[];src.sort(()=>Math.random()-.5);kinds.forEach((k,i)=>L.push({id:'e'+i,src:src[i%src.length],k,found:0}));
 // the meeting always says something that matches the truth
 if(!L.some(e=>e.src=='meet'))L.push({id:'em',src:'meet',k:T=='true'?'sup':T=='false'?'con':T=='partial'?'sup':'amb',found:0});
 return L}
// game-record check: did the member have recorded work at the reported time?
function scRecords(c){const mid=c.mids[0],d=c.claim,th=((S.th&&S.th.pf)||[]).find(p=>p.day==d&&(p.mem||[]).includes(mid));
 if(th)return{k:'con',txt:[`Theater records: on ${nwDate(d)} ${nwNm(mid)} was performing “${th.nm}” at the Theater at the reported time.`,`บันทึกเธียเตอร์: วันที่ ${nwDate(d,1)} ${nwNm(mid)} กำลังแสดงสเตจ “${th.nm}” อยู่ที่เธียเตอร์ในช่วงเวลาที่ถูกอ้างถึง`]};
 const cal=(S.cal||[]).find(e=>e.day==d&&(e.members||[]).includes(mid));if(cal)return{k:'con',txt:[`Schedule records: on ${nwDate(d)} ${nwNm(mid)} was at “${cal.title}”.`,`ตารางงาน: วันที่ ${nwDate(d,1)} ${nwNm(mid)} อยู่ที่งาน “${cal.title}”`]};
 return{k:'amb',txt:[`Schedule records: ${nwNm(mid)} had no recorded work on ${nwDate(d)} — the records neither confirm nor rule out the report.`,`ตารางงาน: วันที่ ${nwDate(d,1)} ${nwNm(mid)} ไม่มีงานที่บันทึกไว้ บันทึกจึงไม่สามารถยืนยันหรือหักล้างรายงานได้`]}}
function scHistory(c){const mid=c.mids[0],past=scS().list.filter(x=>x.id!=c.id&&x.mids.includes(mid)),tf=past.filter(x=>x.found&&x.final&&x.final.truth=='true').length;
 return{k:'amb',txt:[`History: ${past.length} earlier case(s) involving ${nwNm(mid)}${tf?`, ${tf} of them confirmed`:''}. Past cases do not prove this one.`,`ประวัติ: เคยมี ${past.length} กรณีที่เกี่ยวข้องกับ ${nwNm(mid)}${tf?` ซึ่งได้รับการยืนยันแล้ว ${tf} กรณี`:''} อย่างไรก็ตาม เรื่องในอดีตไม่ได้พิสูจน์กรณีนี้`]}}
// ---- generation ------------------------------------------------------------------------------------------------------------------
function scWeights(m){const N=nwS(),r=nwRepM(m.id),last=scS().list.filter(c=>c.mids.includes(m.id)).map(c=>c.day).sort((a,b)=>b-a)[0];if(last!=null&&S.day-last<75)return 0;return 4+Math.sqrt(m.pop||1)+r.att*.15}
function scNew(o={}){const L=S.members.filter(m=>(typeof isAct!='function'||isAct(m))&&!(typeof wlAway=='function'&&wlAway(m)));if(!L.length)return null;
 const W=L.map(scWeights),T=W.reduce((a,b)=>a+b,0);if(!T)return null;let r=Math.random()*T,m=null;for(let i=0;i<L.length;i++){r-=W[i];if(r<=0){m=L[i];break}}if(!m)return null;
 const keys=Object.keys(SC_CAT).filter(k=>k!='serious'||Math.random()<.15),cat=o.cat||keys[Math.floor(Math.random()*keys.length)],C=SC_CAT[cat];if(!C)return null;const kind=o.kind||(Math.random()<.55?'rumor':'scandal');
 let mids=[m.id];if(C.two){const mates=L.filter(x=>x.id!=m.id&&nwGid(x)==nwGid(m));if(!mates.length)return null;mids.push(mates[Math.floor(Math.random()*mates.length)].id)}
 let sev=C.sev[0]+Math.floor(Math.random()*(C.sev[1]-C.sev[0]+1));if(kind=='rumor')sev=Math.max(1,sev-1);if(m.pop>70&&Math.random()<.3)sev=Math.min(5,sev+1);
 const tr=Math.random(),truth=o.truth||(kind=='rumor'?(tr<.4?'false':tr<.65?'unk':tr<.85?'partial':'true'):(tr<.3?'false':tr<.5?'unk':tr<.72?'partial':'true'));
 // the reported day: false stories tend to clash with a recorded performance
 let claim=S.day-1-Math.floor(Math.random()*6);if(truth=='false'){const p=((S.th&&S.th.pf)||[]).filter(p=>(p.mem||[]).includes(m.id)&&p.day<S.day&&p.day>=S.day-14).at(-1);if(p&&Math.random()<.7)claim=p.day}
 const X=scS(),c={id:'SC'+String(++X.seq).padStart(3,'0'),kind,cat,sev,truth,tone:o.tone||C.tone[Math.floor(Math.random()*C.tone.length)],mids,gid:nwGid(m),claim,day:S.day,st:'developing',ev:[],inv:{},pend:[],dec:[],stmt:[],disc:[],arts:[],hist:[{d:S.day,e:'reported'}],sched:[],reac:null,fx:[]};
 c.ev=scEvidence(c);X.list.unshift(c);scReport(c);return c}
function scDaily(){const X=scS();
 // new stories: rumors a little more often than scandals; never more than two open cases at once
 if(scOpen().length<2&&Math.random()<.022)scNew();
 X.list.forEach(c=>{if(['resolved','archived'].includes(c.st))return;
  c.pend=c.pend.filter(p=>{if(S.day<p.done)return true;scReveal(c,p.act);return false});
  c.sched=c.sched.filter(s=>{if(S.day<s.day)return true;try{scFollow(c,s)}catch(e){console.error(e)}return false});
  // an ignored serious story grows; a minor one cools down (it is never closed automatically)
  const age=S.day-c.day;if(!c.dec.some(d=>d.pub)&&c.sev>=3&&age==6)scPressure(c);
  if(c.st=='responded'&&!c.sched.length&&age>2)c.st='reaction'});
 X.list.forEach(c=>{if(c.st=='resolved'&&S.day-(c.resDay||S.day)>45){c.st='archived';c.hist.push({d:S.day,e:'archived'});c.arts.forEach(id=>{const a=nwGet(id);if(a){a.st='archived';a.hist.push({d:S.day,e:'status',st:'archived'})}})}})}
// public reaction per audience, from the existing fanbase segments of the member
function scReaction(c,mood){const mid=c.mids[0],segs=(S.fb&&S.fb.segs)||[];let kami=0,oshi=0,cas=0,loy=0,n=0;segs.forEach(s=>{if(s.k==mid){kami+=s.n;loy+=s.loy*s.n;n+=s.n}else if(s.o&&s.o[mid]){oshi+=s.o[mid]}if(s.ft=='casual')cas+=s.n});const L=n?loy/n:50;
 const pick=(pos,neg)=>mood>0?pos:mood<0?neg:'debate';const C=SC_CAT[c.cat];
 return{kami:{n:kami,r:mood<0&&L<45?'disappointment':mood<0?'support':mood>0?'support':'support'},oshi:{n:oshi,r:mood<0?(c.cat=='dating'?'disappointment':'debate'):mood>0?'sympathy':'curiosity'},casual:{n:cas,r:mood<0?'indifference':mood>0?'curiosity':'indifference'},
  public:{r:mood<0?(c.sev>=3?'criticism':'debate'):mood>0?'sympathy':c.cat=='dating'?'curiosity':'indifference'},media:{r:c.sev>=3?'calls for clarification':mood>0?'curiosity':'debate'},rival:{r:c.sev>=3?'criticism':'indifference'}}}
const SC_RX={support:['Support','สนับสนุน'],criticism:['Criticism','วิจารณ์'],disappointment:['Disappointment','ผิดหวัง'],sympathy:['Sympathy','เห็นใจ'],indifference:['Indifference','ไม่สนใจ'],curiosity:['Curiosity','อยากรู้'],debate:['Debate','ถกเถียง'],'calls for clarification':['Calls for clarification','เรียกร้องให้ชี้แจง'],'calls for disciplinary action':['Calls for disciplinary action','เรียกร้องให้ลงโทษ']};
// the first article + its initial (context-dependent) impact
function scReport(c){const st=scStory(c),mid=c.mids[0],n=nwNm(mid),pop=(get(mid)||{}).pop||30,sev=c.sev,tone=c.tone,att=Math.round(18+sev*9+pop*.15+(c.kind=='rumor'?0:8));
 const mood=tone=='pos'?1:tone=='neu'?0:tone=='mix'?0:-1;c.reac=scReaction(c,mood);
 const fx={matt:c.mids.map(id=>[id,8+sev*4]),gatt:[[c.gid,2+sev]]};
 if(tone=='neg'){fx.mrep=c.mids.map(id=>[id,-(sev*1.4)]);if(sev>=3)fx.trust=-(sev-2);if(c.cat=='dating'||c.cat=='photo')fx.eng=[mid,-2]}
 else if(tone=='mix'){fx.mrep=c.mids.map(id=>[id,-sev*.5]);if(c.cat=='dating'){fx.eng=[mid,-1];fx.pop=[[mid,.4]]}}
 else if(tone=='pos'){fx.pop=[[mid,.8]];fx.mrep=[[mid,1]]}
 const a=nwPublish({src:'scandal',type:'sc_'+c.cat,cat:c.kind=='rumor'?'rumor':'scandal',sent:tone=='pos'?'pos':tone=='neu'?'neu':tone=='mix'?'mix':'neg',att,imp:Math.min(5,sev+1),refs:{gid:c.gid,mids:c.mids},sc:c.id,sev,truth:'unk',st:'developing',
  img:{k:'edit',th:c.kind=='rumor'?'rumor':'scandal',id:mid},alt:nwAlt(`Editorial illustration with a file portrait of ${n}`,`ภาพประกอบข่าวพร้อมภาพแฟ้มของ ${n}`),reac:c.reac,fx,en:st.en,th:st.th});
 if(a){c.arts.push(a.id);c.fx.push({d:S.day,a:a.id,fx})}}
function scArticle(c,o){const mid=c.mids[0],n=nwNm(mid),last=c.arts[c.arts.length-1];const a=nwPublish({src:'scandal',type:'sc_upd',cat:c.kind=='rumor'?'rumor':'scandal',refs:{gid:c.gid,mids:c.mids},sc:c.id,sev:c.sev,truth:o.truth||'unk',parent:last||null,st:o.st||c.st,
 img:o.img||{k:'edit',th:'press',id:mid},alt:o.alt||nwAlt(`Press illustration with a file portrait of ${n}`,`ภาพประกอบข่าวพร้อมภาพแฟ้มของ ${n}`),reac:c.reac,...o});if(a){c.arts.push(a.id);if(o.fx)c.fx.push({d:S.day,a:a.id,fx:o.fx})}return a}
function scStatus(c,st){c.st=st;c.hist.push({d:S.day,e:'status',st});c.arts.forEach(id=>{const a=nwGet(id);if(a&&a.st!='archived'){a.st=st;a.hist.push({d:S.day,e:'status',st})}})}
function scPressure(c){const n=nwList(c.mids),nT=nwList(c.mids,1);scArticle(c,{sent:'neg',att:40+c.sev*6,imp:c.sev,st:'updated',fx:{trust:-1.5,matt:c.mids.map(id=>[id,6]),crep:-1},
 en:{h:`Silence over ${n} story draws criticism`,s:'Media and the public ask the agency to clarify.',b:`With no statement so far on the report involving ${n}, commentators are calling on the agency to clarify the situation. The story continues to circulate.`},
 th:{h:`ความเงียบต่อกรณีของ ${nT} เริ่มถูกวิจารณ์`,s:'สื่อและสังคมเรียกร้องให้ต้นสังกัดออกมาชี้แจง',b:`เมื่อยังไม่มีแถลงการณ์ใด ๆ ต่อรายงานที่เกี่ยวข้องกับ ${nT} นักวิจารณ์หลายรายเริ่มเรียกร้องให้ต้นสังกัดออกมาชี้แจง ขณะที่เรื่องราวยังคงถูกพูดถึงอย่างต่อเนื่อง`}});scStatus(c,'updated')}
// ---- investigation ---------------------------------------------------------------------------------------------------------------
const SC_INV={evidence:{n:['Review available evidence','ตรวจสอบหลักฐานที่มี'],t:0},info:{n:['Request additional information','ขอข้อมูลเพิ่มเติม'],t:2},meet:{n:['Call the member for a private meeting','เรียกเมมเบอร์มาพูดคุยเป็นการส่วนตัว'],t:0},involved:{n:['Ask the involved members','สอบถามเมมเบอร์ที่เกี่ยวข้อง'],t:1,two:1},staff:{n:['Interview relevant staff','สัมภาษณ์ทีมงานที่เกี่ยวข้อง'],t:1},records:{n:['Check event & schedule records','ตรวจสอบบันทึกงานและตารางเวลา'],t:0},history:{n:['Review historical records','ตรวจสอบประวัติที่ผ่านมา'],t:0},wait:{n:['Wait for further evidence','รอหลักฐานเพิ่มเติม'],t:4,rep:1}};
function scInvOk(c,k){const A=SC_INV[k];if(!A||['resolved','archived'].includes(c.st))return false;if(A.two&&c.mids.length<2)return false;if(!A.rep&&c.inv[k])return false;if(c.pend.some(p=>p.act==k))return false;return true}
function scInvestigate(id,k){const c=scGet(id);if(!c||!scInvOk(c,k))return toast(nwT(['This action is not available now.','ไม่สามารถทำรายการนี้ได้ในตอนนี้']),'err');c.inv[k]=(c.inv[k]|0)+1;c.dec.push({d:S.day,k:'inv:'+k});c.hist.push({d:S.day,e:'investigate',act:k});
 if(['developing','updated'].includes(c.st))scStatus(c,'investigating');const A=SC_INV[k];if(A.t){c.pend.push({act:k,done:S.day+A.t});toast(nwT([`Started: ${A.n[0]}. Result in ${A.t} day(s).`,`เริ่มดำเนินการ: ${A.n[1]} ทราบผลใน ${A.t} วัน`]))}else scReveal(c,k);render()}
function scReveal(c,k){let f=null;
 if(k=='records'){const r=scRecords(c);f={src:k,k:r.k,txt:r.txt}}
 else if(k=='history'){const r=scHistory(c);f={src:k,k:r.k,txt:r.txt}}
 else{const e=c.ev.find(x=>!x.found&&(x.src==k||(k=='wait'&&Math.random()<.5)))||null;if(e){e.found=1;f={src:k,k:e.k,txt:SC_EV[e.src][e.k]}}else f={src:k,k:'none',txt:['No new information came out of this.','ยังไม่ได้ข้อมูลใหม่จากการดำเนินการนี้']}}
 c.found=c.found||[];c.found.push({...f,d:S.day});c.hist.push({d:S.day,e:'finding',k:f.k,src:k});if(c.st=='investigating'||c.st=='developing')scStatus(c,'awaiting');
 if(typeof nwNotifyCase=='function')nwNotifyCase(c,nwT(['Investigation update','ความคืบหน้าการตรวจสอบ']))}
// what the player can conclude from the findings (never the hidden truth itself)
function scKnow(c){const F=(c.found||[]),sup=F.filter(f=>f.k=='sup').length,con=F.filter(f=>f.k=='con').length,amb=F.filter(f=>f.k=='amb').length;
 const lean=!F.length?'none':sup>=2&&!con?'sup':con>=2&&!sup?'con':sup&&con?'conf':sup>con?'wsup':con>sup?'wcon':'weak';
 const out={none:['No investigation yet','ยังไม่ได้ตรวจสอบ'],sup:['Evidence supports the allegation','หลักฐานสนับสนุนข้อกล่าวหา'],con:['Evidence contradicts the allegation','หลักฐานหักล้างข้อกล่าวหา'],conf:['Conflicting evidence — partly supports, partly contradicts','หลักฐานขัดแย้งกัน มีทั้งส่วนที่สนับสนุนและหักล้าง'],wsup:['Evidence partially supports the allegation','หลักฐานสนับสนุนข้อกล่าวหาบางส่วน'],wcon:['Evidence leans against the allegation (not conclusive)','หลักฐานค่อนไปทางหักล้าง แต่ยังไม่ชี้ขาด'],weak:['Insufficient evidence — inconclusive','หลักฐานไม่เพียงพอ ยังสรุปไม่ได้']}[lean];return{sup,con,amb,lean,out}}
// ---- responses (all chosen by the player; each has conditions) ------------------------------------------------------------------
const SC_RESP={
 deny:{g:'pr',n:['Official statement: deny the report','แถลงการณ์: ปฏิเสธรายงาน'],ok:(c,K)=>!['sup','wsup'].includes(K.lean)&&K.sup==0,why:['Not available: your own findings support the report.','ทำไม่ได้: ผลการตรวจสอบของคุณสนับสนุนรายงาน']},
 clarify:{g:'pr',n:['Official statement: clarify the misunderstanding','แถลงการณ์: ชี้แจงความเข้าใจผิด'],ok:(c,K)=>K.con+K.amb>=1,why:['Needs at least one finding that contradicts or questions the report.','ต้องมีผลการตรวจสอบอย่างน้อยหนึ่งข้อที่หักล้างหรือทำให้รายงานน่าสงสัย']},
 ack:{g:'pr',n:['Official statement: acknowledge the facts','แถลงการณ์: ยอมรับข้อเท็จจริง'],ok:(c,K)=>K.sup>=1,why:['Needs findings that support the report.','ต้องมีผลการตรวจสอบที่สนับสนุนรายงาน']},
 apology:{g:'pr',n:['Public apology','ออกมาขอโทษต่อสาธารณะ'],ok:(c,K)=>K.sup>=1&&c.sev>=2,why:['Only appropriate when the findings support a significant issue.','เหมาะสมเฉพาะเมื่อผลการตรวจสอบยืนยันว่าเป็นเรื่องที่มีนัยสำคัญ']},
 gstate:{g:'pr',n:['Group statement','แถลงการณ์ในนามวง'],ok:(c,K)=>c.sev>=2||c.mids.length>1,why:['Reserved for larger stories or stories involving several members.','ใช้สำหรับเรื่องใหญ่หรือเรื่องที่เกี่ยวข้องกับเมมเบอร์หลายคน']},
 mstate:{g:'pr',n:['Let the member make her own statement','ให้เมมเบอร์ออกมาชี้แจงด้วยตัวเอง'],ok:(c,K)=>!!c.inv.meet,why:['Meet the member privately first.','ต้องพูดคุยกับเมมเบอร์เป็นการส่วนตัวก่อน']},
 correct:{g:'pr',n:['Request a correction from the outlet','ขอให้สื่อแก้ไขข่าว'],ok:(c,K)=>K.con>=2&&K.sup==0,why:['Needs at least two findings that contradict the report.','ต้องมีผลการตรวจสอบที่หักล้างรายงานอย่างน้อยสองข้อ']},
 warn:{g:'mgmt',n:['Give the member a warning','ตักเตือนเมมเบอร์'],ok:(c,K)=>K.sup>=1,why:['Needs findings that support the report.','ต้องมีผลการตรวจสอบที่สนับสนุนรายงาน']},
 explain:{g:'mgmt',n:['Require an internal explanation','ขอคำอธิบายภายใน'],ok:()=>true},
 suspend:{g:'mgmt',n:['Suspend the member from work (14 days)','พักงานเมมเบอร์ชั่วคราว (14 วัน)'],ok:(c,K)=>K.lean=='sup'&&c.sev>=3,why:['Needs strong supporting evidence and a Major or more severe case.','ต้องมีหลักฐานสนับสนุนที่ชัดเจน และเป็นกรณีระดับใหญ่ขึ้นไป']},
 penalty:{g:'mgmt',n:['Apply a company-rule penalty','ลงโทษตามกฎบริษัท'],ok:(c,K)=>K.lean=='sup'&&['rule','professional'].includes(c.cat),why:['Only for a rule or professional breach supported by evidence.','ใช้ได้เฉพาะกรณีละเมิดกฎหรือความเป็นมืออาชีพที่มีหลักฐานยืนยัน']},
 nodisc:{g:'mgmt',n:['Take no disciplinary action','ไม่ลงโทษทางวินัย'],ok:()=>true},
 monitor:{g:'wait',n:['Wait and monitor public reaction','รอดูและติดตามกระแสสังคม'],ok:()=>true},
 close:{g:'wait',n:['Close the matter','ปิดเรื่อง'],ok:(c,K)=>(c.sev<=2&&S.day-c.day>=7)||c.dec.some(d=>d.pub)||K.lean=='con',why:['Close after responding, after clearing it up, or for a minor story after a week.','ปิดเรื่องได้หลังมีการชี้แจงแล้ว หลังข้อสงสัยคลี่คลาย หรือเมื่อเป็นเรื่องเล็กที่ผ่านไปแล้วหนึ่งสัปดาห์']}};
function scRespond(id,k){const c=scGet(id),R=SC_RESP[k];if(!c||!R||['resolved','archived'].includes(c.st))return;const K=scKnow(c);if(!R.ok(c,K))return toast(nwT(R.why||['Not available.','ไม่สามารถทำได้']),'err');
 if(c.dec.some(d=>d.k==k)&&!['monitor','explain'].includes(k))return toast(nwT(['Already done for this case.','ดำเนินการไปแล้วสำหรับกรณีนี้']),'err');
 const T=c.truth,mid=c.mids[0],m=get(mid),n=nwNm(mid),nT=n,pub=R.g=='pr',C=S.co||'the agency';c.dec.push({d:S.day,k,pub,know:K.lean});c.hist.push({d:S.day,e:'decision',k});
 const fx={},art=(o)=>scArticle(c,{st:'responded',...o});let sent='neu',en=null,th=null,img=null;
 const good=T=='false'||(T=='unk'&&Math.random()<.5);
 switch(k){
  case'deny':Object.assign(fx,good?{trust:2,mrep:[[mid,2]],pop:[[mid,.3]]}:{trust:.5});sent=good?'pos':'mix';if(T=='true'||(T=='partial'&&Math.random()<.5))c.sched.push({day:S.day+5+Math.floor(Math.random()*7),k:'exposed'});
   en={h:`${C} denies report about ${n}`,s:'The agency says the report is not accurate.',b:`${C} issued an official statement denying the report about ${n}, saying it “does not reflect the facts” and asking the public not to spread unverified claims.`};
   th={h:`${C} ออกแถลงการณ์ปฏิเสธข่าว ${nT}`,s:'ต้นสังกัดยืนยันว่ารายงานไม่ถูกต้อง',b:`${C} ออกแถลงการณ์อย่างเป็นทางการปฏิเสธรายงานเกี่ยวกับ ${nT} โดยระบุว่า “เนื้อหาดังกล่าวไม่ตรงกับข้อเท็จจริง” พร้อมขอความร่วมมือสาธารณชนงดส่งต่อข้อมูลที่ยังไม่ได้รับการยืนยัน`};break;
  case'clarify':Object.assign(fx,T=='true'?{trust:-1}:{trust:1.5,mrep:[[mid,1.5]]});sent=T=='true'?'mix':'pos';
   en={h:`${C} clarifies the situation around ${n}`,s:'The agency explains what actually happened.',b:`${C} published a clarification about the report involving ${n}, explaining the circumstances and correcting points it says were misunderstood.`};
   th={h:`${C} ออกมาชี้แจงกรณีของ ${nT}`,s:'ต้นสังกัดอธิบายข้อเท็จจริงที่เกิดขึ้น',b:`${C} ออกคำชี้แจงต่อรายงานที่เกี่ยวข้องกับ ${nT} โดยอธิบายบริบทของเหตุการณ์และแก้ไขประเด็นที่ระบุว่าเกิดความเข้าใจคลาดเคลื่อน`};break;
  case'ack':Object.assign(fx,T=='false'?{mrep:[[mid,-4]],trust:-.5}:{trust:2,mrep:[[mid,-1]],matt:[[mid,-6]]});sent=T=='false'?'neg':'mix';
   en={h:`${C} acknowledges report about ${n}`,s:'The agency confirms the facts and outlines next steps.',b:`${C} acknowledged the facts behind the report involving ${n} and said it is discussing the matter with her directly.`};
   th={h:`${C} ยอมรับข้อเท็จจริงกรณี ${nT}`,s:'ต้นสังกัดยืนยันข้อเท็จจริงพร้อมแจ้งแนวทางต่อจากนี้',b:`${C} ออกมายอมรับข้อเท็จจริงเบื้องหลังรายงานที่เกี่ยวข้องกับ ${nT} และระบุว่ากำลังพูดคุยเรื่องนี้กับเธอโดยตรง`};break;
  case'apology':Object.assign(fx,T=='false'?{mrep:[[mid,-5]],trust:-1}:{trust:3,crep:1,mrep:[[mid,-2]],matt:[[mid,-8]]});sent=T=='false'?'neg':'mix';
   en={h:`${n} and ${C} apologise`,s:'A formal apology is issued to fans and the public.',b:`${C} issued a formal apology on behalf of ${n}, thanking fans for their patience and promising to take the matter seriously.`};
   th={h:`${nT} และ${C} ออกมาขอโทษ`,s:'ออกคำขอโทษอย่างเป็นทางการถึงแฟน ๆ และสาธารณชน',b:`${C} ออกคำขอโทษอย่างเป็นทางการในนามของ ${nT} พร้อมขอบคุณแฟน ๆ ที่อดทนรอ และให้คำมั่นว่าจะดูแลเรื่องนี้อย่างจริงจัง`};break;
  case'gstate':Object.assign(fx,c.sev>=3?{trust:1}:{});sent='neu';
   en={h:`${nwGn(c.gid)} issues a statement`,s:'The group addresses the recent reports.',b:`${nwGn(c.gid)} released a group statement about the recent reports, asking fans to keep supporting all members while the situation is handled.`};
   th={h:`${nwGn(c.gid)} ออกแถลงการณ์ในนามวง`,s:'วงออกมาพูดถึงกระแสข่าวที่เกิดขึ้น',b:`${nwGn(c.gid)} ออกแถลงการณ์ในนามวงเกี่ยวกับกระแสข่าวล่าสุด พร้อมขอให้แฟน ๆ ส่งกำลังใจให้เมมเบอร์ทุกคนในระหว่างที่ทางวงจัดการเรื่องนี้`};break;
  case'mstate':Object.assign(fx,T=='true'?{mrep:[[mid,.5]],trust:1}:{mrep:[[mid,2.5]],pop:[[mid,.6]]});sent=T=='true'?'mix':'pos';
   en={h:`${n} speaks out`,s:'The member addresses fans in her own words.',b:T=='true'?`In her own words, ${n} said: “I understand why people are disappointed. I want to reflect on this honestly and earn back your trust.”`:`In her own words, ${n} said: “I was surprised by the report. I want my fans to know the truth, and I'm grateful for everyone who believed in me.”`};
   th={h:`${nT} ออกมาพูดด้วยตัวเอง`,s:'เมมเบอร์สื่อสารกับแฟน ๆ ด้วยคำพูดของเธอเอง',b:T=='true'?`${nT} กล่าวว่า “เข้าใจดีค่ะว่าทำไมทุกคนถึงผิดหวัง หนูอยากทบทวนตัวเองอย่างจริงใจ และจะพยายามเรียกความเชื่อมั่นจากทุกคนกลับมาให้ได้”`:`${nT} กล่าวว่า “ตกใจกับข่าวนี้มากค่ะ อยากให้แฟน ๆ ได้รู้ความจริง และขอบคุณทุกคนที่เชื่อใจหนูมาตลอด”`};break;
  case'correct':Object.assign(fx,{trust:2,mrep:[[mid,4]],pop:[[mid,.6]]});sent='pos';const o=NW_OUT[(nwGet(c.arts[0])||{}).out]||NW_OUT.scoop;
   en={h:`${nwT([o.n[0],o.n[0]])} corrects its report on ${n}`,s:'The outlet withdraws the claims after the agency’s request.',b:`Following a correction request from ${C}, the outlet that first published the story has corrected its report on ${n}, acknowledging that the claims could not be supported.`};
   th={h:`${o.n[1]} แก้ไขข่าวเกี่ยวกับ ${nT}`,s:'สื่อถอนเนื้อหาหลังต้นสังกัดขอให้แก้ไข',b:`หลังจาก${C}ยื่นขอให้แก้ไขข่าว สื่อที่เผยแพร่เรื่องนี้เป็นรายแรกได้แก้ไขรายงานเกี่ยวกับ ${nT} แล้ว พร้อมยอมรับว่าข้อกล่าวอ้างดังกล่าวไม่มีหลักฐานรองรับ`};c.final={truth:'false'};break;
  case'warn':if(m&&T=='false'&&typeof wlAdj=='function')wlAdj(m,{mh:-6},'Warned over a story that was not true');Object.assign(fx,T=='false'?{eng:[mid,-1]}:{trust:.5});c.disc.push({d:S.day,k:'warning'});break;
  case'explain':c.disc.push({d:S.day,k:'internal explanation'});const e=c.ev.find(x=>!x.found&&x.src=='meet')||c.ev.find(x=>!x.found);if(e){e.found=1;c.found=c.found||[];c.found.push({src:'meet',k:e.k,txt:SC_EV[e.src][e.k],d:S.day})}break;
  case'suspend':if(m){const w=wlOf(m);if(!w.leave){w.leave={type:'susp',causes:[],start:S.day,ret:S.day+14,susp:c.id};if(typeof hev=='function')hev(m,{t:'suspend',why:c.id})}if(typeof wlAdj=='function')wlAdj(m,{mh:T=='false'?-12:-5},'Suspended')}Object.assign(fx,T=='false'?{trust:-2,eng:[mid,-3],mrep:[[mid,-3]]}:{trust:3,crep:1,pop:[[mid,-.8]]});c.disc.push({d:S.day,k:'suspension 14 days'});sent=T=='false'?'neg':'mix';
   en={h:`${n} suspended from activities`,s:'The agency announces a temporary suspension.',b:`${C} announced that ${n} will step back from activities for two weeks while the matter is addressed.`};th={h:`${nT} ถูกพักกิจกรรมชั่วคราว`,s:'ต้นสังกัดประกาศพักกิจกรรมชั่วคราว',b:`${C} ประกาศให้ ${nT} พักกิจกรรมเป็นเวลาสองสัปดาห์ ในระหว่างที่ดำเนินการแก้ไขปัญหาดังกล่าว`};break;
  case'penalty':Object.assign(fx,{trust:1.5,mrep:[[mid,-1]]});c.disc.push({d:S.day,k:'company-rule penalty'});if(m&&typeof wlAdj=='function')wlAdj(m,{mh:-4},'Company penalty');break;
  case'nodisc':c.disc.push({d:S.day,k:'no disciplinary action'});if(T=='true'&&c.sev>=3)Object.assign(fx,{trust:-1});break;
  case'monitor':if(c.sev<=2&&T!='true')Object.assign(fx,{matt:c.mids.map(id=>[id,-5])});else if(c.sev>=3)c.sched.push({day:S.day+3,k:'pressure'});break;
  case'close':scStatus(c,'resolved');c.resDay=S.day;c.final=c.final||{truth:'unk'};c.res=nwT2(...(K.lean=='con'?['Closed after the report was contradicted.','ปิดเรื่องหลังรายงานถูกหักล้าง']:K.lean=='sup'?['Closed after the issue was addressed.','ปิดเรื่องหลังจัดการปัญหาแล้ว']:['Closed without a definitive conclusion.','ปิดเรื่องโดยยังไม่มีข้อสรุปชี้ขาด']));c.hist.push({d:S.day,e:'resolved'});scArticle(c,{sent:'neu',att:12,imp:1,st:'resolved',en:{h:`Story about ${n} winds down`,s:nwT2(...[c.res.en,c.res.en]).en,b:`The story involving ${n} has quietened down. ${c.res.en}`},th:{h:`กระแสข่าว ${nT} เริ่มซาลง`,s:c.res.th,b:`เรื่องราวที่เกี่ยวข้องกับ ${nT} เริ่มเงียบลงแล้ว ${c.res.th}`}});render();return}
 if(en){const a=art({sent,att:24+c.sev*5,imp:Math.max(2,c.sev),fx,en,th,img});c.stmt.push({d:S.day,k,a:a&&a.id});scStatus(c,'responded');c.sched.push({day:S.day+1+Math.floor(Math.random()*2),k:'reaction',resp:k})}
 else if(Object.keys(fx).length){const pseudo={id:'x',fx,fxDone:0,hist:[]};nwApply(pseudo);c.fx.push({d:S.day,k,fx})}
 render()}
// developments after a response (public reaction, exposure of a false denial, pressure)
function scFollow(c,s){const mid=c.mids[0],n=nwNm(mid),nT=n,T=c.truth;
 if(s.k=='reaction'){const pos=['correct','mstate','clarify','deny'].includes(s.resp)&&T!='true'||['ack','apology'].includes(s.resp)&&T!='false';c.reac=scReaction(c,pos?1:T=='true'&&s.resp=='deny'?-1:0);
  scArticle(c,{sent:pos?'pos':'mix',att:20+c.sev*4,imp:2,st:'reaction',fx:pos?{trust:.5,mrep:[[mid,.5]]}:{},
   en:{h:pos?`Fans rally behind ${n}`:`Reactions divided after the statement on ${n}`,s:pos?'Supportive messages outnumber criticism.':'Some accept the explanation; others want more.',b:pos?`After the latest statement, messages of support for ${n} have outnumbered criticism. Many fans say they are relieved and want to move on.`:`Reactions to the statement on ${n} are divided: long-time fans largely accepted it, while parts of the general public still have questions.`},
   th:{h:pos?`แฟน ๆ แห่ส่งกำลังใจให้ ${nT}`:`กระแสตอบรับแบ่งเป็นสองฝั่งหลังแถลงการณ์กรณี ${nT}`,s:pos?'ข้อความให้กำลังใจมีมากกว่าคำวิจารณ์':'บางส่วนยอมรับคำชี้แจง ขณะที่อีกฝ่ายยังต้องการคำตอบเพิ่ม',b:pos?`หลังแถลงการณ์ล่าสุด ข้อความให้กำลังใจ ${nT} มีมากกว่าเสียงวิจารณ์อย่างเห็นได้ชัด แฟนหลายคนบอกว่ารู้สึกโล่งใจและอยากให้ทุกอย่างผ่านพ้นไป`:`เสียงตอบรับต่อแถลงการณ์กรณี ${nT} แบ่งเป็นสองฝั่ง แฟนคลับที่ติดตามมานานส่วนใหญ่ยอมรับคำชี้แจง ขณะที่สังคมบางส่วนยังมีคำถามค้างคาใจ`}});scStatus(c,'reaction')}
 if(s.k=='exposed'){c.final={truth:T};scArticle(c,{sent:'neg',att:55+c.sev*6,imp:Math.min(5,c.sev+1),st:'updated',truth:T=='true'?'true':'partial',fx:{trust:-5,crep:-3,mrep:[[mid,-6]],matt:[[mid,12]]},
   en:{h:`New evidence contradicts denial over ${n}`,s:'The earlier denial is now in question.',b:`New material has emerged that contradicts the agency's earlier denial regarding ${n}. Critics say the response has damaged public trust.`},
   th:{h:`หลักฐานใหม่ขัดแย้งกับคำปฏิเสธกรณี ${nT}`,s:'คำปฏิเสธก่อนหน้านี้ถูกตั้งคำถาม',b:`มีหลักฐานใหม่ปรากฏขึ้นซึ่งขัดแย้งกับคำปฏิเสธของต้นสังกัดก่อนหน้านี้กรณี ${nT} นักวิจารณ์มองว่าการรับมือครั้งนี้ทำให้ความเชื่อมั่นของสาธารณชนลดลง`}});scStatus(c,'updated')}
 if(s.k=='pressure'&&!['resolved','archived'].includes(c.st))scPressure(c)}
// suspension label in the existing leave banner
if(typeof WLT!='undefined')WLT.susp='Suspension (crisis decision)';
