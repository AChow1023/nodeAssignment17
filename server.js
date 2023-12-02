const express = require("express");
const app = express();
const joi = require("joi");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const multer = require("multer");
const mongoose = require("mongoose");

mongoose
    .connect("mongodb://localhost/characters")
    .then(()=>console.log("Connected to mongodb"))
    .catch((error) => console.log("Couldn't connect to mongodb", error));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const characterSchema = new mongoose.Schema({
   // _id: mongoose.SchemaTypes.ObjectId,
    name: String,
    height: String,
    nationality: String,
    stand_power: String,
    enemy: String,
    team: [String],
    img: String
});

const Character = mongoose.model("Character", characterSchema);

const upload = multer({dest: __dirname + "/public/images"});


app.get("/api/characters", (req, res) => {
    getCharacters(res);
});

const getCharacters = async (res) => {
    const characters = await Character.find();
    res.send(characters);
};


app.get("/api/characters/:id", (req,res) => {
    getCharacter(res, req.params.id);
});

const getCharacter = async(res, id) => {
    const character = await Character.findOne({_id:id});
    res.send(character);
};

app.post("/api/characters", upload.single("img"), (req, res) => {
    const result = validateCharacter(req.body);
    
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    };

    const character = new Character({
        name: req.body.name,
        height: req.body.height,
        nationality: req.body.nationality,
        stand_power: req.body.stand_power,
        enemy: req.body.enemy,
        team: req.body.team.split(",")
    })
    if(req.file){
        character.img = "images/" + req.file.filename;
    }

    createCharacter(res, character);
});

const createCharacter = async(res, character) =>{
    const result = await character.save();
    res.send(character);
}

app.put("/api/characters/:id", upload.single("img"), (req, res) => {
    const result = validateCharacter(req.body);
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    updateCharacter(req, res);
});

const updateCharacter = async (req,res) => {
    let fieldsToUpdate = {
        name: req.body.name,
        height: req.body.height,
        nationality: req.body.nationality,
        stand_power: req.body.stand_power,
        enemy: req.body.enemy,
        team: req.body.team.split(",")
    }
    if(req.file){
        fieldsToUpdate.img = "images/" + req.file.filename;
    }
    
    const result = await Character.updateOne({_id:req.params.id}, fieldsToUpdate)
    res.send(result);
};

app.delete("/api/characters/:id", upload.single("img"), (req,res) =>{
    removeCharacter(res, req.params.id);
});

const removeCharacter = async(res, id) => {
    const character = await Character.findByIdAndDelete(id);
    res.send(character);
};

const validateCharacter = (character) => {
    const schema = joi.object({
        _id: joi.allow(""),
        name: joi.string().min(3).required(),
        height: joi.string().min(3).required(),
        nationality: joi.string().min(3).required(),
        stand_power: joi.string().min(3).required(),
        enemy: joi.string().min(3).required(),
        team: joi.allow("")
    });
    return schema.validate(character);
};

app.listen(3000);