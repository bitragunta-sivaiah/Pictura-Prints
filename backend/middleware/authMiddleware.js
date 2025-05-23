// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select('-password'); // Use decoded.user.id

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


// Middleware for admin users only
const admin = (req, res,next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }else {
        res.status(403).json({ message: 'Unauthorized, you are not an admin' });
    }
}

export { protect,admin };