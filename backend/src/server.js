require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initCronJobs } = require('./jobs/attendanceCron');

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        const app = express();

        // Middleware
        app.use(cors());
        app.use(express.json());
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });

        // Routes
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/mood', require('./routes/moodRoutes'));
        app.use('/api/ai', require('./routes/aiRoutes'));
        app.use('/api/chat', require('./routes/chatRoutes'));
        app.use('/api/calendar', require('./routes/calendarRoutes'));
        app.use('/api/tasks', require('./routes/taskRoutes'));
        app.use('/api/focus', require('./routes/focusRoutes'));
        app.use('/api/wellness', require('./routes/wellnessRoutes'));
        app.use('/api/leave', require('./routes/leaveRoutes'));
        app.use('/api/attendance', require('./routes/attendanceRoutes'));
        app.use('/api/holidays', require('./routes/holidayRoutes'));

        app.get('/', (req, res) => {
            res.send('CalmX API is running...');
        });

        const PORT = process.env.PORT || 5000;

        // Initialize cron jobs
        initCronJobs();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

