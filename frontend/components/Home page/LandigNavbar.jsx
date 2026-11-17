import React from 'react'
import { Link } from 'react-router-dom'
import './LandingNavbar.css'

function LandingNavbar() {
  return (
    <nav className="navbar">

      <h2 className="logo">FRAGRANCE</h2>

      <div className="collections">
        <Link to="/">All Shop</Link>
        <Link to="/mens">Men's</Link>
        <Link to="/womens">Women's</Link>
        <Link to="/unisex">Unisex</Link>
        <Link to="/attars">Attars</Link>
        <Link to="/body-mists">Body Mists</Link>
        <Link to="/gift-sets">Gift Sets</Link>
      </div>

      <div className="auth-buttons">
        <Link to="/login" className="login-btn">Login</Link>
        <Link to="/signup" className="signup-btn">Sign Up</Link>
      </div>

    </nav>
  )
}

export default LandingNavbar