const pool = require(`./../config/db`)
const {
    nextId,
    insertVariant,
    insertAttributes,
    insertCategories,
    validateVariant
} = require(`./../utills/dbHelpers`);

const getAllProducts = async(req, res) => {
    try{
        const {category, search} = req.query;

        let sql_query = 
            `Select p.product_id,p.product_name as name,p.brand, round(AVG(f.rating), 1) as rating, count(distinct f.feedback_id) as reviewCount, 
             p.description,p.image_url,v.price,v.sku,i.quantity_on_hand as stock,GROUP_CONCAT(DISTINCT c.category_name) as categories 
             from product p 
             left join product_variant v on p.product_id = v.product_id and  v.is_default = True and v.is_active = True 
             left join inventory i on v.variant_id = i.variant_id 
             left join product_feedback f on p.product_id = f.product_id 
             left join product_category pc on p.product_id = pc.product_id 
             left join category c on c.category_id = pc.category_id 
             where p.is_active = 1`;
        const params = [];

        if(category){
            sql_query += 
                ` and p.product_id in 
                  (
                    select pc2.product_id 
                    from product_category pc2 
                    left join category c2 on c2.category_id = pc2.category_id 
                    where c2.category_name = ?
                )`;
            params.push(category);
        }

        if(search){
            sql_query += ` and (p.product_name like ? or p.brand like ? or v.sku like ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        sql_query += ` GROUP BY p.product_id, p.product_name, p.brand, p.description, p.image_url, v.price, v.sku, i.quantity_on_hand`;

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
            `Select p.product_id,p.product_name as name, p.brand, v.price, p.badge, round(AVG(f.rating), 1) as rating,
             count(Distinct f.feedback_id) as reviewCount,p.description, p.image_url, GROUP_CONCAT(DISTINCT c.category_name) as categories 
             from product p 
             left join product_variant v on p.product_id = v.product_id and v.is_default = True and v.is_active = True 
             left join product_category pc on p.product_id = pc.product_id 
             left join category c on c.category_id = pc.category_id 
             left join product_feedback f on p.product_id = f.product_id where p.is_active = 1 
             GROUP BY p.product_id, p.product_name, p.brand, p.badge, v.price, p.description, p.image_url`
        );
    
        const [temp_variants] = await pool.execute(
            `Select v.product_id, v.variant_id, v.variant_name, v.sku, v.price, i.quantity_on_hand as stock 
             from product_variant v 
             left join inventory i on v.variant_id = i.variant_id 
             where v.is_active = True`
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
            `Select p.product_id, p.product_name as name, p.brand, p.badge, round(AVG(f.rating), 1) as rating,
             count(f.feedback_id) as reviewCount, p.description, p.image_url 
             from product p 
             left join product_feedback f on p.product_id = f.product_id 
             where p.product_id = ? and p.is_active = True 
             group by p.product_id, p.brand, p.badge, p.description, p.image_url`, 
            [
                req.params.id
            ]
        ); 
        
        if(productRows.length === 0){
            return res.status(404).json({error : "Product not found"});
        }    

        const [temp_variants] = await pool.execute(`Select v.variant_id,v.variant_name,v.price,v.sku,i.quantity_on_hand as stock 
                                                     from product_variant v 
                                                     left join inventory i on v.variant_id = i.variant_id 
                                                     where v.product_id = ? and v.is_active = True`,
                                              [req.params.id]
                                             );

        //Adding attributes to variants
        for(const v of temp_variants){
            const [var_attributes] = await pool.execute(`Select attribute_name,attribute_value from product_attribute where variant_id = ?`,
                                                        [v.variant_id]
            );

            v.attributes = var_attributes;
        }      
        
        const variants = temp_variants.map(v =>({
            ...v, price: v.price != null ? parseFloat(v.price) : null
        }));

        
        //Taking categories of the product 
        const [categories] =await pool.execute(
            `Select c.category_name 
             from product p left 
             join product_category pc on p.product_id = pc.product_id 
             left join category c on c.category_id = pc.category_id 
             where p.product_id = ?`,
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
        categories,
        image_url,
        description,
        variants,
    } = req.body;

    if(!product_name || !categories || categories.length === 0){
        return res.status(400).json({error : "product_name and at least one category are required"});
    }
    
    if(!Array.isArray(variants) || variants.length === 0){
        return res.status(400).json({error : "At least one variant is required"});
    }
    
    const Connection = await pool.getConnection();
    
    try{
        await Connection.beginTransaction(); //Using transaction for keep ACID property
        
        //Generating product id
        const product_id = await nextId(Connection, "product", "product_id", "PRD", 4);

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
        await insertCategories(Connection, product_id, categories);
        
        //Inserting variants and attributes
        if(variants && Array.isArray(variants)){
            for(const[index,v] of variants.entries()){
                await insertVariant(Connection, product_id, v, index === 0);
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
        up_product_categories,
        up_product_image,
        up_product_description,
        up_variants
    } = req.body;
    
    const Connection = await pool.getConnection();
    
    try{
        await Connection.beginTransaction();
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
        
        if(up_product_categories !== undefined){
            if(!Array.isArray(up_product_categories) || up_product_categories.length === 0){
                throw new Error("At least one category is required");
            }
            
            await Connection.execute(
                "Delete from product_category where product_id = ?",
                [req.params.id]
            )
            
            await insertCategories(Connection, req.params.id, up_product_categories);
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
                if(v.variant_id && v.is_active === false){
                    const [result] = await Connection.execute(
                        "Update product_variant set is_active = false, is_default = false where product_id = ? and variant_id = ?",
                        [
                            req.params.id,
                            v.variant_id
                        ]
                    )
                    
                    if(result.affectedRows === 0){
                        throw new Error(`Variant with id ${v.variant_id} not found for product ${req.params.id}`);
                    }
                    
                    continue;
                }
                
                if(!v.variant_id){  //new variant
                    await insertVariant(Connection, req.params.id, v, false);
                    continue;
                }
                
                const {price, stock} = validateVariant(v);
                
                const [row] = await Connection.execute(
                    "Update product_variant set variant_name = ?, price = ?, sku = ? where product_id = ? and variant_id = ?",
                    [
                        v.variant_name?.trim() ?? null,
                        price,
                        v.sku?.trim() ?? null,
                        req.params.id,
                        v.variant_id
                    ]
                );
                
                if(row.affectedRows === 0){
                    throw new Error(`Variant with id ${v.variant_id} not found for product ${req.params.id}`);
                }
                
                await Connection.execute(
                    "Update inventory set quantity_on_hand = ? where variant_id = ?",
                    [
                        stock,
                        v.variant_id
                    ]
                );
                
                await Connection.execute(
                    "Delete from product_attribute where variant_id = ?",
                    [
                        v.variant_id
                    ]
                );
                await insertAttributes(Connection, v.variant_id, v.attributes);
            }
        }
        
        const [active_variants] = await Connection.execute(
            "Select count(variant_id) as active_variant_count from product_variant where product_id = ? and is_active = true",
            [
                req.params.id
            ]
        );
        
        if(active_variants[0].active_variant_count === 0){
            throw new Error("At least one active variant is required for the product");
        }
        
        const [default_variant] = await Connection.execute(
            "Select variant_id from product_variant where product_id = ? and is_default = true and is_active = true",
            [
                req.params.id
            ]
        );
        
        if(default_variant.length === 0){
            await Connection.execute(
                "Update product_variant set is_default = true where product_id = ? and is_active = true order by variant_id limit 1",
                [
                    req.params.id
                ]
            );
        }
        
        await Connection.commit();
        res.status(200).json({message :"Product updated successfully"});
    }catch(err){
        console.error(err);
        await Connection.rollback();
        
        if(err.code === "ER_DUP_ENTRY"){
            res.status(400).json({error : "SKU already exists"});
            return;
        }
        
        res.status(500).json({error : err.message || "Failed to update product"});
        
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
        
        //We don`t have to catch foreign key delete errors because we handle that in schema.sql by cascade delete.
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

const getProductwithReview = async(req, res) => {
    
    try {
        const [reviews] = await pool.execute(
            `Select f.feedback_id, f.rating, f.review, f.created_at,
                u.first_name, Left(u.last_name,1) as last_initial
             from product_feedback f
             join customer c on c.customer_id = f.customer_id
             join user u on u.user_id = c.user_id
             where product_id = ?
             order by f.created_at desc`,
            [
                req.params.id
            ]
        )
    
        res.status(200).json(reviews);
    } catch (e) {
        console.error(e);
        res.status(500).json({error : "Failed to fetch product reviews"});
    }
}

const createReview = async(req, res) => {
    const {
        customerId,
        rating, 
        review
    } = req.body || {};

    if (customerId === undefined || customerId === null || customerId === "") {
        return res.status(400).json({ error: "Customer ID is required" });
    }
    
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be a whole number between 1 and 5" });
    }
    
    if (typeof review !== "string") {
        return res.status(400).json({ error: "Review must be string" });
    }
    const reviewText = review.trim();
    if (reviewText.length > 500) {
        return res.status(400).json({ error: "Review must be 500 characters or less" });
    }
    
    
    const Connection = await pool.getConnection();
    try {
        await Connection.beginTransaction();

        const[customer] = await Connection.execute(
            `Select customer_id from customer where customer_id = ?`,
            [
                customerId
            ]
        );

        if(customer.length === 0){
            await Connection.rollback();
            return res.status(403).json({error:"Customer not found"});
        }

        const customer_id = customer[0].customer_id;

        const [prod] = await Connection.execute(
            `SELECT 1 FROM product WHERE product_id = ? AND is_active = 1`,
            [
                req.params.id
            ]
        );

        if (prod.length === 0) {
            await Connection.rollback();
            return res.status(404).json({ error: "Product not found" });
        }

        let feedback_id;
        // Try three times incase of failure
        for(let attempt = 0; attempt < 3; attempt++){
            try {
                feedback_id = await nextId(Connection, "product_feedback", "feedback_id", "FB",3);
                
                await Connection.execute(
                    `Insert into product_feedback (feedback_id, product_id, customer_id, rating, review) values (?,?,?,?,?)`,
                    [
                        feedback_id,
                        req.params.id,
                        customer_id,
                        rating,
                        reviewText || null
                    ]
                )
                break;
            } catch (e) {
                const idClash = e.code === "ER_DUP_ENTRY" && e.sqlMessage?.includes("PRIMARY");
                if(idClash && attempt < 2) continue;
                throw e;
            }
        } 

        await Connection.commit();
        res.status(201).json({"message":"Product reviews added successfully"})
    } catch (e) {
        await Connection.rollback();

        if (e.code === "ER_DUP_ENTRY") {
            if(e.sqlMessage?.includes("uq_feedback")){
                return res.status(409).json({ error: "You have already reviewed this product" });
            }

            return res.status(503).json({error:"Please try again"});
        }

        if (e.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ error: "Invalid customer" });
        }

        console.error(e);
        res.status(500).json({ error: "Failed to add review" });
    }finally{
        Connection.release();
    }
}

module.exports = {
    getAllProducts,
    getAllProductswithVariants,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllCategories,
    getProductwithReview,
    createReview
};
