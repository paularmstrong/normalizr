declare namespace schema {
  export type StrategyFunction = (value: any, parent: any, key: string) => any;
  export type SchemaFunction = (value: any, parent: any, key: string) => string;
  export type MergeFunction = (entityA: any, entityB: any) => any;

  export class Array {
    constructor(definition: Schema, schemaAttribute?: string | SchemaFunction)
    define(definition: Schema): void
  }

  export interface EntityOptions {
    idAttribute?: string | SchemaFunction
    mergeStrategy?: MergeFunction
    processStrategy?: StrategyFunction
  }

  export class Entity {
    constructor(key: string, definition?: Schema, options?: EntityOptions)
    define(definition: Schema): void
    key: string
  }

  export class Object {
    constructor(definition: {[key: string]: Schema})
    define(definition: Schema): void
  }

  export class Union {
    constructor(definition: Schema, schemaAttribute?: string | SchemaFunction)
    define(definition: Schema): void
  }

  export class Values {
    constructor(definition: Schema, schemaAttribute?: string | SchemaFunction)
    define(definition: Schema): void
  }
}

export type Schema =
  schema.Array |
  schema.Entity |
  schema.Object |
  schema.Union |
  schema.Values |
  schema.Array[] |
  schema.Entity[] |
  schema.Object[] |
  schema.Union[] |
  schema.Values[] |
  {[key: string]: Schema};

export function normalize(
  data: any,
  schema: Schema
): {
  entities: any,
  result: any
};

export function denormalize(
  input: any,
  schema: Schema,
  entities: any
): any;
