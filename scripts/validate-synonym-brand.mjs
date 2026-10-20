import { readFileSync } from "node:fs";

const read = path => readFileSync(path,"utf8");
const css = read("src/app/redesign-preview/brand-v05.css");
const head = read("src/components/redesign/PreviewHeader.tsx");
const layout = read("src/app/redesign-preview/layout.tsx");
const home = read("src/app/redesign-preview/page.tsx");
const failures=[];
const official={
  "--syn-brand-green":"#73A341",
  "--syn-brand-terracotta":"#D47750",
  "--syn-brand-sand":"#E8D9B5",
  "--syn-logo-olive":"#4A5335",
  "--syn-logo-terracotta":"#C96A4A",
};
for(const [name,color] of Object.entries(official)){
  const expected=name+": "+color+";";
  if(!css.includes(expected))failures.push("Required brandbook swatch changed: "+expected);
}
if(!css.includes('--syn-font-display: "Playfair Display"'))failures.push("Playfair Display heading token missing");
if(!css.includes('--syn-font-interface: "Inter"'))failures.push("Inter body token missing");
if(!layout.includes('import "./brand-v05.css";'))failures.push("Brand styles not imported");
const logo="/images/logo_20260527190756.png";
if(!head.includes('src="'+logo+'"')||!layout.includes('src="'+logo+'"'))failures.push("Original logo image must be used in both header and footer");
if(layout.includes("<h2>СИНОНИМ</h2>"))failures.push("Footer must not be only a typeset imitation of the logo");
if(!css.includes(".sn-root .sn-footer-brand img"))failures.push("Footer logo sizing not defined");
if(!home.includes('<section className="sn-category-grid"'))failures.push("Approved four categories are missing");
if(!home.includes('<HeroCarousel />')||!home.includes('<BestSellerCarousel ')||!home.includes('<InfluencerCarousel />'))failures.push("Approved six-block homepage changed");
const lum=hex=>{
 const rgb=hex.slice(1).match(/.{2}/g).map(x=>parseInt(x,16)/255);
 const p=rgb.map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
 return .2126*p[0]+.7152*p[1]+.0722*p[2];
};
const contrast=(a,b)=>{
 const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
const button=contrast("#4A5335","#FFFFFF");
console.log("SYNONYM brand v05 | white on dark olive: "+button.toFixed(2)+":1");
console.log("Avoid small white text on bright green: "+contrast("#73A341","#FFFFFF").toFixed(2)+":1; or terracotta: "+contrast("#D47750","#FFFFFF").toFixed(2)+":1");
if(button<4.5)failures.push("Primary button contrast below 4.5:1");
for(const x of failures)console.error("FAIL: "+x);
if(failures.length)process.exitCode=1;
else console.log("PASS: official swatches, fonts, original logo files, contrast, approved home sections");
