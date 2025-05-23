import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  bannerNumber: { type: Number, unique: true }, // Optional from original bannerSchema
  desktopImage: [String],
  mobileImage: [String],
  postBg:{type:String},
  position: {
    type: String,
    enum: [
      // Normal Banners
      'homepage_hero_banner',
      'homepage_featured_banner',
      'product_detail_top_banner',
      'product_category_sidebar_banner',
      'checkout_banner',
      'mobile_splash_screen_banner',
      'mobile_in_app_promo_banner',
      'user_dashboard_alert_banner',
      // Advertisements
      'homepage_advertisement',
      'product_listing_advertisement',
      'product_detail_advertisement',
      'checkout_advertisement',
      'other_advertisement',
    ],
  },
  imageUrl: { type: String, trim: true }, // From original posterAdSchema
  navigateLink: { type: String, trim: true }, // From original posterAdSchema
  startDate: { type: Date }, // From original posterAdSchema
  endDate: { type: Date }, // From original posterAdSchema
  isActive: { type: Boolean, default: true }, // From original posterAdSchema
  priority: { type: Number, default: 0 }, // From original posterAdSchema
  // Removed the 'location' field as the position now clarifies the type
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update updatedAt
BannerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Banner = mongoose.model('Banner', BannerSchema);

export default Banner;