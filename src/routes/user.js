const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

// create user
router.post("/users", (req, res) => {
  const user = new userSchema(req.body);
  user
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error.message }));
});

// get all users
router.get("/users", (req, res) => {
  userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error.message }));
});

// get a user by id
router.get("/users/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error.message }));
});

// delete a user
router.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .deleteOne({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error.message }));
});

// update a user
router.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { id_usuario, nombre, apellido, gmail, contraseña, roll, estado } = req.body;
  userSchema
    .updateOne({ _id: id }, { $set: { id_usuario, nombre, apellido, gmail, contraseña, roll, estado } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error.message }));
});

module.exports = router;
