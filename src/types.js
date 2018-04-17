import type { Schema } from './schems/types';

export type Visitor = (value: mixed, parent: ?mixed, key: string, schema: Schema, addEntity: AddEntity) => mixed;

export type AddEntity = (schema: Schema, processedEntity: Object, value: Object, parent: Object, key: string) => void;

export type Unvisitor = (input: Array<*> | Object, schema: Schema) => Object;
