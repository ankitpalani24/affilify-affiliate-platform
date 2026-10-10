import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

wishlistItemSchema.index({ productId: 1, sessionId: 1 });
wishlistItemSchema.index({ productId: 1, userId: 1 });

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema, 'wishlist_items');
export default WishlistItem;
