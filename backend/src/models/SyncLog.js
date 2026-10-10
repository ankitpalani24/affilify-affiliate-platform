import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      default: 'amazon',
      trim: true,
    },
    syncType: {
      type: String,
      enum: ['manual', 'scheduled', 'product', 'bulk'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['started', 'success', 'partial', 'failed'],
      default: 'started',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    productsChecked: {
      type: Number,
      default: 0,
    },
    productsAdded: {
      type: Number,
      default: 0,
    },
    productsUpdated: {
      type: Number,
      default: 0,
    },
    productsFailed: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

syncLogSchema.index({ createdAt: -1 });

const SyncLog = mongoose.model('SyncLog', syncLogSchema, 'sync_logs');
export default SyncLog;
