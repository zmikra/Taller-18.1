const express = require("express");
const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "pruebadb",
  connectionLimit: 5,
});

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Bienvenid@ al servidor</h1>");
});

app.get("/people", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, name, lastname, email FROM people"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.get("/people/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, name, lastname, email FROM people WHERE id=?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.post("/people", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `INSERT INTO people(name, lastname, email) VALUE(?, ?, ?)`,
      [req.body.name, req.body.lastname, req.body.email]
    );

    res.json({ id: parseInt(response.insertId), ...req.body });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.put("/people/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `UPDATE people SET name=?, lastname=?, email=? WHERE id=?`,
      [req.body.name, req.body.lastname, req.body.email, req.params.id]
    );

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.delete("/people/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("DELETE FROM people WHERE id=?", [
      req.params.id,
    ]);
    res.json({ message: "Elemento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
