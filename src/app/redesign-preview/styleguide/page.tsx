import Image from "next/image";
import Link from "next/link";

export const metadata={title:"SYNONYM v05 — фирменная дизайн-система",robots:{index:false,follow:false}};

const colors=[
  {label:"Основной зелёный",hex:"#73A341",note:"Брендбук · стр. 3"},
  {label:"Терракотовый",hex:"#D47750",note:"Брендбук · стр. 3"},
  {label:"Песочный",hex:"#E8D9B5",note:"Брендбук · стр. 3"},
  {label:"Оливковый логотипа",hex:"#4A5335",note:"Брендбук · стр. 5"},
  {label:"Терракота логотипа",hex:"#C96A4A",note:"Брендбук · стр. 5"},
];

export default function StyleguidePage(){
 return <main className="sn-container sn-v05-styleguide">
  <span className="sn-v05-kicker">SYNONYM · BRAND SYSTEM / V05</span>
  <h1>Свой характер. Своя эстетика.</h1>
  <p>Тестовая витрина фирменных элементов. Основной источник — предоставленный семистраничный документ «Краткая информация по логотипу Синоним». Сетка, размеры элементов и интерфейсные нейтральные цвета разработаны для веба отдельно.</p>
  <h2>Палитра бренда</h2>
  <div className="sn-v05-swatches">{colors.map(color=><div className="sn-v05-swatch" key={color.hex}>
   <div className="sn-v05-swatch-color" style={{background:color.hex}}/>
   <div className="sn-v05-swatch-label">{color.label}<strong>{color.hex}</strong><span>{color.note}</span></div>
  </div>)}</div>
  <h2>Типографика</h2>
  <div className="sn-v05-types">
   <div className="sn-v05-sample"><span className="sn-v05-kicker">PLAYFAIR DISPLAY · ЗАГОЛОВКИ</span><h3>Украшения, созвучные вам</h3><p>Крупные редакционные заголовки — основной узнаваемый шрифтовой приём.</p></div>
   <div className="sn-v05-sample"><span className="sn-v05-kicker">INTER · ИНТЕРФЕЙС</span><p>Названия товаров, цены, фильтры, подсказки, описания и навигация должны легко читаться и на маленьком экране.</p></div>
  </div>
  <h2>Основные действия</h2>
  <div className="sn-v05-actions"><Link href="/redesign-preview/collections/rings" className="is-primary">Смотреть кольца ↗</Link><Link href="/redesign-preview" className="is-secondary">На главную ↗</Link></div>
  <h2>Правила логотипа</h2>
  <p>Используем оригинальную форму со знаком «О»; не перерисовываем, не искажаем, не обрезаем. Оставляем защитное поле; ширина на экране не менее 80 px.</p>
  <div className="sn-v05-logo-field"><Image src="/images/logo_20260527190756.png" alt="Оригинальный логотип СИНОНИМ" width={1000} height={150} priority/></div>
  <h2>Внимание к деталям</h2>
  <p>Фото конкретных украшений и сведения о товарах загружаются из AdvantShop. Кампейн, журнальные фотографии и видео — из отдельной медиатеки GitHub. Эту витрину дизайна не следует принимать за актуальный каталог товаров.</p>
  <div className="sn-v05-actions"><Link href="/redesign-preview" className="is-primary">Посмотреть главную v05 ↗</Link></div>
 </main>;
}
