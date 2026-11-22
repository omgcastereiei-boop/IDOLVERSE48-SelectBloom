// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Music Awards: the 7 final categories, ceremony order, notifications
// -------------------------------------------------------------------------------------
//  Same award system (awards.js + aw3.js): same nominations, judging, winners, speeches, history.
//  Only these 7 categories remain, announced in this order (Group of the Year is the grand finale):
//   1 Best New Artist (group) · 2 Best Performer (member) · 3 Most Popular Idol (member) ·
//   4 Best Live Performance (group: concerts and Theater) · 5 Idol of the Year (member) ·
//   6 Song of the Year (song) · 7 Group of the Year (group)
//  Pop-ups: 1 December — the nominees are announced (View Nominees); ceremony day — Attend Ceremony.
//  Each pop-up appears once per season; the state is saved with the year (Y.ntf).
//  Earlier years keep their history; categories that no longer exist still show their old names there.
// =====================================================================================
const AW4_OLD={};AW_CAT.forEach(c=>{AW4_OLD[c[0]]=c[1]});
const AW4_TH={newg:'ศิลปินหน้าใหม่ยอดเยี่ยม',dance:'นักแสดงยอดเยี่ยม',infl:'ไอดอลยอดนิยม',live:'การแสดงสดยอดเยี่ยม',fidol:'ไอดอลแห่งปี',soy:'เพลงแห่งปี',goy:'วงแห่งปี'};
// Best Live Performance: groups, from their concerts and Theater performances of the year (rival acts from their tours)
function aw4Live(y,end){const L=[];(S.groups||[]).forEach(g=>{let sat=0,n=0,att=0,cc=0,th=0;
 try{ccS().list.filter(C=>C.status=='done'&&awInYr(C.done,y,end)&&(C.host==g.id||C.host==null)).forEach(C=>{C.pf.filter(p=>p.res&&!p.res.err).forEach(p=>{sat+=(((p.res.resp||{}).all||{}).all||50);n++;att+=(p.res.phys||0)+(p.res.onl||0)*.3;cc++})})}catch(e){}
 try{gsWith(g.id,()=>{const P=(thS().pf||[]).filter(p=>awInYr(p.day,y,end));P.forEach(p=>{sat+=(p.sat||50)*.5;n+=.5;att+=(p.att||0)});th=P.length})}catch(e){}
 if(!n)return;const s=sat/n;L.push({k:'g',id:g.id,gid:g.id,nm:g.name,act:g.name,sub:'',score:s*1.1+awLog(att)*9+Math.min(10,cc*2)+Math.min(8,th/15),why:`${Math.round(s)} audience satisfaction${cc?`, ${cc} concert show(s)`:''}${th?`, ${th} Theater performance(s)`:''}`})});
 Object.values(S.ind.A).filter(a=>a.cat!='player'&&a.st!='disbanded'&&a.st!='hiatus'&&a.st!='debut'&&a.cat!='fsolo'&&a.cat!='msolo').forEach(a=>{const sc=indPop(a)*.75+awLog(a.fans)*9+(a.mom||0)*.6+(a.cat=='band'?6:0);if(sc>60)L.push({k:'a',id:a.id,aid:a.id,nm:a.nm,act:a.nm,sub:IND_CAT[a.cat]?IND_CAT[a.cat][0]:'',score:sc,why:'acclaimed live tour of the year'})});return L}
// member categories: Idol of the Year (any idol), Best Performer (singing + dancing + stage), Most Popular Idol (popularity & fan support)
AW_IND.fidol=(p,Y)=>(p.player||p.idol)?[p.pop*.35+(p.vo+p.da+p.va+p.pf)/4*.2+awYA(Y)*.3+awCareer(p,Y)*.15,`popularity ${p.pop}${Y.songs?`, ${Y.songs} song(s) this year`:''}${Y.cen?`, Center ×${Y.cen}`:''}`]:null;
AW_IND.dance=(p,Y)=>(p.player?Y.songs>0:(Y.songs>0&&!p.solo))?[(p.vo+p.da+p.pf)/3*.65+Math.min(25,Y.songs*3+Y.cen*4)+p.pop*.1,`Vocal ${p.vo}, Dance ${p.da}, Performance ${p.pf}`]:null;
AW_IND.infl=(p,Y)=>(p.player||p.idol)?[p.pop*.85+awYA(Y)*.15,`popularity ${p.pop}${Y.gr>0?`, +${Math.round(Y.gr)} this year`:''}`]:null;
{const L=[['newg','Best New Artist','group'],['dance','Best Performer','artist'],['infl','Most Popular Idol','artist'],['live','Best Live Performance','group'],['fidol','Idol of the Year','artist'],['soy','Song of the Year','music'],['goy','Group of the Year','group']];
 const N=L.map(([k,n,c])=>{const o=AW_CAT.find(x=>x[0]==k);let fn=o[3];if(AW_IND[k])fn=(y,end)=>awPeople().map(p=>{const Y=awYearOf(p,y,end),r=AW_IND[k](p,Y);return r?awP(p,r[0],r[1]):null}).filter(Boolean);if(k=='live')fn=aw4Live;return[k,n,c,fn]});
 AW_CAT.splice(0,AW_CAT.length,...N)}
