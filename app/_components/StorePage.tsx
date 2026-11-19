import type { Metadata } from "next";
import StoreLinks from "./StoreLinks";
import { MarketingLanguages } from "./MarketingNavigation";
import { localeAlternates, localizedHref, type Lang, type StorePath } from "../_data/languages";
import { PRO_PRICE_USD } from "../_data/pro-price";
import { DOWNLOAD_URL } from "../_data/releases";
import { policies, SUPPORT_EMAIL } from "../_data/store-copy";

const pricing = {
  en: {
    title: "Pricing",
    intro: "Convert ebooks to audiobooks on Windows. Use the free tools for individual chapters or choose Pro for batch conversion and reading plans.",
    free: "Free",
    freePrice: "US$0",
    freeFeatures: ["Import EPUB, PDF, TXT and DOCX", "Convert chapters manually", "Export MP3 or WAV"],
    download: "Download for Windows",
    proFeatures: ["Everything in Free", "Batch ebook conversion", "Annual reading plan"],
    xianyu: "Currently available as a redemption code on Xianyu (闲鱼). Price and license duration are shown on the individual listing.",
    redeem: "Redeem a code in your account",
    paddle: "Paddle price at launch",
    paddleDetails: "One-time payment for one active device, before tax. Paddle checkout is pending. The final amount and any applicable tax will be shown at checkout.",
    home: "Home",
    contact: "Contact support",
  },
  zh: {
    title: "定价",
    intro: "在 Windows 上把电子书转换成有声书。免费版可手动按章转换，Pro 提供批量转换和阅读计划。",
    free: "免费版",
    freePrice: "免费",
    freeFeatures: ["导入 EPUB、PDF、TXT 和 DOCX", "手动按章转换", "导出 MP3 或 WAV"],
    download: "下载 Windows 版",
    proFeatures: ["包含免费版的全部功能", "批量转换电子书", "年度阅读计划"],
    xianyu: "目前可在闲鱼购买兑换码。价格和授权有效期以所选商品页面为准。",
    redeem: "前往账号页兑换",
    paddle: "Paddle 上线定价",
    paddleDetails: "一次性付款，授权一台设备使用。此为税前价格，Paddle 结账尚未开放。最终金额及适用税费会在结账时显示。",
    home: "首页",
    contact: "联系支持",
  },
  ja: {
    title: "料金",
    intro: "Windows で電子書籍をオーディオブックに。章別変換は無料で使えます。Pro では一括変換と読書計画が利用できます。",
    free: "無料版",
    freePrice: "無料",
    freeFeatures: ["EPUB、PDF、TXT、DOCX の読み込み","章ごとの手動変換","MP3 または WAV に書き出し"],
    download: "Windows 版をダウンロード",
    proFeatures: ["無料版の全機能","電子書籍の一括変換","年間読書計画"],
    xianyu: "現在は閑魚（Xianyu）で引き換えコードを購入できます。価格とライセンス期間は各商品ページをご確認ください。",
    redeem: "アカウントでコードを引き換える",
    paddle: "Paddle 開始時の価格",
    paddleDetails: "端末1台分の買い切り価格（税別）です。Paddle 決済は準備中です。最終金額と適用される税額は決済時に表示されます。",
    home: "ホーム",
    contact: "サポートに連絡",
  },
  ko: {
    title: "가격",
    intro: "Windows에서 전자책을 오디오북으로 변환하세요. 장별 변환은 무료이며 Pro에는 일괄 변환과 독서 계획이 포함됩니다.",
    free: "무료 버전",
    freePrice: "무료",
    freeFeatures: ["EPUB, PDF, TXT, DOCX 가져오기","장별 수동 변환","MP3 또는 WAV로 저장"],
    download: "Windows 버전 다운로드",
    proFeatures: ["무료 버전의 모든 기능","전자책 일괄 변환","연간 독서 계획"],
    xianyu: "현재는 셴위(闲鱼, Xianyu)에서 교환 코드를 구매할 수 있습니다. 가격과 사용권 기간은 상품 페이지에서 확인하세요.",
    redeem: "계정에서 코드 교환",
    paddle: "Paddle 출시 가격",
    paddleDetails: "기기 한 대용 일회성 결제이며 세금은 별도입니다. Paddle 결제는 준비 중입니다. 최종 금액과 적용 세금은 결제 시 표시됩니다.",
    home: "홈",
    contact: "지원팀에 문의",
  },
  fr: {
    title: "Tarifs",
    intro: "Convertissez vos livres numériques en livres audio sur Windows. La conversion par chapitre est gratuite. Pro comprend la conversion par lots et le programme de lecture.",
    free: "Gratuit",
    freePrice: "Gratuit",
    freeFeatures: ["Importer des fichiers EPUB, PDF, TXT et DOCX","Convertir les chapitres manuellement","Exporter en MP3 ou WAV"],
    download: "Télécharger pour Windows",
    proFeatures: ["Toutes les fonctions gratuites","Conversion de livres par lots","Programme de lecture annuel"],
    xianyu: "Des codes sont actuellement disponibles sur Xianyu (闲鱼). Le prix et la durée de la licence sont indiqués sur chaque annonce.",
    redeem: "Utiliser un code dans votre compte",
    paddle: "Prix au lancement sur Paddle",
    paddleDetails: "Paiement unique hors taxes pour un appareil actif. Le paiement Paddle est en préparation. Le prix final et les taxes applicables seront affichés lors du paiement.",
    home: "Accueil",
    contact: "Contacter l’assistance",
  },
  es: {
    title: "Precios",
    intro: "Convierte libros electrónicos en audiolibros en Windows. La conversión por capítulos es gratuita. Pro incluye conversión por lotes y un plan de lectura.",
    free: "Gratis",
    freePrice: "Gratis",
    freeFeatures: ["Importar archivos EPUB, PDF, TXT y DOCX","Convertir capítulos manualmente","Exportar a MP3 o WAV"],
    download: "Descargar para Windows",
    proFeatures: ["Todas las funciones gratuitas","Conversión de libros por lotes","Plan de lectura anual"],
    xianyu: "Actualmente se venden códigos en Xianyu (闲鱼). El precio y la duración de la licencia se indican en cada anuncio.",
    redeem: "Canjear un código en tu cuenta",
    paddle: "Precio de lanzamiento en Paddle",
    paddleDetails: "Pago único para un dispositivo activo, antes de impuestos. El pago con Paddle está en preparación. El importe final y los impuestos aplicables se mostrarán al pagar.",
    home: "Inicio",
    contact: "Contactar con soporte",
  },
} as const;

