"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import type { CollectionConfig, ShopCollectionSlug } from "@/lib/redesign/collection-content";
import { COLLECTIONS, SHOP_COLLECTION_ORDER } from "@/lib/redesign/collection-content";
import { ProductImage } from "@/components/catalog/ProductImage";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { InfluencerCarousel } from "@/components/redesign/InfluencerCarousel";

const PAGE_SIZE = 30;
type Filters = {sort:string;metal:string;stock:string;tag:string;size:string;min:string;max:string};
const INITIAL:Filters={sort:"new",metal:"",stock:"",tag:"",size:"",min:"",max:""};
const formatMaterial=(metal:string)=>metal.trim().replace(/\s+/g," ");

function CatalogProductCard({product}:{product:Product}) {
  const path="/redesign-preview/product/"+encodeURIComponent(product.slug);
  const second=product.images?.find(image=>image && image !== product.image);
  return <article className="sn-collection-product group">
    <div className="sn-collection-product-media">
      <Link href={path} aria-label={"Подробнее: "+product.name}>
        <ProductImage src={product.image} alt={product.name} fill sizes="(max-width:680px) 50vw,(max-width:1000px) 34vw,27vw" className="sn-collection-first"/>
        {second && <ProductImage src={second} alt="" fill sizes="(max-width:680px) 50vw,(max-width:1000px) 34vw,27vw" className="sn-collection-second"/>}
      </Link>
      {product.badge && <span className="sn-collection-badge">{product.badge}</span>}
      <div className="sn-collection-heart"><FavoriteButton slug={product.slug} className="!opacity-100" /></div>
      <Link href={path} className="sn-collection-quick">Подробнее об изделии ↗</Link>
    </div>
    <div className="sn-collection-product-caption">
      {product.manufacturer && <span className="sn-collection-maker">{product.manufacturer}</span>}
      <Link href={path} className="sn-collection-product-title">{product.name}</Link>
      {product.metal && <span className="sn-collection-metal">{formatMaterial(product.metal)}</span>}
      <span className="sn-collection-price">{formatPrice(product.price)}</span>
      {product.inStock===false && <span className="sn-collection-unavailable">Нет в наличии</span>}
    </div>
  </article>;
}

function ImageChips({config,products,onPick,active}:{config:CollectionConfig;products:Product[];onPick:(v:string)=>void;active:string}) {
  const chips=products.length
    ? config.tips.map((item,i)=>({...item,index:i,matched:products.filter(item.test)})).filter(item=>item.matched.length>0)
    : [];
  return <div className="sn-collection-chips" role="region" aria-label="Подборки украшений">
    <button type="button" className={"sn-collection-chip"+(!active?" is-selected":"")} onClick={()=>onPick("")}>
      <span className="sn-collection-chip-image"><Image src={config.image} alt="" fill sizes="130px"/></span>
      <span>Все {config.title.toLowerCase()}</span>
    </button>
    {chips.map(({index,label,matched})=><button key={label} type="button" aria-pressed={active===String(index)} onClick={()=>onPick(String(index))} className={"sn-collection-chip"+(active===String(index)?" is-selected":"")}>
      <span className="sn-collection-chip-image"><ProductImage src={matched[0].image} alt="" fill sizes="130px"/></span>
      <span>{label}</span>
    </button>)}
    {!products.length && SHOP_COLLECTION_ORDER.filter(s=>s!==config.slug).map(slug=><Link className="sn-collection-chip" key={slug} href={"/redesign-preview/collections/"+slug}>
      <span className="sn-collection-chip-image"><Image src={COLLECTIONS[slug].image} alt="" fill sizes="130px"/></span>
      <span>{COLLECTIONS[slug].title}</span>
    </Link>)}
  </div>;
}

