import express from 'express';
import { adminOnly } from '../middleware/auth.js';
import { deleteProduct, getAdminProducts, getAllCategories, getLatestProduct, getSingleProducts, newProduct, updateProduct } from '../controllers/product.js';
import { singleUpload } from '../middleware/multer.js';
const app = express.Router();
// created new products - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);
// to get last 10 products - /api/v1/product/latest
app.get("/latest", getLatestProduct);
// to get all the categories of products -/api/v1/product/categories
app.get("/categories", getAllCategories);
// to get admin-products -/api/v1/product/admin-Products
app.get("/admin-Products", getAdminProducts);
app.route("/:id").get(getSingleProducts).put(singleUpload, updateProduct).delete(deleteProduct);
export default app;
