import { schema } from "../../src";

const entity = new schema.Entity<any>('entity')
const array = new schema.Array<any>(entity)
const object = new schema.Object(entity)
const union = new schema.Union({ entity: entity, array: array })
const values = new schema.Values<any>({ entities: entity, arrays: array })

/* Ensure that the various schema types are not interchangeable */
// THROWS Type 'Entity<any, string, any>' is missing the following properties from type 'Array<any>'
const entityArray: schema.Array<any> = entity;
// THROWS Property 'type' is missing in type 'Entity<any, string, any>' but required in type 'Object'
const entityObject: schema.Object = entity;
// THROWS Type 'Entity<any, string, any>' is missing the following properties from type 'Union'
const entityUnion: schema.Union = entity;
// THROWS Type 'Entity<any, string, any>' is missing the following properties from type 'Values<any>'
const entityValues: schema.Values<any> = entity;

// THROWS Type 'Array<any>' is missing the following properties from type 'Entity<any, string, any>'
const arrayEntity: schema.Entity<any> = array;
// THROWS Type 'Array<any>' is not assignable to type 'Object'
const arrayObject: schema.Object = array;
// THROWS Type 'Array<any>' is not assignable to type 'Union'
const arrayUnion: schema.Union = array;
// THROWS Type 'Array<any>' is not assignable to type 'Values<any>'
const arrayValues: schema.Values<any> = array;

// THROWS Type 'Object' is missing the following properties from type 'Entity<any, string, any>'
const objectEntity: schema.Entity<any> = object;
// THROWS Type 'Object' is missing the following properties from type 'Array<any>'
const objectArray: schema.Array<any> = object;
// THROWS Type 'Object' is missing the following properties from type 'Union'
const objectUnion: schema.Union = object;
// THROWS Type 'Object' is missing the following properties from type 'Values<any>'
const objectValues: schema.Values<any> = object;

// THROWS Type 'Union' is missing the following properties from type 'Entity<any, string, any>'
const unionEntity: schema.Entity<any> = union;
// THROWS Type 'Union' is not assignable to type 'Array<any>'
const unionArray: schema.Array<any> = union;
// THROWS Type 'Union' is not assignable to type 'Object'
const unionObject: schema.Object = union;
// THROWS Type 'Union' is not assignable to type 'Values<any>'
const unionValues: schema.Values<any> = union;

// THROWS Type 'Values<any>' is missing the following properties from type 'Entity<any, string, any>'
const valuesEntity: schema.Entity<any> = values;
// THROWS Type 'Values<any>' is not assignable to type 'Array<any>'
const valuesArray: schema.Array<any> = values;
// THROWS Type 'Values<any>' is not assignable to type 'Object'
const valuesObject: schema.Object = values;
// THROWS Type 'Values<any>' is not assignable to type 'Union'
const valuesUnion: schema.Union = values;

console.log(entityArray, entityObject, entityUnion, entityValues, arrayEntity, arrayObject, arrayUnion, arrayValues, objectEntity, objectArray, objectUnion, objectValues, unionEntity, unionArray, unionObject, unionValues, valuesEntity, valuesArray, valuesObject, valuesUnion);
