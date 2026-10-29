export type ReleaseLang = "en" | "zh" | "ja" | "ko";
export const RELEASE_DATE = "2026-10-29";
export const DOWNLOAD_URL = "https://pub-f257fbbebf604ed69c35001d3c3ea070.r2.dev/Book2AudioGO-v1.0.0.zip";

type ReleaseCopy = {
  nav: string; badge: string; noticeTitle: string; noticeBody: string;
  download: string; details: string; back: string; title: string; intro: string;
  releaseTitle: string; platform: string; upgradeTitle: string; upgradeSteps: string[];
  groups: { title: string; items: string[] }[];
  questionsTitle: string; questions: { question: string; answer: string }[];
};

// Date-based release labels reflect the distributed build without inventing an
// application version number. Keep notices and the permanent log in one place.
export const releaseCopy: Record<ReleaseLang, ReleaseCopy> = {
  zh: {
    nav: "更新日志", badge: "Windows 更新", noticeTitle: "旧版无法启动或语音转换失败？请重新下载最新版。",
    noticeBody: "2026.10.29 更新：新增阅读计划，更新语音组件并完善运行依赖。已下载旧版的用户可从这里获取完整新版。",
    download: "下载最新版 Windows 版", details: "查看更新日志与升级方法", back: "返回首页",
    title: "更新日志", intro: "查看 Book2Audio GO 的近期更新、已处理的问题，以及旧版用户的升级方法。",
    releaseTitle: "阅读计划与稳定性更新", platform: "Windows 10 / 11 · 完整 ZIP 约 67 MB",
    groups: [
      { title: "新增 · 阅读计划", items: ["年度书单与愿望清单：安排想读的书，管理状态、进度和完成日期，支持跨年顺延。", "阅读计时与提醒：设置阅读安排，记录实际时长，支持暂停、补记和累计统计。提醒仅在软件运行时生效。", "阅读笔记：按书籍保存、编辑和回顾笔记，支持阅读数据备份与导出。"] },
      { title: "修复 · 启动与语音兼容性", items: ["更新语音组件，适配近期语音服务接口变化。旧版试听或转换异常时，建议先更新程序再重试。", "提供包含完整运行依赖的安装包，处理因缺少 python312.dll 等文件导致的启动问题。"] },
      { title: "优化 · 更轻的安装包", items: ["精简无关依赖，完整 ZIP 约 67 MB，保留现有书籍解析与音频导出功能。"] },
    ],
    upgradeTitle: "旧版用户如何升级", upgradeSteps: ["关闭旧版程序，先备份自己的书库、笔记和需要保留的文件。", "点击“下载最新版 Windows 版”，将整个 ZIP 完整解压到一个新文件夹。", "从新文件夹运行 EXE，保留它旁边的 _internal 文件夹。先试听或转换一个短章节，再继续整本书。"],
    questionsTitle: "遇到问题时", questions: [
      { question: "提示找不到 python312.dll，怎么办？", answer: "重新下载完整 ZIP 并全部解压。确认 EXE 与 _internal 文件夹位于同一目录，不要只单独复制 EXE，也不要直接在压缩包内运行。" },
      { question: "更新后仍然无法转换，怎么办？", answer: "语音合成需要联网。先确认网络可用，再测试语音试听或一个短章节；若仍失败，请记录具体错误信息继续排查。更新不能排除所有网络或服务端问题。" },
      { question: "关闭软件后，还能收到阅读提醒吗？", answer: "本版提醒仅在软件运行时生效。关闭软件后不会继续提醒；阅读时长也需要通过计时或补记来记录。" },
    ],
  },
  en: {
    nav: "Updates", badge: "Windows update", noticeTitle: "Older app will not open or convert audio? Download the latest build.",
    noticeBody: "October 29, 2026: reading plans, an updated speech component and complete runtime files. Existing users can download the full updated Windows package here.",
    download: "Download the latest Windows build", details: "Release notes and upgrade steps", back: "Back to home",
    title: "Release notes", intro: "Recent Book2Audio GO updates, resolved issues and upgrade instructions for existing users.",
    releaseTitle: "Reading plans and reliability update", platform: "Windows 10 / 11 · Full ZIP about 67 MB",
    groups: [
      { title: "New · Reading plans", items: ["Plan your yearly reading list and wishlist, track status, progress and deadlines, and carry unfinished books into the next year.", "Set a reading schedule and reminders, time actual reading, pause or add sessions manually, and review accumulated time. Reminders require the app to remain running.", "Keep, edit and revisit notes for each book, with reading-data backup and export."] },
      { title: "Fixed · Startup and speech compatibility", items: ["Updated the speech component for recent speech-service changes. If voice previews or conversions fail in an older build, update the app before retrying.", "The complete package includes the runtime files needed to address startup failures caused by missing files such as python312.dll."] },
      { title: "Improved · Smaller download", items: ["Removed unrelated dependencies. The full ZIP is about 67 MB and retains book parsing and audio export."] },
    ],
    upgradeTitle: "How to upgrade", upgradeSteps: ["Close the old app and back up your library, notes and any files you want to keep.", "Download the latest Windows build and fully extract the entire ZIP into a new folder.", "Run the EXE from the new folder and keep its _internal folder alongside it. Test a voice preview or a short chapter before converting a full book."],
    questionsTitle: "If you encounter a problem", questions: [
      { question: "What if python312.dll cannot be found?", answer: "Download the full ZIP again and extract everything. Keep the EXE and _internal folder together. Do not copy only the EXE or run it from inside the ZIP." },
      { question: "What if conversion still fails after updating?", answer: "Speech synthesis needs an internet connection. Check connectivity, then test a voice preview or a short chapter. Keep the exact error message if it still fails. Updating cannot resolve every network or service-side issue." },
      { question: "Do reminders work after closing the app?", answer: "In this build, reminders only work while the app is running. Reading time is recorded through the timer or manual entries." },
    ],
  },
  ja: {
    nav: "更新情報", badge: "Windows 版の更新", noticeTitle: "旧版が起動しない・音声変換できない場合は、最新版を再ダウンロードしてください。",
    noticeBody: "2026年10月29日更新：読書計画を追加し、音声コンポーネントと実行に必要なファイルを更新しました。旧版をご利用の方は完全版 ZIP を入手してください。",
    download: "最新版 Windows 版をダウンロード", details: "更新内容とアップデート方法", back: "ホームへ戻る",
    title: "更新情報", intro: "Book2Audio GO の最近の更新、対応した問題と、旧版からのアップデート方法をご案内します。",
    releaseTitle: "読書計画と安定性の更新", platform: "Windows 10 / 11 · 完全版 ZIP 約67 MB",
    groups: [
      { title: "追加 · 読書計画", items: ["年間の読書リストと読みたい本を管理し、状態・進捗・期限を記録。未読の本は翌年に繰り越せます。", "読書の予定とリマインダー、実際の読書時間の計測、一時停止、手動記録と累計に対応。通知にはアプリの起動が必要です。", "本ごとに読書メモを保存・編集・振り返り。読書データのバックアップと書き出しに対応しました。"] },
      { title: "修正 · 起動と音声サービスへの対応", items: ["最近の音声サービスの変更に合わせて音声コンポーネントを更新。旧版で試聴や変換に失敗する場合は、まず更新してからお試しください。", "python312.dll などのファイル不足による起動エラーに対応するため、実行に必要なファイルを完全版パッケージに同梱しました。"] },
      { title: "改善 · ダウンロードの軽量化", items: ["不要な依存ファイルを削減。書籍の解析と音声出力を維持し、完全版 ZIP は約67 MBになりました。"] },
    ],
    upgradeTitle: "アップデート方法", upgradeSteps: ["旧版を終了し、書庫・メモ・必要なファイルをバックアップします。", "最新版 Windows 版をダウンロードし、ZIP 全体を新しいフォルダーに展開します。", "EXE と _internal フォルダーを同じ場所に置き、EXE を起動します。一冊を変換する前に試聴や短い章で確認してください。"],
    questionsTitle: "問題が起きたとき", questions: [
      { question: "python312.dll が見つからない場合は？", answer: "完全版 ZIP を再ダウンロードし、すべて展開してください。EXE と _internal フォルダーを同じ場所に置きます。EXE だけをコピーしたり、ZIP 内から直接起動したりしないでください。" },
      { question: "更新後も変換できない場合は？", answer: "音声合成にはインターネット接続が必要です。接続を確認し、試聴や短い章で再テストしてください。解決しない場合は具体的なエラーを記録してください。ネットワークやサービス側の問題がすべて解消するとは限りません。" },
      { question: "アプリ終了後も読書の通知は届きますか？", answer: "本版の通知はアプリ起動中のみ動作します。読書時間はタイマーまたは手動で記録します。" },
    ],
  },
  ko: {
    nav: "업데이트", badge: "Windows 업데이트", noticeTitle: "이전 버전이 실행되지 않거나 음성 변환에 실패하나요? 최신 버전을 다시 다운로드하세요.",
    noticeBody: "2026년 10월 29일: 독서 계획 추가, 음성 구성 요소 업데이트 및 실행 파일 보완. 기존 사용자는 최신 Windows 전체 ZIP을 다운로드할 수 있습니다.",
    download: "최신 Windows 버전 다운로드", details: "업데이트 내용 및 설치 방법", back: "홈으로 돌아가기",
    title: "업데이트 내역", intro: "Book2Audio GO의 최근 업데이트, 해결한 문제 및 기존 사용자의 업데이트 방법을 안내합니다.",
    releaseTitle: "독서 계획 및 안정성 업데이트", platform: "Windows 10 / 11 · 전체 ZIP 약 67 MB",
    groups: [
      { title: "추가 · 독서 계획", items: ["연간 독서 목록과 읽고 싶은 책을 관리하고 상태, 진행률, 기한을 기록합니다. 미완독 도서를 다음 해로 이월할 수 있습니다.", "독서 일정과 알림, 실제 독서 시간 측정, 일시 정지, 수동 기록 및 누적 통계를 제공합니다. 알림을 받으려면 앱이 실행 중이어야 합니다.", "책별 독서 메모 저장, 편집, 다시 보기와 독서 데이터 백업 및 내보내기를 지원합니다."] },
      { title: "수정 · 실행 및 음성 서비스 호환성", items: ["최근 음성 서비스 변경에 맞춰 음성 구성 요소를 업데이트했습니다. 이전 버전의 미리 듣기나 변환이 실패하면 먼저 앱을 업데이트하세요.", "python312.dll 등 필수 파일 누락으로 인한 실행 오류에 대응하도록 실행에 필요한 파일을 전체 패키지에 포함했습니다."] },
      { title: "개선 · 더 작은 다운로드", items: ["불필요한 의존성을 줄였습니다. 책 분석 및 음성 내보내기를 유지하면서 전체 ZIP은 약 67 MB로 작아졌습니다."] },
    ],
    upgradeTitle: "업데이트 방법", upgradeSteps: ["기존 앱을 종료하고 서재, 메모 및 보관할 파일을 백업하세요.", "최신 Windows 버전을 다운로드하고 전체 ZIP을 새 폴더에 완전히 압축 해제하세요.", "EXE와 _internal 폴더를 같은 위치에 두고 EXE를 실행하세요. 책 전체를 변환하기 전에 미리 듣기나 짧은 챕터로 테스트하세요."],
    questionsTitle: "문제가 발생하면", questions: [
      { question: "python312.dll을 찾을 수 없다는 오류가 나오면?", answer: "전체 ZIP을 다시 다운로드하고 모든 파일을 압축 해제하세요. EXE와 _internal 폴더를 함께 보관하세요. EXE만 복사하거나 ZIP 안에서 바로 실행하지 마세요." },
      { question: "업데이트 후에도 변환이 실패하면?", answer: "음성 합성에는 인터넷 연결이 필요합니다. 연결을 확인하고 미리 듣기나 짧은 챕터로 테스트하세요. 계속 실패하면 구체적인 오류 메시지를 기록하세요. 모든 네트워크 또는 서비스 측 문제가 업데이트로 해결되는 것은 아닙니다." },
      { question: "앱을 종료해도 독서 알림을 받을 수 있나요?", answer: "이 버전의 알림은 앱 실행 중에만 작동합니다. 독서 시간은 타이머나 수동 입력으로 기록합니다." },
    ],
  },
};
