import mongoose  from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const connectDB = () =>{
    mongoose.connect("mongodb://localhost:27017",{dbName:"Ecommerce_Website",}).then((c)=>{
        console.log(`DB Connected to ${c.connection.host}`)
    }).catch((e)=>console.log(e));
};

export const InvalidateCache = async({product,order,admin}:InvalidateCacheProps) =>{
    if(product){
    const productKeys:string[] = ["latest-product","categories","AllProducts"];
    const products = await Product.find({}).select("_id");

    products.forEach((i)=>{
        productKeys.push(`product-${i._id}`);
    });
    myCache.del(productKeys);
}
if(order){

}
if(admin){

}
}