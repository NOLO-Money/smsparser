const express = require("express");
const parser = require("./routes/parser")
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.post("/parse", function (req, res) {
    console.log("parsing request {}", req)
    res.send(parser(req.body));
});

app.listen(3000, () => console.log('Server started'));