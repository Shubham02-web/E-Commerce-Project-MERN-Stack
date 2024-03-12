import { NextFunction,Request,Response } from "express";
export  interface newUserRequestBody{
        name:string;
        email:string;
        photo:string;
        gender:string;
        _id:string;
        dob:Date;

}

export interface newProductRequestBody{
        name:string;
        category:string;
        price:number;
        stock:number;
}


export type ControllerType = (req: Request, 
        res: Response,
         next: NextFunction
         ) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery={
                search?:string;
                price?:string;
                category?:string;
                sort?:string;
                page?:string;
         }

export interface BaseQuery{
        name?:{
                $regex:string;
                $options:string;
        };
        price?:{$lte:number};
        category?:string;
}

export type InvalidateCacheProps = {
product?:boolean;
order?:boolean;
admin?:boolean;
userId?:string;
orderId?:string;
productId?:string|string[];
}

export type orderItemType = {
        name:string;
        photo:string;
        price:number;
        quantity:number;
        productId:string;
}
export type ShipingInfoType = {
        address:string;
        city:string;
        state:string;
        country:string;
        pincode:number;

}
export interface newOrderRequestBody{
        ShipingInfo:ShipingInfoType;
        user : string;
        subtotal :number;
        tax : number;
        shippingCharges:number;
        discount:number;
        total:number;
        orderItems:orderItemType[];

}