import express from "express";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// const pool = new pg.Pool({
//     database: "tasks"
// });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === "production"
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());


// GET //
//Client//
app.get("/api/tasks", (req, res) => {
  pool.query("SELECT * FROM tasks").then((data) => {
    res.send(data.rows);
    console.log(data.rows);
  });
  console.log(req.body);
});

//Tasks//
app.get("/api/tasks/:id", (req, res) => {
const  { id }  = req.params;
console.log(req.params.id, "this is the ID");
  pool.query(`SELECT task FROM tasks WHERE id = ($1);`, [id]).then((data) => {
    const client = data.rows[0];
    if (client) {
      res.send(client);
      console.log(client, "this is the task");
    } else {
      res.sendStatus(404);
    }
  });
});


// //POST//
// //Post new user//
app.post("/api/tasks", (req, res) => {
  const { task } = req.body;
  console.log(req.body)
  if (!task) {
    res.sendStatus(400);
  } else {
    pool
      .query(
        `INSERT INTO tasks (task) 
        VALUES ($1) RETURNING *;`,
        [task]
      )
      .then((data) => {
        res.status(201).send(data.rows[0]);
        console.log("input successful");
      });
  }
});

// // PATCH //
// //PATCH specific Client //
app.patch("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const {task} = req.body;
  if (task) {
    pool
      .query(
        `
        UPDATE tasks
        SET task = COALESCE($1, task)
        WHERE id = $2
        RETURNING *;
        `,
        [task, id]
      )
      .then((data) => {
        res.status(200).send(data.rows[0]);
        console.log("UPDATE task Complete");
      });
  } else {
    res.sendStatus(400);
  }
});

// // DELETE //
// //Client ID//
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  pool
    .query(`DELETE FROM tasks WHERE id = $1 RETURNING *;`, [id])
    .then((data) => {
      if (data.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
        console.log("Delete Successful");
      }
    });
});



//SERVER Listening//
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
