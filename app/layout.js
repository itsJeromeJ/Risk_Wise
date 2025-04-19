import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
const inter=Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RiskAI",
  description: "Modern AI-Powered Financial Risk Management",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: "light" }}>

    <html lang="en">
      <body
        className={`${inter.className} bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50`}>
        {/*header*/}
        <Header></Header>
        <main className="min-h-screen">{children}</main>
        <Toaster richColors />
        {/*footer*/}
        <footer className="bg-blue-50 py-12" >
          <div className=" container px-4 text-center text-blue-600">
            <p>
              Its my Final Year Project...
            </p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
