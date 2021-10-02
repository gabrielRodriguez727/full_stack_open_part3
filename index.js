const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan('tiny'))


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "11-22-3344556"
    },
    {
        "name": "Gabriel Rodríguez",
        "number": "111-111-111",
        "id": 5
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has ${persons.length} entries</p>
        <h4>${new Date()}</h4>
    `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const body = request.body
    let errorMessages = []
    if (!body.number) errorMessages.push('Number is missing')

    if (errorMessages.length) {
        return response.status(400).json({
            error: errorMessages.join('; ')
        })
    }
    const personToUpdate = persons.find(e => e.id === id)
    personToUpdate.number = body.number
    persons = persons.map(e => (e.id === id) ? personToUpdate : e)

    response.json(personToUpdate)
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    let errorMessages = []
    if (!body.name) errorMessages.push('Name is missing')
    if (body.name && persons.some(e => e.name === body.name)) errorMessages.push('Name must be unique')
    if (!body.number) errorMessages.push('Number is missing')

    if (errorMessages.length) {
        return response.status(400).json({
            error: errorMessages.join('; ')
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(e => e.id))
        : 0
    return maxId + 1
}