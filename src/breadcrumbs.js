import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

export default function Breadcrumbs({ crumbs }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumbs">
      <ul>
        {[["/", "o-Lapp"]].concat(crumbs).map(([url, label], i) => (
          <li key={url} className={i === crumbs.length ? "is-active" : null}>
            <Link to={url}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
