import * as express from 'express'

import IndexRoute from './routes/index_route'
import PageRoute from './routes/page_route'
import ParamsRoute from './routes/params_route'
import TicTacToe from './routes/tic_tac_toe'

const app = express()

app.use(express.static(`${process.cwd()}/dist/assets/static`))

IndexRoute.register(app)
PageRoute.register(app)
ParamsRoute.register(app)
TicTacToe.register(app)

export default app
