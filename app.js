import express from "express";
import chalk from "chalk";
import dayjs from "dayjs";
import cors from "cors";
import joi from "joi";
import fs from "fs";

const port = 4000;
const app = express();
app.use(express.json());
app.use(cors());

const database = fs.readFileSync('./database.json');
const messages = JSON.parse(database.toString()).messages;
let participants = JSON.parse(database.toString()).participants;

const participantSchema = joi.object({
    name: joi.string().alphanum().min(1).max(35).required()
});

function saveData() {
    const content = {
        participants,
        messages
    }
    fs.writeFileSync("./database.json", JSON.stringify(content));
}

const removeAFK = setInterval(()=> {
    console.log("repetindo interval")
    participants.forEach((participant) => {
        if(Date.now() - participant.lastStatus > 10000) {
            const logoutMsg = {from: participant.name, to: "Todos", text: "sai da sala...", type: "status", time: dayjs().format("HH:mm:ss")}
            messages.push(logoutMsg);
        }
    })
    participants = participants.filter((participant) => (Date.now() - participant.lastStatus <= 10000 ));
    saveData();
}, 15000);

app.post("/participants", (req, res) => {
    const name = req.body.name.trim();
    const beingUsed = participants?.find(participant => participant.name === name);
    const time = dayjs().format('HH:mm:ss');
    const valid = participantSchema.validate({name})
    if(valid.error !== undefined) return res.status(400).send({error:"Nome inválido!"});
    if(beingUsed) return res.status(400).send({error:"O nome já está sendo utilizado!"});
    
    const newParticipant = {
        name,
        lastStatus: Date.now()
    }
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
    messages.push(newMessage);
    saveData();
    res.sendStatus(200);
});

app.get("/messages", (req, res) => {
    const { user } = req.headers;
    const { limit } = req.query;
    const messageList = messages.filter((msg) => (msg.type === "status" || msg.type === "message" || (msg.type === "private_message" && (msg.to === user || msg.from === user))))
    const filteredMessageList = limit ? [] : messageList;
    for(let i=0 ; i<Number(limit); i++){
        if(i >= messageList.length) break; 
        filteredMessageList.push(messageList[i]);
    }
    res.send(filteredMessageList);
});

app.post("/status", (req, res) => {
    const { user } = req.headers;
    if(!participants.find(participant => participant.name === user)) return res.sendStatus(400);
    for(let i=0; i<participants.length; i++){
        if(participants[i].name === user){
            participants[i].lastStatus = Date.now();
        }
    }
    saveData();
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log("Server running on Port: "+chalk.blue(port));
})