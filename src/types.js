// @flow
import EntitySchema from './schemas/Entity';
import type { Schema } from './schemas/types';

export type Visitor = (value: *, parent: ?Object, key: ?string, schema: Schema, addEntity: AddEntity) => *;

export type AddEntity = (schema: EntitySchema, processedEntity: Object, value: Object, parent: *, key: ?string) => void;

export type Unvisitor = (input: *, schema: Schema) => mixed;
