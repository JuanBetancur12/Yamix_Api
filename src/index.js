const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");

dotenv.config();
const app = express();
const port = process.env.PORT || 9000;
const JWT_SECRET = process.env.JWT_SECRET;

// Configuración de express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'miSecreto',
  resave: false,
  saveUninitialized: true
}));

// Middleware para manejar el cuerpo de las peticiones JSON
app.use(express.json());

// Middleware de las rutas de usuario
app.use("/api", userRoute);

// Ruta de prueba para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Bienvenido a mi API");
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Conectado a MongoDB Atlas"))
.catch((error) => console.error(error));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
