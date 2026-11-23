// =====================================================================================
//  IDOLVERSE48: Select Bloom! — varied hair and eye colours for newly generated characters
// -------------------------------------------------------------------------------------
//  New characters (auditions, new members, rivals created from now on) and the Character Creator's Randomize
//  button get a hair colour and an eye colour picked from the whole colour range (custom #rrggbb, hcx / ecx),
//  not only from the base palette: natural shades with small variations (black, browns, auburn, blondes,
//  ash, platinum…) and fantasy colours of any hue (pastel to vivid). Shading is still derived by the renderer.
//  Members who already have an appearance keep it exactly; nothing in an existing save is changed.
// =====================================================================================
const AC_HSL=(h,s,l)=>{h=((h%360)+360)%360;s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
// natural hair families: [hue range, saturation range, lightness range, weight]
const AC_HAIR_NAT=[[[220,260],[8,20],[9,16],5],[[18,30],[30,50],[14,24],6],[[20,32],[35,55],[25,36],5],[[24,36],[40,60],[38,50],3],[[38,48],[60,80],[58,72],3],[[44,54],[45,70],[76,86],2],[[2,16],[50,70],[28,40],2],[[210,230],[6,14],[58,72],1.5],[[40,60],[10,25],[84,92],1.5],[[350,365],[35,55],[18,28],1]];
const AC_EYE=[[[18,34],[45,70],[24,40],5],[[30,46],[60,85],[38,52],2],[[195,220],[60,85],[40,58],3],[[180,195],[50,75],[36,50],1.5],[[120,150],[40,65],[32,46],2],[[75,100],[35,60],[34,46],1],[[260,290],[45,70],[44,60],2],[[320,345],[55,80],[50,64],2],[[350,365],[65,85],[38,50],1.2],[[45,55],[75,95],[48,58],1.2],[[210,225],[8,18],[46,58],1]];
const acPick=(r,L)=>{const T=L.reduce((a,x)=>a+x[3],0);let v=r()*T;for(const x of L){v-=x[3];if(v<=0)return x}return L[0]};
const acIn=(r,[a,b])=>a+r()*(b-a);
function acHair(r){if(r()<.55){const z=acPick(r,AC_HAIR_NAT);return AC_HSL(acIn(r,z[0]),acIn(r,z[1]),acIn(r,z[2]))}
 const h=r()*360,pastel=r()<.55;return AC_HSL(h,pastel?acIn(r,[40,70]):acIn(r,[48,76]),pastel?acIn(r,[70,82]):acIn(r,[42,60]))}
function acEye(r,hair){if(r()<.18){const H=acHue(hair);if(H!=null)return AC_HSL(H+acIn(r,[-15,15]),acIn(r,[55,80]),acIn(r,[40,56]))}const z=acPick(r,AC_EYE);return AC_HSL(acIn(r,z[0]),acIn(r,z[1]),acIn(r,z[2]))}
function acHue(hex){const n=parseInt(String(hex).slice(1),16);if(!(n>=0))return null;const R=(n>>16&255)/255,G=(n>>8&255)/255,B=(n&255)/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),d=mx-mn;if(d<.12)return null;let h=mx==R?((G-B)/d)%6:mx==G?(B-R)/d+2:(R-G)/d+4;return h*60}
function acColors(r){const hcx=acHair(r);return{hcx,ecx:acEye(r,hcx)}}
// characters created from now on
{const f=newAp;newAp=function(m,k,fix){const a=f.apply(this,arguments);try{if(!(fix&&(fix.hc!=null||fix.hcx))&&!a.hcx){const r=mulb(((m&&m.id|0)+7)*2654435761+((m&&m.hue|0)+3)*97+(k|0)*31337);Object.assign(a,acColors(r))}}catch(e){}return a}}
// Character Creator: Randomize
{const f=rapp;rapp=function(){const a=f.apply(this,arguments);try{delete a.hc2x;Object.assign(a,acColors(Math.random))}catch(e){}return a}}
