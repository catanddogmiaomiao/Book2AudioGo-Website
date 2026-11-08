import Purchase from "./purchase";
import { requestLanguage } from "../../_data/request-language";
import { paymentText } from "../../_data/payment-copy";

export async function generateMetadata() {
  const lang = await requestLanguage();
  return {
    title: paymentText(lang, "Test purchase of Pro") + " | Book2Audio GO",
    description: paymentText(lang, "Test environment. No real charges."),
    robots: { index: false, follow: false },
  };
}
export default function Page() { return <Purchase />; }
