const { createTask, listTasks, updateTask, deleteTask } = require('../services/taskService');

const createTaskController = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const task = await createTask(req.user._id, req.body || {});
        return res.status(201).json(task);
    } catch (error) {
        console.error('Error in createTaskController:', error);
        return res.status(500).json({ message: 'Server error while creating task' });
    }
};

const getTasksController = async (req, res) => {
    try {
        const tasks = await listTasks(req.user._id);
        return res.json(tasks);
    } catch (error) {
        console.error('Error in getTasksController:', error);
        return res.status(500).json({ message: 'Server error while fetching tasks' });
    }
};

const updateTaskController = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await updateTask(req.user._id, id, req.body || {});

        if (!updated) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.json(updated);
    } catch (error) {
        console.error('Error in updateTaskController:', error);
        return res.status(500).json({ message: 'Server error while updating task' });
    }
};

const deleteTaskController = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteTask(req.user._id, id);

        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error in deleteTaskController:', error);
        return res.status(500).json({ message: 'Server error while deleting task' });
    }
};

module.exports = {
    createTaskController,
    getTasksController,
    updateTaskController,
    deleteTaskController
};

