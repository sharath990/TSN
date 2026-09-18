const API_URL = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL.replace(/\/api$/, '')}${path}`;
};
