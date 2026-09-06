const pool = require('./../config/db')

const getAllProducts = async(req, res) => {
    try{
        const [products] = await pool.execute("Select * from product");
        res.status(200).json(products);
    }catch(e){
        console.error(e);
        res.status(500).json({error : "Failed to fetch products"});
    }
};

const getProductByID = async(req, res) =>{
    try{
        //Using prepare statement to prevent data from SQL injection kind of issues.
        const [product] = await pool.execute("Select * from product where product_id = ?", [req.params.id]); 
        
        if(product.length === 0){
            return res.status(404).json({error : "Product not found"});
        }    

        res.status(200).json(product[0]); //as it return row and field, we only need data here.
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