import { Router } from 'express'
import asyncRequest from '../utils'
import rectangleHandler from './rectangle'

export default ({ config, db }) => {
	let api = Router()

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.status(200)
	})

	api.get('/rectangle', asyncRequest(rectangleHandler))

	return api
}
