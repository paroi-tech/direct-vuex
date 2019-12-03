import Vuex, { ActionContext, Store } from "vuex"
import { ActionsImpl, GettersImpl, ModuleOptions, MutationsImpl, StoreOptions, StoreOrModuleOptions } from "../types"
import { CreatedStore, ToDirectStore, VuexStore } from "../types/direct-types"

export function createDirectStore<O extends StoreOptions>(options: O): CreatedStore<O> {
  const original = new Vuex.Store(options) as VuexStore<O>

  const store: ToDirectStore<O> = {
    get state() {
      return original.state as any
    },
    getters: gettersFromOptions({}, options, original.getters),
    commit: commitFromOptions({}, options, original.commit),
    dispatch: dispatchFromOptions({}, options, original.dispatch),
    original
  }

  original.direct = store

  return {
    store,
    rootActionContext: rootActionContextProvider(store as any),
    moduleActionContext:
      (originalContext: any, module: any) => getModuleActionContext(originalContext, module, store as any)
  }
}

// Getters

function gettersFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  originalGetters: Store<any>["getters"],
  hierarchy: string[] = []
): any {
  if (options.getters)
    createDirectGetters(result, options.getters, originalGetters, hierarchy)
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules)) {
      if (moduleOptions.namespaced)
        result[moduleName] = gettersFromOptions({}, moduleOptions, originalGetters, [...hierarchy, moduleName])
      else
        gettersFromOptions(result, moduleOptions, originalGetters, hierarchy)
    }
  }
  return result
}

function createDirectGetters(
  result: any,
  gettersImpl: GettersImpl,
  originalGetters: Store<any>["getters"],
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(gettersImpl)) {
    Object.defineProperties(result, {
      [name]: {
        get: () => originalGetters[`${prefix}${name}`]
      }
    })
  }
}

// Mutations

function commitFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  originalCommit: Store<any>["commit"],
  hierarchy: string[] = []
): any {
  if (options.mutations)
    createDirectMutations(result, options.mutations, originalCommit, hierarchy)
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules)) {
      if (moduleOptions.namespaced)
        result[moduleName] = commitFromOptions({}, moduleOptions, originalCommit, [...hierarchy, moduleName])
      else
        commitFromOptions(result, moduleOptions, originalCommit, hierarchy)
    }
  }
  return result
}

function createDirectMutations(
  result: any,
  mutationsImpl: MutationsImpl,
  originalCommit: Store<any>["commit"],
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(mutationsImpl))
    result[name] = (payload: any) => originalCommit(`${prefix}${name}`, payload)
}

// Actions

function dispatchFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  originalDispatch: Store<any>["dispatch"],
  hierarchy: string[] = []
): any {
  if (options.actions)
    createDirectActions(result, options.actions, originalDispatch, hierarchy)
  if (options.modules) {
    for (const [moduleName, moduleOptions] of Object.entries(options.modules)) {
      if (moduleOptions.namespaced)
        result[moduleName] = dispatchFromOptions({}, moduleOptions, originalDispatch, [...hierarchy, moduleName])
      else
        dispatchFromOptions(result, moduleOptions, originalDispatch, hierarchy)
    }
  }
  return result
}

function createDirectActions(
  result: any,
  actionsImpl: ActionsImpl,
  originalDispatch: Store<any>["dispatch"],
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(actionsImpl))
    result[name] = (payload?: any) => originalDispatch(`${prefix}${name}`, payload)
}

// ActionContext

const actionContexts = new WeakMap<any, ReturnType<typeof createModuleActionContext>>()

function getModuleActionContext(
  originalContext: ActionContext<any, any>,
  options: ModuleOptions,
  store: ToDirectStore<any>
): any {
  let context = actionContexts.get(originalContext.dispatch)
  if (!context) {
    context = createModuleActionContext(options, originalContext, store)
    if (originalContext.dispatch) // Can be 'undefined' in test units
      actionContexts.set(originalContext.dispatch, context)
  }
  return context
}

function createModuleActionContext(
  options: StoreOrModuleOptions,
  originalContext: ActionContext<any, any>,
  store: ToDirectStore<any>
) {
  return {
    get rootState() {
      return originalContext.rootState
    },
    rootGetters: store.getters,
    rootCommit: store.commit,
    rootDispatch: store.dispatch,
    get state() {
      return originalContext.state
    },
    getters: gettersFromOptions({}, options, originalContext.getters),
    commit: commitFromOptions({}, options, originalContext.commit),
    dispatch: dispatchFromOptions({}, options, originalContext.dispatch)
  }
}

function rootActionContextProvider(store: ToDirectStore<any>): any {
  return (originalContext: ActionContext<any, any>) => {
    let context = actionContexts.get(originalContext.dispatch)
    if (!context) {
      context = createRootActionContext(originalContext, store)
      if (originalContext.dispatch) // Can be 'undefined' in test units
        actionContexts.set(originalContext.dispatch, context)
    }
    return context
  }
}

function createRootActionContext(
  originalContext: ActionContext<any, any>,
  store: ToDirectStore<any>
) {
  return {
    get rootState() {
      return originalContext.rootState
    },
    rootGetters: store.getters,
    rootCommit: store.commit,
    rootDispatch: store.dispatch,
    get state() {
      return originalContext.state
    },
    getters: store.getters,
    commit: store.commit,
    dispatch: store.dispatch
  }
}
