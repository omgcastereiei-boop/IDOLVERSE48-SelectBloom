// =====================================================================================
//  IDOLVERSE48: Select Bloom! — songs, Center and costume for External Events & Roadshows
// -------------------------------------------------------------------------------------
//  · One song picker (like the Concert setlist picker): Group · Single · Stage · Team tabs and
//    a search. Songs of every group are offered — a sister group can sing the main group's
//    songs and the main group can sing a sister group's songs. Used by External Events and by
//    the Roadshow setlists (Day 1 / Day 2).
//  · External Events: each song has its own Center (tap a face to make her the Center, or use
//    the Center menu). The setlist, Centers and the event costume can still be changed after
//    accepting, until the day before the event — also for offers where the organizer chose
//    the members.
//  · Event costume: one costume for everyone (from the Costume library), or the members' own
//    outfits. It is shown on the event pictures.
// =====================================================================================
// ---- 1. shared song picker -----------------------------------------------------------------------------------------------
function spkOn(t){return!!(ui.spk&&ui.spk.t==t)}
function spkBtn(t){return`<button class="b s ${spkOn(t)?'on':'p'}" onclick="spkTog('${t}')">🎵 ${spkOn(t)?'Close song list':'Add songs (all groups)'}</button>`}
function spkTog(t){ui.spk=spkOn(t)?null:{t,tab:(ui.spk&&ui.spk.tab)||'single',q:''};render()}
function spkHave(t){if(t=='xe'){const r=xeGet(ui.xe);return(r?xeL(r):[]).map(z=>z.gid+':'+z.song)}if(t.startsWith('rs:')){const P=ui.rsp,sl=P&&P[t=='rs:2'?'sl2':'sl1']||[],ag=gsAg();return sl.filter(z=>z.k=='s').map(z=>(z.gid??ag)+':'+z.id)}return[]}
function spkPanel(t){if(!spkOn(t))return'';const P=ui.spk;let D;try{D=ccPickData()}catch(e){console.error(e);return''}
 const q=(P.q||'').toLowerCase(),have=new Set(spkHave(t)),T=[['grp','Group'],['single','Single'],['stage','Stage'],['team','Team']],blocks=(D[P.tab]||[]).map(b=>({...b,L:b.L.filter(x=>!q||String(x.o.title).toLowerCase().includes(q))})).filter(b=>b.L.length);
 return`<div class="c spk"><div class="row cctabs">${T.map(([k,n])=>`<button class="b s ${P.tab==k?'p':''}" onclick="ui.spk.tab='${k}';render()">${n}</button>`).join('')}</div><input class="ccpkq" placeholder="Search songs" value="${esc(P.q||'')}" onchange="ui.spk.q=this.value;render()">
 <div class="ccpk">${blocks.map(b=>`<details open class="ccpkb"><summary><b>${esc(b.h)}</b> <small class="st">${esc(b.sub||'')}</small></summary>${b.L.map(x=>{const k=x.gid+':'+x.o.id,on=have.has(k);return`<div class="row ccpki"><div style="flex:1;min-width:0"><b>${esc(x.o.title)}</b><small class="st">${esc((grp(x.gid)||{}).name||'')}${x.o.role?' · '+esc(x.o.role):''}${x.o.genre?' · '+esc(x.o.genre):''}</small></div>${on?'<span class="tag">In setlist</span>':`<button class="b s p" onclick="spkAdd('${t}','${k}')">+ Add</button>`}</div>`}).join('')}</details>`).join('')||`<p class="st">${P.tab=='stage'||P.tab=='team'?'No Theater Stage songs yet.':'No songs match.'}</p>`}</div></div>`}
function spkAdd(t,k){const i=k.indexOf(':'),gid=+k.slice(0,i),id=k.slice(i+1);
 if(t=='xe')return xeSongAdd2(gid,id);
 if(t.startsWith('rs:')){const P=ui.rsp;if(!P)return;const d=t=='rs:2'?2:1,key=d==2?'sl2':'sl1',sl=P[key];if(P.smode=='random')return toast('Switch to Custom or Same to edit by hand, or regenerate.','err');if(sl.length>=CFG.rs.max)return toast(`A day can have at most ${CFG.rs.max} entries (songs and MC together).`,'err');
  sl.push(gid==gsAg()?{k:'s',id}:{k:'s',id,gid});const o=gsCtx(gid,'songs')||{};toast(`Added “${(o[id]||{}).title||''}”.`);render()}}
