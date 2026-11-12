import { MarketingLanguages } from "./MarketingNavigation";
import { marketingCopy } from "../_data/marketing-copy";
import { localizedHref, type Lang } from "../_data/languages";
import { guideText } from "../_data/guide-copy";
import DiscoveryContent from "./DiscoveryContent";
import UpdateNotice from "./UpdateNotice";
import { DOWNLOAD_URL as downloadUrl, releaseCopy } from "../_data/releases";

export const homeCopy = {
  en: {
    nav: ["Features", "How it works", "Formats"], free: "Core features are free", eyebrow: "Your books. Your voice. Your listening time.",
    title: "Convert PDF and EPUB\nBooks to MP3 Audiobooks", intro: "Turn your ebooks into audio with Book2Audio GO, a downloadable Windows ebook to audiobook converter with free core features.\nSupports PDF, EPUB, TXT and DOCX, with chapter-based MP3 or WAV export. Choose a voice and take your reading on the go.",
    download: "Download for Windows", note: "Free core features · Windows 10/11 · Internet required for speech synthesis",
    formats: "Turn time when you cannot read\ninto time spent reading.", formatsBody: "Convert EPUB to MP3 for listening on the go, or try PDF to audiobook conversion for a break from the screen.\nBook2Audio GO also supports TXT and DOCX, with MP3 or WAV output. Preview and select detected chapters, then export chapter-based MP3 files to keep your listening organized.",
    value: "Sometimes it is not that you do not want to read—you simply cannot look at a book or screen.\nYou do not have to wait for a platform to release the audiobook you want. The ebooks you already own can become your own audiobooks.",
    cards: [["Automatic chapter detection","Automatically parses the table of contents so you can preview, select, and export chapters individually."],["Natural multilingual voices","Supports Chinese, Japanese, Korean, and English voices, with freely adjustable speaking speed."],["Complete audiobook metadata","Automatically adds the title, author, year, genre, and cover so your audiobooks stay organized."],["Built for long-form reading","Automatic splitting, retry on failure, and progress tracking make full-book conversion more reliable."]],
    how: "Three steps from ebook to audiobook.", steps: [["01","Choose a book","Open an EPUB, TXT, PDF, or DOCX file."],["02","Choose chapters and a voice","Preview the text, then select the chapters, voice, and speaking speed you want."],["03","Export and listen","Create an MP3 or WAV file and play it on your phone, computer, or favorite audio player."]],
    cta: "Your ebook\nis your audiobook.", ctaBody: "Stop searching to see whether an audiobook version exists.\nTurn the ebooks you already own into audio and keep reading whenever it suits you.",
    footer: "Set words free, and read without being limited by time or screens.", privacy: "Book parsing runs on your computer. Text is sent to an online speech service to generate audio."
  },
  zh: {
    nav: ["功能", "使用方法", "支持格式"], free: "主要功能免费", eyebrow: "把阅读带进每一段路程",
    title: "让每一本书，\n都有自己的声音。", intro: "Book2Audio GO 将你的电子书转换成自然流畅的有声书。\n通勤、开车、散步、运动，或者眼睛疲劳不想继续看屏幕时，也可以继续读自己的书。",
    download: "免费下载 Windows 版", note: "主要功能免费 · Windows 10/11 · 语音合成需联网",
    formats: "把没法读书的时间，\n变成读书时间。", formatsBody: "收藏在电脑和网盘里的电子书，不必再一直吃灰。\n把它们转换成 MP3 或 WAV，在通勤、开车、散步或休息时继续阅读。\n支持 EPUB、TXT、PDF、DOCX 等常见格式，并自动保留章节结构。",
    value: "有些时候，不是不想读书，只是没办法看书。\n你不需要等待某个平台上架你想听的书。你已有的电子书，就可以成为自己的有声书。",
    cards: [["章节自动识别","自动解析书籍目录，按章节预览、选择并分别导出。"],["多语言自然语音","支持中文、日语、韩语及英语语音，并可自由调整语速。"],["完整有声书信息","自动写入标题、作者、年份、流派和封面，让生成的有声书整齐易管理。"],["为长篇阅读而生","自动分段、失败重试和进度显示，让整本书的转换更加稳定。"]],
    how: "三步，把电子书变成有声书。", steps: [["01","选择书籍","打开 EPUB、TXT、PDF 或 DOCX 文件。"],["02","选择章节与声音","预览正文，选择需要转换的章节、语音和语速。"],["03","导出并聆听","生成 MP3 或 WAV，放进手机、电脑或你喜欢的播放器中。"]],
    cta: "你的电子书，\n就是你的有声书。", ctaBody: "不用再寻找“有没有这本有声书”。\n把自己已经拥有的电子书转换成音频，在适合自己的时间继续阅读。",
    footer: "让文字更自由，让阅读不再受时间和屏幕限制。", privacy: "书籍解析在你的电脑上完成；语音合成会将文本发送至在线语音服务。"
  },
  ja: {
    nav: ["機能", "使い方", "対応形式"], free: "基本機能は無料", eyebrow: "移動する時間も、読書の時間に",
    title: "すべての本に、\nその本だけの声を。", intro: "Book2Audio GO は、お持ちの電子書籍を自然で聴きやすいオーディオブックに変換します。\n通勤や運転、散歩、運動中はもちろん、目が疲れて画面を見たくないときも、自分の本を読み続けられます。",
    download: "Windows版を無料ダウンロード", note: "基本機能無料 · Windows 10/11 · 音声合成にはインターネット接続が必要",
    formats: "本を開けない時間を、\n読書の時間に。", formatsBody: "パソコンやクラウドに眠っている電子書籍を、そのままにしておく必要はありません。\nMP3 または WAV に変換すれば、通勤や運転、散歩、休憩中にも読書を続けられます。\nEPUB、TXT、PDF、DOCX などの一般的な形式に対応し、章立ても自動で保持します。",
    value: "読みたくないのではなく、画面を見られないだけ。そんな時間があります。\n聴きたい本が配信されるのを待つ必要はありません。手元の電子書籍が、そのまま自分のオーディオブックになります。",
    cards: [["章を自動認識","書籍の目次を自動解析し、章ごとにプレビュー、選択、個別書き出しができます。"],["多言語の自然な音声","中国語、日本語、韓国語、英語の音声に対応し、読み上げ速度も自由に調整できます。"],["充実したオーディオブック情報","タイトル、著者、発行年、ジャンル、カバー画像を自動で書き込み、生成した作品をすっきり管理できます。"],["長編の変換にも安心","自動分割、失敗時の再試行、進捗表示により、一冊まるごとの変換も安定して行えます。"]],
    how: "3ステップで、電子書籍をオーディオブックに。", steps: [["01","本を選ぶ","EPUB、TXT、PDF、DOCX ファイルを開きます。"],["02","章と音声を選ぶ","本文を確認し、変換する章、音声、読み上げ速度を選びます。"],["03","書き出して聴く","MP3 または WAV で書き出し、スマートフォンやパソコン、お好みのプレーヤーで楽しめます。"]],
    cta: "あなたの電子書籍が、\nあなたのオーディオブックに。", ctaBody: "「この本のオーディオブックはあるだろうか」と、もう探し回る必要はありません。\nすでにお持ちの電子書籍を音声に変えて、自分に合った時間に読書を続けましょう。",
    footer: "文字をもっと自由に。時間や画面に縛られない読書を。", privacy: "書籍の解析はパソコン上で行います。音声合成ではテキストをオンライン音声サービスに送信します。"
  },
  ko: {
    nav: ["기능", "사용 방법", "지원 형식"], free: "핵심 기능 무료", eyebrow: "이동하는 모든 순간에도 독서를",
    title: "모든 책에,\n그 책만의 목소리를.", intro: "Book2Audio GO는 가지고 있는 전자책을 자연스럽고 편안하게 들을 수 있는 오디오북으로 바꿔 줍니다.\n출퇴근, 운전, 산책, 운동 중은 물론 눈이 피로해 화면을 보기 싫을 때도 내 책을 계속 읽을 수 있습니다.",
    download: "Windows용 무료 다운로드", note: "기본 기능 무료 · Windows 10/11 · 음성 합성에는 인터넷 연결 필요",
    formats: "책을 볼 수 없는 시간을,\n독서 시간으로.", formatsBody: "컴퓨터와 클라우드에 보관만 해 둔 전자책을 더 이상 묵혀 두지 마세요.\nMP3 또는 WAV로 변환하면 출퇴근, 운전, 산책, 휴식 중에도 독서를 이어갈 수 있습니다.\nEPUB, TXT, PDF, DOCX 등 일반적인 형식을 지원하며 챕터 구조도 자동으로 유지합니다.",
    value: "책을 읽고 싶지 않은 게 아니라, 화면을 볼 수 없는 순간이 있을 뿐입니다.\n듣고 싶은 책이 어떤 플랫폼에 올라오기를 기다릴 필요도 없습니다. 이미 가지고 있는 전자책이 나만의 오디오북이 됩니다.",
    cards: [["챕터 자동 인식","책의 목차를 자동으로 분석해 챕터별로 미리 보고, 선택하고, 각각 내보낼 수 있습니다."],["자연스러운 다국어 음성","중국어, 일본어, 한국어, 영어 음성을 지원하며 읽기 속도도 자유롭게 조절할 수 있습니다."],["완전한 오디오북 정보","제목, 저자, 연도, 장르, 표지를 자동으로 기록해 만든 오디오북을 깔끔하게 관리할 수 있습니다."],["긴 책을 위한 안정적인 변환","자동 분할, 실패 시 재시도, 진행률 표시로 책 한 권 전체도 안정적으로 변환합니다."]],
    how: "세 단계로 전자책을 오디오북으로.", steps: [["01","책 선택","EPUB, TXT, PDF 또는 DOCX 파일을 엽니다."],["02","챕터와 음성 선택","본문을 미리 보고 변환할 챕터, 음성, 읽기 속도를 선택합니다."],["03","내보내고 듣기","MP3 또는 WAV로 만든 뒤 휴대폰, 컴퓨터, 원하는 플레이어에서 듣습니다."]],
    cta: "당신의 전자책이,\n당신의 오디오북입니다.", ctaBody: "‘이 책은 오디오북으로 나왔을까?’ 더 이상 찾아다닐 필요가 없습니다.\n이미 가지고 있는 전자책을 오디오로 바꿔 나에게 맞는 시간에 독서를 이어가세요.",
    footer: "글을 더 자유롭게, 시간과 화면에 구애받지 않는 독서를.", privacy: "책 분석은 컴퓨터에서 이루어집니다. 음성 생성을 위해 텍스트를 온라인 음성 서비스로 전송합니다."
  },
  fr: {
    nav: ["Fonctionnalités", "Mode d’emploi", "Formats"], free: "Fonctions de base gratuites", eyebrow: "Vos livres vous accompagnent partout",
    title: "Vos PDF et EPUB deviennent\ndes livres audio", intro: "Transformez vos livres numériques en audio avec Book2Audio GO, une application Windows dont les fonctions de base sont gratuites. Importez des PDF, EPUB, TXT ou DOCX, choisissez une voix et exportez les chapitres en MP3 ou WAV.",
    download: "Télécharger pour Windows", note: "Fonctions de base gratuites · Windows 10/11 · Internet requis pour la synthèse vocale",
    formats: "Écoutez quand vous ne\npouvez pas lire.", formatsBody: "Convertissez vos livres en MP3 ou WAV pour les écouter dans les transports, en promenade ou loin d’un écran. L’application prend en charge les fichiers EPUB, PDF, TXT et DOCX et conserve la structure des chapitres.",
    value: "N’attendez pas la sortie d’une version audio. Transformez les livres numériques que vous possédez déjà en livres à écouter.",
    cards: [["Détection automatique des chapitres","Analysez le sommaire, prévisualisez le texte et exportez les chapitres séparément."],["Voix naturelles multilingues","Choisissez parmi des voix en chinois, japonais, coréen et anglais et réglez le débit."],["Métadonnées complètes","Ajoutez automatiquement le titre, l’auteur, l’année, le genre et la couverture."],["Adapté aux livres longs","Le découpage automatique, les nouvelles tentatives et le suivi de progression facilitent la conversion d’un livre entier."]],
    how: "Du livre numérique au livre audio en trois étapes.", steps: [["01","Choisissez un livre","Ouvrez un fichier EPUB, TXT, PDF ou DOCX."],["02","Choisissez les chapitres et la voix","Prévisualisez le texte, sélectionnez les chapitres et réglez la voix et le débit."],["03","Exportez et écoutez","Créez un fichier MP3 ou WAV à écouter sur votre téléphone, votre ordinateur ou votre lecteur habituel."]],
    cta: "Votre livre numérique\nà écouter.", ctaBody: "Convertissez les livres que vous possédez déjà pour les écouter quand cela vous convient.",
    footer: "Retrouvez le plaisir des livres, même loin de l’écran.", privacy: "L’analyse du livre se fait sur votre ordinateur. Le texte est envoyé à un service de synthèse vocale en ligne."
  },
  es: {
    nav: ["Funciones", "Cómo funciona", "Formatos"], free: "Funciones básicas gratuitas", eyebrow: "Lleva tus libros contigo",
    title: "Convierte PDF y EPUB\nen audiolibros", intro: "Transforma tus libros electrónicos en audio con Book2Audio GO, una aplicación para Windows con funciones básicas gratuitas. Importa archivos PDF, EPUB, TXT o DOCX, elige una voz y exporta por capítulos en MP3 o WAV.",
    download: "Descargar para Windows", note: "Funciones básicas gratuitas · Windows 10/11 · La síntesis de voz requiere Internet",
    formats: "Escucha cuando\nno puedas leer.", formatsBody: "Convierte tus libros en MP3 o WAV para escucharlos en el trayecto al trabajo, de paseo o lejos de una pantalla. La aplicación admite EPUB, PDF, TXT y DOCX y conserva la estructura de capítulos.",
    value: "No hace falta esperar a que se publique una versión narrada. Convierte los libros electrónicos que ya tienes en tus propios audiolibros.",
    cards: [["Detección automática de capítulos","Analiza el índice, revisa el texto y exporta cada capítulo por separado."],["Voces naturales en varios idiomas","Elige voces en chino, japonés, coreano o inglés y ajusta la velocidad."],["Metadatos completos","Añade automáticamente el título, el autor, el año, el género y la portada."],["Pensado para libros largos","La división automática, los reintentos y el seguimiento del progreso facilitan la conversión de libros completos."]],
    how: "Del libro electrónico al audiolibro en tres pasos.", steps: [["01","Elige un libro","Abre un archivo EPUB, TXT, PDF o DOCX."],["02","Elige los capítulos y la voz","Revisa el texto, selecciona los capítulos y ajusta la voz y la velocidad."],["03","Exporta y escucha","Crea un archivo MP3 o WAV y reprodúcelo en el móvil, el ordenador o tu reproductor habitual."]],
    cta: "Tus libros electrónicos,\nlistos para escuchar.", ctaBody: "Convierte los libros que ya tienes y escúchalos cuando te venga bien.",
    footer: "Disfruta de tus libros incluso lejos de la pantalla.", privacy: "El libro se analiza en tu ordenador. El texto se envía a un servicio de síntesis de voz en línea."
  }
};

