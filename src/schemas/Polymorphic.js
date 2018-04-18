// @flow
import { isImmutable } from './ImmutableUtils';
import type { AddEntity, Unvisitor, Visitor } from '../types';

type SchemaAttributeFn = (input: {}, parent: ?{}, key: ?string) => string;
export type SchemaAttribute = string | SchemaAttributeFn;

export default class PolymorphicSchema {
  _schemaAttribute: SchemaAttributeFn;
  schema: {};

  constructor(definition: {}, schemaAttribute?: SchemaAttribute) {
    if (schemaAttribute) {
      // $FlowFixMe
      this._schemaAttribute = typeof schemaAttribute === 'string' ? (input) => input[schemaAttribute] : schemaAttribute;
    }
    this.define(definition);
  }

  get isSingleSchema(): boolean {
    return !this._schemaAttribute;
  }

  define(definition: {}) {
    this.schema = definition;
  }

  getSchemaAttribute(input: {}, parent: ?{}, key: ?string) {
    return !this.isSingleSchema && this._schemaAttribute && this._schemaAttribute(input, parent, key);
  }

  inferSchema(input: {}, parent: ?{}, key: ?string) {
    if (this.isSingleSchema) {
      return this.schema;
    }

    const attr = this.getSchemaAttribute(input, parent, key);
    if (typeof attr === 'boolean') {
      throw new Error('cannot infer schema for polymorphic schema with a single type');
    }
    return this.schema[attr];
  }

  normalizeValue(value: {}, parent: ?{}, key: ?string, visit: Visitor, addEntity: AddEntity) {
    const schema = this.inferSchema(value, parent, key);
    if (!schema) {
      return value;
    }
    const normalizedValue = visit(value, parent, key, schema, addEntity);
    return this.isSingleSchema || normalizedValue === undefined || normalizedValue === null
      ? normalizedValue
      : { id: normalizedValue, schema: this.getSchemaAttribute(value, parent, key) };
  }

  denormalizeValue(value: string | { schema?: string, id?: string }, unvisit: Unvisitor) {
    const schemaKey = isImmutable(value)
      ? // $FlowFixMe cannot understand Immutable/ImmutableUtils
        value.get('schema')
      : typeof value === 'string'
        ? null
        : value.schema;

    if (!this.isSingleSchema && !schemaKey) {
      return value;
    }

    const id = isImmutable(value)
      ? // $FlowFixMe cannot understand Immutable/ImmutableUtils
        value.get('id')
      : typeof value === 'string'
        ? value
        : value.id;

    const schema = this.isSingleSchema ? this.schema : schemaKey ? this.schema[schemaKey] : {};

    return unvisit(id || value, schema);
  }
}
