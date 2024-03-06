import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { newProductRequestBody } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";

export const newProduct=TryCatch(async(req:Request<{},{},newProductRequestBody>,res:Response,next:NextFunction)=>{
const {name,price,stock,category} = req.body;
const photo = req.file;

if(!photo) return next(new ErrorHandler("please add photo",400));
if(!name || !price || !stock || !category)
{
    rm(photo.path,()=>{
        console.log("Deleted");
    })
return next(new ErrorHandler("plaese enter all fields",400));
}
await Product.create({
    name,
    price,
    stock,
    category:category.toLowerCase(),
    photo:photo?.path,

});

return res.status(201).json({
    success:true,
    message:"Product created Successfully",
})
});
export const getLatestProduct=TryCatch(async(req,res,next)=>{
    
    const products = await Product.find({}).sort({createdAt:-1}).limit(10);
    return res.status(200).json({
        success:true,
        products,
    })
    });

    export const getAllCategories=TryCatch(async(req,res,next)=>{
    const categories = await Product.distinct("category");
        return res.status(200).json({
            success:true,
           categories ,
        })
        });
        
    export const getAdminProducts=TryCatch(async(req,res,next)=>{
        const AllProducts = await Product.find({});
        return res.status(200).json({
            success:true,
            AllProducts,
        });
    });

    export const getSingleProducts=TryCatch(async(req,res,next)=>{
        const product = await Product.findById(req.params.id);

        if(!product) return next(new ErrorHandler("Product Not Found",404));

        return res.status(200).json({
            success:true,
            product,
        })
    })

    export const updateProduct=TryCatch(async(req,res,next)=>{
        const {id}=req.params;
        const {name,price,stock,category}=req.body;
        const photo=req.file;

        const product = await Product.findById(id);

        if(!product) return next(new ErrorHandler("Product Not Found",404));

        if(photo){
            rm(product.photo!,()=>{
                console.log("old photo deleted");
            });
            product.photo = photo.path;
        }
        if(name) product.name=name;
        if(price) product.price=price;
        if(stock) product.stock=stock;
        if(category) product.category=category;

        await product.save();

       return res.status(200).json({
            success:true,
            message:"Product Updated Successfully",
        });
    });

    export const deleteProduct = TryCatch(async (req,res,next)=>{
        const id = req.params.id;
        const product = await Product.findById(id);

        if(!product) return next(new ErrorHandler("Product not found",404));

        rm(product.photo!,()=>{
            console.log("Product Photo Deleted");
        })

        await Product.deleteOne({product});

        res.status(200).json({
            success:true,
            message:"Product Deleted Successfully",
        })

    })