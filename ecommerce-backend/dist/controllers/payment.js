import { TryCatch } from "../middleware/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";
import { stripe } from "../app.js";
export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new ErrorHandler("please enter amount", 404));
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr",
    });
    res.status(201).json({
        success: true,
        ClientSecret: paymentIntent.client_secret,
    });
});
export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new ErrorHandler("please enter both coupon and amount", 404));
    await Coupon.create({ code: coupon, amount });
    res.status(201).json({
        success: true,
        message: `coupon ${coupon} created succesfully`,
    });
});
export const appllyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ code: coupon });
    if (!discount)
        return next(new ErrorHandler("Invalid Coupon Code", 400));
    res.status(200).json({
        success: true,
        discount: discount.amount,
    });
});
export const getAllCoupon = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find({});
    res.status(200).json({
        success: true,
        coupons,
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid Coupon ID", 400));
    res.status(200).json({
        success: true,
        message: `coupon ${coupon.code} deleted Succcessfully`,
    });
});
