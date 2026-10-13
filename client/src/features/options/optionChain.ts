
import { blackScholes, rupeesToPaise } from './blackScholes'
import type { OptionChainRow, OptionQuote } from './types'

const STRIKE_INTERVAL_RUPEES = 100
const STRIKE_LEVELS_EACH_SIDE = 5
const DAYS_TO_EXPIRY = 30
const RISK_FREE_RATE = 0.06
const IMPLIED_VOLATILITY = 0.2

/**
 * Generates a simulated NIFTY options chain.
 *
 * spotPaise: underlying NIFTY price in integer paise.
 * timestamp: timestamp in milliseconds, useful for consistent tests.
 */
export function generateOptionChain(
  spotPaise: number,
  timestamp: number = Date.now(),
): OptionChainRow[] {
  if (!Number.isSafeInteger(spotPaise) || spotPaise <= 0) {
    throw new Error('Spot price must be a positive integer in paise.')
  }

  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new Error('Timestamp must be a valid non-negative number.')
  }

  const spotRupees = spotPaise / 100

  // Round the current spot to the nearest ₹100 strike.
  const centerStrikeRupees =
    Math.round(spotRupees / STRIKE_INTERVAL_RUPEES) *
    STRIKE_INTERVAL_RUPEES

  const expiryDate = new Date(timestamp)
  expiryDate.setDate(expiryDate.getDate() + DAYS_TO_EXPIRY)
  const expiry = expiryDate.toISOString().slice(0, 10)

  const timeToExpiryYears = DAYS_TO_EXPIRY / 365
  const rows: OptionChainRow[] = []

  for (
    let offset = -STRIKE_LEVELS_EACH_SIDE;
    offset <= STRIKE_LEVELS_EACH_SIDE;
    offset += 1
  ) {
    const strikeRupees =
      centerStrikeRupees + offset * STRIKE_INTERVAL_RUPEES
    const strikePaise = strikeRupees * 100

    const premiums = blackScholes({
      spot: spotRupees,
      strike: strikeRupees,
      timeToExpiryYears,
      riskFreeRate: RISK_FREE_RATE,
      volatility: IMPLIED_VOLATILITY,
    })

    const call: OptionQuote = {
      symbol: 'NIFTY',
      expiry,
      strikePaise,
      type: 'CE',
      premiumPaise: rupeesToPaise(premiums.call),
      impliedVolatility: IMPLIED_VOLATILITY,
      timestamp,
    }

    const put: OptionQuote = {
      symbol: 'NIFTY',
      expiry,
      strikePaise,
      type: 'PE',
      premiumPaise: rupeesToPaise(premiums.put),
      impliedVolatility: IMPLIED_VOLATILITY,
      timestamp,
    }

    rows.push({ strikePaise, call, put })
  }

  return rows
}
