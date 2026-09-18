import { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import contactBanner from '../../assets/contact-us-banner.png';
import './ContactUs.css';

const MAP_QUERY = encodeURIComponent('202, Kengel Hanumanthiah Rd, Hanumagiri, Nisarga Layout, Chikkalasandra, Bengaluru, Karnataka 560061');

export const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) errs.phone = 'Enter 10-digit number';
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero" style={{ backgroundImage: `url(${contactBanner})` }}>
        <div className="contact-hero-overlay" />
        <div className="container">
          <h1 className="contact-hero-title">Get in Touch</h1>
          <p className="contact-hero-subtitle">
            Have a question or need a service? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Contact cards */}
        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon">
              <FiPhone />
            </div>
            <h3>Call Us</h3>
            <p>Mon - Sat, 9AM to 6PM</p>
            <a href="tel:+919606484586">+91 96064 84586</a>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">
              <FiMail />
            </div>
            <h3>Email Us</h3>
            <p>We reply within 24 hours</p>
            <a href="mailto:tsnfacilityservices@gmail.com">tsnfacilityservices@gmail.com</a>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">
              <FiMapPin />
            </div>
            <h3>Visit Us</h3>
            <p>Bengaluru, Karnataka</p>
            <span>202, Kengel Hanumanthiah Rd, Chikkalasandra</span>
          </div>
        </div>

        <div className="contact-body">
          {/* Form */}
          <div className="contact-form-wrap">
            <h2 className="contact-form-title">Send us a Message</h2>
            <p className="contact-form-desc">Fill out the form below and we'll get back to you shortly.</p>

            {submitted ? (
              <div className="contact-success">
                <FiCheckCircle className="contact-success-icon" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={10}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className={errors.subject ? 'error' : ''}
                    />
                    {errors.subject && <span className="field-error">{errors.subject}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className={errors.message ? 'error' : ''}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary contact-submit-btn">
                  <FiSend /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="contact-sidebar">
            <div className="contact-info-box">
              <h4>Our Location</h4>
              <div className="contact-map">
                <iframe
                  title="TSN Facility Services Location"
                  src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-directions-btn"
              >
                <FiMapPin /> Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
