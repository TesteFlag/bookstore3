const fs = require("fs");
const joi = require("joi");
const express = require("express");

const router = express.Router();

const validationSchema = joi.object({
    user_id: joi.number().integer().min(1).required(),
    name: joi.string().min(3).max(60).required(),
    delivery: joi.object({
        address: joi.string().min(8).max(160).required(),
        postal_code: joi.string().min(4).max(20).required(),
        city: joi.string().min(3).max(70).required(),
        country: joi.string().min(2).max(40).required()
    }),
    products: joi.array().items(
        joi.object({
            book_id: joi.number().integer().min(1).required(),
            quantity: joi.number().integer().min(1).required()
        })
    )
});

async function getOrders() {
    const orders = await fs.promises.readFile("orders.json", "utf8");
    return JSON.parse( orders );
}

async function writeOrders(orders) {
    await fs.promises.writeFile(
        "orders.json", JSON.stringify(orders), "utf8"
    );
}

router.get("/", async (req, res) => {
    const orders = await getOrders();
    res.send( orders );
});

router.get("/:id", async (req, res) => {
    const orders = await getOrders();
    
    const order = orders.find(row => row.id == req.params.id);

    if(!order) {
        return res.status(404).send({"message":"404 Not Found"});
    }

    res.send( order );
});

router.post("/", async (req, res) => {
    const orders = await getOrders();

    const current_id = orders[ orders.length - 1].id + 1;

    const newOrder = req.body;

    const error = validationSchema.validate( newOrder ).error;
    if(error) {
        return res.status(400).send({"message":error.details[0].message});
    }

    newOrder.id = current_id;
    newOrder.createdAt = Date();
    newOrder.paid = false;
    for(let i = 0; i < newOrder.products.length; i++) {
        newOrder.products[i].priceEach = 123;
    }

    orders.push( newOrder );

    await writeOrders( orders );

    res.status(202).send( newOrder );
});

router.put("/:id", async (req, res) => {
    const orders = await getOrders();

    const index = orders.findIndex(row => row.id == req.params.id);
    if(index < 0) {
        return res.status(404).send({"message":"404 Not Found"});
    }

    const updatedOrder = req.body;

    const error = validationSchema.validate( updatedOrder ).error;
    if(error) {
        return res.status(400).send({"message":error.details[0].message});
    }

    updatedOrder.id = orders[index].id;
    updatedOrder.createdAt = orders[index].createdAt;
    updatedOrder.paid = orders[index].paid;
    for(let i = 0; i < updatedOrder.products.length; i++) {
        updatedOrder.products[i].priceEach = 123;
    }

    orders.push( updatedOrder );

    await writeOrders( orders );

    res.status(202).send( updatedOrder );
});

router.delete("/:id", async (req, res) => {
    const orders = await getOrders();

    const index = orders.findIndex(row => row.id == req.params.id);
    if(index < 0) {
        return res.status(404).send({"message":"404 Not Found"});
    }

    orders.splice(index, 1);

    await writeOrders( orders );

    res.status(202).send({"message":"Deleted ID " + req.params.id });
});

module.exports = router;
