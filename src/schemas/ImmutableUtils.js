// @flow
import type { Unvisitor } from '../types';
import type { Map, Record } from 'immutable';
/**
 * Helpers to enable Immutable compatibility *without* bringing in
 * the 'immutable' package as a dependency.
 */

export function isImmutable(object: any): boolean {
  return !!(
    object &&
    typeof object.hasOwnProperty === 'function' &&
    (object.hasOwnProperty('__ownerID') || // Immutable.Map
      (object._map && typeof object._map === 'object' && object._map.hasOwnProperty('__ownerID')))
  ); // Immutable.Record
}

/**
 * Denormalize an immutable entity.
 *
 * @param  {Schema} schemaDefinition
 * @param  {Immutable.Map|Immutable.Record} input
 * @param  {function} unvisit
 * @param  {function} getDenormalizedEntity
 * @return {Immutable.Map|Immutable.Record}
 */
export function denormalizeImmutable(schemaDefinition: {}, input: Map | Record, unvisit: Unvisitor) {
  return Object.keys(schemaDefinition).reduce((object, key) => {
    // Immutable maps cast keys to strings on write so we need to ensure
    // we're accessing them using string keys.
    const stringKey = `${key}`;

    // $FlowFixMe this is determined via isImmutable check
    if (object.has(stringKey)) {
      // $FlowFixMe this is determined via isImmutable check
      return object.set(stringKey, unvisit(object.get(stringKey), schemaDefinition[stringKey]));
    } else {
      return object;
    }
  }, input);
}
