const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin = require('../models/admin');

// Verify user is authenticated (for regular users)
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify admin access (for admin routes)
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // First check if user has admin flag in User schema
    const user = await User.findById(decoded.id);
    if (user && user.isAdmin) {
      req.user = user;
      req.isAdmin = true;
      return next();
    }
    
    // If not, check if it's an admin from Admin schema
    const admin = await Admin.findById(decoded.id);
    if (admin && admin.isActive) {
      req.admin = admin;
      req.isAdmin = true;
      return next();
    }
    
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify super admin access
const requireSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin || admin.role !== 'superadmin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    req.admin = admin;
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { requireAuth, requireAdmin, requireSuperAdmin };