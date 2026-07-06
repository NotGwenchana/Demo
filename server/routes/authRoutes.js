const express = require('express');
const router = express.Router();
const cors = require('cors');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { 
    test, 
    signupUser, 
    signinUser, 
    signoutUser, 
    profile,
    verifyAdmin,
    updatePhone, 
    updatePassword, 
    forgotPassword, 
    resetPassword,
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    deleteAccount,
    updatePoints,
    getPoints,
    validateMember,
    adminUpdatePoints,
    getTotalSales,
    recordCheckoutInit
} = require('../controllers/authController');

// middleware
router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173' 
    })
);

// Public routes
router.get('/', test);
router.post('/signup', signupUser);
router.post('/signin', signinUser);
router.post('/signout', signoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Public profile (used by NavBar). Auth is handled inside controller to support both User/Admin tokens.
router.get('/profile', profile);

// Protected user routes (keep requireAuth for User-only operations)
// (profile is handled above)

router.put('/profile/update-phone', requireAuth, updatePhone);
router.put('/profile/update-password', requireAuth, updatePassword);
router.get('/cart', requireAuth, getCart);
router.post('/cart', requireAuth, addToCart);
router.delete('/cart', requireAuth, removeFromCart);
router.put('/cart/quantity', requireAuth, updateCartItemQuantity);
router.delete('/account', requireAuth, deleteAccount);
router.patch('/points', requireAuth, updatePoints);
router.get('/points', requireAuth, getPoints);

// Admin verification
router.get('/verify-admin', verifyAdmin);

// Admin routes (require admin privileges)
router.get('/admin/validate-member', requireAdmin, validateMember);
router.patch('/admin/points', requireAdmin, adminUpdatePoints);
router.get('/admin/totalsales', requireAdmin, getTotalSales);
router.post('/admin/totalsales/checkout-init', requireAuth, recordCheckoutInit);

module.exports = router;

