const toRad = (deg) => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findServiceArea = async (lat, lng, ServiceArea) => {
  const areas = await ServiceArea.findAll({ where: { is_active: true } });
  for (const area of areas) {
    const dist = haversineDistance(lat, lng, parseFloat(area.center_lat), parseFloat(area.center_lng));
    if (dist <= parseFloat(area.radius_km)) {
      return { serviceArea: area, distance: Math.round(dist * 100) / 100 };
    }
  }
  return null;
};

module.exports = { haversineDistance, findServiceArea };
