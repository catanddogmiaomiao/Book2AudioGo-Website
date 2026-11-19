import StorePage, { storeMetadata } from "../_components/StorePage";

export function generateMetadata() {
  return storeMetadata("/pricing", "en");
}

export default function Page() {
  return <StorePage path="/pricing" lang="en" />;
}
