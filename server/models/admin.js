const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: false },
  // Each checkout-init record is stored as:
  // {
  //   dateISO: 'YYYY-MM-DD',
  //   timeISO: 'HH:mm:ss.SSSZ',
  //   hour: 0-23,
  //   amount: Number, // cart total (finalTotal)
  //   items: [{ name: String, quantity: Number }]
  // }
  totalSales: { type: Array, default: [] },
}, { timestamps: true });

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;

