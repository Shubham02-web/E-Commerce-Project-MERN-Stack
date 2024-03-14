import express from "express";
import {
  AllOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js";
import { adminOnly } from "../middleware/auth.js";
const app = express.Router();

// created new orders - /api/v1/order/new
app.post("/new", newOrder);

// Find My Orders - /api/v1/order/myOrders
app.get("/myOrders", myOrders);

// get all Orders - /api/v1/order/all
app.get("/all", adminOnly, AllOrders);
// Find My Orders - /api/v1/order/id
app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, processOrder)
  .delete(adminOnly, deleteOrder);

export default app;
