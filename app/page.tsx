"use client";

import { useEffect, useState } from "react";

type Lang = "zh" | "ja" | "ko";

const copy = {
  zh: {
    nav: ["功能", "使用方法", "支持格式"], free: "现已免费", eyebrow: "把阅读带进每一段路程",
    title: "让每一本书，\n都有自己的声音。", intro: "Book2Audio GO 将电子书按章节整理，并转换为自然流畅的有声内容。无需复杂设置，选择一本书、一个声音，就可以开始聆听。",
    download: "免费下载 Windows 版", source: "在 GitHub 查看源码", note: "免费使用 · Windows 10/11 · 无需注册",
    formats: "一本书进来，随时随地听出去。", formatsBody: "支持常见电子书与文档格式，保留章节结构，并为每一段内容匹配自然语音。",
    cards: [["章节自动识别","解析书籍目录，按章节预览、选择并分别导出。"],["多语言自然语音","内置中文、日语、韩语及英语语音，语速可自由调整。"],["完整专辑信息","写入标题、作者、年份、流派和封面，让音频井井有条。"],["为长篇内容而生","智能分段、失败重试和进度显示，长篇转换更安心。"]],
    how: "三步，把文字变成声音", steps: [["01","选择书籍","打开 EPUB、TXT、PDF 或 DOCX 文件。"],["02","选择章节与声音","预览正文，挑选章节、语音和语速。"],["03","导出并聆听","生成 MP3 或 WAV，放进你喜欢的播放器。"]],
    cta: "下一本想听的书，\n现在就交给它。", ctaBody: "Book2Audio GO 目前完全免费。下载 Windows 版，开始制作属于你的有声书。",
    footer: "让文字更自由，让阅读走得更远。", privacy: "转换在你的电脑上完成；语音合成需要联网。"
  },
  ja: {
    nav: ["機能", "使い方", "対応形式"], free: "現在無料", eyebrow: "読書を、どこへでも",
    title: "すべての本に、\nその本だけの声を。", intro: "Book2Audio GO は電子書籍を章ごとに整理し、自然な音声へ変換します。難しい設定は不要。本と声を選ぶだけで、すぐに聴き始められます。",
    download: "Windows版を無料ダウンロード", source: "GitHubでソースを見る", note: "無料 · Windows 10/11 · 登録不要",
    formats: "一冊の本を、いつでも聴けるかたちへ。", formatsBody: "一般的な電子書籍・文書形式に対応。章構成を保ちながら、自然な音声に変換します。",
    cards: [["章を自動認識","目次を解析し、章ごとにプレビュー・選択・書き出し。"],["多言語の自然音声","中国語、日本語、韓国語、英語の音声と速度を選択。"],["充実したアルバム情報","タイトル、著者、年、ジャンル、カバーを音声に保存。"],["長い作品にも対応","自動分割、再試行、進捗表示で長編も安心。"]],
    how: "文字から音声へ、わずか3ステップ", steps: [["01","本を選ぶ","EPUB、TXT、PDF、DOCXを開きます。"],["02","章と声を選ぶ","本文を確認し、章・音声・速度を設定。"],["03","書き出して聴く","MP3またはWAVで、お好きなプレイヤーへ。"]],
    cta: "次に聴きたい本を、\n今すぐ音声に。", ctaBody: "Book2Audio GO は現在完全無料です。Windows版をダウンロードして、自分だけのオーディオブックを作りましょう。",
    footer: "文字をもっと自由に。読書をもっと遠くへ。", privacy: "変換はPC上で実行されます。音声合成にはインターネット接続が必要です。"
  },
  ko: {
    nav: ["기능", "사용 방법", "지원 형식"], free: "현재 무료", eyebrow: "독서를 어디서나 이어가세요",
    title: "모든 책에,\n그 책만의 목소리를.", intro: "Book2Audio GO는 전자책을 챕터별로 정리하고 자연스러운 음성으로 변환합니다. 복잡한 설정 없이 책과 목소리를 선택하면 바로 들을 수 있습니다.",
    download: "Windows용 무료 다운로드", source: "GitHub에서 소스 보기", note: "무료 · Windows 10/11 · 가입 불필요",
    formats: "한 권의 책을, 언제든 들을 수 있게.", formatsBody: "일반적인 전자책과 문서 형식을 지원하며 챕터 구조를 유지해 자연스러운 음성으로 바꿉니다.",
    cards: [["챕터 자동 인식","목차를 분석하고 챕터별 미리보기, 선택, 내보내기를 지원합니다."],["다국어 자연 음성","중국어, 일본어, 한국어, 영어 음성과 속도를 선택하세요."],["완성도 높은 앨범 정보","제목, 저자, 연도, 장르와 표지를 오디오에 저장합니다."],["긴 콘텐츠도 안정적으로","자동 분할, 재시도, 진행률 표시로 장편도 안심하세요."]],
    how: "세 단계로 글자를 목소리로", steps: [["01","책 선택","EPUB, TXT, PDF 또는 DOCX 파일을 엽니다."],["02","챕터와 음성 선택","본문을 확인하고 챕터, 음성, 속도를 고릅니다."],["03","내보내고 듣기","MP3 또는 WAV로 만들어 원하는 플레이어에서 듣습니다."]],
    cta: "다음에 듣고 싶은 책,\n지금 맡겨 보세요.", ctaBody: "Book2Audio GO는 현재 완전 무료입니다. Windows 버전을 다운로드하고 나만의 오디오북을 만들어 보세요.",
    footer: "글자를 더 자유롭게, 독서를 더 멀리.", privacy: "변환은 PC에서 진행되며 음성 합성에는 인터넷 연결이 필요합니다."
  }
};

