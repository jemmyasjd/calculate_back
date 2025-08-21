const Item = require("../models/item.model");
const { generateFormId } = require("../utils/formid");
const mongoose = require("mongoose");

class ItemService {
  async createItems(userId, items) {
    if (!userId) {
      throw new Error("User ID missing");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Items array is required");
    }

    const formId = generateFormId();

    const newItems = items.map((item) => {
      if (
        !item.name ||
        item.price == null ||
        item.quantity == null ||
        item.totalprice == null
      ) {
        throw new Error("All fields are required for each item");
      }

      if (item.price < 0 || item.quantity < 1 || item.totalprice < 0) {
        throw new Error("Invalid price, quantity, or total price");
      }

      return {
        user_id: userId,
        name: item.name.trim(),
        price: item.price,
        quantity: item.quantity,
        totalprice: item.totalprice,
        form_id: formId,
      };
    });

    const savedItems = await Item.insertMany(newItems);
    return savedItems;
  }

  async getAnalytics(userId) {
    if (!userId) {
      throw new Error("User ID missing");
    }

    // ✅ normalize userId to ObjectId
    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const now = new Date();

    // helper to shift IST → UTC
    const toUTC = (date) => {
      const offsetMinutes = 330; // IST is UTC+5:30 = 330 mins
      return new Date(date.getTime() - offsetMinutes * 60 * 1000);
    };

    // start of today (IST)
    const istToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTodayUTC = toUTC(istToday);

    // start of week (IST, Sunday start)
    const istWeek = new Date(istToday);
    istWeek.setDate(istToday.getDate() - istToday.getDay());
    const startOfWeekUTC = toUTC(istWeek);

    // start of month (IST)
    const istMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthUTC = toUTC(istMonth);

    // aggregation helper
    const getTotal = async (match) => {
      const result = await Item.aggregate([
        { $match: { user_id: userObjectId, ...match } }, 
        { $group: { _id: null, total: { $sum: "$totalprice" } } },
      ]);
      return result.length > 0 ? result[0].total : 0;
    };

    const todayTotal = await getTotal({ createdAt: { $gte: startOfTodayUTC } });
    const weekTotal = await getTotal({ createdAt: { $gte: startOfWeekUTC } });
    const monthTotal = await getTotal({ createdAt: { $gte: startOfMonthUTC } });
    const grandTotal = await getTotal({});

    return {
      today: todayTotal,
      week: weekTotal,
      month: monthTotal,
      overall: grandTotal,
    };
  }

async getTodayItems(userId) {
  if (!userId) {
    throw new Error("User ID missing");
  }

  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const now = new Date();

  const toUTC = (date) => {
    const offsetMinutes = 330; 
    return new Date(date.getTime() - offsetMinutes * 60 * 1000);
  };

  const istToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTodayUTC = toUTC(istToday);

  const items = await Item.find({
    user_id: userObjectId,
    createdAt: { $gte: startOfTodayUTC },
  }).sort({ createdAt: -1 });

  const total = items.reduce((sum, item) => sum + item.totalprice, 0);

  return { items, total };
}


}

module.exports = new ItemService();
