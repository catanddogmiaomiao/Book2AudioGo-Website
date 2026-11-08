import ConversionGuide from "../_components/ConversionGuide";
import { guideMetadata } from "../_data/conversion-guides";
import { requestLanguage } from "../_data/request-language";

export async function generateMetadata() { return guideMetadata("epub", await requestLanguage()); }
export default function Page() { return <ConversionGuide kind="epub" />; }
