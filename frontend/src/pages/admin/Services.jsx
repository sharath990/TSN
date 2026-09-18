import { useState, useEffect } from 'react';
import { serviceAPI, categoryAPI, subcategoryAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { SortableHeader } from '../../components/common/SortableHeader';
import { Pagination } from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import './Admin.css';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category_id: '', subcategory_ids: [], description: '', duration: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [pagination.page, search, sort, order]);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

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
      const res = await serviceAPI.getAll(params);
      setServices(res.data.services);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      }));
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll({ limit: 50 });
      setCategories(res.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await subcategoryAPI.getAll({ category_id: categoryId, limit: 50 });
      setSubcategories(res.data.subcategories);
    } catch (error) {
      toast.error('Failed to load subcategories');
    }
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

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category_id: service.category_id,
        subcategory_ids: service.subcategories?.map((s) => s.id) || [],
        description: service.description || '',
        duration: service.duration,
      });
      if (service.category_id) {
        fetchSubcategories(service.category_id);
      }
      if (service.image) {
        setImagePreview(`/uploads/services/${service.image}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setEditingService(null);
      setFormData({ name: '', category_id: '', subcategory_ids: [], description: '', duration: '' });
      setSubcategories([]);
      setImagePreview(null);
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({ ...formData, category_id: categoryId, subcategory_ids: [] });
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategoryToggle = (subId) => {
    setFormData((prev) => {
      const current = prev.subcategory_ids;
      const updated = current.includes(subId)
        ? current.filter((id) => id !== subId)
        : [...current, subId];
      return { ...prev, subcategory_ids: updated };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Only JPEG, PNG and GIF images are allowed');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingService && !imageFile) {
      toast.error('Service image is required');
      return;
    }
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category_id', formData.category_id);
      formData.subcategory_ids.forEach((id) => {
        submitData.append('subcategory_ids', id);
      });
      submitData.append('description', formData.description);
      submitData.append('duration', formData.duration);
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingService) {
        await serviceAPI.update(editingService.id, submitData);
        toast.success('Service updated');
      } else {
        await serviceAPI.create(submitData);
        toast.success('Service created');
      }
      setModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await serviceAPI.delete(deleteId);
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Add Service
        </button>
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search services..." />
        <span className="data-toolbar-info">{pagination.total} total</span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <SortableHeader column="name" label="Name" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <th>Category</th>
                <th>Subcategories</th>
                <SortableHeader column="duration" label="Duration" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    {service.image ? (
                      <img
                        src={`/uploads/services/${service.image}`}
                        alt={service.name}
                        className="service-thumb"
                      />
                    ) : (
                      <div className="service-thumb-placeholder">
                        <FiImage />
                      </div>
                    )}
                  </td>
                  <td className="font-medium">{service.name}</td>
                  <td>{service.category?.name}</td>
                  <td>
                    <div className="subcategory-pills">
                      {service.subcategories?.length > 0 ? (
                        service.subcategories.map((sub) => (
                          <span key={sub.id} className="subcategory-pill">{sub.name} — ₹{Number(sub.price).toFixed(0)}</span>
                        ))
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </div>
                  </td>
                  <td>{service.duration} min</td>
                  <td><Badge status={service.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => handleOpenModal(service)}><FiEdit2 /></button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(service.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Service Photo *</label>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="image-upload-label">
                  <FiImage />
                  <span>Click to upload photo</span>
                  <span className="image-upload-hint">JPEG, PNG or GIF, max 2MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleImageChange}
                    className="image-upload-input"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category_id}
              onChange={handleCategoryChange}
              className="form-input"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {formData.category_id && subcategories.length > 0 && (
            <div className="form-group">
              <label className="form-label">Pricing Options *</label>
              <span className="form-hint">Customers must select at least one to book this service</span>
              <div className="subcategory-checkbox-group">
                {subcategories.map((sub) => (
                  <label key={sub.id} className="subcategory-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.subcategory_ids.includes(sub.id)}
                      onChange={() => handleSubcategoryToggle(sub.id)}
                    />
                    <span>{sub.name}</span>
                    <span className="subcategory-checkbox-price">₹{Number(sub.price).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {formData.category_id && subcategories.length === 0 && (
            <div className="form-group">
              <div className="catalog-empty-subs" style={{ padding: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  No pricing options for this category yet. Create them in the <strong>Catalog</strong> page first.
                </p>
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Duration (min)</label>
            <input
              type="number"
              min="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingService ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        danger
      />
    </div>
  );
};
