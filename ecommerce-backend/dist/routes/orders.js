import express from 'express';
import { newOrder } from '../controllers/order.js';
const app = express.Router();
// created new products - /api/v1/product/new
app.post("/new", newOrder);
export default app;
