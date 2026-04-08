import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import SyncPrices from './components/SyncPrices'
import Dashboard from './components/Dashboard'



function App() {
  const [selected, setSelected] = useState(0)

  return (

    <>
        <div className="hero">
          <div className="hero-content">
            <div className="buttons">
              <button onClick={() => setSelected("sync")}>Sync Prices</button>
              <button onClick={() => setSelected("dashboard")}>Dashboard</button>
            </div>
          </div>
        </div>
      {selected === "sync" && <SyncPrices />}
      {selected === "dashboard" && <Dashboard />}
    </>
  )
}

export default App
