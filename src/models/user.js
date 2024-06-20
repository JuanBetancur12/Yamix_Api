const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  id_usuario: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  gmail: {
    type: String,
    required: true,
    unique: true
  },
  contraseña: {
    type: String,
    required: true
  },
  roll: {
    type: String,
    required: true
  },
  estado: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);
