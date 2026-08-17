"use client";

import { useEffect, useState } from "react";

type Lang = "zh" | "ja" | "ko";

const copy = {
  zh: {
    nav: ["功能", "使用方法", "支持格式"], free: "现已免费", eyebrow: "把阅读带进每一段路程",
    title: "让每一本书，\n都有自己的声音。", intro: "Book2Audio GO 将你的电子书转换成自然流畅的有声书。\n通勤、开车、散步、运动，或者眼睛疲劳不想继续看屏幕时，也可以继续读自己的书。",
    download: "免费下载 Windows 版", note: "免费使用 · Windows 10/11 · 无需注册",
    formats: "把没法读书的时间，\n变成读书时间。", formatsBody: "收藏在电脑和网盘里的电子书，不必再一直吃灰。\n把它们转换成 MP3 或 WAV，在通勤、开车、散步或休息时继续阅读。\n支持 EPUB、TXT、PDF、DOCX 等常见格式，并自动保留章节结构。",
    value: "有些时候，不是不想读书，只是没办法看书。\n你不需要等待某个平台上架你想听的书。你已有的电子书，就可以成为自己的有声书。",
    cards: [["章节自动识别","自动解析书籍目录，按章节预览、选择并分别导出。"],["多语言自然语音","支持中文、日语、韩语及英语语音，并可自由调整语速。"],["完整有声书信息","自动写入标题、作者、年份、流派和封面，让生成的有声书整齐易管理。"],["为长篇阅读而生","自动分段、失败重试和进度显示，让整本书的转换更加稳定。"]],
    how: "三步，把电子书变成有声书。", steps: [["01","选择书籍","打开 EPUB、TXT、PDF 或 DOCX 文件。"],["02","选择章节与声音","预览正文，选择需要转换的章节、语音和语速。"],["03","导出并聆听","生成 MP3 或 WAV，放进手机、电脑或你喜欢的播放器中。"]],
    cta: "你的电子书，\n就是你的有声书。", ctaBody: "不用再寻找“有没有这本有声书”。\n把自己已经拥有的电子书转换成音频，在适合自己的时间继续阅读。",
    footer: "让文字更自由，让阅读不再受时间和屏幕限制。", privacy: "电子书内容在你的电脑上处理；语音合成需要联网。"
  },
  ja: {
    nav: ["機能", "使い方", "対応形式"], free: "現在無料", eyebrow: "移動する時間も、読書の時間に",
    title: "すべての本に、\nその本だけの声を。", intro: "Book2Audio GO は、お持ちの電子書籍を自然で聴きやすいオーディオブックに変換します。\n通勤や運転、散歩、運動中はもちろん、目が疲れて画面を見たくないときも、自分の本を読み続けられます。",
    download: "Windows版を無料ダウンロード", note: "無料で利用可能 · Windows 10/11 · 登録不要",
    formats: "本を開けない時間を、\n読書の時間に。", formatsBody: "パソコンやクラウドに眠っている電子書籍を、そのままにしておく必要はありません。\nMP3 または WAV に変換すれば、通勤や運転、散歩、休憩中にも読書を続けられます。\nEPUB、TXT、PDF、DOCX などの一般的な形式に対応し、章立ても自動で保持します。",
    value: "読みたくないのではなく、画面を見られないだけ。そんな時間があります。\n聴きたい本が配信されるのを待つ必要はありません。手元の電子書籍が、そのまま自分のオーディオブックになります。",
    cards: [["章を自動認識","書籍の目次を自動解析し、章ごとにプレビュー、選択、個別書き出しができます。"],["多言語の自然な音声","中国語、日本語、韓国語、英語の音声に対応し、読み上げ速度も自由に調整できます。"],["充実したオーディオブック情報","タイトル、著者、発行年、ジャンル、カバー画像を自動で書き込み、生成した作品をすっきり管理できます。"],["長編の変換にも安心","自動分割、失敗時の再試行、進捗表示により、一冊まるごとの変換も安定して行えます。"]],
    how: "3ステップで、電子書籍をオーディオブックに。", steps: [["01","本を選ぶ","EPUB、TXT、PDF、DOCX ファイルを開きます。"],["02","章と音声を選ぶ","本文を確認し、変換する章、音声、読み上げ速度を選びます。"],["03","書き出して聴く","MP3 または WAV で書き出し、スマートフォンやパソコン、お好みのプレーヤーで楽しめます。"]],
    cta: "あなたの電子書籍が、\nあなたのオーディオブックに。", ctaBody: "「この本のオーディオブックはあるだろうか」と、もう探し回る必要はありません。\nすでにお持ちの電子書籍を音声に変えて、自分に合った時間に読書を続けましょう。",
    footer: "文字をもっと自由に。時間や画面に縛られない読書を。", privacy: "電子書籍の内容はお使いのパソコン上で処理されます。音声合成にはインターネット接続が必要です。"
  },
  ko: {
    nav: ["기능", "사용 방법", "지원 형식"], free: "현재 무료", eyebrow: "이동하는 모든 순간에도 독서를",
    title: "모든 책에,\n그 책만의 목소리를.", intro: "Book2Audio GO는 가지고 있는 전자책을 자연스럽고 편안하게 들을 수 있는 오디오북으로 바꿔 줍니다.\n출퇴근, 운전, 산책, 운동 중은 물론 눈이 피로해 화면을 보기 싫을 때도 내 책을 계속 읽을 수 있습니다.",
    download: "Windows용 무료 다운로드", note: "무료 사용 · Windows 10/11 · 가입 불필요",
    formats: "책을 볼 수 없는 시간을,\n독서 시간으로.", formatsBody: "컴퓨터와 클라우드에 보관만 해 둔 전자책을 더 이상 묵혀 두지 마세요.\nMP3 또는 WAV로 변환하면 출퇴근, 운전, 산책, 휴식 중에도 독서를 이어갈 수 있습니다.\nEPUB, TXT, PDF, DOCX 등 일반적인 형식을 지원하며 챕터 구조도 자동으로 유지합니다.",
    value: "책을 읽고 싶지 않은 게 아니라, 화면을 볼 수 없는 순간이 있을 뿐입니다.\n듣고 싶은 책이 어떤 플랫폼에 올라오기를 기다릴 필요도 없습니다. 이미 가지고 있는 전자책이 나만의 오디오북이 됩니다.",
    cards: [["챕터 자동 인식","책의 목차를 자동으로 분석해 챕터별로 미리 보고, 선택하고, 각각 내보낼 수 있습니다."],["자연스러운 다국어 음성","중국어, 일본어, 한국어, 영어 음성을 지원하며 읽기 속도도 자유롭게 조절할 수 있습니다."],["완전한 오디오북 정보","제목, 저자, 연도, 장르, 표지를 자동으로 기록해 만든 오디오북을 깔끔하게 관리할 수 있습니다."],["긴 책을 위한 안정적인 변환","자동 분할, 실패 시 재시도, 진행률 표시로 책 한 권 전체도 안정적으로 변환합니다."]],
    how: "세 단계로 전자책을 오디오북으로.", steps: [["01","책 선택","EPUB, TXT, PDF 또는 DOCX 파일을 엽니다."],["02","챕터와 음성 선택","본문을 미리 보고 변환할 챕터, 음성, 읽기 속도를 선택합니다."],["03","내보내고 듣기","MP3 또는 WAV로 만든 뒤 휴대폰, 컴퓨터, 원하는 플레이어에서 듣습니다."]],
    cta: "당신의 전자책이,\n당신의 오디오북입니다.", ctaBody: "‘이 책은 오디오북으로 나왔을까?’ 더 이상 찾아다닐 필요가 없습니다.\n이미 가지고 있는 전자책을 오디오로 바꿔 나에게 맞는 시간에 독서를 이어가세요.",
    footer: "글을 더 자유롭게, 시간과 화면에 구애받지 않는 독서를.", privacy: "전자책 내용은 사용자의 컴퓨터에서 처리되며, 음성 합성에는 인터넷 연결이 필요합니다."
  }
};

