import mongoose from "mongoose";
const schema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please Enter Name"],
    },
    photo: {
        type: String,
        require: [true, "please Enter Photo"],
    },
    price: {
        type: Number,
        require: [true, "Please Enter Price"],
    },
    stock: {
        type: Number,
        require: [true, "Please Enter Stock"],
    },
    category: {
        type: String,
        require: [true, "please Enter product category"],
        trim: true,
    },
}, {
    timestamps: true,
});
export const Product = mongoose.model("Product", schema);
