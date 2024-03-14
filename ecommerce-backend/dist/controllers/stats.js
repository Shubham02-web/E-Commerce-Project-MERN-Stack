import { myCache } from "../app.js";
import { TryCatch } from "../middleware/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getChartData, getInventories, } from "../utils/features.js";
export const getDashboardStats = TryCatch(async (req, res, next) => {
    const key = "admin-stats";
    let stats = {};
    if (myCache.has(key))
        stats = JSON.stringify(myCache.get(key));
    else {
        const today = new Date();
        const SixMonthsAgo = new Date();
        SixMonthsAgo.setMonth(SixMonthsAgo.getMonth() - 6);
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0),
        };
        const ThisMonthProductsPromise = await Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const LastMonthProductsPromise = await Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const ThisMonthUsersPromise = await User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const LastMonthUsersPromise = await User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const ThisMonthOrdersPromise = await Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const LastMonthOrdersPromise = await Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const LastSixMonthsOrdersPromise = await Order.find({
            createdAt: {
                $gte: SixMonthsAgo,
                $lte: today,
            },
        });
        const latestTransactionsPromise = Order.find({})
            .select(["discount", "total", "status", "orderItems"])
            .limit(4);
        const [ThisMonthProducts, ThisMonthUsers, ThisMonthOrders, LastMonthProducts, LastMonthUsers, LastMonthOrders, ProductCount, UserCount, AllOrders, LastSixMonthsOrders, categories, femaleUserCount, latestTransactions,] = await Promise.all([
            ThisMonthProductsPromise,
            ThisMonthUsersPromise,
            ThisMonthOrdersPromise,
            LastMonthProductsPromise,
            LastMonthUsersPromise,
            LastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            LastSixMonthsOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: "Female" }),
            latestTransactionsPromise,
        ]);
        const thisMonthRevenue = ThisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevenue = LastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const changePercentage = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(ThisMonthProducts.length, LastMonthProducts.length),
            user: calculatePercentage(ThisMonthUsers.length, LastMonthUsers.length),
            order: calculatePercentage(ThisMonthOrders.length, LastMonthOrders.length),
        };
        const revenue = AllOrders.reduce((total, order) => total + (order.total || 0), 0);
        const count = {
            revenue,
            product: ProductCount,
            user: UserCount,
            order: AllOrders.length,
        };
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        LastSixMonthsOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
            if (monthDiff < 6) {
                orderMonthCounts[5 - monthDiff] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        const categoryCount = await getInventories({ categories, ProductCount });
        const userRatio = {
            male: UserCount - femaleUserCount,
            female: femaleUserCount,
        };
        const modifiedLatestTransaction = latestTransactions.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }));
        stats = {
            categoryCount,
            changePercentage,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue,
            },
            userRatio,
            latestTransactions: modifiedLatestTransaction,
        };
        myCache.set(key, JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        stats,
    });
});
export const getPieCharts = TryCatch(async (req, res, next) => {
    const key = "admin-pie-charts";
    let charts;
    if (myCache.has(key))
        charts = JSON.parse(myCache.get(key));
    else {
        const allOrderPromise = Order.find({}).select([
            "total",
            "discount",
            "subtotal",
            "tax",
            "shippingCharges",
        ]);
        const [ProccessingOrder, ShippedOrder, DeliverdOrder, categories, ProductCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers,] = await Promise.all([
            Order.countDocuments({ status: "Proccessing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Deliverd" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ]);
        const OrderFullfillment = {
            Proccessing: ProccessingOrder,
            Shipped: ShippedOrder,
            Deliverd: DeliverdOrder,
        };
        const Productcategories = await getInventories({
            categories,
            ProductCount,
        });
        const stockAvailiblity = {
            inStock: ProductCount - outOfStock,
            outOfStock,
        };
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const ProductionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - ProductionCost - burnt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            ProductionCost,
            burnt,
            marketingCost,
        };
        const userAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        };
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };
        charts = {
            OrderFullfillment,
            Productcategories,
            stockAvailiblity,
            revenueDistribution,
            adminCustomer,
            userAgeGroup,
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
export const getBarCharts = TryCatch(async (req, res, next) => {
    const key = "Admin-bar-chart";
    let charts;
    if (myCache.has(key))
        charts = JSON.parse(myCache.get(key));
    else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const sixMonthProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const TwelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const [products, users, orders] = await Promise.all([
            sixMonthProductsPromise,
            sixMonthUsersPromise,
            TwelveMonthOrdersPromise,
        ]);
        const productCounts = getChartData({ length: 6, today, docArr: products });
        const userCounts = getChartData({ length: 6, today, docArr: users });
        const orderCounts = getChartData({ length: 12, today, docArr: orders });
        charts = {
            users: userCounts,
            products: productCounts,
            orders: orderCounts,
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
export const getLineCharts = TryCatch(async (req, res, next) => {
    const key = "Admin-Line-chart";
    let charts;
    if (myCache.has(key))
        charts = JSON.parse(myCache.get(key));
    else {
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        };
        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ]);
        const productCounts = getChartData({ length: 12, today, docArr: products });
        const userCounts = getChartData({ length: 12, today, docArr: users });
        const discount = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "discount",
        });
        const revenue = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "total",
        });
        charts = {
            users: userCounts,
            products: productCounts,
            discount,
            revenue,
        };
    }
    res.status(200).json({
        success: true,
        charts,
    });
});
