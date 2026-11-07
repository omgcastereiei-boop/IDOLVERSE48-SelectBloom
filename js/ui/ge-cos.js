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
