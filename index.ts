import fastify from 'fastify'

const server = fastify()


interface IQuerystring {
    username: string;
    password: string;
}

interface IHeaders {
    'h-Custom': string;
}


server.get('/ping', async (request, reply) => {
    return 'pong\n'
})

server.get<{
    Querystring: IQuerystring,
    Headers: IHeaders
}>('/auth', async (request, reply) => {
    const { username, password } = request.query
    const customerHeader = request.headers['h-Custom']
    // do something with request data
    console.log(username + ":" + password)

    return `logged in!`
})

server.get('/', function (request, reply) {
    reply.code(200).send({ hello: 'world' })
})


server.listen(8080, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})