const heroArt: Record<Lang, { account: string; cover: string[]; chapter: string; caption: string }> = {
  en: { account: "Account", cover: ["THE", "LISTENING", "LIBRARY"], chapter: "Chapter 03", caption: "Every story deserves a voice" },
  zh: { account: "用户中心", cover: ["声音", "书库"], chapter: "第 03 章", caption: "让每本书都有自己的声音" },
  ja: { account: "アカウント", cover: ["聴く", "図書室"], chapter: "第03章", caption: "すべての物語に声を" },
  ko: { account: "계정", cover: ["듣는", "서재"], chapter: "챕터 03", caption: "모든 이야기에 목소리를" },
  fr: { account: "Compte", cover: ["LA", "BIBLIOTHÈQUE", "AUDIO"], chapter: "Chapitre 03", caption: "Chaque histoire mérite une voix" },
  es: { account: "Cuenta", cover: ["LA", "BIBLIOTECA", "SONORA"], chapter: "Capítulo 03", caption: "Cada historia merece una voz" },
};

export default function Home({ lang }: { lang: Lang }) {
  const t = homeCopy[lang];
  const details = marketingCopy[lang];
  const art = heroArt[lang];
  return <main>
    <nav className="nav wrap"><a className="brand" href="#top"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a><div className="navlinks">{t.nav.map((n,i)=><a key={n} href={localizedHref(["/features","/how-it-works","/formats"][i], lang)}>{n}</a>)}<a href={localizedHref("/updates", lang)}>{releaseCopy[lang].nav}</a></div><div className="accountNavControls"><a className="accountNavLink" href={`/account?lang=${lang}`}>{art.account}</a><MarketingLanguages lang={lang} path="/" /></div></nav>
    <UpdateNotice lang={lang} />
    <section className="hero wrap" id="top"><div className="heroCopy"><div className="pill"><span></span>{t.free}</div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="lead">{t.intro}</p><div className="actions"><a className="primary" href={downloadUrl}>▣&nbsp; {t.download}</a></div><p className="note">✓ {t.note}</p></div><div className="heroVisual" aria-hidden="true"><div className="orb one"></div><div className="orb two"></div><div className="book"><div className="bookTop"><span>BOOK 2 AUDIO</span><b>GO</b></div><div className="sound"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="bookTitle">{art.cover.map(line => <span key={line}>{line}</span>)}</div><div className="bookFoot"><span>EPUB · PDF · DOCX</span><strong>▶</strong></div></div><div className="miniPlayer"><button>▶</button><div><b>{art.chapter}</b><span>{art.caption}</span><em><i></i></em></div><small>12:48</small></div></div></section>
    <section className="cyclingSection" id="formats">
      <div className="cyclingImage" aria-hidden="true" />
      <div className="wrap cyclingContent">
        <p className="formatPill">EPUB · PDF · TXT · DOCX <span aria-hidden="true">→</span> MP3 / WAV</p>
        <h2>{t.formats}</h2><p>{t.formatsBody}</p><p className="cyclingValue">{t.value}</p>
        <a className="guideLink" href={localizedHref("/formats", lang)}>{t.nav[2]} →</a>
      </div>
    </section>
    <section className="wrap featureSummary" id="features">
      <h2>{t.nav[0]}</h2><p>{details.useCases}</p>
      <div className="featureSummaryGrid">{details.features.map(([title, body]) =>
        <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
      <a className="guideLink" href={localizedHref("/features", lang)}>{t.nav[0]} →</a>
    </section>
    <section className="workflowSummary" id="how"><div className="wrap">
      <h2>{t.how}</h2>
      <ol>{t.steps.map(([number, title]) => <li key={number}><b>{number}</b>{title}</li>)}</ol>
      <div className="workflowLinks"><a className="guideLink" href={localizedHref("/how-it-works", lang)}>{t.nav[1]} →</a><a className="guideLink" href="/guides/itunes-apple-music" hrefLang="zh-CN">{details.related} →</a></div>
    </div></section>
    <DiscoveryContent lang={lang} />
    <section className="final"><div className="wrap"><div><p>BOOK2AUDIO GO</p><h2>{t.cta}</h2><span>{t.ctaBody}</span><a className="primary light" href={downloadUrl}>▣&nbsp; {t.download}</a></div><div className="disc" aria-hidden="true"><div><span>BOOK2AUDIO</span><b>GO</b></div></div></div></section>
    <footer className="wrap"><div className="brand"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></div><p>{t.footer}<br/><small>{t.privacy}</small><a className="footerUpdateLink updateReadMore" href={`/updates?lang=${lang}`}>{releaseCopy[lang].nav}</a></p></footer>
  </main>;
}
