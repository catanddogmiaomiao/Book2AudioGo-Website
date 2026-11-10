import { htmlLang, type Lang } from "./languages";
export const RELEASE_DATE = "2026-11-10";
export const DOWNLOAD_URL = "/download/windows";
export const releaseDate = (lang: Lang) =>
  new Intl.DateTimeFormat(htmlLang(lang), { dateStyle: "medium", timeZone: "UTC" }).format(new Date(RELEASE_DATE));

type ReleaseCopy = {
  nav: string; badge: string; noticeTitle: string; noticeBody: string;
  download: string; details: string; back: string; title: string; intro: string;
  releaseTitle: string; platform: string; upgradeTitle: string; upgradeSteps: string[];
  groups: { title: string; items: string[] }[];
  questionsTitle: string; questions: { question: string; answer: string }[];
};

export const releaseCopy: Record<Lang, ReleaseCopy> = {
  fr: {
    nav: "Mises à jour", badge: "Mise à jour Windows", noticeTitle: "La version 1.2.0 est disponible",
    noticeBody: "Version publiée le 10 novembre 2026. Téléchargez le programme d’installation complet pour Windows.",
    download: "Télécharger la dernière version Windows", details: "Notes de version et instructions", back: "Retour à l’accueil",
    title: "Notes de version", intro: "Consultez les dernières mises à jour de Book2Audio GO, les problèmes corrigés et la procédure de mise à niveau.",
    releaseTitle: "Book2Audio GO 1.2.0", platform: "Windows 10 / 11 · Installateur 64 bits · environ 59 Mo",
    groups: [{ title: "1.2.0", items: ["Importez vos livres par glisser-déposer, gérez les licences et les appareils associés depuis votre compte et choisissez dans les paramètres si vous souhaitez partager les données d’utilisation."] }],
    upgradeTitle: "Comment passer à la nouvelle version", upgradeSteps: ["Fermez l’ancienne version et sauvegardez votre bibliothèque et les fichiers à conserver.", "Téléchargez l’installateur Windows, lancez le fichier EXE et suivez les instructions.", "Ouvrez la nouvelle version et essayez un aperçu vocal ou un chapitre court."],
    questionsTitle: "En cas de problème", questions: [
      { question: "Que faire si des fichiers nécessaires au démarrage sont introuvables ?", answer: "Téléchargez à nouveau l’installateur complet et suivez les instructions d’installation." },
      { question: "Que faire si la conversion échoue toujours ?", answer: "Vérifiez votre connexion Internet, puis essayez l’aperçu vocal ou un chapitre court. Notez le message d’erreur si le problème persiste. Des problèmes de réseau ou de service peuvent subsister." },
    ],
  },
  es: {
    nav: "Actualizaciones", badge: "Actualización de Windows", noticeTitle: "La versión 1.2.0 ya está disponible",
    noticeBody: "Publicada el 10 de noviembre de 2026. Descarga el instalador completo para Windows.",
    download: "Descargar la última versión para Windows", details: "Notas y pasos para actualizar", back: "Volver al inicio",
    title: "Notas de la versión", intro: "Consulta las últimas actualizaciones de Book2Audio GO, los problemas corregidos y cómo actualizar desde una versión anterior.",
    releaseTitle: "Book2Audio GO 1.2.0", platform: "Windows 10 / 11 · Instalador de 64 bits · unos 59 MB",
    groups: [{ title: "1.2.0", items: ["Arrastra y suelta libros, gestiona las licencias y los dispositivos vinculados desde tu cuenta y elige en Ajustes si quieres compartir datos de uso."] }],
    upgradeTitle: "Cómo actualizar", upgradeSteps: ["Cierra la versión anterior y haz una copia de tu biblioteca y de los archivos que quieras conservar.", "Descarga el instalador de Windows, ejecuta el archivo EXE y sigue las instrucciones.", "Abre la nueva versión y prueba la voz o la conversión de un capítulo corto."],
    questionsTitle: "Si tienes problemas", questions: [
      { question: "¿Qué hago si faltan archivos necesarios para iniciar la aplicación?", answer: "Vuelve a descargar el instalador completo y sigue las instrucciones de instalación." },
      { question: "¿Y si la conversión sigue fallando?", answer: "Comprueba la conexión a Internet y prueba la voz o un capítulo corto. Si el fallo persiste, anota el mensaje de error. Algunos problemas de red o del servicio pueden persistir." },
    ],
  },
  zh: {
    nav: "更新日志", badge: "Windows 更新", noticeTitle: "1.2.0 正式版现已可下载",
    noticeBody: "2026 年 11 月 10 日发布。下载完整 Windows 安装程序。",
    download: "下载最新版 Windows 版", details: "查看更新日志与升级方法", back: "返回首页",
    title: "更新日志", intro: "查看 Book2Audio GO 的近期更新、已处理的问题，以及旧版用户的升级方法。",
    releaseTitle: "Book2Audio GO 1.2.0", platform: "Windows 10 / 11 · 64 位安装程序 · 约 59 MB",
    groups: [{ title: "1.2.0", items: ["拖拽导入电子书，使用新版账号中心管理授权和绑定设备。可在设置中选择是否分享使用数据。"] }],
    upgradeTitle: "旧版用户如何升级", upgradeSteps: ["关闭旧版程序，备份书库和需要保留的文件。", "下载 Windows 安装包并运行 EXE，按提示安装。", "打开新版，先试听或转换一个短章节。"],
    questionsTitle: "遇到问题时", questions: [
      { question: "如果提示缺少运行文件怎么办？", answer: "重新下载完整安装包并运行安装程序，按提示完成安装。" },
      { question: "更新后仍然无法转换，怎么办？", answer: "语音合成需要联网。先确认网络可用，再测试语音试听或一个短章节；若仍失败，请记录具体错误信息继续排查。更新不能排除所有网络或服务端问题。" },
    ],
  },
  en: {
    nav: "Updates", badge: "Windows update", noticeTitle: "Version 1.2.0 is available",
    noticeBody: "Released November 10, 2026. Download the complete Windows installer.",
    download: "Download the latest Windows build", details: "Release notes and upgrade steps", back: "Back to home",
    title: "Release notes", intro: "Recent Book2Audio GO updates, resolved issues and upgrade instructions for existing users.",
    releaseTitle: "Book2Audio GO 1.2.0", platform: "Windows 10 / 11 · 64-bit installer · about 59 MB",
    groups: [{ title: "1.2.0", items: ["Drag and drop books, manage licenses and linked devices in the account center, and choose whether to share usage data in Settings."] }],
    upgradeTitle: "How to upgrade", upgradeSteps: ["Close the previous version and back up your library and any files you want to keep.", "Download the Windows installer and run the EXE, then follow the prompts.", "Open the updated app and try a voice preview or a short chapter."],
    questionsTitle: "If you encounter a problem", questions: [
      { question: "What if runtime files are missing?", answer: "Download the complete installer again and follow the installation prompts." },
      { question: "What if conversion still fails after updating?", answer: "Speech synthesis needs an internet connection. Check connectivity, then test a voice preview or a short chapter. Keep the exact error message if it still fails. Updating cannot resolve every network or service-side issue." },
    ],
  },
  ja: {
    nav: "更新情報", badge: "Windows 版の更新", noticeTitle: "バージョン 1.2.0 を公開しました",
    noticeBody: "2026年11月10日公開。Windows インストーラーをダウンロードできます。",
    download: "最新版 Windows 版をダウンロード", details: "更新内容とアップデート方法", back: "ホームへ戻る",
    title: "更新情報", intro: "Book2Audio GO の最近の更新、対応した問題と、旧版からのアップデート方法をご案内します。",
    releaseTitle: "Book2Audio GO 1.2.0", platform: "Windows 10 / 11 · 64 ビットインストーラー · 約 59 MB",
    groups: [{ title: "1.2.0", items: ["書籍のドラッグ＆ドロップ、アカウント画面でのライセンスとデバイス管理、設定からの利用データ共有の選択に対応しました。"] }],
    upgradeTitle: "アップデート方法", upgradeSteps: ["旧版を終了し、書庫や必要なファイルをバックアップします。", "Windows インストーラーをダウンロードし、EXE を実行して画面の案内に従います。", "新版を起動し、試聴または短い章の変換をお試しください。"],
    questionsTitle: "問題が起きたとき", questions: [
      { question: "実行に必要なファイルが見つからない場合は？", answer: "完全版インストーラーを再ダウンロードし、画面の案内に従ってインストールしてください。" },
      { question: "更新後も変換できない場合は？", answer: "音声合成にはインターネット接続が必要です。接続を確認し、試聴や短い章で再テストしてください。解決しない場合は具体的なエラーを記録してください。ネットワークやサービス側の問題がすべて解消するとは限りません。" },
    ],
  },
  ko: {
    nav: "업데이트", badge: "Windows 업데이트", noticeTitle: "버전 1.2.0을 다운로드할 수 있습니다",
    noticeBody: "2026년 11월 10일 출시. Windows 설치 프로그램을 다운로드하세요.",
    download: "최신 Windows 버전 다운로드", details: "업데이트 내용 및 설치 방법", back: "홈으로 돌아가기",
    title: "업데이트 내역", intro: "Book2Audio GO의 최근 업데이트, 해결한 문제 및 기존 사용자의 업데이트 방법을 안내합니다.",
    releaseTitle: "Book2Audio GO 1.2.0", platform: "Windows 10 / 11 · 64비트 설치 프로그램 · 약 59 MB",
    groups: [{ title: "1.2.0", items: ["책을 끌어다 놓아 추가하고 계정 센터에서 라이선스와 연결된 기기를 관리할 수 있습니다. 사용 데이터 공유는 설정에서 선택할 수 있습니다."] }],
    upgradeTitle: "업데이트 방법", upgradeSteps: ["이전 버전을 닫고 서재와 보관할 파일을 백업하세요.", "Windows 설치 프로그램을 다운로드하고 EXE를 실행한 뒤 안내를 따르세요.", "새 버전을 열고 음성 미리 듣기나 짧은 챕터를 변환해 보세요."],
    questionsTitle: "문제가 발생하면", questions: [
      { question: "실행에 필요한 파일이 없으면 어떻게 하나요?", answer: "전체 설치 프로그램을 다시 다운로드하고 안내에 따라 설치하세요." },
      { question: "업데이트 후에도 변환이 실패하면?", answer: "음성 합성에는 인터넷 연결이 필요합니다. 연결을 확인하고 미리 듣기나 짧은 챕터로 테스트하세요. 계속 실패하면 구체적인 오류 메시지를 기록하세요. 모든 네트워크 또는 서비스 측 문제가 업데이트로 해결되는 것은 아닙니다." },
    ],
  },
};
