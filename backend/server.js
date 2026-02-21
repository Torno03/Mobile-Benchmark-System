const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const phoneRoutes = require('./routes/phoneRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const FaqRoutes = require('./routes/FaqRoutes');
const commentRoutes      = require('./routes/commentRoutes')

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/phones', phoneRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/faqs', FaqRoutes);
app.use('/api/phones', commentRoutes)

// Start the server
const PORT = process.env.PORT || 1080;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`)); // Activates the server