Object.assign(AW_CN,{group:'Group',artist:'Individual Member',music:'Song'});
AW_TYPE.newg='group';AW_TYPE.live='group';AW_TYPE.infl='ind';
awCatName=function(k){const c=AW_CAT.find(x=>x[0]==k),en=c?c[1]:(AW4_OLD[k]||k);return typeof UIP!='undefined'&&UIP.lang=='th'&&c&&AW4_TH[k]?AW4_TH[k]:en};
try{Object.assign(I18N_TH,{'Best New Artist':'ศิลปินหน้าใหม่ยอดเยี่ยม','Best Performer':'นักแสดงยอดเยี่ยม','Most Popular Idol':'ไอดอลยอดนิยม','Best Live Performance':'การแสดงสดยอดเยี่ยม','Idol of the Year':'ไอดอลแห่งปี','Song of the Year':'เพลงแห่งปี','Group of the Year':'วงแห่งปี','Individual Member':'รางวัลรายบุคคล','Group':'วง','Song':'เพลง','View Nominees':'ดูรายชื่อผู้เข้าชิง','Attend Ceremony':'เข้าร่วมพิธี'})}catch(e){}
// ---- pop-ups (once per season, saved in the year) -------------------------------------------------------------------------------------
function aw4Pending(){const A=awS(),y=awY(S.day),Y=A.years[y];if(!Y)return null;Y.ntf=Y.ntf||{};if(Y.noms&&!Y.ntf.nom&&!Y.win)return{k:'nom',Y};if(Y.win&&!Y.ntf.cer&&!Y.watched&&S.day>=Y.cerDay&&S.day<=Y.cerDay+10)return{k:'cer',Y};return null}
function aw4Html(z){const th=typeof UIP!='undefined'&&UIP.lang=='th',Y=z.Y,nom=z.k=='nom',n=Object.keys(Y.noms||{}).length;
 return`<div class="aw4pop" data-notr><div class="aw4glow"></div><div class="aw4star">🏆</div><div class="aw4k">${AW_JP}</div><h2>${AW_NAME} ${Y.y}</h2>
 <h3>${nom?(th?'ประกาศรายชื่อผู้เข้าชิงแล้ว!':'The nominees have been announced!'):(th?'คืนนี้คือพิธีประกาศรางวัล!':'Tonight is the Award Ceremony!')}</h3>
 <p>${nom?(th?`ฤดูกาลรางวัลเริ่มแล้ว รายชื่อผู้เข้าชิงทั้ง ${n} สาขาของปีนี้ประกาศออกมาแล้ว ไปดูกันว่าใครได้เข้าชิงบ้าง`:`Award season has begun. The nominees for all ${n} categories of this year are now available — see who made the list.`):(th?`พรมแดงพร้อมแล้ว ถึงเวลาเข้าร่วมพิธีและลุ้นผู้ชนะของปีนี้ — ปิดท้ายด้วยรางวัลวงแห่งปี`:`The red carpet is ready. It is time to attend the ceremony and discover this year's winners — with Group of the Year as the grand finale.`)}</p>
 <p class="st">${longDate(Y.cerDay)}</p>
 <div class="row aw4act"><button class="b p" onclick="aw4Go('${z.k}',${Y.y})">${nom?(th?'ดูรายชื่อผู้เข้าชิง':'View Nominees'):(th?'เข้าร่วมพิธี':'Attend Ceremony')}</button></div></div>`}
function aw4Go(k,y){ui.mod=null;if(k=='nom'){ui.awy=y;goView('awards')}else{goView('awards');awShowOpen(y)}}
{const f=render;render=function(){try{if(S&&!ui.t&&!ui.mod&&!ui.awsh&&!ui.jkov&&!(ui.newRes&&ui.newRes.length)){const z=aw4Pending();if(z){z.Y.ntf[z.k]=1;ui.mod={t:'html',h:aw4Html(z)}}}}catch(e){console.error(e)}return f.apply(this,arguments)}}
// the old toast on ceremony day is replaced by the pop-up
{const f=awTick;awTick=function(){const t0=toast;toast=function(m){if(String(m).startsWith('Tonight:'))return;return t0.apply(this,arguments)};try{return f.apply(this,arguments)}finally{toast=t0}}}
