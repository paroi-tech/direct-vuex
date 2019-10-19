import Vuex, { Store } from "vuex"
import { ActionsImpl, GettersImpl, MutationsImpl, StoreOptions, StoreOrModuleOptions } from "../types"
import { ToDirectStore } from "../types/direct-types"

export function createDirectStore<O extends StoreOptions>(options: O): ToDirectStore<O> {
  const original = new Vuex.Store(options)

  return {
    original,
    get state() {
      return original.state
    },
    getters: directGettersFromOptions({}, options, original),
    commit: commitFromOptions({}, options, original),
    dispatch: dispatchFromOptions({}, options, original)
  }
}

// Getters

function directGettersFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  original: Store<any>,
  hierarchy: string[] = []
): any {
  if (options.getters)
    createDirectGetters(result, options.getters, original, hierarchy)
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules)) {
      if (moduleOptions.namespaced)
        result[moduleName] = directGettersFromOptions({}, moduleOptions, original, [...hierarchy, moduleName])
      else
        directGettersFromOptions(result, moduleOptions, original, hierarchy)
    }
  }
  return result
}

function createDirectGetters(
  result: any,
  gettersImpl: GettersImpl,
  original: Store<any>,
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(gettersImpl)) {
    Object.defineProperties(result, {
      [name]: {
        get: () => original.getters[`${prefix}${name}`]
      }
    })
  }
}

// Mutations

function commitFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  original: Store<any>,
  hierarchy: string[] = []
): any {
  if (options.mutations)
    createDirectMutations(result, options.mutations, original, hierarchy)
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules)) {
      if (moduleOptions.namespaced)
        result[moduleName] = commitFromOptions({}, moduleOptions, original, [...hierarchy, moduleName])
      else
        commitFromOptions(result, moduleOptions, original, hierarchy)
    }
  }
  return result
}

function createDirectMutations(
  result: any,
  mutationsImpl: MutationsImpl,
  original: Store<any>,
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(mutationsImpl))
    result[name] = (payload: any) => original.commit(`${prefix}${name}`, payload)
}

// Actions

function dispatchFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  original: Store<any>,
  hierarchy: string[] = []
): any {
  if (options.actions)
    createDirectActions(result, options.actions, original, hierarchy)
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules)) {
      if (moduleOptions.namespaced)
        result[moduleName] = dispatchFromOptions({}, moduleOptions, original, [...hierarchy, moduleName])
      else
        dispatchFromOptions(result, moduleOptions, original, hierarchy)
    }
  }
  return result
}

function createDirectActions(
  result: any,
  actionsImpl: ActionsImpl,
  original: Store<any>,
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(actionsImpl))
    result[name] = (payload?: any) => original.dispatch(`${prefix}${name}`, payload)
}
