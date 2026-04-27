import React from 'react'
import ReactDOM from 'react-dom/client'
import { SearchApp } from './App'
import '../shared/globals.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SearchApp />
  </React.StrictMode>
)