export function CollectionPageView({slug,products,apiAvailable,initialFilters}:{slug:ShopCollectionSlug;products:Product[];apiAvailable:boolean;initialFilters:Partial<Filters>}) {
  const config = COLLECTIONS[slug];
  const [filters,setFilters]=useState<Filters>(()=>({...INITIAL,...initialFilters,sort:initialFilters.sort||"new"}));
  const [showFilters,setShowFilters]=useState(true);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [visibleCount,setVisibleCount]=useState(PAGE_SIZE);
  const [minDraft,setMinDraft]=useState(filters.min);
  const [maxDraft,setMaxDraft]=useState(filters.max);

  const metals=useMemo(()=>[...new Set(products.map(p=>p.metal?.trim()).filter((s):s is string=>Boolean(s)))].sort((a,b)=>a.localeCompare(b,"ru")), [products]);
  const sizes=useMemo(()=>[...new Set(products.flatMap(p=>p.sizeOptions?.map(s=>s.label)??[]))].sort((a,b)=>a.localeCompare(b,"ru",{numeric:true})),[products]);
  const hasSizes=config.category==="rings" || config.category==="bracelets";
  const maxCatalogPrice=useMemo(()=>Math.max(0,...products.map(p=>p.price)),[products]);

  const change=useCallback((next:Partial<Filters>)=>{
    const url=new URL(window.location.href);
    Object.entries(next).forEach(([key,value])=>{
      if(!value || (key==="sort" && value==="new"))url.searchParams.delete(key);
      else url.searchParams.set(key,value);
    });
    window.history.pushState(null,"",url.pathname+url.search);
    setFilters(previous=>({...previous,...next}));
    setVisibleCount(PAGE_SIZE);
  },[]);

  useEffect(()=>{
    const onBack=()=>{
      const q=new URLSearchParams(window.location.search);
      const next={...INITIAL, ...Object.fromEntries(Object.keys(INITIAL).map(key=>[key,q.get(key)??(key==="sort"?"new":"")]))} as Filters;
      setFilters(next);setVisibleCount(PAGE_SIZE);
      setMinDraft(next.min);setMaxDraft(next.max);
    };
    window.addEventListener("popstate",onBack);
    return ()=>window.removeEventListener("popstate",onBack);
  },[]);

  useEffect(()=>{
    if(!mobileOpen)return;
    const close=(ev:KeyboardEvent)=>{if(ev.key==="Escape")setMobileOpen(false)};
    window.addEventListener("keydown",close);
    return ()=>window.removeEventListener("keydown",close);
  },[mobileOpen]);

  const filtered=useMemo(()=>{
    const chosenTip=config.tips[Number(filters.tag)];
    let list=products.filter(p=>
      (!filters.stock || (filters.stock==="available" && p.inStock!==false)) &&
      (!filters.metal || p.metal?.trim()===filters.metal) &&
      (!filters.size || p.sizeOptions?.some(s=>s.label===filters.size)) &&
      (!filters.tag || (chosenTip && chosenTip.test(p))) &&
      (!filters.min || p.price>=Number(filters.min)) &&
      (!filters.max || p.price<=Number(filters.max))
    );
    if(filters.sort==="price-asc")list=[...list].sort((a,b)=>a.price-b.price);
    else if(filters.sort==="price-desc")list=[...list].sort((a,b)=>b.price-a.price);
    else if(filters.sort==="new")list=[...list].sort((a,b)=>Number(b.isNew)-Number(a.isNew));
    return list;
  },[products,filters,config]);

  const selectTag=(value:string)=>change({tag:value});
  const clearAll=()=>{setMinDraft("");setMaxDraft("");change(INITIAL);};

  const controls=<div className="sn-collection-filter-groups">
    <div className="sn-collection-filter-top"><strong>Фильтры</strong><button type="button" onClick={clearAll}>Сбросить всё</button></div>
    {metals.length>0 && <details open><summary>Материал</summary><div className="sn-collection-checks">{metals.map(m=><label key={m}><input type="checkbox" checked={filters.metal===m} onChange={()=>change({metal:filters.metal===m?"":m})}/>{m}</label>)}</div></details>}
    <details open><summary>Категория</summary><div className="sn-collection-checks"><span>{config.title}</span></div></details>
    {config.tips.some(t=>products.some(t.test))&&<details open><summary>Стиль / подборка</summary><div className="sn-collection-checks">
      {config.tips.map((t,i)=>({t,i})).filter(({t})=>products.some(t.test)).map(({t,i})=><label key={i}><input type="checkbox" checked={filters.tag===String(i)} onChange={()=>selectTag(filters.tag===String(i)?"":String(i))}/>{t.label}</label>)}
    </div></details>}
    {hasSizes && sizes.length>0 && <details><summary>Размер</summary><div className="sn-collection-checks">{sizes.map(s=><label key={s}><input type="checkbox" checked={filters.size===s} onChange={()=>change({size:filters.size===s?"":s})}/>{s}</label>)}</div></details>}
    <details open><summary>Наличие</summary><div className="sn-collection-checks"><label><input type="checkbox" checked={filters.stock==="available"} onChange={()=>change({stock:filters.stock?"":"available"})}/>Только в наличии</label></div></details>
    <details open><summary>Цена, ₽</summary>
      <div className="sn-collection-range">
        <label>От <input type="number" inputMode="numeric" min={0} max={maxCatalogPrice||undefined} placeholder="0" value={minDraft} onChange={e=>setMinDraft(e.target.value)}/></label>
        <label>До <input type="number" inputMode="numeric" min={0} placeholder={maxCatalogPrice?String(maxCatalogPrice):"—"} value={maxDraft} onChange={e=>setMaxDraft(e.target.value)}/></label>
        <button type="button" onClick={()=>change({min:minDraft,max:maxDraft})}>Применить цену</button>
      </div>
    </details>
  </div>;

  const count=filtered.length;
  const shown=filtered.slice(0,visibleCount);

  return <main className="sn-collection-page">
    <div className="sn-collection-head sn-container">
      <nav className="sn-collection-crumbs" aria-label="Хлебные крошки"><Link href="/redesign-preview">Главная</Link><span>/</span><Link href="/redesign-preview/catalog">Украшения</Link><span>/</span><span aria-current="page">{config.title}</span></nav>
      <h1>{config.title}</h1>
      <p>{config.intro}</p>
    </div>
    <ImageChips config={config} products={products} onPick={selectTag} active={filters.tag}/>
    <div className="sn-collection-toolbar">
      <button type="button" className="sn-collection-toggle" onClick={()=>{if(window.innerWidth<=760)setMobileOpen(true);else setShowFilters(v=>!v)}} aria-expanded={mobileOpen||showFilters}><span aria-hidden>☷</span> <span>{showFilters?"Фильтры":"Показать фильтры"}</span></button>
      <span className="sn-collection-counter" role="status">{count} {count===1?"изделие":count>1&&count<5?"изделия":"изделий"}</span>
      <label className="sn-collection-sort">Сортировать <select aria-label="Сортировка товаров" value={filters.sort} onChange={e=>change({sort:e.target.value})}>
        <option value="new">Новинки</option><option value="price-asc">Цена: по возрастанию</option><option value="price-desc">Цена: по убыванию</option><option value="default">По умолчанию</option>
      </select></label>
    </div>
    <div className={"sn-collection-layout"+(!showFilters?" no-sidebar":"")}>
      {showFilters && <aside className="sn-collection-sidebar" aria-label="Фильтры каталога">{controls}</aside>}
      <section className="sn-collection-results" aria-label={"Каталог: "+config.title}>
        {!apiAvailable ? <div className="sn-collection-empty" role="status"><strong>Каталог ожидает подключение AdvantShop</strong><p>В тестовом окружении нет доступа к данным. Мы не показываем вымышленные цены, остатки и изделия.</p></div> :
         count===0 ? <div className="sn-collection-empty" role="status"><strong>По выбранным фильтрам товаров нет</strong><button type="button" onClick={clearAll}>Сбросить фильтры</button></div> :
         <>
          <div className="sn-collection-grid">{shown.map(p=><CatalogProductCard key={p.id} product={p}/>)}</div>
          <div className="sn-collection-pagination"><p>Показано {shown.length} из {count} изделий</p><div className="sn-collection-progress"><span style={{width:((shown.length/count)*100)+"%"}}/></div>{shown.length<count&&<button type="button" onClick={()=>setVisibleCount(v=>v+PAGE_SIZE)}>Загрузить ещё {Math.min(PAGE_SIZE,count-shown.length)}</button>}</div>
         </>}
      </section>
    </div>
    <section className="sn-collection-spotlight" aria-label="Видеообразы Синоним">
      <div className="sn-container sn-collection-spotlight-intro">
        <span className="sn-collection-overline">SPOTLIGHT · СИНОНИМ</span>
        <p>Украшения в движении. Пока используются видео бренда без привязки к конкретным артикулам. Подтверждённые ролики с товарами добавим позже.</p>
      </div>
      <InfluencerCarousel />
    </section>
    <section className="sn-collection-editorial sn-container" aria-labelledby="sn-collection-about">
      <div className="sn-collection-editorial-heading"><span className="sn-collection-overline">ГИД ПО УКРАШЕНИЯМ</span><h2 id="sn-collection-about">{config.editorialTitle}</h2></div>
      <div className="sn-collection-editorial-grid"><article><h3>{config.editorialTitle}</h3><p>{config.editorialCopy}</p></article><article><h3>{config.giftTitle}</h3><p>{config.giftCopy}</p></article><article><h3>{config.adviceTitle}</h3><p>{config.adviceCopy}</p></article></div>
    </section>
    <section className="sn-collection-faq sn-container">
      <h2>Частые вопросы</h2>
      {config.faqs.map(({q,a})=><details key={q}><summary>{q}<span aria-hidden>+</span></summary><p>{a}</p></details>)}
    </section>
    {mobileOpen&&<div className="sn-collection-sheet-backdrop" onClick={()=>setMobileOpen(false)}><div className="sn-collection-sheet" role="dialog" aria-label="Фильтры товаров" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="sn-collection-sheet-top"><strong>Фильтры</strong><button type="button" aria-label="Закрыть фильтры" onClick={()=>setMobileOpen(false)}>×</button></div>{controls}<button className="sn-collection-apply" type="button" onClick={()=>setMobileOpen(false)}>Показать {count} изделий</button></div></div>}
  </main>;
}
