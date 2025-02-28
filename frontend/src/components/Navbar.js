import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Context';
import Logo from '../assets/logo';
import '../styles/Navbar.css';

const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Logo size={30} />
          <span className="logo-text">BeeKeeper</span>
          <span className="bee-emoji-logo">🐝</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>

        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/hives" className="nav-link" onClick={() => setMenuOpen(false)}>
              Hives
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/stake" className="nav-link" onClick={() => setMenuOpen(false)}>
              Stake
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/queen-colony" className="nav-link queen-link" onClick={() => setMenuOpen(false)}>
              Queen Bee Colony
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/stats" className="nav-link" onClick={() => setMenuOpen(false)}>
              Stats
            </Link>
          </li>
        </ul>

        <div className="wallet-connect" ref={dropdownRef}>
          {isConnected ? (
            <>
              <div className="bee-dropdown-toggle" onClick={toggleDropdown}>
                <span className="bee-emoji">🐝</span>
              </div>
              {dropdownOpen && (
                <div className="bee-dropdown-menu">
                  <div className="wallet-info">
                    <span className="wallet-address">{formatAddress(account)}</span>
                    <button className="btn btn-disconnect" onClick={disconnectWallet}>
                      BUZZ OFF
                    </button>
                  </div>
                  <div className="dropdown-divider"></div>
                  <ul className="dropdown-nav">
                    <li>
                      <Link to="/" onClick={() => setDropdownOpen(false)}>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/hives" onClick={() => setDropdownOpen(false)}>
                        Hives
                      </Link>
                    </li>
                    <li>
                      <Link to="/stake" onClick={() => setDropdownOpen(false)}>
                        Stake Bees
                      </Link>
                    </li>
                    <li>
                      <Link to="/queen-colony" onClick={() => setDropdownOpen(false)}>
                        Queen Bee Colony
                      </Link>
                    </li>
                    <li>
                      <Link to="/stats" onClick={() => setDropdownOpen(false)}>
                        Stats
                      </Link>
                    </li>
                  </ul>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-socials">
                    <a href="https://t.me/BeeKeeperOfficial" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-telegram"></i>
                    </a>
                    <a href="https://twitter.com/BeeKeeperFi" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://dexscreener.com/bsc/beekeeper" target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-chart-line"></i>
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button className="btn btn-connect" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 