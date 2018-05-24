#! /usr/bin/env node
import * as http from 'http'

http
  .createServer(async (req, res) => {
    res.write('hello seagull!')
    res.end()
  })
  // tslint:disable-next-line:no-console
  .listen(8080, () => console.log('listening on port 8080'))
