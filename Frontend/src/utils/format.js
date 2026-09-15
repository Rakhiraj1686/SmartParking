export function formatDateLong(isoOrDate) {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) return isoOrDate;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function currency(amount) {
  return `\u20B9${amount}`;
}

export const STATUS_META = {
  available: {
    label: 'Available',
    text: 'text-available',
    bg: 'bg-available-soft',
    dot: 'bg-available',
    ring: 'ring-available',
    border: 'border-available',
  },
  occupied: {
    label: 'Occupied',
    text: 'text-occupied',
    bg: 'bg-occupied-soft',
    dot: 'bg-occupied',
    ring: 'ring-occupied',
    border: 'border-occupied',
  },
  reserved: {
    label: 'Reserved',
    text: 'text-reserved',
    bg: 'bg-reserved-soft',
    dot: 'bg-reserved',
    ring: 'ring-reserved',
    border: 'border-reserved',
  },
  selected: {
    label: 'Selected',
    text: 'text-selected',
    bg: 'bg-selected-soft',
    dot: 'bg-selected',
    ring: 'ring-selected',
    border: 'border-selected',
  },
};
