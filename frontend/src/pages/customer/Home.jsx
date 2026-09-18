import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../../api';
import {
  FiArrowRight, FiCheckCircle, FiShield,
  FiHome, FiTool, FiLock, FiGrid, FiZap, FiDroplet,
  FiPhone, FiStar, FiUsers, FiBriefcase, FiClock
} from 'react-icons/fi';
import slider1 from '../../assets/slider-1.jpg';
import slider2 from '../../assets/slider-2.jpg';
import slider3 from '../../assets/slider-3.jpg';
import './Home.css';

const heroSlides = [slider1, slider2, slider3];

const categoryIcons = {
  'Housekeeping Services': FiHome,
  'Technical Services': FiTool,
  'Security Services': FiLock,
  'Landscaping Services': FiGrid,
  'Pest Control': FiZap,
  'Deep Cleaning': FiDroplet,
  'Plumbing': FiDroplet,
  'Other / Customized Services': FiBriefcase,
};

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };
    const el = cardRef.current;
    if (el) el.addEventListener('mousemove', handleMouseMove);
    return () => { if (el) el.removeEventListener('mousemove', handleMouseMove); };
  }, [loading]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll({ limit: 8 });
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="home-page">

      {/* ===================== HERO ===================== */}
      <section className="hero">
        {/* Background slider */}
        <div className="hero-bg-slider">
          {heroSlides.map((src, i) => (
            <div
              key={i}
              className={`hero-bg-slide ${i === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          <div className="hero-bg-overlay" />
        </div>

        <div className="container hero-container">
          {/* Floating particles */}
          <div className="hero-particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`hero-particle hero-particle-${i + 1}`} />
            ))}
          </div>

          <div className="hero-grid">
            {/* Left — text + actions */}
            <div className="hero-left">
              <div className="hero-badge">
                <FiStar className="hero-badge-icon" />
                <span>Trusted by 500+ customers in Bengaluru</span>
              </div>

              <h1 className="hero-title">
                Professional Home<br />
                <span className="hero-title-accent">
                  <span className="hero-title-shimmer">Services</span>
                </span>
                <br />at Your Doorstep
              </h1>

              <p className="hero-subtitle">
                From deep cleaning to maintenance — book trusted, verified professionals
                for every need. Quality guaranteed.
              </p>

              <div className="hero-actions">
                <Link to="/services" className="btn btn-hero-primary">
                  Book a Service <FiArrowRight />
                </Link>
                <a href="tel:+919606484586" className="btn btn-hero-outline">
                  <FiPhone /> Call Now
                </a>
              </div>

              {/* Slide indicators */}
              <div className="hero-indicators">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`hero-indicator ${i === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right — category card with 3D tilt */}
            <div className="hero-right">
              <div
                className="hero-category-glow"
                style={{
                  transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
                }}
              />
              <div
                ref={cardRef}
                className="hero-category-card-wrapper"
                style={{
                  transform: `perspective(800px) rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 3}deg)`,
                }}
              >
                <div className="hero-category-border" />
                <div className="hero-category-card">
                  <div className="hero-category-grid">
                    {categories.slice(0, 8).map((category, idx) => {
                      const IconComponent = categoryIcons[category.name] || FiBriefcase;
                      return (
                        <Link
                          to={`/services?category=${category.id}`}
                          key={category.id}
                          className="hero-category-item"
                          style={{ animationDelay: `${0.4 + idx * 0.06}s` }}
                        >
                          <div className="hero-category-icon">
                            {category.image ? (
                              <img src={`/uploads/categories/${category.image}`} alt={category.name} />
                            ) : (
                              <IconComponent />
                            )}
                            <div className="hero-category-hover-ring" />
                          </div>
                          <span className="hero-category-name">{category.name}</span>
                          <span className="hero-category-arrow"><FiArrowRight /></span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE US ===================== */}
      <section className="section section-why">
        <div className="why-bg-pattern" />
        <div className="container">
          <div className="why-header">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="why-title">
              We Deliver <span className="highlight">Excellence</span> in Every Service
            </h2>
            <p className="why-subtitle">
              TSN Facility Services is committed to providing top-quality facility management
              solutions. With years of experience and a team of verified professionals,
              we ensure your space shines.
            </p>
          </div>

          <div className="why-features">
            <div className="why-feature">
              <div className="why-feature-icon-wrap">
                <FiShield className="why-feature-icon" />
                <div className="why-feature-icon-ring" />
              </div>
              <div className="why-feature-content">
                <h3>Verified Professionals</h3>
                <p>All our service providers are background-checked and certified</p>
              </div>
            </div>
            <div className="why-feature">
              <div className="why-feature-icon-wrap">
                <FiClock className="why-feature-icon" />
                <div className="why-feature-icon-ring" />
              </div>
              <div className="why-feature-content">
                <h3>On-Time Guarantee</h3>
                <p>We respect your time — punctual service, every time</p>
              </div>
            </div>
            <div className="why-feature">
              <div className="why-feature-icon-wrap">
                <FiCheckCircle className="why-feature-icon" />
                <div className="why-feature-icon-ring" />
              </div>
              <div className="why-feature-content">
                <h3>Quality Assured</h3>
                <p>100% satisfaction guaranteed or your money back</p>
              </div>
            </div>
            <div className="why-feature">
              <div className="why-feature-icon-wrap">
                <FiStar className="why-feature-icon" />
                <div className="why-feature-icon-ring" />
              </div>
              <div className="why-feature-content">
                <h3>Top Rated</h3>
                <p>Consistently 4.8+ ratings from hundreds of happy customers</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">
              Book your first service today and experience the TSN difference
            </p>
            <div className="cta-actions">
              <Link to="/services" className="btn btn-secondary btn-lg">
                Book a Service <FiArrowRight />
              </Link>
              <a href="tel:+919606484586" className="btn btn-outline-light btn-lg">
                <FiPhone /> Call Us Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
