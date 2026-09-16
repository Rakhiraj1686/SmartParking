const Notification = require('../models/Notification');

async function getMine(req, res, next) {
  try {
    // Broadcast/system notifications (userId: null) + this user's own.
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'Notifications retrieved', data: notifications });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked read', data: notification });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { $or: [{ userId: req.user._id }, { userId: null }] },
      { $set: { read: true } }
    );
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: 'All notifications marked read', data: notifications });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMine, markRead, markAllRead };
