# Normalizr and JSONAPI

If you're using JSONAPI, you're ahead of the curve, but also in a bit of a tough spot. JSONAPI is a great spec, but doesn't play nicely with the way that you want to manage data in Redux/Flux style state management applications.

Just as well, Normalizr was not written for JSONAPI and really doesn't work well. Instead, stop what you're doing now and check out some of the other great libraries and packages available that are written specifically for normalizing JSONAPI data\*:

- [stevenpetryk/jsonapi-normalizer](https://github.com/stevenpetryk/jsonapi-normalizer)
- [yury-dymov/json-api-normalizer](https://github.com/yury-dymov/json-api-normalizer)
- [JSONAPI client libraries](http://jsonapi.org/implementations/#client-libraries-javascript)

**Note:** These are in no particular order. Review all libraries on your own before deciding which is best for your particular use-case.
