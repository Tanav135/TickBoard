function App() {
  return (
    <main className="min-h-screen bg-[#0b0f14] p-6 text-gray-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <p className="text-sm font-medium text-gray-400">
            Paper Trading Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            TickBoard
          </h1>
        </header>

        <section className="rounded-xl border border-gray-800 bg-[#111820] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Market Overview</h2>
              <p className="mt-1 text-sm text-gray-400">
                Real-time market data will appear here.
              </p>
            </div>

            <span className="rounded-full border border-yellow-700 px-3 py-1 text-xs font-medium text-yellow-400">
              Disconnected
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App