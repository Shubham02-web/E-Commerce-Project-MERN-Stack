import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema({
    ShipingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
    },
    user: {
        type: String,
        ref: "user",
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true,
    },
    shippingCharges: {
        type: Number,
        default: 0,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Proccessing", "Shipped", "Deliverd"],
        default: "Proccessing",
    },
    orderItems: [
        {
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product",
            },
        },
    ],
}, {
    timestamps: true,
});
export const Order = mongoose.model("Orders", OrderSchema);
