'use server'

import webpush from 'web-push'

// Configure VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
}

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function subscribeUser(subscription: PushSubscription) {
  try {
    // Store subscription in your database
    // For now, we'll just log it
    console.log('New subscription:', subscription)
    
    // Send a welcome notification
    await sendNotification(subscription, {
      title: 'Welcome to Tabletop Tracker!',
      body: 'You will now receive notifications about your games.',
      icon: '/icon-192x192.png',
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe' }
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    // Remove subscription from your database
    console.log('Unsubscribing:', endpoint)
    return { success: true }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe' }
  }
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: any
  }
) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export async function sendNotificationToAll(
  subscriptions: PushSubscription[],
  payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: any
  }
) {
  try {
    const promises = subscriptions.map(subscription =>
      webpush.sendNotification(subscription, JSON.stringify(payload))
    )
    await Promise.all(promises)
    return { success: true }
  } catch (error) {
    console.error('Error sending notifications:', error)
    return { success: false, error: 'Failed to send notifications' }
  }
}