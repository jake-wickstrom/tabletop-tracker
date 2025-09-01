import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import WatermelonProvider from './components/Providers/WatermelonProvider'
import PushNotificationManager from './components/PushNotificationManager'
import InstallPrompt from './components/InstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tabletop Tracker',
  description: 'Track board game plays, wins, losses and more!',
  manifest: '/manifest.json',
  themeColor: '#1f2937',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tabletop Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Tabletop Tracker',
    title: 'Tabletop Tracker',
    description: 'Track board game plays, wins, losses and more!',
  },
  twitter: {
    card: 'summary',
    title: 'Tabletop Tracker',
    description: 'Track board game plays, wins, losses and more!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tabletop Tracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <WatermelonProvider>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2">
              <InstallPrompt />
            </div>
            <div className="hidden">
              <PushNotificationManager />
            </div>
          </WatermelonProvider>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
} 