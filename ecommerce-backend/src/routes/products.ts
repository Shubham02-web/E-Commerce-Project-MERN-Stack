import express from 'express';
import { adminOnly } from '../middleware/auth.js';
import { deleteProduct, getAdminProducts, getAllCategories,  getAllProducts,  getLatestProduct, getSingleProducts, newProduct, updateProduct } from '../controllers/product.js';
import { singleUpload } from '../middleware/multer.js';
const app=express.Router();

// created new products - /api/v1/product/new
app.post("/new",adminOnly,singleUpload,newProduct);

// to get all products with filters  - /api/v1/product/all

app.get("/all",getAllProducts);
// to get last 10 products - /api/v1/product/latest
app.get("/latest",getLatestProduct);

// to get all the categories of products -/api/v1/product/categories
app.get("/categories",getAllCategories);

// to get admin-products -/api/v1/product/admin-Products
app.get("/admin-Products",adminOnly,getAdminProducts);

app.route("/:id").get(getSingleProducts).put(adminOnly,singleUpload,updateProduct).delete(adminOnly,deleteProduct);


export default app;