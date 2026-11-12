import { notFound } from "next/navigation";
import MarketingPage, { routeMetadata } from "../../_components/MarketingPage";
import { isLang, isMarketingPath, languages, marketingPaths } from "../../_data/languages";

type Props = { params: Promise<{ locale: string; marketing?: string[] }> };

async function getRoute(params: Props["params"]) {
  const { locale, marketing } = await params;
  const path = "/" + (marketing ?? []).join("/");
  if (!isLang(locale) || locale === "en" || !isMarketingPath(path)) notFound();
  return { locale, path };
}

export function generateStaticParams() {
  return languages.filter(lang => lang !== "en").flatMap(locale =>
    marketingPaths.map(path => ({ locale, marketing: path === "/" ? [] : [path.slice(1)] })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, path } = await getRoute(params);
  return routeMetadata(locale, path);
}

export default async function Page({ params }: Props) {
  const { locale, path } = await getRoute(params);
  return <MarketingPage lang={locale} path={path} />;
}
