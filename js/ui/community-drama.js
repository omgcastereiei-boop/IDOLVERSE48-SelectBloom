// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Fan Community: Fandom Drama & Fan Wars
// -------------------------------------------------------------------------------------
//  · Part of the Fan Community: a drama is a normal community thread (post + replies, cat 'drama') whose replies come
//    from several accounts on different sides: A (defends / one side), B (the other side), N (neutral), C (calming).
//  · Seeds only from real, public events: an announced Senbatsu (Center war, Senbatsu dispute, generation / team
//    balance, sister-group members in a Main Group lineup, the same Center again → management backlash), a released
//    title song in a new genre (song debate), election results (election dispute, close rivals), theater unit pairs
//    (member-combination debate). Nothing personal: only opinions about lineups, songs, performances and chances.
//  · Escalation: heat from topic importance × fandom size × how many fans the members have × daily engagement,
//    decaying every day. Level 1 Minor Disagreement · 2 Growing Argument · 3 Fan War · 4 Major Backlash
//    (level 4 only for big fandoms and lineup / management topics). Most threads fade at level 1–2.
//  · Opinions change only with real new information (strong first-week sales, MV view milestones).
//  · Anti-repetition: the same conflict (category + subjects) waits 30 days; every line has a cool-down and is checked
//    against recent text; a line is used once per thread; accounts post at most twice in a thread.
//  · Impact: engagement / discussion volume / fandom mood / management perception are recorded; popularity gets at most
//    a small awareness bump (+0.15, once per 30 days per member) for level 3+; never fan counts, never penalties.
// =====================================================================================
const CD_LV={1:['Minor Disagreement','เห็นต่างเล็กน้อย'],2:['Growing Argument','เริ่มเถียงกัน'],3:['Fan War','สงครามด้อม'],4:['Major Backlash','ดราม่าใหญ่']};
const CD_CAT={center:['Center War','ศึกเซ็นเตอร์'],sen:['Senbatsu Dispute','ดราม่าเซ็มบัตสึ'],gen:['Generation Debate','ศึกรุ่น'],team:['Team Rivalry','ศึกทีม'],sis:['Sister Group Debate','ดราม่าวงพี่วงน้อง'],song:['Song & Concept Debate','ถกเรื่องเพลง'],ge:['Election Dispute','ดราม่าเลือกตั้ง'],oshi:['Oshi Rivalry','ศึกโอชิ'],mgmt:['Management Backlash','ดราม่าการบริหาร'],ship:['Combination Debate','ถกเรื่องคู่']};
// lines: root (opens the thread) · A · B · N (neutral) · ch (changed mind after new facts)
const CD_L={
 center:{root:{en:["Unpopular take: {b} would've been a better center for {t} than {a}","Can we talk about {a} getting center over {b}? Genuinely asking","{a} is center and {b} is still waiting. Make it make sense"],th:["ขอพูดตรงๆ นะ เซ็นเตอร์ {t} ถ้าเป็น {b} น่าจะเหมาะกว่า {a}","ทำไมต้องเป็น {a} อีกแล้วอะ {b} รอมานานแค่ไหนแล้ว","{a} ได้เซ็นเตอร์ ส่วน {b} ยังต้องรอต่อ ใครอธิบายที"]},
  A:{en:["{a} carried the last lineups and the numbers back it up","She earned it. Watch her theater shows before judging","Center isn't a reward for waiting, it's about who can lead the song"],th:["{a} แบกซิงก่อนๆ มาตลอด ยอดก็เห็นๆ อยู่","น้องได้มาเพราะผลงาน ไปดูเธียเตอร์ก่อนค่อยตัดสินนะ","เซ็นเตอร์ไม่ใช่รางวัลของคนรอนาน แต่คือคนที่นำเพลงได้"]},
  B:{en:["Nobody's saying {a} is bad, but {b} deserves one chance too","{b} fans have been patient for so long. Being upset is fair","If not now, when? {b} is at her peak right now"],th:["ไม่มีใครบอกว่า {a} ไม่ดี แต่ {b} ก็ควรได้โอกาสบ้าง","แฟน {b} รอกันมานานมากแล้ว จะน้อยใจก็ไม่แปลก","ถ้าไม่ใช่ตอนนี้แล้วจะเมื่อไหร่ {b} กำลังพีคเลยนะ"]},
  N:{en:["Honestly both of them fit, just in different ways","Can we wait for the MV before fighting about this?"],th:["จริงๆ ทั้งสองคนก็เหมาะคนละแบบนะ","รอดู MV ก่อนค่อยเถียงกันได้ไหม"]},
  ch:{en:["Okay, I'll admit it. {t} did great and {a} led it well. I was wrong","After seeing how {t} did, I take back what I said about {a}"],th:["โอเค ยอมรับก็ได้ {t} ออกมาดีจริง {a} นำได้ดี เราคิดผิดเอง","เห็นผลงาน {t} แล้ว ขอถอนคำพูดเรื่อง {a} นะ"]}},
 sen:{root:{en:["How is {a} out of the {t} senbatsu while {b} is in? Not hating, just confused","{a} missed the senbatsu again. I don't understand the criteria anymore"],th:["ทำไม {a} หลุดเซ็ม {t} แต่ {b} ได้ติดอะ ไม่ได้แซะนะ แค่งง","{a} ไม่ติดเซ็มอีกแล้ว ไม่เข้าใจเกณฑ์จริงๆ"]},
  A:{en:["{a} has been working so hard. She deserved that spot","Her handshake lines alone should have secured it"],th:["{a} ขยันขนาดนั้น สมควรได้ที่นั่นแหละ","แค่แถวจับมือของ {a} ก็น่าจะพอให้ติดแล้วนะ"]},
  B:{en:["{b} earned her spot too. It's not her fault someone else missed out","Let newer members have chances, that's how a group grows"],th:["{b} ก็ได้มาเพราะผลงานนะ ไม่ใช่ความผิดน้องที่คนอื่นหลุด","ให้น้องใหม่ได้โอกาสบ้าง วงถึงจะโตได้"]},
  N:{en:["Senbatsu has limited spots. Someone always gets left out","Wait for the next single before panicking"],th:["ที่ในเซ็มมีจำกัด ยังไงก็ต้องมีคนหลุด","รอซิงหน้าก่อนค่อยโวยก็ได้"]},
  ch:{en:["Watched {b} in {t}. Okay, I get why she was picked"],th:["ดู {b} ใน {t} แล้ว โอเค เข้าใจละว่าทำไมได้ติด"]}},
 gen:{root:{en:["{k} members from the newest generation in senbatsu and the older gens keep losing spots. Thoughts?","Is it just me or is management pushing the new gen really hard this single?"],th:["รุ่นใหม่ติดเซ็มตั้ง {k} คน รุ่นพี่หลุดไปเรื่อยๆ คิดเห็นยังไงกันบ้าง","คิดไปเองไหม ซิงนี้ค่ายดันรุ่นใหม่หนักมาก"]},
  A:{en:["The older gens built this group. A little respect would be nice","{a} has years of experience and she sits this one out?"],th:["รุ่นพี่สร้างวงนี้มานะ ให้เกียรติกันหน่อย","{a} ประสบการณ์เยอะขนาดนั้นแต่ต้องนั่งดูซิงนี้เหรอ"]},
  B:{en:["Every gen was new once. {b} deserves her moment","Fresh faces bring new fans. That's good for everyone"],th:["ทุกรุ่นก็เคยเป็นรุ่นใหม่มาก่อน {b} ก็ควรได้มีช่วงเวลาของตัวเอง","หน้าใหม่ดึงแฟนใหม่เข้ามา ดีกับทุกคนนะ"]},
  N:{en:["A mix of both gens is the healthiest","Next single might swing the other way, it usually does"],th:["ผสมทั้งสองรุ่นแบบพอดีๆ แหละดีที่สุด","ซิงหน้าอาจจะกลับกันก็ได้ เป็นแบบนี้ตลอด"]},
  ch:{en:["Okay, the old and new gen parts in {t} actually blend well. Maybe I overreacted"],th:["โอเค พาร์ทรุ่นเก่ารุ่นใหม่ใน {t} เข้ากันดีจริง สงสัยเราคิดมากไปเอง"]}},
 team:{root:{en:["{tm} has {k} members in senbatsu, {tm2} has {k2}. Is that balanced?","Team favoritism is real this single. {tm2} fans, how are we feeling"],th:["{tm} ติดเซ็ม {k} คน {tm2} แค่ {k2} คน แบบนี้บาลานซ์ไหม","ซิงนี้ค่ายเทให้ทีมเดียวชัดๆ แฟน {tm2} รู้สึกยังไงกันบ้าง"]},
  A:{en:["{tm} has been putting on the best theater shows lately. It shows","Spots go to performance, not team quotas"],th:["{tm} ทำเธียเตอร์ดีที่สุดช่วงนี้ ก็เห็นผลแหละ","ที่ในเซ็มให้ตามผลงาน ไม่ได้แบ่งโควตาทีมนะ"]},
  B:{en:["{tm2} works just as hard. They need more exposure","Every team should get a fair shot at the title track"],th:["{tm2} ก็ขยันไม่แพ้กัน ควรได้ออกสื่อมากกว่านี้","ทุกทีมควรได้โอกาสในเพลงหลักเท่าๆ กัน"]},
  N:{en:["Team counts change every single, give it time"],th:["จำนวนคนแต่ละทีมเปลี่ยนทุกซิงอยู่แล้ว รอดูไปก่อน"]},ch:{en:[],th:[]}},
 sis:{root:{en:["{a} from {g2} is in the {g} senbatsu while {b} is out. Main group fans, thoughts?","Why are {g2} members taking {g} title track spots?"],th:["{a} จาก {g2} ได้ติดเซ็ม {g} แต่ {b} หลุด แฟนวงหลักว่ายังไงกันบ้าง","ทำไมเมมวง {g2} มาได้ที่ในเพลงหลักของ {g} อะ"]},
  A:{en:["{a} earned it. The sister groups are part of the same family","{g2} fans finally get to see her on a big stage, let us have this"],th:["{a} ได้มาด้วยผลงาน วงน้องก็ครอบครัวเดียวกันนะ","แฟน {g2} เพิ่งได้เห็นน้องบนเวทีใหญ่ ปล่อยให้ดีใจหน่อยเถอะ"]},
  B:{en:["Nothing against {a}, but shouldn't {g} members come first in {g} singles?","{b} lost her spot to a sister group member. That's hard to accept"],th:["ไม่ได้ว่า {a} นะ แต่ซิงของ {g} ควรให้เมม {g} ก่อนไหม","{b} เสียที่ให้เมมวงน้อง ทำใจยากอยู่นะ"]},
  N:{en:["Cross-group lineups bring both fanbases together. That's the point","Same company, same goal. Let's not split into camps"],th:["ไลน์อัปข้ามวงทำให้แฟนสองวงได้รู้จักกัน นี่แหละประเด็น","บริษัทเดียวกัน เป้าหมายเดียวกัน อย่าแบ่งฝั่งกันเลย"]},
  ch:{en:["Okay, {a} fit into {t} perfectly. Welcome to the {g} fandom too"],th:["โอเค {a} เข้ากับ {t} ได้ดีมาก ยินดีต้อนรับสู่ด้อม {g} ด้วยนะ"]}},
 song:{root:{en:["Is {gen} really the right direction for {g}? {s} doesn't sound like us","{s} is fine, but it doesn't feel like a {g} title track"],th:["แนว {gen} ใช่ทางของ {g} จริงเหรอ {s} ไม่เหมือนวงเราเลย","{s} ก็ดีนะ แต่ไม่ค่อยมีความเป็นเพลงหลักของ {g}"]},
  A:{en:["Groups need to evolve. {s} is a smart risk","Give it a week. {s} grows on you"],th:["วงก็ต้องเปลี่ยนบ้าง {s} เป็นการเสี่ยงที่ฉลาดนะ","ให้เวลามันสักอาทิตย์ {s} ยิ่งฟังยิ่งติด"]},
  B:{en:["The classic {g} sound is why I became a fan","I miss the old {g} style, honestly"],th:["ที่ติ่ง {g} ก็เพราะแนวเพลงแบบเดิมนี่แหละ","คิดถึงสไตล์ {g} แบบเดิมๆ จริงๆ นะ"]},
  N:{en:["Taste is taste. Both opinions can be true"],th:["เรื่องเพลงเห็นต่างกันได้ ไม่ต้องตีกันนะ"]},
  ch:{en:["{s} passed {n} views. Fine, it works. I'm converted"],th:["{s} ทะลุ {n} วิวแล้ว โอเค ยอมแพ้ ติดเพลงนี้แล้ว"]}},
 ge:{root:{en:["{a} at #{r} and {b} at #{r2}... I really thought it would be the other way around","Hot take: {b} deserved a higher rank than {a} this year"],th:["{a} อันดับ {r} แต่ {b} ได้ {r2} นึกว่าจะสลับกันซะอีก","ขอพูดตรงๆ ปีนี้ {b} ควรได้อันดับสูงกว่า {a} นะ"]},
  A:{en:["{a}'s fans put in the work. That's how elections go","Her support grew all year, this was coming"],th:["แฟน {a} ทุ่มเทจริง การเลือกตั้งก็เป็นแบบนี้แหละ","ฐานแฟน {a} โตมาทั้งปี ก็ไม่แปลกที่ได้อันดับนี้"]},
  B:{en:["{b} fans, don't give up. Next time is ours","Rankings aren't everything. {b} is still my favorite performer"],th:["แฟน {b} อย่าเพิ่งท้อ รอบหน้าเอาใหม่","อันดับไม่ใช่ทุกอย่าง {b} ยังเป็นคนที่แสดงดีที่สุดสำหรับเรา"]},
  N:{en:["Congrats to everyone who ranked. Let's not tear each other down"],th:["ยินดีกับทุกคนที่ติดอันดับ อย่ามาเหยียบกันเลย"]},ch:{en:[],th:[]}},
 oshi:{root:{en:["{a} and {b} only {k} votes apart. This rivalry is getting intense","{a} fans vs {b} fans, round two starts now"],th:["{a} กับ {b} คะแนนห่างกันแค่ {k} โหวต ฟาดกันสนุกแล้ว","แฟน {a} กับแฟน {b} ยกสองเริ่มแล้ว"]},
  A:{en:["{a} won it fair and square. Respect the result"],th:["{a} ชนะแบบใสสะอาด ยอมรับผลกันหน่อย"]},
  B:{en:["{b} was this close. Next time we close the gap"],th:["{b} ห่างแค่นิดเดียว รอบหน้าแซงแน่"]},
  N:{en:["Both of them did amazing. Healthy competition makes both better"],th:["ทั้งสองคนทำได้ดีมาก แข่งกันแบบนี้ดีต่อทั้งคู่"]},ch:{en:[],th:[]}},
 mgmt:{root:{en:["{k} singles in a row with the same center. Does management even look at the rest of the group?","Management needs to explain this lineup. Fans notice these things"],th:["เซ็นเตอร์คนเดิม {k} ซิงติด ค่ายเคยมองคนอื่นในวงบ้างไหม","ค่ายช่วยอธิบายไลน์อัปนี้หน่อย แฟนเขาสังเกตกันนะ"]},
  A:{en:["Management has a long-term plan. One lineup doesn't tell the whole story","They see the sales data, we don't. Trust it a little"],th:["ค่ายมีแผนระยะยาว ไลน์อัปเดียวยังตัดสินอะไรไม่ได้","ค่ายเห็นยอดขายจริง เราไม่เห็น ลองเชื่อใจเขาหน่อย"]},
  B:{en:["Long-term plan or not, other members' fans are getting tired","This is how you lose fans quietly"],th:["แผนยาวหรือไม่ยาว แฟนเมมคนอื่นก็เหนื่อยนะ","แบบนี้แหละที่แฟนค่อยๆ หายไปเงียบๆ"]},
  N:{en:["Sending feedback is fine, just keep it respectful"],th:["ส่งฟีดแบ็กได้นะ แต่สุภาพกันหน่อย"]},
  ch:{en:["Okay, {t} sold well. Maybe management knew what they were doing"],th:["โอเค {t} ขายดีจริง สงสัยค่ายรู้ว่าทำอะไรอยู่"]}},
 ship:{root:{en:["{a} and {b} need a duet. Their chemistry in {st} is unreal","Is {a} with {b} the best pair in the group right now?"],th:["{a} กับ {b} ควรได้เพลงคู่ เคมีใน {st} ดีมาก","{a} คู่ {b} เป็นคู่ที่ดีที่สุดในวงตอนนี้ไหม"]},
  A:{en:["Their voices blend perfectly. It's not even close"],th:["เสียงสองคนเข้ากันมาก ไม่มีคู่ไหนสู้ได้"]},
  B:{en:["Hard disagree, {a} works better with a lower voice next to her","Cute pair, but I'd rather see {b} lead her own unit"],th:["ไม่เห็นด้วยเลย {a} เข้ากับคนเสียงต่ำกว่านี้มากกว่า","คู่นี้น่ารักแหละ แต่อยากเห็น {b} นำยูนิตของตัวเองมากกว่า"]},
  N:{en:["Every combination has its fans. That's the fun of theater units"],th:["ทุกคู่ก็มีแฟนของตัวเอง นี่แหละเสน่ห์ของยูนิตเธียเตอร์"]},ch:{en:[],th:[]}}};
