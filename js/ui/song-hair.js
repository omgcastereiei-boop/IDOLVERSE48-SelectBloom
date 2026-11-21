// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Song-specific member hairstyles (Costume Design → Hairstyle)
// -------------------------------------------------------------------------------------
//  Each song can give each of its members her own hairstyle for that song only:
//    song.hz[memberId] = { ft bangs, sx side locks, bk back hair, bkx mixed back-hair layers,
//                          ah ahoge, hc / hcx / hc2x hair colour }
//  · The member's profile appearance (m.ap) is never written.
//  · The hairstyle rides on that member's costume for the song (czFor), so every picture that
//    draws the song costume — song / Senbatsu previews, release-day and event pictures, covers,
//    MV previews — shows it. Costumes and hairstyles are saved separately: changing one never
//    changes the other, and nothing is copied between songs or members.
//  · Hairstyle section in the song Costume Design page: Use default / Customize, the existing
//    Bangs · Side Locks · Back Hair (with layers) · Ahoge · Hair Color editors, Save, Reset.
// =====================================================================================
const HZK=['ft','sx','bk','bkx','ah','hc','hcx','hc2x'];
const hzPick=a=>{const o={};HZK.forEach(k=>{if(a[k]!==undefined&&a[k]!==null)o[k]=k=='bkx'?JSON.parse(JSON.stringify(a[k])):a[k]});return o};
// a costume without the song hairstyle (profile costume and other places that must not change her hair)
function hzStrip(p){if(!p||!p.hair)return p;const q={...p};delete q.hair;return q}
const hzOf=(o,mid)=>(o&&o.hz&&o.hz[mid])||null;
// ---- rendering: a costume carrying .hair draws the head with that hair --------------------------------------------------
{const f=headParts;headParts=function(m,ex,id,opt={}){let a0=null;try{a0=opt.a||apEff(m)}catch(e){}const H=a0&&a0.cd&&a0.cd.hair;if(!H)return f.apply(this,arguments);
 const cd={...a0.cd};delete cd.hair;const a={...a0,cd};HZK.forEach(k=>{delete a[k]});['hc','bk','ft'].forEach(k=>{if(a0[k]!=null)a[k]=a0[k]});Object.assign(a,JSON.parse(JSON.stringify(H)));
 return f.call(this,m,ex,id,{...opt,a})}}
{const f=czFor;czFor=function(o,mid){const p=f.apply(this,arguments),H=hzOf(o,mid);return p&&H?{...p,hair:H}:p}}
// stored costumes never carry a hairstyle (copies, saves, library)
{const f=plCzLoad;plCzLoad=function(){const r=f.apply(this,arguments);try{if(ui.czE&&ui.czE.p&&ui.czE.p.hair)delete ui.czE.p.hair}catch(e){}return r}}
// ---- editor state: the Character Creator panels edit a temporary draft --------------------------------------------------
function hzSongs(mid){const p=S.pj;if(!p)return[];return plTracks(p).map(i=>S.songs[i]).filter(o=>o&&czMembers(o).some(m=>m.id==mid))}
function hzCur(){const s=ui.scz;if(!s)return null;const mid=s.mid,L=hzSongs(mid);if(!L.length)return null;const page=S.songs[s.song]?s.song:null,z=ui.shz,want=(z&&z.mid==mid&&z.song&&z.page==s.song)?z.song:page;const o=L.find(x=>x.id==want)||L[0];return{mid,o,L}}
function hzEnd(){const z=ui.shz;if(z&&z.edit&&z.bak){ui.draft=z.bak.draft;ui.cm=z.bak.cm;ui.apLay=z.bak.apLay;ui.apCat=z.bak.apCat}if(z){z.edit=0;z.bak=null}}
function hzSong(id){hzEnd();const C=hzCur();ui.shz={mid:C?C.mid:null,song:id,page:ui.scz&&ui.scz.song,edit:0};render()}
function hzEdit(){const C=hzCur();if(!C)return;if(lockedSong(C.o.id))return toast('The release is in production: costumes and hairstyles are locked.','err');const m=get(C.mid);if(!m)return;
 ui.shz={mid:C.mid,song:C.o.id,page:ui.scz.song,edit:1,cat:(ui.shz&&ui.shz.cat)||'back',bak:{draft:ui.draft,cm:ui.cm,apLay:ui.apLay,apCat:ui.apCat}};ui.cm=m.id;ui.apLay=null;ui.draft={...ap(m),...JSON.parse(JSON.stringify(hzOf(C.o,m.id)||{}))};render()}
