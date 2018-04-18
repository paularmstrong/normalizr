// @flow
import ArraySchema from './Array';
import EntitySchema from './Entity';
import ObjectSchema from './Object';
import UnionSchema from './Union';
import ValuesSchema from './Values';

export type Schema = Array<Schema> | {} | ArraySchema | EntitySchema | ObjectSchema | UnionSchema | ValuesSchema;
