const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "taskdb",
    port: process.env.DB_PORT || 3306
};

let db;

function connectDatabase() {
    db = mysql.createConnection(dbConfig);

    db.connect((err) => {
        if (err) {
            console.log("Database connection failed, retrying in 5 seconds...");
            console.error(err.message);
            setTimeout(connectDatabase, 5000);
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

    db.on("error", (err) => {
        console.log("Database error:", err.message);

        if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNREFUSED") {
            setTimeout(connectDatabase, 5000);
        } else {
            throw err;
        }
    });
}

connectDatabase();

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM tasks", (err, results) => {
        if (err) {
            return res.status(500).send("Database query failed: " + err.message);
        }
        res.render("tasks", { tasks: results });
    });
});

app.post("/add-task", (req, res) => {
    const task = req.body.task;

    db.query(
        "INSERT INTO tasks (task) VALUES (?)",
        [task],
        (err) => {
            if (err) {
                return res.status(500).send("Insert failed: " + err.message);
            }
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
            if (err) {
                return res.status(500).send("Delete failed: " + err.message);
            }
            res.redirect("/tasks");
        }
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});