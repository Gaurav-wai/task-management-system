var express = require('express');
var pool = require('../db.connection.js'); // Ensure correct filename
var router = express.Router();

router.use(express.json());

// Fetch all persons from the database
router.get('/persons', (req, res) => {
    pool.query('SELECT * FROM person;', (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            res.status(500).json({ error: "Database query failed" });
            return;
        }
        res.json(results);
    });
    console.log("Operation successful");
});

// Insert a new task into the database
router.post('/add-task', (req, res) => {
    const { taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status } = req.body;

    const query = `
        INSERT INTO tasks (task_owner, task_name, task_description, start_date, due_date, reminder, priority, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(query, [taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err);
            res.status(500).json({ success: false, message: "Database insert failed" });
        } else {
            console.log("Task inserted, ID:", result.insertId);
            res.json({ success: true, message: "Task successfully!", taskId: result.insertId });
        }
    });
});



//third page



// API to fetch all tasks
router.get('/get-tasks', (req, res) => {
    const sql = "SELECT * FROM tasks";  // Make sure your database contains tasks

    pool.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
        }

        // Return the task data as a JSON response
        res.json(results);
    });
});

// API to fetch task details by taskId
router.get('/get-task', (req, res) => {
    const { taskId } = req.query;
    
    if (!taskId) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
    }

    const sql = "SELECT * FROM tasks WHERE id = ?";
    
    pool.query(sql, [taskId], (err, results) => {
        if (err) {
            console.error("Error fetching task:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch task" });
        }

        if (results.length > 0) {
            const task = results[0];

            // Convert database column names (snake_case) to JavaScript object (camelCase)
            res.json({
                taskId: task.id,
                taskOwner: task.task_owner,
                taskName: task.task_name,
                taskDescription: task.task_description,
                startDate: task.start_date,
                dueDate: task.due_date,
                reminder: task.reminder,
                priority: task.priority,
                status: task.status
            });

        } else {
            res.status(404).json({ success: false, message: "Task not found" });
        }
    });
});

// API route to update task status
router.post('/update-task-status/:taskId', (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    const sql = "UPDATE tasks SET status = ? WHERE id = ?";
    pool.query(sql, [status, taskId], (err, results) => {
        if (err) {
            console.error("Error updating task status:", err);
            return res.status(500).json({ success: false, message: "Failed to update task status" });
        }

        res.json({ success: true });
    });
});



module.exports = router;
