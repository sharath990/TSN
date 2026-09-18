const getSortClause = (query, allowedColumns, defaultColumn = 'created_at', defaultOrder = 'DESC') => {
  const sort = query.sort;
  const order = (query.order || defaultOrder).toUpperCase();

  if (!sort || !allowedColumns.includes(sort)) {
    return [[defaultColumn, defaultOrder]];
  }

  if (order !== 'ASC' && order !== 'DESC') {
    return [[sort, defaultOrder]];
  }

  return [[sort, order]];
};

module.exports = { getSortClause };
