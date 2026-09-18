import { useState, useEffect } from 'react';
import { categoryAPI, subcategoryAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { getImageUrl } from '../../utils/images';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiChevronLeft,
  FiGrid, FiDollarSign, FiImage
} from 'react-icons/fi';
import './Admin.css';

export const Catalog = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);

  // Subcategory modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', description: '', price: '' });

  // Delete dialogs
  const [deleteCatId, setDeleteCatId] = useState(null);
  const [deleteSubId, setDeleteSubId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (expandedCategory) {
      const loadSubs = async () => {
        try {
          const res = await subcategoryAPI.getAll({ category_id: expandedCategory.id, limit: 50 });
          if (!cancelled) setSubcategories(res.data.subcategories);
        } catch (error) {
          if (!cancelled) toast.error('Failed to load subcategories');
        }
      };
      loadSubs();
    }
    return () => { cancelled = true; };
  }, [expandedCategory]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll({ limit: 50, search });
      setCategories(res.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
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
  };

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await categoryAPI.getAll({ limit: 50, search });
        if (!cancelled) setCategories(res.data.categories);
      } catch (error) {
        if (!cancelled) toast.error('Failed to load categories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search]);

  // ─── Category Image Handling ──────────────────────────
  const handleCatImageChange = (e) => {
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
    setCatImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCatImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeCatImage = () => {
    setCatImageFile(null);
    setCatImagePreview(null);
  };

  // ─── Category CRUD ───────────────────────────────────
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCatForm({ name: cat.name, description: cat.description || '' });
      setCatImagePreview(cat.image ? getImageUrl(`/uploads/categories/${cat.image}`) : null);
    } else {
      setEditingCategory(null);
      setCatForm({ name: '', description: '' });
      setCatImagePreview(null);
    }
    setCatImageFile(null);
    setCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory && !catImageFile) {
      toast.error('Category image is required');
      return;
    }
    try {
      const submitData = new FormData();
      submitData.append('name', catForm.name);
      submitData.append('description', catForm.description);
      if (catImageFile) {
        submitData.append('image', catImageFile);
      }

      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, submitData);
        toast.success('Category updated');
      } else {
        await categoryAPI.create(submitData);
        toast.success('Category created');
      }
      setCatModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const confirmDeleteCategory = async () => {
    try {
      await categoryAPI.delete(deleteCatId);
      toast.success('Category deleted');
      if (expandedCategory?.id === deleteCatId) {
        setExpandedCategory(null);
        setSubcategories([]);
      }
      setDeleteCatId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
      setDeleteCatId(null);
    }
  };

  // ─── Subcategory CRUD ────────────────────────────────
  const handleOpenSubModal = (sub = null) => {
    if (sub) {
      setEditingSub(sub);
      setSubForm({ name: sub.name, description: sub.description || '', price: sub.price });
    } else {
      setEditingSub(null);
      setSubForm({ name: '', description: '', price: '' });
    }
    setSubModalOpen(true);
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...subForm, category_id: expandedCategory.id };
      if (editingSub) {
        await subcategoryAPI.update(editingSub.id, payload);
        toast.success('Subcategory updated');
      } else {
        await subcategoryAPI.create(payload);
        toast.success('Subcategory created');
      }
      setSubModalOpen(false);
      fetchSubcategories(expandedCategory.id);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const confirmDeleteSubcategory = async () => {
    try {
      await subcategoryAPI.delete(deleteSubId);
      toast.success('Subcategory deleted');
      setDeleteSubId(null);
      fetchSubcategories(expandedCategory.id);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
      setDeleteSubId(null);
    }
  };

  const handleToggleSubStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'inactive' : 'active';
    try {
      await subcategoryAPI.update(sub.id, { status: newStatus });
      toast.success(`Option ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchSubcategories(expandedCategory.id);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleToggleCatStatus = async (cat) => {
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await categoryAPI.update(cat.id, { status: newStatus });
      toast.success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Catalog</h1>
        <button className="btn btn-primary" onClick={() => handleOpenCatModal()}>
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search categories..." />
        <span className="data-toolbar-info">{categories.length} categories</span>
      </div>

      {/* ─── Expanded Subcategory View ──────────────────── */}
      {expandedCategory ? (
        <div className="catalog-expanded">
          <div className="catalog-expanded-header">
            <button className="btn btn-outline btn-sm" onClick={() => { setExpandedCategory(null); setSubcategories([]); }}>
              <FiChevronLeft /> All Categories
            </button>
            <div className="catalog-expanded-title">
              {expandedCategory.image ? (
                <img src={`/uploads/categories/${expandedCategory.image}`} alt="" className="catalog-expanded-thumb" />
              ) : (
                <div className="catalog-expanded-icon"><FiGrid /></div>
              )}
              <h2>{expandedCategory.name}</h2>
              <Badge status={expandedCategory.status} />
            </div>
            <div className="catalog-expanded-actions">
              <button className="btn btn-outline btn-sm" onClick={() => handleOpenCatModal(expandedCategory)}>
                <FiEdit2 /> Edit
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenSubModal()}>
                <FiPlus /> Add Option
              </button>
            </div>
          </div>

          {expandedCategory.description && (
            <p className="catalog-expanded-desc">{expandedCategory.description}</p>
          )}

          {subcategories.length === 0 ? (
            <div className="catalog-empty-subs">
              <FiDollarSign />
              <h3>No pricing options yet</h3>
              <p>Add subcategories with prices so customers can book this service type.</p>
              <button className="btn btn-primary" onClick={() => handleOpenSubModal()}>
                <FiPlus /> Add First Option
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Services</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map((sub) => (
                    <tr key={sub.id}>
                      <td className="font-medium">{sub.name}</td>
                      <td>{sub.description || '-'}</td>
                      <td className="catalog-price">₹{Number(sub.price).toFixed(2)}</td>
                      <td>
                        {sub.linkedServices?.length > 0 ? (
                          <div className="subcategory-pills">
                            {sub.linkedServices.map((svc) => (
                              <span key={svc.id} className="subcategory-pill">{svc.name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <button className="status-toggle-btn" onClick={() => handleToggleSubStatus(sub)} title={`Click to ${sub.status === 'active' ? 'deactivate' : 'activate'}`}>
                          <Badge status={sub.status} />
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" onClick={() => handleOpenSubModal(sub)}><FiEdit2 /></button>
                          <button className="btn-icon btn-icon-danger" onClick={() => setDeleteSubId(sub.id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ─── Category Grid ──────────────────────────────── */
        loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <div className="catalog-empty">
            <FiGrid />
            <h3>No categories yet</h3>
            <p>Create your first category to start building your service catalog.</p>
            <button className="btn btn-primary" onClick={() => handleOpenCatModal()}>
              <FiPlus /> Add Category
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="catalog-card"
                onClick={() => setExpandedCategory(cat)}
              >
                <div className="catalog-card-image">
                  {cat.image ? (
                    <img src={getImageUrl(`/uploads/categories/${cat.image}`)} alt={cat.name} />
                  ) : (
                    <div className="catalog-card-image-placeholder">
                      <FiGrid />
                    </div>
                  )}
                </div>
                <div className="catalog-card-body">
                  <div className="catalog-card-header">
                    <h3 className="catalog-card-name">{cat.name}</h3>
                    <div className="catalog-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon btn-icon-sm" onClick={() => handleOpenCatModal(cat)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon btn-icon-sm btn-icon-danger" onClick={() => setDeleteCatId(cat.id)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  {cat.description && <p className="catalog-card-desc">{cat.description}</p>}
                  <div className="catalog-card-stats">
                    <span>{cat.subcategoryCount || 0} options</span>
                    <span>{cat.serviceCount || 0} services</span>
                    <button className="status-toggle-btn" onClick={(e) => { e.stopPropagation(); handleToggleCatStatus(cat); }} title={`Click to ${cat.status === 'active' ? 'deactivate' : 'activate'}`}>
                      <Badge status={cat.status} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ─── Category Modal ──────────────────────────────── */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleCatSubmit}>
          <div className="form-group">
            <label className="form-label">Category Photo *</label>
            <div className="image-upload-area">
              {catImagePreview ? (
                <div className="image-preview">
                  <img src={catImagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={removeCatImage}
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
                    onChange={handleCatImageChange}
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
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="form-input"
              placeholder="e.g., Housekeeping Services"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="form-input"
              rows={3}
              placeholder="Brief description of this category"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setCatModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Subcategory Modal ───────────────────────────── */}
      <Modal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={editingSub ? 'Edit Pricing Option' : 'Add Pricing Option'}
      >
        <form onSubmit={handleSubSubmit}>
          <div className="catalog-sub-hint">
            Adding to: <strong>{expandedCategory?.name}</strong>
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              className="form-input"
              placeholder="e.g., Bathroom Cleaning"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={subForm.description}
              onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
              className="form-input"
              rows={3}
              placeholder="What's included in this option"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={subForm.price}
              onChange={(e) => setSubForm({ ...subForm, price: e.target.value })}
              className="form-input"
              placeholder="0.00"
              required
            />
            <span className="form-hint">This price will be shown to customers during booking</span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setSubModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingSub ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Dialogs ──────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={(() => {
          const cat = categories.find((c) => c.id === deleteCatId);
          if (cat?.subcategoryCount > 0) return `This category has ${cat.subcategoryCount} pricing option(s). Delete them first before deleting the category.`;
          if (cat?.serviceCount > 0) return `This category has ${cat.serviceCount} service(s) linked. Remove them first before deleting the category.`;
          return 'Are you sure you want to delete this category?';
        })()}
        confirmText="Delete"
        danger
      />

      <ConfirmDialog
        isOpen={!!deleteSubId}
        onClose={() => setDeleteSubId(null)}
        onConfirm={confirmDeleteSubcategory}
        title="Delete Pricing Option"
        message={(() => {
          const sub = subcategories.find((s) => s.id === deleteSubId);
          if (sub?.serviceCount > 0) return `"${sub.name}" is linked to ${sub.serviceCount} service(s). Unlink it first before deleting.`;
          return `Are you sure you want to delete "${sub?.name || 'this option'}" (₹${Number(sub?.price || 0).toFixed(2)})?`;
        })()}
        confirmText="Delete"
        danger
      />
    </div>
  );
};
