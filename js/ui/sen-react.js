// =====================================================================================
//  Senbatsu announcement — member list · reactions per group
// -------------------------------------------------------------------------------------
//  · The "New single announced" window lists each song's Senbatsu by Group and Team (alphabetical,
//    Center ★, First Time Senbatsu for the Title Track), like the release history.
//  · Reactions compare a position only with earlier singles of the SAME group: a sister member who was
//    Center of her own group's single and is in the Main Group's middle row is not "demoted". Each
//    member keeps a Senbatsu record per group (senRecG); the overall record (profile) is unchanged.
//  · When a group announces a Senbatsu, members of other groups who were not selected do not react,
//    except those who were in that group's previous Title Track Senbatsu.
// =====================================================================================
// which group a project / single key belongs to
function srKeyMap(){const M=new Map();S.groups.forEach(g=>{(gsCtx(g.id,'singles')||[]).forEach(x=>{if(x.pid)M.set(x.pid,g.id);if(x.rid)M.set(x.rid,g.id)});const pj=gsCtx(g.id,'pj');if(pj&&pj.id)M.set(pj.id,g.id)});return M}
const srBlank=()=>({sel:0,cen:0,front:0,mid:0,back:0,none:0,cons:0,consNone:0,bestCons:0,prev:null,lastCen:null,firstSen:null,firstCen:null,keys:[],log:[]});
// a member's Senbatsu record for one group (built from her overall record the first time)
function srG(m,gid,KM){m.senRecG=m.senRecG||{};if(m.senRecG[gid])return m.senRecG[gid];const all=srOf(m),own=gsGid(m),kg=e=>KM.get(e.key)??own;
 if(!all.log.some(e=>kg(e)!=own))return own==gid?JSON.parse(JSON.stringify(all)):srBlank();
 const r=srBlank(),keep=m.senRec;m.senRec=r;try{all.log.filter(e=>kg(e)==gid).forEach(e=>wlRecord(m,e.pos,e.key,e.title,e.day))}finally{m.senRec=keep}return r}
// previous Title Track Senbatsu of the active group
function srPrevTT(){const L=(S.singles||[]).slice().sort((a,b)=>(a.relDay??a.day??0)-(b.relDay??b.day??0)),x=L.at(-1);if(!x)return new Set();const o=S.songs[x.mainId]||{};return new Set((x.tt&&x.tt.members)||(o.slots||[]).filter(Boolean))}
// only the announcing group's members (and those of other groups who were in its previous Title Track Senbatsu) react when not selected
{const f=wlPositions;wlPositions=function(p){const M=f.apply(this,arguments);try{if(!M||S.groups.length<2)return M;const gid=gsAg(),prev=srPrevTT();
 M.forEach((pos,id)=>{if(pos!='none')return;const m=get(id);if(!m||gsIn(m,gid)||prev.has(id))return;M.delete(id)})}catch(e){console.error(e)}return M}}
{const f=wlReact;wlReact=function(p){if(!p||!S||S.groups.length<2)return f.apply(this,arguments);const gid=gsAg(),KM=srKeyMap(),sw=[];
 S.members.forEach(m=>{const real=srOf(m),had=!!(m.senRecG&&m.senRecG[gid]);sw.push([m,real,had]);m.senRec=srG(m,gid,KM)});let out;
 try{out=f.apply(this,arguments)}finally{sw.forEach(([m,real,had])=>{const g=m.senRec;m.senRec=real;if(had||g.keys.includes(p.id)){m.senRecG=m.senRecG||{};m.senRecG[gid]=g}else if(m.senRecG&&!had)delete m.senRecG[gid];if(m.senRecG&&!Object.keys(m.senRecG).length)delete m.senRecG;
  // the overall record (profile) gets the same entry
  const e=g.log.find(z=>z.key==p.id);if(e&&!real.keys.includes(p.id))wlRecord(m,e.pos,e.key,e.title,e.day)})}return out}}
// announcement: Senbatsu list per song, like the release history
{const f=plAnnounce;plAnnounce=function(p){let h=f.apply(this,arguments);try{const a=p.ann||{tracks:[]},seen=new Set(),L=[];a.tracks.forEach(t=>t.songs.forEach(s=>{if(!seen.has(s.id)){seen.add(s.id);L.push(s)}}));let i=0;
 h=h.replace(/(<div class="plann">[\s\S]*?<div class="st">[\s\S]*?<\/div>)(<\/div>)/g,(all,body,end)=>{const s=L[i++],o=s&&S.songs[s.id];if(!o)return all;const main=s.role=='main';
  return body+`<details class="slpos" open><summary>Senbatsu list</summary>${slListHtml(o,{main,first:main?slFirst({mainId:o.id},S.singles):null})}</details>`+end})}catch(e){console.error(e)}return h}}
