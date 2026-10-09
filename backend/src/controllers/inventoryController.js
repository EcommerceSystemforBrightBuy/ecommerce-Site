const db = require('../config/db');

const getInventory = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        pv.sku,
        p.product_name,
        pv.variant_name,
        i.quantity_on_hand AS stock,
        pv.price
      FROM inventory i
      INNER JOIN product_variant pv ON pv.variant_id = i.variant_id
      INNER JOIN product p ON p.product_id = pv.product_id
      ORDER BY p.product_name, pv.variant_name
    `);

    const inventory = rows.map((row) => ({
      ...row,
      stock: Number(row.stock),
      price: row.price !== null ? Number(row.price) : null,
    }));

    return res.status(200).json(inventory);
  } catch (error) {
    console.error('[Inventory Controller] Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const adjustStock = async (req, res) => {
  const { sku } = req.params;
  const { adjustment, type } = req.body || {};
  const parsedAdjustment = Number(adjustment);
  const allowedTypes = ['restock', 'order_deduction', 'adjustment', 'return'];

  if (!sku || !Number.isInteger(parsedAdjustment) || parsedAdjustment === 0) {
    return res.status(400).json({ message: 'Invalid SKU or adjustment value.' });
  }

  const normalizedType = type || 'adjustment';
  if (!allowedTypes.includes(normalizedType)) {
    return res.status(400).json({ message: 'Invalid inventory transaction type.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [variantRows] = await connection.execute(
      `SELECT pv.variant_id, i.inventory_id, i.quantity_on_hand
       FROM product_variant pv
       LEFT JOIN inventory i ON i.variant_id = pv.variant_id
       WHERE pv.sku = ?
       LIMIT 1`,
      [sku]
    );

    if (variantRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'SKU not found.' });
    }

    const variantId = variantRows[0].variant_id;
    const currentStock = variantRows[0].quantity_on_hand;

    if (currentStock !== null && Number(currentStock) + parsedAdjustment < 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'The adjustment cannot reduce stock below zero.' });
    }

    // Direct atomic update on inventory
    await connection.execute(
      `UPDATE inventory SET quantity_on_hand = quantity_on_hand + ? WHERE variant_id = ?`,
      [parsedAdjustment, variantId]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Stock adjusted successfully.',
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[Inventory Controller] Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getInventory,
  adjustStock,
};
