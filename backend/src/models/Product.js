import mongoose from 'mongoose';
import slugify from 'slugify';

export const AMAZON_URL_REGEX = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:amazon\.(?:in|com|co\.uk|de|fr|it|es|ca|co\.jp)|amzn\.(?:to|in))\/.+/i;
export const ASIN_REGEX = /^[A-Z0-9]{10}$/i;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [300, 'Product name cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive'],
      default: null,
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic',
      index: true,
    },
    features: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    platform: {
      type: String,
      default: 'amazon',
      trim: true,
      index: true,
    },
    asin: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    externalProductId: {
      type: String,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    affiliateUrl: {
      type: String,
      required: [true, 'Affiliate URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          const plat = (this.platform || this.affiliatePlatform || 'amazon').toLowerCase();
          if (plat === 'amazon') {
            return AMAZON_URL_REGEX.test(v);
          }
          return true;
        },
        message: (props) =>
          `Invalid affiliate URL for Amazon platform: "${props.value}". Must be a valid Amazon URL (e.g. https://www.amazon.in/dp/ASIN?tag=...). Marketplace URLs from Myntra, Flipkart, or third-party stores are strictly rejected.`,
      },
    },
    availability: {
      type: String,
      default: 'In Stock',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    lastSyncStatus: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate: category -> Category model via categoryId
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Virtual alias: affiliatePlatform -> platform
productSchema.virtual('affiliatePlatform')
  .get(function () {
    return this.platform || 'Amazon';
  })
  .set(function (val) {
    this.platform = val;
  });

// Pre-validate hook: auto slug generation & discount calculation
productSchema.pre('validate', function () {
  if (!this.categoryId && this.category) {
    this.categoryId = this.category;
  }
  if (!this.platform && this.affiliatePlatform) {
    this.platform = this.affiliatePlatform;
  }
  if (this.platform && this.platform.toLowerCase() === 'amazon') {
    this.platform = 'amazon';
  }

  // Amazon-only validation and ASIN extraction
  const plat = (this.platform || this.affiliatePlatform || 'amazon').toLowerCase();
  if (plat === 'amazon') {
    if (this.affiliateUrl && !AMAZON_URL_REGEX.test(this.affiliateUrl)) {
      this.invalidate('affiliateUrl', `Invalid affiliate URL for Amazon platform: "${this.affiliateUrl}". Non-Amazon URLs (Flipkart, Myntra, etc.) are strictly prohibited.`);
    }

    // Auto-extract ASIN from Amazon URL if not set
    const urlAsinMatch = this.affiliateUrl ? this.affiliateUrl.match(/(?:\/dp\/|\/gp\/product\/|\/product\/)([A-Z0-9]{10})(?:[/?#]|$)/i) : null;
    const extractedAsin = urlAsinMatch ? urlAsinMatch[1].toUpperCase() : null;

    if (!this.asin && extractedAsin) {
      this.asin = extractedAsin;
    }

    if (this.asin) {
      this.asin = this.asin.toUpperCase();
      if (!ASIN_REGEX.test(this.asin)) {
        this.invalidate('asin', `Invalid Amazon ASIN: "${this.asin}". Must be a valid 10-character alphanumeric identifier.`);
      }
      if (extractedAsin && this.asin !== extractedAsin) {
        this.invalidate('asin', `ASIN mismatch: Stored ASIN (${this.asin}) does not match ASIN extracted from affiliate URL (${extractedAsin}).`);
      }
    }
  }

  if (this.isModified('name') || !this.slug) {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
  }

  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  if (!this.externalProductId && this.asin) {
    this.externalProductId = this.asin;
  }
  if (!this.asin && this.externalProductId) {
    this.asin = this.externalProductId;
  }
  if (!this.sourceUrl && this.asin) {
    this.sourceUrl = `https://www.amazon.in/dp/${this.asin}`;
  }
});

// Full-text search index
productSchema.index({
  name: 'text',
  brand: 'text',
  shortDescription: 'text',
  tags: 'text',
});

// Compound unique index on platform + asin (only applies when asin is present)
productSchema.index(
  { platform: 1, asin: 1 },
  {
    unique: true,
    partialFilterExpression: { asin: { $type: 'string' } },
    name: 'unique_platform_asin',
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
