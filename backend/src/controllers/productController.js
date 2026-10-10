import Product from '../models/Product.js';
import Category from '../models/Category.js';
import AffiliateClick from '../models/AffiliateClick.js';
import { memoryStore } from '../utils/store.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      platform,
      minPrice,
      maxPrice,
      isFeatured,
      isTrending,
      isActive,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Use MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      } else {
        query.isActive = true;
      }

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { brand: searchRegex },
          { tags: { $in: [searchRegex] } },
          { shortDescription: searchRegex },
        ];
      }

      if (category && category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category)) {
          query.category = category;
        } else {
          const catDoc = await Category.findOne({ slug: category.toLowerCase() });
          if (catDoc) {
            query.category = catDoc._id;
          } else {
            return res.status(200).json({
              success: true,
              total: 0,
              page: pageNum,
              totalPages: 0,
              data: [],
            });
          }
        }
      }

      if (brand && brand !== 'all') {
        const brandsList = brand.split(',').map((b) => b.trim());
        query.brand = { $in: brandsList.map((b) => new RegExp(`^${b}$`, 'i')) };
      }

      if (platform && platform !== 'all') {
        const platformsList = platform.split(',').map((p) => p.trim());
        query.affiliatePlatform = { $in: platformsList };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
      }

      if (isFeatured === 'true') query.isFeatured = true;
      if (isTrending === 'true') query.isTrending = true;

      let sortOptions = { createdAt: -1 };
      if (sort === 'price_asc') sortOptions = { price: 1 };
      else if (sort === 'price_desc') sortOptions = { price: -1 };
      else if (sort === 'popular') sortOptions = { clickCount: -1, createdAt: -1 };
      else if (sort === 'featured') sortOptions = { isFeatured: -1, createdAt: -1 };
      else if (sort === 'discount') sortOptions = { discountPercentage: -1 };

      const [total, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query)
          .populate('category', 'name slug image')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
      ]);

      return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
        data: products,
      });
    }

    // Fallback Store
    let list = [...memoryStore.products];

    if (isActive !== undefined) {
      list = list.filter((p) => String(p.isActive) === String(isActive));
    } else {
      list = list.filter((p) => p.isActive);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'all') {
      list = list.filter(
        (p) => p.category?.slug === category || p.category?._id === category
      );
    }

    if (brand && brand !== 'all') {
      const brandsList = brand.split(',').map((b) => b.trim().toLowerCase());
      list = list.filter((p) => brandsList.includes(p.brand.toLowerCase()));
    }

    if (platform && platform !== 'all') {
      const platformsList = platform.split(',').map((p) => p.trim().toLowerCase());
      list = list.filter((p) => platformsList.includes(p.affiliatePlatform.toLowerCase()));
    }

    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (isFeatured === 'true') list = list.filter((p) => p.isFeatured);
    if (isTrending === 'true') list = list.filter((p) => p.isTrending);

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'popular') list.sort((a, b) => b.clickCount - a.clickCount);
    else if (sort === 'discount') list.sort((a, b) => b.discountPercentage - a.discountPercentage);

    const total = list.length;
    const paginated = list.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (mongoose.connection.readyState === 1) {
      let product = await Product.findOne({ slug })
        .populate('category', 'name slug image')
        .lean();

      if (!product && mongoose.Types.ObjectId.isValid(slug)) {
        product = await Product.findById(slug).populate('category', 'name slug image').lean();
      }

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const relatedProducts = await Product.find({
        category: product.category?._id || product.category,
        _id: { $ne: product._id },
        isActive: true,
      })
        .populate('category', 'name slug image')
        .limit(4)
        .lean();

      return res.status(200).json({ success: true, data: product, related: relatedProducts });
    }

    // Memory store lookup
    const product = memoryStore.products.find((p) => p.slug === slug || p._id === slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = memoryStore.products
      .filter((p) => p.category?.slug === product.category?.slug && p._id !== product._id)
      .slice(0, 4);

    res.status(200).json({ success: true, data: product, related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving product', error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(id).populate('category', 'name slug image');
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.status(200).json({ success: true, data: product });
    }

    const product = memoryStore.products.find((p) => p._id === id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving product', error: error.message });
  }
};

// @desc    Track click and redirect
// @route   GET /api/products/:id/click
// @access  Public
export const trackProductClick = async (req, res) => {
  try {
    const { id } = req.params;
    const isJson = req.query.json === 'true' || req.headers.accept?.includes('application/json');

    let product = null;

    if (mongoose.connection.readyState === 1) {
      let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
      product = await Product.findOneAndUpdate(query, { $inc: { clickCount: 1 } }, { new: true }).populate('category', 'name');

      if (product) {
        try {
          const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
          await AffiliateClick.create({
            product: product._id,
            productName: product.name,
            categoryName: product.category?.name || 'General',
            platform: product.affiliatePlatform,
            affiliateUrl: product.affiliateUrl,
            ip: clientIp,
            referrer: req.headers.referer || '',
          });
        } catch (e) {}
      }
    } else {
      product = memoryStore.products.find((p) => p._id === id || p.slug === id);
      if (product) {
        product.clickCount = (product.clickCount || 0) + 1;
        memoryStore.clicks.unshift({
          _id: `click-${Date.now()}`,
          product: product,
          productName: product.name,
          categoryName: product.category?.name || 'General',
          platform: product.affiliatePlatform,
          affiliateUrl: product.affiliateUrl,
          ip: '127.0.0.1',
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (!product) {
      if (isJson) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.redirect('/');
    }

    if (isJson) {
      return res.status(200).json({
        success: true,
        redirectUrl: product.affiliateUrl,
        clickCount: product.clickCount,
      });
    }

    return res.redirect(302, product.affiliateUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Redirect failed', error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      shortDescription,
      description,
      images,
      price,
      originalPrice,
      category,
      brand,
      features,
      affiliatePlatform,
      affiliateUrl,
      buyButtonText,
      isFeatured,
      isTrending,
      isActive,
      tags,
    } = req.body;

    let generatedSlug = slug ? slugify(slug, { lower: true, strict: true }) : slugify(name, { lower: true, strict: true });
    
    let discount = 0;
    if (originalPrice && price && Number(originalPrice) > Number(price)) {
      discount = Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100);
    }

    const parsedImages = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];
    const parsedFeatures = Array.isArray(features) ? features : [];
    const parsedTags = Array.isArray(tags) ? tags : [];

    if (mongoose.connection.readyState === 1) {
      const product = new Product({
        name,
        slug: generatedSlug,
        shortDescription,
        description,
        images: parsedImages,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountPercentage: discount,
        category,
        brand: brand || 'Generic',
        features: parsedFeatures,
        affiliatePlatform: affiliatePlatform || 'Amazon',
        affiliateUrl,
        buyButtonText: buyButtonText || `Buy on ${affiliatePlatform || 'Amazon'}`,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        tags: parsedTags,
      });

      const saved = await product.save();
      const populated = await Product.findById(saved._id).populate('category', 'name slug image');
      return res.status(201).json({ success: true, message: 'Product created', data: populated });
    }

    const categoryObj = memoryStore.categories.find((c) => c._id === category || c.slug === category) || { name: 'General', slug: 'general' };
    const newProduct = {
      _id: `prod-${Date.now()}`,
      name,
      slug: generatedSlug,
      shortDescription,
      description,
      images: parsedImages,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discountPercentage: discount,
      category: categoryObj,
      brand: brand || 'Generic',
      features: parsedFeatures,
      affiliatePlatform: affiliatePlatform || 'Amazon',
      affiliateUrl,
      buyButtonText: buyButtonText || `Buy on ${affiliatePlatform || 'Amazon'}`,
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      tags: parsedTags,
      clickCount: 0,
      rating: 4.8,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
    };

    memoryStore.products.unshift(newProduct);
    res.status(201).json({ success: true, message: 'Product created', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true }).populate('category', 'name slug image');
      return res.status(200).json({ success: true, message: 'Product updated', data: updated });
    }

    const idx = memoryStore.products.findIndex((p) => p._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    let discount = 0;
    const price = req.body.price !== undefined ? Number(req.body.price) : memoryStore.products[idx].price;
    const originalPrice = req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : memoryStore.products[idx].originalPrice;
    if (originalPrice && price && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    let catObj = memoryStore.products[idx].category;
    if (req.body.category) {
      catObj = memoryStore.categories.find((c) => c._id === req.body.category || c.slug === req.body.category) || catObj;
    }

    memoryStore.products[idx] = {
      ...memoryStore.products[idx],
      ...req.body,
      price,
      originalPrice,
      discountPercentage: discount,
      category: catObj,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({ success: true, message: 'Product updated', data: memoryStore.products[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    memoryStore.products = memoryStore.products.filter((p) => p._id !== id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

// @desc    Toggle product status
// @route   PATCH /api/products/:id/status
// @access  Admin
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const prod = await Product.findById(id);
      prod.isActive = req.body.isActive !== undefined ? req.body.isActive : !prod.isActive;
      await prod.save();
      return res.status(200).json({ success: true, data: prod });
    }

    const prod = memoryStore.products.find((p) => p._id === id);
    if (prod) {
      prod.isActive = req.body.isActive !== undefined ? req.body.isActive : !prod.isActive;
    }
    res.status(200).json({ success: true, data: prod });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

// @desc    Toggle featured
// @route   PATCH /api/products/:id/featured
// @access  Admin
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const prod = await Product.findById(id);
      prod.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : !prod.isFeatured;
      await prod.save();
      return res.status(200).json({ success: true, data: prod });
    }

    const prod = memoryStore.products.find((p) => p._id === id);
    if (prod) {
      prod.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : !prod.isFeatured;
    }
    res.status(200).json({ success: true, data: prod });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update featured', error: error.message });
  }
};

// @desc    Toggle trending
// @route   PATCH /api/products/:id/trending
// @access  Admin
export const toggleTrending = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const prod = await Product.findById(id);
      prod.isTrending = req.body.isTrending !== undefined ? req.body.isTrending : !prod.isTrending;
      await prod.save();
      return res.status(200).json({ success: true, data: prod });
    }

    const prod = memoryStore.products.find((p) => p._id === id);
    if (prod) {
      prod.isTrending = req.body.isTrending !== undefined ? req.body.isTrending : !prod.isTrending;
    }
    res.status(200).json({ success: true, data: prod });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update trending', error: error.message });
  }
};

// @desc    Get filter metadata
// @route   GET /api/products/filters/meta
// @access  Public
export const getProductFiltersMeta = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [brands, platforms, priceStats] = await Promise.all([
        Product.distinct('brand', { isActive: true }),
        Product.distinct('affiliatePlatform', { isActive: true }),
        Product.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          brands: brands.filter(Boolean).sort(),
          platforms: platforms.filter(Boolean),
          minPrice: priceStats[0]?.minPrice || 0,
          maxPrice: priceStats[0]?.maxPrice || 100000,
        },
      });
    }

    const brands = [...new Set(memoryStore.products.map((p) => p.brand))].filter(Boolean).sort();
    const platforms = [...new Set(memoryStore.products.map((p) => p.affiliatePlatform))].filter(Boolean);
    const prices = memoryStore.products.map((p) => p.price);

    res.status(200).json({
      success: true,
      data: {
        brands,
        platforms,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 100000,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Meta fetch error', error: error.message });
  }
};
