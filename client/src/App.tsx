
import { Profiler, useEffect } from 'react'
import { WatchlistRow } from './features/watchlist/WatchlistRow'
import { marketConnection } from './services/marketConnection'
import { useMarketStore } from './stores/marketStore'
import type { Symbol } from './types/market'

const SYMBOLS: Symbol[] = ['NIFTY', 'RELIANCE', 'TCS']

let profilerCommitCount = 0

function onRender(
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
) {
  profilerCommitCount += 1

  console.log('[React Profiler]', {
    commit: profilerCommitCount,
    id,
    phase,
    actualDuration,
    baseDuration,
  })
}

function App() {
  const connectionStatus = useMarketStore(
    (state) => state.connectionStatus,
  )

  useEffect(() => {
    marketConnection.start()

    return () => {
      marketConnection.stop()
    }
  }, [])

  const isStale = connectionStatus !== 'connected'

  return (
    <Profiler id="TickBoard" onRender={onRender}>
      <main className="min-h-screen bg-[#0b0f14] p-6 text-gray-100">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">
                Paper Trading Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-bold">TickBoard</h1>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-sm ${
                connectionStatus === 'connected'
                  ? 'border-emerald-700 text-emerald-400'
                  : 'border-amber-700 text-amber-400'
              }`}
              role="status"
            >
              {connectionStatus}
            </span>
          </header>

          <section className="overflow-hidden rounded-xl border border-gray-800 bg-[#111820]">
            <div className="border-b border-gray-800 p-4">
              <h2 className="font-semibold">Market Watchlist</h2>
              <p className="mt-1 text-sm text-gray-400">
                Mock market data · Prices stored in integer paise
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3 text-right">LTP</th>
                    <th className="px-4 py-3 text-right">Change</th>
                    <th className="px-4 py-3 text-right">Data status</th>
                  </tr>
                </thead>

                <tbody>
                 {SYMBOLS.map((symbol) => (
                  <Profiler
                    key={symbol}
                    id={`WatchlistRow-${symbol}`}
                    onRender={onRender}
                  >
                    <WatchlistRow
                      symbol={symbol}
                      isStale={isStale}
                    />
                  </Profiler>
                ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </Profiler>
  )
}

export default App
