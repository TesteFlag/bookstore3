const fs = require("fs");
const joi = require("joi");
const express = require("express");

const router = express.Router();

/* criar o schema de validação de livros */
const validationSchema = joi.object({
    title: joi.string().min(1).max(120).required(),
    author: joi.string().min(3).max(100).required(),
    publication_date: joi.date().required()
});

async function getBooks() {
    const data = await fs.promises.readFile("books.json", "utf8");
    return JSON.parse(data);
}

async function writeBooks(books) {
    const result = await fs.promises.writeFile(
        "books.json", JSON.stringify(books), "utf8"
    );
    console.log(result);

    return result;
}

router.get("/", async (req, res) => {
    const books = await getBooks();
    res.send( books );
});

router.get("/:id", async (req, res) => {

    const books = await getBooks();

    const book = books.find( row => row.id == req.params.id );

    if(book) {
        return res.send( book );
    }
    
    res.status(404).send({"message":"Not Found"});

});

router.post("/", async (req, res) => {

    const books = await getBooks();

    const newBook = req.body;

    const error = validationSchema.validate( newBook ).error;
    if(error) {
        return res.status(400).send({"message" : error.details[0].message });
    }

    newBook.id = books[ books.length - 1 ].id + 1;

    books.push( newBook );

    await writeBooks( books );

    res.status(202).send( newBook );
});

router.put("/:id", async (req, res) => {

    const books = await getBooks();

    const index = books.findIndex(row => row.id == req.params.id);

    if(index < 0) {
        return res.status(404).send({"message":"Not Found"});
    }

    const updatedBook = req.body;

    const error = validationSchema.validate( updatedBook ).error;
    if(error) {
        return res.status(400).send({"message": error.details[0].message });
    }

    updatedBook.id = books[index].id;

    books[index] = updatedBook;

    await writeBooks( books );

    res.status(202).send( updatedBook );
});

router.delete("/:id", async (req, res) => {

    const books = await getBooks();

    const index = books.findIndex(row => row.id == req.params.id);

    if(index < 0) {
        return res.status(404).send({"message":"Not Found"});
    }

    books.splice(index, 1);

    await writeBooks( books );

    res.status(202).send({"message":"Deleted"});
});

module.exports = router;

