import express from "express";
import chalk from "chalk";
import dayjs from "days";
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
    const name = req.body.name.trim();
    const beingUsed = participants.find(participant => participant.name === name);
    if(name.length === 0) return res.status(400).send({error:"Nome não pode ser vazio!"});
    if(beingUsed) return res.status(400).send({error:"O nome já está sendo utilizado!"});
    const newParticipant = {
        name,
        lastStatus: Date.now()
    }
    const time = dayjs().format('HH:mm:ss');
    const welcomeMessage = {
        from: name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: time
    }
    participants.push(newParticipant);
    messages.push(welcomeMessage);
    saveData();
    res.sendStatus(200);
});

app.get("/participants", (req, res) => {
    res.send(participants);
});

app.post("/messages", (req, res) => {
    const {to, text, type} = req.body;
    const from = req.headers.user;
    const time = dayjs().format("HH:mm:ss");

    if(to.length === 0 || text.trim().length === 0) return res.sendStatus(400);
    if(type !== "message" && type !== "private_message") return res.sendStatus(400); 
    if(!participants.find(participant => participant.name === from)) return res.sendStatus(400);

    const newMessage = { from, to, text, type, time }
    res.sendStatus(200);
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