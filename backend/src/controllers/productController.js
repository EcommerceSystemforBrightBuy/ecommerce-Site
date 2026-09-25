const pool = require('./../config/db')

const getAllProducts = async(req, res) => {
    try{
        const [products] = await pool.execute(
            'Select p.product_id,p.product_name as name,p.brand, round(AVG(f.rating), 1) as rating, count(f.feedback_id) as reviewCount, p.description,p.image_url,v.price,v.sku,i.quantity_on_hand as stock,GROUP_CONCAT(DISTINCT c.category_name) as categories from product p left join product_variant v on p.product_id = v.product_id and  v.is_default = True left join inventory i on v.variant_id = i.variant_id left join product_feedback f on p.product_id = f.product_id left join product_category pc on p.product_id = pc.product_id left join category c on c.category_id = pc.category_id where p.is_active = 1 GROUP BY p.product_id, p.product_name, p.brand, p.description, p.image_url, v.price, v.sku, i.quantity_on_hand');
        
        const formattedProducts = products.map(p => ({
            ...p, price : p.price !== null ? parseFloat(p.price) : null
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
            'Select p.product_id,p.product_name as name, p.brand, v.price, p.badge, round(AVG(f.rating), 1) as rating,count(f.feedback_id) as reviewCount,p.description, p.image_url, GROUP_CONCAT(DISTINCT c.category_name) as categories from product p left join product_variant v on p.product_id = v.product_id and v.is_default = True left join product_category pc on p.product_id = pc.product_id left join category c on c.category_id = pc.category_id left join product_feedback f on p.product_id = f.product_id where p.is_active = 1 GROUP BY p.product_id, p.product_name, p.brand, p.description, p.image_url'
        );
    
        const formattedProducts = products.map(p => ({
            ...p, variants : typeof p.variants === "string" ? JSON.parse(p.variants) : p.variants
        })) 

        const [temp_variants] = await pool.execute("Select v.product_id, v.variant_id, v.variant_name, v.sku, v.price, i.quantity_on_hand as stock from product_variant v left join inventory i on v.variant_id = i.variant_id"
        );

        const final_products = formattedProducts.map(p => {
            const variants = temp_variants.filter(variant => variant.product_id === p.product_id);

            return{ ...p, variants}
        });
            
        res.status(200).json(final_products);        
    } catch (e) {
        console.error(e);
        res.status(500).json({error : "Failed to fetch products"});
    }
}

const getProductByID = async(req, res) =>{
    try{
        //Using prepare statement to prevent data from SQL injection kind of issues.
        const [productRows] = await pool.execute("Select p.product_id, p.product_name as name, p.brand, p.badge, round(AVG(f.rating), 1) as rating, count(f.feedback_id) as reviewCount, p.description, p.image_url from product p left join product_feedback f on p.product_id = f.product_id where p.product_id = ?", [req.params.id]); 
        
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

    const [row] = await pool.execute(
        "Select product_id from product order by product_id desc limit 1"
    );
    
    if(!product_name){
        return res.status(400).json({error : "product_name is required"});
    }
    
    //Generating product id
    let product_id = ''

    const [rows] = await pool.execute(
        "Select max(cast(substring(product_id,4) as unsigned)) as last_num from product"
    );
    
    const lastnum = rows[0].last_num || 0;
    product_id = `PRD${String(lastnum + 1).padStart(3,"0")}`; 

    const Connection = await pool.getConnection();
    
    try{
        await Connection.beginTransaction(); //Using transaction for keep ACID property

        await Connection.execute(
            "Insert into product (product_id, product_name, brand, badge, image_url, description, created_at) values (?,?,?,?,?,?,?)",
            [   
                product_id, 
                product_name, 
                brand, 
                badge,
                image_url,
                description, 
                new Date() // Catching the time when this action is executed
            ]
        );
        
        //Inserting category
        await Connection.execute(
            "Insert into product_category (product_id, category_id) select ?, category_id from category where category_name = ?",
            [
                product_id,
                category
            ]
        )

        //Inserting variants
        if(variants.length !== 0){
            let next_num = 1;
            const [var_row] = await pool.execute(
                "Select max(cast(substring(variant_id,4) as unsigned)) as last_var from product_variant"
            )

            for(const v of variants){

                const last_var = var_row[0].last_var || 0;
                const variant_id = `VAR${String(last_var + next_num).padStart(3,"0")}`;
                const inventory_id = `INV${variant_id}`;
                next_num++;

                await Connection.execute(
                    "Insert into product_variant (product_id, variant_id, sku, variant_name, price, created_at) values (?,?,?,?,?,?)",
                    [
                        product_id,
                        variant_id,
                        v.sku,
                        v.variant_name,
                        v.price,
                        new Date()
                    ]
                )


                await Connection.execute(
                    "Insert into inventory (inventory_id,variant_id,quantity_on_hand) values (?,?,?)",
                    [
                        inventory_id,
                        variant_id,
                        v.stock
                    ]
                )
            }
        }
        
        await Connection.commit(); //Committing the transaction if all the queries are successful

        res.status(201).json({message : "Product created successfully",product_id});
    }catch(e){
        console.error(e);
        await Connection.rollback(); //Rolling back the transaction in case of an error
        res.status(500).json({error : "Failed to insert product"});
    } finally {
        await Connection.release(); //Releasing the database connection
    }
}

const updateProduct = async(req, res) =>{
    const {
        up_product_name,
        up_product_brand,
        up_product_badge,
        up_product_description,
        up_variants
    } = req.body;

    try{
        const [product] = await pool.execute("Select * from product where product_id = ?", [req.params.id]); 

        if(product.length === 0){
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

        if(up_product_description !== undefined){
            product[0].description = up_product_description
        }
        
        if(up_variants !== undefined){
            product[0].variants = up_variants
        }

        const Connection = await pool.getConnection();
        await Connection.beginTransaction();

        await Connection.execute(
            "Update product set product_name = ?, brand = ?, badge = ?,description = ? where product_id = ?" ,
            [
                product[0].product_name ?? null,
                product[0].brand ?? null,
                product[0].badge ?? null,
                product[0].description ?? null,
                req.params.id
            ]
        )

        if(up_variants && Array.isArray(up_variants)){
            for(const v of up_variants){
                await Connection.execute(
                    "Update product_variant set variant_name = ?, price = ?, sku = ? where product_id = ? and variant_id = ?",
                    [ 
                        v.variant_name,
                        v.price,
                        v.sku,
                        req.params.id,
                        v.variant_id
                    ]
                )

                await Connection.execute(
                    "Update inventory set quantity_on_hand = ? where variant_id = ?",
                    [
                        v.stock,
                        v.variant_id
                    ]
                )
            }
        }

        await Connection.commit();
        res.status(200).json({message :"Product updated successfully"});
    }catch(e){
        console.error(e);
        await Connection.rollback();
        res.status(500).json({error : "Failed to update product"});
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
    } catch (e) {
        console.error(e);
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
    } catch (e) {
        console.error(e);
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