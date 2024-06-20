const express = require("express");
const bcrypt = require("bcrypt");
const userSchema = require("../models/user");

const router = express.Router();

// Ruta para manejar el inicio de sesión
router.post('/user/login', async (req, res) => {
    const { gmail, contraseña } = req.body;
    try {
        const user = await userSchema.findOne({ gmail });

        if (user && await bcrypt.compare(contraseña, user.contraseña)) {
            // Iniciar sesión creando una sesión de usuario
            req.session.user = {
                id: user._id,
                roll: user.roll,
                nombre: user.nombre,
                apellido: user.apellido,
                gmail: user.gmail
            };

            res.status(200).json({ status: 200, success: true, message: 'Inicio de sesión exitoso' });
        } else {
            res.status(404).json({ status: 404, success: false, message: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: 'Error al buscar usuario' });
    }
});

// Middleware para verificar la sesión del usuario
function authenticateSession(req, res, next) {
    if (req.session.user) {
        next(); // Permitir acceso al siguiente middleware o controlador
    } else {
        res.status(401).json({ status: 401, success: false, message: 'Acceso denegado' });
    }
}

// Middleware para verificar el rol de profesor
function isTeacher(req, res, next) {
    if (req.session.user && req.session.user.roll === 'profesor') {
        next(); // Permitir acceso al siguiente middleware o controlador
    } else {
        res.status(403).json({ status: 403, success: false, message: 'No tiene permisos de profesor para acceder a este recurso' });
    }
}

// Ejemplo de autorización basada en roles en un endpoint protegido
router.get('/profesor/resource', authenticateSession, isTeacher, (req, res) => {
    res.status(200).json({ status: 200, success: true, message: 'Bienvenido profesor' });
});

// Crear usuario con hash de contraseña
router.post("/users", async (req, res) => {
    try {
        const { id_usuario, nombre, apellido, gmail, contraseña, roll, estado } = req.body;
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const user = new userSchema({ id_usuario, nombre, apellido, gmail, contraseña: hashedPassword, roll, estado });
        const savedUser = await user.save();
        res.status(201).json({ status: 201, success: true, data: savedUser });
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

// Obtener todos los usuarios
router.get("/users", async (req, res) => {
    try {
        const users = await userSchema.find();
        res.status(200).json({ status: 200, success: true, data: users });
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

// Obtener un usuario por ID
router.get("/users/:id", async (req, res) => {
    try {
        const user = await userSchema.findById(req.params.id);
        if (user) {
            res.status(200).json({ status: 200, success: true, data: user });
        } else {
            res.status(404).json({ status: 404, success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

// Eliminar un usuario
router.delete("/users/:id", async (req, res) => {
    try {
        const deletedUser = await userSchema.deleteOne({ _id: req.params.id });
        if (deletedUser.deletedCount > 0) {
            res.status(200).json({ status: 200, success: true, message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ status: 404, success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

// Actualizar un usuario
router.put("/users/:id", async (req, res) => {
    try {
        const { id_usuario, nombre, apellido, gmail, contraseña, roll, estado } = req.body;
        const updatedData = { id_usuario, nombre, apellido, gmail, roll, estado };

        if (contraseña) {
            updatedData.contraseña = await bcrypt.hash(contraseña, 10);
        }

        const updatedUser = await userSchema.updateOne({ _id: req.params.id }, { $set: updatedData });
        if (updatedUser.modifiedCount > 0) {
            res.status(200).json({ status: 200, success: true, message: 'Usuario actualizado correctamente' });
        } else {
            res.status(404).json({ status: 404, success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

// Ruta para verificar si el correo existe en la base de datos
router.get('/user/check-email/:email', async (req, res) => {
    try {
        const user = await userSchema.findOne({ gmail: req.params.email });
        if (user) {
            res.status(200).json({ status: 200, success: true, message: 'Correo encontrado' });
        } else {
            res.status(404).json({ status: 404, success: false, message: 'Correo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

// Reset de contraseña
router.put('/user/reset/:email', async (req, res) => {
    try {
        const { contraseña } = req.body;
        if (!contraseña) {
            return res.status(400).json({ status: 400, success: false, message: 'Se requiere la nueva contraseña' });
        }
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const updatedUser = await userSchema.updateOne({ gmail: req.params.email }, { $set: { contraseña: hashedPassword } });

        if (updatedUser.modifiedCount > 0) {
            res.status(200).json({ status: 200, success: true, message: 'Contraseña actualizada correctamente' });
        } else {
            res.status(404).json({ status: 404, success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 500, success: false, message: error.message });
    }
});

module.exports = router;
