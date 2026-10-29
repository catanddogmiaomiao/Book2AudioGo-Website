import { DOWNLOAD_URL, RELEASE_DATE, releaseCopy, type ReleaseLang } from "../_data/releases";

export default function UpdateNotice({ lang }: { lang: ReleaseLang }) {
  const t = releaseCopy[lang];
  return <aside className="updateNotice wrap" aria-labelledby="update-notice-title">
    <div className="updateNoticeCopy">
      <p className="updateMeta"><span>{t.badge}</span><time dateTime={RELEASE_DATE}>2026.10.29</time></p>
      <h2 id="update-notice-title">{t.noticeTitle}</h2>
      <p>{t.noticeBody}</p>
    </div>
    <div className="updateNoticeActions">
      <a className="updateDownload" href={DOWNLOAD_URL}>{t.download}<span aria-hidden="true"> ↗</span></a>
      <a className="updateReadMore" href={`/updates?lang=${lang}`}>{t.details}<span aria-hidden="true"> →</span></a>
    </div>
  </aside>;
}
