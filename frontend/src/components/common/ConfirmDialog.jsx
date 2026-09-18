import { FiAlertTriangle } from 'react-icons/fi';
import './Modal.css';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog">
          <div className={`confirm-dialog-icon ${danger ? 'confirm-dialog-icon-danger' : ''}`}>
            <FiAlertTriangle />
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
          <div className="confirm-dialog-actions">
            <button className="btn btn-outline" onClick={onClose}>
              {cancelText}
            </button>
            <button
              className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => { onConfirm(); onClose(); }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
