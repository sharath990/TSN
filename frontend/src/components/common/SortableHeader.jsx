import { FiChevronUp, FiChevronDown, FiMinus } from 'react-icons/fi';

export const SortableHeader = ({ column, label, currentSort, currentOrder, onSort }) => {
  const isActive = currentSort === column;

  const handleClick = () => {
    if (isActive) {
      onSort(column, currentOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(column, 'ASC');
    }
  };

  return (
    <th
      className={`sortable-header ${isActive ? 'sortable-header-active' : ''}`}
      onClick={handleClick}
    >
      <span className="sortable-header-content">
        {label}
        <span className="sortable-header-icon">
          {isActive ? (
            currentOrder === 'ASC' ? <FiChevronUp /> : <FiChevronDown />
          ) : (
            <FiMinus />
          )}
        </span>
      </span>
    </th>
  );
};
