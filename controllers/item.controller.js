const asyncHandler = require("express-async-handler");
const itemService = require("../services/item.service");

class ItemController {

  createItems = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.userid;
      const { items } = req.body;

      const result = await itemService.createItems(userId, items);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Something went wrong",
      });
    }
  });

  getAnalytics = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.userid;

      const result = await itemService.getAnalytics(userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Something went wrong",
      });
    }
  });

 getTodayItems = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userid;
    const result = await itemService.getTodayItems(userId);

    return res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
});

getThisWeekItems = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userid;
    const result = await itemService.getThisWeekItems(userId);

    return res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
});

getItemsByDate = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userid;
    const { date } = req.body; 

    const result = await itemService.getItemsByDate(userId, date);

    return res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
});

getMonthItems = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userid;
    const { page, limit, search, month, year } = req.body;

    const result = await itemService.getMonthItems(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: search || "",
      month,
      year,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      totalItems: result.total,      // total count for pagination
      totalPrice: result.totalPrice, // sum of totalprice
      currentPage: Number(page) || 1,
      pageSize: Number(limit) || 20,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
});

getOverallExpense = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.userid;
    const { page, limit, search, month, year } = req.body;

    const result = await itemService.getOverallExpense(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: search || "",
      month,
      year,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      totalItems: result.total,
      totalPrice: result.totalPrice,
      currentPage: Number(page) || 1,
      pageSize: Number(limit) || 20,
      filter: {
        month: month || null,
        year: year || null,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
});




}

module.exports = new ItemController();
