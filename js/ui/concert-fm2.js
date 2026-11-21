// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Concert formation like Single Production
// -------------------------------------------------------------------------------------
//  · Choose the number of members and the number of centers: the rows are rebuilt with the same
//    rules as the Single formation (planReshape / defRows); members already placed keep their place
//    as far as possible (centers stay centers, Row 1 grows outwards from the middle).
//  · "Center out" removed. Each row stays on one horizontal line; a long row scrolls left / right.
// =====================================================================================
// concert positions (array, order inside a row = left → right) ⇄ a Single-style slot list
function ccFmToSl(P){const sl=[],R=[...new Set(P.map(z=>z.r))].sort((a,b)=>a-b);R.forEach((r,ri)=>{let L=P.filter(z=>z.r==r);
  if(ri==0){const fc=L.findIndex(z=>z.c);if(fc>=0){const cs=L.filter(z=>z.c),nc=L.filter(z=>!z.c);L=[...nc.slice(0,fc),...cs,...nc.slice(fc)]}}
  L.forEach((z,i)=>sl.push({r:ri,i,n:0,c:ri==0&&z.c?1:0,m:z.m!=null?z.m:null}))});return sl}
function ccSlToFm(sl,old){const by=new Map(old.filter(z=>z.m!=null).map(z=>[z.m,z]));return sl.slice().sort((a,b)=>a.r-b.r||a.i-b.i).map(x=>{const o=x.m!=null&&by.get(x.m);return{m:x.m,r:x.r,c:!!x.c,o:o?o.o??null:null,why:o?o.why||'':''}})}
const ccFmNc=P=>P.filter(z=>z.c&&z.r==Math.min(...P.map(x=>x.r))).length;
const ccFmDefRows=(n,nc)=>n<=0?[]:defRows(n,Math.max(1,nc)).filter(x=>x>0);
function ccFmMax(C,it){return Math.max(48,(C.parts||[]).length,(it.pos||[]).length)}
function ccFmApply(it,rows,nc,msg){const P=it.pos||[],R0=rows.filter(x=>x>0);if(!R0.length){it.pos=[];ui.ccfs=null;toast(msg);return render()}
 if(R0[0]<nc)R0[0]=nc;const f={sl:ccFmToSl(P)};let res;try{res=planReshape(f,R0,nc)}catch(e){console.error(e);res={sl:buildForm(R0,nc),dropped:P.map(z=>z.m).filter(x=>x!=null)}}
 const go=()=>{it.pos=ccSlToFm(res.sl,P);ui.ccfs=null;ui.ccfr=0;toast(msg);render()};
 if(res.dropped.length)ask(`${msg}\nThere is no room left for: ${res.dropped.map(i=>(get(i)||{}).name||'?').join(', ')}. They leave this song.`,go,'Apply');else go()}
function ccFmSize(iid,n){const C=ccCur(),r=C&&ccItem(C,iid);if(!ccEdit(C)||!r)return;const it=r.it,P=it.pos||[],mx=ccFmMax(C,it);n=Math.round(+n);
 if(!(n>=1&&n<=mx)){toast(`Members must be 1–${mx}.`,'err');return render()}let nc=ccFmNc(P);if(n==P.length)return;if(nc>n)nc=n;
 const cur=P.length?ccFmToSl(P):[],isDef=cur.length&&rowsOf(cur).join()==ccFmDefRows(P.length,ccFmNc(P)).join();
 let R;if(!cur.length||isDef)R=ccFmDefRows(n,nc);else{R=rowsOf(cur);while(R.reduce((a,b)=>a+b,0)<n){let t=R.length>1?1:0;for(let k=1;k<R.length;k++)if(R[k]<=R[t])t=k;R[t]++}while(R.reduce((a,b)=>a+b,0)>n){let t=-1;for(let k=0;k<R.length;k++){if(k==0?R[0]>Math.max(1,nc):R[k]>1){if(t<0||R[k]>=R[t])t=k}}if(t<0){R.pop();continue}R[t]--}}
 ccFmApply(it,R,nc,`Formation set to ${n} member${n>1?'s':''}.`)}
function ccFmNcSet(iid,n){const C=ccCur(),r=C&&ccItem(C,iid);if(!ccEdit(C)||!r)return;const it=r.it,P=it.pos||[];n=Math.round(+n);if(!P.length)return toast('Choose the number of members first.','err');
 if(!(n>=0&&n<=Math.min(5,P.length))){toast('Invalid number of centers for this size.','err');return render()}if(n==ccFmNc(P)&&!P.some(z=>z.c&&z.r!=Math.min(...P.map(x=>x.r))))return;
 const cur=ccFmToSl(P),isDef=rowsOf(cur).join()==ccFmDefRows(P.length,ccFmNc(P)).join();let R=isDef?ccFmDefRows(P.length,n):rowsOf(cur);
 if(!isDef)while(R[0]<n){let t=R.length-1;while(t>0&&R[t]==0)t--;if(t==0)break;R[t]--;if(!R[t])R.splice(t,1);R[0]++}
 ccFmApply(it,R,n,n?`${n} center${n>1?'s':''} in the middle of Row 1.`:'No center for this song.')}
function ccFmDefault(iid){const C=ccCur(),r=C&&ccItem(C,iid);if(!ccEdit(C)||!r)return;const P=r.it.pos||[];if(!P.length)return;const nc=ccFmNc(P);ccFmApply(r.it,ccFmDefRows(P.length,nc),nc,'Default formation restored for this size.')}
// the controls on the formation page, Center out removed
{const f=ccFormPage;ccFormPage=function(C){let h=f.apply(this,arguments);try{const r=ccItem(C,ui.ccfp);if(!r)return h;const it=r.it,P=it.pos||[],ed=ccEdit(C),mx=ccFmMax(C,it),n=P.length,nc=ccFmNc(P);
  h=h.replace(/<button type="button" class="ccfrb" onclick="ccRowArrange\([^)]*\)">[^<]*<\/button>/g,'');
  const rc=n?rowsOf(ccFmToSl(P)).join(' - '):'—';
  const ctl=`<div class="ccfmctl"><label class="st">Number of members <select ${ed?'':'disabled'} aria-label="Members" onchange="ccFmSize('${it.id}',this.value)">${n?'':'<option value="">Choose…</option>'}${Array.from({length:mx},(_,i)=>i+1).map(k=>`<option value="${k}" ${k==n?'selected':''}>${k}</option>`).join('')}</select></label><label class="st">Number of centers <select ${ed&&n?'':'disabled'} aria-label="Centers" onchange="ccFmNcSet('${it.id}',this.value)">${Array.from({length:Math.min(5,Math.max(1,n))+1},(_,i)=>i).map(k=>`<option value="${k}" ${k==nc?'selected':''}>${k?k:'No center'}</option>`).join('')}</select></label><span class="st">Rows (front → back): <b>${rc}</b></span>${ed&&n?`<button class="b s" onclick="ccFmDefault('${it.id}')">Default rows</button>`:''}</div>`;
  h=h.replace(/(<div class="c ccfhead">[\s\S]*?<\/h2><\/div>)/,`$1${ctl}`)}catch(e){console.error(e)}return h}}
['ccFmSize','ccFmNcSet','ccFmDefault'].forEach(n=>{const f=window[n];if(typeof ccOK=='function')window[n]=ccOK(f)});
