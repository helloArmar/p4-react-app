import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const navLinks = [
  { label: 'Dashboard', short: 'Dash',   to: '/dashboard' },
  { label: 'Search',    short: 'Search', to: '/search' },
  { label: 'Watchlist', short: 'Watch',  to: '/watchlist' },
  { label: 'Contact',   short: 'Contact',to: '/contact' },
]

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getNavClass = ({ isActive }) =>
    isActive ? styles.navActive : styles.navLink

  const getDrawerClass = ({ isActive }) =>
    isActive ? styles.drawerActive : styles.drawerLink

  return (
    <>
      <nav className={styles.navbar}>

        <ul className={styles.navList}>
          {navLinks.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={getNavClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.navFull}>{link.label}</span>
                <span className={styles.navShort}>{link.short}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger — visible on mobile only */}
        <button
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className={styles.drawer}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={getDrawerClass}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}

export default Navbar
