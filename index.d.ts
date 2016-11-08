export type ExtractAttribute =
  (entity: any) => string;

export type AssignEntity =
  (output: any, key: string, value: any, input: any, schema: SchemaValue) => void;

export type MergeIntoEntity =
  (entityA: any, entityB: any, entityKey: string) => void;

export type SchemaOptions = {
  idAttribute?: string | ExtractAttribute;
  meta?: any;
  assignEntity?: AssignEntity;
  defaults?: any;
}

export type IterableSchemaOptions = {
  schemaAttribute?: string | ExtractAttribute;
}

export type UnionSchemaOptions = {
  schemaAttribute: string | ExtractAttribute;
}

export type NormalizeOptions = {
  assignEntity?: AssignEntity;
  mergeIntoEntity?: MergeIntoEntity;
}

export type NormalizeInput = Object | Array<Object>;

export type NormalizeOutput = {
  result: any;
  entities?: any;
}

export class Schema {
  constructor (key: string, options?: SchemaOptions);

  define(schema: SchemaMap): void;
  getKey(): string;
  getIdAttribute(): string;
  getMeta(prop: string): any;
  getDefaults(): any;
}

export class IterableSchema {
  constructor (schema: SchemaValue, options?: IterableSchemaOptions);

  getItemSchema(): SchemaValue;
}

export class UnionSchema {
  constructor (schema: SchemaValue, options: UnionSchemaOptions);

  getItemSchema(): SchemaValue;
}

export type SchemaValue = Schema | IterableSchema | UnionSchema | SchemaMap | Function;

export type SchemaMap = {
  [key: string]: SchemaValue;
}

export function arrayOf(
  schema: SchemaValue,
  options?: IterableSchemaOptions
): IterableSchema;

export function valuesOf(
  schema: SchemaValue,
  options?: IterableSchemaOptions
): IterableSchema;

export function unionOf(
  schema: SchemaValue,
  options?: UnionSchemaOptions
): UnionSchema;

export function normalize(
  input: NormalizeInput,
  schema: SchemaValue,
  options?: NormalizeOptions
): NormalizeOutput;
