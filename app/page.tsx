export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Tabletop Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track board game plays, wins, losses and more!
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🎲 Ready to Play?
          </h2>
          <p className="text-gray-600 mb-4">
            Your board game tracking app is now running successfully!
          </p>
          <div className="text-sm text-gray-500">
            Next.js + Supabase + TypeScript
          </div>
        </div>
      </div>
    </main>
  )
} 