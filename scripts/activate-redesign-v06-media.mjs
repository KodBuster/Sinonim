/**
 * SYNONYM v06 — explicit, fail-closed media activation.
 * Runs only after the owner uploads all curated media and approves editorial scenes.
 * Preserves brandVideos from current manifest.
 */
import {existsSync,readFileSync,writeFileSync,statSync} from "node:fs";
import {resolve,sep} from "node:path";
const root=process.cwd();
const currentFile=resolve(root,"src/config/synonym-media.json");
const pendingFile=resolve(root,"src/config/synonym-media-v06.pending.json");
const current=JSON.parse(readFileSync(currentFile,"utf8"));
const draft=JSON.parse(readFileSync(pendingFile,"utf8"));
const next={...draft,brandVideos:current.brandVideos};
const files=[
 ...next.heroSlides.flatMap(x=>[x.desktopSrc,x.mobileSrc]),
 ...next.promotions.flatMap(x=>[x.src,x.mobileSrc]),
 ...next.blogCovers.map(x=>x.src)
].filter(Boolean);
const errors=[];
for(const url of files){
 if(!/^\/media\/[a-z0-9/-]+-v\d{2}\.(avif|webp|jpg|jpeg|png|mp4|webm)$/.test(url)){
   errors.push("Invalid public media path: "+url);continue;
 }
 const path=resolve(root,"public",url.slice(1));
 const publicRoot=resolve(root,"public");
 if(!path.startsWith(publicRoot+sep)){errors.push("Unsafe path: "+url);continue;}
 if(!existsSync(path)||statSync(path).size===0)errors.push("Missing or empty: public"+url);
}
if(files.length!==16)errors.push("Expected 16 editorial media URLs, got "+files.length);
if(errors.length){
 for(const e of errors)console.error("ACTIVATION BLOCKED:",e);
 console.error("Upload SYNONYM_v06_EDITORIAL_MEDIA_PACK.zip/public/media/ first. No manifest changed.");
 process.exitCode=1;
}else{
 writeFileSync(currentFile,JSON.stringify(next,null,2)+"\n");
 console.log("SYNONYM v06 media activated locally. Next: npm run media:check && npm run brand:check && npm run build; commit on redesign branch only.");
}
