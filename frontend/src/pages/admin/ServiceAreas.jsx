import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceAreaAPI } from '../../api';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiPower } from 'react-icons/fi';
import './Admin.css';

export const ServiceAreas = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingArea, setDeletingArea] = useState(null);

  useEffect(() => { fetchAreas(); }, [pagination.page, search]);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await serviceAreaAPI.getAll({ page: pagination.page, limit: 10, search });
      setAreas(res.data.serviceAreas);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      }));
    } catch {
      toast.error('Failed to load service areas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await serviceAreaAPI.delete(deletingArea.id);
      toast.success('Service area deleted');
      setDeleteDialog(false);
      fetchAreas();
    } catch (error) {
      toast.error(error.message || 'Failed to delete service area');
    }
  };

  const toggleActive = async (area) => {
    try {
      await serviceAreaAPI.update(area.id, { is_active: !area.is_active });
      toast.success(area.is_active ? 'Service area deactivated' : 'Service area activated');
      fetchAreas();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Service Areas</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/service-areas/new')}>
          <FiPlus /> Add Service Area
        </button>
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search service areas..." />
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : areas.length === 0 ? (
        <div className="empty-state">
          <FiMapPin className="empty-state-icon" />
          <p>No service areas found</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/service-areas/new')}>Create your first service area</button>
        </div>
      ) : (
        <>
          <div className="catalog-grid">
            {areas.map((area) => (
              <div key={area.id} className="catalog-card service-area-card">
                <div className="catalog-card-image">
                  <div className="catalog-card-image-placeholder">
                    <FiMapPin />
                  </div>
                </div>
                <div className="catalog-card-body">
                  <div className="catalog-card-header">
                    <h3 className="catalog-card-name">{area.name}</h3>
                    <div className="catalog-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon btn-icon-sm" onClick={() => navigate(`/admin/service-areas/${area.id}/edit`)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon btn-icon-sm btn-icon-danger" onClick={() => { setDeletingArea(area); setDeleteDialog(true); }} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="catalog-card-desc">
                    <FiMapPin size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                    {area.radius_km} km radius
                  </div>
                  <div className="catalog-card-stats">
                    <span>{area.services?.length || 0} services</span>
                    <button
                      className="status-toggle-btn"
                      onClick={(e) => { e.stopPropagation(); toggleActive(area); }}
                      title={area.is_active ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <span className={`status-toggle ${area.is_active ? 'status-active' : 'status-inactive'}`}>
                        {area.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </div>
                  {area.services?.length > 0 && (
                    <div className="service-area-services-list">
                      {area.services.slice(0, 4).map((s) => (
                        <span key={s.id} className="subcategory-pill">{s.name}</span>
                      ))}
                      {area.services.length > 4 && (
                        <span className="subcategory-pill">+{area.services.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))} />
        </>
      )}

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Service Area"
        message={`Are you sure you want to delete "${deletingArea?.name}"? This will remove all service associations.`}
        confirmText="Delete"
        danger
      />
    </div>
  );
};
