import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useWatchlist } from '../context/WatchlistContext'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()

  // Compute stats from watchlist state
  const totalStocks   = watchlist.length
  const stocksUp      = watchlist.filter(s => s.changePercent > 0).length
  const stocksDown    = watchlist.filter(s => s.changePercent < 0).length
  const bestPerformer = watchlist.length
    ? watchlist.reduce((best, s) => s.changePercent > best.changePercent ? s : best)
    : null

  // Top 3 stocks by highest positive change
  const topStocks = [...watchlist]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3)

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>

        <h2 className={styles.sectionTitle}>Overview</h2>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={styles.labelFull}>Total Stocks</span>
              <span className={styles.labelShort}>Total</span>
            </span>
            <span className={styles.statValue}>{totalStocks}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={styles.labelFull}>Stocks Up Today</span>
              <span className={styles.labelShort}>Up</span>
            </span>
            <span className={`${styles.statValue} ${styles.green}`}>
              {stocksUp} ↑
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={styles.labelFull}>Stocks Down Today</span>
              <span className={styles.labelShort}>Down</span>
            </span>
            <span className={`${styles.statValue} ${styles.red}`}>
              {stocksDown} ↓
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={styles.labelFull}>Best Performer</span>
              <span className={styles.labelShort}>Best</span>
            </span>
            {bestPerformer ? (
              <div className={styles.bestValue}>
                <span className={styles.bestTicker}>{bestPerformer.ticker}</span>
                <span className={`${styles.bestChange} ${styles.green}`}>
                  +{bestPerformer.changePercent.toFixed(2)}%
                </span>
              </div>
            ) : (
              <span className={styles.statValue}>—</span>
            )}
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Top Watchlist Stocks</h2>

        {topStocks.length === 0 ? (
          <p className={styles.note}>
            Your watchlist is empty — add stocks from Search to see them here.
          </p>
        ) : (
          <div className={styles.stockList}>
            {topStocks.map(stock => (
              <div
                key={stock.ticker}
                className={styles.stockRow}
                onClick={() => navigate(`/stocks/${stock.ticker}`)}
              >
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
                </div>
              </div>
            ))}
          </div>
        )}

        <p className={styles.note}>
          Stat cards computed from watchlist state · clicking a stock row navigates to /stocks/:ticker · best performer = highest % change
        </p>

      </main>
    </div>
  )
}

export default Dashboard
