import { User } from "../models/user.js";
export const newUser = async (req, res, next) => {
    try {
        const { name, email, photo, gender, _id, dob } = req.body;
        const user = await User.create({
            name,
            email,
            photo,
            gender,
            _id,
            dob
        });
        return res.status(200).json({
            success: true,
            messge: `wel-come,${user.name}`,
        });
    }
    catch (error) {
        return res.status(200).json({
            success: false,
            messge: error,
        });
    }
    ;
};
