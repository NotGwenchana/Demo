const User = require('../models/user');
const Admin = require('../models/admin');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const test = (req, res) => {
    res.json('test is working')
};

//-------------- Generate unique membership ID ------------- //
const generateMembershipId = async () => {
    let isUnique = false;
    let membershipID = '';
    
    while (!isUnique) {
        const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        membershipID = `335${randomNum}`;
        
        const existingUser = await User.findOne({ membershipID });
        if (!existingUser) {
            isUnique = true;
        }
    }
    
    return membershipID;
};

//-------------- Signup ------------- //
const signupUser = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, phone } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password is required and should be at least 6 characters' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords does not match' });
        }

        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const existUsername = await User.findOne({ username });
        if (existUsername) {
            return res.status(400).json({ error: 'Username is taken, please choose another username' });
        }

        const existPhone = await User.findOne({ phone });
        if (existPhone) {
            return res.status(400).json({ error: 'Phone number already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const membershipID = await generateMembershipId();
        const memberPoints = 100;

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phone,
            membershipID,
            memberPoints,
            cart: [],
            isAdmin: false // Default is false for new users
        });

        return res.status(201).json(user);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Signin (Unified - handles both users and admins) ------------- //
const signinUser = async (req, res) => {
    try {
        const { username, password } = req.body;


        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        // First check if it's an admin user
        let user = await User.findOne({ username });
        let isAdminUser = false;
        let adminData = null;

        // If user not found in User schema, check Admin schema
        if (!user) {
            const admin = await Admin.findOne({ username });
            if (!admin || !admin.isActive) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            // verify admin password from Admin collection
            const isAdminMatch = await comparePassword(password, admin.password);
            if (!isAdminMatch) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign(
                {
                    id: admin._id,
                    username: admin.username,
                    isAdmin: true
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.status(200).json({
                username: admin.username,
                email: admin.email,
                phone: admin.phone,
                id: admin._id,
                isAdmin: true,
                role: admin.role || 'admin',
                cart: []
            });
        }



        // If still no user found (should not reach here for active admins since we return above)
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }


        // Verify password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Check if user is admin (from User schema)
        if (user.isAdmin) {
            isAdminUser = true;
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                isAdmin: isAdminUser 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data with admin flag
        return res.status(200).json({ 
            username: user.username, 
            email: user.email, 
            phone: user.phone, 
            id: user._id,
            membershipID: user.membershipID,
            memberPoints: user.memberPoints,
            cart: user.cart || [],
            isAdmin: isAdminUser,
            role: adminData ? adminData.role : (user.isAdmin ? 'admin' : 'user')
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Signout ------------- //
const signoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Sign out successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Profile ------------- //
const profile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Profile can be requested for either User tokens or Admin tokens.
        const user = await User.findById(decoded.id);
        if (user) {
            return res.status(200).json({ 
                username: user.username, 
                email: user.email, 
                phone: user.phone, 
                membershipID: user.membershipID,
                memberPoints: user.memberPoints,
                cart: user.cart || [],
                isAdmin: user.isAdmin || false,
                role: user.isAdmin ? 'admin' : 'user'
            });
        }

        const admin = await Admin.findById(decoded.id) ||
            (decoded.username ? await Admin.findOne({ username: decoded.username }) : null);

        if (!admin || !admin.isActive) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ 
            username: admin.username,
            email: admin.email,
            phone: admin.phone,
            membershipID: null,
            memberPoints: 0,
            cart: [],
            isAdmin: true,
            role: admin.role || 'admin'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Verify Admin Status ------------- //
const verifyAdmin = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ isAdmin: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tokens can be issued from either:
        // 1) User collection (decoded.id = User._id, user.isAdmin === true)
        // 2) Admin collection (decoded.id = Admin._id, admin.isActive === true)
        const user = await User.findById(decoded.id);

        // Case 1: admin stored in User schema
        if (user?.isAdmin) {
            return res.status(200).json({
                isAdmin: true,
                username: user.username,
                role: 'admin'
            });
        }

        // Case 2: admin stored in Admin schema
        const admin = await Admin.findById(decoded.id) ||
            (decoded.username ? await Admin.findOne({ username: decoded.username }) : null);

        // If the token was issued from Admin collection but User lookup failed,
        // use decoded.username (or admin.username) for response consistency.
        const resolvedUsername = user?.username || admin?.username || decoded.username;

        if (admin?.isActive) {
            return res.status(200).json({
                isAdmin: true,
                username: user?.username || admin.username,
                role: admin.role
            });
        }

        return res.status(200).json({
            isAdmin: false,
            username: user?.username || decoded.username
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ isAdmin: false });
    }
}

//-------------- Update Phone Number ------------- //
const updatePhone = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { phone } = req.body;
        const existingUser = await User.findOne({ 
            phone: phone,
            _id: { $ne: decoded.id }
        });
        
        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already exists' });
        }
        user.phone = phone;
        await user.save();
        return res.status(200).json({ message: 'Phone number updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Update Password ------------- //
const updatePassword = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { currentPassword, newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }
        
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        
        // Also update admin password if this user is an admin
        const admin = await Admin.findOne({ username: user.username });
        if (admin) {
            admin.password = hashedPassword;
            await admin.save();
        }
        
        await user.save();
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Forgot Password ------------- //
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Forgot password request for email:", email);

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'No account found with this email' });
        }

        console.log("User found:", user.username);

        const resetToken = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        console.log("Reset token generated:", resetToken);
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        
        console.log("Reset URL generated:", resetUrl);
        
        return res.status(200).json({ 
            message: 'Reset token generated successfully',
            resetUrl: resetUrl,
            userEmail: user.email,
            username: user.username
        });
    } catch (error) {
        console.log("Error in forgotPassword:", error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Reset Password ------------- //
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Reset token is required' });
        }
        
        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        const user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        
        // Also update admin password if this user is an admin
        const admin = await Admin.findOne({ username: user.username });
        if (admin) {
            admin.password = hashedPassword;
            await admin.save();
        }
        
        return res.status(200).json({ message: 'Password reset successful! You can now login with your new password.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Cart functions (unchanged) ------------- //
const getCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ cart: user.cart || [] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

const addToCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { cart, item } = req.body;
        
        if (cart && Array.isArray(cart)) {
            user.cart = cart;
            await user.save();
            return res.status(200).json({ 
                message: 'Cart updated successfully',
                cart: user.cart 
            });
        }
        
        if (item) {
            let userCart = user.cart || [];
            const existingItemIndex = userCart.findIndex(
                cartItem => 
                    cartItem.id === item.id && 
                    cartItem.size === item.size && 
                    cartItem.variation === item.variation
            );
            
            if (existingItemIndex !== -1) {
                userCart[existingItemIndex].quantity += item.quantity || 1;
            } else {
                userCart.push(item);
            }
            
            user.cart = userCart;
            await user.save();
            
            return res.status(200).json({ 
                message: 'Item added to cart successfully',
                cart: user.cart 
            });
        }
        
        return res.status(400).json({ error: 'Invalid request. Provide either cart or item.' });
        
    } catch (error) {
        console.log('Error in addToCart:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}

const removeFromCart = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { itemId, itemSize, itemVariation, clearAll } = req.body;
        
        if (clearAll) {
            user.cart = [];
            await user.save();
            return res.status(200).json({ 
                message: 'Cart cleared successfully',
                cart: user.cart 
            });
        }
        
        if (itemId) {
            let userCart = user.cart || [];
            userCart = userCart.filter(cartItem => {
                const isSameId = cartItem.id === itemId;
                const isSameSize = cartItem.size === itemSize;
                const isSameVariation = cartItem.variation === itemVariation;
                return !(isSameId && isSameSize && isSameVariation);
            });
            
            user.cart = userCart;
            await user.save();
            return res.status(200).json({ 
                message: 'Item removed from cart successfully',
                cart: user.cart 
            });
        }
        
        return res.status(400).json({ error: 'Invalid request. Provide itemId or clearAll.' });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

const updateCartItemQuantity = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { itemId, itemSize, itemVariation, quantity } = req.body;
        
        if (!itemId || quantity === undefined) {
            return res.status(400).json({ error: 'Item ID and quantity are required' });
        }
        
        let userCart = user.cart || [];
        const itemIndex = userCart.findIndex(
            cartItem => 
                cartItem.id === itemId && 
                cartItem.size === itemSize && 
                cartItem.variation === itemVariation
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        
        if (quantity <= 0) {
            userCart.splice(itemIndex, 1);
        } else {
            userCart[itemIndex].quantity = quantity;
        }
        
        user.cart = userCart;
        await user.save();
        
        return res.status(200).json({ 
            message: 'Cart item quantity updated successfully',
            cart: user.cart 
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

//-------------- Delete user account ------------- //
const deleteAccount = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // If user is admin, also delete from Admin schema
        if (user.isAdmin) {
            await Admin.findOneAndDelete({ username: user.username });
        }
        
        await User.findByIdAndDelete(decoded.id);
        res.clearCookie('token');
        
        return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.log('Error in deleteAccount:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

//-------------- Update Member Points ------------- //
const updatePoints = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { pointsEarned, pointsUsed } = req.body;
        
        if (pointsEarned === undefined || pointsUsed === undefined) {
            return res.status(400).json({ error: 'pointsEarned and pointsUsed are required' });
        }
        
        const netPointsChange = pointsEarned - pointsUsed;
        const oldPoints = user.memberPoints || 0;
        const newPoints = oldPoints + netPointsChange;
        
        user.memberPoints = Math.max(0, newPoints);
        await user.save();
        
        return res.status(200).json({ 
            message: 'Points updated successfully',
            oldPoints: oldPoints,
            pointsEarned: pointsEarned,
            pointsUsed: pointsUsed,
            netChange: netPointsChange,
            newPoints: user.memberPoints
        });
        
    } catch (error) {
        console.error('Error updating points:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

//-------------- Get Member Points ------------- //
const getPoints = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ 
            points: user.memberPoints || 0,
            membershipID: user.membershipID
        });
        
    } catch (error) {
        console.error('Error getting points:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

//-------------- Admin: Validate Member by membershipID ------------- //
const validateMember = async (req, res) => {
    try {
        const { membershipID } = req.query;

        if (!membershipID) {
            return res.status(400).json({ error: 'membershipID is required' });
        }

        const user = await User.findOne({ membershipID });

        if (!user) {
            return res.status(200).json({ valid: false });
        }

        return res.status(200).json({
            valid: true,
            membershipID: user.membershipID,
            memberPoints: user.memberPoints || 0
        });
    } catch (error) {
        console.error('Error validating member:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

//-------------- Admin: Update Member Points by membershipID ------------- //
const adminUpdatePoints = async (req, res) => {
    try {
        const { membershipID, pointsEarned, pointsUsed } = req.body;

        if (!membershipID) {
            return res.status(400).json({ error: 'membershipID is required' });
        }
        if (pointsEarned === undefined || pointsUsed === undefined) {
            return res.status(400).json({ error: 'pointsEarned and pointsUsed are required' });
        }

        const user = await User.findOne({ membershipID });
        if (!user) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const netPointsChange = Number(pointsEarned) - Number(pointsUsed);
        const oldPoints = user.memberPoints || 0;
        const newPoints = Math.max(0, oldPoints + netPointsChange);

        user.memberPoints = newPoints;
        await user.save();

        return res.status(200).json({
            message: 'Points updated successfully',
            membershipID: user.membershipID,
            oldPoints,
            pointsEarned,
            pointsUsed,
            netChange: netPointsChange,
            newPoints
        });
    } catch (error) {
        console.error('Error admin updating points:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

//-------------- Admin: Record Checkout-Init ------------- //
// Called by Cart.jsx when user clicks "Go to Checkout".
// Requires admin auth (per existing requireAdmin middleware).
const recordCheckoutInit = async (req, res) => {
    console.log('[AdminTotalSales] recordCheckoutInit called');
    try {
        const {
            orderDateISO, // 'YYYY-MM-DD'
            orderTimeISO, // iso string
            amount, // cart total amount
            items, // [{name, quantity}]
        } = req.body;

        if (!orderDateISO || typeof orderDateISO !== 'string') {
            return res.status(400).json({ error: 'orderDateISO is required' });
        }
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array' });
        }

        const safeAmount = Number(amount) || 0;
        if (safeAmount < 0) {
            return res.status(400).json({ error: 'amount must be >= 0' });
        }

        const date = new Date(orderTimeISO || new Date().toISOString());
        const hour = date.getHours();

        // Store record into the admin that is making the request.
        // JWT `decoded.id` is Admin._id for admin tokens.
        // We record sales into ONE Admin document (the active admin), regardless of
        // whether the requester is a User token or an Admin token.
        const admin = (await Admin.findOne({ isActive: true })) || (await Admin.findOne({}));
        if (!admin) {
            return res.status(404).json({ error: 'No admin document found to record sales' });
        }



        const normalizedItems = items
            .filter((it) => it && typeof it.name === 'string')
            .map((it) => ({ name: it.name, quantity: Number(it.quantity) || 0 }))
            .filter((it) => it.quantity > 0);

        admin.totalSales.push({
            dateISO: orderDateISO,
            timeISO: orderTimeISO || new Date().toISOString(),
            hour,
            amount: safeAmount,
            items: normalizedItems,
        });

        await admin.save();

        return res.status(200).json({ message: 'checkout-init recorded', totalSalesCount: admin.totalSales.length });
    } catch (error) {
        console.error('Error recording checkout-init:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

//-------------- Get Total Sales (aggregated) ------------- //
const getTotalSales = async (req, res) => {
    try {
        const admin = await Admin.findOne({ isActive: true }) || await Admin.findOne({});
        if (!admin) {
            return res.status(200).json({ salesByDate: [] });
        }

        const records = Array.isArray(admin.totalSales) ? admin.totalSales : [];

        // Group by dateISO
        const byDate = new Map();
        for (const r of records) {
            if (!r?.dateISO) continue;
            const dateISO = r.dateISO;
            if (!byDate.has(dateISO)) {
                byDate.set(dateISO, {
                    dateISO,
                    totalAmount: 0,
                    itemsMap: new Map(), // name -> qty
                    hourlyAmount: Array.from({ length: 24 }, () => 0), // index hour
                });
            }
            const bucket = byDate.get(dateISO);
            bucket.totalAmount += Number(r.amount) || 0;

            const hour = Number(r.hour);
            if (Number.isFinite(hour) && hour >= 0 && hour <= 23) {
                bucket.hourlyAmount[hour] += Number(r.amount) || 0;
            }

            const items = Array.isArray(r.items) ? r.items : [];
            for (const it of items) {
                if (!it?.name) continue;
                const qty = Number(it.quantity) || 0;
                if (qty <= 0) continue;
                bucket.itemsMap.set(it.name, (bucket.itemsMap.get(it.name) || 0) + qty);
            }
        }

        // Sort by date desc
        const sortedDates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));

        const formatDateDMY = (dateISO) => {
            const d = new Date(dateISO + 'T00:00:00.000Z');
            // Fallback if parsing is off: still format using local Date components
            const day = d.getUTCDate();
            const month = d.getUTCMonth() + 1;
            const year = d.getUTCFullYear();
            return `${day}/${month}/${year}`;
        };

        const salesByDate = sortedDates.map((dateISO) => {
            const b = byDate.get(dateISO);
            const totalSoldItems = Array.from(b.itemsMap.entries())
                .map(([name, quantity]) => ({ name, quantity }))
                .sort((x, y) => y.quantity - x.quantity);

            const hourly = [];
            for (let h = 0; h < 24; h++) {
                const next = (h + 1) % 24;
                const hourLabel = `${String(h).padStart(2, '0')}-${String(next).padStart(2, '0')}`;
                // Your requested UI is 00-01, 01-02 ... so this matches.
                hourly.push({ hourLabel, amount: b.hourlyAmount[h] });
            }

            const totalHourAmount = b.hourlyAmount.reduce((s, v) => s + v, 0);

            return {
                date: formatDateDMY(dateISO),
                dateISO,
                totalsalesAmount: b.totalAmount,
                totalSoldItems,
                hourly,
                totalHourAmount,
            };
        });

        return res.status(200).json({ salesByDate });
    } catch (error) {
        console.error('Error getting total sales:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
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
    recordCheckoutInit,
    getTotalSales
};
