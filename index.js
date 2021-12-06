const express = require("express");

const booksRouter = require("./routes/books");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");

const app = express();

/* quando estamos a interagir com o HTTP Body (ex: REST) é preciso carregar
o middleware específico para lidar com esses tipos de request, neste caso JSON */
app.use( express.json() );

app.get("/", (req, res) => {
    res.send("Funca?");
});

app.use("/api/books", booksRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);

app.listen( process.env.PORT || 3000 );








