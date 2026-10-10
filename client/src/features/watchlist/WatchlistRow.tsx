
import { memo } from 'react'
import { useMarketStore } from '../../stores/marketStore'
import type { Symbol } from '../../types/market'

interface WatchlistRowProps {
  symbol: Symbol
  isStale: boolean
}

function formatRupees(paise: number): string {
  const rupees = Math.floor(paise / 100)
  const remainingPaise = paise % 100

  return `₹${rupees.toLocaleString('en-IN')}.${remainingPaise
    .toString()
    .padStart(2, '0')}`
}

function WatchlistRowComponent({
  symbol,
  isStale,
}: WatchlistRowProps) {
  const price = useMarketStore(
    (state) => state.prices[symbol],
  )

  const changePaise = price
    ? price.pricePaise - price.previousPricePaise
    : 0

  return (
    <tr className="border-t border-gray-800">
      <td className="px-4 py-4 font-medium">{symbol}</td>

      <td className="px-4 py-4 text-right font-mono tabular-nums">
        {price ? formatRupees(price.pricePaise) : '—'}
      </td>

      <td
        className={`px-4 py-4 text-right font-mono tabular-nums ${
          changePaise > 0
            ? 'text-emerald-400'
            : changePaise < 0
              ? 'text-red-400'
              : 'text-gray-400'
        }`}
      >
        {price
          ? `${changePaise > 0 ? '↑ +' : changePaise < 0 ? '↓ ' : ''}${formatRupees(Math.abs(changePaise))}`
          : '—'}
      </td>

      <td className="px-4 py-4 text-right">
        {price ? (
          isStale ? (
            <span className="text-amber-400">Stale</span>
          ) : (
            <span className="text-emerald-400">Live</span>
          )
        ) : (
          <span className="text-gray-400">
            {isStale ? 'Waiting' : 'Loading'}
          </span>
        )}
      </td>
    </tr>
  )
}

export const WatchlistRow = memo(WatchlistRowComponent)
