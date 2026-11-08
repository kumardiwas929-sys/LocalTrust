import Category from '../models/Category.js';
import Service from '../models/Service.js';

export const getCategories = async (req, res, next) => {
  try {
    const query = req.query.all === 'true' && req.user?.role === 'admin' ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const serviceCount = await Service.countDocuments({ categoryId: category._id, isActive: true });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        serviceCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'Wrench',
      image: image || '',
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (req.body.name && req.body.name !== category.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    Object.assign(category, req.body);
    await category.save();

    res.json({
      success: true,
      message: 'Category updated.',
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category disabled.',
    });
  } catch (err) {
    next(err);
  }
};
