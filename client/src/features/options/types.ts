export type OptionType = 'CE' | 'PE'

export interface OptionContract {
  symbol: string
  expiry: string
  strikePaise: number
  type: OptionType
}

export interface OptionQuote extends OptionContract {
  premiumPaise: number
  impliedVolatility: number
  timestamp: number
}

export interface OptionChainRow {
  strikePaise: number
  call: OptionQuote
  put: OptionQuote
}