// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Japan Music Excellence Awards (annual, December)
// -------------------------------------------------------------------------------------
//  · Award year = 1 Jan – 30 Nov. Nominations on 1 December, ceremony on 20 December.
//  · Every act of the industry takes part: the player's groups and members, OMG4ki (Naevis),
//    WINÉR4, SUMÉR4, Sefira and every generated artist. Nominees and winners come from the
//    year's real data: chart points, CD sales, streaming, chart peaks / weeks, MV views,
//    concerts and Theater performances, member skills (Vocal / Dance / Variety), popularity,
//    Center positions, popularity growth, fan growth, member bonds. A small judges' factor
//    (±8%) keeps results from being fixed — nothing is random beyond that.
//  · Categories (some only in years that have candidates): Song of the Year, Best Single,
//    Best Album, Best Music Video, Best Live Performance, Best Theater Stage, Best Female Idol,
//    Best Male Idol, Best Center, Best Vocalist, Best Dancer, Best Variety Star, Rising Star,
//    Group of the Year, Best Idol Group, Best New Group, Best Sister Group, Best Fandom,
//    Most Influential Idol, Special Achievement, Lifetime Achievement, Best Friendship Duo.
//  · Preparation (Music Awards page): who attends, their outfit (her profile costume or one
//    library design), the representative who accepts awards, the schedule.
//  · Ceremony on the big screen: red carpet → every category (nominees, then the winner with a
//    short explanation, acceptance speech for your members) → special performance → closing.
//  · Effects use the existing systems only: news articles (and their attention / reputation /
//    popularity effects), fans through the fanbase, winning songs get more interest on the
//    charts, rival winners gain fans / momentum. Losing has no penalty.
//  · History of every year is saved (S.aw.years); member careers record nominations and wins.
// =====================================================================================
const AW_NAME='Japan Music Excellence Awards',AW_JP='ジャパン・ミュージック・エクセレンス・アワード';
const AW_NOM=[11,1],AW_CER=[11,20]; // [month (0-based), day]
function awS(){if(!S)return null;if(!S.aw||typeof S.aw!='object')S.aw={v:1,years:{},snap:{}};const A=S.aw;A.years=A.years||{};A.snap=A.snap||{};return A}
const awY=d=>dayDate(d).getFullYear(),awMD=d=>{const x=dayDate(d);return[x.getMonth(),x.getDate()]};
function awDayOf(y,md){const x0=dayDate(0),t=new Date(y,md[0],md[1]);return Math.round((t-new Date(x0.getFullYear(),x0.getMonth(),x0.getDate()))/86400000)}
const awJ=k=>{let h=0;k=String(k);for(let i=0;i<k.length;i++)h=Math.imul(h^k.charCodeAt(i),16777619)+i|0;h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296};
const awNoise=k=>.92+.16*awJ(k);
// ---- year-start snapshots (popularity / fans) for Rising Star and Best Fandom -------------------------------------------
function awSnap(y){const A=awS(),z=A.snap[y]=A.snap[y]||{m:{},a:{},g:{}};S.members.forEach(m=>{if(z.m[m.id]==null)z.m[m.id]=m.pop|0});const I=S.ind;if(I)Object.values(I.A).forEach(a=>{if(z.a[a.id]==null)z.a[a.id]=a.fans|0});(S.groups||[]).forEach(g=>{if(z.g[g.id]==null)z.g[g.id]=awGFans(g.id)});return z}
function awGFans(gid){try{return S.groups.length>1&&typeof gsFans=='function'?gsFans(gid):(S.fans|0)}catch(e){return S.fans|0}}
// ---- helpers ---------------------------------------------------------------------------------------------------------------
const awInYr=(d,y,end)=>d!=null&&awY(d)==y&&d<=end;
function awRel(y,end){const I=S.ind;return I?Object.values(I.R).filter(r=>awInYr(r.day,y,end)):[]}
function awPk(r){const I=S.ind,h=I.H[(r.k=='a'?'ca':'cs')+':'+r.id];return h?h.pk:99}
function awWks(r){const I=S.ind,h=I.H[(r.k=='a'?'ca':'cs')+':'+r.id];return h?h.wks:0}
function awArtistName(a){if(!a)return'';if(a.cat=='player'){const gid=+String(a.id).slice(1),g=(S.groups||[]).find(x=>x.id==gid);return g?g.name:a.nm}return a.nm}
const awPlayerGid=a=>a&&a.cat=='player'?+String(a.id).slice(1):null;
const awLog=x=>Math.log10(Math.max(1,x));
// rival stars and player members as one candidate list
function awPeople(){const I=S.ind,L=[];
 S.members.filter(m=>m.status!='graduated').forEach(m=>{const g=grp(m.group);L.push({k:'m',id:m.id,nm:m.name,sub:g?g.name:'',sex:'f',pop:m.pop|0,vo:m.sing|0,da:m.dance|0,va:m.variety|0,player:1,gid:m.group,trainee:m.status=='trainee'})});
 if(I)Object.values(I.A).filter(a=>a.cat!='player'&&a.st!='disbanded'&&a.st!='hiatus').forEach(a=>{const sx=indSexOf(a);indStars(a).forEach((s,i)=>L.push({k:'s',id:a.id+'#'+i,aid:a.id,nm:s.nm,sub:a.nm,sex:sx=='x'?(i==0?a.lead||'m':'m'):sx,pop:indStarPop(a,s),vo:s.vo,da:s.da,va:s.va,legend:!!s.legend,idol:['fidol','midol','kpop'].includes(a.cat),solo:a.cat=='fsolo'||a.cat=='msolo',pos:s.pos}))});return L}
