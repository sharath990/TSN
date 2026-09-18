import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import tsnLogo from '../../assets/TSN-Facility-Services-Footer-Logo.svg';
import './Layout.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-col">
            <Link to="/" className="footer-logo">
              <img src={tsnLogo} alt="TSN Facility Services" className="footer-logo-img" />
            </Link>
            <p className="footer-about">
              Professional facility services for homes and businesses.
              Quality service, easy booking, trusted professionals.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" className="social-link" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" className="social-link" aria-label="Twitter"><FiTwitter /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/bookings">My Bookings</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Our Services</h4>
            <ul className="footer-links">
              <li><Link to="/services?category=1">Housekeeping</Link></li>
              <li><Link to="/services?category=2">Technical Services</Link></li>
              <li><Link to="/services?category=4">Landscaping</Link></li>
              <li><Link to="/services?category=7">Plumbing</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FiPhone />
                <a href="tel:+919606484586">+91 96064 84586</a>
              </li>
              <li>
                <FiMail />
                <a href="mailto:tsnfacilityservices@gmail.com">tsnfacilityservices@gmail.com</a>
              </li>
              <li>
                <FiMapPin />
                <span>TSN Facility Services, 202, Kengel Hanumanthiah Rd, Hanumagiri, Nisarga Layout, Chikkalasandra, Bengaluru, Karnataka 560061</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} TSN Facility Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
