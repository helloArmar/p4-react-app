const round2 = n => Math.round(n * 100) / 100

// Derives the extra quote fields (open/high/low/52w range/market cap) from a
// base price + % change so each stock only needs a few authored numbers.
function buildQuote({ price, changePercent, sharesOutstandingB, volumeM }) {
  const change = round2(price - price / (1 + changePercent / 100))
  const prevClose = round2(price - change)
  const open = round2(prevClose + change * 0.4)
  const high = round2(Math.max(price, open) * 1.008)
  const low = round2(Math.min(price, open) * 0.99)
  const week52High = round2(price * 1.18)
  const week52Low = round2(price * 0.66)
  const marketCapB = round2(sharesOutstandingB * price)

  return {
    price,
    change,
    changePercent,
    open,
    high,
    low,
    prevClose,
    volume: `${volumeM.toFixed(1)}M`,
    week52High,
    week52Low,
    marketCap: marketCapB >= 1000 ? `$${(marketCapB / 1000).toFixed(2)}T` : `$${marketCapB.toFixed(1)}B`,
  }
}

export const stocksData = [
  {
    ticker: 'NVDA', name: 'Nvidia Corp.', exchange: 'NASDAQ', sector: 'Technology',
    ...buildQuote({ price: 875.40, changePercent: 4.21, sharesOutstandingB: 2.46, volumeM: 185.3 }),
  },
  {
    ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', sector: 'Technology',
    ...buildQuote({ price: 415.20, changePercent: 0.83, sharesOutstandingB: 7.43, volumeM: 22.1 }),
  },
  {
    ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive',
    ...buildQuote({ price: 248.75, changePercent: -2.01, sharesOutstandingB: 3.19, volumeM: 98.7 }),
  },
  {
    ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology',
    price: 189.42, change: 1.23, changePercent: 0.65,
    open: 187.19, high: 190.01, low: 186.60, prevClose: 188.19,
    volume: '54.2M', week52High: 199.62, week52Low: 164.08, marketCap: '$2.91T',
  },
  {
    ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary',
    ...buildQuote({ price: 185.30, changePercent: 2.34, sharesOutstandingB: 10.5, volumeM: 41.2 }),
  },
  {
    ticker: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', sector: 'Technology',
    ...buildQuote({ price: 512.80, changePercent: 0.47, sharesOutstandingB: 2.53, volumeM: 14.6 }),
  },
  {
    ticker: 'GOOG', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology',
    ...buildQuote({ price: 175.60, changePercent: -0.89, sharesOutstandingB: 12.1, volumeM: 28.9 }),
  },
  {
    ticker: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communication Services',
    ...buildQuote({ price: 635.20, changePercent: -1.23, sharesOutstandingB: 0.436, volumeM: 3.8 }),
  },
  {
    ticker: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', sector: 'Technology',
    ...buildQuote({ price: 142.30, changePercent: 1.87, sharesOutstandingB: 1.62, volumeM: 55.4 }),
  },
  {
    ticker: 'INTC', name: 'Intel Corp.', exchange: 'NASDAQ', sector: 'Technology',
    ...buildQuote({ price: 21.40, changePercent: -3.12, sharesOutstandingB: 4.27, volumeM: 88.6 }),
  },
  {
    ticker: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', sector: 'Media & Entertainment',
    ...buildQuote({ price: 112.60, changePercent: 0.34, sharesOutstandingB: 1.81, volumeM: 12.3 }),
  },
  {
    ticker: 'PYPL', name: 'PayPal Holdings', exchange: 'NASDAQ', sector: 'Financial Services',
    ...buildQuote({ price: 68.90, changePercent: -1.67, sharesOutstandingB: 1.04, volumeM: 15.9 }),
  },
  {
    ticker: 'APLE', name: 'Apple Hospitality REIT', exchange: 'NYSE', sector: 'Real Estate',
    ...buildQuote({ price: 16.08, changePercent: -0.86, sharesOutstandingB: 0.229, volumeM: 3.1 }),
  },
]

export const findStock = ticker =>
  stocksData.find(s => s.ticker === ticker.toUpperCase())
