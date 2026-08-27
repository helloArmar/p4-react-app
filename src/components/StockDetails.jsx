import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from './Navbar'
import { getGlobalQuote, getCompanyOverview } from '../api/alphaVantage'
import { useWatchlist } from '../context/WatchlistContext'
import styles from './StockDetails.module.css'

const StockDetails = () => {
  const { ticker: rawTicker } = useParams()
  const ticker = rawTicker.toUpperCase()
  const navigate = useNavigate()
  const { watchlist, isWatched, addStock, removeStock, updateQuote } = useWatchlist()

  const cached = watchlist.find(s => s.ticker === ticker) || null
  const [stock, setStock] = useState(cached)
  const [isLoading, setIsLoading] = useState(!cached)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDetails() {
      setError(null)
      setIsLoading(!cached)

      const [quoteResult, overviewResult] = await Promise.allSettled([
        getGlobalQuote(ticker),
        getCompanyOverview(ticker),
      ])

      if (cancelled) return

      if (quoteResult.status !== 'fulfilled') {
        setIsLoading(false)
        setError(quoteResult.reason?.message || 'Failed to load stock data.')
        return
      }

      const merged = {
        ticker,
        ...(cached || {}),
        ...quoteResult.value,
        ...(overviewResult.status === 'fulfilled' ? overviewResult.value : {}),
      }

      setStock(merged)
      setIsLoading(false)

      if (isWatched(ticker)) updateQuote(merged)
    }

    fetchDetails()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker])

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Loading {ticker}...
          </div>
        </main>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className={styles.wrapper}>
        <Navbar />
        <main className={styles.main}>
          <p className={styles.notFound}>{error || `No stock found for "${ticker}".`}</p>
          <button className={styles.backBtn} onClick={() => navigate('/search')}>
            Back to Search
          </button>
        </main>
      </div>
    )
  }

  const watched = isWatched(stock.ticker)
  const positive = stock.change >= 0

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <p className={styles.breadcrumb}>
          <Link to="/watchlist" className={styles.breadcrumbLink}>Watchlist</Link> › {stock.ticker}
        </p>

        {error && (
          <div className={styles.errorBanner}>
            Showing last known data — {error}
          </div>
        )}

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.tickerBadge}>{stock.ticker}</div>
            <div>
              <h2 className={styles.name}>{stock.name || stock.ticker}</h2>
              <span className={styles.meta}>{[stock.exchange, stock.sector].filter(Boolean).join(' · ') || '—'}</span>
            </div>
          </div>

          <button
            className={watched ? styles.watchBtnActive : styles.watchBtn}
            onClick={() => (watched ? removeStock(stock.ticker) : addStock(stock))}
          >
            {watched ? '− Remove from Watchlist' : '+ Add to Watchlist'}
          </button>
        </div>

        <div className={styles.priceBlock}>
          <span className={styles.price}>${stock.price.toFixed(2)}</span>
          <span className={positive ? `${styles.changeBadge} ${styles.green}` : `${styles.changeBadge} ${styles.red}`}>
            {positive ? '+' : ''}{stock.change.toFixed(2)} ({positive ? '+' : ''}{stock.changePercent.toFixed(2)}%) today
          </span>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Open</span>
            <span className={styles.statValue}>${stock.open?.toFixed(2) ?? '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>High</span>
            <span className={styles.statValue}>${stock.high?.toFixed(2) ?? '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Low</span>
            <span className={styles.statValue}>${stock.low?.toFixed(2) ?? '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Volume</span>
            <span className={styles.statValue}>{stock.volume ?? '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Prev Close</span>
            <span className={styles.statValue}>${stock.prevClose?.toFixed(2) ?? '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>52w High</span>
            <span className={styles.statValue}>{stock.week52High ? `$${stock.week52High.toFixed(2)}` : '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>52w Low</span>
            <span className={styles.statValue}>{stock.week52Low ? `$${stock.week52Low.toFixed(2)}` : '—'}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Mkt Cap</span>
            <span className={styles.statValue}>{stock.marketCap ?? '—'}</span>
          </div>
        </div>

        <p className={styles.note}>
          Dynamic route via useParams · live data from Alpha Vantage (GLOBAL_QUOTE + OVERVIEW) · Add/Remove button toggles based on watchlist state
        </p>
      </main>
    </div>
  )
}

export default StockDetails
