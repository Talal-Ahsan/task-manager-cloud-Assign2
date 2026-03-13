const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

/* -------------------- VIEW ENGINE -------------------- */

app.set("view engine", "ejs");

/* -------------------- MIDDLEWARE -------------------- */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* -------------------- DATABASE CONNECTION -------------------- */

const db = mysql.createConnection({
    host: process.env.RDS_HOSTNAME || "localhost",
    user: process.env.RDS_USERNAME || "root",
    password: process.env.RDS_PASSWORD || "",
    database: process.env.RDS_DB_NAME || "taskdb",
    port: process.env.RDS_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        throw err;
    }
    console.log("Database Connected");
});

/* -------------------- ROUTES -------------------- */

// Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// Show all tasks
app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM tasks", (err, results) => {
        if (err) throw err;
        res.render("tasks", { tasks: results });
    });
});

// Add task
app.post("/add-task", (req, res) => {
    const task = req.body.task;

    db.query(
        "INSERT INTO tasks (task) VALUES (?)",
        [task],
        (err) => {
            if (err) throw err;
            res.redirect("/tasks");
        }
    );
});

// Delete task
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM tasks WHERE id = ?",
        [id],
        (err) => {
            if (err) throw err;
            res.redirect("/tasks");
        }
    );
});

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});