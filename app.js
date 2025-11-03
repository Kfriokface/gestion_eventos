const express = require("express");
const engine = require("ejs-mate"); // soporte para layouts, partials y reusabilidad de vistas
const app = express();
const path = require("path");
const PORT = 3000;

// Libreria para trabajar con fechas
const dayjs = require("dayjs");
require("dayjs/locale/es"); // Lo ajustamos para trabajar con la hora local
dayjs.locale("es");

// Configurar el motor de plantillas EJS
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware opcional para servir archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, "public")));
// Middleware para parsear datos de formularios (POST)
app.use(express.urlencoded({ extended: true }));

// Control de timeout (protege al servidor Express de peticiones que tardan demasiado)
app.use((req, res, next) => {
  const ms = 10000; //10 seg en milisegundos
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.warn("Tiempo de espera agotado");
      res.status(408).send("Tiempo de espera agotado");
    }
  }, ms);
  res.once("finish", () => clearTimeout(timer)); // se cierra el timer cuando transcurren el tiempo definido
  res.once("close", () => clearTimeout(timer)); // se cierra el timer si el usuario cierra la ventana antes de que finalice en timer
  next();
});

// ----------------------
// RUTA PRINCIPAL: /
// ----------------------
app.get("/", (req, res) => {
  const title = "Eventos chachis";
  res.render("index", { title });
});

// ----------------------
// RUTA FORMULARIO: /
// ----------------------
app.get("/evento", (req, res) => {
  res.render("evento", {
    title: "Registro al evento",
    nombreEvento: "",
    fechaEvento: "",
    ciudadEvento: "",
    tipoEvento: "",
    intereses: [],
    errores: {},
  });
});

app.post("/evento", (req, res) => {
  const nombreEvento = req.body.nombreEvento;
  const fechaEvento = req.body.fechaEvento;
  const ciudadEvento = req.body.ciudadEvento;
  const tipoEvento = req.body.tipoEvento;
  let intereses = req.body.intereses || [];
  if (!Array.isArray(intereses)) intereses = [intereses];

  // Control de errores
  // ==================

  let errores = {};

  // Validar que el nombre del evento tenga al menos 3 caracteres
  if (!nombreEvento || nombreEvento.trim().length < 3) {
    errores.nombreEvento =
      "El nombre del evento debe tener al menos 3 caracteres.";
  }

  // Validar que la fecha no sea pasada
  if (
    !fechaEvento ||
    dayjs(fechaEvento, "YYYY-MM-DD").isBefore(dayjs().startOf("day"))
  ) {
    errores.fechaEvento =
      "La fecha debe existir y no puede ser anterior al dia de hoy.";
  }

  // Validar que la ciudad tenga un valor
  if (!ciudadEvento || !ciudadEvento.trim().length) {
    errores.ciudadEvento =
      "Debes elegir la ciudad donde se realizará el evento.";
  }

  // Validar que el tipo de evento tenga un valor
  if (!tipoEvento || !tipoEvento.trim().length) {
    errores.tipoEvento =
      "Tienes que indicar el tipo de evento que quieres realizar.";
  }

  // si hay errores
  if (Object.keys(errores).length > 0) {
    return res.status(400).render("evento", {
      title: "Error al registrar el evento",
      nombreEvento,
      fechaEvento,
      ciudadEvento,
      tipoEvento,
      intereses,
      errores,
    });
  }

  // si no hay errores
  res.render("evento-ok", {
    title: "Registro completado",
    nombreEvento,
    fechaEvento: dayjs(fechaEvento).format("DD-MM-YYYY"),
    ciudadEvento,
    tipoEvento,
    intereses,
  });
});

// ----------------------
// Iniciar servidor
// ----------------------
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