// player member achievements of the year
function awMemYear(m,y,end){const H=(m.hist||[]).filter(h=>awInYr(h.day,y,end)),cen=H.filter(h=>h.center).length,main=H.filter(h=>h.cat=='main').length;let xe=0;try{xe=(xeS().list||[]).filter(r=>r.status=='done'&&awInYr(r.day,y,end)&&(r.sel||[]).includes(m.id)).length}catch(e){}return{songs:H.length,cen,main,xe}}
// ---- categories ------------------------------------------------------------------------------------------------------------
// each returns [{k,id,nm,sub,score,why, gid?, mid?, rid?}] (already scored)
const AW_CAT=[
 ['soy','Song of the Year','music',(y,end)=>awRel(y,end).filter(r=>r.k=='s').map(r=>{const a=S.ind.A[r.aid],pts=r.yp[y]||0,pk=awPk(r);return{k:'r',id:r.id,nm:r.t,sub:awArtistName(a),gid:awPlayerGid(a),score:pts*.6+r.stT/150*.5+(pk<99?(21-pk)*pts*.02:0)+awWks(r)*pts*.01,why:`${indFmt(pts)} chart points this year${pk<99?`, peak #${pk}`:''}, ${indFmt(r.stT)} streams`}})],
 ['single','Best Single','music',(y,end)=>awRel(y,end).filter(r=>r.k=='s').map(r=>{const a=S.ind.A[r.aid],pk=awPk(r);return{k:'r',id:r.id,nm:r.t,sub:awArtistName(a),gid:awPlayerGid(a),score:r.tot+(r.yp[y]||0)*.4+(pk<99?(21-pk)*r.tot*.01:0),why:`${indFmt(r.tot)} CDs sold${pk<99?`, peak #${pk}`:''}`}})],
 ['album','Best Album','music',(y,end)=>awRel(y,end).filter(r=>r.k=='a').map(r=>{const a=S.ind.A[r.aid],pk=awPk(r);return{k:'r',id:r.id,nm:r.t,sub:awArtistName(a),gid:awPlayerGid(a),score:r.tot+(r.yp[y]||0)*.5+(pk<99?(21-pk)*r.tot*.01:0),why:`${indFmt(r.tot)} CDs${pk<99?`, peak #${pk}`:''}`}})],
 ['mv','Best Music Video','music',(y,end)=>{const L=[];(S.groups||[]).forEach(g=>gsWith(g.id,()=>Object.values(S.songs||{}).forEach(o=>{const v=o.mv;if(v&&v.v>0&&awInYr(v.pub??o.relDay,y,end))L.push({k:'song',id:g.id+':'+o.id,nm:o.title,sub:g.name,gid:g.id,score:v.v*.35+(o.pref&&o.pref.s||50)*2000,why:`${indFmt(Math.round(v.v))} MV views`})})));
  awRel(y,end).filter(r=>r.k=='s'&&S.ind.A[r.aid]&&S.ind.A[r.aid].cat!='player').forEach(r=>{const a=S.ind.A[r.aid],views=Math.round(r.stT*.9);L.push({k:'r',id:r.id,nm:r.t,sub:a.nm,score:views*.35+indPop(a)*2000,why:`about ${indFmt(views)} MV views`})});return L}],
 ['live','Best Live Performance','music',(y,end)=>{const L=[];try{ccS().list.filter(C=>C.status=='done'&&awInYr(C.done,y,end)).forEach(C=>{const P=C.pf.filter(p=>p.res&&!p.res.err),sat=P.length?avg(P.map(p=>((p.res.resp||{}).all||{}).all||50)):50,att=P.reduce((s,p)=>s+(p.res.phys||0)+(p.res.onl||0)*.3,0);L.push({k:'cc',id:C.id,nm:C.name,sub:S.co||'',score:sat*1.1+awLog(att)*9,why:`${Math.round(sat)} audience satisfaction, ${indFmt(Math.round(att))} viewers`})})}catch(e){}
  Object.values(S.ind.A).filter(a=>a.cat!='player'&&a.st!='disbanded'&&a.st!='hiatus'&&a.st!='debut').forEach(a=>{const sc=indPop(a)*.75+awLog(a.fans)*9+a.mom*.6+(a.cat=='band'?6:0);if(sc>60)L.push({k:'a',id:a.id,nm:`${a.nm} live tour`,sub:a.nm,score:sc,why:'acclaimed tour of the year'})});return L}],
 ['theater','Best Theater Stage','music',(y,end)=>{const L=[];(S.groups||[]).forEach(g=>{try{gsWith(g.id,()=>{const H=thS();Object.values(H.st||{}).forEach(s=>{const P=(H.pf||[]).filter(p=>p.st==s.id&&awInYr(p.day,y,end));if(P.length<3)return;const sat=avg(P.map(p=>p.sat||50)),att=P.reduce((t,p)=>t+(p.att||0),0);L.push({k:'stage',id:g.id+':'+s.id,nm:s.name,sub:`${g.name} · ${thLabel?thLabel(s.k):''}`,gid:g.id,score:sat*1.2+awLog(att)*8+P.length*.2,why:`${P.length} performances, ${Math.round(sat)} average satisfaction`})})})}catch(e){}});return L.length>=2?L:[]}],
 ['fidol','Best Female Idol','artist',(y,end)=>awPeople().filter(p=>p.sex=='f'&&(p.player||p.idol)).map(p=>{const Y=p.player?awMemYear(get(p.id),y,end):null;return awP(p,p.pop+(p.vo+p.da+p.va)/15+(Y?Y.cen*3+Y.songs*.6:p.legend?3:0),Y?`popularity ${p.pop}, ${Y.songs} song(s) this year${Y.cen?`, Center ×${Y.cen}`:''}`:`popularity ${p.pop}`)})],
 ['midol','Best Male Idol','artist',(y,end)=>awPeople().filter(p=>p.sex=='m'&&p.idol).map(p=>awP(p,p.pop+(p.vo+p.da+p.va)/15,`popularity ${p.pop}`))],
 ['center','Best Center','artist',(y,end)=>{const L=[];awPeople().forEach(p=>{if(p.player){const Y=awMemYear(get(p.id),y,end);if(Y.cen)L.push(awP(p,p.pop*.6+Y.cen*9+Y.main*2,`Center ×${Y.cen} this year`))}else if(p.idol&&/Center|Ace/.test(p.pos||'')){const a=S.ind.A[p.aid],n=awRel(y,end).filter(r=>r.aid==a.id).length;if(n)L.push(awP(p,p.pop*.6+n*9+(p.legend?4:0),`Center of ${n} release(s) this year`))}});return L}],
 ['vocal','Best Vocalist','artist',(y,end)=>awPeople().filter(p=>p.player?awMemYear(get(p.id),y,end).songs>0:true).map(p=>awP(p,p.vo*.85+p.pop*.2,`Vocal ${p.vo}`))],
 ['dance','Best Dancer','artist',(y,end)=>awPeople().filter(p=>p.player?awMemYear(get(p.id),y,end).songs>0:!p.solo||p.da>60).map(p=>awP(p,p.da*.85+p.pop*.2,`Dance ${p.da}`))],
 ['variety','Best Variety Star','artist',(y,end)=>awPeople().map(p=>{const Y=p.player?awMemYear(get(p.id),y,end):null;return awP(p,p.va*.75+p.pop*.2+(Y?Y.xe*2:0),`Variety ${p.va}${Y&&Y.xe?`, ${Y.xe} TV / event appearance(s)`:''}`)})],
 ['rising','Rising Star of the Year','artist',(y,end)=>{const z=awS().snap[y]||{m:{},a:{}};return awPeople().map(p=>{let g;if(p.player){const p0=z.m[p.id];g=p0==null?p.pop*.5:p.pop-p0}else{const a=S.ind.A[p.aid],f0=z.a[a.id];g=f0?Math.round(100*(a.fans-f0)/f0/2):0;if(a.st!='debut'&&a.st!='rising')g*=.5}return awP(p,g*2+p.pop*.15,`popularity ${g>=0?'+':''}${Math.round(g)} this year`)}).filter(x=>x.score>8)}],
 ['goy','Group of the Year','group',(y,end)=>awGroups(y,end,()=>true).map(x=>({...x,score:x.base,why:x.why}))],
 ['idolg','Best Idol Group','group',(y,end)=>awGroups(y,end,a=>['fidol','midol','kpop','player'].includes(a.cat)).map(x=>({...x,score:x.base*.8+x.perf*.4,why:x.why}))],
 ['newg','Best New Group','group',(y,end)=>awGroups(y,end,a=>a.cat!='fsolo'&&a.cat!='msolo'&&awDeb(a)>end-540).map(x=>({...x,score:x.base,why:`debut ${jd(awDeb(x.a))} · ${x.why}`}))],
 ['sis','Best Sister Group','group',(y,end)=>awGroups(y,end,a=>!!a.sis||(a.cat=='player'&&(S.groups||[]).findIndex(g=>g.id==awPlayerGid(a))>0)).map(x=>({...x,score:x.base,why:x.why}))],
 ['fandom','Best Fandom','group',(y,end)=>{const z=awS().snap[y]||{a:{},g:{}};return awGroups(y,end,()=>true).map(x=>{const a=x.a,gid=awPlayerGid(a),now=gid!=null?awGFans(gid):a.fans,f0=gid!=null?z.g[gid]:z.a[a.id],gr=f0?Math.min(1.5,(now-f0)/Math.max(1,f0)):0;return{...x,score:awLog(now)*10+gr*60,why:`${indFmt(now)} fans${f0?`, ${gr>=0?'+':''}${Math.round(gr*100)}% this year`:''}`}})}],
 ['infl','Most Influential Idol','special',(y,end)=>awPeople().map(p=>{const a=p.player?null:S.ind.A[p.aid];return awP(p,p.pop*.7+(a?awLog(a.fans)*5:awLog(S.fans)*5)+(p.legend?5:0),p.legend?'the idol queen of the industry':`popularity ${p.pop}`)})],
 ['spec','Special Achievement Award','special',(y,end)=>awRel(y,end).filter(r=>{const h=S.ind.H['cs:'+r.id]||S.ind.H['ca:'+r.id];return(h&&h.n1>=4)||r.tot>=1000000}).map(r=>{const a=S.ind.A[r.aid],h=S.ind.H['cs:'+r.id]||S.ind.H['ca:'+r.id]||{};return{k:'r',id:r.id,nm:r.t,sub:awArtistName(a),gid:awPlayerGid(a),score:(h.n1||0)*10+r.tot/100000,why:`${h.n1||0} week(s) at No.1, ${indFmt(r.tot)} CDs`}})],
 ['life','Lifetime Achievement Award','special',(y,end)=>{const A=awS(),won=new Set(Object.values(A.years).flatMap(Y=>Y.win&&Y.win.life?[Y.win.life.id]:[]));return Object.values(S.ind.A).filter(a=>a.cat!='player'&&a.st!='disbanded'&&(end-a.deb)>=3650&&!won.has(a.id)).map(a=>({k:'a',id:a.id,nm:a.nm,act:a.nm,sub:IND_CAT[a.cat]?IND_CAT[a.cat][0]:'',score:(end-a.deb)/365+awLog(a.fans)*3,why:`${Math.floor((end-a.deb)/365)} years in the industry`})).slice(0,y%3==0?99:0)}],
 ['duo','Best Friendship Duo','special',(y,end)=>{const L=[];try{const M=S.members.filter(m=>m.status!='graduated');for(let i=0;i<M.length;i++)for(let j=i+1;j<M.length;j++){const b=capBond(M[i].id,M[j].id);if(b!=null&&b>=70)L.push({k:'duo',id:M[i].id+'+'+M[j].id,nm:`${M[i].name} & ${M[j].name}`,sub:(grp(M[i].group)||{}).name||'',gid:M[i].group,mids:[M[i].id,M[j].id],score:b+(M[i].pop+M[j].pop)/10,why:`bond ${Math.round(b)}`})}}catch(e){}
  ['sefira','winer4','sumer4','omg4ki'].forEach(id=>{const a=S.ind.A[id];if(!a||!a.mx||a.mx.length<2)return;const k=Math.floor(awJ(id+y)*(a.mx.length-1));const s1=a.mx[k],s2=a.mx[k+1];L.push({k:'sduo',id:id+'#'+k,nm:`${s1.nm} & ${s2.nm}`,sub:a.nm,score:70+awJ(id+y+'b')*25+(s1.legend?4:0),why:'fan-favourite pair of the year'})});return L.filter(x=>x.score>=70)}]];
const AW_CN={music:'Music & Production',artist:'Individual Artist',group:'Group & Fandom',special:'Special'};
function awP(p,score,why){return p.player?{k:'m',id:p.id,mid:p.id,nm:p.nm,sub:p.sub,gid:p.gid,score,why}:{k:'s',id:p.id,aid:p.aid,nm:p.nm,sub:p.sub,score,why}}
function awDeb(a){const gid=awPlayerGid(a);if(gid!=null){let d=null;try{gsWith(gid,()=>{const L=(S.singles||[]).map(x=>x.relDay??x.day).filter(x=>x!=null);d=L.length?Math.min(...L):null})}catch(e){}return d??S.day}return a.deb}
function awGroups(y,end,flt){const I=S.ind,L=[];try{(S.groups||[]).forEach(g=>{if(typeof indPlayerArtist=='function')gsWith(g.id,()=>indPlayerArtist())})}catch(e){}
 Object.values(I.A).filter(a=>a.st!='disbanded'&&a.cat!='fsolo'&&a.cat!='msolo'&&flt(a)).forEach(a=>{const R=awRel(y,end).filter(r=>r.aid==a.id),pts=R.reduce((s,r)=>s+(r.yp[y]||0),0),pk=Math.min(99,...R.map(awPk)),gid=awPlayerGid(a),fans=gid!=null?awGFans(gid):a.fans;
  if(!R.length&&gid==null)return;const perf=gid!=null?awPlayerPerf(gid,y,end):indPop(a)*.6;const base=awLog(fans)*14+Math.sqrt(pts)*.09+(pk<99?(21-pk)*.8:0)+perf*.2;L.push({k:gid!=null?'g':'a',id:gid!=null?gid:a.id,gid,a,nm:awArtistName(a),act:awArtistName(a),sub:IND_CAT[a.cat]?IND_CAT[a.cat][0]:'',base,perf,why:`${indFmt(fans)} fans, ${indFmt(pts)} chart points${pk<99?`, best #${pk}`:''}`})});return L}
function awPlayerPerf(gid,y,end){let s=40;try{const C=ccS().list.filter(C=>C.status=='done'&&awInYr(C.done,y,end));if(C.length)s+=10;gsWith(gid,()=>{const P=(thS().pf||[]).filter(p=>awInYr(p.day,y,end));if(P.length)s+=Math.min(20,avg(P.map(p=>p.sat||50))/5)})}catch(e){}return s}
// ---- nominations -----------------------------------------------------------------------------------------------------------
function awNominate(y){const A=awS();if(A.years[y]&&A.years[y].noms)return A.years[y];const end=awDayOf(y,[10,30]),Y=A.years[y]=A.years[y]||{y};Y.nomDay=S.day;Y.cerDay=awDayOf(y,AW_CER);Y.noms={};
 AW_CAT.forEach(([k,n,c,fn])=>{let L=[];try{L=fn(y,end)||[]}catch(e){console.error('aw',k,e)}L=L.filter(x=>x&&isFinite(x.score)&&x.score>0).map(x=>({...x,fin:x.score*awNoise(k+y+x.id)}));L.sort((a,b)=>b.score-a.score);
  const seen=new Set(),per={},N=[];for(const x of L){const key=x.k+':'+x.id,act=x.aid||(x.gid!=null?'g'+x.gid:x.sub||key);if(seen.has(key)||(per[act]|0)>=2)continue;seen.add(key);per[act]=(per[act]|0)+1;N.push(x);if(N.length>=5)break}if(N.length>=2||(k=='spec'||k=='life')&&N.length)Y.noms[k]=N.map(({a,...x})=>x)});
 Y.prep=Y.prep||{att:null,cz:'prof',rep:null};awNomNews(Y);return Y}
// nomination counts per group / member
function awCount(Y){const g={},m={};Object.values(Y.noms||{}).forEach(L=>L.forEach(x=>{const G=x.gid!=null?(grp(x.gid)||{}).name:x.act||x.sub;if(G)g[G]=(g[G]||0)+1;if(x.mid!=null)m[x.mid]=(m[x.mid]||0)+1;(x.mids||[]).forEach(id=>m[id]=(m[id]||0)+1)}));return{g,m}}
// ---- the ceremony: winners, effects, news ----------------------------------------------------------------------------------
function awRun(y){const A=awS(),Y=A.years[y];if(!Y||!Y.noms||Y.win)return;Y.win={};
 Object.entries(Y.noms).forEach(([k,L])=>{const w=L.slice().sort((a,b)=>b.fin-a.fin)[0];if(w)Y.win[k]={...w,close:L.length>1&&(L.slice().sort((a,b)=>b.fin-a.fin)[1].fin/w.fin>.97)}});
 Y.done=S.day;awEffects(Y);awWinNews(Y)}
function awCatName(k){const c=AW_CAT.find(x=>x[0]==k);return c?c[1]:k}
function awEffects(Y){const I=S.ind,mw={};
 Object.entries(Y.win).forEach(([k,w])=>{try{
  if(w.k=='r'){const r=I.R[w.id];if(r){if(r.act)r.hit=+Math.min(2.6,(r.hit||1)*1.18).toFixed(3);const a=I.A[r.aid];if(a&&a.cat!='player'){a.fans=Math.round(a.fans*1.02);a.mom=Math.min(15,a.mom+1.5)}}}
  if(w.k=='a'||w.k=='s'){const a=I.A[w.aid||w.id];if(a){a.fans=Math.round(a.fans*1.02);a.mom=Math.min(15,a.mom+1.5)}}
  (w.mid!=null?[w.mid]:w.mids||[]).forEach(id=>{const m=get(id);if(!m)return;mw[id]=(mw[id]||0)+1;hev(m,{t:'award',aw:AW_NAME,cat:awCatName(k),yr:Y.y,win:1})});
  if(w.gid!=null){const n=Math.round(Math.min(60000,1500+(S.fans|0)*.006));try{gsWith(w.gid,()=>fbAcquire(n,{via:'group',org:`${AW_NAME} — ${awCatName(k)}`}))}catch(e){}}
 }catch(e){console.error(e)}});
 // nominations without a win are part of the career too
 Object.entries(Y.noms).forEach(([k,L])=>L.forEach(x=>(x.mid!=null?[x.mid]:x.mids||[]).forEach(id=>{const m=get(id),w=Y.win[k];if(m&&!(w&&(w.mid==id||(w.mids||[]).includes(id))))hev(m,{t:'award',aw:AW_NAME,cat:awCatName(k),yr:Y.y,win:0})})));Y.mw=mw}
// ---- news ---------------------------------------------------------------------------------------------------------------------
function awNews(o){try{return nwPublish({src:'game',cat:o.cat||'industry',type:o.type||'award',sent:o.sent||'pos',att:o.att||40,imp:o.imp||3,refs:o.refs||{},img:o.img||{k:'edit',th:'industry'},alt:nwAlt(o.altEn||AW_NAME,o.altTh||'งานประกาศรางวัล'),en:o.en,th:o.th,fx:o.fx||null})}catch(e){console.error(e)}}
function awNomNews(Y){const C=awCount(Y),top=Object.entries(C.g).sort((a,b)=>b[1]-a[1]);
 awNews({type:'aw_nom',att:48,en:{h:`${AW_NAME} ${Y.y}: nominations announced`,s:top.length?`${top[0][0]} leads with ${top[0][1]} nomination(s).`:'The nominees of every category are out.',b:`The nominees for the ${AW_NAME} ${Y.y} have been announced. ${top.slice(0,4).map(([g,n])=>`${g} (${n})`).join(', ')} received the most nominations. The ceremony takes place on ${longDate(Y.cerDay)}.`},
  th:{h:`${AW_NAME} ${Y.y} ประกาศรายชื่อผู้เข้าชิงแล้ว`,s:top.length?`${top[0][0]} นำโด่งด้วย ${top[0][1]} รางวัล`:'ประกาศรายชื่อผู้เข้าชิงครบทุกสาขา',b:`ประกาศรายชื่อผู้เข้าชิงรางวัล ${AW_NAME} ${Y.y} แล้ว ${top.slice(0,4).map(([g,n])=>`${g} (${n})`).join(', ')} ได้รับการเสนอชื่อมากที่สุด พิธีประกาศรางวัลจัดขึ้นวันที่ ${longDate(Y.cerDay)}`}});
 // the player's nominated members
 Object.entries(C.m).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([id,n])=>{const m=get(+id);if(!m)return;awNews({type:'aw_nom_m',cat:'member',att:30,refs:{gid:m.group,mids:[m.id]},img:nwMemImg(m.id),altEn:m.name,altTh:m.name,fx:{matt:[[m.id,8]],mrep:[[m.id,1]]},
  en:{h:`${m.name} earns ${n} nomination(s) at the ${AW_NAME}`,s:'A big recognition of her year.',b:`${m.name} has been nominated in ${n} categor${n>1?'ies':'y'} at the ${AW_NAME} ${Y.y}. The winners will be announced at the ceremony on ${longDate(Y.cerDay)}.`},
  th:{h:`${m.name} เข้าชิง ${n} สาขาที่ ${AW_NAME}`,s:'การยอมรับครั้งสำคัญของปีนี้',b:`${m.name} ได้รับการเสนอชื่อเข้าชิง ${n} สาขาในงาน ${AW_NAME} ${Y.y} ผู้ชนะจะประกาศในพิธีวันที่ ${longDate(Y.cerDay)}`}})});
 if(Object.values(Y.noms).some(L=>L.some(x=>x.sub=='Sefira'||x.id=='sefira')))awNews({type:'aw_nom_sefira',att:30,en:{h:`Sefira nominated at the ${AW_NAME}`,s:'The K-pop group keeps growing in Japan.',b:`Korean girl group Sefira received nominations at the ${AW_NAME} ${Y.y}, another sign of their strong year in Japan.`},th:{h:`Sefira เข้าชิงรางวัล ${AW_NAME}`,s:'เกิร์ลกรุ๊ป K-pop ยังคงเติบโตในญี่ปุ่น',b:`เกิร์ลกรุ๊ปเกาหลี Sefira ได้รับการเสนอชื่อเข้าชิงรางวัล ${AW_NAME} ${Y.y} อีกหนึ่งสัญญาณของปีที่แข็งแกร่งในญี่ปุ่น`}})}
function awWinNews(Y){const W=Y.win,big=['soy','goy','single','fidol','infl'];const by=(f)=>Object.entries(W).filter(([k,w])=>f(w));
 const omg=by(w=>w.id=='omg4ki'||w.sub=='OMG4ki'||(w.aid=='omg4ki'));if(omg.length)awNews({type:'aw_omg',att:50,en:{h:`OMG4ki wins ${omg.length} award(s) at the ${AW_NAME}`,s:omg.map(([k])=>awCatName(k)).join(', '),b:`OMG4ki took home ${omg.map(([k])=>awCatName(k)).join(', ')} at the ${AW_NAME} ${Y.y}.${omg.some(([k,w])=>w.nm=='Naevis')?' Naevis once again showed why she is called the idol queen.':''}`},th:{h:`OMG4ki คว้า ${omg.length} รางวัลที่ ${AW_NAME}`,s:omg.map(([k])=>awCatName(k)).join(', '),b:`OMG4ki คว้ารางวัล ${omg.map(([k])=>awCatName(k)).join(', ')} ในงาน ${AW_NAME} ${Y.y}${omg.some(([k,w])=>w.nm=='Naevis')?' Naevis พิสูจน์อีกครั้งว่าทำไมเธอถูกเรียกว่าราชินีไอดอล':''}`}});
 ['WINÉR4','SUMÉR4','Sefira'].forEach(G=>{const L=by(w=>w.sub==G||w.nm==G);if(L.length)awNews({type:'aw_'+G,att:36,en:{h:`${G} wins at the ${AW_NAME}`,s:L.map(([k])=>awCatName(k)).join(', '),b:`${G} won ${L.map(([k])=>awCatName(k)).join(', ')} at the ${AW_NAME} ${Y.y}.`},th:{h:`${G} คว้ารางวัลที่ ${AW_NAME}`,s:L.map(([k])=>awCatName(k)).join(', '),b:`${G} คว้ารางวัล ${L.map(([k])=>awCatName(k)).join(', ')} ในงาน ${AW_NAME} ${Y.y}`}})});
 // the player's winners
 const A=awS(),prevWins=new Set(Object.values(A.years).filter(z=>z.y<Y.y&&z.win).flatMap(z=>Object.values(z.win).flatMap(w=>w.mid!=null?[w.mid]:w.mids||[])));
 Object.entries(Y.mw||{}).forEach(([id,n])=>{const m=get(+id);if(!m)return;const first=!prevWins.has(+id),cats=Object.entries(W).filter(([k,w])=>w.mid==+id||(w.mids||[]).includes(+id)).map(([k])=>awCatName(k));
  awNews({type:'aw_win_m',cat:'member',att:first?55:45,imp:4,refs:{gid:m.group,mids:[m.id]},img:nwMemImg(m.id),altEn:m.name,altTh:m.name,fx:{pop:[[m.id,1.5*n]],mrep:[[m.id,3*n]],matt:[[m.id,15]]},
   en:{h:`${m.name} wins ${n>1?n+' awards':cats[0]} at the ${AW_NAME}${first?' — her first award!':''}`,s:cats.join(', '),b:`${m.name} won ${cats.join(', ')} at the ${AW_NAME} ${Y.y}.${first?' It is the first award of her career.':''}${n>1?` With ${n} awards she is one of the big names of the night.`:''}`},
   th:{h:`${m.name} คว้า${n>1?' '+n+' รางวัล':' '+cats[0]}ที่ ${AW_NAME}${first?' — รางวัลแรกในชีวิต!':''}`,s:cats.join(', '),b:`${m.name} คว้ารางวัล ${cats.join(', ')} ในงาน ${AW_NAME} ${Y.y}${first?' นี่คือรางวัลแรกในเส้นทางของเธอ':''}${n>1?` ด้วย ${n} รางวัล เธอคือหนึ่งในคนที่โดดเด่นที่สุดของค่ำคืนนี้`:''}`}})});
 Object.entries(W).filter(([k,w])=>w.gid!=null&&w.mid==null&&!w.mids).forEach(([k,w])=>{const g=grp(w.gid);if(!g)return;awNews({type:'aw_win_g',cat:'company',att:44,imp:4,refs:{gid:g.id},img:{k:'grp',ids:S.members.filter(m=>m.group==g.id&&isAct(m)).slice(0,5).map(m=>m.id),hue:nwHash(g.name)%360},fx:{gatt:[[g.id,10]],grep:[[g.id,3]]},
  en:{h:`${g.name} wins ${awCatName(k)} at the ${AW_NAME}`,s:w.nm!=g.name?`“${w.nm}”`:'',b:`${g.name} won ${awCatName(k)}${w.nm!=g.name?` with “${w.nm}”`:''} at the ${AW_NAME} ${Y.y} — ${w.why}.`},th:{h:`${g.name} คว้า ${awCatName(k)} ที่ ${AW_NAME}`,s:w.nm!=g.name?`“${w.nm}”`:'',b:`${g.name} คว้ารางวัล ${awCatName(k)}${w.nm!=g.name?` จาก “${w.nm}”`:''} ในงาน ${AW_NAME} ${Y.y} — ${w.why}`}})});
 // upsets & close races
 Object.entries(W).filter(([k,w])=>big.includes(k)&&w.close).slice(0,1).forEach(([k,w])=>awNews({type:'aw_close',att:34,en:{h:`${awCatName(k)}: the closest race of the night`,s:`${w.nm} edges out the competition.`,b:`The ${awCatName(k)} category at the ${AW_NAME} ${Y.y} was decided by the narrowest of margins: ${w.nm} (${w.sub}) won by a hair.`},th:{h:`${awCatName(k)}: การแข่งขันที่สูสีที่สุดของคืนนี้`,s:`${w.nm} เฉือนชนะคู่แข่ง`,b:`สาขา ${awCatName(k)} ในงาน ${AW_NAME} ${Y.y} ตัดสินกันแบบเฉียดฉิว ${w.nm} (${w.sub}) คว้าชัยไปอย่างหวุดหวิด`}}));
 const C=awCount(Y);Object.entries(C.m).filter(([id,n])=>n>=3&&!(Y.mw||{})[id]).slice(0,1).forEach(([id,n])=>{const m=get(+id);if(m)awNews({type:'aw_snub',cat:'member',sent:'neu',att:28,refs:{gid:m.group,mids:[m.id]},img:nwMemImg(m.id),altEn:m.name,altTh:m.name,en:{h:`${n} nominations, no award for ${m.name}`,s:'Fans say her year was still a success.',b:`${m.name} was one of the most-nominated idols at the ${AW_NAME} ${Y.y} with ${n} nominations, but went home without a trophy. Fans flooded social media with messages of support.`},th:{h:`เข้าชิง ${n} สาขา แต่ ${m.name} ยังไม่ได้รางวัล`,s:'แฟน ๆ บอกว่าปีนี้ของเธอยังคงประสบความสำเร็จ',b:`${m.name} เป็นหนึ่งในไอดอลที่ถูกเสนอชื่อมากที่สุดในงาน ${AW_NAME} ${Y.y} ด้วย ${n} สาขา แต่กลับบ้านมือเปล่า แฟน ๆ ส่งข้อความให้กำลังใจท่วมโซเชียล`}})})}
// ---- daily timeline -------------------------------------------------------------------------------------------------------------
function awTick(){if(!S||!S.ind)return;const[mo,d]=awMD(S.day),y=awY(S.day);if(mo==0&&d==1||!awS().snap[y])awSnap(y);
 if(mo==11&&d>=AW_NOM[1]&&!(awS().years[y]&&awS().years[y].noms))awNominate(y);
 const Y=awS().years[y];if(Y&&Y.noms&&!Y.win&&S.day>=Y.cerDay){awRun(y);ui.awShow=y;try{toast(`Tonight: ${AW_NAME} ${y}. Open Music Awards to watch the ceremony.`)}catch(e){}}}
{const f=tick;tick=function(){const r=f.apply(this,arguments);try{if(S&&!(typeof GS_SCOPED!='undefined'&&GS_SCOPED))awTick()}catch(e){console.error(e)}return r}}
{const f=migrate;migrate=function(){const r=f.apply(this,arguments);try{if(S){awS();NW_POS&&delete NW_POS.nominate}}catch(e){}return r}}
try{delete NW_POS.nominate;NW_AWARD.splice(0,NW_AWARD.length,AW_NAME)}catch(e){}
// ---- preparation ------------------------------------------------------------------------------------------------------------
function awCurY(){const A=awS(),ys=Object.keys(A.years).map(Number).sort((a,b)=>b-a);return ys.length?A.years[ys[0]]:null}
function awAtt(Y){const P=Y.prep;if(!P.att){const C=awCount(Y);P.att=Object.keys(C.m).map(Number).filter(id=>get(id));if(!P.att.length)P.att=S.members.filter(m=>isAct(m)).sort((a,b)=>b.pop-a.pop).slice(0,3).map(m=>m.id)}return P.att}
function awTog(id){const Y=awCurY();if(!Y||Y.win)return;const L=awAtt(Y),i=L.indexOf(id);if(i>=0)L.splice(i,1);else L.push(id);if(Y.prep.rep==id&&i>=0)Y.prep.rep=null;render()}
function awSetCz(v){const Y=awCurY();if(!Y||Y.win)return;Y.prep.cz=v;render()}
function awSetRep(v){const Y=awCurY();if(!Y||Y.win)return;Y.prep.rep=v===''?null:+v;render()}
function awCzOf(Y,m){const P=Y.prep||{};if(P.cz&&P.cz!='prof'){const d=czD(P.cz);if(d)return d.p}return m.profCz&&m.profCz.p||null}
function awFig(m,cd,w){const a=ap(m);return`<svg viewBox="10 -2 80 200" width="${w||70}">${fig(m,{pose:0,of:a.of,oh:a.oh,ac:a.ac,ex:2,...(cd?{cd}:{})})}</svg>`}
// ---- pages ------------------------------------------------------------------------------------------------------------------------
function awWinLine(w){return`<b>${esc(w.nm)}</b> <small class="st">${esc(w.sub||'')}</small>`}
V.awards=function(){const A=awS(),ys=Object.keys(A.years).map(Number).sort((a,b)=>b-a),sel=ui.awy&&A.years[ui.awy]?ui.awy:ys[0],Y=sel?A.years[sel]:null,y=awY(S.day),nd=awDayOf(y,AW_NOM),cd=awDayOf(y,AW_CER);
 const head=`<div class="c awhead"><h2 class="ht">🏆 ${AW_NAME} <small class="st">${AW_JP}</small></h2><p class="st">Japan's annual music awards. Achievements of 1 Jan – 30 Nov count. Nominations on ${longDate(nd)} · Ceremony on ${longDate(cd)}.</p>${ys.length>1?`<div class="row">${ys.map(v=>`<button class="b s ${v==sel?'p':''}" onclick="ui.awy=${v};render()">${v}</button>`).join('')}</div>`:''}</div>`;
 if(!Y)return head+`<div class="c">${emptyBox(`The first nominations are announced on ${longDate(nd)}.`,'🏆')}</div>`;
 const C=awCount(Y),cats=AW_CAT.filter(([k])=>Y.noms[k]);
 const counts=`<div class="c"><h3>Nominations by group</h3><div class="awcnt">${Object.entries(C.g).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([g,n])=>`<span class="tag">${esc(g)} · ${n}</span>`).join('')}</div>${Object.keys(C.m).length?`<h3>Your nominated members</h3><div class="awmem">${Object.entries(C.m).sort((a,b)=>b[1]-a[1]).map(([id,n])=>{const m=get(+id);return m?`<span class="awm">${ptc(m,40)}<b>${esc(m.name)}</b><small>${n} nomination(s)${Y.mw&&Y.mw[id]?` · 🏆 ${Y.mw[id]}`:''}</small></span>`:''}).join('')}</div>`:''}</div>`;
 let prep='';if(!Y.win){const att=awAtt(Y),L=S.members.filter(m=>isAct(m)||m.status=='trainee'),lib=czLib().ds.filter(d=>d.p);
  prep=`<div class="c awprep"><h3>Preparation · ${longDate(Y.cerDay)}</h3><p class="st">Schedule: Red carpet 17:00 · Ceremony 18:00 – 21:30. Choose who attends, the outfit and who accepts awards for your group.</p>
  <div class="row"><label class="st">Outfit <select onchange="awSetCz(this.value)"><option value="prof" ${Y.prep.cz=='prof'?'selected':''}>Her profile costume</option>${lib.map(d=>`<option value="${d.id}" ${Y.prep.cz==d.id?'selected':''}>${esc(d.name)}</option>`).join('')}</select></label><label class="st">Representative <select onchange="awSetRep(this.value)"><option value="">Choose…</option>${att.map(id=>get(id)).filter(Boolean).map(m=>`<option value="${m.id}" ${Y.prep.rep==m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label></div>
  <div class="awatt">${L.map(m=>{const on=att.includes(m.id);return`<button class="c awa ${on?'on':''}" onclick="awTog(${m.id})">${on?awFig(m,awCzOf(Y,m),56):ptc(m,44)}<b>${esc(m.name)}</b><small>${on?'✔ Attends':'—'}${C.m[m.id]?` · ${C.m[m.id]} nom.`:''}</small></button>`}).join('')}</div></div>`}
 const list=cats.map(([k,n,c])=>{const L=Y.noms[k],w=Y.win&&Y.win[k];return`<div class="c awcat"><div class="row"><span class="tag">${AW_CN[c]}</span><b>${n}</b></div><ol class="awnl">${L.map(x=>`<li class="${w&&w.id==x.id&&w.k==x.k?'win':''} ${x.gid!=null?'pl':''}">${w&&w.id==x.id&&w.k==x.k?'🏆 ':''}${awWinLine(x)}<small class="st"> — ${esc(x.why)}</small></li>`).join('')}</ol></div>`}).join('');
 const show=Y.win?`<div class="row"><button class="b p" onclick="awShowOpen(${Y.y})">▶ Watch the ceremony</button><span class="st">${Object.keys(Y.win).length} awards presented on ${longDate(Y.done)}</span></div>`:`<p class="st">The winners are announced on ${longDate(Y.cerDay)}.</p>`;
 return head+`<div class="c"><h3>${AW_NAME} ${Y.y}</h3>${show}</div>`+counts+prep+list};
// ---- big-screen ceremony -------------------------------------------------------------------------------------------------------
function awShowSteps(Y){const St=[{k:'open'},{k:'carpet'}];AW_CAT.forEach(([k])=>{if(Y.noms[k]&&Y.win&&Y.win[k]){St.push({k:'nom',c:k},{k:'win',c:k})}});St.push({k:'perf'},{k:'end'});return St}
function awShowOpen(y){const Y=awS().years[y];if(!Y||!Y.win)return;ui.awsh={y,i:0};Y.watched=1;ui.awShow=null;render()}
function awShowGo(d){const s=ui.awsh;if(!s)return;const n=awShowSteps(awS().years[s.y]).length;s.i=Math.max(0,Math.min(n-1,s.i+d));render()}
function awShowEnd(){ui.awsh=null;render()}
function awShowHtml(){const s=ui.awsh,Y=awS().years[s.y],St=awShowSteps(Y),i=Math.min(s.i,St.length-1),z=St[i],btn=(t,f,c='p')=>`<button class="geb ${c}" onclick="${f}">${t}</button>`;let body='';
 const att=(Y.prep&&Y.prep.att||[]).map(get).filter(Boolean),rep=get(Y.prep&&Y.prep.rep)||att[0];
 if(z.k=='open')body=`<div class="gestage op"><div class="gekicker">${AW_JP}</div><h1 class="getitle">${AW_NAME}</h1><div class="gesub">${Y.y}</div><div class="geven">${longDate(Y.cerDay)} · ${Object.keys(Y.win).length} awards</div></div>`;
 else if(z.k=='carpet')body=`<div class="gestage"><div class="gekicker">Red Carpet</div><h2 class="ccshtt">The stars arrive</h2><div class="awcarpet">${att.map(m=>`<span>${awFig(m,awCzOf(Y,m),82)}<b>${esc(m.name)}</b></span>`).join('')||'<p class="gemc">Your members watch the broadcast this year.</p>'}</div><p class="gemc">${['OMG4ki','WINÉR4','SUMÉR4','Sefira'].join(' · ')} and the year's biggest names walk the red carpet.</p></div>`;
 else if(z.k=='nom'){const L=Y.noms[z.c];body=`<div class="gestage"><div class="gekicker">The nominees are</div><h2 class="ccshtt">${esc(awCatName(z.c))}</h2><div class="awnoms">${L.map(x=>`<div class="awnom ${x.gid!=null?'pl':''}">${x.mid!=null&&get(x.mid)?ptc(get(x.mid),54):x.mids?x.mids.map(id=>get(id)?ptc(get(id),40):'').join(''):`<span class="awini">${esc(String(x.nm).slice(0,1))}</span>`}<b>${esc(x.nm)}</b><small>${esc(x.sub||'')}</small></div>`).join('')}</div></div>`}
 else if(z.k=='win'){const w=Y.win[z.c],me=w.gid!=null,sp=me&&rep?`<p class="gemc">“Thank you so much! This award belongs to everyone at ${esc(S.co||'our agency')}, to our members and to every fan who supported ${esc((grp(w.gid)||{}).name||'us')}. We will keep working hard!” — ${esc(rep.name)}</p>`:'';
  body=`<div class="gestage op"><div class="gekicker">${esc(awCatName(z.c))} goes to…</div><h1 class="getitle ccshsm">${esc(w.nm)}</h1><div class="gesub">${esc(w.sub||'')}</div>${w.mid!=null&&get(w.mid)?`<div class="awwin">${awFig(get(w.mid),awCzOf(Y,get(w.mid)),110)}</div>`:''}<p class="gecap">${esc(w.why)}${w.close?' · a very close race':''}</p>${sp}</div>`}
 else if(z.k=='perf'){const w=Y.win.soy||Y.win.single;body=`<div class="gestage op"><div class="gekicker">Special performance</div><h1 class="getitle ccshsm">${w?esc(w.nm):'Finale'}</h1><div class="gesub">${w?esc(w.sub):''}</div><p class="gemc">${w?`The Song of the Year is performed live to close the night.`:'All winners return to the stage.'}</p></div>`}
 else body=`<div class="gestage op"><div class="gekicker">Thank you!</div><h1 class="getitle">${AW_NAME} ${Y.y}</h1><p class="gemc">${Object.keys(Y.mw||{}).length?`Your members won ${Object.values(Y.mw).reduce((a,b)=>a+b,0)} award(s) tonight.`:'See you at next year\'s ceremony.'}</p></div>`;
 const last=i==St.length-1,prog=Math.round(100*i/Math.max(1,St.length-1));
 return`<div class="gecer ccsh awsh" role="dialog"><div class="gebg"><i></i><i></i><i></i><i></i></div><div class="getop"><div><b>${AW_NAME} ${Y.y}</b><span>${longDate(Y.cerDay)}</span></div><div class="geprog"><i style="width:${prog}%"></i></div><div class="getopb">${last?'':btn('SKIP','awShowEnd()','s')}</div></div><div class="gebody">${body}</div><div class="geact">${i>0?btn('BACK','awShowGo(-1)','s'):''}${last?btn('CLOSE','awShowEnd()'):btn('NEXT','awShowGo(1)')}</div></div>`}
{const f=render;render=function(){const r=f.apply(this,arguments);try{const old=document.getElementById('awshw');if(S&&!ui.t&&ui.awsh){const a=document.getElementById('app'),d=old||document.createElement('div');d.id='awshw';d.innerHTML=awShowHtml();if(!old&&a)a.appendChild(d);document.body.classList.add('gecer-on')}else if(old){old.remove();if(!document.getElementById('gecerw')&&!document.getElementById('ccshw'))document.body.classList.remove('gecer-on')}}catch(x){console.error(x)}return r}}
// ---- member profile: awards ----------------------------------------------------------------------------------------------------
{const f=histHtml;histHtml=function(m){const h=f.apply(this,arguments);try{const E=(m.mh||[]).filter(e=>e.t=='award');if(!E.length)return h;const W=E.filter(e=>e.win),N=E.filter(e=>!e.win);
 return h+`<h3>Awards</h3><ul class="pfl">${W.map(e=>`<li><b>🏆 ${esc(e.aw)} ${e.yr} · ${esc(e.cat)}</b></li>`).join('')}${N.map(e=>`<li><span class="st">Nominated · ${esc(e.aw)} ${e.yr} · ${esc(e.cat)}</span></li>`).join('')}</ul>`}catch(e){return h}}}
{const f=evText;evText=function(e){if(e&&e.t=='award')return`${e.win?'Won':'Nominated for'} ${e.cat} · ${e.aw} ${e.yr}`;return f.apply(this,arguments)}}
// navigation: Charts section gets Music Awards
try{const C=SECS.find(s=>s.k=='charts');if(C&&!C.v.some(x=>x[0]=='awards'))C.v.push(['awards','Music Awards']);SUBLOC.awards='Broadcast Studio · Music Awards'}catch(e){}