const CD_CALM={en:["Can we all calm down a bit? It's one single","Disagreeing is fine. Insulting members is not","Not everything needs to be a war, everyone","Let's argue about the lineup, not the girls"],th:["ใจเย็นๆ กันก่อนนะ แค่ซิงเดียวเอง","เห็นต่างได้ แต่ด่าเมมเบอร์ไม่ได้นะ","ไม่ต้องทำทุกเรื่องให้เป็นสงครามก็ได้ทุกคน","เถียงเรื่องไลน์อัปได้ แต่อย่าไปลงที่น้องๆ"]};
const CD_ESC={en:["This thread is turning into a full fan war","Both sides need a breather, this is getting heated","The replies under this are wild"],th:["กระทู้นี้กลายเป็นสงครามด้อมไปแล้ว","ทั้งสองฝั่งพักหายใจกันก่อน เริ่มร้อนแรงแล้ว","รีพลายใต้โพสต์นี้ดุเดือดมาก"]};
const CD_ESC2={en:["Oh no, not these two fandoms again lol","Every time these two fandoms meet, the timeline catches fire"],th:["โอ๊ย สองด้อมนี้อีกแล้ว 555","สองด้อมนี้เจอกันทีไร ไทม์ไลน์ลุกเป็นไฟทุกที"]};
const CD_BIG={en:["Even casual fans are talking about this now. Management should say something","This is all over the timeline today"],th:["ขนาดแฟนจรยังพูดถึงเลย ค่ายควรออกมาพูดอะไรบ้าง","วันนี้เรื่องนี้เต็มไทม์ไลน์ไปหมด"]};
const CD_END={en:["Glad this calmed down. Back to supporting everyone","Good, everyone made up. Back to streaming"],th:["ดีที่จบกันด้วยดี กลับไปซัพทุกคนต่อ","ดีแล้วที่คืนดีกัน กลับไปสตรีมเพลงกันต่อ"]};
function cdS(){const C=cmS();if(!Array.isArray(C.dr))C.dr=[];C.drk=C.drk||{};C.mood=C.mood||{};if(!Array.isArray(C.mp))C.mp=[];C.drq=Array.isArray(C.drq)?C.drq:[];return C}
const cdNm=id=>{const m=get(id)||(S.alumni||[]).find(x=>x.id==id);return m?cmFirst(m):''};
function cdFans(id){const m=get(id);if(!m)return 0;try{return typeof fdSupFresh=='function'?fdSupFresh(m,'fans'):+m.fans||0}catch(e){return+m.fans||0}}
// ---- lines -------------------------------------------------------------------------------------------------------------------
function cdLine(d,key,arr,lang){const C=cdS();d.used=d.used||[];const free=arr.map((s,i)=>i).filter(i=>{const k=lang+':'+key+':'+i;return!d.used.includes(k)&&!(C.vc['cd:'+k]!=null&&S.day-C.vc['cd:'+k]<25)});if(!free.length)return null;const i=cmR(free);return{i,s:arr[i],k:lang+':'+key+':'+i}}
function cdText(d,part,acc){const L=part=='calm'?CD_CALM:part=='esc'?(['center','sis','oshi','team'].includes(d.cat)&&Math.random()<.5?CD_ESC2:CD_ESC):part=='big'?CD_BIG:part=='end'?CD_END:(CD_L[d.cat]||{})[part];if(!L||!L.en.length)return null;
 const e=cdLine(d,d.cat+part,L.en,'en'),t=cdLine(d,d.cat+part,L.th,'th');if(!e||!t)return null;
 const v={...d.v,a:d.a!=null?cdNm(d.a):'',b:d.b!=null?cdNm(d.b):''},nong=s=>s;const fill=(s,lang)=>s.replace(/\{(\w+)\}/g,(_,k)=>{let x=v[k];if(x==null)return'';if(lang=='th'&&acc&&acc.nong&&(k=='a'||k=='b')&&x)x='น้อง'+x;return String(x)});
 const en=fill(e.s,'en'),th=cmTh(fill(t.s,'th'));const C=cdS(),he=nwHash(en),ht=nwHash(th);if(C.fp.some(f=>f.he==he||f.ht==ht))return null;
 d.used.push(e.k,t.k);C.vc['cd:'+e.k]=S.day;C.vc['cd:'+t.k]=S.day;C.fp.push({d:S.day,i:'drama',mk:'dr|'+d.id+'|'+part+S.day+Math.random(),ev:d.src,tk:[],he,ht});if(C.fp.length>CM_FP)C.fp.splice(0,C.fp.length-CM_FP);return{en,th}}
