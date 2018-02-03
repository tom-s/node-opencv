import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import initializeDb from './db'
import middleware from './middleware'
import api from './api'
import config from './config.json'
import io from 'socket.io'

let app = express()
app.server = http.createServer(app)

// Create websocket
const ws = io(app.server)

// logger
app.use(morgan('dev'))

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}))

app.use(bodyParser.json({
	limit : config.bodyLimit
}))

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }))

	// api router
	//app.use('/api', api({ config, db }))

	// WS
	ws.on('connection', client => {
    console.log('Client connected...');

    client.on('join', function(data) {
      console.log(data);
    })

    client.on('messages', function(data) {
      client.emit('broad', data);
      client.broadcast.emit('broad',data);
    })
	})

	// Server
	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`)
	})
})

export default app
