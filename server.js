const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "taskdb",
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        console.error(err);
        return;
    }

    console.log("Database Connected");

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task VARCHAR(255) NOT NULL
        )
    `;

    db.query(createTableQuery, (tableErr) => {
        if (tableErr) {
            console.log("Table creation failed");
            console.error(tableErr);
            return;
        }
        console.log("Tasks table ready");
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM tasks", (err, results) => {
        if (err) throw err;
        res.render("tasks", { tasks: results });
    });
});

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});