// ---- who speaks --------------------------------------------------------------------------------------------------------------
function cdSide(d,a){if(d.cat=='sis')return a.gid==d.g2?'A':a.gid==d.gid?'B':'N';if(d.cat=='team'){const m=get(a.oshi);return m&&m.team==d.v.tm?'A':m&&m.team==d.v.tm2?'B':'N'}
 if(d.cat=='gen'){const m=get(a.oshi);return!m?'N':(m.gen||0)<d.gcut?'A':'B'}if(d.cat=='song'||d.cat=='mgmt')return a.st=='ana'||a.st=='vet'?(Math.random()<.5?'A':'B'):a.st=='salty'?'B':a.st=='soft'?'N':(a.oshi!=null&&a.oshi==d.a&&d.cat=='mgmt'?'A':Math.random()<.5?'A':'B');
 return a.oshi==d.a?'A':a.oshi==d.b?'B':'N'}
function cdPick(d,want){const L=[];(d.gids||[d.gid]).forEach(g=>cmAccs(g).forEach(a=>L.push(a)));d.cnt=d.cnt||{};
 const W=L.filter(a=>(d.cnt[a.id]||0)<2).map(a=>{const s=cdSide(d,a);let w=a.act;if(want=='C'){w*=a.st=='soft'||a.st=='ana'?3:a.st=='salty'?.1:1;if(s!='N')w*=.4}else if(want=='N'){w*=s=='N'?2:.4}else w*=s==want?4:(s=='N'?.15:.02);if(d.cnt[a.id])w*=.6;return[a,w]}).filter(x=>x[1]>0);return W.length?cmW(W):null}
