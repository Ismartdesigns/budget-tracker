"use client"; // Ensures this is a client component

import { useState, useEffect } from 'react';
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";
import { metadata } from "./metadata"; // Import the metadata

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {isClient ? children : null}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
