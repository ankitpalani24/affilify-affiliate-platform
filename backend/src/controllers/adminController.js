import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import AffiliateClick from '../models/AffiliateClick.js';
import { memoryStore } from '../utils/store.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_ecs_affiliate_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
      if (admin) {
        const isMatch = await admin.matchPassword(password);
        if (isMatch) {
          admin.lastLogin = new Date();
          await admin.save();
          const token = generateToken(admin._id);
          return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            admin: {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              role: admin.role,
              lastLogin: admin.lastLogin,
            },
          });
        }
      }
    }

    // Fallback in-memory admin check
    const normalizedEmail = email.toLowerCase().trim();
    if (
      normalizedEmail === memoryStore.admin.email.toLowerCase() &&
      bcrypt.compareSync(password, memoryStore.admin.passwordHash)
    ) {
      const token = generateToken(memoryStore.admin._id);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully (Dev Mode)',
        token,
        admin: {
          id: memoryStore.admin._id,
          name: memoryStore.admin.name,
          email: memoryStore.admin.email,
          role: memoryStore.admin.role,
          lastLogin: new Date(),
        },
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login error', error: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Admin
export const getAdminProfile = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findById(req.admin._id).select('-password');
      if (admin) return res.status(200).json({ success: true, data: admin });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: memoryStore.admin._id,
        name: memoryStore.admin.name,
        email: memoryStore.admin.email,
        role: memoryStore.admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Admin
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findById(req.admin._id).select('+password');
      if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

      if (name) admin.name = name;
      if (email) admin.email = email.toLowerCase();
      if (newPassword) {
        if (!currentPassword || !(await admin.matchPassword(currentPassword))) {
          return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }
        admin.password = newPassword;
      }
      await admin.save();
      return res.status(200).json({ success: true, message: 'Profile updated' });
    }

    if (name) memoryStore.admin.name = name;
    if (email) memoryStore.admin.email = email;
    if (newPassword) {
      if (!currentPassword || !bcrypt.compareSync(currentPassword, memoryStore.admin.passwordHash)) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }
      memoryStore.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    res.status(200).json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile update failed', error: error.message });
  }
};

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalProducts,
        activeProducts,
        inactiveProducts,
        featuredProducts,
        trendingProducts,
        totalCategories,
        totalClicksFromProducts,
        clicksToday,
        clicksThisWeek,
        clicksThisMonth,
        topClickedProducts,
        platformBreakdown,
        recentProducts,
        recentClicks,
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: false }),
        Product.countDocuments({ isFeatured: true }),
        Product.countDocuments({ isTrending: true }),
        Category.countDocuments(),
        Product.aggregate([{ $group: { _id: null, totalClicks: { $sum: '$clickCount' } } }]),
        AffiliateClick.countDocuments({ createdAt: { $gte: todayStart } }),
        AffiliateClick.countDocuments({ createdAt: { $gte: weekStart } }),
        AffiliateClick.countDocuments({ createdAt: { $gte: monthStart } }),
        Product.find().sort({ clickCount: -1 }).limit(5).populate('category', 'name').lean(),
        AffiliateClick.aggregate([{ $group: { _id: '$platform', count: { $sum: 1 } } }]),
        Product.find().sort({ createdAt: -1 }).limit(5).populate('category', 'name').lean(),
        AffiliateClick.find().sort({ createdAt: -1 }).limit(10).populate('product', 'name images').lean(),
      ]);

      const dailyClicks = await AffiliateClick.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalProducts,
            activeProducts,
            inactiveProducts,
            featuredProducts,
            trendingProducts,
            totalCategories,
            totalClicks: totalClicksFromProducts[0]?.totalClicks || 0,
            clicksToday,
            clicksThisWeek,
            clicksThisMonth,
          },
          platformBreakdown: platformBreakdown.map((p) => ({ platform: p._id || 'Store', count: p.count })),
          dailyClicks,
          topClickedProducts,
          recentProducts,
          recentClicks,
        },
      });
    }

    // Memory store metrics
    const prods = memoryStore.products;
    const totalClicks = prods.reduce((sum, p) => sum + (p.clickCount || 0), 0);
    const topClicked = [...prods].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)).slice(0, 5);

    const platformMap = {};
    memoryStore.clicks.forEach((c) => {
      platformMap[c.platform] = (platformMap[c.platform] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProducts: prods.length,
          activeProducts: prods.filter((p) => p.isActive).length,
          inactiveProducts: prods.filter((p) => !p.isActive).length,
          featuredProducts: prods.filter((p) => p.isFeatured).length,
          trendingProducts: prods.filter((p) => p.isTrending).length,
          totalCategories: memoryStore.categories.length,
          totalClicks: totalClicks || 560,
          clicksToday: 38,
          clicksThisWeek: 210,
          clicksThisMonth: totalClicks || 560,
        },
        platformBreakdown: Object.keys(platformMap).map((k) => ({ platform: k, count: platformMap[k] })),
        dailyClicks: [
          { _id: '2026-09-19', count: 18 },
          { _id: '2026-09-20', count: 24 },
          { _id: '2026-09-21', count: 32 },
          { _id: '2026-09-22', count: 29 },
          { _id: '2026-09-23', count: 45 },
          { _id: '2026-09-24', count: 58 },
          { _id: '2026-09-25', count: 38 },
        ],
        topClickedProducts: topClicked,
        recentProducts: prods.slice(0, 5),
        recentClicks: memoryStore.clicks.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Stats calculation failed', error: error.message });
  }
};

// @desc    Get click logs
// @route   GET /api/admin/clicks
// @access  Admin
export const getClickLogs = async (req, res) => {
  try {
    const { platform, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (platform && platform !== 'all') query.platform = platform;

      const [total, clicks] = await Promise.all([
        AffiliateClick.countDocuments(query),
        AffiliateClick.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate('product', 'name images price affiliateUrl').lean(),
      ]);

      return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        data: clicks,
      });
    }

    let list = [...memoryStore.clicks];
    if (platform && platform !== 'all') {
      list = list.filter((c) => c.platform === platform);
    }

    res.status(200).json({
      success: true,
      total: list.length,
      page: pageNum,
      totalPages: Math.ceil(list.length / limitNum) || 1,
      data: list.slice(skip, skip + limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Click log fetch failed', error: error.message });
  }
};
