import Home from "./_components/Home";
import { homeMetadata } from "./_data/marketing-copy";

export const metadata = homeMetadata("en");
export default function Page() { return <Home lang="en" />; }
