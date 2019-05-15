declare namespace schema {
  export type StrategyFunction = (value: any, parent: any, key: string) => any;
  export type SchemaFunction = (value: any, parent: any, key: string) => string;
  export type MergeFunction = (entityA: any, entityB: any) => any;

  export class Array implements BaseSchema {
    constructor(definition: Schema, schemaAttribute?: string | SchemaFunction);
    define(definition: Schema): void;
  }

  export interface EntityOptions {
    idAttribute?: string | SchemaFunction;
    mergeStrategy?: MergeFunction;
    processStrategy?: StrategyFunction;
  }

  export interface BaseSchema {
    schema: Schema;
  }

  export class Entity implements BaseSchema {
    constructor(key: string, definition?: Schema, options?: EntityOptions);
    define(definition: Schema): void;
    key: string;
  }

  export class Object implements BaseSchema {
    constructor(definition: { [key: string]: Schema });
    define(definition: Schema): void;
  }

  export class Union implements BaseSchema {
    constructor(definition: Schema, schemaAttribute?: string | SchemaFunction);
    define(definition: Schema): void;
  }

  export class Values implements BaseSchema {
    constructor(definition: Schema, schemaAttribute?: string | SchemaFunction);
    define(definition: Schema): void;
  }
}

export type Schema =
  | schema.Array
  | schema.Entity
  | schema.Object
  | schema.Union
  | schema.Values
  | schema.Array[]
  | schema.Entity[]
  | schema.Object[]
  | schema.Union[]
  | schema.Values[]
  | { [key: string]: Schema | Schema[] };

export type NormalizedSchema<E, R> = { entities: E; result: R };

export function normalize<E = any, R = any>(data: any, schema: Schema): NormalizedSchema<E, R>;

export function denormalize(input: any, schema: Schema, entities: any): any;