// ---- seeds from real events ------------------------------------------------------------------------------------------------
function cdSeed(E){const C=cdS(),out=[];E.forEach(ev=>{try{
  if(ev.cat=='sen'){const g=grp(ev.gid),p=gsCtx(ev.gid,'pj'),so=gsCtx(ev.gid,'songs')||{},o=p&&so[p.mainId];if(!o||!g)return;const L=ev.L||[],H=ev.H||[],cen=(o.centers&&o.centers.length?o.centers:[o.center]).filter(v=>v!=null),M=cmGMembers(ev.gid).filter(m=>isAct(m)&&m.status!='trainee'),t=ev.v.t;
   const c=get(cen[0]);if(c){const riv=M.filter(m=>m.id!=c.id&&!cen.includes(m.id)&&m.pop>=c.pop*.85).sort((a,b)=>b.pop-a.pop)[0];if(riv)out.push({cat:'center',a:c.id,b:riv.id,imp:3,v:{t},src:ev.key});
    const k=cmStreakCen(H,c.id)+1;if(k>=3)out.push({cat:'mgmt',a:c.id,b:null,imp:3,v:{t,k},src:ev.key})}
   const ex=M.filter(m=>!L.includes(m.id)&&H.length&&cmIn(H[H.length-1],m.id)).sort((a,b)=>b.pop-a.pop)[0],nw=L.map(get).filter(m=>m&&!H.some(h=>cmIn(h,m.id))).sort((a,b)=>a.pop-b.pop)[0];if(ex&&nw)out.push({cat:'sen',a:ex.id,b:nw.id,imp:2,v:{t},src:ev.key});
   const gens=M.map(m=>m.gen||0),top=Math.max(...gens,0);if(top>1){const nG=L.map(get).filter(m=>m&&(m.gen||0)==top).length,old=M.filter(m=>(m.gen||0)<top&&!L.includes(m.id)&&H.length&&cmIn(H[H.length-1],m.id)).sort((a,b)=>b.pop-a.pop)[0];if(nG>=3&&old){const b=L.map(get).filter(m=>m&&(m.gen||0)==top).sort((a,b2)=>b2.pop-a.pop)[0];out.push({cat:'gen',a:old.id,b:b.id,imp:2,v:{t,k:nG},gcut:top,src:ev.key})}}
   const tc={};L.map(get).filter(m=>m&&gsGid(m)==ev.gid&&m.team).forEach(m=>tc[m.team]=(tc[m.team]||0)+1);const T=(g.teams||[]).map(x=>[x.name,tc[x.name]||0]).sort((a,b)=>b[1]-a[1]);if(T.length>=2&&T[0][1]-T[T.length-1][1]>=4)out.push({cat:'team',a:null,b:null,imp:2,v:{t,tm:T[0][0],k:T[0][1],tm2:T[T.length-1][0],k2:T[T.length-1][1]},src:ev.key,sk:T[0][0]+'|'+T[T.length-1][0]});
   const sis=L.map(get).filter(m=>m&&gsGid(m)!=ev.gid).sort((a,b)=>b.pop-a.pop)[0];if(sis&&ex){const g2=gsGid(sis);out.push({cat:'sis',a:sis.id,b:ex.id,imp:3,v:{t,g:g.name,g2:(grp(g2)||{}).name||''},g2,gids:[ev.gid,g2],src:ev.key})}}
  if(ev.cat=='rel'&&ev.its.some(i=>i.i=='genreNew')){const g=grp(ev.gid),gi=ev.its.find(i=>i.i=='genreNew');out.push({cat:'song',a:null,b:null,imp:2,v:{s:ev.v.s,t:ev.v.t,g:g?g.name:'',gen:gi.v.gen},src:ev.key,sk:ev.v.s})}
  if(ev.cat=='ge'){const e=((gsCtx(ev.gid,'ge')||{}).list||[]).find(z=>'ge:'+z.id==ev.key);const R=e&&e.final&&e.final.rows?e.final.rows.filter(r=>r.rank&&get(r.id)).sort((a,b)=>a.rank-b.rank):[];
   const sp=ev.its.find(i=>i.i=='geSurprise');if(sp){const r=R.find(x=>x.id==sp.sub),b=R.filter(x=>x.rank>r.rank).sort((x,y)=>get(y.id).pop-get(x.id).pop)[0];if(b)out.push({cat:'ge',a:r.id,b:b.id,imp:3,v:{r:r.rank,r2:b.rank},src:ev.key})}
   for(let i=0;i+1<Math.min(R.length,10);i++){const x=R[i],y=R[i+1],dv=(x.votes||0)-(y.votes||0);if(x.votes&&dv>=0&&dv<=Math.max(300,x.votes*.02)){out.push({cat:'oshi',a:x.id,b:y.id,imp:2,v:{k:dv.toLocaleString('en-US')},src:ev.key});break}}}
  if(ev.cat=='th'){const u=ev.its.find(i=>i.i=='thUnit');if(u)out.push({cat:'ship',a:u.v.m,b:u.v.m2,imp:1,v:{st:ev.v.st},src:ev.key})}}catch(e){console.error('drama seed',e)}});
 // at most one or two new dramas a day; the same conflict waits 30 days
 out.sort(()=>Math.random()-.5).sort((a,b)=>b.imp-a.imp);let n=0;out.forEach(s=>{if(n>=2)return;const key=s.cat+':'+(s.sk||[s.a,s.b].filter(v=>v!=null).sort().join('-'));if(C.drk[key]!=null&&S.day-C.drk[key]<30)return;if(s.cat=='ship'&&C.dr.some(d=>d.cat=='ship'&&S.day-d.d0<20))return;
  const gid=s.gid??(E.find(e=>e.key==s.src)||{}).gid;if(gid==null)return;if(C.dr.filter(d=>d.gid==gid&&d.st=='open').length>=3)return;const pr={center:.75,mgmt:.8,sen:.5,gen:.45,team:.45,sis:.7,song:.45,ge:.7,oshi:.5,ship:.12}[s.cat]||.4;if(Math.random()>pr)return;
  C.drk[key]=S.day;C.dr.push({id:'dr'+(++C.seq),key,cat:s.cat,gid,gids:s.gids||[gid],g2:s.g2,gcut:s.gcut,a:s.a,b:s.b,v:s.v,imp:s.imp,src:s.src,d0:S.day,dl:S.day,heat:0,lv:0,max:0,st:'new',post:null,cnt:{},side:{A:0,B:0,N:0,C:0},used:[]});n++})}
