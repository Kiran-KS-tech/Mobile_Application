const express = require('express');
const router = express.Router();
const {
    createTaskController,
    getTasksController,
    updateTaskController,
    deleteTaskController
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTaskController);
router.get('/', getTasksController);
router.put('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

module.exports = router;

