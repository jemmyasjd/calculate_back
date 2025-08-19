const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalprice: {
      type: Number,
      required: true,
      min: 0,
    },
    form_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