// ---- the daily life of a drama -----------------------------------------------------------------------------------------------
function cdReply(d,p,want,part){const a=cdPick(d,want);if(!a)return 0;const tx=cdText(d,part||want,a);if(!tx)return 0;d.cnt[a.id]=(d.cnt[a.id]||0)+1;a.last=S.day;
 const lk=Math.round((4+a.cl*2.5)*(.5+d.heat/40)*cmRnd(.5,1.5));p.rp.push({a:a.id,h:a.h,gid:a.gid,en:tx.en,th:tx.th,lk,d:S.day,hr:Math.min(23,Math.floor(cmRnd(9,23))),sd:want});d.side[want]=(d.side[want]||0)+1;return 1}
function cdLevel(d){const sc=cmScale(d.gid),big=sc>=.85&&['center','mgmt','sen','sis','ge'].includes(d.cat)&&d.imp>=3;let lv=d.heat<25?1:d.heat<50?2:d.heat<75?3:4;if(lv==4&&!big)lv=3;return Math.min(lv,d.imp<=1?2:d.imp==2?3:4)}
function cdDaily(){const C=cdS();
 // opinions change with real new information (first-week sales, MV milestones)
 C.drq.splice(0).forEach(q=>{C.dr.filter(d=>S.day-d.d0<=45&&d.post&&(d.cat=='song'?(q.s&&q.n&&d.v.s==q.s):(q.t&&d.v.t==q.t))&&!d.chd).forEach(d=>{const p=C.posts.find(x=>x.id==d.post);if(!p)return;if(d.cat=='song'&&q.n)d.v.n=q.n;if(cdReply(d,p,'B','ch')){d.chd=S.day;d.dl=S.day;p.d=Math.max(p.d,S.day-1)}})});
 C.dr.filter(d=>d.st=='new'||d.st=='open').forEach(d=>{const sc=cmScale(d.gid),stake=d.a!=null||d.b!=null?Math.min(1.6,.6+((cdFans(d.a)+cdFans(d.b))/2)/Math.max(1,(S.fans||1)/40)):1;
  if(d.st=='new'){d.heat=Math.min(70,(10+d.imp*7)*sc*stake*cmRnd(.6,1.4));d.st='open';
   const a=cdPick(d,d.cat=='song'||d.cat=='mgmt'||d.cat=='team'||d.cat=='gen'?'B':d.cat=='sis'?'B':'B')||cdPick(d,'N');if(!a){d.st='faded';return}const tx=cdText(d,'root',a);if(!tx){d.st='faded';return}d.cnt[a.id]=1;a.last=S.day;
   const p={id:'cp'+(++C.seq),d:S.day,hr:Math.floor(cmRnd(9,22)),gid:d.gid,a:a.id,h:a.h,ag:a.gid,i:'drama',cat:'drama',imp:d.imp,en:tx.en,th:tx.th,tone:'n',tag:null,top:'dr:'+d.id,lb:{en:CD_CAT[d.cat][0],th:CD_CAT[d.cat][1]},rel:{m:d.a!=null?d.a:d.b,s:d.v.s||null,t:d.v.t||null},lk:cmLikes(a,d.imp,sc),rp:[],ev:d.src,dr:d.id};C.posts.push(p);d.post=p.id;d.side.B++}
  else{const eng=d.heat*cmRnd(.4,1.25);d.heat=Math.max(0,d.heat*cmRnd(.5,.82)+eng*.33+(d.lv>=2&&Math.random()<.25?cmRnd(5,18)*sc:0))}
  const p=C.posts.find(x=>x.id==d.post);if(!p){d.st='faded';return}
  const lv=cdLevel(d);d.lv=lv;d.max=Math.max(d.max,lv);
  if(d.heat<9||S.day-d.d0>12){if(d.max>=2){cdReply(d,p,'N','end');d.st='calm'}else d.st='faded';d.end=S.day;return}
  // replies by level: level 1 often nothing at all
  const n=lv==1?(Math.random()<.45?1:0):lv==2?Math.round(cmRnd(1,3)):lv==3?Math.round(cmRnd(3,5)):Math.round(cmRnd(4,7));let made=0;
  for(let i=0;i<n;i++){const r=Math.random(),want=lv>=3&&r<.12?'C':r<.42?'A':r<.8?'B':'N';made+=cdReply(d,p,want,want=='C'?'calm':want)}
  if(lv>=3&&!d.esc){if(cdReply(d,p,'N','esc'))d.esc=S.day}
  if(lv==4&&!d.big){const a=cdPick(d,'N'),tx=a&&cdText(d,'big',a);if(tx){a.last=S.day;C.posts.push({id:'cp'+(++C.seq),d:S.day,hr:Math.floor(cmRnd(12,23)),gid:d.gid,a:a.id,h:a.h,ag:a.gid,i:'drama',cat:'drama',imp:3,en:tx.en,th:tx.th,tone:'u',tag:null,top:'dr:'+d.id,lb:p.lb,rel:{...p.rel},lk:cmLikes(a,3,sc)*2,rp:[],ev:d.src,dr:d.id});d.big=S.day}}
  if(lv>=2&&Math.random()<.35)cdReply(d,p,lv>=3?'C':'N',lv>=3?'calm':'N');
  p.lk+=Math.round(made*d.heat*cmRnd(.5,1.2));if(made)d.dl=S.day;
  // mood & management perception (descriptive), awareness for level 3+
  const M=C.mood[d.gid]=C.mood[d.gid]||{neg:0,pos:0,d:S.day};M.neg=Math.round(M.neg*.9+made*(lv>=3?2:1));M.d=S.day;
  if(d.cat=='mgmt'&&lv>=3&&!d.mpd){d.mpd=1;C.mp.unshift({d:S.day,gid:d.gid,lv,en:`Fans questioned the repeated Center choice (${d.v.t}).`,th:`แฟนตั้งคำถามกับการเลือกเซ็นเตอร์คนเดิมซ้ำ (${d.v.t})`});C.mp.length=Math.min(C.mp.length,40)}
  if(lv>=3)[d.a,d.b].forEach(id=>{const m=get(id);if(!m)return;const k=C.imp[id]=C.imp[id]||{};if(S.day-(k.dr??-99)>=30){try{gainPop(m,.15)}catch(e){}k.dr=S.day}})});
 if(C.dr.length>80)C.dr.splice(0,C.dr.length-80)}
