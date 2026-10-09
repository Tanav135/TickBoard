
import type {
  ClientMessage,
  MarketSnapshot,
  MarketTick,
  ServerMessage,
  Symbol,
} from '../types/market'

import { useMarketStore } from '../stores/marketStore'

const SOCKET_URL =
  import.meta.env.VITE_MARKET_WS_URL ?? 'ws://localhost:8080'

const SUBSCRIBED_SYMBOLS: Symbol[] = [
  'NIFTY',
  'RELIANCE',
  'TCS',
]

const INITIAL_RETRY_MS = 1_000
const MAX_RETRY_MS = 30_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSymbol(value: unknown): value is Symbol {
  return (
    value === 'NIFTY' ||
    value === 'RELIANCE' ||
    value === 'TCS'
  )
}

function isValidPrice(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
  )
}

function isValidTimestamp(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
  )
}

function parseServerMessage(raw: unknown): ServerMessage | null {
  if (typeof raw !== 'string') {
    return null
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isRecord(parsed) || typeof parsed.type !== 'string') {
    return null
  }

  if (parsed.type === 'tick') {
    if (
      !isSymbol(parsed.symbol) ||
      !isValidPrice(parsed.pricePaise) ||
      !isValidPrice(parsed.previousPricePaise) ||
      !isValidTimestamp(parsed.timestamp)
    ) {
      return null
    }

    const tick: MarketTick = {
      type: 'tick',
      symbol: parsed.symbol,
      pricePaise: parsed.pricePaise,
      previousPricePaise: parsed.previousPricePaise,
      timestamp: parsed.timestamp,
    }

    return tick
  }

  if (parsed.type === 'snapshot') {
    if (
      !isRecord(parsed.prices) ||
      !isValidTimestamp(parsed.timestamp)
    ) {
      return null
    }

    const prices: Partial<Record<Symbol, number>> = {}

    for (const [key, value] of Object.entries(parsed.prices)) {
      if (!isSymbol(key) || !isValidPrice(value)) {
        return null
      }

      prices[key] = value
    }

    const snapshot: MarketSnapshot = {
      type: 'snapshot',
      prices,
      timestamp: parsed.timestamp,
    }

    return snapshot
  }

  if (parsed.type === 'error') {
    if (
      typeof parsed.code !== 'string' ||
      typeof parsed.message !== 'string'
    ) {
      return null
    }

    return {
      type: 'error',
      code: parsed.code,
      message: parsed.message,
    }
  }

  return null
}

export class MarketConnection {
  private socket: WebSocket | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private retryAttempts = 0
  private stopped = true

  start(): void {
    if (!this.stopped) {
      return
    }

    this.stopped = false
    this.connect()
  }

  stop(): void {
    this.stopped = true

    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    const socket = this.socket
    this.socket = null

    if (socket !== null) {
      socket.close()
    }

    useMarketStore.getState().setConnectionStatus('disconnected')
  }

  private connect(): void {
    if (this.stopped) {
      return
    }

    const store = useMarketStore.getState()

    store.setConnectionStatus(
      this.retryAttempts === 0 ? 'connecting' : 'reconnecting',
    )

    let socket: WebSocket

    try {
      socket = new WebSocket(SOCKET_URL)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.socket = socket

    socket.addEventListener('open', () => {
      if (this.stopped || this.socket !== socket) {
        socket.close()
        return
      }

      this.retryAttempts = 0
      useMarketStore.getState().setConnectionStatus('connected')

      const subscribe: ClientMessage = {
        type: 'subscribe',
        symbols: SUBSCRIBED_SYMBOLS,
      }

      socket.send(JSON.stringify(subscribe))
    })

    socket.addEventListener('message', (event: MessageEvent<unknown>) => {
      if (this.stopped || this.socket !== socket) {
        return
      }

      const message = parseServerMessage(event.data)

      if (message === null) {
        console.warn('Ignored invalid market message')
        return
      }

      const currentStore = useMarketStore.getState()

      switch (message.type) {
        case 'snapshot':
          currentStore.applySnapshot(message)
          break

        case 'tick':
          currentStore.applyTick(message)
          break

        case 'error':
          console.error(
            `Market server error (${message.code}): ${message.message}`,
          )
          break
      }
    })

    socket.addEventListener('close', () => {
      if (this.socket !== socket) {
        return
      }

      this.socket = null

      if (!this.stopped) {
        this.scheduleReconnect()
      }
    })

    socket.addEventListener('error', () => {
      // The close event normally follows a WebSocket error.
      // Reconnect from close to avoid scheduling duplicate retries.
      if (this.socket === socket) {
        socket.close()
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.retryTimer !== null) {
      return
    }

    useMarketStore.getState().setConnectionStatus('reconnecting')

    const delay = Math.min(
      INITIAL_RETRY_MS * 2 ** this.retryAttempts,
      MAX_RETRY_MS,
    )

    this.retryAttempts += 1

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.connect()
    }, delay)
  }
}

export const marketConnection = new MarketConnection()
