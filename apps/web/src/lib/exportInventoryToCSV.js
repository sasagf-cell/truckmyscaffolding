
export const exportInventoryToCSV = (inventory) => {
  try {
    if (!inventory || inventory.length === 0) {
      console.warn('No inventory data to export');
      return;
    }

    const headers = ['Material Type', 'Total Quantity', 'Unit', 'Last Delivery Date'];
    
    const rows = inventory.map(item => {
      const dateStr = item.lastDeliveryDate ? item.lastDeliveryDate.split('T')[0] : '';
      return [
        `"${item.materialType.replace(/"/g, '""')}"`,
        item.totalQuantity,
        `"${item.unit}"`,
        `"${dateStr}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};
