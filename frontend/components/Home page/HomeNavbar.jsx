
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingBag, UserRound } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import './HomeNavbar.css'
import UserDropdown from './UserDropdown'
function HomeNavbar() {

  

  const { isAuthenticated } = useSelector((state) => state.auth)


  return (
    <nav className="navbar">

      <h2 className="logo">FRAGRANCE</h2>

      {/* Collection Links */}
      <div className="collections">
        <Link to="/">All Shop</Link>
        <Link to="/mens">Men's</Link>
        <Link to="/womens">Women's</Link>
        <Link to="/unisex">Unisex</Link>
        <Link to="/attars">Attars</Link>
        <Link to="/body-mists">Body Mists</Link>
        <Link to="/gift-sets">Gift Sets</Link>
      </div>

      {/* Customer Icons */}
      <div className="customer-icons">

        <Link to="/search" className="nav-icon" title="Search">
          <Search />
        </Link>

        <Link to="/wishlist" className="nav-icon" title="Wishlist">
          <Heart />
        </Link>

        <Link to="/cart" className="nav-icon" title="Bag">
          <ShoppingBag />
        </Link>

        {isAuthenticated ? (
        <UserDropdown />
          ) : (
              <Link to="/login" className="nav-icon" title="Login">
                  <UserRound />
              </Link>
          )}
      </div>

    </nav>
  )
}

export default HomeNavbar
