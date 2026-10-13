
import { describe, expect, it } from '@jest/globals'
import { generateOptionChain } from './optionChain'

describe('generateOptionChain', () => {
  const timestamp = new Date('2026-10-13T09:00:00.000Z').getTime()

  it('generates 11 strikes around NIFTY spot', () => {
    const chain = generateOptionChain(2_500_000, timestamp)

    expect(chain).toHaveLength(11)
    expect(chain[0].strikePaise).toBe(2_450_000)
    expect(chain[5].strikePaise).toBe(2_500_000)
    expect(chain[10].strikePaise).toBe(2_550_000)
  })

  it('creates call and put quotes with integer paise premiums', () => {
    const chain = generateOptionChain(2_500_000, timestamp)

    for (const row of chain) {
      expect(row.call.type).toBe('CE')
      expect(row.put.type).toBe('PE')
      expect(row.call.strikePaise).toBe(row.strikePaise)
      expect(row.put.strikePaise).toBe(row.strikePaise)

      expect(Number.isSafeInteger(row.call.premiumPaise)).toBe(true)
      expect(Number.isSafeInteger(row.put.premiumPaise)).toBe(true)

      expect(row.call.premiumPaise).toBeGreaterThanOrEqual(0)
      expect(row.put.premiumPaise).toBeGreaterThanOrEqual(0)
    }
  })

  it('rejects invalid spot prices', () => {
    expect(() => generateOptionChain(0, timestamp)).toThrow()
    expect(() => generateOptionChain(-100, timestamp)).toThrow()
    expect(() => generateOptionChain(100.5, timestamp)).toThrow()
  })

  it('produces a new strike range when the underlying price moves', () => {
    const lowerChain = generateOptionChain(2_500_000, timestamp)
    const higherChain = generateOptionChain(2_520_000, timestamp)

    expect(higherChain[5].strikePaise).toBeGreaterThan(
      lowerChain[5].strikePaise,
    )
  })
})
