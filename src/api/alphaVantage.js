const BASE_URL = 'https://www.alphavantage.co/query'

export class MissingApiKeyError extends Error {
  constructor() {
    super('Alpha Vantage API key is missing. Add VITE_ALPHA_VANTAGE_API_KEY to a .env.local file and restart the dev server.')
    this.name = 'MissingApiKeyError'
  }
}

export class ApiError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ApiError'
  }
}

function getApiKey() {
  const key = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  if (!key) throw new MissingApiKeyError()
  return key
}

// Alpha Vantage's free tier rejects requests spaced less than ~1/second apart
// (with a 200 OK + an "Information" throttle message, not an HTTP error). Every
// request funnels through this queue so calls fired in parallel by the UI
// (e.g. enriching several search matches with quotes) still land ~1.1s apart.
const MIN_REQUEST_INTERVAL_MS = 1500
let queueTail = Promise.resolve()
let lastRequestAt = 0

function throttledFetch(url) {
  const task = queueTail.then(async () => {
    const wait = Math.max(0, lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now())
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait))
    lastRequestAt = Date.now()
    return fetch(url)
  })
  queueTail = task.catch(() => {})
  return task
}

const isPacingThrottle = message => /spreading out|1 request per second/i.test(message || '')

async function callAlphaVantage(params, { retriedAfterThrottle = false } = {}) {
  const apiKey = getApiKey()
  const url = new URL(BASE_URL)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  url.searchParams.set('apikey', apiKey)

  let response
  try {
    response = await throttledFetch(url.toString())
  } catch {
    throw new ApiError('Network error reaching Alpha Vantage. Check your connection and try again.')
  }

  if (!response.ok) {
    throw new ApiError(`Alpha Vantage request failed (HTTP ${response.status}).`)
  }

  const data = await response.json()

  if (data['Note']) {
    throw new ApiError('Alpha Vantage rate limit reached. Please wait and try again later.')
  }
  if (data['Information']) {
    // A borderline pacing throttle sometimes slips through even with the queue's
    // spacing — worth exactly one automatic retry before surfacing it as an error.
    if (isPacingThrottle(data['Information']) && !retriedAfterThrottle) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS))
      return callAlphaVantage(params, { retriedAfterThrottle: true })
    }
    throw new ApiError(data['Information'].split(apiKey).join('xxxxxxxxx'))
  }
  if (data['Error Message']) {
    throw new ApiError('Alpha Vantage could not process that request.')
  }

  return data
}

const toNumber = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function searchSymbols(keywords) {
  const data = await callAlphaVantage({ function: 'SYMBOL_SEARCH', keywords })
  const matches = data.bestMatches || []
  return matches.map(m => ({
    ticker: m['1. symbol'],
    name: m['2. name'],
    region: m['4. region'],
  }))
}

export async function getGlobalQuote(ticker) {
  const data = await callAlphaVantage({ function: 'GLOBAL_QUOTE', symbol: ticker })
  const quote = data['Global Quote']
  if (!quote || !quote['05. price']) {
    throw new ApiError(`No quote data found for "${ticker}".`)
  }

  return {
    ticker: quote['01. symbol'],
    price: toNumber(quote['05. price']),
    open: toNumber(quote['02. open']),
    high: toNumber(quote['03. high']),
    low: toNumber(quote['04. low']),
    volume: quote['06. volume'] ? `${(Number(quote['06. volume']) / 1_000_000).toFixed(1)}M` : null,
    prevClose: toNumber(quote['08. previous close']),
    change: toNumber(quote['09. change']),
    changePercent: toNumber((quote['10. change percent'] || '').replace('%', '')),
  }
}

export async function getCompanyOverview(ticker) {
  const data = await callAlphaVantage({ function: 'OVERVIEW', symbol: ticker })
  if (!data.Symbol) {
    throw new ApiError(`No company overview found for "${ticker}".`)
  }

  const marketCapRaw = toNumber(data.MarketCapitalization)
  const marketCap = marketCapRaw
    ? marketCapRaw >= 1_000_000_000_000
      ? `$${(marketCapRaw / 1_000_000_000_000).toFixed(2)}T`
      : `$${(marketCapRaw / 1_000_000_000).toFixed(1)}B`
    : null

  return {
    ticker: data.Symbol,
    name: data.Name,
    exchange: data.Exchange,
    sector: data.Sector,
    week52High: toNumber(data['52WeekHigh']),
    week52Low: toNumber(data['52WeekLow']),
    marketCap,
  }
}
