
import { useMemo } from 'react'
import { useMarketStore } from '../../stores/marketStore'
import { generateOptionChain } from './optionChain'

export function useOptionChain() {
  // Subscribe only to NIFTY's price, not the entire market store.
  const spotPaise = useMarketStore(
    (state) => state.prices.NIFTY?.pricePaise,
  )

  const chain = useMemo(() => {
    if (spotPaise === undefined) {
      return []
    }

    return generateOptionChain(spotPaise)
  }, [spotPaise])

  return {
    spotPaise,
    chain,
    isLoading: spotPaise === undefined,
  }
}
