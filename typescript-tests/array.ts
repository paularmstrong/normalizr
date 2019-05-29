import { denormalize, normalize, schema } from '../index'

const data = [{ id: '123', name: 'Jim' }, { id: '456', name: 'Jane' }];
const userSchema = new schema.Entity('users');

const userListSchema = new schema.Array(userSchema);
const normalizedData = normalize(data, userListSchema);

const userListSchemaAlt = [userSchema];
const normalizedDataAlt = normalize(data, userListSchemaAlt);

const denormalizedData = denormalize(normalizedData.result, userListSchema, normalizedData.entities);
