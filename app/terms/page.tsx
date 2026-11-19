import StorePage, { storeMetadata } from "../_components/StorePage";

export function generateMetadata() {
  return storeMetadata("/terms", "en");
}

export default function Page() {
  return <StorePage path="/terms" lang="en" />;
}
