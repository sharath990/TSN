import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceAreaAPI, serviceAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiMapPin, FiArrowLeft, FiSearch, FiLoader } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Admin.css';

const PHOTON_API = 'https://photon.komoot.io/api';
const BANGALORE_CENTER = [13.0639, 77.5760];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const ServiceAreaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);
  const searchRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    center_lat: BANGALORE_CENTER[0],
    center_lng: BANGALORE_CENTER[1],
    radius_km: 10,
    service_ids: [],
  });

  const updateMarkerAndCircle = useCallback((lat, lng, radius) => {
    if (!mapInstance.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setForm((prev) => ({ ...prev, center_lat: pos.lat, center_lng: pos.lng }));
      });
    }

    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]).setRadius(radius * 1000);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: radius * 1000,
        color: '#004250',
        fillColor: '#004250',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapInstance.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: BANGALORE_CENTER,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    mapInstance.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setForm((prev) => ({ ...prev, center_lat: lat, center_lng: lng }));
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.invalidateSize();
  });

  useEffect(() => {
    updateMarkerAndCircle(form.center_lat, form.center_lng, form.radius_km);
  }, [form.center_lat, form.center_lng, form.radius_km, updateMarkerAndCircle]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceAPI.getAll({ limit: 100 });
        setAllServices(res.data.services);
      } catch {
        toast.error('Failed to load services');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    const fetchArea = async () => {
      try {
        const res = await serviceAreaAPI.getById(id);
        if (cancelled) return;
        const area = res.data.serviceArea;
        const lat = parseFloat(area.center_lat);
        const lng = parseFloat(area.center_lng);
        const radius = parseFloat(area.radius_km);
        setForm({
          name: area.name,
          center_lat: lat,
          center_lng: lng,
          radius_km: radius,
          service_ids: area.services?.map((s) => s.id) || [],
        });
        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 14);
        }
      } catch {
        toast.error('Failed to load service area');
        navigate('/admin/service-areas');
      }
    };
    fetchArea();
    return () => { cancelled = true; };
  }, [id, isEdit, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${PHOTON_API}?q=${encodeURIComponent(query.trim())}&limit=5&lang=en&countrycode=in`
        );
        const data = await res.json();
        const results = (data.features || []).map((f) => {
          const p = f.properties;
          const parts = [];
          if (p.housenumber && p.street) parts.push(`${p.housenumber} ${p.street}`);
          else if (p.street) parts.push(p.street);
          else if (p.name) parts.push(p.name);
          if (p.city || p.town || p.village) parts.push(p.city || p.town || p.village);
          if (p.state) parts.push(p.state);
          return {
            label: parts.join(', '),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        });
        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSearchSelect = (result) => {
    setForm((prev) => ({ ...prev, center_lat: result.lat, center_lng: result.lng }));
    setSearchQuery(result.label);
    setSearchResults([]);
    setShowResults(false);
    if (mapInstance.current) {
      mapInstance.current.setView([result.lat, result.lng], 14);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }));
  };

  const handleSelectAllServices = () => {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.length === allServices.length ? [] : allServices.map((s) => s.id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter an area name');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        center_lat: form.center_lat,
        center_lng: form.center_lng,
        radius_km: form.radius_km,
        service_ids: form.service_ids,
      };
      if (isEdit) {
        await serviceAreaAPI.update(id, data);
        toast.success('Service area updated');
      } else {
        await serviceAreaAPI.create(data);
        toast.success('Service area created');
      }
      navigate('/admin/service-areas');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="service-area-form-page">
      <div className="saf-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/service-areas')}>
          <FiArrowLeft /> Back
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>{isEdit ? 'Edit Service Area' : 'Add Service Area'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="saf-layout">
        {/* Left: Map */}
        <div className="saf-map-section">
          <div className="saf-search-wrapper" ref={searchRef}>
            <FiSearch className="saf-search-icon" />
            <input
              type="text"
              className="form-input saf-search-input"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {searching && <FiLoader className="saf-search-spinner" />}
            {showResults && searchResults.length > 0 && (
              <div className="saf-search-results">
                {searchResults.map((r, i) => (
                  <button key={i} type="button" className="saf-search-result" onClick={() => handleSearchSelect(r)}>
                    <FiMapPin size={12} /> {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div ref={mapRef} className="saf-map" />
          <div className="saf-map-hint">Click on the map to place a pin, or drag the pin to adjust</div>
        </div>

        {/* Right: Form */}
        <div className="saf-form-section">
          <div className="saf-form-card">
            <h3 className="saf-form-card-title">Area Details</h3>

            <div className="form-group">
              <label className="form-label">Area Name</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Yelahanka, HSR Layout"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Radius: {form.radius_km} km</label>
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.5"
                value={form.radius_km}
                onChange={(e) => setForm({ ...form, radius_km: parseFloat(e.target.value) })}
                className="saf-radius-slider"
              />
              <div className="saf-radius-labels">
                <span>0.5 km</span>
                <span>50 km</span>
              </div>
            </div>

            <div className="saf-coords-display">
              <span>Lat: {form.center_lat.toFixed(6)}</span>
              <span>Lng: {form.center_lng.toFixed(6)}</span>
            </div>
          </div>

          <div className="saf-form-card">
            <div className="saf-services-header">
              <h3 className="saf-form-card-title" style={{ margin: 0 }}>Services</h3>
              <button type="button" className="btn btn-text btn-sm" onClick={handleSelectAllServices}>
                {form.service_ids.length === allServices.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="saf-service-list">
              {allServices.map((svc) => (
                <label key={svc.id} className={`booking-subcategory-checkbox ${form.service_ids.includes(svc.id) ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.service_ids.includes(svc.id)}
                    onChange={() => handleServiceToggle(svc.id)}
                  />
                  <span className="booking-subcategory-info">
                    <span className="booking-subcategory-name">{svc.name}</span>
                  </span>
                </label>
              ))}
            </div>
            <span className="text-muted">{form.service_ids.length} of {allServices.length} selected</span>
          </div>

          <div className="saf-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/service-areas')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Service Area' : 'Create Service Area'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
