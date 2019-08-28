import { normalize, schema } from '../index'

const data = {
  /* ...*/
};
const user = new schema.Entity('users');

{
  const responseSchema = new schema.Object({ users: new schema.Array(user) });
  const normalizedData = normalize(data, responseSchema);
}

{
  const responseSchema = { users: new schema.Array(user) };
  const normalizedData = normalize(data, responseSchema);
}
