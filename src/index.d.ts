type KeyType = string | number;
type Entities = Record<string, Record<KeyType, any> | undefined>;
type AddEntityType = (schema: schema.Entity<any, any, any>, processedEntity: any, value: any, parent: any, key: string) => void;
type VisitType = (value: any, parent: any, key: string, schema: ExtendedSchema , addEntity: AddEntityType, visitedEntities: Entities) => NormalizedResult;
type UnvisitType = (input: NormalizedResult[], schema: ExtendedSchema) => any;
type IdFunction<T> = (input: T, parent: any, key: string) => (string | null)
type EntityOptions<T, IdType extends string | IdFunction<T>, ProcessType = T> = {
  idAttribute?: IdType,
  mergeStrategy?: (entityA: any, entityB: any) => any,
  processStrategy?: (input: T, parent: any, key: string) => ProcessType,
  fallbackStrategy?: (key: string, schema: schema.Entity<T, IdType>) => any
};

export namespace schema {
  type SchemaDefinition<T> = Schema<T> | Record<string, Schema | ((entity: any) => Schema)>;
  class Schema<T = any> {
    constructor(definition: SchemaDefinition<T>, schemaAttribute?: string | IdFunction<T>)
    normalize(value: T, parent: any, key: KeyType, visit: VisitType, addEntity: AddEntityType, visitedEntities: Entities): NormalizedResult
    denormalize(entityCopy: any, unvisit: UnvisitType): any
    define(definition: ExtendedSchema): void
  }

  class PolymorphicSchema<T> extends Schema<T> {
    getSchemaAttribute(input: any, parent: any, key: string): string | false
    inferSchema(input: any, parent: any, key: string): Schema
    normalizeValue(value: T, parent: any, key: string, visit: VisitType, addEntity: AddEntityType, visitedEntities: Entities): NormalizedResult
    denormalizeValue(value: any, unvisit: UnvisitType): any
  }

  export class Entity<T = any, IdType extends string | IdFunction<T> = string, ProcessType = T> extends Schema<T> {
    constructor(key: string, definition?: Record<string, ExtendedSchema>, options?: EntityOptions<T, IdType, ProcessType>)
    get key(): string
    get idAttribute(): IdType
    getId(value: any, parent: any, key: string): string | number
    merge(existingEntity: any, processedEntity: any): any
  }

  // Adding 'type' to the rest of these schemas allows Typescript to differentiate them for the overloading of normalize
  // and denormalize later on.
  export class Array<T> extends PolymorphicSchema<T[] | Record<string, T>> {
    constructor(definition: ExtendedSchema, schemaAttribute?: string | IdFunction<any>)
    type: 'array'
  }

  export class Object extends Schema {
    type: 'object'
  }

  export class Union extends PolymorphicSchema<any> {
    constructor(definition: Record<string, ExtendedSchema>, schemaAttribute?: string | IdFunction<any>)
    type: 'union'
  }

  export class Values<T> extends PolymorphicSchema<Record<string, T>> {
    constructor(definition: Record<string, Schema>, schemaAttribute?: string | IdFunction<T>)
    type: 'values'
  }
}

type ExtendedSchema = schema.Schema | ExtendedSchemaArray | ExtendedSchemaObject;
interface ExtendedSchemaArray extends Array<ExtendedSchema> {}
interface ExtendedSchemaObject extends Record<KeyType, ExtendedSchema> {}

type NormalizedResult = undefined | null | KeyType | { id: KeyType, schema: string };

export function normalize<T = any>(
  data: T,
  schema: schema.Entity<any, any, T>
): {
  result: KeyType
  entities: Record<string, any>
};

export function normalize<T = any>(
  data: Record<KeyType, any>,
  schema: schema.Values<T>
): {
  result: Record<string, NormalizedResult>
  entities: Record<string, { id: KeyType, schema: string }>
};

export function normalize(
  data: any,
  schema: schema.Union
): {
  result: undefined | null | { id: string, schema: string }
  entities: Record<string, any>
};

export function normalize<T = any>(
  data: any[] | Record<KeyType, any>,
  schema: schema.Array<T> | schema.Schema<T>[]
): {
  result: NormalizedResult[]
  entities: Record<string, any>
};

export function normalize<T = any>(
  data: Record<KeyType, any>,
  schema: schema.Object | Record<KeyType, schema.Schema>
): {
  result: Record<string, NormalizedResult>
  entities: Record<string, any>
};

export function denormalize(
  input: KeyType,
  schema: schema.Entity,
  entities: Record<string, any>
): any;

export function denormalize<T>(
  input: NormalizedResult[],
  schema: schema.Array<T> | schema.Schema<T>[],
  entities: Record<string, any>
): any;

export function denormalize(
  input: Record<KeyType, NormalizedResult>,
  schema: schema.Object | Record<KeyType, schema.Schema>,
  entities: Record<string, any>
): any;

export function denormalize(
  input: undefined | null | { id: KeyType, schema?: string },
  schema: schema.Union,
  entities: Record<string, any>
): any;

export function denormalize<T>(
  input: Record<string, NormalizedResult>,
  schema: schema.Values<T>,
  entities: Record<string, any>
): any;
