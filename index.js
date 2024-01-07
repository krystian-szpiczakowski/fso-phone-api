import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import { Person } from "./models/person.js";

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get("/api/persons", async (request, response) => {
  const personResponse = await Person.find({});
  return response.json(personResponse);
});

app.get("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const person = await Person.findById(id);
    if (person) {
      response.json(person);
    } else {
      response.statusMessage = `Person with id '${id}' does not exist`;
      return response.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

app.delete("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const person = await Person.findByIdAndDelete(id);
    if (person) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (request, response, next) => {
  const body = request.body;
  const errors = validateNewPersonRequest(body);
  if (errors.length > 0) {
    return response.status(400).json({
      errors: errors,
    });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  try {
    const result = await newPerson.save();
    return response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

const validateNewPersonRequest = (person) => {
  const errors = [];

  if (!person.name) {
    errors.push({
      error: "name is mandatory",
    });
  }

  if (!person.number) {
    errors.push({
      error: "number is mandatory",
    });
  }

  const duplicatedPerson = persons.find(
    (p) => p.name.toLowerCase() === person.name.toLowerCase()
  );
  if (duplicatedPerson) {
    errors.push({
      error: "name must be unique",
    });
  }

  return errors;
};

app.put("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;
  const body = request.body;
  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  try {
    const result = await Person.findByIdAndUpdate(id, updatedPerson, {
      new: true,
      runValidators: true,
      context: "query",
    });
    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/info", (request, response) => {
  const currentDate = new Date();
  const phonebookEntriesNumber = persons.length;

  response.send(
    `<p>Phonebook has info for ${phonebookEntriesNumber} people</p><p>${currentDate}</p>`
  );
});

app.use((error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
});

app.use((request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
});
