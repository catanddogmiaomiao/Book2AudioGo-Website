import type { Metadata } from "next";
import UpdatesContent from "../_components/UpdatesContent";

export const metadata: Metadata = {
  title: "Release Notes & Windows Updates | Book2Audio GO",
  description: "Book2Audio GO Windows updates, reading plans, speech compatibility fixes and upgrade instructions for older versions that cannot start or convert audio.",
  alternates: { canonical: "https://book2audiogo.com/updates" },
  openGraph: { title: "Book2Audio GO release notes", description: "Latest Windows updates and upgrade instructions.", url: "https://book2audiogo.com/updates", type: "website" },
};

export default function UpdatesPage() { return <UpdatesContent />; }