// ---- 2. External Events: the setlist being edited (offer draft, or the accepted event) ---------------------------------------
const xeEditable=r=>!!r&&((r.status=='open'&&r.mode=='player')||(r.status=='accepted'&&S.day<r.day));
function xeL(r){if(r.status=='open')return xeSelOf(r).songs;r.set=r.set||[];return r.set}
function xeM(r){return r.status=='open'?xeSelOf(r).sel:(r.sel||[])}
function xeR0(){const r=xeGet(ui.xe);return xeEditable(r)?r:null}
function xeSongAdd2(gid,song){const r=xeR0();if(!r)return;const L=xeL(r),max=r.songs||8;if(L.length>=max)return toast(`This event asks for ${max} song(s).`,'err');if(L.some(z=>z.song==song&&z.gid==gid))return;
 const t=((gsCtx(gid,'songs')||{})[song]||{}).title||'?',o=xeM(r).slice().sort((a,b)=>((get(b)||{}).pop||0)-((get(a)||{}).pop||0));L.push({gid,song,title:t,center:o[0]??null,o});xeTouch(r);toast(`Added “${t}”.`);render()}
xeSongAdd=function(v){if(!v)return;const[gid,song]=String(v).split('|');xeSongAdd2(+gid,song)};
xeSongMv=function(i,d){const r=xeR0();if(!r)return;const L=xeL(r),j=i+d;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];xeTouch(r);render()};
xeSongRm=function(i){const r=xeR0();if(!r)return;xeL(r).splice(i,1);xeTouch(r);render()};
xeSongCen=function(i,v){const r=xeR0();if(!r)return;const z=xeL(r)[i];if(z){z.center=v===''||v==null?null:+v;if(z.center!=null)z.o=[z.center,...z.o.filter(x=>x!=z.center)]}xeTouch(r);render()};
xePosMv=function(i,mid,d){const r=xeR0();if(!r)return;const z=xeL(r)[i];if(!z)return;const k=z.o.indexOf(mid),j=k+d;if(k<0||j<0||j>=z.o.length)return;[z.o[k],z.o[j]]=[z.o[j],z.o[k]];xeTouch(r);render()};
// accepted events: keep every song's members in step with the booked members, refresh the pictures
function xeTouch(r){if(r.status!='accepted')return;const sel=r.sel||[];(r.set||[]).forEach(z=>{z.o=z.o.filter(id=>sel.includes(id));sel.forEach(id=>{if(!z.o.includes(id))z.o.push(id)});if(z.center!=null&&!sel.includes(z.center))z.center=z.o[0]??null});xeArtFix(r)}
function xeArtFix(r){try{if(!r.art||r.status=='done')return;const ids=r.sel&&r.sel.length?r.sel:(r.req||[]).map(q=>q.mid),z0=(r.set||[])[0],a=xeArtMake(r,z0&&z0.center!=null?[z0.center,...ids.filter(x=>x!=z0.center)]:ids,z0&&z0.gid==gsAg()?z0.song:null);
 const d=r.cz&&czD(r.cz);if(d&&d.p){a.cd=[JSON.parse(JSON.stringify(d.p))];a.m.forEach(x=>{x.c=0})}if(z0&&z0.center!=null)a.center=z0.center;r.art={...a,seed:r.art.seed,hue:r.art.hue}}catch(e){console.error(e)}}
// ---- 3. the setlist editor (offer selection page and accepted event page) --------------------------------------------------
function xeSetEdHtml(r){const L=xeL(r),max=r.songs||0,acc=r.status=='accepted';
 return`<div class="c xeset"><h3>Setlist (${L.length}/${max} song(s))</h3><p class="st">Songs of every group can be used (sister and main groups). Tap a face to make her the Center of that song; ◀ ▶ change the positions. Saved for this event only — the songs' original Senbatsu, Center and formation never change.${acc?` You can change it until ${jd(r.day-1)}.`:''}</p>
 ${L.map((z,i)=>`<div class="c xesong"><div class="row"><b>${i+1}. ${esc(z.title)}</b><span class="st">${esc((grp(z.gid)||{}).name||'')}</span><button class="b s" onclick="xeSongMv(${i},-1)">▲</button><button class="b s" onclick="xeSongMv(${i},1)">▼</button><button class="b s" onclick="xeSongRm(${i})">✕</button><label class="st">Center <select onchange="xeSongCen(${i},this.value)"><option value="">No Center</option>${z.o.map(id=>`<option value="${id}" ${z.center==id?'selected':''}>${esc((get(id)||{}).name||'')}</option>`).join('')}</select></label></div>
  <div class="xepos">${z.o.map((id,k)=>{const m=get(id);return m?`<span class="xep ${z.center==id?'cen':''}"><button class="xepf" title="Make ${esc(m.name)} the Center" onclick="xeSongCen(${i},${id})">${ptc(m,34)}${z.center==id?'<i>★</i>':''}</button><small>${z.center==id?'Center':'#'+(k+1)}</small><span><button class="b s" onclick="xePosMv(${i},${id},-1)">◀</button><button class="b s" onclick="xePosMv(${i},${id},1)">▶</button></span></span>`:''}).join('')}</div></div>`).join('')}
 ${L.length<max?`<div class="row">${spkBtn('xe')}</div>${spkPanel('xe')}`:''}</div>`}
