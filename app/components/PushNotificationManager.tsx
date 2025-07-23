'use client'

import { useEffect, useState } from 'react'
import { subscribeUser, unsubscribeUser } from '../actions'
import type { PushSubscription } from '../actions'

interface PushNotificationManagerProps {
  className?: string
}

export default function PushNotificationManager({ className }: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        setSubscription(sub as unknown as PushSubscription)
      }
    } catch (error) {
      console.error('Error registering service worker:', error)
    }
  }

  async function subscribeToPush() {
    setIsLoading(true)
    setMessage('')

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
          auth: arrayBufferToBase64(sub.getKey('auth')!),
        },
      }

      const result = await subscribeUser(subscription)
      
      if (result.success) {
        setSubscription(subscription)
        setMessage('Successfully subscribed to notifications!')
      } else {
        setMessage(result.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setMessage('Failed to subscribe to notifications')
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true)
    setMessage('')

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      
      if (sub) {
        await sub.unsubscribe()
        await unsubscribeUser(sub.endpoint)
        setSubscription(undefined)
        setMessage('Successfully unsubscribed from notifications')
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setMessage('Failed to unsubscribe from notifications')
    } finally {
      setIsLoading(false)
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  if (!isSupported) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-600">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get notified about game sessions, achievements, and updates.
        </p>
        
        {subscription ? (
          <div className="space-y-2">
            <p className="text-sm text-green-600">
              ✓ You&apos;re subscribed to notifications
            </p>
            <button
              onClick={unsubscribeFromPush}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>
          </div>
        ) : (
          <button
            onClick={subscribeToPush}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Subscribing...' : 'Enable Notifications'}
          </button>
        )}
        
        {message && (
          <p className={`text-sm mt-2 ${
            message.includes('Successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}