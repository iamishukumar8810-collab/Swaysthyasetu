import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "SwasthyaSetu (स्वास्थ्यसेतु) | AI Pre-Consultation for AYUSH Hospitals",
  description: "AI-Powered Pre-Consultation & Clinical Case-Taking Web Application for AYUSH Hospitals. Multilingual voice intake, handwritten prescription OCR, and Dashavidha Pariksha case sheets.",
  keywords: ["AYUSH", "Ayurveda", "Pre-Consultation", "Case-Taking", "OPD Triage", "Dashavidha Pariksha", "OCR Prescription"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
