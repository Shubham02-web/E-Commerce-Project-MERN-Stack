import express from "express";
import { Coupon } from "../models/coupon.js";
import {
  appllyDiscount,
  createPaymentIntent,
  deleteCoupon,
  getAllCoupon,
  newCoupon,
} from "../controllers/payment.js";
import { adminOnly } from "../middleware/auth.js";
const app = express.Router();

//  Creating  Payment  route = - /api/v1/payment/create
app.post("/create", createPaymentIntent);
//  checking or appllying  Coupon Code  route = - /api/v1/payment/discount
app.get("/discount", appllyDiscount);

//  Creating Coupon Code  route = - /api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupon);

// geting all posible coupons  route = /api/v1/payment/coupon/all

app.get("/coupon/all", adminOnly, getAllCoupon);

// deleting coupon using coupon id route = /api/v1/payment/coupon/id

app.delete("/coupon/:id", adminOnly, deleteCoupon);
export default app;
