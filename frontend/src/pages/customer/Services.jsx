import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { categoryAPI, serviceAPI } from '../../api';
import { SearchInput } from '../../components/common/SearchInput';
import { SortableHeader } from '../../components/common/SortableHeader';
import { Pagination } from '../../components/common/Pagination';
import { getImageUrl } from '../../utils/images';
import { FiArrowRight, FiArrowLeft, FiClock, FiBriefcase } from 'react-icons/fi';
import './Customer.css';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll({ limit: 50 });
        setCategories(res.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: 10,
          search,
          sort,
          order,
        };
        if (selectedCategory) params.category_id = selectedCategory;
        const res = await serviceAPI.getAll(params);
        setServices(res.data.services);
        setPagination((prev) => ({
          ...prev,
          totalPages: res.data.pagination.totalPages,
          total: res.data.pagination.total,
        }));
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory, pagination.page, search, sort, order]);

  const handleCategoryFilter = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (column, newOrder) => {
    setSort(column);
    setOrder(newOrder);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="page container">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="page-header">
        <h1 className="page-title">Our Services</h1>
      </div>

      {/* Category Filter */}
      <div className="category-filters">
        <button
          className={`filter-btn ${!selectedCategory ? 'filter-btn-active' : ''}`}
          onClick={() => handleCategoryFilter('')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === String(cat.id) ? 'filter-btn-active' : ''}`}
            onClick={() => handleCategoryFilter(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search services..." />
        <span className="data-toolbar-info">{pagination.total} services found</span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <FiBriefcase size={40} style={{ color: 'var(--color-gray-300)' }} />
          <p>No services found{search ? ` for "${search}"` : ''}</p>
          {search ? (
            <button className="btn btn-outline" onClick={() => setSearch('')} style={{ marginTop: '0.5rem' }}>Clear Search</button>
          ) : selectedCategory ? (
            <button className="btn btn-outline" onClick={() => handleCategoryFilter('')} style={{ marginTop: '0.5rem' }}>View All Categories</button>
          ) : (
            <Link to="/" className="btn btn-outline" style={{ marginTop: '0.5rem' }}>Back to Home</Link>
          )}
        </div>
      ) : (
        <>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-image-wrapper">
                  {service.image ? (
                    <img
                      src={getImageUrl(`/uploads/services/${service.image}`)}
                      alt={service.name}
                      className="service-card-image"
                    />
                  ) : (
                    <div className="service-card-image-placeholder">
                      <FiBriefcase />
                    </div>
                  )}
                  <span className="service-card-badge">{service.category?.name}</span>
                </div>
                <div className="service-card-body">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-meta">
                    <span className="service-duration"><FiClock /> {service.duration} min</span>
                    {service.subcategories?.length > 0 && (
                      <span className="service-price">₹{Math.min(...service.subcategories.map((s) => Number(s.price))).toFixed(0)}+</span>
                    )}
                  </div>
                </div>
                <Link to={`/services/${service.id}`} className="service-card-btn">
                  Book Now <FiArrowRight />
                </Link>
              </div>
            ))}
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};
