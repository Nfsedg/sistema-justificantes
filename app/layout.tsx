import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'SIJE - Sistema de Justificantes | UPQROO',
  description: 'Sistema de gestión de justificantes por ausencia - Universidad Politécnica de Quintana Roo',
  icons: {
    icon: [
      {
        url: '/logo_upqroo_150.png',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
