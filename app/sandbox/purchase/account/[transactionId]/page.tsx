import Purchase from "../../purchase";
export { generateMetadata } from "../../page";

export default async function Page({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;
  return <Purchase linkedTransaction={transactionId ?? ""} />;
}
