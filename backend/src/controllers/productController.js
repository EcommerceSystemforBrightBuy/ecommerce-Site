const pool = require('./../config/db')

const getAllProducts = async(req, res) => {
    try{
        const [products] = await pool.execute(
            'Select p.product_id,p.product_name as name,p.brand,p.description,p.image_url,v.price,v.sku,i.quantity_on_hand as stock from product p left join product_variant v on p.product_id = v.product_id and  v.is_default = True left join inventory i on v.variant_id = i.variant_id where p.is_active = 1');
        
        const formattedProducts = products.map(p => ({
            ...p, price : p.price !== null ? parseFloat(p.price) : null
        }))    
        
        res.status(200).json(formattedProducts);
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to fetch products"});
    }
};

const getProductByID = async(req, res) =>{
    try{
        //Using prepare statement to prevent data from SQL injection kind of issues.
        const [productRows] = await pool.execute("Select product_id, product_name as name, brand, description, image_url, is_active from product where product_id = ?", [req.params.id]); 
        
        if(productRows.length === 0){
            return res.status(404).json({error : "Product not found"});
        }    

        const [temp_variants] = await pool.execute("Select v.variant_id as id,v.variant_name as name,v.price,v.sku,i.quantity_on_hand as stock from product_variant v left join inventory i on v.variant_id = i.variant_id where v.product_id = ?",
                                              [req.params.id]
                                             );

        //Adding attributes to variants
        for(const v of temp_variants){
            const [var_attributes] = await pool.execute("Select attribute_name,attribute_value from product_attribute where variant_id = ?",
                                                        [v.id]
            );

            v.attributes = var_attributes;
        }      
        
        const variants = temp_variants.map(v =>({
            ...v, price: v.price != null ? parseFloat(v.price) : null
        }));

        res.status(200).json({...productRows[0], variants}); //as productRows return row and field, we only need data here and the variants.
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to fetch product"});
    }
}

const createProduct = async(req, res) => {
    const {
           product_id,
           product_name,
           brand,
           description,
           is_active,
    } = req.body;

    if(!product_name || !product_id){
        return res.status(400).json({error : "product_id and product_name are required"});
    }
    
    try{
        await pool.execute(
            "Insert into product (product_id, product_name, brand, description, is_active, created_at) values (?,?,?,?,?,?)",
            [   
                product_id, 
                product_name, 
                brand, 
                description, 
                is_active, 
                new Date() // Catching the time when this action is executed
            ]
        );

        res.status(201).json({message : "Product created successfully",product_id});
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to insert product"});
    }
}

const updateProduct = async(req, res) =>{
    const {
        up_product_name,
        up_brand,
        up_description,
        up_is_active
    } = req.body;

    try{
        const [product] = await pool.execute("Select * from product where product_id = ?", [req.params.id]); 

        if(product.length === 0){
            return res.status(404).json({error : "Product not found"});
        }  

        if(up_product_name !== undefined){
            product[0].product_name = up_product_name
        }
        
        if(up_brand !== undefined){
            product[0].brand = up_brand
        }
        
        if(up_description !== undefined){
            product[0].description = up_description
        }
        
        if(up_is_active !== undefined){
            product[0].is_active = up_is_active
        }

        await pool.execute(
            "Update product set product_name = ?, brand = ?, description = ?, is_active = ? where product_id = ?" ,
            [
                product[0].product_name ?? null,
                product[0].brand ?? null,
                product[0].description ?? null,
                product[0].is_active ?? null,
                req.params.id
            ]
        )
        res.status(200).json({message :"Product updated successfully"});
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to update product"});
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

module.exports = {
    getAllProducts,
    getProductByID,
    createProduct,
    updateProduct,
    deleteProduct
};