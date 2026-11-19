import { localizedHref, type Lang, type StorePath } from "../_data/languages";

const links = [
  ["/pricing", { en: "Pricing", zh: "定价", ja: "料金", ko: "가격", fr: "Tarifs", es: "Precios" }],
  ["/terms", { en: "Terms of Service", zh: "服务条款", ja: "利用規約", ko: "이용약관", fr: "Conditions d’utilisation", es: "Términos del servicio" }],
  ["/privacy", { en: "Privacy Policy", zh: "隐私政策", ja: "プライバシーポリシー", ko: "개인정보 처리방침", fr: "Politique de confidentialité", es: "Política de privacidad" }],
  ["/refunds", { en: "Refund Policy", zh: "退款政策", ja: "返金ポリシー", ko: "환불 정책", fr: "Politique de remboursement", es: "Política de reembolso" }],
] as const;

export default function StoreLinks({ lang, current }: { lang: Lang; current?: StorePath }) {
  return <nav className="storeLinks" aria-label={lang === "zh" ? "定价与政策" : "Pricing and policies"}>
    {links.map(([path, labels]) =>
      <a key={path} href={localizedHref(path, lang)} aria-current={path === current ? "page" : undefined}>
        {labels[lang]}
      </a>
    )}
  </nav>;
}
