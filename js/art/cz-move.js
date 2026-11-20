// =====================================================================================
//  Costume Designer — garment pieces moved into Basics
// -------------------------------------------------------------------------------------
//  Pieces that are really clothing (capes, shawls, belts, obi, sashes, extra collars, cuffs,
//  skirt overlays) are moved out of Traditional and Festival into five new Basics categories.
//  Saved designs keep working: czxNorm() moves a piece stored under its old category to the
//  new one the first time the design is drawn or edited (design[cat][key] = piece).
// =====================================================================================
const CZX_MOVE={
 wrap:['Capes, shawls & robes','ケープ・ショール',{trad:['sabaishawl','pibo','thaidrape'],fes:['santacape','witchcape','knitscarf']}],
 belt:['Belts, sashes & obi','ベルト・帯',{trad:['thaibelt','yaodai','obi','obijime','obiage','obibow'],fes:['heko','redsash','floralsash','festbow','valwaist','bdaysash']}],
 ncol:['Collar pieces','襟パーツ',{trad:['krongkho'],fes:['furcollar','gothcollar']}],
 cuff:['Sleeve & wrist pieces','袖・手首',{trad:['thaiarm'],fes:['furcuff','flowersleeve']}],
 sko:['Skirt overlays & panels','スカート重ね',{trad:['chaipha','bixi','kimonopanel'],fes:['xmasskirt','blossom']}]};
const CZX_MOVED={}; // key -> [old category, new category]
Object.entries(CZX_MOVE).forEach(([nk,[n,jp,src]])=>{const c=czxCat(nk,n,jp,{tags:['Basics']});
 Object.entries(src).forEach(([ok,keys])=>{const oc=CZX_CAT.find(x=>x.k==ok);keys.forEach(key=>{const D=CZX[key];if(!D||!oc)return;const i=oc.items.findIndex(x=>x[0]==key);if(i<0)return;const it=oc.items.splice(i,1)[0];c.items.push(it);D.cat=nk;CZX_MOVED[key]=[ok,nk]})})});
function czxNorm(cd){if(!cd||typeof cd!='object')return cd;for(const key in CZX_MOVED){const[o,n]=CZX_MOVED[key],M=cd[o];if(M&&typeof M=='object'&&key in M){const v=M[key];delete M[key];if(v){cd[n]=cd[n]&&typeof cd[n]=='object'?cd[n]:{};if(!cd[n][key])cd[n][key]=v}}}return cd}
{const f=czxPieces;czxPieces=function(cd){try{czxNorm(cd)}catch(e){}return f.apply(this,arguments)}}
// thumbnail framing of the new categories (applied once the designer has defined CZ_CROP)
const CZX_MOVE_CROP={wrap:'10 30 80 110',belt:'26 56 48 32',ncol:'30 30 40 30',cuff:'12 40 76 60',sko:'10 56 80 80'};
