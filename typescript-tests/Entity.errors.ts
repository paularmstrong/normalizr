import { schema } from "../src";

/* Entity requires a key name */
// THROWS Expected 1-3 arguments, but got 0
new schema.Entity()

/* Entity key name must be a string */
// THROWS Argument of type 'number' is not assignable to parameter of type 'string'
new schema.Entity(42)
