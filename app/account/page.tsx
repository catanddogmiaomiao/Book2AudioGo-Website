import Account from "./account";
import { requestLanguage } from "../_data/request-language";
import { accountText } from "../_data/account-copy";

export async function generateMetadata() {
  const lang = await requestLanguage();
  return {
    title: (lang === "en" ? "Account" : accountText(lang, "Your account")) + " | Book2Audio GO",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <Account initialMode={mode === "reset" || mode === "recover" ? mode : "login"} />;
}
