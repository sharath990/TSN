import './Modal.css';

export const Badge = ({ status }) => {
  const statusConfig = {
    pending_payment: { label: 'Awaiting Payment', className: 'badge-pending' },
    pending: { label: 'Awaiting Confirmation', className: 'badge-pending' },
    confirmed: { label: 'Confirmed', className: 'badge-confirmed' },
    completed: { label: 'Completed', className: 'badge-completed' },
    cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
    rescheduled: { label: 'Rescheduled', className: 'badge-rescheduled' },
    active: { label: 'Active', className: 'badge-confirmed' },
    inactive: { label: 'Inactive', className: 'badge-cancelled' },
  };

  const config = statusConfig[status] || { label: status, className: '' };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};
