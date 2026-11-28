// =====================================================================================
//  My Collection (คลังของฉัน) — costumes and Theater Stage setlists kept in this browser,
//  outside every save, so they can be used in another save or sent to a friend.
//  · Stored in IndexedDB ('col', same database as the game save) with a localStorage fallback.
//  · Export: a .json file, a share code (IV48C1:… deflate+base64) or the phone's Share sheet.
//  · Import: a file or a pasted code. Everything imported is sanitised (plain values only).
//  · A setlist keeps song titles / genre / concept, Overture, MC breaks, Encore and the costume
//    of every position. Loading it creates a new draft Stage in the current theater: songs are
//    matched by title, missing ones become new Theater songs (team theaters only); costumes are
//    given to the performers in formation order. Members are never copied (they differ per save).
// =====================================================================================
const MYC_T=(en,th)=>(typeof UIP!='undefined'&&UIP.lang=='th')?th:en;
const MCOL={d:null,loading:null};
const MCOL_MAX={cz:400,sl:120};
const mcolTxt=(v,n=40)=>String(v==null?'':v).replace(/[<>"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
const mcolH=p=>{try{return thHash(JSON.stringify(p))}catch(e){return String(Math.random())}};
const mcolId=()=>'k'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
// only plain values survive: no markup, no script, nothing that can break out of an SVG attribute
function mcolClean(v,dep=0){if(dep>10)return undefined;if(typeof v=='number')return isFinite(v)?v:0;if(typeof v=='boolean')return v;if(v==null)return undefined;
 if(typeof v=='string')return/^[\w#.,%()\-+ ]{0,80}$/.test(v)?v:undefined;
 if(Array.isArray(v))return v.slice(0,300).map(x=>mcolClean(x,dep+1)).filter(x=>x!==undefined);
 if(typeof v=='object'){const o={};for(const k of Object.keys(v).slice(0,300)){if(!/^[\w-]{1,40}$/.test(k)||k=='__proto__')continue;const x=mcolClean(v[k],dep+1);if(x!==undefined)o[k]=x}return o}return undefined}
function mcolFix(d){d=d&&typeof d=='object'?d:{};return{v:1,cz:Array.isArray(d.cz)?d.cz:[],sl:Array.isArray(d.sl)?d.sl:[]}}

// ---- storage ------------------------------------------------------------------------------------
function mcolLoad(){if(MCOL.d)return Promise.resolve(MCOL.d);if(MCOL.loading)return MCOL.loading;
 MCOL.loading=(async()=>{let raw=null;try{if(typeof SV!='undefined'&&SV.db)raw=await svGet('col')}catch(e){}if(!raw){try{raw=localStorage.getItem('iv48col')}catch(e){}}
  let d=null;try{d=raw?JSON.parse(raw):null}catch(e){}MCOL.d=mcolFix(d);MCOL.loading=null;return MCOL.d})();return MCOL.loading}
async function mcolStore(){const j=JSON.stringify(MCOL.d);let ok=false;try{if(typeof SV!='undefined'&&SV.db)ok=await svPut('col',j)}catch(e){}
 if(ok){try{localStorage.removeItem('iv48col')}catch(e){}return true}try{localStorage.setItem('iv48col',j);return true}catch(e){toast(MYC_T('Your browser refused to store My Collection (storage full). Export it to a file.','เบราว์เซอร์บันทึกคลังไม่ได้ (พื้นที่เต็ม) กรุณา export เป็นไฟล์เก็บไว้'),'err');return false}}

// ---- costume entries ------------------------------------------------------------------------------
function mcolCzAdd(name,p,style,from){const D=MCOL.d,h=mcolH(p);if(D.cz.some(c=>c.h==h))return 0;if(D.cz.length>=MCOL_MAX.cz)return-1;
 D.cz.unshift({id:mcolId(),name:mcolTxt(name)||'Costume',style:mcolTxt(style,20),p:czClone(p),h,from:mcolTxt(from,60),at:Date.now()});return 1}
const mcolFrom=()=>{try{const g=typeof grp=='function'&&S.groups.length>1?grp(S.ag||S.groups[0].id):null;return mcolTxt((S.co||'')+(g?' · '+g.name:''),60)}catch(e){return''}};
async function mcolCzSaveIds(ids){await mcolLoad();let n=0,dup=0,full=0;ids.forEach(id=>{const d=czD(id);if(!d||!d.p)return;const r=mcolCzAdd(d.name,d.p,d.style,mcolFrom());if(r>0)n++;else if(r==0)dup++;else full++});
 if(n)await mcolStore();toast(n?MYC_T(`${n} costume(s) saved to My Collection.`,`บันทึก ${n} ชุดลงคลังของฉันแล้ว`)+(dup?MYC_T(` ${dup} were already there.`,` (มีอยู่แล้ว ${dup} ชุด)`):''):full?MYC_T('My Collection is full.','คลังเต็มแล้ว'):MYC_T('Already in My Collection.','ชุดนี้อยู่ในคลังของฉันแล้ว'),n?undefined:'err')}
function mcolCzSaveCur(){const E=ui.czE,d=typeof czEditing=='function'?czEditing():null;if(!d||!E)return toast(MYC_T('Open a design first.','เปิดชุดก่อน'),'err');
 mcolLoad().then(async()=>{const r=mcolCzAdd(d.name,E.p||d.p,E.style||d.style,mcolFrom());if(r>0){await mcolStore();toast(MYC_T(`“${d.name}” saved to My Collection.`,`บันทึก “${d.name}” ลงคลังของฉันแล้ว`))}else toast(r==0?MYC_T('This design is already in My Collection.','ชุดนี้อยู่ในคลังของฉันแล้ว'):MYC_T('My Collection is full.','คลังเต็มแล้ว'),'err')})}
function mcolCzUse(ids){const L=czLib().ds,have=new Set(L.map(d=>mcolH(d.p)));let n=0,dup=0;
 ids.forEach(id=>{const c=MCOL.d.cz.find(x=>x.id==id);if(!c)return;if(have.has(mcolH(c.p))){dup++;return}let nm=c.name,i=2;while(L.some(d=>d.name==nm))nm=`${c.name.slice(0,34)} (${i++})`;
  L.push({id:czId(),name:nm,p:czClone(c.p),style:c.style||'',created:S.day,updated:S.day});have.add(mcolH(c.p));n++});
 toast(n?MYC_T(`${n} costume(s) added to this save's Costume Library.`,`เพิ่ม ${n} ชุดเข้าคลังชุดของเซฟนี้แล้ว`)+(dup?MYC_T(` ${dup} already existed.`,` (มีอยู่แล้ว ${dup} ชุด)`):''):MYC_T('These costumes are already in this save.','ชุดเหล่านี้มีอยู่ในเซฟนี้แล้ว'),n?undefined:'err');mcolRe()}

// ---- setlist entries -----------------------------------------------------------------------------
function mcolSlFrom(s){let K=null;try{K=thKeysAll().find(x=>x.key==s.k)}catch(e){}return K&&K.gid!=S.ag?gsWith(K.gid,()=>mcolSlFrom0(s)):mcolSlFrom0(s)}
function mcolSlFrom0(s){const ds=[],dh=new Map(),dix=p=>{if(!p)return-1;const h=mcolH(p);if(!dh.has(h)){dh.set(h,ds.length);ds.push(czClone(p))}return dh.get(h)};
 const one=it=>{if(!it)return null;if(it.k=='ov')return{k:'ov',name:mcolTxt(it.name)||'Overture'};if(it.k=='mc')return{k:'mc',name:mcolTxt(it.name)||'MC',desc:mcolTxt(it.desc,120)};if(it.k!='song'||it.xs)return null;
  const o=S.songs[it.song];if(!o)return null;let cz=[];try{const M=thMem(s,it),ord=thForm(s,it,M).o;cz=ord.map(mid=>dix(thCzOf(it,mid))).filter(i=>i>=0);if(!cz.length){const p=thCzAny(it);if(p)cz=[dix(p)]}}catch(e){}
  return{k:'song',t:mcolTxt(o.title,100),g:mcolTxt(o.genre,30),c:mcolTxt(o.concept,30),cz}};
 return{id:mcolId(),name:mcolTxt(s.name)||'Stage',from:mcolTxt(`${mcolFrom()}${s.no?' · '+thLabel(s.k)+' '+ordN(s.no)+' Stage':''}`,80),at:Date.now(),items:(s.items||[]).map(one).filter(Boolean),enc:{on:!!(s.enc&&s.enc.on),items:((s.enc&&s.enc.items)||[]).map(one).filter(Boolean)},ds}}
const mcolSlH=E=>mcolH({n:E.name,i:E.items,e:E.enc,d:E.ds});
const mcolSlN=E=>[...E.items,...(E.enc.on?E.enc.items:[])].filter(x=>x.k=='song').length;
async function mcolSlSave(sid){const s=thStage(sid);if(!s)return;await mcolLoad();if(MCOL.d.sl.length>=MCOL_MAX.sl)return toast(MYC_T('My Collection is full.','คลังเต็มแล้ว'),'err');
 const E=mcolSlFrom(s);E.h=mcolSlH(E);if(MCOL.d.sl.some(x=>x.h==E.h))return toast(MYC_T('This setlist is already in My Collection.','เซ็ตลิสต์นี้อยู่ในคลังของฉันแล้ว'),'err');if(!mcolSlN(E))return toast(MYC_T('This Stage has no songs yet.','สเตจนี้ยังไม่มีเพลง'),'err');MCOL.d.sl.unshift(E);await mcolStore();
 toast(MYC_T(`Setlist “${E.name}” (${mcolSlN(E)} songs, ${E.ds.length} costume(s)) saved to My Collection.`,`บันทึกเซ็ตลิสต์ “${E.name}” (${mcolSlN(E)} เพลง ชุด ${E.ds.length} แบบ) ลงคลังของฉันแล้ว`));mcolRe()}
function mcolSlSaveCur(){const s=thEd();if(!s)return toast(MYC_T('Open a Stage first.','เปิดสเตจก่อน'),'err');mcolSlSave(s.id)}
// load a setlist as a new draft Stage of the current theater
function mcolSlUse(id){const E=MCOL.d&&MCOL.d.sl.find(x=>x.id==id);if(!E)return;const key=thCur();if(!key)return toast(MYC_T('Create a team or recruit Trainees first.','สร้างทีมหรือรับเทรนนีก่อน'),'err');
 if(typeof tapIsSp=='function'&&tapIsSp(key))return toast(MYC_T('Open a Team or Trainee theater first (Special Stages are set up from their own page).','เลือกโรงละครของทีมหรือเทรนนีก่อน (สเปเชียลสเตจตั้งค่าในหน้าของมันเอง)'),'err');
 const canNew=!thTr(key),H=thS(),sid='stg'+(++H.seq),P=thPool(key);
 const s=H.st[sid]={id:sid,k:key,tpl:sid,src:null,name:mcolTxt(E.name)||'Imported Stage',status:'draft',created:S.day,units:[],uv:2,enc:{on:!!E.enc.on,items:[]},cmode:'setlist',center:(P.slice().sort((a,b)=>b.pop-a.pop)[0]||{}).id||null,fmode:'global',gform:{o:[],fr:0},items:[],no:null,imp:{from:E.from||'',day:S.day}};
 const all=Object.values(S.songs||{}),miss=[];let made=0,cnt=0;
 const song=x=>{const lc=String(x.t||'').trim().toLowerCase();if(!lc)return null;let o=all.find(z=>String(z.title||'').toLowerCase()==lc&&thSongOk(z,key));if(o)return o;
  if(!canNew||all.some(z=>String(z.title||'').toLowerCase()==lc))return null;
  o=mkSong('Coupling',{title:cleanTitle(x.t)||'Song',genre:GENRES.includes(x.g)?x.g:'Dance Pop',concept:CONCEPTS.includes(x.c)?x.c:'Cute',th:{k:key,day:S.day,deb:null}});all.push(o);made++;return o};
 const build=(L,enc)=>{const out=[];L.forEach(x=>{if(x.k=='ov'){if(!enc&&!out.some(y=>y.k=='ov'))out.push({k:'ov',id:thUid(),name:x.name||'Overture'});return}
  if(x.k=='mc'){out.push({k:'mc',id:thUid(),name:x.name||'MC',desc:x.desc||'',mem:[],mm:'all'});return}
  if(cnt>=TH_MAXS){miss.push(x.t);return}const o=song(x);if(!o||(enc&&out.some(y=>y.song==o.id))){miss.push(x.t);return}cnt++;out.push({k:'song',id:thUid(),song:o.id,pt:'team',unit:null,center:null,cz:null,_cz:Array.isArray(x.cz)?x.cz:[]})});return out};
 s.items=build(E.items,0);s.enc.items=build(E.enc.items,1);
 if(!cnt){delete H.st[sid];return toast(MYC_T(`No song of “${E.name}” can be used in ${thLabel(key)}${miss.length?` (${miss.slice(0,3).join(', ')}${miss.length>3?'…':''})`:''}. ${canNew?'':'Trainee theaters can only use songs that already exist here.'}`,`ไม่มีเพลงใน “${E.name}” ที่ใช้ใน ${thLabel(key)} ได้${miss.length?` (${miss.slice(0,3).join(', ')}${miss.length>3?'…':''})`:''} ${canNew?'':'โรงละครเทรนนีใช้ได้เฉพาะเพลงที่มีอยู่ในเซฟนี้แล้ว'}`),'err')}
 let dressed=0;[...s.items,...s.enc.items].forEach(it=>{if(it.k!='song')return;const Z=(it._cz||[]).filter(i=>E.ds[i]);delete it._cz;if(!Z.length)return;try{const M=thMem(s,it),ord=thForm(s,it,M).o;ord.forEach((mid,k)=>{thSetOwn(it,mid,E.ds[Z[k%Z.length]])});dressed++}catch(e){console.error(e)}});
 ui.mod=null;ui.ths=sid;ui.thv='set';ui.thst='songs';view='thset';
 toast(MYC_T(`New Stage “${s.name}” created in ${thLabel(key)}: ${cnt} song(s)${made?`, ${made} new Theater song(s) created`:''}${dressed?`, costumes set for ${dressed} song(s)`:''}.${miss.length?` Not added: ${miss.slice(0,3).join(', ')}${miss.length>3?'…':''} (not available here).`:''} Choose members, Center and formations, then debut it as usual.`,
  `สร้างสเตจใหม่ “${s.name}” ใน ${thLabel(key)} แล้ว: ${cnt} เพลง${made?` (สร้างเพลงเธียเตอร์ใหม่ ${made} เพลง)`:''}${dressed?` ใส่ชุดแล้ว ${dressed} เพลง`:''}${miss.length?` · เพิ่มไม่ได้: ${miss.slice(0,3).join(', ')}${miss.length>3?'…':''} (ใช้ในโรงละครนี้ไม่ได้)`:''} · เลือกเมม เซ็นเตอร์ และฟอร์เมชันต่อได้เลย`),miss.length&&!cnt?'err':undefined);render()}

// ---- export / import ------------------------------------------------------------------------------
function mcolPack(czIds,slIds){const D=MCOL.d;return{iv48col:1,game:'IDOLVERSE48',at:Date.now(),cz:D.cz.filter(c=>czIds.includes(c.id)).map(({name,style,p})=>({name,style,p})),sl:D.sl.filter(x=>slIds.includes(x.id)).map(({name,from,items,enc,ds})=>({name,from,items,enc,ds}))}}
const mcolB64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
async function mcolCode(obj){const raw=new TextEncoder().encode(JSON.stringify(obj));try{if(typeof CompressionStream!='undefined'){const z=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());return'IV48C1:'+mcolB64(z)}}catch(e){}return'IV48C0:'+mcolB64(raw)}
async function mcolDecode(txt){txt=String(txt||'').trim();if(!txt)throw 0;if(txt[0]=='{')return JSON.parse(txt);const m=txt.replace(/\s+/g,'').match(/^IV48C([01]):(.+)$/);if(!m)throw 0;
 const bin=atob(m[2]),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);let out=u8;
 if(m[1]=='1')out=new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());return JSON.parse(new TextDecoder().decode(out))}
