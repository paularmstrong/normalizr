import { normalize, NormalizedResult, schema } from '../../src';

const data = { firstThing: { id: 1 }, secondThing: { id: 2 } };

const item = new schema.Entity('items');
const valuesSchema = new schema.Values({ firstThing: item, secondThing: item});

const result: { result: Record<string, NormalizedResult>,entities: Record<string, any> } = normalize(data, valuesSchema);
console.log(result);
