import mongoose from 'mongoose';

const affiliateClickSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    platform: {
      type: String,
      default: 'amazon',
      trim: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias product -> productId
affiliateClickSchema.virtual('product')
  .get(function () {
    return this.productId;
  })
  .set(function (p) {
    this.productId = p;
  });

const AffiliateClick = mongoose.model('AffiliateClick', affiliateClickSchema, 'affiliate_clicks');
export default AffiliateClick;
