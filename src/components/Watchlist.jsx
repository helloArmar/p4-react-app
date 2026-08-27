import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useWatchlist } from '../context/WatchlistContext'
import styles from './Watchlist.module.css'

const FILTERS = ['All', 'Gainers', 'Losers']
const SORTS = [
  { key: 'changePercent', label: '% Change' },
  { key: 'price', label: 'Price' },
  { key: 'name', label: 'Name' },
]

const Watchlist = () => {
  const { watchlist, removeStock } = useWatchlist()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [sortKey, setSortKey] = useState('changePercent')

  const filtered = useMemo(() => {
    let list = watchlist
    if (filter === 'Gainers') list = list.filter(s => s.changePercent > 0)
    if (filter === 'Losers') list = list.filter(s => s.changePercent < 0)

    return [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      return b[sortKey] - a[sortKey]
    })
  }, [watchlist, filter, sortKey])

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>

        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>My Watchlist</h2>
          <span className={styles.countBadge}>{watchlist.length} stocks</span>
        </div>

        <div className={styles.chipRow}>
          <div className={styles.chipGroup}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={filter === f ? styles.chipActive : styles.chip}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className={styles.chipGroup}>
            {SORTS.map(s => (
              <button
                key={s.key}
                className={sortKey === s.key ? styles.chipActive : styles.chip}
                onClick={() => setSortKey(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            {watchlist.length === 0
              ? 'Your watchlist is empty. Search for a stock to get started.'
              : 'No stocks match this filter.'}
          </div>
        ) : (
          <div className={styles.stockList}>
            {filtered.map(stock => (
              <div key={stock.ticker} className={styles.stockRow}>
                <div className={styles.stockLeft}>
                  <div className={styles.tickerBadge}>{stock.ticker}</div>
                  <div className={styles.stockInfo}>
                    <span className={styles.stockTicker}>{stock.ticker}</span>
                    <span className={styles.stockName}>{stock.name}</span>
                  </div>
                </div>
                <div className={styles.stockRight}>
                  <span className={styles.stockPrice}>${stock.price.toFixed(2)}</span>
                  <span
                    className={
                      stock.changePercent >= 0
                        ? `${styles.badge} ${styles.badgeGreen}`
                        : `${styles.badge} ${styles.badgeRed}`
                    }
                  >
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                  <button className={styles.viewBtn} onClick={() => navigate(`/stocks/${stock.ticker}`)}>
                    View
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeStock(stock.ticker)}
                    aria-label={`Remove ${stock.ticker}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className={styles.note}>
          Filter chips: All / Gainers / Losers · Sort chips toggle active state · Remove deletes from state + localStorage · &ldquo;View&rdquo; → /stocks/:ticker
        </p>

      </main>
    </div>
  )
}

export default Watchlist
