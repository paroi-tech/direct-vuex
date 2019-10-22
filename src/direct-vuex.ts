import Vuex, { ActionContext, Commit, Dispatch, Store } from "vuex"
import { ActionsImpl, GettersImpl, MutationsImpl, StoreOptions, StoreOrModuleOptions } from "../types"
import { DirectActionContext, ToDirectStore, VuexStore } from "../types/direct-types"

export function createDirectStore<O extends StoreOptions>(options: O): ToDirectStore<O> {
  const original = new Vuex.Store(options) as VuexStore<O>

  const direct: ToDirectStore<O> = {
    get state() {
      return original.state
    },
    getters: gettersFromOptions({}, options, original.getters),
    commit: commitFromOptions({}, options, original.commit),
    dispatch: dispatchFromOptions({}, options, original.dispatch),
    original,
    directActionContext: actionContextProvider(options)
  }

  original.direct = direct
  return direct
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

const actionContexts = new WeakMap<ActionContext<any, any>, ReturnType<typeof createActionContext>>()

function actionContextProvider(rootOptions: StoreOptions) {
  return (options: StoreOrModuleOptions, originalContext: ActionContext<any, any>) => {
    let context = actionContexts.get(originalContext)
    if (!context) {
      context = createActionContext(rootOptions, options, originalContext)
      actionContexts.set(originalContext, context)
    }
    return context
  }
}

function createActionContext(
  rootOptions: StoreOptions,
  options: StoreOrModuleOptions,
  originalContext: ActionContext<any, any>
) {
  const rootCommit: Commit = (type: string, payload?: any) => originalContext.commit(type, payload, { root: true })
  const rootDispatch: Dispatch = (type: string, payload?: any) => originalContext.dispatch(type, payload, { root: true })
  return {
    get rootState() {
      return originalContext.rootState
    },
    rootGetters: gettersFromOptions({}, rootOptions, originalContext.rootGetters),
    rootCommit: commitFromOptions({}, rootOptions, rootCommit),
    rootDispatch: dispatchFromOptions({}, rootOptions, rootDispatch),
    get state() {
      return originalContext.state
    },
    getters: gettersFromOptions({}, options, originalContext.getters),
    commit: commitFromOptions({}, options, originalContext.commit),
    dispatch: dispatchFromOptions({}, options, originalContext.dispatch)
  }
}