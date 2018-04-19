// @flow
import ArraySchema from './schemas/Array';
import EntitySchema from './schemas/Entity';
import ObjectSchema from './schemas/Object';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';

export type Schema = Array<Schema> | {} | ArraySchema | EntitySchema | ObjectSchema | UnionSchema | ValuesSchema;

export type Visitor = (value: *, parent: ?Object, key: ?string, schema: Schema, addEntity: AddEntity) => *;

export type AddEntity = (schema: EntitySchema, processedEntity: Object, value: Object, parent: *, key: ?string) => void;

export type Unvisitor = (input: *, schema: Schema) => mixed;
