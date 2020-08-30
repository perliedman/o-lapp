import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import { store } from './store'

export default function Navbar () {
  const { state: { user, auth } } = useContext(store)
  const [menuOpen, setMenuOpen] = useState(false) 

  return <nav className="navbar is-fixed-top is-info is-spaced" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <Link className="navbar-item" to="/">
        <div>
          <span className="is-size-4 has-text-weight-bold">o-Lapp</span><br/>
        </div>
      </Link>

      <a role="button" className={`navbar-burger burger ${menuOpen ? 'is-active' : ''}`} aria-label="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div className={`navbar-menu ${menuOpen ? 'is-active' : ''}`}>
      <div className="navbar-start">
      </div>

      <div className="navbar-end">
        {user && <div className="navbar-item has-dropdown is-hoverable">
          <a className="navbar-link">
            {user.email}
          </a>
          <div className="navbar-dropdown">
            <a className="navbar-item" onClick={() => auth.signOut()}>Logga ut</a>
          </div>
        </div>}
        <div className="navbar-item">
          <div className="buttons">
            {!user && <Link className="button is-success" to="/signin">
              <strong>Logga In</strong>
            </Link>}
          </div>
        </div>
      </div>
    </div>
  </nav>
}