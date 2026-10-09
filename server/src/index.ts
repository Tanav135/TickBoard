import { WebSocketServer, type WebSocket } from 'ws'

import type {
  ClientMessage,
  MarketSnapshot,
  MarketTick,
  Symbol,
} from './protocol/market.js'

const PORT = 8080

const prices: Record<Symbol, number> = {
  NIFTY: 2_500_000,
  RELIANCE: 150_000,
  TCS: 350_000,
}

const clients = new Map<WebSocket, Set<Symbol>>()

function createSnapshot(symbols: Set<Symbol>): MarketSnapshot {
  const snapshotPrices = {} as Record<Symbol, number>

  for (const symbol of symbols) {
    snapshotPrices[symbol] = prices[symbol]
  }

  return {
    type: 'snapshot',
    prices: snapshotPrices,
    timestamp: Date.now(),
  }
}

function createTick(symbol: Symbol): MarketTick {
  const previousPricePaise = prices[symbol]

  const movement = Math.floor(Math.random() * 21) - 10

  const nextPricePaise = Math.max(
    1,
    previousPricePaise + movement,
  )

  prices[symbol] = nextPricePaise

  return {
    type: 'tick',
    symbol,
    pricePaise: nextPricePaise,
    previousPricePaise,
    timestamp: Date.now(),
  }
}

function sendMessage(
  socket: WebSocket,
  message: MarketSnapshot | MarketTick,
): void {
  if (socket.readyState !== socket.OPEN) {
    return
  }

  socket.send(JSON.stringify(message))
}

const wss = new WebSocketServer({
  port: PORT,
})

wss.on('connection', (socket) => {
  const subscribedSymbols = new Set<Symbol>()

  clients.set(socket, subscribedSymbols)

  console.log('Client connected')

  socket.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString()) as ClientMessage

      if (message.type === 'subscribe') {
        for (const symbol of message.symbols) {
          subscribedSymbols.add(symbol)
        }

        sendMessage(
          socket,
          createSnapshot(subscribedSymbols),
        )

        console.log(
          'Subscribed:',
          [...subscribedSymbols].join(', '),
        )
      }

      if (message.type === 'unsubscribe') {
        for (const symbol of message.symbols) {
          subscribedSymbols.delete(symbol)
        }

        console.log(
          'Remaining subscriptions:',
          [...subscribedSymbols].join(', '),
        )
      }
    } catch {
      console.log('Received invalid message')
    }
  })

  socket.on('close', () => {
    clients.delete(socket)
    console.log('Client disconnected')
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error.message)
  })
})

setInterval(() => {
  for (const [socket, subscribedSymbols] of clients) {
    for (const symbol of subscribedSymbols) {
      const tick = createTick(symbol)

      sendMessage(socket, tick)
    }
  }
}, 100)

console.log(`TickBoard mock server running on ws://localhost:${PORT}`)