import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Banwell Designs - Fantastic Handmade Goods",
  description: "The original maker of modern, handmade leather plague doctor masks, steampunk creations, and stained glass products. Imitated by many, duplicated by none.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: '#000' }}>
      <body className={`${poppins.className} antialiased bg-black min-h-screen`} style={{ background: '#000' }}>
        {children}
      </body>
    </html>
  );
}
