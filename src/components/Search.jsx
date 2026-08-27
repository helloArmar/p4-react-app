import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { searchSymbols, getGlobalQuote } from '../api/alphaVantage'
import { useWatchlist } from '../context/WatchlistContext'
import styles from './Search.module.css'

const MAX_RESULTS = 3

const Search = () => {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { isWatched, addStock } = useWatchlist()

  const runSearch = async () => {
    const trimmed = query.trim()
    if (trimmed === '') return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const matches = (await searchSymbols(trimmed)).slice(0, MAX_RESULTS)

      if (matches.length === 0) {
        setResults([])
        return
      }

      const quotes = await Promise.allSettled(matches.map(m => getGlobalQuote(m.ticker)))

      const enriched = matches
        .map((match, i) => {
          const outcome = quotes[i]
          if (outcome.status !== 'fulfilled') return null
          return { ...match, ...outcome.value }
        })
        .filter(Boolean)

      setResults(enriched)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    runSearch()
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError(null)
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <h2 className={styles.pageTitle}>Search Stocks</h2>

        {/* Search Input */}
        <form className={styles.searchBox} onSubmit={handleSubmit}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by ticker or company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button type="button" className={styles.clearBtn} onClick={handleClear} aria-label="Clear search">
              ✕
            </button>
          )}
          <button type="submit" className={styles.searchBtn} disabled={isLoading || query.trim() === ''}>
            Search
          </button>
        </form>

        {/* States: hint / loading / error / no results / results list */}
        {!hasSearched && !isLoading && (
          <p className={styles.hint}>
            Type a ticker symbol (e.g. <strong>AAPL</strong>) or a company name, then press Search.
          </p>
        )}

        {isLoading && (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Searching Alpha Vantage... (a few seconds — free-tier requests are paced 1/sec)
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Search failed</p>
            <p className={styles.emptySubtitle}>{error}</p>
          </div>
        )}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No stocks found for &ldquo;{query}&rdquo;</p>
            <p className={styles.emptySubtitle}>Try a different ticker or company name.</p>
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <>
            <p className={styles.resultCount}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>

            <div className={styles.stockList}>
              {results.map(stock => {
                const watched = isWatched(stock.ticker)
                return (
                  <div key={stock.ticker} className={styles.stockRow}>
                    <div className={styles.stockLeft}>
                      <div className={styles.tickerBadge}>{stock.ticker}</div>
                      <div className={styles.stockInfo}>
                        <span className={styles.stockTicker}>{stock.ticker}</span>
                        <span className={styles.stockName}>{stock.name} · {stock.region}</span>
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
                      <button
                        className={styles.addBtn}
                        disabled={watched}
                        onClick={() => addStock(stock)}
                      >
                        {watched ? 'Added' : '+ Add'}
                      </button>
                      <button
                        className={styles.viewBtn}
                        onClick={() => navigate(`/stocks/${stock.ticker}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Search
