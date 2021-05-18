import { KeyType, normalize, NormalizedResult, schema } from '../../src';

type Response = {
  users: Array<{ id: string }>;
};
const data: Response = { users: [{ id: 'foo' }] };
const user = new schema.Entity('users');

{
  const responseSchema = new schema.Object({ users: new schema.Array(user) });
  const normalizedData: {result: Record<KeyType, NormalizedResult>, entities: Record<string, any>} = normalize(data, responseSchema);
  // This prevents check-dts from throwing an error for an unused variable
  console.log(normalizedData);
}

{
  const responseSchema = new schema.Object({ users: (_response: Response) => new schema.Array(user) });
  normalize(data, responseSchema);
}

{
  const responseSchema = { users: new schema.Array(user) };
  normalize(data, responseSchema);
}
