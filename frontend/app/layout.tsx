import type { Metadata } from "next";
import { Jura } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { LanguageProvider } from "./components/LanguageContext";
import { ReduxProviders } from "@/providers/ReduxProviders";
import { ToastContainer } from "react-toastify";

const jura = Jura({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jura",
});

export const metadata: Metadata = {
  title: "Parwan Roastery Abu Dhabi",
  description: "Parwan Roastery Abu Dhabi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jura.className} bg-white`}>
      <body className="min-h-full flex flex-col">
        <ReduxProviders>
          <LanguageProvider>
            <Header />
            {children}
            <Footer />
          </LanguageProvider>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
        </ReduxProviders>
      </body>
    </html>
  );
}
