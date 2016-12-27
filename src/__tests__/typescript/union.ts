import { normalize, schema } from '../../../index';

const data = { owner: { id: 1, type: 'user' } };

const user = new schema.Entity('users');
const group = new schema.Entity('groups');
const unionSchema = new schema.Union({
  user: user,
  group: group
}, 'type');

const normalizedData = normalize(data, { owner: unionSchema });
