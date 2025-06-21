const jsonServer = require('json-server')
const path = require('path')
const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db', 'db.json'))
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public')
})

server.use(middlewares)

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'))
})

server.use(router)


server.listen(process.env.PORT || 3000, () => {
  console.log('JSON Server is running')
})