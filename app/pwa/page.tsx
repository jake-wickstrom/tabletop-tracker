'use client'

import { useState, useEffect } from 'react'
import PushNotificationManager from '../components/PushNotificationManager'
import InstallPrompt from '../components/InstallPrompt'
import { sendNotification } from '../actions'
import type { PushSubscription } from '../actions'

export default function PWATestPage() {
  const [testMessage, setTestMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [supportInfo, setSupportInfo] = useState({
    serviceWorker: false,
    pushManager: false,
    notifications: false
  })

  useEffect(() => {
    setIsClient(true)
    
    // Check for feature support
    setSupportInfo({
      serviceWorker: typeof window !== 'undefined' && 'serviceWorker' in navigator,
      pushManager: typeof window !== 'undefined' && 'PushManager' in window,
      notifications: typeof window !== 'undefined' && 'Notification' in window
    })
  }, [])

  const sendTestNotification = async () => {
    if (typeof window === 'undefined') return
    
    setIsLoading(true)
    setTestMessage('')

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        setTestMessage('Please enable notifications first')
        setIsLoading(false)
        return
      }

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      }

      const result = await sendNotification(pushSubscription, {
        title: 'Test Notification',
        body: 'This is a test notification from Tabletop Tracker!',
        icon: '/icon-192x192.png',
        badge: '/badge.png',
      })

      if (result.success) {
        setTestMessage('Test notification sent successfully!')
      } else {
        setTestMessage(result.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      setTestMessage('Failed to send test notification')
    } finally {
      setIsLoading(false)
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">PWA Test Center</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">PWA Test Center</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Installation Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">App Installation</h2>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Install as PWA</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Install Tabletop Tracker on your device for a native app experience.
                </p>
                <InstallPrompt />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">PWA Features</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Offline functionality</li>
                  <li>• Push notifications</li>
                  <li>• Home screen installation</li>
                  <li>• Native app-like experience</li>
                  <li>• Background sync</li>
                </ul>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Push Notifications</h2>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <PushNotificationManager />
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Test Notifications</h3>
                <p className="text-yellow-800 text-sm mb-4">
                  Send a test notification to verify push messaging is working.
                </p>
                <button
                  onClick={sendTestNotification}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Test Notification'}
                </button>
                {testMessage && (
                  <p className={`text-sm mt-2 ${
                    testMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Worker Status */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Service Worker Status</h3>
            <div className="text-sm text-gray-700">
              <p>Service Worker: {supportInfo.serviceWorker ? '✅ Supported' : '❌ Not Supported'}</p>
              <p>Push Manager: {supportInfo.pushManager ? '✅ Supported' : '❌ Not Supported'}</p>
              <p>Notifications: {supportInfo.notifications ? '✅ Supported' : '❌ Not Supported'}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Enable notifications using the button above</li>
              <li>2. Install the app using the install button</li>
              <li>3. Send a test notification to verify functionality</li>
              <li>4. Check that the app works offline</li>
              <li>5. Verify the app appears in your device&apos;s app list</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}