// ---- integration with the community engine ---------------------------------------------------------------------------------
{const f=cmCollect;cmCollect=function(){const E=f.apply(this,arguments);try{cdSeed(E);E.forEach(ev=>ev.its.forEach(it=>{if(it.i=='salesUp')cdS().drq.push({t:ev.v.t});if(it.i=='mvMile')cdS().drq.push({s:ev.v.s,n:it.v.n})}))}catch(e){console.error(e)}return E}}
{const f=cmDaily;cmDaily=function(){const was=S&&S.cm&&S.cm.dayDone;const r=f.apply(this,arguments);try{if(S&&S.cm&&S.cm.dayDone===S.day&&was!==S.day){cdDaily();cmTrend()}}catch(e){console.error('drama',e)}return r}}
// level badge on posts; side tags in the thread
{const f=cmPostHtml;cmPostHtml=function(p,full){let h=f.apply(this,arguments);try{if(!p.dr)return h;const d=cdS().dr.find(x=>x.id==p.dr);if(!d)return h;const lv=Math.max(1,d.lv||1),th=CM_TH();
 const tag=`<span class="cdlv l${lv}">${esc(th?CD_LV[lv][1]:CD_LV[lv][0])}${d.st=='calm'?' · '+(th?'สงบแล้ว':'calmed'):d.st=='faded'?' · '+(th?'เงียบไปแล้ว':'faded'):''}</span>`;h=h.replace('<span class="cmt">',tag+'<span class="cmt">')}catch(e){}return h}}
{const f=cmOpen;cmOpen=function(id){f.apply(this,arguments);try{const p=cdS().posts.find(x=>x.id==id);if(!p||!p.dr||!ui.mod)return;const d=cdS().dr.find(x=>x.id==p.dr);if(!d)return;const th=CM_TH(),A=d.side.A||0,B=d.side.B||0,N=(d.side.N||0)+(d.side.C||0),T=Math.max(1,A+B+N);
 const sideNm=s=>s=='A'?(d.a!=null&&d.cat!='mgmt'&&d.cat!='sis'?cdNm(d.a):d.cat=='team'?d.v.tm:d.cat=='sis'?d.v.g2:th?'ฝั่งเห็นด้วย':'Side A'):(d.b!=null&&d.cat!='sis'?cdNm(d.b):d.cat=='team'?d.v.tm2:d.cat=='sis'?d.v.g:th?'อีกฝั่ง':'Side B');
 const bar=`<div class="cdbar"><div class="row"><b>${esc(th?CD_CAT[d.cat][1]:CD_CAT[d.cat][0])}</b><span class="cdlv l${Math.max(1,d.lv)}">${esc(CD_LV[Math.max(1,d.lv)][th?1:0])}</span></div><div class="cdsplit"><i style="width:${A/T*100}%"></i><i class="b" style="width:${B/T*100}%"></i><i class="n" style="width:${N/T*100}%"></i></div><small>${esc(sideNm('A'))} ${A} · ${esc(sideNm('B'))} ${B} · ${th?'กลาง/ห้ามทัพ':'neutral / calming'} ${N}</small></div>`;
 ui.mod.h=ui.mod.h.replace('<div class="cmreps">',bar+'<div class="cmreps">');render()}catch(e){console.error(e)}}}
