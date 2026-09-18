import './Modal.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <h4 className="stat-card-title">{title}</h4>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
};
