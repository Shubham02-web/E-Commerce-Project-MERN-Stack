//  Middle Ware TO make sure only admin is allowed
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("please login first", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("please enter correct Id", 401));
    if (user.role !== "admin")
        return next(new ErrorHandler("you are not admin , only admin have access to accesss and process data ", 401));
    next();
});