// Trending tab: fandom drama section
{const f=V.community;V.community=function(){let h=f.apply(this,arguments);try{if((ui.cmt||'all')!='trend')return h;const C=cdS(),th=CM_TH(),L=C.dr.filter(d=>d.post&&S.day-(d.end??S.day)<=7&&d.st!='new').sort((a,b)=>(b.st=='open')-(a.st=='open')||b.lv-a.lv||b.dl-a.dl).slice(0,8);
 const row=d=>`<button class="cmtr" onclick="cmOpen('${d.post}')"><span class="cdlv l${Math.max(1,d.lv)}">${esc(CD_LV[Math.max(1,d.lv)][th?1:0])}</span><span class="cmtrb"><b>${esc(th?CD_CAT[d.cat][1]:CD_CAT[d.cat][0])}${d.a!=null?' · '+esc(cdNm(d.a)):''}${d.b!=null?' / '+esc(cdNm(d.b)):''}</b><small>${cmGChip(d.gid)} ${d.st=='open'?(th?'กำลังเดือด':'ongoing'):d.st=='calm'?(th?'สงบลงแล้ว':'calmed down'):(th?'เงียบหายไป':'faded out')} · ${Object.keys(d.cnt||{}).length} ${th?'บัญชี':'accounts'}</small></span></button>`;
 const mp=C.mp.slice(0,3);const card=`<div class="c"><h3>${th?'ดราม่าในด้อม':'Fandom drama'}</h3>${L.length?L.map(row).join(''):`<p class="st">${th?'ช่วงนี้ด้อมสงบดี':'The fandoms are calm right now.'}</p>`}${mp.length?`<h3>${th?'มุมมองต่อฝ่ายบริหาร':'How fans see management'}</h3>${mp.map(x=>`<div class="st">${jd(x.d)} · ${esc(th?x.th:x.en)}</div>`).join('')}`:''}</div>`;
 const i=h.indexOf(`<div class="c"><h3>${CMT('Fan campaigns','แคมเปญของแฟนๆ')}`);return i>0?h.slice(0,i)+card+h.slice(i):h+card}catch(e){console.error(e);return h}}}
