import IterableSchema from './IterableSchema';

export default class RelationshipSchema {
    constructor(key, schema = {}, options = {}) {
        if (!key || typeof key !== 'string') {
            throw new Error('A string non-empty key is required');
        }

        this._key = key;
        
        if (schema instanceof IterableSchema) {
            this._schema = schema;
        } else {
            this._schema = new IterableSchema(schema, options);
        }

        const idAttribute = options.idAttribute || 'id';
        this._getId = typeof idAttribute === 'function' ? idAttribute : x => x[idAttribute];
        this._idAttribute = idAttribute;
    }

    getKey() {
        return this._key;
    }

    getId(parentEntity) {
        return this._getId(parentEntity);
    }
}