const express = require('express');
const mariadb = require('mariadb');
const path = require('path');

const app = express();
const port = 8080;

const pool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'akori3',  // Changed "username" to "user"
    password: 'Ashi27824!',  // MariaDB password
    database: 'bankdb',  // Database name
    connectionLimit: 5
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Greeting endpoint
app.get('/greeting', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

// Register a new user
app.post('/register', async (req, res) => {
    const { username } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO Users(username) VALUES (?)', [username]);
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// List all users
app.get('/list', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT username FROM Users');
        const users = rows.map(row => row.username);
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

// Render the index page with the user list
app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT username FROM Users');
        const users = rows.map(row => row.username);
        res.render('index', { users });
    } catch (err) {
        res.status(500).send(`Error retrieving users: ${err}`);
    } finally {
        if (conn) conn.release();
    }
});

// Clear all users
app.post('/clear', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM Users');
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://<YOUR_EXTERNAL_IP>:${port}`);
});








