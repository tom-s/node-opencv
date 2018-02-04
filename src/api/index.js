import { Router } from 'express'

export default ({ config, db }) => {
	let api = Router()

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.status(200)
	})

	return api
}
