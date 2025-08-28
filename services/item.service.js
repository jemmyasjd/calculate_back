const Item = require("../models/item.model");
const { generateFormId } = require("../utils/formid");
const mongoose = require("mongoose");

class ItemService {

  toUTC = (date) => {
    const offsetMinutes = 330;
    return new Date(date.getTime() - offsetMinutes * 60 * 1000);
  };


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

    // --- WEEK RANGE (Monday 00:00 IST → Sunday 23:59 IST) ---
    const istWeekStart = new Date(istToday);
    const day = istToday.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const diffToMonday = day === 0 ? -6 : 1 - day; // if Sunday, go back 6 days
    istWeekStart.setDate(istToday.getDate() + diffToMonday);
    istWeekStart.setHours(0, 0, 0, 0);
    const startOfWeekUTC = toUTC(istWeekStart);

    const istWeekEnd = new Date(istWeekStart);
    istWeekEnd.setDate(istWeekEnd.getDate() + 6);
    istWeekEnd.setHours(23, 59, 59, 999);
    const endOfWeekUTC = toUTC(istWeekEnd);

    // --- MONTH RANGE (1st day IST → till now) ---
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

    const weekTotal = await getTotal({
      createdAt: { $gte: startOfWeekUTC, $lte: endOfWeekUTC },
    });

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

    const istToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTodayUTC = this.toUTC(istToday);

    const items = await Item.find({
      user_id: userObjectId,
      createdAt: { $gte: startOfTodayUTC },
    }).sort({ createdAt: -1 });

    const total = items.reduce((sum, item) => sum + item.totalprice, 0);

    return { items, total };
  }

  async getThisWeekItems(userId) {
    if (!userId) {
      throw new Error("User ID missing");
    }

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const now = new Date();

    // Calculate Monday (start of week)
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diffToMonday = day === 0 ? -6 : 1 - day; // if Sunday, go back 6 days
    const monday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diffToMonday
    );

    // Start of Monday 00:00 IST
    const startOfWeekUTC = this.toUTC(new Date(monday.setHours(0, 0, 0, 0)));

    // End of Sunday 23:59 IST
    const sunday = new Date(startOfWeekUTC);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    const endOfWeekUTC = new Date(sunday.setUTCHours(23, 59, 59, 999));

    const items = await Item.find({
      user_id: userObjectId,
      createdAt: { $gte: startOfWeekUTC, $lte: endOfWeekUTC },
    }).sort({ createdAt: -1 });

    const total = items.reduce((sum, item) => sum + item.totalprice, 0);

    return { items, total };
  }

  async getItemsByDate(userId, dateStr) {
    if (!userId) {
      throw new Error("User ID missing");
    }
    if (!dateStr) {
      throw new Error("Date missing");
    }

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const inputDate = new Date(dateStr); // e.g. "2025-08-25"
    if (isNaN(inputDate)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // Start of day IST
    const startOfDayUTC = this.toUTC(
      new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())
    );

    // End of day IST
    const endOfDayUTC = this.toUTC(
      new Date(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

    const items = await Item.find({
      user_id: userObjectId,
      createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC },
    }).sort({ createdAt: -1 });

    const total = items.reduce((sum, item) => sum + item.totalprice, 0);

    return { items, total };
  }

  async getMonthItems(userId, { page = 1, limit = 20, search = "", month, year }) {
    if (!userId) {
      throw new Error("User ID missing");
    }

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const now = new Date();

    // If month/year not provided, use current month
    const m = month ? Number(month) - 1 : now.getMonth(); // month is 0-indexed
    const y = year ? Number(year) : now.getFullYear();

    // First day of given month
    const firstDayOfMonth = new Date(y, m, 1);
    const startOfMonthUTC = this.toUTC(
      new Date(firstDayOfMonth.setHours(0, 0, 0, 0))
    );

    // Last day of given month
    const lastDayOfMonth = new Date(y, m + 1, 0);
    const endOfMonthUTC = this.toUTC(
      new Date(lastDayOfMonth.setHours(23, 59, 59, 999))
    );

    // Pagination
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      user_id: userObjectId,
      createdAt: { $gte: startOfMonthUTC, $lte: endOfMonthUTC },
    };

    if (search && search.trim()) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    // Total count (after filter)
    const total = await Item.countDocuments(query);

    // Paginated items
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Sum totalprice
    const sum = await Item.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$totalprice" } } },
    ]);
    const totalPrice = sum.length > 0 ? sum[0].total : 0;

    return { items, total, totalPrice };
  }

  async getOverallExpense(userId, { page = 1, limit = 20, search = "", month, year }) {
    if (!userId) {
      throw new Error("User ID missing");
    }

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const now = new Date();
    let startDate, endDate;

    if (year && !month) {
      // Entire year
      const y = Number(year);
      startDate = new Date(y, 0, 1, 0, 0, 0, 0);
      endDate = new Date(y, 11, 31, 23, 59, 59, 999);
    } else if (month) {
      // Month + Year (or current year if not provided)
      const y = year ? Number(year) : now.getFullYear();
      const m = Number(month) - 1;

      startDate = new Date(y, m, 1, 0, 0, 0, 0);
      endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
    }

    // Build query
    const query = { user_id: userObjectId };

    if (startDate && endDate) {
      query.createdAt = { $gte: this.toUTC(startDate), $lte: this.toUTC(endDate) };
    }

    if (search && search.trim()) {
      query.name = { $regex: search, $options: "i" };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Count
    const total = await Item.countDocuments(query);

    // Items
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total sum
    const sum = await Item.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$totalprice" } } },
    ]);

    const totalPrice = sum.length > 0 ? sum[0].total : 0;

    return { items, total, totalPrice };
  }



}

module.exports = new ItemService();
