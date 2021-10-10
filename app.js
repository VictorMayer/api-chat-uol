import express from "express";
import chalk from "chalk";
import cors from "cors";
import fs from "fs";

const port = 4000;
const app = express();
app.use(express.json());
app.use(cors());

const database = fs.readFileSync("./database.json");
const messages = JSON.parse(database.toString()).messages;
const participants = JSON.parse(database.toString()).comments;

function saveData() {
    const content = {
        participants,
        messages
    }
    fs.writeFileSync(".database.json", JSON.stringify(content));
}

app.post("/participants", (req, res) => {
    //blaablabla
});

app.get("/participants", (req, res) => {
    //blablabla
});

app.post("/messages", (req, res) => {
    //blablabla
});

app.get("/messages", (req, res) => {
    //blablabla
});

app.post("/status", (req, res) => {
    //blablabla
});

app.listen(port, () => {
    console.log("Server running on Port: "+chalk.blue(port));
})