// ---- 4. event costume (one for everyone) ----------------------------------------------------------------------------------
function xeCzOf(r){return r.status=='open'?xeSelOf(r).cz||null:r.cz||null}
function xeCzSet(did){const r=xeR0();if(!r)return;if(r.status=='open')xeSelOf(r).cz=did||null;else{r.cz=did||null;xeArtFix(r)}ui.xecz=0;render()}
function xeCzHtml(r){const cur=xeCzOf(r),d=cur&&czD(cur),ids=xeM(r),m=get(ids[0])||S.members.find(x=>x.status!='graduated');const L=czLib().ds.filter(x=>x&&x.p);
 return`<div class="c xecz"><h3>Event costume</h3><div class="row">${d&&m?czDesignThumb(d,m,40):''}<b>${d?esc(d.name||'Costume'):"Members' own outfits"}</b><span class="st">one costume for every member at this event</span><button class="b s ${ui.xecz?'on':'p'}" onclick="ui.xecz=ui.xecz?0:1;render()">${ui.xecz?'Close':'Choose costume'}</button>${d?'<button class="b s" onclick="xeCzSet(null)">Own outfits</button>':''}</div>
 ${ui.xecz?`<div class="xeczl">${L.length?L.slice().reverse().map(x=>`<button class="c xeczi ${x.id==cur?'on':''}" onclick="xeCzSet('${x.id}')">${m?czDesignThumb(x,m,46):''}<small>${esc(x.name||'Costume')}</small></button>`).join(''):'<p class="st">No costumes in the Costume library yet.</p>'}</div>`:''}</div>`}
// ---- 5. pages -------------------------------------------------------------------------------------------------------------
{const f=V.xesel;V.xesel=function(){let h=f.apply(this,arguments);try{const r=xeGet(ui.xe);if(!r||r.mode!='player'||r.status!='open')return h;
  const a=h.indexOf('<div class="c"><h3>Setlist ('),E=h.indexOf('<div class="c geerr">')>=0?h.indexOf('<div class="c geerr">'):h.indexOf('<div class="row"><button class="b p"',a<0?0:a);
  if(a>=0&&E>a)h=h.slice(0,a)+xeSetEdHtml(r)+h.slice(E);
  const k=h.indexOf('<div class="c geerr">')>=0?h.indexOf('<div class="c geerr">'):h.lastIndexOf('<div class="row"><button class="b p"');if(k>=0)h=h.slice(0,k)+xeCzHtml(r)+h.slice(k)}catch(e){console.error(e)}return h}}
{const f=V.xedet;V.xedet=function(){let h=f.apply(this,arguments);try{const r=xeGet(ui.xe);if(!r)return h;const live=(r.acts||[]).includes('live')&&r.ch!='mp';
  const s0=h.indexOf('<div class="c"><h3>Setlist</h3>');let s1=s0>=0?h.indexOf('</ol></div>',s0):-1;if(s1>=0)s1+=11;
  if(r.status=='accepted'&&S.day<r.day&&live){const blk=(r.songs?xeSetEdHtml(r):'')+xeCzHtml(r);if(s0>=0)h=h.slice(0,s0)+blk+h.slice(s1);else{const i=h.lastIndexOf('<div class="row">');h=i>=0?h.slice(0,i)+blk+h.slice(i):h+blk}}
  else if(r.cz&&czD(r.cz)){const d=czD(r.cz),m=get((r.sel||[])[0]);h=h.replace('<div class="c"><h3>Setlist</h3>',`<div class="c"><h3>Event costume</h3><div class="row">${m?czDesignThumb(d,m,44):''}<b>${esc(d.name||'Costume')}</b></div></div><div class="c"><h3>Setlist</h3>`)}}catch(e){console.error(e)}return h}}
// accepting an offer keeps the chosen costume
{const f=xeDoAccept;xeDoAccept=function(r,ids,set){const cz=r&&r.draft&&r.draft.cz;const ok=f.apply(this,arguments);try{if(ok&&r){if(cz)r.cz=cz;if(r.cz||(r.set&&r.set.length))xeArtFix(r)}}catch(e){console.error(e)}return ok}}
// changing pages closes the picker
{const f=goView;goView=function(){ui.spk=null;ui.xecz=0;return f.apply(this,arguments)}}
