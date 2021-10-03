import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
//import errorHandler from "./middlewares/errorHandler.js";
//import uknowEndpoint from "./middlewares/uknowEndpoint.js";
import Person from "./models/person.js";

const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan('tiny'))


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.send(`
        <p>Phonebook has ${people.length} entries</p>
        <h4>${new Date()}</h4>
    `)
    })

})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id)
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch((error) => next(error));
})

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findOneAndDelete(id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    const body = request.body
    console.log(request.body)
    const opts = {
        new: true,
        runValidators: true,
        context: "query",
    };
    Person.findByIdAndUpdate(id, body, opts)
        .then((result) => {
            console.log('1-', { result })
            response.status(200).json(result);
        })
        .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const person = new Person({ ...body })
    person
        .save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormattedPerson => {
            response.json(savedAndFormattedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
