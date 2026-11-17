
import React from 'react';
import '../../Style/Footer.css';

import {
    MessageCircle,
    Globe,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-content">

                {/* CONTAINER 1 - BRAND */}
                <div className="footer-container footer-brand">

                    <h2>FRAGRANCE</h2>

                    <p>
                        Discover your signature scent with FRAGRANCE.
                        Explore captivating perfumes, elegant attars
                        and refreshing body mists crafted to express
                        your individuality.
                    </p>

                    <div className="footer-social-icons">

                        <a href="https://www.instagram.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram">
                            <Globe />
                        </a>

                        <a href="https://wa.me/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp">
                            <MessageCircle />
                        </a>

                        <a href="https://www.facebook.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook">
                            <Globe />
                        </a>

                        <a href="https://twitter.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter">
                            <MessageCircle />
                        </a>

                    </div>

                </div>


                {/* CONTAINER 2 - LINKS */}
                <div className="footer-container footer-links-container">

                    <div className="footer-link-column">

                        <h3>Quick Links</h3>

                        <a href="/">Home</a>
                        <a href="/mens">Men's Collection</a>
                        <a href="/womens">Women's Collection</a>
                        <a href="/unisex">Unisex Collection</a>

                    </div>

                    <div className="footer-link-column">

                        <h3>Our Categories</h3>

                        <a href="/attars">Attars</a>
                        <a href="/body-mists">Body Mists</a>
                        <a href="/gift-sets">Gift Sets</a>
                        <a href="/">All Products</a>

                    </div>

                </div>


                {/* CONTAINER 3 - CONTACT */}
                <div className="footer-container footer-contact">

                    <h3>Contact Information</h3>

                    <p>
                        <MapPin />
                        <span>Kerala, India</span>
                    </p>

                    <p>
                        <Mail />
                        <span>support@fragrance.com</span>
                    </p>

                    <p>
                        <Phone />
                        <span>+91 XXXXX XXXXX</span>
                    </p>

                </div>

            </div>


            {/* COPYRIGHT */}
            <div className="footer-bottom">

                <p>© 2026 FRAGRANCE. All rights reserved.</p>

                <p>Crafted for fragrance lovers.</p>

            </div>

        </footer>
    );
}

export default Footer;
