
import { useOptionChain } from './useOptionChain'

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function OptionChainPreview() {
  const { spotPaise, chain, isLoading } = useOptionChain()

  if (isLoading || spotPaise === undefined) {
    return <p>Waiting for NIFTY market data...</p>
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-700 p-4">
      <h2 className="mb-2 text-lg font-semibold">
        NIFTY Options Preview
      </h2>

      <p className="mb-4 text-sm text-slate-400">
        Underlying: {formatRupees(spotPaise)}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="p-2">Call Premium</th>
              <th className="p-2">Strike</th>
              <th className="p-2">Put Premium</th>
            </tr>
          </thead>

          <tbody>
            {chain.map((row) => (
              <tr
                key={row.strikePaise}
                className="border-b border-slate-800"
              >
                <td className="p-2">
                  {formatRupees(row.call.premiumPaise)}
                </td>
                <td className="p-2 font-medium">
                  {formatRupees(row.strikePaise)}
                </td>
                <td className="p-2">
                  {formatRupees(row.put.premiumPaise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
