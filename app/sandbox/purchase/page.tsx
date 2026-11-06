import Purchase from "./purchase";

export const metadata = {
  title: "Pro 沙盒测试购买 | Book2Audio GO",
  description: "Book2Audio GO Pro 测试环境，不会真实扣款。",
  robots: { index: false, follow: false },
};
export default function Page() { return <Purchase />; }
