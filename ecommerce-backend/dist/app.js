// api oops inheritence function overriding and all
import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middleware/error.js';
import NodeCache from 'node-cache';
// import route from routes/user.js
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
const PORT = 10000;
connectDB();
export const myCache = new NodeCache();
const app = express();
app.use(express.json());
app.get("/", function (req, res) {
    res.send("API Working with /api/v1");
});
// Using Route
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`Express is working on http://localhost:${PORT}`);
});
