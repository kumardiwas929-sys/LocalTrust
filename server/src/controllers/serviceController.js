import Service from '../models/Service.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Category from '../models/Category.js';
import { VERIFICATION_STATUS } from '../constants/verificationStatus.js';

export const getServices = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      verifiedOnly,
      sort = 'relevance',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        const catObj = await Category.findOne({ slug: category });
        if (catObj) query.categoryId = catObj._id;
      }
    }

    if (location) {
      query.serviceAreas = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    let providerFilter = {};
    if (verifiedOnly === 'true') {
      providerFilter.verificationStatus = VERIFICATION_STATUS.VERIFIED;
    }
    if (minRating) {
      providerFilter.rating = { $gte: Number(minRating) };
    }

    if (Object.keys(providerFilter).length > 0) {
      const eligibleProviders = await ProviderProfile.find(providerFilter).select('_id');
      query.providerId = { $in: eligibleProviders.map((p) => p._id) };
    }

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions.basePrice = 1;
    else if (sort === 'price_desc') sortOptions.basePrice = -1;
    else if (sort === 'rating_desc') sortOptions['provider.rating'] = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate({
          path: 'providerId',
          select: 'businessName rating reviewCount verificationStatus serviceAreas profileImage experienceYears isAvailable',
          populate: { path: 'userId', select: 'name profileImage' },
        })
        .populate('categoryId', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Service.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: services,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id)
      .populate({
        path: 'providerId',
        select: 'businessName bio skills rating reviewCount completedBookingsCount repeatCustomerRate verificationStatus serviceAreas warrantyOffered isAvailable',
        populate: { path: 'userId', select: 'name profileImage' },
      })
      .populate('categoryId', 'name slug icon description');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const createService = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(403).json({
        success: false,
        message: 'You must complete provider onboarding before listing a service.',
      });
    }

    const serviceData = {
      ...req.body,
      providerId: profile._id,
    };

    if (!serviceData.serviceAreas || serviceData.serviceAreas.length === 0) {
      serviceData.serviceAreas = profile.serviceAreas;
    }

    const service = await Service.create(serviceData);

    // Ensure category is linked to provider profile
    if (!profile.categories.includes(serviceData.categoryId)) {
      profile.categories.push(serviceData.categoryId);
      await profile.save();
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (req.user.role !== 'admin') {
      const profile = await ProviderProfile.findOne({ userId: req.user._id });
      if (!profile || service.providerId.toString() !== profile._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to edit this service.' });
      }
    }

    Object.assign(service, req.body);
    await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully.',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (req.user.role !== 'admin') {
      const profile = await ProviderProfile.findOne({ userId: req.user._id });
      if (!profile || service.providerId.toString() !== profile._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
    }

    service.isActive = false;
    await service.save();

    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate({
        path: 'providerId',
        select: 'businessName rating reviewCount verificationStatus serviceAreas',
        populate: { path: 'userId', select: 'name profileImage' },
      })
      .populate('categoryId', 'name slug icon')
      .sort({ 'providerId.rating': -1, createdAt: -1 })
      .limit(6);

    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};
