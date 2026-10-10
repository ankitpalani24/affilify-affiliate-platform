import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.pre('validate', function () {
  if (this.isModified('name') || !this.slug) {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }
  }
});

categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
