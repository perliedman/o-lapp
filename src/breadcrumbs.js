import React from 'react'
import { Link } from 'react-router-dom'

export default function Breadcrumbs({ crumbs }) {
  return <nav className="breadcrumb" aria-label="breadcrumbs">
    <ul>
      {crumbs.map(([url, label], i) => <li key={url} className={i === crumbs.length - 1 ? 'is-active' : null}>
        <Link to={url}>{label}</Link>
      </li>)}
    </ul>
  </nav>
}