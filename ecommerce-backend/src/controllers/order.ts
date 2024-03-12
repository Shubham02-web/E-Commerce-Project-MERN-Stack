import { Request } from "express";
import { TryCatch } from "../middleware/error.js";
import { newOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { InvalidateCache, reduceStock } from "../utils/features.js";
import { tr } from "@faker-js/faker";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { json } from "stream/consumers";
import { Error } from "mongoose";
import { nextTick } from "process";

export const myOrders = TryCatch(async(req,res,next)=>{
    const { id:user } = req.query;

    const key = `my-orders-${user}`;
    let orders=[];
    if(myCache.has(key)) orders=JSON.parse(myCache.get(key) as string);
    else{
        orders = await Order.find({user}).populate("user","name");
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(200).json({
        success:true,
        orders,
    })
})

export const AllOrders = TryCatch(async(req,res,next)=>{

    const key = `all-orders`;
    let  orders = [];
    if(myCache.has(key)) orders=JSON.parse(myCache.get(key) as string);
    else{
        orders=await Order.find().populate("user","name");
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(200).json({
        success:true,
        orders,
    });
});

export const getSingleOrder= TryCatch(async(req,res,next)=>{

    const {id}=req.params;
    const key = `order-${id}`;
    let  order;
    if(myCache.has(key)) order=JSON.parse(myCache.get(key) as string);
    else{
        order=await Order.findById(id).populate("user","name");
        if(!order) return next(new ErrorHandler("orders not found",400));
        myCache.set(key,JSON.stringify(order));
    }

    return res.status(200).json({
        success:true,
        order,
    });
});

export const newOrder = TryCatch (async(req:Request<{},{},newOrderRequestBody>,res,next)=>{
    const {ShipingInfo,orderItems,user,subtotal,tax,shippingCharges,discount,total,} = req.body;
    if(  !ShipingInfo
        || !orderItems
        || !user 
        || !subtotal
        || !tax
        || !total  )
    
        return next(new ErrorHandler("Please Enter All Fields",400));
   const order = await Order.create({
        ShipingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    })
    
    await reduceStock(orderItems);
    
    await InvalidateCache({product:true,order:true,admin:true,userId:user,productId:order.orderItems.map((i)=>String(i.productId))});
    
    return res.status(201).json({
        success:true,
        message:"Order Placed Succesfully",
    })
    });
    
    export const processOrder = TryCatch(async(req,res,next)=>{
        const {id} = req.params;

        const order= await Order.findById(id);
        if(!order)  return next(new ErrorHandler("Order Not Found",404));

        switch (order.status) {
            case "Proccessing" : 
                        order.status="Shipped";
                        break;
            case "Shipped" :
                        order.status="Deliverd";
                        break;
            default:
                        order.status = "Deliverd";
                        break;
        }

        await order.save();
        await InvalidateCache({product:false,order:true,admin:true,userId:order.user,orderId:String(order._id)});

        res.status(200).json({
            success:true,
            message:"order Processed successfully",
        });
    });

    export const deleteOrder = TryCatch(async(req,res,next)=>{
        const {id}  = req.params;

        const order = await Order.findById(id);
        if(!order) return next(new ErrorHandler("Product not found",404));
        await order.deleteOne();
        await InvalidateCache({product:false,order:true,admin:true,userId:order.user,orderId:String(order._id)});
        res.status(200).json({
            success:true,
            message:"order Delete successfully",
        })
    })