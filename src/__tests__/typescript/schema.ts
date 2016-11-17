import {Schema, IterableSchema, UnionSchema, SchemaValue} from "../../../index.d.ts";

const idAttribute = "slug";
const meta = { removeProps: ["year", "publisher"] };

const generateSlug = function (entity: any) {
  if (entity.slug != null) {
    return "slug";
  }
  return "id";
};

const assignEntity = function (output: any, key: string, value: any, input: any, schema: SchemaValue) {
  const itemSchema = (schema instanceof IterableSchema || schema instanceof UnionSchema) ?
    schema.getItemSchema() : schema;
  const removeProps = (itemSchema instanceof Schema) ?
    itemSchema.getMeta("removeProps") : null;
  if (!removeProps || removeProps.indexOf(key) < 0) {
    output[key] = value;
  }
};

const schemaWithKey = new Schema("articles");
const schemaWithStringIdAttribute = new Schema("articles", { idAttribute });
const schemaWithFunctionIdAttribute = new Schema("articles", { idAttribute: generateSlug });
const schemaWithMeta = new Schema("articles", { meta });
const schemaWithAssignEntity = new Schema("articles", { meta, assignEntity });

const someKey: string = schemaWithKey.getKey();
const someIdAttribute: string = schemaWithStringIdAttribute.getIdAttribute();
const someOtherIdAttribute: string = schemaWithFunctionIdAttribute.getIdAttribute();
const someMeta: any = schemaWithMeta.getMeta("removeProps");

const article = new Schema("articles");
const user = new Schema("users");
article.define({
  author: user
});
