// Simple in-memory task store per user.

const userTasks = new Map();

const getUserTasks = (userId) => {
    const key = userId.toString();
    if (!userTasks.has(key)) {
        userTasks.set(key, []);
    }
    return userTasks.get(key);
};

const smartPriorityScore = (task) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;

    let score = 0;

    const priorityMap = { low: 0, medium: 10, high: 20, critical: 30 };
    score += priorityMap[(task.priority || 'medium').toLowerCase()] || 0;

    if (dueDate) {
        const diffHours = (dueDate - now) / (1000 * 60 * 60);
        if (diffHours <= 0) score += 25;
        else if (diffHours <= 24) score += 20;
        else if (diffHours <= 72) score += 10;
    }

    if (task.estimatedMinutes) {
        if (task.estimatedMinutes <= 30) score += 5;
        else if (task.estimatedMinutes <= 90) score += 3;
    }

    if (task.tags && Array.isArray(task.tags)) {
        if (task.tags.includes('deep-work')) score += 8;
        if (task.tags.includes('meeting')) score += 3;
        if (task.tags.includes('health')) score += 5;
    }

    if (task.completed) {
        score = -1;
    }

    return score;
};

const createTask = async (userId, payload) => {
    const tasks = getUserTasks(userId);
    const base = {
        id: `${userId}-${Date.now()}-${tasks.length + 1}`,
        title: payload.title || 'Untitled',
        description: payload.description || '',
        status: payload.status || 'pending',
        priority: payload.priority || 'medium',
        dueDate: payload.dueDate || null,
        estimatedMinutes: payload.estimatedMinutes || null,
        tags: payload.tags || [],
        completed: payload.completed || false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    base.smartPriorityScore = smartPriorityScore(base);
    tasks.push(base);

    return base;
};

const listTasks = async (userId) => {
    const tasks = getUserTasks(userId);
    return tasks.sort((a, b) => b.smartPriorityScore - a.smartPriorityScore);
};

const updateTask = async (userId, taskId, payload) => {
    const tasks = getUserTasks(userId);
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;

    const updated = {
        ...tasks[idx],
        ...payload,
        updatedAt: new Date()
    };
    updated.smartPriorityScore = smartPriorityScore(updated);

    tasks[idx] = updated;
    return updated;
};

const deleteTask = async (userId, taskId) => {
    const tasks = getUserTasks(userId);
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    return true;
};

module.exports = {
    createTask,
    listTasks,
    updateTask,
    deleteTask,
    smartPriorityScore
};

