import { headers } from "next/headers";
import { isLang } from "./languages";

export async function requestLanguage() {
  const value = (await headers()).get("x-b2a-locale");
  return isLang(value) ? value : "en";
}
