import Image from "next/image";
import Link from "next/link";

export const metadata={title:"SYNONYM — сверка рекламного изображения с артикулом",robots:{index:false,follow:false}};

const ringUrl="https://synonym-jewelry.ru/products/koltso-iz-serebra-925-s-ogranennym-sinteticheskim-almazom-0-05-g-0-25-karat-serebro-925-11545";
const sourcePhotos=[
 "https://synonym-jewelry.ru/api/advantshop-image?src=http%3A%2F%2Fshop.synonym-jewelry.ru%2Fpictures%2Fproduct%2Fbig%2F155_big.jpg",
 "https://synonym-jewelry.ru/api/advantshop-image?src=http%3A%2F%2Fshop.synonym-jewelry.ru%2Fpictures%2Fproduct%2Fbig%2F242_big.jpg"
];

export default function SkuVisualQa(){
 return <main className="sn-container" style={{paddingBlock:"36px 90px",maxWidth:1280}}>
  <p style={{fontSize:12,color:"#C96A4A",letterSpacing:2}}>ТЕХНИЧЕСКОЕ СОГЛАСОВАНИЕ · НЕ РЕКЛАМА</p>
  <h1 style={{fontFamily:'"Playfair Display",Georgia,serif',fontSize:"clamp(30px,4vw,52px)",margin:"12px 0 20px"}}>Сверка украшения с реальным артикулом</h1>
  <p style={{fontSize:14,maxWidth:850,lineHeight:1.75,color:"#56594F"}}>Слева — две исходные фотографии изделия, загружаемые с действующего сайта SYNONYM. Справа — сгенерированный редакционный кадр. Товарная фотография не копируется в GitHub. Рекламный кадр пока не подтверждён как точное изображение артикула и не используется в карточке товара или Hero.</p>
  <div style={{background:"#F7F1E5",padding:16,borderLeft:"4px solid #C96A4A",margin:"20px 0 28px",fontSize:13}}>
   СТАТУС: НА СВЕРКЕ · Отсутствует подтверждение точной формы оправы, количества/положения крапанов и пропорций камня. Не публиковать как фото товара до визуального утверждения.
  </div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:18}}>
   <section>
    <h2 style={{fontSize:19,fontFamily:'"Playfair Display",Georgia,serif',marginBottom:12}}>Исходные изображения · AdvantShop</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
     {sourcePhotos.map((src,index)=><div key={index}>
      <div style={{aspectRatio:".85",background:"#F6F5F2",display:"flex",alignItems:"center"}}>
       {/* Live image from the existing public production media proxy — not copied into GitHub. */}
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img src={src} alt={"Оригинальное фото артикула 191-048025, ракурс "+(index+1)} style={{width:"100%",height:"100%",objectFit:"contain"}} loading="lazy" />
      </div>
      <p style={{fontSize:11,marginTop:8}}>Фото {index+1} / AdvantShop</p>
     </div>)}
    </div>
   </section>
   <section>
    <h2 style={{fontSize:19,fontFamily:'"Playfair Display",Georgia,serif',marginBottom:12}}>Модельный кадр · концепция</h2>
    <div style={{position:"relative",aspectRatio:"2/3",background:"#F7F1E5"}}>
      <Image src="/media/qa/ring-191-048025-concept-v01.webp" alt="Сгенерированный концептуальный кадр с серебристым кольцом на руке модели — точное соответствие изделию ещё не подтверждено" fill sizes="(max-width:800px) 100vw,50vw" style={{objectFit:"cover"}}/>
    </div>
   </section>
  </div>
  <div style={{marginTop:30,padding:"24px",border:"1px solid #DFDFD4"}}>
   <h2 style={{fontSize:20,fontFamily:'"Playfair Display",Georgia,serif'}}>Контрольный список перед коммерческим использованием</h2>
   <ul style={{fontSize:13,lineHeight:2,paddingLeft:23,listStyle:"disc",marginTop:14}}>
    <li>Точная геометрия оправы и расположение крапанов</li>
    <li>Круглая огранка и визуальные пропорции камня</li>
    <li>Профиль шинка и материал — серебро 925 с родированием</li>
    <li>Нет придуманной гравировки и дополнительного декора</li>
    <li>Маркетинговый текст не приписывает каталогу несуществующие свойства</li>
   </ul>
   <Link href={ringUrl} target="_blank" rel="noreferrer" style={{display:"inline-block",padding:"12px 16px",background:"#4A5335",color:"white",marginTop:20,fontSize:13}}>Открыть исходный товар ↗</Link>
  </div>
 </main>;
}
