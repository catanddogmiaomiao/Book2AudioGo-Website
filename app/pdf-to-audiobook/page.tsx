import ConversionGuide from "../_components/ConversionGuide";
import { guideMetadata } from "../_data/conversion-guides";
export const metadata = guideMetadata("pdf", "en");
export default function Page() { return <ConversionGuide kind="pdf" lang="en" />; }
