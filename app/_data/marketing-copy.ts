import { htmlLang, localeAlternates, localizedHref, type Lang, type MarketingPath } from "./languages";
import type { Metadata } from "next";

export const marketingCopy = {
  en: {
    title: "Free PDF & EPUB to Audiobook Converter",
    description: "Convert PDF, EPUB, TXT and DOCX to MP3 or WAV on Windows. Batch convert ebooks, export by chapter, organize your library and set an annual reading goal.",
    useCases: "Use this ebook to audiobook converter to narrate novels or bedtime stories without background music. You can also convert Word documents and TXT files to audio.",
    features: [["Batch ebook conversion", "Queue several books and check progress in Tasks."], ["Personal library", "Organize your ebooks, resume conversions and open each book’s audio folder."], ["Annual reading plan", "Set a yearly goal and plan the books you want to finish."]],
    how: "Convert your first book", formats: "Input and output formats", related: "Read the iTunes and Apple Music guide (Chinese)",
    keywords: "Book2Audio GO|ebook to audiobook converter|book to audio converter|ebook-to-audio conversion|PDF & EPUB to Audiobook Converter|PDF to audiobook conversion|PDF to audio and MP3|EPUB to MP3|EPUB to MP3 audiobooks|convert PDF and EPUB books to MP3|automatic chapter detection|chapter-based MP3|MP3 or WAV export|text preview|multilingual voices|audiobook metadata|speech synthesis|Windows 10/11|TXT|DOCX|copy the exported MP3 files to your phone|ebook to MP3 converter|audiobook converter for Windows|convert ebooks to audio|text to speech for ebooks|DOCX to audio|Word document to MP3|TXT to MP3|text file to audiobook",
  },
  zh: {
    title: "免费有声书生成软件 · 电子书转 MP3",
    description: "Windows 有声书生成软件和 AI 语音合成工具。用真人感 AI 语音把 EPUB、PDF、TXT、DOCX 批量转成 MP3 或 WAV，管理书库和年度阅读计划。",
    useCases: "把自己的电子书变成有声书。用文本转语音制作有声书小说，或给宝宝制作睡前故事。TTS 能生成带真人朗读感的 AI 语音，导出无背景音乐的有声书 MP3，省去逐章录制。也支持 DOCX 转音频、Word 文档转 MP3 和 TXT 文本转有声书。",
    features: [["批量转换电子书", "一次将多本书加入转换队列，在「任务」中查看进度，按章节导出 MP3 或 WAV。"], ["管理个人书库", "在「书库」中整理电子书和转换进度，继续转换或从封面打开音频文件夹。"], ["制定年度阅读计划", "设定年度阅读目标，把想读的书排进计划，按自己的节奏完成读书愿望。"]],
    how: "转换你的第一本有声书", formats: "支持的输入和音频格式", related: "查看 iTunes 和 Apple Music 播放教程",
    keywords: "把自己的电子书变成有声书|电子书转有声书工具|电子书转 MP3 工具|Windows 有声书转换软件|把电子书转成音频|电子书文字转语音|有声书生成软件|文本转语音|AI语音合成工具|TTS真人音效|真人感AI语音|EPUB转MP3|EPUB转有声书|有声书制作|有声书小说|有声书录制|有声书mp3|有声书无背景音|宝宝有声书生成|睡前故事制作|Book2Audio GO|DOCX 转音频|Word 文档转 MP3|TXT 转 MP3|文本文件转有声书",
  },
  ja: {
    title: "Windows 用 電子書籍オーディオブック変換ソフト",
    description: "PDF、EPUB、TXT、DOCX を自然なテキスト読み上げで MP3 や WAV に変換。一括変換、本棚、年間読書計画に対応。",
    useCases: "お持ちの電子書籍をオーディオブックに。自然な AI 音声で、小説や寝かしつけのお話を BGM なしで音声化。Word 文書や TXT ファイルも MP3 に変換できます。",
    features: [["電子書籍を一括変換", "複数の本を変換キューに追加し、タスク画面で進行状況を確認できます。"], ["自分の本棚", "本と変換状況を管理し、変換の再開や音声フォルダーの表示ができます。"], ["年間読書計画", "読書目標を設定し、読みたい本を自分のペースで読み進められます。"]],
    how: "最初の一冊を変換する", formats: "対応する入力形式と音声形式", related: "iTunes・Apple Music ガイド（中国語）",
    keywords: "お持ちの電子書籍をオーディオブックに|電子書籍 オーディオブック 変換ソフト|電子書籍 MP3 変換ソフト|Windows 用 オーディオブック変換ソフト|電子書籍を音声に変換|電子書籍のテキスト読み上げ|DOCX を音声に変換|Word 文書を MP3 に変換|TXT を MP3 に変換|テキストファイルをオーディオブックに変換",
  },
  ko: {
    title: "Windows용 전자책 오디오북 변환기",
    description: "PDF, EPUB, TXT, DOCX를 자연스러운 음성으로 MP3나 WAV로 저장하세요. 일괄 변환, 서재 관리, 연간 독서 계획을 지원합니다.",
    useCases: "텍스트 음성 변환으로 내 전자책을 오디오북으로 바꾸세요. 소설과 잠자리 이야기를 배경 음악 없이 저장하거나 Word 문서와 TXT 파일을 MP3로 변환할 수 있습니다.",
    features: [["전자책 일괄 변환", "여러 책을 대기열에 추가하고 작업 화면에서 진행 상황을 확인하세요."], ["나만의 서재", "전자책과 진행 상황을 한곳에서 관리하고 변환을 재개하거나 오디오 폴더를 여세요."], ["연간 독서 계획", "올해 읽고 싶은 책과 독서 목표를 정하고 나만의 속도로 계획을 실천하세요."]],
    how: "첫 오디오북 만들기", formats: "지원하는 입력 및 오디오 형식", related: "iTunes 및 Apple Music 가이드 (중국어)",
    keywords: "내 전자책을 오디오북으로 바꾸기|전자책 오디오북 변환기|전자책 MP3 변환기|Windows용 오디오북 변환 프로그램|전자책을 오디오로 변환|전자책 텍스트 음성 변환|DOCX를 오디오로 변환|Word 문서를 MP3로 변환|TXT를 MP3로 변환|텍스트 파일을 오디오북으로 변환",
  },
  fr: {
    title: "Convertisseur de livres numériques en livres audio pour Windows",
    description: "Convertissez PDF, EPUB, TXT et DOCX en MP3 ou WAV par synthèse vocale. Conversion par lots, bibliothèque personnelle et plan de lecture annuel.",
    useCases: "Transformez vos livres numériques en audio. Préparez un roman ou une histoire du soir avec une voix naturelle, sans musique de fond. Convertissez aussi vos documents Word et fichiers TXT en MP3.",
    features: [["Conversion par lots", "Mettez plusieurs livres en file d’attente et suivez leur conversion dans les tâches."], ["Bibliothèque personnelle", "Classez vos livres, reprenez une conversion ou ouvrez le dossier audio depuis la couverture."], ["Plan de lecture annuel", "Fixez un objectif et planifiez les livres que vous voulez terminer cette année."]],
    how: "Convertir votre premier livre", formats: "Formats d’entrée et de sortie", related: "Guide iTunes et Apple Music (en chinois)",
    keywords: "Transformez vos livres numériques en audio|Vos PDF et EPUB deviennent des livres audio|convertisseur de livres numériques en livres audio|convertisseur de livres numériques en MP3|convertisseur de livres audio pour Windows|convertir des livres numériques en audio|synthèse vocale pour livres numériques|convertir un DOCX en audio|convertir un document Word en MP3|convertir un fichier TXT en MP3|convertir un fichier texte en livre audio",
  },
  es: {
    title: "Conversor de libros electrónicos a audiolibros para Windows",
    description: "Convierte PDF, EPUB, TXT y DOCX en MP3 o WAV con texto a voz. Conversión por lotes, biblioteca personal y plan de lectura anual.",
    useCases: "Convierte tus propios libros electrónicos en audio. Crea narraciones de novelas y cuentos para dormir con voz natural y sin música de fondo. También puedes convertir documentos Word y archivos TXT en MP3.",
    features: [["Conversión por lotes", "Añade varios libros a la cola y sigue su progreso en la lista de tareas."], ["Biblioteca personal", "Reúne tus libros, reanuda una conversión o abre la carpeta de audio desde la portada."], ["Plan de lectura anual", "Fija una meta y organiza los libros que te gustaría terminar este año."]],
    how: "Convierte tu primer libro", formats: "Formatos de entrada y salida", related: "Guía de iTunes y Apple Music (en chino)",
    keywords: "Convierte tus propios libros electrónicos en audio|Convierte PDF y EPUB en audiolibros|conversor de libros electrónicos a audiolibros|conversor de libros electrónicos a MP3|conversor de audiolibros para Windows|convertir libros electrónicos en audio|texto a voz para libros electrónicos|convertir DOCX en audio|convertir un documento de Word a MP3|convertir TXT a MP3|convertir un archivo de texto en audiolibro",
  },
};

export function marketingMetadata(lang: Lang, path: MarketingPath, title: string, description: string, keywords?: string): Metadata {
  const branded = title + " | Book2Audio GO";
  return {
    title: branded, description, keywords: keywords?.split("|"),
    alternates: localeAlternates(path, lang),
    openGraph: { title: branded, description, url: "https://book2audiogo.com" + localizedHref(path, lang), siteName: "Book2Audio GO", type: "website", locale: htmlLang(lang).replace("-", "_") },
    twitter: { card: "summary", title: branded, description },
  };
}

export function homeMetadata(lang: Lang) {
  const copy = marketingCopy[lang];
  return marketingMetadata(lang, "/", copy.title, copy.description, copy.keywords);
}
