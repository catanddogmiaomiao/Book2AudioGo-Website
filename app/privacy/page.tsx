import StorePage, { storeMetadata } from "../_components/StorePage";

export function generateMetadata() {
  return storeMetadata("/privacy", "en");
}

export default function Page() {
  return <StorePage path="/privacy" lang="en" />;
}
