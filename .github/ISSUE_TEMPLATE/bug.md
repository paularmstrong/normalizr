---
name: 🐛 Bug Report
about: If something isn't working as expected 🤔.
---

# Problem

A short explanation of your problem or use-case is helpful!

**Input**

Here's how I'm using normalizr:

```js
// Add as much relevant code and input as possible.
const myData = {
  // This section is really helpful! A minimum test case goes a long way!
};
const mySchema = new schema.Entity('myschema');
normalize(myData, mySchema);
```

**Output**

Here's what I expect to see when I run the above:

```js
{
    result: [1, 2],
    entities: { ... }
}
```

Here's what I _actually_ see when I run the above:

```js
{
    result: [1, 2],
    entities: { ... }
}
```
