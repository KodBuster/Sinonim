"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";

type Frame={kind:"image"|"video";src:string};

export function PreviewPdpGallery({images,name,videoUrl}:{images:string[];name:string;videoUrl?:string}) {
 const media=useMemo<Frame[]>(()=>{
  const seen=new Set<string>();
  const photos=images.filter(Boolean).filter(src=>{if(seen.has(src))return false;seen.add(src);return true;})
   .map(src=>({kind:"image" as const,src}));
  return videoUrl?[...photos,{kind:"video",src:videoUrl}]:photos;
 },[images,videoUrl]);
 const [active,setActive]=useState(0);
 const [open,setOpen]=useState(false);
 const closeRef=useRef<HTMLButtonElement>(null);
 const image=media[active]??media[0];
 const step=(delta:number)=>setActive(i=>(i+delta+media.length)%media.length);
 useEffect(()=>{
  if(!open)return;
  const old=document.body.style.overflow;document.body.style.overflow="hidden";
  closeRef.current?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape")setOpen(false);
   if(event.key==="ArrowLeft")setActive(i=>(i-1+media.length)%media.length);
   if(event.key==="ArrowRight")setActive(i=>(i+1)%media.length);
  };
  window.addEventListener("keydown",onKey);
  return ()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=old;};
 },[open,media.length]);
 if(!image)return <div className="sn-pdp04-media-missing" role="status">Изображения товара пока не доступны в каталоге.</div>;
 return <div className="sn-pdp04-gallery" aria-label={"Галерея товара: "+name}>
  <div className="sn-pdp04-mainmedia">
   {image.kind==="image"?
    <button type="button" className="sn-pdp04-main-open" onClick={()=>setOpen(true)} aria-label="Увеличить фото">
     <ProductImage src={image.src} alt={name+", фотография "+(active+1)} fill priority sizes="(max-width:850px) 100vw,55vw" className="sn-pdp04-main-img"/>
     <span className="sn-pdp04-zoom">↗ Увеличить</span>
    </button>
   :<video src={image.src} controls playsInline preload="metadata" className="sn-pdp04-main-video" aria-label={"Видео товара "+name}/>}
   {media.length>1&&<div className="sn-pdp04-gallery-arrows">
    <button type="button" onClick={()=>step(-1)} aria-label="Предыдущее фото">‹</button>
    <span>{active+1} / {media.length}</span>
    <button type="button" onClick={()=>step(1)} aria-label="Следующее фото">›</button>
   </div>}
  </div>
  {media.length>1&&<div className="sn-pdp04-thumbs" role="group" aria-label="Выбрать изображение">
   {media.map((item,i)=><button key={item.src+i} type="button" onClick={()=>setActive(i)} aria-label={item.kind==="video"?"Видео изделия":"Фото "+(i+1)}
      aria-pressed={active===i} className={"sn-pdp04-thumb"+(active===i?" is-active":"")}>
     {item.kind==="image"?<ProductImage src={item.src} alt="" fill sizes="100px" className="sn-pdp04-thumb-img"/>:<span className="sn-pdp04-thumb-play">▶</span>}
    </button>)}
  </div>}
  {open&&image.kind==="image"&&<div className="sn-pdp04-lightbox" role="dialog" aria-modal="true" aria-label="Увеличенное фото" onClick={()=>setOpen(false)}>
   <button type="button" ref={closeRef} className="sn-pdp04-close" onClick={()=>setOpen(false)} aria-label="Закрыть увеличение">×</button>
   <div className="sn-pdp04-lightbox-image" onClick={e=>e.stopPropagation()}><ProductImage src={image.src} alt={name} fill sizes="95vw" className="sn-pdp04-main-img"/></div>
   {media.length>1&&<div className="sn-pdp04-lightbox-navigation" onClick={e=>e.stopPropagation()}>
    <button type="button" onClick={()=>step(-1)} aria-label="Предыдущее фото">‹</button><span>{active+1} / {media.length}</span>
    <button type="button" onClick={()=>step(1)} aria-label="Следующее фото">›</button>
   </div>}
  </div>}
 </div>;
}
