import {Schema, normalize, arrayOf, unionOf, valuesOf} from "../../../index.d.ts";

const isObject = function (obj: any) {
  return typeof obj === 'object';
};

const assignEntity = function (output: any, key: string, value: any) {
  if (key === "timestamp") {
    output[key] = Date.now()
  }
  output[key] = value;
};

const mergeIntoEntity = function (entityA: any, entityB: any, entityKey: string) {
  for (const key in entityB) {
    if (!entityB.hasOwnProperty(key)) {
      continue;
    }

    if (!entityA.hasOwnProperty(key)) {
      entityA[key] = entityB[key];
      continue;
    }

    if (isObject(entityA[key]) && isObject(entityB[key])) {
      // Merge the two entities.
      continue;
    }
  }
};

const user = new Schema("users");
const group = new Schema("groups", { assignEntity });
const member = unionOf({ users: user, groups: group }, { schemaAttribute: "type" });

group.define({
  members: arrayOf(member),
  owner: member,
  relations: valuesOf(member)
});

const normalizeWithObject = normalize({}, { group });
const normalizeWithArray = normalize([], { groups: arrayOf(group) });
const normalizeWithAssignEntity = normalize([], { groups: arrayOf(group) }, { assignEntity });
const normalizeWithMergeIntoEntity = normalize([], { groups: arrayOf(group) }, { mergeIntoEntity });
