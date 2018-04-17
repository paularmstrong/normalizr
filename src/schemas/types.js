import typeof ArraySchema from './Array';
import typeof EntitySchema from './Entity';
import typeof ObjectSchema from './Object';
import typeof UnionSchema from './Union';
import typeof ValuesSchema from './Values';

export type Schema = Array<Schema> | Object | ArraySchema | EntitySchema | ObjectSchema | UnionSchema | ValuesSchema;
