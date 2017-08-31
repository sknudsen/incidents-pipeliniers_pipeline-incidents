
function SnapColumnCreator (columnName, oldX, newX, viewport) {
  return {
    type: 'SnapColumn',
    columnName: columnName,
    oldX: oldX,
    newX: newX,
    viewport: viewport
  }
}

module.exports = SnapColumnCreator