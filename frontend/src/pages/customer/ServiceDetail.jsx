import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceAPI, paymentAPI, serviceAreaAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useCashfree } from '../../hooks/useCashfree';
import { AddressInput } from '../../components/common/AddressInput';
import toast from 'react-hot-toast';
import { FiClock, FiArrowLeft, FiCheck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './Customer.css';

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { initializeCheckout, loading: checkoutLoading } = useCashfree();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [bookingData, setBookingData] = useState({
    booking_date: '',
    booking_time: '',
    address: '',
    notes: '',
    phone: '',
    house_flat: '',
    floor: '',
    landmark: '',
    pincode: '',
  });
  const [coords, setCoords] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setBookingData((prev) => ({ ...prev, phone: user.phone }));
    }
  }, [user]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await serviceAPI.getById(id);
        setService(res.data.service);
      } catch (error) {
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, navigate]);

  const checkAreaAvailability = useCallback(async (lat, lng) => {
    setCheckingAvailability(true);
    try {
      const res = await serviceAreaAPI.check(lat, lng);
      setAvailability(res.data);
      if (!res.data.available) {
        const areaNames = res.data.serviceAreas?.map((a) => a.name).join(', ');
        toast.error(`Service not available in your area${areaNames ? `. We serve: ${areaNames}` : ''}`);
      }
    } catch {
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  }, []);

  const handleAddressChange = (value) => {
    setBookingData({ ...bookingData, address: value });
    setCoords(null);
    setAvailability(null);
  };

  const handleCoordinates = (lat, lng) => {
    setCoords({ lat, lng });
    checkAreaAvailability(lat, lng);
  };

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubcategoryToggle = (subId) => {
    setSelectedSubs((prev) =>
      prev.includes(subId) ? prev.filter((sid) => sid !== subId) : [...prev, subId]
    );
  };

  const totalPrice = service?.subcategories
    ? service.subcategories
        .filter((sub) => selectedSubs.includes(sub.id))
        .reduce((sum, sub) => sum + parseFloat(sub.price), 0)
    : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    if (selectedSubs.length === 0) {
      toast.error('Please select at least one subcategory');
      return;
    }
    if (!bookingData.phone?.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!/^\d{10}$/.test(bookingData.phone.trim())) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    if (!bookingData.house_flat?.trim()) {
      toast.error('House/Flat number is required');
      return;
    }
    if (!bookingData.pincode?.trim()) {
      toast.error('Pincode is required');
      return;
    }
    if (!coords) {
      toast.error('Please select a valid address from the suggestions');
      return;
    }
    if (availability && !availability.available) {
      toast.error('Service is not available in your area');
      return;
    }
    setSubmitting(true);
    try {
      const res = await paymentAPI.createOrder({
        ...bookingData,
        service_id: parseInt(id),
        subcategory_ids: selectedSubs,
        latitude: coords.lat,
        longitude: coords.lng,
      });

      const { payment } = res.data;

      if (!payment.paymentSessionId) {
        toast.error('Payment session could not be created. Please try again.');
        return;
      }

      try {
        const result = await initializeCheckout({
          paymentSessionId: payment.paymentSessionId,
          mode: 'sandbox',
        });

        if (result.error) {
          toast.error('Payment was cancelled or failed.');
          return;
        }
        if (result.paymentDetails) {
          const details = result.paymentDetails;
          if (details.status === 'SUCCESS' || details.status === 'PAID') {
            toast.success('Payment completed!');
            navigate(`/payment/status/${payment.orderId}`);
          } else if (details.status === 'FAILED') {
            toast.error('Payment failed. Your booking has been cancelled.');
            return;
          } else {
            navigate(`/payment/status/${payment.orderId}`);
          }
        } else {
          navigate(`/payment/status/${payment.orderId}`);
        }
      } catch (sdkError) {
        toast.error('Failed to load payment gateway.');
        return;
      }
    } catch (error) {
      const msg = error.message || 'Failed to create booking';
      if (msg.includes('already') || msg.includes('active booking')) {
        toast.error('You already have an active booking for this service on this date.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!service) return null;

  const renderBreadcrumbs = () => {
    return (
      <div className="breadcrumbs">
        <button className="breadcrumb-link" onClick={() => navigate('/services')}>Services</button>
        {service.category && (
          <>
            <span className="breadcrumb-sep">/</span>
            <button
              className="breadcrumb-link"
              onClick={() => navigate(`/services?category=${service.category.id}`)}
            >
              {service.category.name}
            </button>
          </>
        )}
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{service.name}</span>
      </div>
    );
  };

  return (
    <div className="page container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      {renderBreadcrumbs()}

      <div className="service-detail">
        <div className="service-detail-info">
          {service.image && (
            <img
              src={`/uploads/services/${service.image}`}
              alt={service.name}
              className="service-detail-image"
            />
          )}
          <span className="service-category">{service.category?.name}</span>
          <h1 className="service-detail-title">{service.name}</h1>
          <p className="service-detail-description">{service.description}</p>

          <div className="service-detail-meta">
            <div className="meta-item">
              <FiClock />
              <span>{service.duration} minutes</span>
            </div>
          </div>

          {service.subcategories?.length > 0 && (
            <div className="service-subcategories-list">
              <h3>Available Options</h3>
              {service.subcategories.map((sub) => (
                <div key={sub.id} className="service-subcategory-item">
                  <span>{sub.name}</span>
                  <span className="service-subcategory-price">₹{Number(sub.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="service-detail-booking">
          <h2>Book This Service</h2>
          <form onSubmit={handleBooking}>
            {service.subcategories?.length > 0 && (
              <div className="form-group">
                <label className="form-label">Select Options (required)</label>
                <div className="booking-subcategory-checkboxes">
                  {service.subcategories.map((sub) => (
                    <label key={sub.id} className={`booking-subcategory-checkbox ${selectedSubs.includes(sub.id) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedSubs.includes(sub.id)}
                        onChange={() => handleSubcategoryToggle(sub.id)}
                      />
                      <span className="booking-subcategory-info">
                        <span className="booking-subcategory-name">{sub.name}</span>
                        <span className="booking-subcategory-price">₹{Number(sub.price).toFixed(2)}</span>
                      </span>
                      {selectedSubs.includes(sub.id) && <FiCheck className="booking-subcategory-check" />}
                    </label>
                  ))}
                </div>
                {selectedSubs.length > 0 && (
                  <div className="booking-total">
                    <span>Total</span>
                    <span className="booking-total-price">₹{totalPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="booking_date"
                  value={bookingData.booking_date}
                  onChange={handleChange}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time <span className="required">*</span></label>
                <input
                  type="time"
                  name="booking_time"
                  value={bookingData.booking_time}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                name="phone"
                value={bookingData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Contact number"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Address <span className="required">*</span></label>
              <AddressInput
                value={bookingData.address}
                onChange={handleAddressChange}
                onCoordinates={handleCoordinates}
                placeholder="Start typing your address in Yelahanka area..."
              />
              {checkingAvailability && (
                <span className="availability-badge availability-badge-available" style={{ marginTop: '0.5rem' }}>
                  Checking availability...
                </span>
              )}
              {availability && !checkingAvailability && (
                <div className={`availability-badge ${availability.available ? 'availability-badge-available' : 'availability-badge-unavailable'}`} style={{ marginTop: '0.5rem' }}>
                  {availability.available ? (
                    <>
                      <FiCheckCircle className="availability-badge-icon" />
                      <div>
                        <div>Service available — {availability.serviceArea.name} ({availability.distance_km} km away)</div>
                        <div className="availability-badge-info">Within {availability.serviceArea.radius_km} km service area</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiXCircle className="availability-badge-icon" />
                      <div>
                        <div>Service not available in your area</div>
                        <div className="availability-badge-info">
                          We currently serve: {availability.serviceAreas?.map((a) => a.name).join(', ')}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">House / Flat No. <span className="required">*</span></label>
                <input
                  type="text"
                  name="house_flat"
                  value={bookingData.house_flat}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. 42, Flat 5B"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode <span className="required">*</span></label>
                <input
                  type="text"
                  name="pincode"
                  value={bookingData.pincode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. 560001"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Floor No.</label>
                <input
                  type="text"
                  name="floor"
                  value={bookingData.floor}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. 3rd floor"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={bookingData.landmark}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Near Silk Board"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                name="notes"
                value={bookingData.notes}
                onChange={handleChange}
                className="form-input"
                placeholder="Any special requirements..."
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={submitting || checkoutLoading || selectedSubs.length === 0 || (availability && !availability.available)}
            >
              {submitting || checkoutLoading
                ? 'Processing...'
                : availability && !availability.available
                  ? 'Service not available in your area'
                  : selectedSubs.length > 0
                    ? `Pay Now — ₹${totalPrice.toFixed(2)}`
                    : 'Select options to continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
