import mongoose from 'mongoose';

const posterAdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  navigateLink: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    enum: ['homepage', 'product-listing', 'product-detail', 'checkout', 'other'],
    default: 'homepage',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const PosterAd = mongoose.model('PosterAd', posterAdSchema);

export default PosterAd;