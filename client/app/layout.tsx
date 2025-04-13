import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ContextProvider from "@/providers/ContextProvider";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";

//this is roboto font containing css class applies this font globally
const roboto = Roboto({
  //loads only Latin characters
  subsets : ["latin"],
  //load specific font weight
  weight : ["400" , "500" , "700" , "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} antialiased`}
      >
        <Toaster position="top-center"/>
        {/* "Every single page, component, and UI under this layout will now have access to the global context." */}
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
