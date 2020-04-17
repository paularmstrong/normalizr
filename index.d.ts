declare namespace schema {
  export type StrategyFunction<T> = (value: any, parent: any, key: string) => T;
  export type SchemaFunction = (value: any, parent: any, key: string) => string;
  export type MergeFunction = (entityA: any, entityB: any) => any;
  export type FallbackFunction<T> = (key: string, schema: schema.Entity<T>) => T;

  export class Array<T = any> {
    constructor(definition: Schema<T>, schemaAttribute?: string | SchemaFunction)
    define(definition: Schema): void
  }

  export interface EntityOptions<T = any> {
    idAttribute?: string | SchemaFunction
    mergeStrategy?: MergeFunction
    processStrategy?: StrategyFunction<T>
    fallbackStrategy?: FallbackFunction<T>
  }

  export class Entity<T = any> {
    constructor(key: string | symbol, definition?: Schema, options?: EntityOptions<T>)
    define(definition: Schema): void
    key: string
    getId: SchemaFunction
    _processStrategy: StrategyFunction<T>
  }

  export class Object<T = any> {
    constructor(definition: SchemaObject<T>)
    define(definition: Schema): void
  }

  export class Union<T = any> {
    constructor(definition: Schema<T>, schemaAttribute?: string | SchemaFunction)
    define(definition: Schema): void
  }

  export class Values<T = any> {
    constructor(definition: Schema<T>, schemaAttribute?: string | SchemaFunction)
    define(definition: Schema): void
  }
}

export type Schema<T = any> =
  | schema.Entity<T>
  | schema.Object<T>
  | schema.Union<T>
  | schema.Values<T>
  | SchemaObject<T>
  | SchemaArray<T>;

export type SchemaValueFunction<T> = (t: T) => Schema<T>;
export type SchemaValue<T> = Schema<T> | SchemaValueFunction<T>;

export interface SchemaObject<T> {
  [key: string]: SchemaValue<T>
}

export interface SchemaArray<T> extends Array<Schema<T>> {}

export type NormalizedSchema<E, R> = { entities: E, result: R };

export function normalize<T = any, E = { [key:string]: { [key:string]: T } | undefined}, R = any>(
  data: any,
  schema: Schema<T>
): NormalizedSchema<E, R>;

export function denormalize(
  input: any,
  schema: Schema,
  entities: any
): any;
