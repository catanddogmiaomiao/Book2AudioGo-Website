import Checkout from "./checkout";
import { requestLanguage } from "../_data/request-language";
import { paymentText } from "../_data/payment-copy";

export async function generateMetadata() {
  return {
    title: paymentText(await requestLanguage(), "One-device PRO license") + " | Book2Audio GO",
    robots: { index: false, follow: false },
  };
}

export default function Page() { return <Checkout />; }
