// const pool = require("./db.connection");


// var express = require('express');
// var bodyParser = require('body-parser');
// var cors = require('cors');
// var app = express();

// app.use(bodyParser.json());
// app.use(cors());

// // Import and use fetch routes
// var personRoutes = require('./fetch/fetch');

// app.use('/api', personRoutes);

// app.listen(8080, () => {
//     console.log('Server listening on port 8080');
// });

// app.post("/api/add-task", (req, res) => {
//     const { taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status } = req.body;

//     const sql = "INSERT INTO tasks (task_owner, task_name, task_description, start_date, due_date, reminder, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
//     const values = [taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status];

//     pool.query(sql, values, (err, result) => {
//         if (err) {
//             console.error("Error inserting task:", err);
//             return res.status(500).json({ success: false, message: "Failed to add task" });
//         }

//         console.log("Insert Query Result:", result);

//         // ✅ Ensure insertId is returned
//         if (result.insertId) {
//             console.log("Returning Task ID:", result.insertId);
//             res.json({ success: true, taskId: result.insertId });

//         } else {
//             res.json({ success: false, message: "Task added but no ID returned" });
//         }
//     });
// });




const pool = require("./db.connection");
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

app.use(bodyParser.json());




app.use(cors({
    origin: function (origin, callback) {
        if (!origin || ['http://localhost:5500', 'http://127.0.0.1:5500', null].includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));


// Import and use fetch routes
var personRoutes = require('./fetch/fetch');
app.use('/api', personRoutes);

app.listen(8080, () => {
    console.log('Server listening on port 8080');
});

app.post("/api/add-task", (req, res) => {
    const { taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status } = req.body;

    const sql = "INSERT INTO tasks (task_owner, task_name, task_description, start_date, due_date, reminder, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status];

    pool.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting task:", err);
            return res.status(500).json({ success: false, message: "Failed to add task" });
        }

        console.log("Insert Query Result:", result);

        // ✅ Ensure insertId is returned
        if (result.insertId) {
            console.log("Returning Task ID:", result.insertId);
            res.json({ success: true, taskId: result.insertId });
        } else {
            res.json({ success: false, message: "Task added but no ID returned" });
        }
    });
});

// ✅ New API to fetch task details by taskId
app.get("/api/get-task", (req, res) => {
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

            // ✅ Convert database column names (snake_case) to JavaScript object (camelCase)
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


//third page
// API to fetch all tasks
app.get("/api/get-tasks", (req, res) => {
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

// API route to update task status
app.post("/api/update-task-status/:taskId", (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    const sql = "UPDATE tasks SET status = ? WHERE id = ?";
    pool.query("SELECT id FROM tasks WHERE id = ?", [taskId], (err, result) => {
        if (err) {
            console.error("Error fetching task:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch task" });
        }
    
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
    
        pool.query(sql, [status, taskId], (err, results) => {
            if (err) {
                console.error("Error updating task status:", err);
                return res.status(500).json({ success: false, message: "Failed to update task status" });
            }
    
            res.json({ success: true, message: "Task status updated successfully" });
        });
    });
    
});


// Get Task by ID
app.get("/tasks/:id", (req, res) => {
    const taskId = req.params.id;
    pool.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json(result[0]);
    });
});

// Update Task
// ✅ Update Task API (Fixed)
app.put("/api/update-task/:id", (req, res) => {
    const taskId = req.params.id;
    const { taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status } = req.body;

    const sql = `
        UPDATE tasks 
        SET task_owner = ?, task_name = ?, task_description = ?, start_date = ?, due_date = ?, 
            reminder = ?, priority = ?, status = ? 
        WHERE id = ?`;

    const values = [taskOwner, taskName, taskDescription, startDate, dueDate, reminder, priority, status, taskId];

    pool.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating task:", err);
            return res.status(500).json({ success: false, message: "Failed to update task" });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Task updated successfully" });
        } else {
            res.json({ success: false, message: "No task found with the given ID" });
        }
    });
});


//delete
app.delete("/api/delete-task/:id", (req, res) => {
    const taskId = req.params.id;

    if (!taskId) {
        return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    const sql = "DELETE FROM tasks WHERE id = ?";
    
    pool.query(sql, [taskId], (err, result) => {
        if (err) {
            console.error("Error deleting task:", err);
            return res.status(500).json({ success: false, message: "Server error: " + err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task deleted successfully" });
    });
});
