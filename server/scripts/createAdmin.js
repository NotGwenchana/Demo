// scripts/createAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/admin');
const { hashPassword } = require('../helpers/auth');
const dotenv = require('dotenv').config();

// Match server/index.js DNS workaround
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


const createAdmin = async () => {
  try {
    require('dotenv').config();
    const uri = process.env.MONGO_URl;

    if (!uri) throw new Error('Missing MongoDB URI (MONGO_URl)');


    await mongoose.connect(uri);

    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await hashPassword('admin123');
    const admin = new Admin({
      username: 'admin',
      email: 'band25425@gmail.com',
      password: hashedPassword,
      phone: '0000000000',
      role: 'superadmin',
      isActive: true
    });


    await admin.save();
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createAdmin();