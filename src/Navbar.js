import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { store } from "./store";
import Button from "./ui/Button";
import "./Navbar.css";

export default function Navbar() {
  const {
    state: { user, auth },
  } = useContext(store);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="m-1">
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <Link to="/">
            <div>o-Lapp</div>
          </Link>

          <a
            role="button"
            className={`navbar-burger burger ${menuOpen ? "is-active" : ""}`}
            aria-label="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={`navbar-menu ${menuOpen ? "is-active" : ""}`}>
          <div>
            {user && (
              <div className="flex flex-row">
                <div className="navbar-item">{user.email}</div>
                <Button onClick={() => auth.signOut()}>Logga ut</Button>
              </div>
            )}
            <div className="navbar-item">
              <div className="buttons">
                {!user && (
                  <Link className="button is-success" to="/signin">
                    <strong>Logga In</strong>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
