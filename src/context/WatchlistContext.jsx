import { createContext, useContext, useEffect, useReducer } from 'react'
import { stocksData } from '../data/stocks'

const STORAGE_KEY = 'stockwatch.watchlist'

// Seed data for a first-time user's default watchlist — not a live source of truth.
// Real stock data comes from the Alpha Vantage API when a stock is searched/viewed.
const defaultStocks = stocksData.filter(s =>
  ['NVDA', 'MSFT', 'TSLA', 'AAPL', 'AMZN', 'META', 'GOOG', 'NFLX'].includes(s.ticker)
)

// Guards against a stale/incompatible shape in localStorage (e.g. an older
// version of this app stored plain ticker strings under the same key).
const isValidStock = entry =>
  entry !== null &&
  typeof entry === 'object' &&
  typeof entry.ticker === 'string' &&
  typeof entry.price === 'number' &&
  typeof entry.changePercent === 'number'

function loadInitialStocks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(isValidStock)
        if (valid.length > 0) return valid
      }
    }
  } catch {
    // malformed storage — fall back to defaults
  }
  return defaultStocks
}

function reducer(stocks, action) {
  switch (action.type) {
    case 'ADD':
      return stocks.some(s => s.ticker === action.stock.ticker)
        ? stocks
        : [...stocks, action.stock]
    case 'REMOVE':
      return stocks.filter(s => s.ticker !== action.ticker)
    case 'UPDATE_QUOTE':
      return stocks.map(s => (s.ticker === action.stock.ticker ? { ...s, ...action.stock } : s))
    default:
      return stocks
  }
}

const WatchlistContext = createContext(null)

export const WatchlistProvider = ({ children }) => {
  const [watchlist, dispatch] = useReducer(reducer, undefined, loadInitialStocks)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  const value = {
    watchlist,
    isWatched: ticker => watchlist.some(s => s.ticker === ticker),
    addStock: stock => dispatch({ type: 'ADD', stock }),
    removeStock: ticker => dispatch({ type: 'REMOVE', ticker }),
    updateQuote: stock => dispatch({ type: 'UPDATE_QUOTE', stock }),
  }

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is tightly coupled to this provider
export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within a WatchlistProvider')
  return ctx
}
