// frontend/src/utils/helpers.js
export function formatWasteType(type) {
  const labels = {
    wet_waste: '💧 Wet Waste',
    dry_waste: '📦 Dry Waste',
    plastic: '🧴 Plastic',
    e_waste: '💻 E-Waste',
  };
  return labels[type] || type;
}

export function getStatusBadge(status) {
  return `badge badge-${status}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getApiError(err) {
  if (err.response?.data?.errors?.length > 0) {
    return err.response.data.errors.map(e => e.msg).join('. ');
  }
  return err.response?.data?.message || 'Something went wrong. Please try again.';
}
