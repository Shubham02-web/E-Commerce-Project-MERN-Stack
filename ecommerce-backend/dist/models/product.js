import mongoose from "mongoose";
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Name"],
    },
    photo: {
        type: String,
        required: [true, "please Enter Photo"],
    },
    price: {
        type: Number,
        required: [true, "Please Enter Price"],
    },
    stock: {
        type: Number,
        required: [true, "Please Enter Stock"],
    },
    category: {
        type: String,
        required: [true, "please Enter product category"],
        trim: true,
    },
}, {
    timestamps: true,
});
export const Product = mongoose.model("Product", schema);