const downloadUrl = "https://github.com/catanddogmiaomiao/Book2AudioGo/releases/latest";

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  useEffect(() => { const l = navigator.language.toLowerCase(); if (l.startsWith("ja")) setLang("ja"); else if (l.startsWith("ko")) setLang("ko"); }, []);
  const t = copy[lang];
  return <main>
    <nav className="nav wrap"><a className="brand" href="#top"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></a><div className="navlinks">{t.nav.map((n,i)=><a key={n} href={["#features","#how","#formats"][i]}>{n}</a>)}</div><div className="language" aria-label="Language">{(["zh","ja","ko"] as Lang[]).map(l=><button className={lang===l?"active":""} onClick={()=>setLang(l)} key={l}>{l.toUpperCase()}</button>)}</div></nav>
    <section className="hero wrap" id="top"><div className="heroCopy"><div className="pill"><span></span>{t.free}</div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="lead">{t.intro}</p><div className="actions"><a className="primary" href={downloadUrl}>▣&nbsp; {t.download}</a><a className="secondary" href="https://github.com/catanddogmiaomiao/Book2AudioGo">{t.source} ↗</a></div><p className="note">✓ {t.note}</p></div><div className="heroVisual" aria-hidden="true"><div className="orb one"></div><div className="orb two"></div><div className="book"><div className="bookTop"><span>BOOK 2 AUDIO</span><b>GO</b></div><div className="sound"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="bookTitle">THE<br/>LISTENING<br/>LIBRARY</div><div className="bookFoot"><span>EPUB · PDF · DOCX</span><strong>▶</strong></div></div><div className="miniPlayer"><button>▶</button><div><b>Chapter 03</b><span>Every story deserves a voice</span><em><i></i></em></div><small>12:48</small></div></div></section>
    <section className="formats" id="formats"><div className="wrap"><div className="formatRow"><span>EPUB</span><i>→</i><span>TXT</span><i>→</i><span>PDF</span><i>→</i><span>DOCX</span><b>MP3 / WAV</b></div><div className="sectionIntro"><p>BOOK → VOICE</p><h2>{t.formats}</h2><span>{t.formatsBody}</span></div><div className="cards" id="features">{t.cards.map((c,i)=><article key={c[0]}><div className={`icon icon${i}`}>{["≡","⌁","✦","↗"][i]}</div><h3>{c[0]}</h3><p>{c[1]}</p></article>)}</div></div></section>
    <section className="how wrap" id="how"><div className="sectionIntro dark"><p>HOW IT WORKS</p><h2>{t.how}</h2></div><div className="steps">{t.steps.map((s,i)=><article key={s[0]}><span>{s[0]}</span><div className="stepPic">{i===0?<><b>EPUB</b><i>＋</i></>:i===1?<><div className="wave">▂▄▆█▅▃▇▄</div><i>●</i></>:<><b>MP3</b><i>✓</i></>}</div><h3>{s[1]}</h3><p>{s[2]}</p></article>)}</div></section>
    <section className="final"><div className="wrap"><div><p>BOOK2AUDIO GO</p><h2>{t.cta}</h2><span>{t.ctaBody}</span><a className="primary light" href={downloadUrl}>▣&nbsp; {t.download}</a></div><div className="disc" aria-hidden="true"><div><span>BOOK2AUDIO</span><b>GO</b></div></div></div></section>
    <footer className="wrap"><div className="brand"><span className="brandmark">B<span>▶</span></span><strong>Book2Audio <i>GO</i></strong></div><p>{t.footer}<br/><small>{t.privacy}</small></p><a href="https://github.com/catanddogmiaomiao/Book2AudioGo">GitHub ↗</a></footer>
  </main>;
}