function hzSave(){const z=ui.shz,C=hzCur();if(!z||!z.edit||!C)return;const o=C.o,m=get(C.mid);if(lockedSong(o.id))return toast('The release is in production: costumes and hairstyles are locked.','err');
 o.hz=o.hz||{};o.hz[m.id]=hzPick(ui.draft);hzEnd();toast(`Hairstyle for ${m.name} in "${o.title}" saved.`);render()}
function hzCancel(){hzEnd();render()}
function hzReset(){const C=hzCur();if(!C)return;const o=C.o,m=get(C.mid);if(lockedSong(o.id))return toast('The release is in production: costumes and hairstyles are locked.','err');if(o.hz)delete o.hz[m.id];hzEnd();toast(`${m.name} uses her default hairstyle in "${o.title}".`);render()}
function hzCat(k){if(ui.shz){ui.shz.cat=k;render()}}
// preview: the member in this song's costume with the hairstyle being edited
function hzPrev(){const C=hzCur();if(!C)return'';const m=get(C.mid),cd=czFor(C.o,m.id),base=cd?{...cd}:null;if(base)delete base.hair;const a=ui.shz&&ui.shz.edit?{...ui.draft}:{...ap(m),...(hzOf(C.o,m.id)||{})};if(base)a.cd=base;
 const pm={...m,_x:1,ap:a};return`<div class="approw">${pt(pm,0)}<div class="apfull">${CHAR_ASSETS.full(pm)}</div></div>`}
{const f=apPrevHtml;apPrevHtml=function(){if(view=='songcz'&&ui.shz&&ui.shz.edit)return hzPrev();return f.apply(this,arguments)}}
const HZ_CATS=[['bangs','Bangs'],['side','Side Locks'],['back','Back Hair'],['ahoge','Ahoge'],['hair','Hair Color']];
function hzHtml(){const C=hzCur();if(!C)return'';const m=get(C.mid),o=C.o,H=hzOf(o,m.id),z=ui.shz&&ui.shz.mid==m.id&&ui.shz.song==o.id?ui.shz:null,ed=z&&z.edit,lock=lockedSong(o.id);
 const sum=H?`Custom: ${esc(FTN[H.ft]||'—')} · ${esc(BKN[H.bk]||'—')}${(H.bkx||[]).filter(L=>!L.m).length?` + ${(H.bkx||[]).filter(L=>!L.m).length} layer(s)`:''}${H.sx?' · '+esc(SXN[H.sx]||''):''}`:'Default hairstyle (her profile hairstyle)';
 const songSel=C.L.length>1?`<label class="st">Song <select onchange="hzSong(this.value)">${C.L.map(x=>`<option value="${x.id}" ${x.id==o.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select></label>`:`<span class="st">“${esc(o.title)}”</span>`;
 let body='';
 if(ed){const cat=HZ_CATS.some(c=>c[0]==z.cat)?z.cat:'back';body=`<div class="apcr hzed"><div class="c cprev stage apside"><div id="apprev">${hzPrev()}</div><div class="row" style="justify-content:center"><button class="b p" onclick="hzSave()">💾 Save hairstyle for this song</button><button class="b s" onclick="hzCancel()">Cancel</button></div></div>
  <div><div class="apnav" role="tablist">${HZ_CATS.map(([k,n])=>`<button class="b s ${k==cat?'on p':''}" onclick="hzCat('${k}')">${n}</button>`).join('')}</div>${apBody(cat)}</div></div>`}
 else body=`<div class="row hzrow"><div class="hzpv">${hzPrev()}</div><div><p><b>${sum}</b></p><div class="row"><button class="b s ${H?'':'on'}" ${lock?'disabled':''} onclick="hzReset()">Use default hairstyle</button><button class="b s p" ${lock?'disabled':''} onclick="hzEdit()">✂ Customize hairstyle</button>${H?`<button class="b s" ${lock?'disabled':''} onclick="hzReset()">↺ Reset to default</button>`:''}</div>${lock?'<p class="st">Locked while the release is in production.</p>':''}</div></div>`;
 return`<div class="c shz" id="shz"><h3>💇 Hairstyle — ${esc(m.name)}</h3><div class="row">${songSel}</div><p class="st">For this song only. Her profile hairstyle, her other songs and the other members are not changed. Costume and hairstyle are saved separately.</p>${body}</div>`}
{const f=V.songcz;V.songcz=function(){const h=f.apply(this,arguments);try{const x=hzHtml();if(!x)return h;return h+x}catch(e){console.error(e);return h}}}
// leaving the page (or switching member) closes an open hairstyle edit without saving
{const f=render;render=function(){try{const z=ui.shz;if(z&&z.edit&&(view!='songcz'||!ui.scz||ui.scz.mid!=z.mid))hzEnd()}catch(e){}return f.apply(this,arguments)}}
