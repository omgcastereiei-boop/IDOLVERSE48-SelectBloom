// =====================================================================================
//  General Election — ceremony costume per member
// -------------------------------------------------------------------------------------
//  · New: "Latest single costume" — every member wears the costume of her own latest single
//    (Title Track Senbatsu → her Title Track costume, Under Girls → the Single Costume), i.e. her
//    profile outfit. Members without one wear the standard ceremony outfit.
//  · New: "By team" / "By group" — each team (or group) gets its own costume: standard outfit,
//    latest single costume, a library design, a Stage costume or a single's costume.
//  · 🎲 Random: a new random design for the whole ceremony, for one team / group row, and on the
//    costume designer page opened from General Election.
//  · Everything is still fixed per member when the ceremony begins (geCzSnap).
// =====================================================================================
const GEC_ENC=c=>!c||c.k=='std'?'std':c.k=='latest'?'latest':c.k=='design'?'design:'+c.did:c.k=='stage'?'stage:'+c.sid:c.k=='single'?'single:'+c.rid:'std';
const GEC_DEC=v=>{v=String(v||'std');const i=v.indexOf(':'),k=i<0?v:v.slice(0,i),id=i<0?'':v.slice(i+1);return k=='design'?{k,did:id}:k=='stage'?{k,sid:id}:k=='single'?{k,rid:id}:k=='latest'?{k}:{k:'std'}};
function gecKey(m,by){if(!m)return'_';if(by=='group')return'g'+m.group;const t=teamOf(m);return t&&isAct(m)?t.id:'_tr'+m.group}
function gecLabel(key,by){if(key.startsWith('_tr')){const g=grp(+key.slice(3));return`${TL()}${S.groups.length>1&&g?' · '+g.name:''}`}if(by=='group'){const g=grp(+key.slice(1));return g?g.name:'—'}
 for(const g of S.groups){const t=(g.teams||[]).find(t=>t.id==key);if(t)return`${S.groups.length>1?g.name+' · ':''}${t.name}`}return key}
function gecSpecName(c){if(!c||c.k=='std')return'Standard outfit';if(c.k=='latest')return'Latest single costume';return geCosName({cos:c})}
// live costume of a member
{const f=geCzLive;geCzLive=function(e,mid){const c=e&&e.cos;if(c&&c.k=='latest'){const m=get(mid);return m&&m.profCz&&m.profCz.p||null}
 if(c&&c.k=='by'){const m=get(mid),s=(c.map||{})[gecKey(m,c.by)]||c.def||{k:'std'};if(!s||s.k=='std')return null;if(s.k=='latest')return m&&m.profCz&&m.profCz.p||null;return f.call(this,{...e,cos:s},mid)}return f.apply(this,arguments)}}
{const f=geCosName;geCosName=function(e){const c=e&&e.cos;if(c&&c.k=='latest')return'Each member’s latest single costume';if(c&&c.k=='by'){const n=new Set(Object.values(c.map||{}).map(GEC_ENC)).size;return`Costume by ${c.by=='group'?'group':'team'} (${n||1} costume${n>1?'s':''})`}return f.apply(this,arguments)}}
const gecLocked=e=>!e||e.st=='ceremony'||e.st=='done';
{const f=geCosSet;geCosSet=function(k,v){if(k=='latest'||k=='by'){const e=geActive();if(gecLocked(e))return toast('The ceremony costume is fixed once the ceremony begins.','err');
  if(k=='latest')e.cos={k:'latest'};else{const by=v=='group'?'group':'team',old=e.cos&&e.cos.k=='by'?e.cos:null;e.cos={k:'by',by,map:old&&old.by==by?old.map:{},def:{k:'std'}}}toast(`Ceremony costume: ${geCosName(e)}.`);render();return}return f.apply(this,arguments)}}
function geCosMap(key,v){const e=geActive();if(gecLocked(e)||!e.cos||e.cos.k!='by')return;e.cos.map=e.cos.map||{};e.cos.map[key]=GEC_DEC(v);render()}
function gecRandDesign(name){const d={id:czId(),name:cleanName(name).slice(0,40)||'Random costume',p:czRandom(),style:'',created:S.day,updated:S.day};czLib().ds.push(d);return d}
function geCosRand(key){const e=geActive();if(gecLocked(e))return toast('The ceremony costume is fixed once the ceremony begins.','err');czInit&&czLib();
 if(key==null){const d=gecRandDesign(`${e.name} costume`);e.cos={k:'design',did:d.id};toast(`Random costume “${d.name}” created and saved to the costume library.`);return render()}
 if(!e.cos||e.cos.k!='by')return;const d=gecRandDesign(`${e.name} · ${gecLabel(key,e.cos.by)}`);e.cos.map=e.cos.map||{};e.cos.map[key]={k:'design',did:d.id};toast(`Random costume for ${gecLabel(key,e.cos.by)}.`);render()}
