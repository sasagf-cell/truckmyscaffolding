
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

// GET /inventory/summary
router.get('/summary', authMiddleware, async (req, res) => {
  const { projectId } = req.query;

  if (!projectId) {
    throw new Error('projectId is required');
  }

  // Fetch all delivered material deliveries for the project
  const deliveries = await pb.collection('material_deliveries').getFullList({
    filter: `project_id = "${projectId}" && status = "Delivered"`,
    sort: '-delivery_date',
  });

  if (deliveries.length === 0) {
    return res.json([]);
  }

  const deliveryIds = deliveries.map(d => d.id);
  
  // Fetch all items for these deliveries
  // Since PocketBase filter length might be limited, we can fetch all items for the project if we had a project_id on items,
  // but we don't. So we'll fetch items in batches or just fetch all and filter in memory if it's not too large.
  // For safety with potentially many IDs, we'll fetch all items and filter.
  // A better approach for production would be to add project_id to material_items.
  // Here we will construct a filter string for the IDs.
  
  const filterStr = deliveryIds.map(id => `delivery_id="${id}"`).join(' || ');
  
  const items = await pb.collection('material_items').getFullList({
    filter: filterStr,
  });

  const inventoryMap = {};

  // Aggregate quantities
  for (const item of items) {
    const delivery = deliveries.find(d => d.id === item.delivery_id);
    if (!delivery) continue;

    if (!inventoryMap[item.material_type]) {
      inventoryMap[item.material_type] = {
        materialType: item.material_type,
        totalQuantity: 0,
        unit: item.unit,
        lastDeliveryDate: delivery.delivery_date,
      };
    }

    inventoryMap[item.material_type].totalQuantity += item.quantity;
    
    // Update last delivery date if this one is newer
    if (new Date(delivery.delivery_date) > new Date(inventoryMap[item.material_type].lastDeliveryDate)) {
      inventoryMap[item.material_type].lastDeliveryDate = delivery.delivery_date;
    }
  }

  res.json(Object.values(inventoryMap));
});

export default router;
