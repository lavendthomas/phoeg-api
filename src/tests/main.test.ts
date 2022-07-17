import { buildServer } from "../server";
import { test } from "tap";

const server = buildServer()

test('requests the "/endpoints" route', async (t) => {
  const server = buildServer()

  t.teardown(() => {
    server.close();
  });


  const response = await server.inject({
    method: 'GET',
    url: '/endpoints'
  })

  t.equal(response.statusCode, 200, 'returns a status code of 200')
  //t.same(response.json(), {}, 'returns the endpoints')
})