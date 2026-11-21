import { htmlLang, type Lang } from "./languages";

export const RELEASE_VERSION = "2.0";
export const RELEASE_DATE = "2026-11-21";
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
  "fr": {
    "nav": "Mises à jour",
    "badge": "Mise à jour Windows",
    "noticeTitle": "La version 2.0 est disponible",
    "noticeBody": "Mise à jour du 21 novembre 2026. Voix locales, reconnaissance des PDF numérisés et corrections de licence et d’interface.",
    "download": "Télécharger la dernière version Windows",
    "details": "Notes de version et instructions",
    "back": "Retour à l’accueil",
    "title": "Notes de version",
    "intro": "Consultez les dernières mises à jour de Book2Audio GO, les problèmes corrigés et la procédure de mise à niveau.",
    "releaseTitle": "Book2Audio GO 2.0",
    "platform": "Windows 10 / 11 · Installateur 64 bits · environ 68 Mo",
    "groups": [
      {
        "title": "Dernières corrections",
        "items": [
          "Correction des demandes répétées d’activation pour certains utilisateurs dont le PRO et l’appareil associé étaient valides. La licence de l’appareil est renouvelée automatiquement en ligne avec le service existant.",
          "Correction de l’icône de bibliothèque absente au démarrage et de ses couleurs au survol et à la sélection.",
          "La fenêtre de reconnaissance du PDF adopte le fond crème de l’application. Le conseil de sélection de quelques pages d’essai a été retiré."
        ]
      },
      {
        "title": "Nouveautés et améliorations de la version 2.0",
        "items": [
          "Reconnaissance des PDF numérisés dans l’application. Les composants sont téléchargés à la première utilisation. Choisissez les pages, suivez la progression et réutilisez le texte reconnu. Amélioration de la détection des titres et des niveaux de chapitre.",
          "Voix locales Kokoro et Qwen3-TTS. Télécharger et activer installe les modèles complets et les composants requis, avec progression, pause et reprise et vérification de la configuration de l’ordinateur.",
          "Kokoro propose des voix masculines et féminines en mandarin, anglais, japonais et espagnol, ainsi qu’une voix féminine en français. Écoutez et convertissez hors ligne après installation.",
          "Le plan de lecture dispose d’une bibliothèque en 3D que l’on peut parcourir en faisant glisser les livres. Le menu de bibliothèque ouvre le dossier source et crée des conversions du livre entier (PRO).",
          "Le bouton Continuer est plus visible lorsqu’une conversion par lot est suspendue après plusieurs échecs. Correction des aperçus vides de certains sous-chapitres EPUB.",
          "L’installateur détecte une installation existante et propose de la réparer ou de la désinstaller."
        ]
      },
      {
        "title": "1.2.0 · 2026-11-13",
        "items": [
          "Le plan de lecture indique les livres en cours et la bibliothèque affiche Convertir pour les livres jamais convertis.",
          "Correction d’un plantage à l’ouverture d’un livre dans le plan de lecture.",
          "Importez vos livres par glisser-déposer, gérez les licences et les appareils associés depuis votre compte et choisissez dans les paramètres si vous souhaitez partager les données d’utilisation."
        ]
      }
    ],
    "upgradeTitle": "Comment passer à la nouvelle version",
    "upgradeSteps": [
      "Fermez l’ancienne version et sauvegardez votre bibliothèque et les fichiers à conserver.",
      "Téléchargez l’installateur Windows, lancez le fichier EXE et suivez les instructions.",
      "Ouvrez la nouvelle version et essayez un aperçu vocal ou un chapitre court."
    ],
    "questionsTitle": "En cas de problème",
    "questions": [
      {
        "question": "Faut-il toujours une connexion Internet pour générer une voix ?",
        "answer": "Les voix en ligne nécessitent Internet. Installez un modèle local dans les paramètres de voix pour générer hors ligne. Les modèles et la reconnaissance des PDF sont téléchargés à la première utilisation."
      },
      {
        "question": "Pourquoi une vérification est-elle demandée alors que mon PRO est valide ?",
        "answer": "La nouvelle version renouvelle automatiquement la licence de l’appareil en ligne. Si votre connexion a expiré, reconnectez-vous comme indiqué. La période PRO et l’état de l’appareil sont affichés séparément."
      },
      {
        "question": "Que faire si des fichiers nécessaires au démarrage sont introuvables ?",
        "answer": "Téléchargez à nouveau l’installateur complet et suivez les instructions d’installation."
      },
      {
        "question": "Que faire si la conversion échoue toujours ?",
        "answer": "Pour une voix en ligne, vérifiez la connexion. Pour un modèle local, consultez les indications de mémoire et d’espace libre, fermez les applications inutilisées et essayez un court extrait. Notez l’erreur si le problème persiste."
      }
    ]
  },
  "es": {
    "nav": "Actualizaciones",
    "badge": "Actualización de Windows",
    "noticeTitle": "La versión 2.0 ya está disponible",
    "noticeBody": "Actualizada el 21 de noviembre de 2026. Voces locales, reconocimiento de PDF escaneados y correcciones de licencia e interfaz.",
    "download": "Descargar la última versión para Windows",
    "details": "Notas y pasos para actualizar",
    "back": "Volver al inicio",
    "title": "Notas de la versión",
    "intro": "Consulta las últimas actualizaciones de Book2Audio GO, los problemas corregidos y cómo actualizar desde una versión anterior.",
    "releaseTitle": "Book2Audio GO 2.0",
    "platform": "Windows 10 / 11 · Instalador de 64 bits · unos 68 MB",
    "groups": [
      {
        "title": "Últimas correcciones",
        "items": [
          "Se corrigieron las solicitudes repetidas de activación para usuarios cuyo PRO y equipo vinculado seguían vigentes. La licencia del equipo se renueva automáticamente en línea y es compatible con el servicio existente.",
          "Se corrigió el icono de biblioteca ausente al iniciar y sus colores al pasar el ratón y seleccionar.",
          "La ventana de reconocimiento de PDF usa el fondo crema de la aplicación. Se eliminó el consejo de elegir unas páginas de prueba."
        ]
      },
      {
        "title": "Novedades y mejoras de la versión 2.0",
        "items": [
          "Reconoce PDF escaneados desde la aplicación. Los componentes se descargan al usarlos por primera vez. Selecciona páginas, consulta el progreso y reutiliza el texto reconocido. Se mejoró la detección de títulos y niveles de capítulos.",
          "Voces locales Kokoro y Qwen3-TTS. Descargar y activar instala los modelos completos y sus componentes, con progreso, pausa y reanudación y comprobación del equipo antes de instalar.",
          "Kokoro ofrece voces masculinas y femeninas en mandarín, inglés, japonés y español, además de una voz femenina en francés. Escucha muestras y convierte sin conexión después de instalar.",
          "El plan de lectura incorpora una estantería 3D que puedes explorar arrastrando los libros. El menú de biblioteca abre la carpeta de origen y crea tareas de conversión de libros completos (PRO).",
          "El botón Continuar es más visible cuando una conversión por lotes se pausa tras varios fallos. Se corrigieron vistas previas vacías de algunos subcapítulos EPUB.",
          "El instalador detecta una instalación existente y permite repararla o desinstalarla."
        ]
      },
      {
        "title": "1.2.0 · 2026-11-13",
        "items": [
          "El plan de lectura muestra los libros en curso y la biblioteca muestra Convertir para los libros sin conversiones previas.",
          "Se corrigió un cierre inesperado al abrir un libro del plan de lectura.",
          "Arrastra y suelta libros, gestiona las licencias y los dispositivos vinculados desde tu cuenta y elige en Ajustes si quieres compartir datos de uso."
        ]
      }
    ],
    "upgradeTitle": "Cómo actualizar",
    "upgradeSteps": [
      "Cierra la versión anterior y haz una copia de tu biblioteca y de los archivos que quieras conservar.",
      "Descarga el instalador de Windows, ejecuta el archivo EXE y sigue las instrucciones.",
      "Abre la nueva versión y prueba la voz o la conversión de un capítulo corto."
    ],
    "questionsTitle": "Si tienes problemas",
    "questions": [
      {
        "question": "¿Siempre necesito Internet para generar voz?",
        "answer": "Las voces en línea necesitan Internet. Instala un modelo local en los ajustes de voz para generar sin conexión. Los modelos y el reconocimiento de PDF se descargan al usarlos por primera vez."
      },
      {
        "question": "¿Por qué se pide verificar si mi PRO sigue vigente?",
        "answer": "La nueva versión renueva automáticamente la licencia del equipo al conectarse. Si la sesión ha caducado, vuelve a iniciar sesión. El periodo PRO y el estado del equipo se muestran por separado."
      },
      {
        "question": "¿Qué hago si faltan archivos necesarios para iniciar la aplicación?",
        "answer": "Vuelve a descargar el instalador completo y sigue las instrucciones de instalación."
      },
      {
        "question": "¿Y si la conversión sigue fallando?",
        "answer": "Para las voces en línea, comprueba tu conexión. Con modelos locales, revisa las indicaciones de memoria y espacio, cierra aplicaciones que no uses y prueba una muestra corta. Anota el error si el fallo persiste."
      }
    ]
  },
  "zh": {
    "nav": "更新日志",
    "badge": "Windows 更新",
    "noticeTitle": "2.0 正式版现已可下载",
    "noticeBody": "2026 年 11 月 21 日更新。本地语音、扫描 PDF 文字识别，以及授权和界面修复。",
    "download": "下载最新版 Windows 版",
    "details": "查看更新日志与升级方法",
    "back": "返回首页",
    "title": "更新日志",
    "intro": "查看 Book2Audio GO 的近期更新、已处理的问题，以及旧版用户的升级方法。",
    "releaseTitle": "Book2Audio GO 2.0",
    "platform": "Windows 10 / 11 · 64 位安装程序 · 约 68 MB",
    "groups": [
      {
        "title": "本次修复",
        "items": [
          "修复部分 PRO 用户授权仍有效、设备已绑定，却反复要求启用设备的问题。联网时自动更新本机授权，并兼容现有授权服务。",
          "修复软件启动时书库图标不显示，完善悬停和选中时的图标颜色。",
          "PDF 文字识别窗口采用软件的米色背景，删除多余的试识别提示。"
        ]
      },
      {
        "title": "2.0 新增与改进",
        "items": [
          "扫描 PDF 可在软件中识别文字，首次使用按需下载识别组件，可选择页码、查看进度并复用已识别内容。改进 PDF 章节标题和层级检测。",
          "支持 Kokoro 和 Qwen3-TTS 本地语音。点击「下载并启用」即可安装完整模型和所需组件，支持下载进度、暂停续传及安装前的电脑配置检查。",
          "Kokoro 提供普通话、英语、日语、西班牙语男女声及法语女声。安装完成后可离线试听和转换。",
          "阅读计划新增可拖动浏览的立体书架，书库菜单可以打开原文件所在文件夹。整本转换可从书库创建任务（PRO）。",
          "批量转换因重试次数用尽而暂停时，「继续」按钮更加醒目。修复部分 EPUB 下级章节正文预览为空的问题。",
          "安装程序可检测已有安装，提供修复或卸载旧版本的选项。"
        ]
      },
      {
        "title": "1.2.0 · 2026-11-13",
        "items": [
          "年度阅读计划新增「进行中」统计，书库中尚未转换的书显示「转换」。",
          "修复双击阅读计划中带有来源的书籍条目时程序崩溃的问题。",
          "拖拽导入电子书，使用新版账号中心管理授权和绑定设备。可在设置中选择是否分享使用数据。"
        ]
      }
    ],
    "upgradeTitle": "旧版用户如何升级",
    "upgradeSteps": [
      "关闭旧版程序，备份书库和需要保留的文件。",
      "下载 Windows 安装包并运行 EXE，按提示安装。",
      "打开新版，先试听或转换一个短章节。"
    ],
    "questionsTitle": "遇到问题时",
    "questions": [
      {
        "question": "语音转换一定要联网吗？",
        "answer": "在线语音需要联网。在语音设置中安装本地模型后，可以离线生成语音。语音模型和扫描 PDF 识别组件会在首次使用时按需下载。"
      },
      {
        "question": "PRO 还没到期，为什么需要验证？",
        "answer": "新版会在联网时自动更新本机授权。如果登录已失效，按提示重新登录。账号有效期和设备状态会分别显示。"
      },
      {
        "question": "如果提示缺少运行文件怎么办？",
        "answer": "重新下载完整安装包并运行安装程序，按提示完成安装。"
      },
      {
        "question": "更新后仍然无法转换，怎么办？",
        "answer": "使用在线语音时先检查网络。使用本地模型时查看软件的内存和空间提示，关闭暂时不用的软件，再试听短文本；若仍失败，请记录具体错误信息。"
      }
    ]
  },
  "en": {
    "nav": "Updates",
    "badge": "Windows update",
    "noticeTitle": "Version 2.0 is available",
    "noticeBody": "Updated November 21, 2026. Local voices, scanned PDF recognition, and license and interface fixes.",
    "download": "Download the latest Windows build",
    "details": "Release notes and upgrade steps",
    "back": "Back to home",
    "title": "Release notes",
    "intro": "Recent Book2Audio GO updates, resolved issues and upgrade instructions for existing users.",
    "releaseTitle": "Book2Audio GO 2.0",
    "platform": "Windows 10 / 11 · 64-bit installer · about 68 MB",
    "groups": [
      {
        "title": "Latest fixes",
        "items": [
          "Fixed repeated device-activation prompts for some PRO users whose membership and device binding were still valid. Device licenses renew automatically online and work with the existing license service.",
          "Fixed the missing library icon at startup and improved its hover and selection colors.",
          "The PDF text-recognition window now uses the app’s cream background, with the extra trial-page hint removed."
        ]
      },
      {
        "title": "New and improved in 2.0",
        "items": [
          "Recognize scanned PDFs in the app. Recognition components download on first use. Select pages, see progress and reuse recognized text. PDF chapter titles and hierarchy detection have also improved.",
          "Use Kokoro and Qwen3-TTS local voices. Download and enable installs complete models and required components, with download progress, pause and resume, and a computer-configuration check before installation.",
          "Kokoro offers male and female voices for Mandarin, English, Japanese and Spanish, plus a French female voice. Preview and convert offline after installation.",
          "Browse a draggable 3D bookshelf in the reading plan. The library menu can open the source file’s folder and create whole-book conversion tasks (PRO).",
          "A brighter Continue button makes batch jobs paused after repeated failures easier to notice. Fixed blank body previews for some nested EPUB chapters.",
          "The installer detects an existing installation and offers repair or uninstall options."
        ]
      },
      {
        "title": "1.2.0 · 2026-11-13",
        "items": [
          "The annual reading plan now counts books in progress, and the library shows Convert for books with no exported chapters.",
          "Fixed a crash when opening a book with a source in the reading plan.",
          "Drag and drop books, manage licenses and linked devices in the account center, and choose whether to share usage data in Settings."
        ]
      }
    ],
    "upgradeTitle": "How to upgrade",
    "upgradeSteps": [
      "Close the previous version and back up your library and any files you want to keep.",
      "Download the Windows installer and run the EXE, then follow the prompts.",
      "Open the updated app and try a voice preview or a short chapter."
    ],
    "questionsTitle": "If you encounter a problem",
    "questions": [
      {
        "question": "Do I need an internet connection to generate speech?",
        "answer": "Online voices need an internet connection. Install a local model in Voice settings to generate speech offline. Voice models and scanned PDF recognition components download on first use."
      },
      {
        "question": "Why is verification needed while my PRO is still active?",
        "answer": "The updated app renews device licenses automatically while online. If your sign-in has expired, sign in again as prompted. Membership expiry and device status are shown separately."
      },
      {
        "question": "What if runtime files are missing?",
        "answer": "Download the complete installer again and follow the installation prompts."
      },
      {
        "question": "What if conversion still fails after updating?",
        "answer": "For online voices, check your connection. For local models, check the app’s memory and disk-space guidance, close unused apps and try a short preview. Keep the exact error message if it still fails."
      }
    ]
  },
  "ja": {
    "nav": "更新情報",
    "badge": "Windows 版の更新",
    "noticeTitle": "バージョン 2.0 を公開しました",
    "noticeBody": "2026年11月21日更新。ローカル音声、スキャン PDF の文字認識、認証と画面表示の修正。",
    "download": "最新版 Windows 版をダウンロード",
    "details": "更新内容とアップデート方法",
    "back": "ホームへ戻る",
    "title": "更新情報",
    "intro": "Book2Audio GO の最近の更新、対応した問題と、旧版からのアップデート方法をご案内します。",
    "releaseTitle": "Book2Audio GO 2.0",
    "platform": "Windows 10 / 11 · 64 ビットインストーラー · 約 68 MB",
    "groups": [
      {
        "title": "今回の修正",
        "items": [
          "PRO と端末登録が有効なのに、端末の有効化を繰り返し求められる問題を修正しました。接続時に端末ライセンスを自動更新し、既存の認証サービスに対応します。",
          "起動時に書庫アイコンが消える問題と、ホバー・選択時の色を修正しました。",
          "PDF 文字認識ウィンドウをアプリと同じクリーム色にし、試しに数ページを選ぶ案内を削除しました。"
        ]
      },
      {
        "title": "2.0 の新機能と改善",
        "items": [
          "アプリ内でスキャン PDF の文字を認識できます。必要な機能は初回にダウンロードします。ページ選択、進捗表示、認識済みテキストの再利用に対応し、章タイトルと階層の検出も改善しました。",
          "Kokoro と Qwen3-TTS のローカル音声に対応。「ダウンロードして有効化」でモデルと必要な機能をまとめて準備できます。進捗表示、一時停止と再開、インストール前のパソコン構成確認に対応します。",
          "Kokoro は中国語、英語、日本語、スペイン語の男女声とフランス語の女声を提供します。インストール後はオフラインで試聴・変換できます。",
          "読書計画にドラッグして閲覧できる立体本棚を追加。書庫メニューから元ファイルのフォルダーを開き、本全体の変換タスクを作成できます（PRO）。",
          "再試行後に停止した一括変換の「続行」ボタンを目立たせました。一部 EPUB の下位章の本文プレビューが空になる問題を修正しました。",
          "既存のインストールを検出し、修復またはアンインストールを選べます。"
        ]
      },
      {
        "title": "1.2.0 · 2026-11-13",
        "items": [
          "年間読書計画に読書中の冊数を追加し、未変換の本には「変換」を表示します。",
          "読書計画で入手元のある本を開くとアプリが終了する問題を修正しました。",
          "書籍のドラッグ＆ドロップ、アカウント画面でのライセンスとデバイス管理、設定からの利用データ共有の選択に対応しました。"
        ]
      }
    ],
    "upgradeTitle": "アップデート方法",
    "upgradeSteps": [
      "旧版を終了し、書庫や必要なファイルをバックアップします。",
      "Windows インストーラーをダウンロードし、EXE を実行して画面の案内に従います。",
      "新版を起動し、試聴または短い章の変換をお試しください。"
    ],
    "questionsTitle": "問題が起きたとき",
    "questions": [
      {
        "question": "音声生成には常にインターネット接続が必要ですか？",
        "answer": "オンライン音声には接続が必要です。音声設定でローカルモデルをインストールすると、オフラインで生成できます。音声モデルとスキャン PDF 認識機能は初回にダウンロードします。"
      },
      {
        "question": "PRO が有効なのに確認が必要なのはなぜですか？",
        "answer": "新版は接続時に端末ライセンスを自動更新します。ログインの期限が切れている場合は、案内に従って再ログインしてください。PRO の期限と端末の状態をそれぞれ表示します。"
      },
      {
        "question": "実行に必要なファイルが見つからない場合は？",
        "answer": "完全版インストーラーを再ダウンロードし、画面の案内に従ってインストールしてください。"
      },
      {
        "question": "更新後も変換できない場合は？",
        "answer": "オンライン音声では接続を確認してください。ローカルモデルではメモリと空き容量の案内を確認し、使っていないアプリを閉じて短い文章で試聴してください。解決しない場合はエラーの内容を記録してください。"
      }
    ]
  },
  "ko": {
    "nav": "업데이트",
    "badge": "Windows 업데이트",
    "noticeTitle": "버전 2.0을 다운로드할 수 있습니다",
    "noticeBody": "2026년 11월 21일 업데이트. 로컬 음성, 스캔 PDF 문자 인식, 라이선스 및 화면 수정.",
    "download": "최신 Windows 버전 다운로드",
    "details": "업데이트 내용 및 설치 방법",
    "back": "홈으로 돌아가기",
    "title": "업데이트 내역",
    "intro": "Book2Audio GO의 최근 업데이트, 해결한 문제 및 기존 사용자의 업데이트 방법을 안내합니다.",
    "releaseTitle": "Book2Audio GO 2.0",
    "platform": "Windows 10 / 11 · 64비트 설치 프로그램 · 약 68 MB",
    "groups": [
      {
        "title": "이번 수정 사항",
        "items": [
          "PRO 이용 기간과 기기 연결이 유효한데도 기기 활성화를 반복해서 요구하는 문제를 수정했습니다. 온라인 상태에서 기기 라이선스를 자동 갱신하며 기존 인증 서비스와 호환됩니다.",
          "시작할 때 서재 아이콘이 사라지는 문제와 마우스 올림·선택 시 색상을 수정했습니다.",
          "PDF 문자 인식 창에 앱과 같은 크림색 배경을 적용하고 시험 인식 페이지 안내를 삭제했습니다."
        ]
      },
      {
        "title": "2.0의 새로운 기능과 개선",
        "items": [
          "앱에서 스캔 PDF의 문자를 인식할 수 있습니다. 필요한 구성 요소는 처음 사용할 때 다운로드합니다. 페이지 선택, 진행률 표시, 인식한 내용 재사용을 지원하며 챕터 제목과 계층 감지도 개선했습니다.",
          "Kokoro와 Qwen3-TTS 로컬 음성을 지원합니다. 다운로드 및 활성화를 누르면 전체 모델과 필요한 구성 요소를 설치합니다. 진행률, 일시 정지와 재개, 설치 전 컴퓨터 사양 확인을 지원합니다.",
          "Kokoro는 중국어, 영어, 일본어, 스페인어 남녀 음성과 프랑스어 여성 음성을 제공합니다. 설치 후에는 오프라인으로 미리 듣고 변환할 수 있습니다.",
          "독서 계획에 드래그로 탐색하는 입체 책장을 추가했습니다. 서재 메뉴에서 원본 폴더를 열고 책 전체 변환 작업을 만들 수 있습니다(PRO).",
          "반복 실패로 일시 정지된 일괄 작업의 계속 버튼을 더 눈에 띄게 했습니다. 일부 EPUB 하위 챕터의 본문 미리 보기가 비어 있던 문제를 수정했습니다.",
          "기존 설치를 감지해 복구 또는 제거를 선택할 수 있습니다."
        ]
      },
      {
        "title": "1.2.0 · 2026-11-13",
        "items": [
          "연간 독서 계획에 진행 중인 책 수를 추가하고, 변환 이력이 없는 책에는 변환을 표시합니다.",
          "읽기 계획에서 출처가 있는 책을 열 때 앱이 종료되는 문제를 수정했습니다.",
          "책을 끌어다 놓아 추가하고 계정 센터에서 라이선스와 연결된 기기를 관리할 수 있습니다. 사용 데이터 공유는 설정에서 선택할 수 있습니다."
        ]
      }
    ],
    "upgradeTitle": "업데이트 방법",
    "upgradeSteps": [
      "이전 버전을 닫고 서재와 보관할 파일을 백업하세요.",
      "Windows 설치 프로그램을 다운로드하고 EXE를 실행한 뒤 안내를 따르세요.",
      "새 버전을 열고 음성 미리 듣기나 짧은 챕터를 변환해 보세요."
    ],
    "questionsTitle": "문제가 발생하면",
    "questions": [
      {
        "question": "음성을 생성하려면 항상 인터넷이 필요한가요?",
        "answer": "온라인 음성에는 인터넷이 필요합니다. 음성 설정에서 로컬 모델을 설치하면 오프라인으로 생성할 수 있습니다. 음성 모델과 스캔 PDF 인식 구성 요소는 처음 사용할 때 다운로드합니다."
      },
      {
        "question": "PRO가 유효한데 왜 확인이 필요한가요?",
        "answer": "새 버전은 온라인 상태에서 기기 라이선스를 자동 갱신합니다. 로그인이 만료되면 안내에 따라 다시 로그인하세요. PRO 이용 기간과 기기 상태를 각각 표시합니다."
      },
      {
        "question": "실행에 필요한 파일이 없으면 어떻게 하나요?",
        "answer": "전체 설치 프로그램을 다시 다운로드하고 안내에 따라 설치하세요."
      },
      {
        "question": "업데이트 후에도 변환이 실패하면?",
        "answer": "온라인 음성은 인터넷 연결을 확인하세요. 로컬 모델은 앱의 메모리·여유 공간 안내를 확인하고 사용하지 않는 앱을 닫은 뒤 짧게 미리 들어보세요. 계속 실패하면 오류 내용을 기록하세요."
      }
    ]
  }
};
