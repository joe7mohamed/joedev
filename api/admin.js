import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Admin login
    const { password } = req.body;
    
    if (password === process.env.ADMIN_SECRET) {
      const token = jwt.sign(
        { admin: true, timestamp: Date.now() },
        process.env.ADMIN_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        success: true,
        token,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    return;
  }

  // Verify admin token for other requests
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    if (!decoded.admin) {
      throw new Error('Invalid token');
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'joe-profile');
    const collection = db.collection('contacts');

    if (req.method === 'GET') {
      // Get contacts with filters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const filter = {};
      if (req.query.projectType) {
        filter.projectType = req.query.projectType;
      }
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { company: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const contacts = await collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else if (req.method === 'DELETE') {
      // Delete contact
      const { id } = req.query;
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 1) {
        res.status(200).json({ success: true, message: 'Contact deleted' });
      } else {
        res.status(404).json({ success: false, message: 'Contact not found' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  } finally {
    await client.close();
  }
}