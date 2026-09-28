const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();

const db = new sqlite3.Database("fightlab.db");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "fightlab",
    resave: false,
    saveUninitialized: false
}));


// =========================
// DATABASE TABLES
// =========================

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
`);


// IMPORTANT:
// user_id connects every analysis to the user who created it.

db.run(`
    CREATE TABLE IF NOT EXISTS analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        fighter TEXT,
        technique TEXT,
        observation TEXT
    )
`);


// =========================
// LOGIN PAGE
// =========================

app.get("/login.html", (req, res) => {

    if (req.session.user) {
        return res.redirect("/dashboard.html");
    }

    res.sendFile(__dirname + "/login.html");

});


// =========================
// SIGNUP PAGE
// =========================

app.get("/signup.html", (req, res) => {

    res.sendFile(__dirname + "/signup.html");

});


// =========================
// HOME
// =========================

app.get("/", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    res.sendFile(__dirname + "/index.html");

});


app.get("/index.html", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    res.sendFile(__dirname + "/index.html");

});


// =========================
// DASHBOARD
// =========================

app.get("/dashboard.html", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    res.sendFile(__dirname + "/dashboard.html");

});


// =========================
// SIGNUP
// =========================

app.post("/signup", (req, res) => {

    const { email, password } = req.body;

    db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, password],
        function(error) {

            if (error) {

                return res.send(`
                    <html>

                    <body style="
                        background:#111;
                        color:white;
                        font-family:Arial;
                        text-align:center;
                        padding:80px;
                    ">

                        <h2 style="color:red;">
                            Account Already Exists
                        </h2>

                        <a href="/login.html"
                           style="color:red;">
                            Go to Login
                        </a>

                    </body>

                    </html>
                `);

            }

            res.send(`
                <html>

                <body style="
                    background:#111;
                    color:white;
                    font-family:Arial;
                    text-align:center;
                    padding:80px;
                ">

                    <h2 style="color:red;">
                        Account Created Successfully!
                    </h2>

                    <p>
                        You can now login to FIGHTLAB.
                    </p>

                    <a href="/login.html"
                       style="color:red;">
                        Login
                    </a>

                </body>

                </html>
            `);

        }
    );

});


// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password],
        (error, user) => {

            if (error) {
                return res.send("Database error.");
            }

            if (!user) {

                return res.send(`
                    <html>

                    <body style="
                        background:#111;
                        color:white;
                        font-family:Arial;
                        text-align:center;
                        padding:80px;
                    ">

                        <h2 style="color:red;">
                            Invalid Email or Password
                        </h2>

                        <a href="/login.html"
                           style="color:red;">
                            Try Again
                        </a>

                    </body>

                    </html>
                `);

            }

            // Store user ID and email in session
            req.session.user = {
                id: user.id,
                email: user.email
            };

            res.redirect("/dashboard.html");

        }
    );

});


// =========================
// SAVE FIGHT ANALYSIS
// =========================

app.post("/analysis", (req, res) => {

    // Check login

    if (!req.session.user) {

        return res.status(401).json({
            message: "Please login first."
        });

    }


    const {
        fighter,
        technique,
        observation
    } = req.body;


    // Get logged-in user's ID

    const userId = req.session.user.id;


    // Save analysis with user ID

    db.run(
        `
        INSERT INTO analysis
        (user_id, fighter, technique, observation)
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            fighter,
            technique,
            observation
        ],
        function(error) {

            if (error) {

                console.log(error);

                return res.status(500).json({
                    message: "Could not save analysis."
                });

            }

            res.json({
                message: "Analysis saved successfully.",
                id: this.lastID
            });

        }
    );

});


// =========================
// SHOW USER'S ANALYSIS
// =========================