const downloadUrl = "https://pub-f257fbbebf604ed69c35001d3c3ea070.r2.dev/Book2AudioGO-v1.0.0.zip";

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  useEffect(() => { const l = navigator.language.toLowerCase(); if (l.startsWith("ja")) setLang("ja"); else if (l.startsWith("ko")) setLang("ko"); }, []);
  const t = copy[lang];
  return <main>
    <nav className="nav wrap"><a className="brand" href="#top"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a><div className="navlinks">{t.nav.map((n,i)=><a key={n} href={["#features","#how","#formats"][i]}>{n}</a>)}</div><div className="language" aria-label="Language">{(["zh","ja","ko"] as Lang[]).map(l=><button className={lang===l?"active":""} onClick={()=>setLang(l)} key={l}>{l.toUpperCase()}</button>)}</div></nav>
    <section className="hero wrap" id="top"><div className="heroCopy"><div className="pill"><span></span>{t.free}</div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="lead">{t.intro}</p><div className="actions"><a className="primary" href={downloadUrl}>▣&nbsp; {t.download}</a></div><p className="note">✓ {t.note}</p></div><div className="heroVisual" aria-hidden="true"><div className="orb one"></div><div className="orb two"></div><div className="book"><div className="bookTop"><span>BOOK 2 AUDIO</span><b>GO</b></div><div className="sound"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="bookTitle">THE<br/>LISTENING<br/>LIBRARY</div><div className="bookFoot"><span>EPUB · PDF · DOCX</span><strong>▶</strong></div></div><div className="miniPlayer"><button>▶</button><div><b>Chapter 03</b><span>Every story deserves a voice</span><em><i></i></em></div><small>12:48</small></div></div></section>
    <section className="formats" id="formats"><div className="wrap"><div className="formatRow"><span>EPUB</span><i>→</i><span>TXT</span><i>→</i><span>PDF</span><i>→</i><span>DOCX</span><b>MP3 / WAV</b></div><div className="sectionIntro"><p>BOOK → VOICE</p><h2>{t.formats}</h2><span style={{display:"block", whiteSpace:"pre-line"}}>{t.formatsBody}</span><span style={{display:"block", whiteSpace:"pre-line", marginTop:20, color:"var(--ink)", fontWeight:600}}>{t.value}</span></div><div className="cards" id="features">{t.cards.map((c,i)=><article key={c[0]}><div className={`icon icon${i}`}>{["≡","⌁","✦","↗"][i]}</div><h3>{c[0]}</h3><p>{c[1]}</p></article>)}</div></div></section>
    <section className="how wrap" id="how"><div className="sectionIntro dark"><p>HOW IT WORKS</p><h2>{t.how}</h2></div><div className="steps">{t.steps.map((s,i)=><article key={s[0]}><span>{s[0]}</span><div className="stepPic">{i===0?<><b>EPUB</b><i>＋</i></>:i===1?<><div className="wave">▂▄▆█▅▃▇▄</div><i>●</i></>:<><b>MP3</b><i>✓</i></>}</div><h3>{s[1]}</h3><p>{s[2]}</p></article>)}</div></section>
    <section className="final"><div className="wrap"><div><p>BOOK2AUDIO GO</p><h2>{t.cta}</h2><span>{t.ctaBody}</span><a className="primary light" href={downloadUrl}>▣&nbsp; {t.download}</a></div><div className="disc" aria-hidden="true"><div><span>BOOK2AUDIO</span><b>GO</b></div></div></div></section>
    <footer className="wrap"><div className="brand"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></div><p>{t.footer}<br/><small>{t.privacy}</small></p></footer>
  </main>;
}

