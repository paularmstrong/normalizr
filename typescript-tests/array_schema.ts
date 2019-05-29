import { denormalize, normalize, schema } from '../index'

const data = [{ id: 1, type: 'admin' }, { id: 2, type: 'user' }];
const userSchema = new schema.Entity('users');
const adminSchema = new schema.Entity('admins');

const myArray = new schema.Array(
  {
    admins: adminSchema,
    users: userSchema
  },
  (input, parent, key) => `${input.type}s`
);

const normalizedData = normalize(data, myArray);

const denormalizedData = denormalize(normalizedData.result, myArray, normalizedData.entities);
