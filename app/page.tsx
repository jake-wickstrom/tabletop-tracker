'use client'

import React from 'react'
import { useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    // This should rarely happen due to middleware, but just in case
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            Please sign in to access Tabletop Tracker.
          </p>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Tabletop Tracker
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track board game plays, wins, losses and more!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🎲 Games
              </h2>
              <p className="text-gray-600 mb-4">
                Manage your board game collection
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                View Games
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                👥 Players
              </h2>
              <p className="text-gray-600 mb-4">
                Manage players and track their performance
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                View Players
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📊 Sessions
              </h2>
              <p className="text-gray-600 mb-4">
                Record and view game sessions
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                View Sessions
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🎯 Getting Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  1. Add Your Games
                </h3>
                <p className="text-gray-600">
                  Start by adding your favorite board games to your collection. Include details like player count and complexity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  2. Add Players
                </h3>
                <p className="text-gray-600">
                  Create profiles for regular players to track their performance across different games.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  3. Record Sessions
                </h3>
                <p className="text-gray-600">
                  After each game session, record the results including scores, winners, and any notes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  4. Analyze Performance
                </h3>
                <p className="text-gray-600">
                  View statistics and trends to see which games you play most and who performs best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 