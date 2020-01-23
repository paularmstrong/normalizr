import { normalize, schema } from '../index'

type Response = {
  users: Array<{ id: string }>
}
const data: Response = { users: [ { id: 'foo' } ] };
const user = new schema.Entity('users');

{
  const responseSchema = new schema.Object({ users: new schema.Array(user) });
  const normalizedData = normalize(data, responseSchema);
}

{
  const responseSchema = new schema.Object<Response>({ users: (response: Response) => new schema.Array(user) });
  const normalizedData = normalize(data, responseSchema);
}

{
  const responseSchema = { users: new schema.Array(user) };
  const normalizedData = normalize(data, responseSchema);
}