app.get("/analysis", (req, res) => {

    // Check login

    if (!req.session.user) {
        return res.redirect("/login.html");
    }


    const userId = req.session.user.id;


    // IMPORTANT:
    // Only get analyses belonging to logged-in user

    db.all(
        `
        SELECT *
        FROM analysis
        WHERE user_id = ?
        ORDER BY id DESC
        `,
        [userId],
        (error, rows) => {

            if (error) {

                console.log(error);

                return res.send(
                    "Something went wrong."
                );

            }


            let result = `

                <html>

                <head>

                    <title>FIGHTLAB - Saved Analysis</title>

                    <style>

                        body {
                            background:#111;
                            color:white;
                            font-family:Arial;
                            padding:40px;
                        }

                        h2 {
                            color:red;
                            text-align:center;
                        }

                        .top {
                            text-align:center;
                            margin-bottom:30px;
                        }

                        .analysis {
                            background:#222;
                            padding:20px;
                            margin:20px auto;
                            max-width:650px;
                            border-left:4px solid red;
                            border-radius:5px;
                        }

                        .analysis h3 {
                            color:red;
                            margin-top:0;
                        }

                        .analysis p {
                            color:#ccc;
                            line-height:1.6;
                        }

                        a {
                            color:red;
                            text-decoration:none;
                        }

                        a:hover {
                            text-decoration:underline;
                        }

                    </style>

                </head>


                <body>

                    <div class="top">

                        <h2>
                            Saved Fight Analyses
                        </h2>

                        <p>
                            Logged in as:
                            ${req.session.user.email}
                        </p>

                    </div>

            `;


            // No records

            if (rows.length === 0) {

                result += `

                    <p style="
                        text-align:center;
                        color:#aaa;
                    ">

                        You have not saved any
                        fight analysis yet.

                    </p>

                `;

            }


            // Display records

            rows.forEach(row => {

                result += `

                    <div class="analysis">

                        <h3>
                            🥊 ${row.fighter}
                        </h3>

                        <p>

                            <b>Technique:</b>

                            ${row.technique}

                        </p>


                        <p>

                            <b>Observation:</b>

                            ${row.observation}

                        </p>

                    </div>

                `;

            });


            result += `

                    <p style="
                        text-align:center;
                        margin-top:40px;
                    ">

                        <a href="/dashboard.html">
                            ← Back to Dashboard
                        </a>

                    </p>

                </body>

                </html>

            `;


            res.send(result);

        }

    );

});


// =========================
// TRAINING ASSISTANT
// =========================

app.post("/ai", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            answer: "Please login first."
        });

    }

    const question =
        req.body.question.toLowerCase();

    let answer = "";


    if (question.includes("jab")) {

        answer =
            "To improve your jab, focus on speed, proper stance and quick recovery. Keep your guard up and return your hand quickly.";

    }

    else if (question.includes("cross")) {

        answer =
            "For a better cross, rotate your hip and shoulder while keeping your balance. Return your hand to your guard.";

    }

    else if (question.includes("footwork")) {

        answer =
            "Good footwork helps you maintain balance, control distance and move safely. Practice moving forward, backward and sideways.";

    }

    else if (
        question.includes("defense") ||
        question.includes("defend")
    ) {

        answer =
            "Basic defense includes keeping your guard up, moving your head and using footwork. Start slowly and focus on technique.";

    }

    else if (
        question.includes("training") ||
        question.includes("workout")
    ) {

        answer =
            "A beginner session can include warm-up, shadow boxing, basic technique drills, footwork and light conditioning.";

    }

    else if (question.includes("mma")) {

        answer =
            "MMA combines striking, wrestling and grappling. Beginners should learn the fundamentals of each area.";

    }

    else if (question.includes("punch")) {

        answer =
            "When practicing punches, focus on stance, balance, technique and returning your hands to guard.";

    }

    else {

        answer =
            "For beginners, focus on proper stance, footwork, basic techniques and regular practice.";

    }


    res.json({
        answer: answer
    });

});


// =========================
// LOGOUT
// =========================

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/login.html");

    });

});


// =========================
// STATIC FILES
// =========================

app.use(express.static(__dirname));


// =========================
// START SERVER
// =========================

app.listen(3000, () => {

    console.log(
        "FIGHTLAB running at http://localhost:3000"
    );

});