function mcolSel(){const P=ui.mcol||{},D=MCOL.d||{cz:[],sl:[]};return P.tab=='sl'?{cz:[],sl:P.sel.filter(id=>D.sl.some(x=>x.id==id))}:{cz:P.sel.filter(id=>D.cz.some(x=>x.id==id)),sl:[]}}
function mcolFileName(p){const one=p.cz.length+p.sl.length==1?(p.cz[0]||p.sl[0]).name:'collection';return`IDOLVERSE48_${p.sl.length&&!p.cz.length?'setlist':'costume'}_${String(one).replace(/[^\w฀-๿-]+/g,'_').slice(0,30)}.json`}
function mcolExportFile(){const q=mcolSel();if(!q.cz.length&&!q.sl.length)return toast(MYC_T('Select items first.','เลือกรายการก่อน'),'err');const p=mcolPack(q.cz,q.sl);
 try{const b=new Blob([JSON.stringify(p)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=mcolFileName(p);a.rel='noopener';document.body.appendChild(a);a.click();setTimeout(()=>{try{URL.revokeObjectURL(u);a.remove()}catch(e){}},60000);toast(MYC_T('File exported. Send it to a friend, then they import it in My Collection.','export ไฟล์แล้ว ส่งไฟล์ให้เพื่อน แล้วให้เพื่อนกดนำเข้าในคลังของฉัน'))}catch(e){toast(MYC_T('Export failed.','export ไม่สำเร็จ'),'err')}}
async function mcolShare(){const q=mcolSel();if(!q.cz.length&&!q.sl.length)return toast(MYC_T('Select items first.','เลือกรายการก่อน'),'err');const p=mcolPack(q.cz,q.sl);
 try{const f=new File([JSON.stringify(p)],mcolFileName(p),{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'IDOLVERSE48'});return}}catch(e){if(e&&e.name=='AbortError')return}
 mcolCopyCode()}
async function mcolCopyCode(){const q=mcolSel();if(!q.cz.length&&!q.sl.length)return toast(MYC_T('Select items first.','เลือกรายการก่อน'),'err');const code=await mcolCode(mcolPack(q.cz,q.sl));ui.mcol.code=code;
 let ok=false;try{await navigator.clipboard.writeText(code);ok=true}catch(e){}toast(ok?MYC_T(`Code copied (${(code.length/1024).toFixed(1)} KB). Paste it to a friend.`,`คัดลอกโค้ดแล้ว (${(code.length/1024).toFixed(1)} KB) วางส่งให้เพื่อนได้เลย`):MYC_T('Copy the code below.','คัดลอกโค้ดด้านล่าง'));mcolRe()}
function mcolCleanCz(c){const p=mcolClean(c&&c.p);if(!p||typeof p!='object'||Array.isArray(p)||!Object.keys(p).length)return null;return{name:mcolTxt(c.name)||'Costume',style:mcolTxt(c.style,20),p}}
function mcolCleanSl(x){if(!x||typeof x!='object')return null;const ds=(Array.isArray(x.ds)?x.ds:[]).slice(0,200).map(p=>{const q=mcolClean(p);return q&&typeof q=='object'&&!Array.isArray(q)?q:{}});
 const it=L=>(Array.isArray(L)?L:[]).slice(0,60).map(i=>{if(!i)return null;if(i.k=='ov')return{k:'ov',name:mcolTxt(i.name)||'Overture'};if(i.k=='mc')return{k:'mc',name:mcolTxt(i.name)||'MC',desc:mcolTxt(i.desc,120)};
  if(i.k=='song'&&mcolTxt(i.t,100))return{k:'song',t:mcolTxt(i.t,100),g:mcolTxt(i.g,30),c:mcolTxt(i.c,30),cz:(Array.isArray(i.cz)?i.cz:[]).slice(0,64).map(n=>n|0).filter(n=>n>=0&&n<ds.length)};return null}).filter(Boolean);
 const E={id:mcolId(),name:mcolTxt(x.name)||'Stage',from:mcolTxt(x.from,80),at:Date.now(),items:it(x.items),enc:{on:!!(x.enc&&x.enc.on),items:it(x.enc&&x.enc.items)},ds};return mcolSlN(E)?E:null}
async function mcolImportText(txt){await mcolLoad();let d;try{d=await mcolDecode(txt)}catch(e){return toast(MYC_T('This is not an IDOLVERSE48 collection file or code.','ไม่ใช่ไฟล์หรือโค้ดคลังของ IDOLVERSE48'),'err')}
 if(!d||typeof d!='object'||!d.iv48col)return toast(MYC_T('This is not an IDOLVERSE48 collection file or code. (Game save files are loaded in Management › Save & Load.)','ไม่ใช่ไฟล์คลังของ IDOLVERSE48 (ไฟล์เซฟเกมให้โหลดที่ เมนูจัดการ › Save & Load)'),'err');
 let nc=0,ns=0,dup=0;(Array.isArray(d.cz)?d.cz:[]).slice(0,MCOL_MAX.cz).forEach(c=>{const z=mcolCleanCz(c);if(!z)return;const r=mcolCzAdd(z.name,z.p,z.style,MYC_T('Imported','นำเข้า'));if(r>0)nc++;else if(r==0)dup++});
 (Array.isArray(d.sl)?d.sl:[]).slice(0,MCOL_MAX.sl).forEach(x=>{const E=mcolCleanSl(x);if(!E)return;E.h=mcolSlH(E);if(MCOL.d.sl.some(y=>(y.h||mcolSlH(y))==E.h)){dup++;return}if(MCOL.d.sl.length<MCOL_MAX.sl){MCOL.d.sl.unshift(E);ns++}});
 if(nc||ns)await mcolStore();ui.mcol.tab=ns&&!nc?'sl':'cz';ui.mcol.sel=[];ui.mcol.code='';
 toast(nc||ns?MYC_T(`Imported ${nc} costume(s) and ${ns} setlist(s) into My Collection.`,`นำเข้าแล้ว: ชุด ${nc} แบบ เซ็ตลิสต์ ${ns} รายการ`)+(dup?MYC_T(` ${dup} item(s) were already there.`,` (มีอยู่แล้ว ${dup} รายการ)`):''):(dup?MYC_T('Everything in it is already in My Collection.','ทุกรายการมีอยู่ในคลังของฉันแล้ว'):MYC_T('Nothing new to import.','ไม่มีรายการใหม่ให้นำเข้า')),nc||ns?undefined:'err');mcolRe()}
function mcolImportFile(inp){const f=inp&&inp.files&&inp.files[0];if(!f)return;if(f.size>8e6)return toast(MYC_T('The file is too large.','ไฟล์ใหญ่เกินไป'),'err');const r=new FileReader();r.onload=()=>mcolImportText(r.result);r.onerror=()=>toast(MYC_T('Could not read the file.','อ่านไฟล์ไม่ได้'),'err');r.readAsText(f);inp.value=''}
async function mcolDel(){const q=mcolSel(),n=q.cz.length+q.sl.length;if(!n)return;ask(MYC_T(`Delete ${n} item(s) from My Collection on this device? Saves are not affected.`,`ลบ ${n} รายการออกจากคลังของฉันในเครื่องนี้? เซฟเกมไม่ได้รับผลกระทบ`),async()=>{const D=MCOL.d;D.cz=D.cz.filter(c=>!q.cz.includes(c.id));D.sl=D.sl.filter(x=>!q.sl.includes(x.id));ui.mcol.sel=[];await mcolStore();toast(MYC_T('Deleted.','ลบแล้ว'));mcolRe()},MYC_T('Delete','ลบ'))}

// ---- UI ----------------------------------------------------------------------------------------------
const MCOL_IMG=new Map();
function mcolThumb(p,w){const m=S.members.find(x=>isAct(x))||S.members[0];if(!m||!p)return'';const k=mcolH(p)+'|'+m.id+'|'+w;let h=MCOL_IMG.get(k);if(h)return h;
 try{let svg=czDesignThumb({p},m,w);svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));h=`<img src="${u}" width="${w}" alt="" decoding="async" loading="lazy">`}catch(e){h=''}
 if(MCOL_IMG.size>600){for(const[kk,v]of MCOL_IMG){const mm=v.match(/src="([^"]+)"/);if(mm)try{URL.revokeObjectURL(mm[1])}catch(e){}MCOL_IMG.delete(kk);if(MCOL_IMG.size<400)break}}MCOL_IMG.set(k,h);return h}
function mcolOpen(tab){ui.mcol={tab:tab||(ui.mcol&&ui.mcol.tab)||'cz',sel:[],pick:null,psel:[],code:''};ui.mod={t:'html',mcol:1,h:`<h2 class="ht">${MYC_T('My Collection','คลังของฉัน')}</h2><p class="st">${MYC_T('Loading…','กำลังโหลด…')}</p>`};render();mcolLoad().then(()=>mcolRe())}
function mcolRe(){if(ui.mod&&ui.mod.mcol){ui.mod.h=mcolHtml();render()}}
function mcolTab(t){Object.assign(ui.mcol,{tab:t,sel:[],pick:null,psel:[],code:''});mcolRe()}
function mcolTog(id){const L=ui.mcol.sel,i=L.indexOf(id);if(i>=0)L.splice(i,1);else L.push(id);mcolRe()}
function mcolAll(on){const D=MCOL.d;ui.mcol.sel=on?(ui.mcol.tab=='sl'?D.sl:D.cz).map(x=>x.id):[];mcolRe()}
function mcolPick(on){ui.mcol.pick=on?ui.mcol.tab:null;ui.mcol.psel=[];mcolRe()}
function mcolPTog(id){const L=ui.mcol.psel,i=L.indexOf(id);if(i>=0)L.splice(i,1);else L.push(id);mcolRe()}
async function mcolPickSave(){const P=ui.mcol,ids=P.psel.slice();if(!ids.length)return;if(P.pick=='cz')await mcolCzSaveIds(ids);else{for(const id of ids)await mcolSlSave(id)}P.pick=null;P.psel=[];mcolRe()}
function mcolStagesAll(){try{const ki=new Map(thKeysAll().map((K,i)=>[K.key,i]));return Object.values(thS().st).filter(s=>thAll(s).length).sort((a,b)=>(ki.get(a.k)??99)-(ki.get(b.k)??99)||(a.no||999)-(b.no||999)||(a.created|0)-(b.created|0))}catch(e){return[]}}
function mcolHtml(){const P=ui.mcol,D=MCOL.d||mcolFix(null),tab=P.tab,key=thCurSafe();
 const tabs=`<div class="row mcoltabs">${[['cz',MYC_T('Costumes','ชุด'),D.cz.length],['sl',MYC_T('Stage setlists','เซ็ตลิสต์สเตจ'),D.sl.length],['im',MYC_T('Import','นำเข้า'),'']].map(([k,n,c])=>`<button class="b s ${tab==k?'on':''}" onclick="mcolTab('${k}')">${n}${c!==''?` (${c})`:''}</button>`).join('')}</div>`;
 const head=`<h2 class="ht">${MYC_T('My Collection','คลังของฉัน')}</h2><p class="st">${MYC_T('Kept on this device, outside your saves: use them in any save, or export a file / code to send to a friend.','เก็บไว้ในเครื่องนี้ แยกจากเซฟ ใช้ได้กับทุกเซฟ หรือ export เป็นไฟล์/โค้ดส่งให้เพื่อน')}</p>${tabs}`;
 const close=`<div class="row"><button class="b" onclick="ui.mod=null;render()">${MYC_T('Close','ปิด')}</button></div>`;
 if(tab=='im')return head+`<div class="c mcolim"><h3>${MYC_T('From a file','จากไฟล์')}</h3><p class="st">${MYC_T('Choose a .json file exported from My Collection.','เลือกไฟล์ .json ที่ export จากคลังของฉัน')}</p><input type="file" accept=".json,.txt,application/json,text/plain" onchange="mcolImportFile(this)">
  <h3>${MYC_T('From a code','จากโค้ด')}</h3><textarea id="mcolin" rows="4" placeholder="IV48C1:…" style="width:100%"></textarea><div class="row"><button class="b p" onclick="mcolImportText($('#mcolin').value)">${MYC_T('Import code','นำเข้าโค้ด')}</button></div>
  <p class="st">${MYC_T('Imported items go into My Collection first. Then use “Add to this save” (costumes) or “Create Stage” (setlists).','รายการที่นำเข้าจะอยู่ในคลังของฉันก่อน จากนั้นกด “เพิ่มเข้าเซฟนี้” (ชุด) หรือ “สร้างเป็นสเตจ” (เซ็ตลิสต์)')}</p></div>`+close;
 // picker: choose from this save
 if(P.pick=='cz'){const L=czLib().ds.filter(d=>d.p);return head+`<div class="c"><h3>${MYC_T('Choose costumes from this save','เลือกชุดจากเซฟนี้')}</h3><div class="row"><button class="b s" onclick="ui.mcol.psel=${esc(JSON.stringify([]))};mcolRe()">${MYC_T('Clear','ล้าง')}</button><button class="b s" onclick='ui.mcol.psel=${JSON.stringify(L.map(d=>d.id))};mcolRe()'>${MYC_T('Select all','เลือกทั้งหมด')}</button></div>
  <div class="mcolgrid">${L.map(d=>`<button class="mcolcard ${P.psel.includes(d.id)?'on':''}" onclick="mcolPTog('${d.id}')">${mcolThumb(d.p,64)}<b>${esc(d.name)}</b></button>`).join('')||`<p class="st">${MYC_T('This save has no costumes yet.','เซฟนี้ยังไม่มีชุด')}</p>`}</div>
  <div class="row mcolbar"><button class="b p" ${P.psel.length?'':'disabled'} onclick="mcolPickSave()">${MYC_T('Save to My Collection','บันทึกลงคลังของฉัน')} (${P.psel.length})</button><button class="b" onclick="mcolPick(0)">${MYC_T('Back','กลับ')}</button></div></div>`}
 if(P.pick=='sl'){const L=mcolStagesAll();return head+`<div class="c"><h3>${MYC_T('Choose Stages from this save','เลือกสเตจจากเซฟนี้')}</h3><div class="mcolsl">${L.map(s=>`<button class="mcolrow ${P.psel.includes(s.id)?'on':''}" onclick="mcolPTog('${s.id}')"><span class="mcolck">${P.psel.includes(s.id)?'✓':''}</span><span><b>${esc(s.name)}</b><small class="st">${esc(mcolGrpOf(s))}${esc(thLabel(s.k))}${s.no?' · '+ordN(s.no)+' Stage':''}${s.gst?' · '+MYC_T('Graduation','จบการศึกษา'):''} · ${thAll(s).length} ${MYC_T('songs','เพลง')}</small></span></button>`).join('')||`<p class="st">${MYC_T('No Stages with songs yet.','ยังไม่มีสเตจที่มีเพลง')}</p>`}</div>
  <div class="row mcolbar"><button class="b p" ${P.psel.length?'':'disabled'} onclick="mcolPickSave()">${MYC_T('Save to My Collection','บันทึกลงคลังของฉัน')} (${P.psel.length})</button><button class="b" onclick="mcolPick(0)">${MYC_T('Back','กลับ')}</button></div></div>`}
 const L=tab=='sl'?D.sl:D.cz,ns=P.sel.length;
 const top=`<div class="row"><button class="b p" onclick="mcolPick(1)">＋ ${tab=='sl'?MYC_T('Save setlists from this save','บันทึกเซ็ตลิสต์จากเซฟนี้'):MYC_T('Save costumes from this save','บันทึกชุดจากเซฟนี้')}</button>${L.length?`<button class="b s" onclick="mcolAll(${ns<L.length?1:0})">${ns<L.length?MYC_T('Select all','เลือกทั้งหมด'):MYC_T('Clear','ล้าง')}</button>`:''}</div>`;
 const list=tab=='sl'?`<div class="mcolsl">${L.map(E=>{const on=P.sel.includes(E.id),songs=[...E.items,...(E.enc.on?E.enc.items:[])].filter(x=>x.k=='song');return`<div class="mcolrow2 ${on?'on':''}"><button class="mcolck" onclick="mcolTog('${E.id}')" aria-label="select">${on?'✓':''}</button><div class="mcolslb" onclick="mcolTog('${E.id}')"><b>${esc(E.name)}</b><small class="st">${songs.length} ${MYC_T('songs','เพลง')} · ${E.ds.length} ${MYC_T('costume(s)','ชุด')}${E.from?' · '+esc(E.from):''}</small><small class="mcolst">${songs.slice(0,6).map(x=>esc(x.t)).join(' · ')}${songs.length>6?' …':''}</small><span class="mcolths">${E.ds.slice(0,4).map(p=>mcolThumb(p,30)).join('')}</span></div>${key?`<button class="b s p" onclick="mcolSlUse('${E.id}')">${MYC_T('Create Stage','สร้างเป็นสเตจ')}</button>`:''}</div>`}).join('')}</div>`
  :`<div class="mcolgrid">${L.map(c=>`<button class="mcolcard ${P.sel.includes(c.id)?'on':''}" onclick="mcolTog('${c.id}')">${mcolThumb(c.p,64)}<b>${esc(c.name)}</b>${c.from?`<small>${esc(c.from)}</small>`:''}</button>`).join('')}</div>`;
 const empty=!L.length?`<p class="st">${tab=='sl'?MYC_T('No setlists yet. Save one from this save, or import a file / code from a friend.','ยังไม่มีเซ็ตลิสต์ บันทึกจากเซฟนี้ หรือนำเข้าไฟล์/โค้ดจากเพื่อน'):MYC_T('No costumes yet. Save some from this save, or import a file / code from a friend.','ยังไม่มีชุด บันทึกจากเซฟนี้ หรือนำเข้าไฟล์/โค้ดจากเพื่อน')}</p>`:'';
 const bar=L.length?`<div class="row mcolbar"><span class="st">${MYC_T('Selected','เลือกแล้ว')} ${ns}</span>${tab=='cz'?`<button class="b p" ${ns?'':'disabled'} onclick="mcolCzUse(ui.mcol.sel)">${MYC_T('Add to this save','เพิ่มเข้าเซฟนี้')}</button>`:''}<button class="b" ${ns?'':'disabled'} onclick="mcolExportFile()">${MYC_T('Export file','Export ไฟล์')}</button><button class="b" ${ns?'':'disabled'} onclick="mcolCopyCode()">${MYC_T('Copy code','คัดลอกโค้ด')}</button>${navigator.share?`<button class="b" ${ns?'':'disabled'} onclick="mcolShare()">${MYC_T('Share','แชร์')}</button>`:''}<button class="b" ${ns?'':'disabled'} onclick="mcolDel()">${MYC_T('Delete','ลบ')}</button></div>`:'';
 const code=P.code?`<div class="c"><p class="st">${MYC_T('Share code','โค้ดสำหรับส่งให้เพื่อน')} (${(P.code.length/1024).toFixed(1)} KB)</p><textarea rows="3" readonly style="width:100%" onclick="this.select()">${esc(P.code)}</textarea></div>`:'';
 const note=tab=='sl'?`<p class="st">${key?MYC_T(`“Create Stage” adds a new draft Stage to ${thLabel(key)} (the theater open in Theater). Songs are matched by title; songs this save does not have become new Theater songs. Costumes go to the performers in formation order; members, Center and formations are chosen in this save.`,`“สร้างเป็นสเตจ” จะเพิ่มสเตจร่างใหม่ใน ${thLabel(key)} (โรงละครที่เปิดอยู่ในหน้าเธียเตอร์) เพลงจับคู่ตามชื่อ เพลงที่เซฟนี้ไม่มีจะถูกสร้างเป็นเพลงเธียเตอร์ใหม่ ชุดจะใส่ให้เมมตามลำดับตำแหน่ง ส่วนเมม เซ็นเตอร์ และฟอร์เมชันเลือกใหม่ในเซฟนี้`):MYC_T('Create a team first to load setlists.','สร้างทีมก่อนจึงจะโหลดเซ็ตลิสต์ได้')}</p>`:'';
 return head+`<div class="c">${top}${list}${empty}${bar}</div>${code}${note}`+close}
const mcolGrpOf=s=>{try{if(S.groups.length<2)return'';const K=thKeysAll().find(x=>x.key==s.k),g=K&&grp(K.gid);return g?g.name+' · ':''}catch(e){return''}};
const thCurSafe=()=>{try{return thCur()}catch(e){return null}};

// ---- entry points ------------------------------------------------------------------------------------
{const f=V.costume;V.costume=function(){let h=f.apply(this,arguments);try{h=h.replace('<b class="czt">Costume library</b>',`<b class="czt">Costume library</b><button class="b s mcolbtn" onclick="mcolOpen('cz')">${MYC_T('My Collection','คลังของฉัน')}</button>`).replace('onclick="czDup()">Duplicate</button>',`onclick="czDup()">Duplicate</button><button class="b s" onclick="mcolCzSaveCur()">${MYC_T('Save to My Collection','บันทึกลงคลังของฉัน')}</button>`)}catch(e){console.error(e)}return h}}
{const f=V.thset;V.thset=function(){let h=f.apply(this,arguments);try{const s=thEd();h=`<div class="row mcolth">${s&&thAll(s).length?`<button class="b s" onclick="mcolSlSaveCur()">${MYC_T('Save this setlist to My Collection','บันทึกเซ็ตลิสต์นี้ลงคลังของฉัน')}</button>`:''}<button class="b s" onclick="mcolOpen('sl')">${MYC_T('Load a setlist from My Collection','โหลดเซ็ตลิสต์จากคลังของฉัน')}</button></div>`+h}catch(e){console.error(e)}return h}}
{const f=V.thstage;V.thstage=function(){let h=f.apply(this,arguments);try{if(thCur())h=`<div class="row mcolth"><button class="b s" onclick="mcolOpen('sl')">${MYC_T('My Collection · setlists','คลังของฉัน · เซ็ตลิสต์')}</button></div>`+h}catch(e){console.error(e)}return h}}
