const nextId = async(Connection, table, col, prefix, pad) =>{
    const [rows] = await Connection.execute(
        `Select max(cast(substring(${col},4) as unsigned)) as last_num from ${table}`
    );

    return `${prefix}${String((rows[0].last_num || 0) + 1).padStart(pad,"0")}`;
}

const validateVariant = (v) => {
  const price = parseFloat(v.price);
  const stock = parseInt(v.stock, 10) || 0;

  if (!v.sku || !v.variant_name) throw new Error("Each variant needs a name and SKU");
  if (isNaN(price) || price < 0) throw new Error(`Invalid price for variant ${v.variant_name}`);
  if (stock < 0) throw new Error(`Invalid stock for variant ${v.variant_name}`);

  return { price, stock };
};

const insertAttributes = async(Connection, variant_id, attributes) => {
  if (!Array.isArray(attributes)) return;

  for (const a of attributes) {
    const name = a.attribute_name?.trim();
    const value = a.attribute_value?.trim();
    if (!name || !value) continue;

    const attribute_id = await nextId(Connection, "product_attribute", "attribute_id", "ATT", 4);
    
    await Connection.execute(
      "Insert into product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES (?,?,?,?)",
      [
        attribute_id, 
        variant_id, 
        name, 
        value
     ]
    );
  }
};

const insertVariant = async(Connection, product_id, v, isDefault) => {
  const { price, stock } = validateVariant(v);
  const variant_id = await nextId(Connection, "product_variant", "variant_id", "VAR", 3);

  await Connection.execute(
    "Insert into product_variant (product_id, variant_id, sku, variant_name, price, is_default, created_at) VALUES (?,?,?,?,?,?,?)",
     [
        product_id, 
        variant_id, 
        v.sku, 
        v.variant_name, 
        price, 
        isDefault, 
        new Date()
     ]
  );

  await Connection.execute(
    "Insert into inventory (inventory_id, variant_id, quantity_on_hand) VALUES (?,?,?)",
     [
        variant_id.replace("VAR", "INV"), 
        variant_id, 
        stock
    ]
  );

  await insertAttributes(Connection, variant_id, v.attributes);
  return variant_id;
};

const insertCategories = async(Connection, product_id, categories) =>{
    const uniquesCategories = [...new Set(categories)];

    if(categories){
        if(!Array.isArray(categories) || categories.length === 0){
            throw new Error("At least one category is required")
        }

        for(const cat of uniquesCategories){
            const [catResult] =await Connection.execute(
                "Insert into product_category (product_id, category_id) select ?, category_id from category where category_name = ?",
                [
                    product_id,
                    cat
                ]
            )

            if(catResult.affectedRows === 0){
                throw new Error(`Invalid Category: ${cat}`);
            }
        }
    }
}

module.exports = {
    nextId,
    validateVariant,
    insertVariant,
    insertAttributes,
    insertCategories
}