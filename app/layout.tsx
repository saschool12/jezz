import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "JHONNY AI",
  description: "Gemini-powered full-stack AI chat application"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
