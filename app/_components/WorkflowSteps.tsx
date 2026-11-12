import type { Lang } from "../_data/languages";

const screenshots = [
  [["library", 0]],
  [["chapters", 1], ["tasks", 2]],
  [["reading-plan", 3]],
] as const;

const screenshotHeights = { library: 993, chapters: 993, tasks: 989, "reading-plan": 990 };

const captions = {
  "en": [
    "Library and Add Books button",
    "Chapter selection and voice settings",
    "Whole-book conversion progress in Tasks",
    "The in-app reading plan"
  ],
  "zh": [
    "书库和「添加书籍」按钮",
    "章节选择与语音设置",
    "「任务」中显示的整书转换进度",
    "软件内的年度阅读计划"
  ],
  "ja": [
    "本棚と書籍追加ボタン",
    "章の選択と音声設定",
    "タスク画面の変換進捗",
    "アプリ内の年間読書計画"
  ],
  "ko": [
    "서재와 책 추가 버튼",
    "챕터 선택과 음성 설정",
    "작업 화면의 변환 진행 상황",
    "앱의 연간 독서 계획"
  ],
  "fr": [
    "Bibliothèque et bouton d’ajout de livres",
    "Sélection des chapitres et réglages de la voix",
    "Progression de la conversion dans les tâches",
    "Plan de lecture annuel dans l’application"
  ],
  "es": [
    "Biblioteca y botón para añadir libros",
    "Selección de capítulos y ajustes de voz",
    "Progreso de conversión en la lista de tareas",
    "Plan anual de lectura de la aplicación"
  ]
} satisfies Record<Lang, readonly string[]>;

export default function WorkflowSteps({ lang, steps, summary = false }: {
  lang: Lang;
  steps: readonly (readonly string[])[];
  summary?: boolean;
}) {
  const Heading = summary ? "h3" : "h2";
  return <ol className={summary ? "workflowCards workflowCardsSummary" : "workflowCards"}>
    {steps.map(([number, label, text], index) => <li key={number}>
      <div className="workflowStepText">
        <span className="workflowStepNumber" aria-hidden="true">{number}</span>
        <Heading>{label}</Heading>
        <p>{text}</p>
      </div>
      <div className="workflowScreens">
        {screenshots[index].map(([name, captionIndex]) => {
          const src = `/workflow/${name}.webp`;
          const caption = captions[lang][captionIndex];
          return <figure key={name}>
            <a href={src} aria-label={caption}>
              <img src={src} alt="" width="1560" height={screenshotHeights[name]} loading="lazy" decoding="async" />
            </a>
            <figcaption>{caption}</figcaption>
          </figure>;
        })}
      </div>
    </li>)}
  </ol>;
}
