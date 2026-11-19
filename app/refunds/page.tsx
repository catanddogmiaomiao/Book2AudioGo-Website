import StorePage, { storeMetadata } from "../_components/StorePage";

export function generateMetadata() {
  return storeMetadata("/refunds", "en");
}

export default function Page() {
  return <StorePage path="/refunds" lang="en" />;
}
