import ConversionGuide, { guideMetadata } from "../_components/ConversionGuide";
export const metadata = guideMetadata("pdf");
export default function Page() { return <ConversionGuide kind="pdf" />; }
