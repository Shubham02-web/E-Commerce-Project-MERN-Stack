import mongoose from "mongoose";
const schema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "please enter the coupon code"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please Enter The Discount Amount"],
    },
});
export const Coupon = mongoose.model("Coupon", schema);
