const pool = require('./../config/db')

const getAllProducts = async(req, res) => {
    try{
        const {category, search} = req.query;

        let sql_query = 'Select p.product_id,p.product_name as name,p.brand, round(AVG(f.rating), 1) as rating, count(distinct f.feedback_id) as reviewCount, p.description,p.image_url,v.price,v.sku,i.quantity_on_hand as stock,GROUP_CONCAT(DISTINCT c.category_name) as categories from product p left join product_variant v on p.product_id = v.product_id and  v.is_default = True left join inventory i on v.variant_id = i.variant_id left join product_feedback f on p.product_id = f.product_id left join product_category pc on p.product_id = pc.product_id left join category c on c.category_id = pc.category_id where p.is_active = 1';
        const params = [];

        if(category){
            sql_query += ' and p.product_id in (select pc2.product_id from product_category pc2 left join category c2 on c2.category_id = pc2.category_id where c2.category_name = ?)';
            params.push(category);
        }

        if(search){
            sql_query += ' and (p.product_name like ? or p.brand like ? or v.sku like ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        sql_query += ' GROUP BY p.product_id, p.product_name, p.brand, p.description, p.image_url, v.price, v.sku, i.quantity_on_hand';

        const [products] = await pool.execute(sql_query,params);

        const formattedProducts = products.map(p => ({
            ...p, 
            price : p.price !== null ? parseFloat(p.price) : null,
            rating : p.rating !== null ? parseFloat(p.rating) : null
        }))    

        res.status(200).json(formattedProducts);        
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to fetch products"});
    }
};

const getAllProductswithVariants = async(req,res) =>{
    try {
        const [products] = await pool.execute(
            'Select p.product_id,p.product_name as name, p.brand, v.price, p.badge, round(AVG(f.rating), 1) as rating, count(Distinct f.feedback_id) as reviewCount,p.description, p.image_url, GROUP_CONCAT(DISTINCT c.category_name) as categories from product p left join product_variant v on p.product_id = v.product_id and v.is_default = True left join product_category pc on p.product_id = pc.product_id left join category c on c.category_id = pc.category_id left join product_feedback f on p.product_id = f.product_id where p.is_active = 1 GROUP BY p.product_id, p.product_name, p.brand, p.badge, v.price, p.description, p.image_url'
        );
    
        const [temp_variants] = await pool.execute(
            "Select v.product_id, v.variant_id, v.variant_name, v.sku, v.price, i.quantity_on_hand as stock from product_variant v left join inventory i on v.variant_id = i.variant_id"
        );

        const final_products = products.map(p =>{
            const variants  = temp_variants
                              .filter(v => v.product_id === p.product_id)
                              .map(v => ({...v, price : parseFloat(v.price)}));
            
            return{
                ...p,
                price : p.price !== null ? parseFloat(p.price) : null,
                rating : p.rating !== null ? parseFloat(p.rating) : null,
                variants
            };

        })
            
        res.status(200).json(final_products);        
    } catch (e) {
        console.error(e);
        res.status(500).json({error : "Failed to fetch products"});
    }
}

const getProductByID = async(req, res) =>{
    try{
        //Using prepare statement to prevent data from SQL injection kind of issues.
        const [productRows] = await pool.execute(
            "Select p.product_id, p.product_name as name, p.brand, p.badge, round(AVG(f.rating), 1) as rating, count(f.feedback_id) as reviewCount, p.description, p.image_url from product p left join product_feedback f on p.product_id = f.product_id where p.product_id = ? group by p.product_id, p.brand, p.badge, p.description, p.image_url", 
            [
                req.params.id
            ]
        ); 
        
        if(productRows.length === 0){
            return res.status(404).json({error : "Product not found"});
        }    

        const [temp_variants] = await pool.execute("Select v.variant_id,v.variant_name,v.price,v.sku,i.quantity_on_hand as stock from product_variant v left join inventory i on v.variant_id = i.variant_id where v.product_id = ?",
                                              [req.params.id]
                                             );

        //Adding attributes to variants
        for(const v of temp_variants){
            const [var_attributes] = await pool.execute("Select attribute_name,attribute_value from product_attribute where variant_id = ?",
                                                        [v.variant_id]
            );

            v.attributes = var_attributes;
        }      
        
        const variants = temp_variants.map(v =>({
            ...v, price: v.price != null ? parseFloat(v.price) : null
        }));

        
        //Taking categories of the product 
        const [categories] =await pool.execute("Select c.category_name from product p left join product_category pc on p.product_id = pc.product_id left join category c on c.category_id = pc.category_id where p.product_id = ?",
                                             [req.params.id]
        )

        res.status(200).json({...productRows[0], categories, variants}); //as productRows return row and field, we only need data here and the variants.
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to fetch product"});
    }
}

const createProduct = async(req, res) => {
    const {
           product_name,
           brand,
           badge,
           category,
           image_url,
           description,
           variants,
    } = req.body;

    if(!product_name || !category){
        return res.status(400).json({error : "product_name and category are required"});
    }
    
    if(!Array.isArray(variants) || variants.length === 0){
        return res.status(400).json({error : "At least one variant is required"});
    }
    
    const Connection = await pool.getConnection();
    
    try{
        await Connection.beginTransaction(); //Using transaction for keep ACID property
        
        //Generating product id
        let product_id = ''
    
        const [rows] = await Connection.execute(
            "Select max(cast(substring(product_id,4) as unsigned)) as last_num from product"
        );
        
        const lastnum = rows[0].last_num || 0;
        product_id = `PRD${String(lastnum + 1).padStart(3,"0")}`; 

        await Connection.execute(
            "Insert into product (product_id, product_name, brand, badge, image_url, description, created_at) values (?,?,?,?,?,?,?)",
            [   
                product_id, 
                product_name, 
                brand ?? null,
                badge?.trim() || null, 
                image_url ?? null,
                description ?? null, 
                new Date() // Catching the time when this action is executed
            ]
        );
        
        //Inserting category
        const [catResult] =await Connection.execute(
            "Insert into product_category (product_id, category_id) select ?, category_id from category where category_name = ?",
            [
                product_id,
                category
            ]
        )

        if(catResult.affectedRows === 0){
            throw new Error("Invalid Category");
        }

        //Inserting variants
        if(variants.length !== 0){
            let next_num = 1;
            const [var_row] = await Connection.execute(
                "Select max(cast(substring(variant_id,4) as unsigned)) as last_var from product_variant"
            )

            for(const [index, v] of variants.entries()){

                const last_var = var_row[0].last_var || 0;
                const variant_id = `VAR${String(last_var + next_num).padStart(3,"0")}`;
                next_num++;

                const price = parseFloat(v.price);
                const stock = parseInt(v.stock,10) || 0;

                if(isNaN(price) || price < 0){
                    throw new Error(`Invalid price for variant ${v.variant_name}`);
                }

                if(isNaN(stock) || stock < 0){
                    throw new Error(`Invalid stock for variant ${v.variant_name}`);
                }

                if(!v.sku || !v.variant_name){
                    throw new Error("Each variant needs a name and SKU");
                }

                await Connection.execute(
                    "Insert into product_variant (product_id, variant_id, sku, variant_name, price, is_default, created_at) values (?,?,?,?,?,?,?)",
                    [
                        product_id,
                        variant_id,
                        v.sku,
                        v.variant_name,
                        price,
                        index === 0,
                        new Date()
                    ]
                )

                const inventory_id = variant_id.replace("VAR","INV");
                await Connection.execute(
                    "Insert into inventory (inventory_id,variant_id,quantity_on_hand) values (?,?,?)",
                    [
                        inventory_id,
                        variant_id,
                        stock
                    ]
                )
            }
        }
        
        await Connection.commit(); //Committing the transaction if all the queries are successful

        res.status(201).json({message : "Product created successfully",product_id});
    }catch(e){
        console.error(e);
        await Connection.rollback(); //Rolling back the transaction in case of an error
        res.status(500).json({error : e.message || "Failed to insert product"});
    } finally {
        await Connection.release(); //Releasing the database connection
    }
}

const updateProduct = async(req, res) =>{
    const {
        up_product_name,
        up_product_brand,
        up_product_badge,
        up_product_category,
        up_product_image,
        up_product_description,
        up_variants
    } = req.body;

    const Connection = await pool.getConnection();
    await Connection.beginTransaction();

    try{
        const [product] = await Connection.execute("Select * from product where product_id = ?", [req.params.id]); 

        if(product.length === 0){
            await Connection.rollback();
            return res.status(404).json({error : "Product not found"});
        }  

        if(up_product_name !== undefined){
            product[0].product_name = up_product_name
        }
        
        if(up_product_brand !== undefined){
            product[0].brand = up_product_brand
        }
        
        if(up_product_badge !== undefined){
            product[0].badge = up_product_badge
        }

        if(up_product_category !== undefined){
            await Connection.execute(
                "Delete from product_category where product_id = ?",
                [req.params.id]
            )

            const [catResult] = await Connection.execute(
                "Insert into product_category (product_id, category_id) select ?, category_id from category where category_name = ?",
                [
                    req.params.id, 
                    up_product_category
                ]
            );

            if(catResult.affectedRows === 0){
                throw new Error("Invalid Category");
            }
        }

        if(up_product_image !== undefined){
            product[0].image_url = up_product_image
        }

        if(up_product_description !== undefined){
            product[0].description = up_product_description
        }
        
        await Connection.execute(
            "Update product set product_name = ?, brand = ?, badge = ?, image_url = ?, description = ? where product_id = ?" ,
            [
                product[0].product_name ?? null,
                product[0].brand ?? null,
                product[0].badge?.trim() || null,
                product[0].image_url ?? null,
                product[0].description ?? null,
                req.params.id
            ]
        )

        if(up_variants && Array.isArray(up_variants)){
            for(const v of up_variants){
                const price = parseFloat(v.price);
                const stock = parseInt(v.stock,10) || 0;

                if(isNaN(price) || price < 0){
                    throw new Error(`Invalid price for variant ${v.variant_name}`);
                }

                if(isNaN(stock) || stock < 0){
                    throw new Error(`Invalid stock for variant ${v.variant_name}`);
                }

                if(!v.variant_id || !v.sku || !v.variant_name){
                    throw new Error("Each variant needs a variant_id, name and SKU");
                }

                const [varResults] =await Connection.execute(
                    "Update product_variant set variant_name = ?, price = ?, sku = ? where product_id = ? and variant_id = ?",
                    [ 
                        v.variant_name,
                        price,
                        v.sku,
                        req.params.id,
                        v.variant_id
                    ]
                )

                if(varResults.affectedRows === 0){
                    throw new Error(`Variant with id ${v.variant_id} not found for this product`);
                }

                await Connection.execute(
                    "Update inventory set quantity_on_hand = ? where variant_id = ?",
                    [
                        stock,
                        v.variant_id
                    ]
                )
            }
        }

        await Connection.commit();
        res.status(200).json({message :"Product updated successfully"});
    }catch(err){
        console.error(err);
        await Connection.rollback();
        res.status(500).json({error : err.message || "Failed to update product"});

        if(err.code === "ER_DUP_ENTRY"){
            res.status(400).json({error : "SKU already exists"});
        }

    } finally {
        await Connection.release();
    }
}

const deleteProduct =async(req, res) =>{
    try {
        //Checking if the product is in the db
        const [dummy_product] = await pool.execute("Select * from product where product_id = ?", [req.params.id]); 

        if(dummy_product.length === 0){
            return res.status(404).json({error : "Product not found"});
        }  

        await pool.execute("Delete from product where product_id = ?", [req.params.id]);
        res.status(200).json({message : "Product successfully deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error : "Failed to delete product"});

        //We don't have to catch foreign key delete errors because we handle that in schema.sql by cascade delete.
    }
}

const getAllCategories = async (req, res)=>{
    try {
        const [category] = await pool.execute("Select category_id, category_name from category order by category_name");
        
        if(category.length === 0){
            return res.status(404).json({"message": "Categories not Found..!"});
        }

        res.status(200).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({error : "Failed to fetch categories"});
    }

};

module.exports = {
    getAllProducts,
    getAllProductswithVariants,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllCategories
};