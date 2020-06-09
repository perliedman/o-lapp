import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar () {
  return <nav className="navbar is-info is-spaced" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <Link className="navbar-item" to="/">
        <div>
          <span className="is-size-4 has-text-weight-bold">o-Lapp</span><br/>
          Digital närvarolista för orienterare
        </div>
      </Link>

      <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" className="navbar-menu">
      <div className="navbar-start">
      </div>

      <div className="navbar-end">
        <div className="navbar-item">
          <div className="buttons">
            <a className="button is-success">
              <strong>Registrera dig</strong>
            </a>
            <a className="button is-light">
              Logga in
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
}