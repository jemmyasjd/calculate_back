const asyncHandler = require("express-async-handler");
const Item = require("../models/item.model");
const { generateFormId } = require("../utils/formid");

class ItemController {
  createItems = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.userid;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID missing",
        });
      }

      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Items array is required",
        });
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

      res.status(201).json({
        success: true,
        data: savedItems,
      });
    } catch (err) {
      console.error("Error in createItems:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  });
}

module.exports = new ItemController();
