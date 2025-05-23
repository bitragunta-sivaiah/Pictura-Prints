import express from 'express';
import Banner from '../models/bannerModel.js';

const router = express.Router();

// GET all banners and advertisements
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific banner/advertisement by bannerNumber
router.get('/byNumber/:bannerNumber', async (req, res) => {
  try {
    const banner = await Banner.findOne({ bannerNumber: req.params.bannerNumber });
    if (!banner) {
      return res.status(404).json({ message: 'Banner/Advertisement not found' });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific banner/advertisement by ID
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner/Advertisement not found' });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new banner/advertisement
router.post('/', async (req, res) => {
  const banner = new Banner({
    title: req.body.title,
    description: req.body.description,
    bannerNumber: req.body.bannerNumber,
    postBg:req.body.postBg,
    desktopImage: req.body.desktopImage,
    mobileImage: req.body.mobileImage,
    position: req.body.position,
    imageUrl: req.body.imageUrl,
    navigateLink: req.body.navigateLink,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    isActive: req.body.isActive,
    priority: req.body.priority,
    // 'location' is no longer part of the model
  });

  try {
    const newBanner = await banner.save();
    res.status(201).json(newBanner);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.bannerNumber) {
      res.status(400).json({ message: 'Banner number already exists' });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// PATCH a banner/advertisement by bannerNumber
router.patch('/byNumber/:bannerNumber', async (req, res) => {
  try {
    const banner = await Banner.findOne({ bannerNumber: req.params.bannerNumber });
    if (!banner) {
      return res.status(404).json({ message: 'Banner/Advertisement not found' });
    }

    if (req.body.title) banner.title = req.body.title;
    if (req.body.description) banner.description = req.body.description;
    if (req.body.desktopImage) banner.desktopImage = req.body.desktopImage;
    if (req.body.mobileImage) banner.mobileImage = req.body.mobileImage;
    if (req.body.position) banner.position = req.body.position;
    if (req.body.imageUrl) banner.imageUrl = req.body.imageUrl;
    if (req.body.navigateLink) banner.navigateLink = req.body.navigateLink;
    if (req.body.startDate) banner.startDate = req.body.startDate;
    if (req.body.endDate) banner.endDate = req.body.endDate;
    if (req.body.isActive !== undefined) banner.isActive = req.body.isActive;
    if (req.body.priority) banner.priority = req.body.priority;
    if (req.body.postBg) banner.postBg = req.body.postBg;
    // 'location' is no longer updated

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a banner/advertisement by bannerNumber
router.delete('/byNumber/:bannerNumber', async (req, res) => {
  try {
    const banner = await Banner.findOneAndDelete({ bannerNumber: req.params.bannerNumber });
    if (!banner) {
      return res.status(404).json({ message: 'Banner/Advertisement not found' });
    }
    res.json({ message: 'Banner/Advertisement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a banner/advertisement by ID
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner/Advertisement not found' });
    }
    res.json({ message: 'Banner/Advertisement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;