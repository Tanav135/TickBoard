
import { create } from 'zustand'
import type {
  MarketSnapshot,
  MarketTick,
  Symbol,
} from '../types/market'

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

export interface PriceState {
  pricePaise: number
  previousPricePaise: number
  timestamp: number
}

interface MarketState {
  connectionStatus: ConnectionStatus
  prices: Partial<Record<Symbol, PriceState>>
  setConnectionStatus: (status: ConnectionStatus) => void
  applySnapshot: (snapshot: MarketSnapshot) => void
  applyTick: (tick: MarketTick) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  connectionStatus: 'disconnected',
  prices: {},

  setConnectionStatus: (connectionStatus) => {
    set({ connectionStatus })
  },

  applySnapshot: (snapshot) => {
    set((state) => {
      const nextPrices = { ...state.prices }

      for (const symbol of Object.keys(snapshot.prices) as Symbol[]) {
        const pricePaise = snapshot.prices[symbol]

        if (pricePaise === undefined) {
          continue
        }

        nextPrices[symbol] = {
          pricePaise,
          previousPricePaise: pricePaise,
          timestamp: snapshot.timestamp,
        }
      }

      return { prices: nextPrices }
    })
  },

  applyTick: (tick) => {
    set((state) => ({
      prices: {
        ...state.prices,
        [tick.symbol]: {
          pricePaise: tick.pricePaise,
          previousPricePaise: tick.previousPricePaise,
          timestamp: tick.timestamp,
        },
      },
    }))
  },
}))
