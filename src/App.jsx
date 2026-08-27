import { Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Search from './components/Search'
import Watchlist from './components/Watchlist'
import Contact from './components/Contact'
import StockDetails from './components/StockDetails'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/search" element={<Search />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/stocks/:ticker" element={<StockDetails />} />
    </Routes>
  )
}

export default App
