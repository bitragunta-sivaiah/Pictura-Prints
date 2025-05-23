import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js'; // Using your provided middleware

import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

const router = express.Router();

router.get(
    '/',
    protect,
    asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const { page = 1, limit = 10, read, type } = req.query;

        const query = { recipient: userId };

        if (read !== undefined) {
            query.read = read === 'true';
        }
        if (type) {
            query.type = type;
        }

        const pageSize = parseInt(limit);
        const currentPage = parseInt(page);
        const skip = (currentPage - 1) * pageSize;

        const notifications = await Notification.find(query)
            .populate('order', 'orderNumber status total')
            .populate('product', 'name basePrice')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(skip);

        const totalNotifications = await Notification.countDocuments(query);

        res.json({
            notifications,
            page: currentPage,
            pages: Math.ceil(totalNotifications / pageSize),
            total: totalNotifications,
            limit: pageSize,
        });
    })
);

router.get(
    '/unread-count',
    protect,
    asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            read: false,
        });
        res.json({ unreadCount });
    })
);

router.put(
    '/:id/read',
    protect,
    asyncHandler(async (req, res) => {
        const notificationId = req.params.id;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId,
        });

        if (notification) {
            if (!notification.read) {
                notification.read = true;
                await notification.save();
                res.json({ message: 'Notification marked as read', notification });
            } else {
                res.json({ message: 'Notification was already marked as read', notification });
            }
        } else {
            res.status(404);
            throw new Error('Notification not found or not authorized to access');
        }
    })
);

router.put(
    '/mark-all-read',
    protect,
    asyncHandler(async (req, res) => {
        const userId = req.user._id;

        const updateResult = await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );

        await User.findByIdAndUpdate(
            userId,
            { lastReadNotificationsAt: new Date() },
            { new: true, runValidators: true }
        );

        res.json({
            message: `Successfully marked ${updateResult.modifiedCount} notifications as read.`,
            modifiedCount: updateResult.modifiedCount,
        });
    })
);

router.delete(
    '/:id',
    protect,
    asyncHandler(async (req, res) => {
        const notificationId = req.params.id;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId,
        });

        if (notification) {
            await notification.deleteOne();
            res.json({ message: 'Notification removed successfully' });
        } else {
            res.status(404);
            throw new Error('Notification not found or not authorized to delete');
        }
    })
);

export default router;