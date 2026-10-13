import { blackScholes, rupeesToPaise } from './blackScholes'

describe('blackScholes', () => {
  const input = {
    spot: 25_000,
    strike: 25_000,
    timeToExpiryYears: 30 / 365,
    riskFreeRate: 0.06,
    volatility: 0.2,
  }

  it('returns non-negative call and put premiums', () => {
    const result = blackScholes(input)

    expect(result.call).toBeGreaterThanOrEqual(0)
    expect(result.put).toBeGreaterThanOrEqual(0)
  })

  it('satisfies put-call parity within numerical tolerance', () => {
    const result = blackScholes(input)
    const discountedStrike =
      input.strike *
      Math.exp(-input.riskFreeRate * input.timeToExpiryYears)

    expect(result.call - result.put).toBeCloseTo(
      input.spot - discountedStrike,
      6,
    )
  })

  it('rejects invalid inputs', () => {
    expect(() =>
      blackScholes({ ...input, spot: 0 }),
    ).toThrow()

    expect(() =>
      blackScholes({ ...input, volatility: -0.2 }),
    ).toThrow()

    expect(() =>
      blackScholes({ ...input, timeToExpiryYears: 0 }),
    ).toThrow()
  })
})

describe('rupeesToPaise', () => {
  it('converts rupees to integer paise', () => {
    expect(rupeesToPaise(120.25)).toBe(12_025)
    expect(rupeesToPaise(0)).toBe(0)
  })

  it('rejects negative or non-finite values', () => {
    expect(() => rupeesToPaise(-1)).toThrow()
    expect(() => rupeesToPaise(Number.NaN)).toThrow()
  })
})