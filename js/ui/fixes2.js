// =====================================================================================
//  IDOLVERSE48: Select Bloom! — small gameplay fixes
//  · Default dance formation rows: smallest row in front, growing toward the back, and the
//    front row sized so the Center(s) stand exactly in the middle (12 → 3-4-5, 16 → 5-5-6,
//    24 → 7-8-9). Used by every new / auto-generated formation (saved formations unchanged).
//  · Start Single starts directly (no extra "Please confirm" dialog; requirements and funds
//    are still checked by startSingle).
// =====================================================================================
function fxRows(n,nc){n=Math.max(1,n|0);nc=Math.max(1,Math.min(nc|0||1,n));let R=n<=5?1:n<=8?2:n<=24?3:n<=34?4:5;R=Math.min(R,CFG.maxRows||5);
 let f;while(R>1&&(f=Math.floor((n-R*(R-1)/2)/R))<1)R--;if(R==1)return[n];const rows=Array.from({length:R},(_,i)=>f+i);let rem=n-rows.reduce((a,b)=>a+b,0);for(let i=R-1;rem>0;i=(i-1+R)%R){if(i==0)continue;rows[i]++;rem--}
 const big=()=>{let t=R-1;for(let r=R-1;r>0;r--)if(rows[r]>rows[t])t=r;return t};
 while(rows[0]<nc){const t=big();if(rows[t]<=1)break;rows[t]--;rows[0]++}
 if((rows[0]-nc)%2){const t=big();if(rows[0]+1<=rows[1]&&rows[t]>1&&t!=0){rows[0]++;rows[t]--}else if(rows[0]-1>=nc){rows[0]--;rows[1]++}else{rows[0]++;rows[t]--}}
 return rows.filter(x=>x>0)}
defForm=function(size,nc){return buildForm(fxRows(size,nc),Math.max(1,nc|0))};
confirmProd=function(){const p=S.pj;if(!p||p.status!='draft')return toast('This single has already started.','err');try{czSyncPlan()}catch(e){}startSingle()};
