import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

priceHistorySchema.index({ productId: 1, recordedAt: -1 });

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema, 'price_history');
export default PriceHistory;
