export function getDemoShipments() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  return [
    {
      id: 1,
      tracking_number: 'EKM100825KL',
      destination_address: 'Kochi, Kerala',
      status: 'IN_TRANSIT',
      is_fragile: true,
      ship_date: formatDate(lastWeek),
      estimated_delivery_date: formatDate(tomorrow),
      notes: 'Handle with care - electronics',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      tracking_number: 'TVM200825TN',
      destination_address: 'Thiruvananthapuram, Kerala',
      status: 'DELIVERED',
      is_fragile: false,
      ship_date: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
      estimated_delivery_date: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
      notes: 'Standard delivery',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      tracking_number: 'BLR300825KA',
      destination_address: 'Bangalore, Karnataka',
      status: 'DELAYED',
      is_fragile: false,
      ship_date: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
      estimated_delivery_date: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
      notes: 'Weather delay',
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      tracking_number: 'MUM400825MH',
      destination_address: 'Mumbai, Maharashtra',
      status: 'PENDING',
      is_fragile: true,
      ship_date: formatDate(today),
      estimated_delivery_date: formatDate(nextWeek),
      notes: 'Fragile - glassware',
      created_at: new Date().toISOString()
    }
  ];
}

function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
}
