import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { SkipLinks } from '@/components/SkipLinks'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestor de Proyectos',
  description: 'Aplicación para gestionar proyectos y tareas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <SkipLinks />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
