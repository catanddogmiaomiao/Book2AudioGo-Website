import Purchase from "../../purchase";
import { metadata as sandboxMetadata } from "../../page";

export const metadata = sandboxMetadata;

export default async function Page({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;
  return <Purchase linkedTransaction={transactionId ?? ""} />;
}
