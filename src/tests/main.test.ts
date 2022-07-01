import { buildServer } from "../server";
import { test } from "tap";

const server = buildServer()

test('requests the "/endpoints" route', async t => {
  const server = buildServer()

  const response = await server.inject({
    method: 'GET',
    url: '/endpoints'
  })
  t.equal(response.statusCode, 200, 'returns a status code of 200')
})