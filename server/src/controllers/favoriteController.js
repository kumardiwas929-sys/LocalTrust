import Favorite from '../models/Favorite.js';
import ProviderProfile from '../models/ProviderProfile.js';

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ customerId: req.user._id })
      .populate({
        path: 'providerId',
        select: 'businessName bio skills rating reviewCount verificationStatus serviceAreas profileImage completedBookingsCount',
        populate: { path: 'userId', select: 'name profileImage' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: favorites });
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { customerId: req.user._id, providerId },
      { customerId: req.user._id, providerId },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Provider added to your favorites.',
      data: favorite,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    await Favorite.findOneAndDelete({ customerId: req.user._id, providerId });
    res.json({ success: true, message: 'Provider removed from favorites.' });
  } catch (err) {
    next(err);
  }
};
