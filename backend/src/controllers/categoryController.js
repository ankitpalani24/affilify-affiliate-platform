import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { memoryStore } from '../utils/store.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { all } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = all === 'true' ? {} : { isActive: true };
      const categories = await Category.find(query).sort({ order: 1, name: 1 }).lean();

      const categoryCounts = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      const countsMap = categoryCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {});

      const enriched = categories.map((cat) => ({
        ...cat,
        productsCount: countsMap[cat._id.toString()] || 0,
      }));

      return res.status(200).json({ success: true, count: enriched.length, data: enriched });
    }

    // Memory Store
    let list = [...memoryStore.categories];
    if (all !== 'true') {
      list = list.filter((c) => c.isActive);
    }
    list.sort((a, b) => (a.order || 0) - (b.order || 0));

    const enriched = list.map((cat) => {
      const count = memoryStore.products.filter(
        (p) => (p.category?.slug === cat.slug || p.category?._id === cat._id) && p.isActive
      ).length;
      return { ...cat, productsCount: count };
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (mongoose.connection.readyState === 1) {
      let category = await Category.findOne({ slug }).lean();
      if (!category && mongoose.Types.ObjectId.isValid(slug)) {
        category = await Category.findById(slug).lean();
      }
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

      const count = await Product.countDocuments({ category: category._id, isActive: true });
      return res.status(200).json({ success: true, data: { ...category, productsCount: count } });
    }

    const category = memoryStore.categories.find((c) => c.slug === slug || c._id === slug);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const count = memoryStore.products.filter((p) => p.category?.slug === category.slug && p.isActive).length;
    res.status(200).json({ success: true, data: { ...category, productsCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, isActive, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    let generatedSlug = slug ? slugify(slug, { lower: true, strict: true }) : slugify(name, { lower: true, strict: true });

    if (mongoose.connection.readyState === 1) {
      const category = new Category({
        name: name.trim(),
        slug: generatedSlug,
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        order: Number(order) || 0,
      });

      const saved = await category.save();
      return res.status(201).json({ success: true, message: 'Category created', data: saved });
    }

    const newCat = {
      _id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: Number(order) || 0,
      createdAt: new Date().toISOString(),
    };

    memoryStore.categories.push(newCat);
    res.status(201).json({ success: true, message: 'Category created', data: newCat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json({ success: true, message: 'Category updated', data: updated });
    }

    const idx = memoryStore.categories.findIndex((c) => c._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });

    memoryStore.categories[idx] = {
      ...memoryStore.categories[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({ success: true, message: 'Category updated', data: memoryStore.categories[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const productsInCat = await Product.countDocuments({ category: id });
      if (productsInCat > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category: contains ${productsInCat} product(s).`,
        });
      }
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Category deleted' });
    }

    const productsInCat = memoryStore.products.filter((p) => p.category?._id === id || p.category?.slug === id).length;
    if (productsInCat > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: contains ${productsInCat} product(s).`,
      });
    }

    memoryStore.categories = memoryStore.categories.filter((c) => c._id !== id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

// @desc    Toggle category status
// @route   PATCH /api/categories/:id/status
// @access  Admin
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const cat = await Category.findById(id);
      cat.isActive = req.body.isActive !== undefined ? req.body.isActive : !cat.isActive;
      await cat.save();
      return res.status(200).json({ success: true, data: cat });
    }

    const cat = memoryStore.categories.find((c) => c._id === id);
    if (cat) {
      cat.isActive = req.body.isActive !== undefined ? req.body.isActive : !cat.isActive;
    }
    res.status(200).json({ success: true, data: cat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};
