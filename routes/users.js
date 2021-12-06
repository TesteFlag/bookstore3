const fs = require("fs");
const joi = require("joi");
const express = require("express");

const router = express.Router();

const validationSchema = joi.object({
    name: joi.string().min(3).max(60).required(),
    email: joi.string().email().required(),
    phone: joi.string().min(9).max(30).required(),
    birth_date: joi.date().min("1900-01-01").max("2010-12-31").required()
});

async function getUsers() {
    const users = await fs.promises.readFile("users.json", "utf8");
    return JSON.parse(users);
}

async function writeUsers( users ) {
    await fs.promises.writeFile(
        "users.json", JSON.stringify(users), "utf8"
    );
}

router.get("/", async (req, res) => {
    res.send( await getUsers() );
});

router.get("/:id", async (req, res) => {
    const users = await getUsers();

    const user = users.find( row => row.id == req.params.id );

    if(!user) {
        return res.status(404).send({"message":"Not Found"});
    }

    res.send( user );
});

router.post("/", async (req, res) => {
    const users = await getUsers();

    const newUser = req.body;

    const error = validationSchema.validate( newUser ).error;
    if(error) {
        return res.status(400).send({"message" : error.details[0].message });
    }

    newUser.id = users[ users.length - 1].id + 1;

    users.push( newUser );

    await writeUsers( users );

    res.status(202).send( newUser );
});

router.put("/:id", async (req, res) => {
    const users = await getUsers();

    const index = users.findIndex(row => row.id == req.params.id);
    if(index < 0) {
        return res.status(404).send({"message":"404 Not Found"});
    }

    const updatedUser = req.body;

    const error = validationSchema.validate(updatedUser).error;
    if(error) {
        return res.status(400).send({"message": error.details[0].message });
    }

    updatedUser.id = parseInt(req.params.id);

    users[ index ] = updatedUser;

    await writeUsers( users );

    res.status(202).send( updatedUser );

});

router.delete("/:id", async (req, res) => {

    const users = await getUsers();

    const index = users.findIndex(row => row.id == req.params.id);
    if(index < 0) {
        return res.status(404).send({"message":"404 Not Found"});
    }

    users.splice(index, 1);

    await writeUsers( users );

    res.status(202).send({"message":"Deleted ID " + req.params.id});
});

module.exports = router;
