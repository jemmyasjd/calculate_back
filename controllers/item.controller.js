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



}

module.exports = new ItemController();
