import Vuex, { Store } from "vuex"
import { ActionsImpl, GettersImpl, MutationsImpl, StoreOptions } from "../types"
import { DirectActions, DirectGetters, DirectMutations, ToDirectActions, ToDirectGetters, ToDirectMutations, ToDirectStore } from "../types/direct-types"

export function createDirectStore<O extends StoreOptions>(options: O): ToDirectStore<O> {
  const original = new Vuex.Store(options)

  return {
    original,
    state: original.state,
    commit: commitFromOptions(options, original),
    dispatch: dispatchFromOptions(options, original),
    getters: gettersFromOptions(options, original)
  }
}

function gettersFromOptions<O extends StoreOptions>(
  options: O,
  original: Store<any>,
  hierarchy: string[] = []
): DirectGetters<O> {
  const result = options.getters ? createDirectGetters(options.getters, original, hierarchy) : {}
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules))
      result[moduleName] = gettersFromOptions(moduleOptions, original, [...hierarchy, moduleName])
  }
  return result as DirectGetters<O>
}

export function createDirectGetters<T extends GettersImpl>(
  gettersImpl: T,
  original: Store<any>,
  hierarchy?: string[]
): ToDirectGetters<T> {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  const result = {} as ToDirectGetters<any>
  for (const name of Object.keys(gettersImpl)) {
    Object.defineProperties(result, {
      [name]: {
        get: () => original.getters[`${prefix}${name}`]
      }
    })
  }
  return result
}

function commitFromOptions<O extends StoreOptions>(
  options: O,
  original: Store<any>,
  hierarchy: string[] = []
): DirectMutations<O> {
  const result: any = options.mutations ? createDirectMutations(options.mutations, original, hierarchy) : {}
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules))
      result[moduleName] = commitFromOptions(moduleOptions, original, [...hierarchy, moduleName])
  }
  return result
}

export function createDirectMutations<T extends MutationsImpl>(
  mutationsImpl: T,
  original: Store<any>,
  hierarchy?: string[]
): ToDirectMutations<T> {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  const result = {} as ToDirectMutations<any>
  for (const name of Object.keys(mutationsImpl)) {
    result[name] = (payload: any) => original.commit(`${prefix}${name}`, payload)
  }
  return result
}

function dispatchFromOptions<O extends StoreOptions>(
  options: O,
  original: Store<any>,
  hierarchy: string[] = []
): DirectActions<O> {
  const result: any = options.actions ? createDirectActions(options.actions, original, hierarchy) : {}
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules))
      result[moduleName] = dispatchFromOptions(moduleOptions, original, [...hierarchy, moduleName])
  }
  return result
}

export function createDirectActions<T extends ActionsImpl>(
  actionsImpl: T,
  original: Store<any>,
  hierarchy?: string[]
): ToDirectActions<T> {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  const result = {} as ToDirectActions<any>
  for (const name of Object.keys(actionsImpl)) {
    result[name] = (payload?: any) => original.dispatch(`${prefix}${name}`, payload)
  }
  return result
}
