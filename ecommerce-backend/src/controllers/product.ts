import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/error.js";
import { BaseQuery, SearchRequestQuery, newProductRequestBody } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { faker } from "@faker-js/faker";
import { count } from "console";
import { myCache } from "../app.js";
import { json } from "stream/consumers";
import { InvalidateCache } from "../utils/features.js";

    


// revalidate on New,Update,Delete Product & on new Order
export const getLatestProduct=TryCatch(async(req,res,next)=>{
    let products;
    if(myCache.has("latest-product"))
    
    products =JSON.parse(myCache.get("latest-product") as string);
    
    else{
     products = await Product.find({}).sort({createdAt:-1}).limit(10);
    myCache.set("latest-product",JSON.stringify(products));
    }
    return res.status(200).json({
        success:true,
        products,
    })
    });

    // revalidate on New,Update,Delete Product & on new Order
    export const getAllCategories=TryCatch(async(req,res,next)=>{
        let categories;
        if(myCache.has("categories"))
        categories = JSON.parse(myCache.get("categories") as string);
        else
     {
        categories = await Product.distinct("category");
        myCache.set("categories",JSON.stringify(categories));
    }
     return res.status(200).json({
            success:true,
           categories ,
        })
        });
        
        // revalidate on New,Update,Delete Product & on new Order

    export const getAdminProducts=TryCatch(async(req,res,next)=>{
        let AllProducts;
        if(myCache.has("AllProducts"))
        AllProducts = JSON.parse(myCache.get("AllProducts") as string);
    else{
         AllProducts = await Product.find({});
         myCache.set("AllProducts",JSON.stringify(AllProducts));
        }
    return res.status(200).json({
            success:true,
            AllProducts,
        });
    });

    export const getSingleProducts=TryCatch(async(req,res,next)=>{
        let product;
        const id= req.params.id;
        if(myCache.has(`proudct-${id}`))
        product = JSON.stringify(myCache.get(`proudct-${id}`)as string)
        else{
         product = await Product.findById(id);
         myCache.set(`proudct-${id}`,JSON.stringify(product));
        }
        if(!product) return next(new ErrorHandler("Product Not Found",404));

        return res.status(200).json({
            success:true,
            product,
        })
    })


    export const newProduct=TryCatch(async(req:Request<{},{},newProductRequestBody>,
        res:Response,next:NextFunction)=>{
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

    await InvalidateCache({product:true});
    
    return res.status(201).json({
        success:true,
        message:"Product created Successfully",
    })
    });
    
    
    

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
        await InvalidateCache({product:true});
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
            console.log("Product Photo Deleted")
        });

        await Product.deleteOne({_id:id});
        await InvalidateCache({product:true});

        res.status(200).json({
            success:true,
            message:"Product Deleted Successfully",
        })

    })

    export const getAllProducts=TryCatch(async(req:Request<{},{},{},SearchRequestQuery>,res,next)=>{
 

        const {search,sort,category,price} =req.query;
        const page=Number(req.query.page) || 1;
        const limit=Number(process.env.PRODUCT_PER_PAGE) || 8 ;
        const skip = limit * (page-1);

        const baseQuery:BaseQuery = {} ;

        if(search)
            baseQuery.name = {
                $regex:search,
                $options:"i",
            };
        if(price) baseQuery.price= {
            $lte:Number(price),
        };

        if(category) baseQuery.category = category;
        
        const productPromise =await Product.find(baseQuery).sort(sort && {price:sort === "asc" ? 1 : -1}).limit(limit).skip(skip);
        const [products,filteredOnlyProject] =await Promise.all([
            productPromise,
            Product.find(baseQuery),
        ]);

        const totalPage = Math.ceil(filteredOnlyProject.length / limit);

        if(!products) return next(new ErrorHandler("product not found",400));
        return res.status(200).json({
            success:true,
            products,
            totalPage,
        });
    });


    // const generateRandomProducts = async(count:number = 10) =>{
        // const products = [];

        // for (let i=0;i<count;i++){
            // const product = {
                // name:faker.commerce.productName(),
                // photo:"uploads\\71d2a743-4ecd-4bd8-94bd-9a7a625314f0.jpg",
                // price:faker.commerce.price({min : 1500,max:80000,dec:0}),
                // stock:faker.commerce.price({min:0,max:100,dec:0}),
                // category:faker.commerce.department(),
                // createdAt:new Date(faker.date.past()),
                // updatedAt:new Date(faker.date.recent()),
                // __v:0,

            // };
            // products.push(product);
        // }
        // await Product.create(products);
        // console.log({success:true});
    // };
 

    // function to delete all fake products

    // const deleteRandomProduct = async(count:number = 10 )=>{
        // const products =await Product.find({}).skip(2);

        // for (let i=0;i<products.length;i++){
            // const product=products[i];
            // await product.deleteOne();
        // }
        // console.log({success:true});
    // }