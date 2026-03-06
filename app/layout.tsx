import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css'

import {ConfigProvider} from 'antd';
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import LayoutPage from "./LayoutPage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saitiyo | Best Construction Site Management App",
  description: "Manage your site on the go with Saitiyo - the ultimate mobile companion for construction site management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {





  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       
          <LayoutPage>
            {children}  
          </LayoutPage>

      </body>
    </html>
  );
}
