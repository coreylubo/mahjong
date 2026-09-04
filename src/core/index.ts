/**
 * The portable game layer.
 *
 * Everything reachable from here is plain data and pure functions with no
 * framework dependency — the whole point of spec §7.1. `core.test.ts` fails the
 * build if anything in this directory imports a UI package.
 */
export * from './types'
export * from './tiles'
export * from './terminology'
export * from './melds'
export * from './turnFlow'
export * from './scorekeeper'
export * from './scoring'