function geCosRandAll(){const e=geActive();if(gecLocked(e)||!e.cos||e.cos.k!='by')return;gecRows(e).forEach(r=>{const d=gecRandDesign(`${e.name} · ${r.label}`);e.cos.map[r.key]={k:'design',did:d.id}});toast('A random costume for every row.');render()}
function gecRows(e){const by=e.cos.by,M=new Map();e.parts.map(get).filter(Boolean).forEach(m=>{const k=gecKey(m,by);if(!M.has(k))M.set(k,{key:k,label:gecLabel(k,by),n:0,g:S.groups.findIndex(g=>g.id==m.group),t:k.startsWith('_tr')?99:((grp(m.group)||{}).teams||[]).findIndex(t=>t.id==k)});M.get(k).n++});
 return[...M.values()].sort((a,b)=>a.g-b.g||a.t-b.t)}
function gecOpts(sel){const L=czLib().ds,stg=typeof thStage=='function'?Object.values((S.th&&S.th.st)||{}).filter(st=>thStageCz(st)):[],o=(v,t)=>`<option value="${v}" ${sel==v?'selected':''}>${esc(t)}</option>`;
 return o('std','Standard outfit')+o('latest','Latest single costume')+(L.length?`<optgroup label="Costume library">${L.map(d=>o('design:'+d.id,d.name)).join('')}</optgroup>`:'')+(stg.length?`<optgroup label="Stage costume">${stg.map(st=>o('stage:'+st.id,`${thNoTxt(st)} · ${st.name}`)).join('')}</optgroup>`:'')+(S.singles.length?`<optgroup label="Single costume">${S.singles.slice().reverse().map(x=>o('single:'+x.rid,`${x.title} (#${x.num})`)).join('')}</optgroup>`:'')}
{const f=geCosHtml;geCosHtml=function(e){let h=f.apply(this,arguments);try{const c=e.cos||{k:'std'},dis=gecLocked(e)?'disabled':'';
 if(c.k=='latest'||c.k=='by')h=h.replace('All members wear it on the ceremony day;',c.k=='latest'?'Each member wears the costume of her own latest single (Title Track Senbatsu: Title Track costume · Under Girls: Single Costume); members without one wear the standard outfit;':'Each team or group wears its own costume;');
 h=h.replace(`${(e.st=='ceremony'||e.st=='done')?'disabled':''} onclick="geCosNew()">✦ New costume</button>`,`${dis} onclick="geCosNew()">✦ New costume</button><button class="b s" ${dis} onclick="geCosRand()">🎲 Random costume</button>`);
 const rows=c.k=='by'?gecRows(e):[];
 const add=`<div class="gecos ${c.k=='latest'?'on':''}"><button class="b s ${c.k=='latest'?'on':''}" ${dis} onclick="geCosSet('latest')">Latest single costume</button><small class="st">Each member wears her own latest single costume. Under Girls wear the Single Costume (Under Girls).</small></div>
 <div class="gecos gecby ${c.k=='by'?'on':''}"><div class="row"><button class="b s ${c.k=='by'&&c.by!='group'?'on':''}" ${dis} onclick="geCosSet('by','team')">By team</button><button class="b s ${c.k=='by'&&c.by=='group'?'on':''}" ${dis} onclick="geCosSet('by','group')">By group</button></div>
 ${c.k=='by'?`${rows.map(r=>`<div class="gecrow"><b>${esc(r.label)} <small class="st">${r.n}</small></b><div class="row"><select ${dis} onchange="geCosMap('${r.key}',this.value)">${gecOpts(GEC_ENC((c.map||{})[r.key]))}</select><button class="b s" ${dis} title="Random costume" onclick="geCosRand('${r.key}')">🎲</button></div></div>`).join('')}<button class="b s" ${dis} onclick="geCosRandAll()">🎲 Random costume for every ${c.by=='group'?'group':'team'}</button>`:'<small class="st">Choose a costume for each team or each group.</small>'}</div>`;
 const i=h.lastIndexOf('</div></div>');if(i>=0)h=h.slice(0,i)+add+h.slice(i)}catch(err){console.error(err)}return h}}
// costume designer opened from General Election: random costume
{const f=V.costume;V.costume=function(){const h=f.apply(this,arguments);return ui.geBack?h.replace('← Back to General Election</button>','← Back to General Election</button><button class="b s" onclick="geCzRandEd()">🎲 Random costume</button>'):h}}
function geCzRandEd(){if(!ui.czE)return;ui.czE.p=czRandom();ui.czE.dirty=1;toast('Random costume generated. Edit any piece, then press Save.');render()}
// ---- visual costume picker: 3 columns of previews, sorted into Single / Stage / Library -----------------------
function gecThumb(p,m){if(!m)return'';const a=ap(m);return`<svg viewBox="10 -2 80 200" role="img" aria-hidden="true">${fig(m,{pose:0,of:p?a.of:GE_OUT[0],oh:p?a.oh:GE_OUT[1],ac:a.ac,ex:2,...(p?{cd:p}:{})})}</svg>`}
function gecModel(e,key){const P=e.parts.map(get).filter(Boolean).sort((a,b)=>b.pop-a.pop);if(key&&key!='__main'&&e.cos&&e.cos.k=='by')return P.find(m=>gecKey(m,e.cos.by)==key)||P[0];return P[0]}
function gecSpecP(e,c,m){if(!m||!c||c.k=='std')return null;if(c.k=='latest')return m.profCz&&m.profCz.p||null;return geCzLive({...e,cos:c},m.id)}
function gecItems(e,m){const L=czLib().ds,stg=typeof thStage=='function'?Object.values((S.th&&S.th.st)||{}).filter(st=>thStageCz(st)):[],songT=new Set(Object.values(S.songs||{}).map(o=>o.title));
 const single=[...S.singles.slice().reverse().map(x=>({v:'single:'+x.rid,n:x.title,s:`Single #${x.num} · each member's own costume`})),...L.filter(d=>d.auto||(!d.stg&&songT.has(String(d.name).split(' — ')[0]))).slice().reverse().map(d=>({v:'design:'+d.id,n:String(d.name).split(' — ')[0],s:String(d.name).split(' — ')[1]||'Song costume',p:d.p}))];
 const stage=[...stg.map(st=>({v:'stage:'+st.id,n:st.name,s:`${thNoTxt(st)} · Stage costume`})),...L.filter(d=>d.stg).slice().reverse().map(d=>({v:'design:'+d.id,n:d.name,s:'Stage costume',p:d.p}))];
 const used=new Set([...single,...stage].map(x=>x.v)),other=L.filter(d=>!used.has('design:'+d.id)).slice().reverse().map(d=>({v:'design:'+d.id,n:d.name,s:'Costume library',p:d.p}));
 const fill=a=>a.map(x=>({...x,p:x.p!==undefined?x.p:gecSpecP(e,GEC_DEC(x.v),m)}));return{single:fill(single),stage:fill(stage),other:fill(other)}}
function gecPickHtml(){const P=ui.gecp,e=geActive();if(!P||!e)return'';const m=gecModel(e,P.key),cur=P.key=='__main'?GEC_ENC(e.cos):GEC_ENC(((e.cos||{}).map||{})[P.key]),I=gecItems(e,m),tab=P.tab||(cur.startsWith('stage')?'stage':'single');
 const card=x=>`<button class="gecpc ${x.v==cur?'on':''}" data-n="${esc((x.n+' '+(x.s||'')).toLowerCase())}" onclick="gecPickSet('${x.v}')">${gecThumb(x.p,m)}<b>${esc(x.n)}</b><small>${esc(x.s||'')}</small></button>`;
 const base=[{v:'std',n:'Standard outfit',s:'Ceremony dress',p:null},{v:'latest',n:'Latest single costume',s:'Under Girls: Under costume',p:gecSpecP(e,{k:'latest'},m)}];
 const T=[['single','Single',I.single],['stage','Stage',I.stage],['other','Library',I.other]],cur2=T.find(t=>t[0]==tab)||T[0];
 return`<h2 class="ht">Choose a costume</h2><p class="st">${P.key=='__main'?'Everyone':esc(gecLabel(P.key,e.cos.by))} · preview on ${esc(m?m.name:'')}</p><div class="gecpg">${base.map(card).join('')}</div>
 <div class="row gecpt">${T.map(([k,n,a])=>`<button class="b s ${k==cur2[0]?'on':''}" onclick="ui.gecp.tab='${k}';ui.mod.h=gecPickHtml();render()">${n} (${a.length})</button>`).join('')}</div>
 <input class="gecpq" placeholder="Search…" oninput="const q=this.value.toLowerCase();this.nextElementSibling.querySelectorAll('.gecpc').forEach(c=>c.style.display=c.dataset.n.includes(q)?'':'none')">
 <div class="gecpg">${cur2[2].map(card).join('')||'<p class="st">Nothing here yet.</p>'}</div>`}
function gecPick(key){const e=geActive();if(gecLocked(e))return toast('The ceremony costume is fixed once the ceremony begins.','err');ui.gecp={key,tab:null};ui.mod={t:'html',h:gecPickHtml()};render()}
function gecPickSet(v){const P=ui.gecp,e=geActive();if(!P||gecLocked(e))return;ui.mod=null;if(P.key=='__main'){const c=GEC_DEC(v);if(c.k=='std'||c.k=='latest')geCosSet(c.k);else geCosSet(c.k,c.did||c.sid||c.rid)}else geCosMap(P.key,v)}
// rows and main card use the visual picker
{const f=geCosHtml;geCosHtml=function(e){let h=f.apply(this,arguments);try{const c=e.cos||{k:'std'},dis=gecLocked(e)?'disabled':'';
 h=h.replace(/<select ([^>]*)onchange="geCosMap\('([^']+)',this.value\)">[\s\S]*?<\/select>/g,(s,a,key)=>{const sp=(c.map||{})[key],m=gecModel(e,key);return`<button class="gecpick" ${dis} onclick="gecPick('${key}')">${gecThumb(gecSpecP(e,sp||{k:'std'},m),m)}<span><b>${esc(gecSpecName(sp))}</b><small class="st">Tap to choose</small></span><i>▾</i></button>`});
 h=h.replace('<div class="gecosg">',`<div class="gecosg"><button class="b p gecmain" ${dis} onclick="gecPick('__main')">👗 Choose costume (with preview)</button>`)}catch(err){console.error(err)}return h}}