export function storeMetadata(path: StorePath, lang: Lang): Metadata {
  const { title, intro } = path === "/pricing" ? pricing[lang] : policies[lang][path];
  const alternates = localeAlternates(path, lang);
  return {
    title: title + " | Book2Audio GO",
    description: intro,
    alternates,
    openGraph: { title, description: intro, url: alternates.canonical, siteName: "Book2Audio GO", type: "website" },
    twitter: { card: "summary", title, description: intro },
  };
}

function PricingDetails({ lang }: { lang: keyof typeof pricing }) {
  const copy = pricing[lang];
  return <>
    <div className="storePlans">
      <section>
        <h2>{copy.free}</h2>
        <p className="storePrice">{copy.freePrice}</p>
        <ul>{copy.freeFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
        <a className="primary" href={DOWNLOAD_URL}>{copy.download}</a>
      </section>
      <section>
        <h2>Book2Audio GO Pro</h2>
        <ul>{copy.proFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
        <p>{copy.xianyu}</p>
        <a className="guideLink" href={localizedHref("/account", lang)}>{copy.redeem}</a>
      </section>
    </div>
    <section className="storeSection">
      <h2>{copy.paddle}</h2>
      <p className="storePrice">{PRO_PRICE_USD}</p>
      <p>{copy.paddleDetails}</p>
    </section>
  </>;
}

export default function StorePage({ path, lang }: { path: StorePath; lang: Lang }) {
  const copy = pricing[lang];
  const policy = path === "/pricing" ? null : policies[lang][path];
  return <main>
    <nav className="nav wrap">
      <a className="brand" href={localizedHref("/", lang)}><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a>
      <MarketingLanguages lang={lang} path={path} />
    </nav>
    <article className="guidePage wrap storePage">
      <h1>{policy?.title ?? copy.title}</h1>
      <p className="lead">{policy?.intro ?? copy.intro}</p>
      {policy ? policy.sections.map(({ title, text, links }) =>
        <section className="storeSection" key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
          {links?.map(link => <a className="guideLink storeReference" key={link.href} href={link.href}>{link.label}</a>)}
        </section>
      ) : <PricingDetails lang={lang} />}
      <p><a className="guideLink" href={`mailto:${SUPPORT_EMAIL}`}>{copy.contact}</a></p>
    </article>
    <footer className="wrap storeFooter">
      <a href={localizedHref("/", lang)}>{copy.home}</a>
      <StoreLinks lang={lang} current={path} />
    </footer>
  </main>;
}
