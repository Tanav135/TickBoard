export interface BlackScholesInput {
  spot: number
  strike: number
  timeToExpiryYears: number
  riskFreeRate: number
  volatility: number
}

export interface OptionPrices {
  call: number
  put: number
}

function normalCdf(x: number): number {
  const absoluteX = Math.abs(x)
  const t = 1 / (1 + 0.2316419 * absoluteX)

  const density =
    Math.exp((-absoluteX * absoluteX) / 2) /
    Math.sqrt(2 * Math.PI)

  const polynomial =
    t *
    (0.319381530 +
      t *
        (-0.356563782 +
          t *
            (1.781477937 +
              t * (-1.821255978 + t * 1.330274429))))

  const upperTail = density * polynomial

  return x >= 0 ? 1 - upperTail : upperTail
}

export function blackScholes(
  input: BlackScholesInput,
): OptionPrices {
  const {
    spot,
    strike,
    timeToExpiryYears,
    riskFreeRate,
    volatility,
  } = input

  if (
    !Number.isFinite(spot) ||
    !Number.isFinite(strike) ||
    !Number.isFinite(timeToExpiryYears) ||
    !Number.isFinite(riskFreeRate) ||
    !Number.isFinite(volatility) ||
    spot <= 0 ||
    strike <= 0 ||
    timeToExpiryYears <= 0 ||
    volatility <= 0
  ) {
    throw new Error('Black-Scholes inputs must be finite and positive where required.')
  }

  const sqrtTime = Math.sqrt(timeToExpiryYears)

  const d1 =
    (Math.log(spot / strike) +
      (riskFreeRate + (volatility * volatility) / 2) *
        timeToExpiryYears) /
    (volatility * sqrtTime)

  const d2 = d1 - volatility * sqrtTime

  const discountedStrike =
    strike * Math.exp(-riskFreeRate * timeToExpiryYears)

  const call =
    spot * normalCdf(d1) -
    discountedStrike * normalCdf(d2)

  const put =
    discountedStrike * normalCdf(-d2) -
    spot * normalCdf(-d1)

  return {
    call: Math.max(0, call),
    put: Math.max(0, put),
  }
}

export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new Error('Rupees must be a finite, non-negative number.')
  }

  return Math.round(rupees * 100)
}