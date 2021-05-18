import { denormalize, normalize, NormalizedResult, schema } from '../../src';

const data = [
  { id: '123', name: 'Jim' },
  { id: '456', name: 'Jane' },
];
const userSchema = new schema.Entity('users');

const userListSchema = new schema.Array(userSchema);
const normalizedData: { result: NormalizedResult[], entities: Record<string, any> } = normalize(data, userListSchema);

const userListSchemaAlt = [userSchema];
normalize(data, userListSchemaAlt);

denormalize(normalizedData.result, userListSchema, normalizedData.entities);
