import { normalize, NormalizedResult, schema } from '../../src';

const data = { owner: { id: 1, type: 'user' } };

const user = new schema.Entity('users');
const group = new schema.Entity('groups');
const unionSchema = new schema.Union(
  {
    user: user,
    group: group,
  },
  'type'
);

const unionResult: { result: undefined | null | { id: string, schema: string}, entities: Record<string, any>} = normalize(data.owner, unionSchema);
console.log(unionResult);

const result: { result: Record<string, NormalizedResult>, entities: Record<string, any>} = normalize(data, { owner: unionSchema });
console.log(result);
