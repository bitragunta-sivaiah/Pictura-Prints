import express from 'express';
import PosterAd from '../models/posterAdsModel.js';  

const router = express.Router();

// Route to get all active poster ads based on optional location and date filters
router.get('/active', async (req, res) => {
  try {
    const { location } = req.query;
    const now = new Date();
    const filter = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (location) {
      filter.location = location;
    }

    const activeAds = await PosterAd.find(filter).sort({ priority: -1 });
    res.status(200).json(activeAds);
  } catch (error) {
    console.error('Error fetching active poster ads:', error);
    res.status(500).json({ message: 'Failed to fetch active poster ads' });
  }
});

// Route to get a specific poster ad by ID
router.get('/:id', async (req, res) => {
  try {
    const posterAd = await PosterAd.findById(req.params.id);
    if (!posterAd) {
      return res.status(404).json({ message: 'Poster ad not found' });
    }
    res.status(200).json(posterAd);
  } catch (error) {
    console.error('Error fetching poster ad:', error);
    res.status(500).json({ message: 'Failed to fetch poster ad' });
  }
});

// Route to create a new poster ad
router.post('/', async (req, res) => {
  try {
    const newPosterAd = new PosterAd(req.body);
    const savedPosterAd = await newPosterAd.save();
    res.status(201).json(savedPosterAd);
  } catch (error) {
    console.error('Error creating poster ad:', error);
    res.status(400).json({ message: 'Failed to create poster ad', error: error.errors });
  }
});

// Route to update an existing poster ad by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPosterAd = await PosterAd.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );
    if (!updatedPosterAd) {
      return res.status(404).json({ message: 'Poster ad not found' });
    }
    res.status(200).json(updatedPosterAd);
  } catch (error) {
    console.error('Error updating poster ad:', error);
    res.status(400).json({ message: 'Failed to update poster ad', error: error.errors });
  }
});

// Route to delete a poster ad by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedPosterAd = await PosterAd.findByIdAndDelete(req.params.id);
    if (!deletedPosterAd) {
      return res.status(404).json({ message: 'Poster ad not found' });
    }
    res.status(200).json({ message: 'Poster ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting poster ad:', error);
    res.status(500).json({ message: 'Failed to delete poster ad' });
  }
});

export default router;