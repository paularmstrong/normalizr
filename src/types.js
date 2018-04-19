// @flow
import ArraySchema from './schemas/Array';
import EntitySchema from './schemas/Entity';
import ObjectSchema from './schemas/Object';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';

export type Schema = Array<Schema> | {} | ArraySchema | EntitySchema | ObjectSchema | UnionSchema | ValuesSchema;

export type Visitor = (value: *, parent: ?{}, key: ?string, schema: Schema, addEntity: AddEntity) => *;

export type AddEntity = (schema: EntitySchema, processedEntity: {}, value: {}, parent: *, key: ?string) => void;

export type Unvisitor = (input: *, schema: Schema) => mixed;
