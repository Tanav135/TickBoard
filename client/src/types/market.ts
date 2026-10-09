export type Symbol = 'NIFTY' | 'RELIANCE' | 'TCS'

export interface MarketTick {
  type: 'tick'
  symbol: Symbol
  pricePaise: number
  previousPricePaise: number
  timestamp: number
}

export interface MarketSnapshot {
  type: 'snapshot'
  prices: Partial<Record<Symbol, number>>
  timestamp: number
}

export interface SubscribeMessage {
  type: 'subscribe'
  symbols: Symbol[]
}

export interface UnsubscribeMessage {
  type: 'unsubscribe'
  symbols: Symbol[]
}

export interface ServerErrorMessage {
  type: 'error'
  code: string
  message: string
}

export type ServerMessage =
  | MarketTick
  | MarketSnapshot
  | ServerErrorMessage

export type ClientMessage =
  | SubscribeMessage
  | UnsubscribeMessage