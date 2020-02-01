import Vuex, { ActionContext, Store } from "vuex"
import { ActionsImpl, GettersImpl, ModuleOptions, ModulesImpl, MutationsImpl, StateOf, StoreOptions, StoreOrModuleOptions, WithOptionalState } from "../types"
import { CreatedStore, ToDirectStore, VuexStore } from "../types/direct-types"

export function createDirectStore<
  O extends WithOptionalState,
  S = StateOf<O>
>(options: O & StoreOptions<S>): CreatedStore<O> {
  const original = new Vuex.Store(options as any) as VuexStore<O>

  const store: ToDirectStore<O> = {
    get state() {
      return original.state as any
    },
    getters: toDirectGetters(options, original.getters),
    commit: toDirectCommit(options, original.commit),
    dispatch: toDirectDispatch(options, original.dispatch),
    original
  }

  original.direct = store

  return {
    store,
    rootActionContext: (originalContext: any) => getModuleActionContext(originalContext, options, options),
    moduleActionContext:
      (originalContext: any, moduleOptions: any) => getModuleActionContext(originalContext, moduleOptions, options),
    rootGetterContext:
      ([state, getters]: [any, any]) => getModuleGetterContext([state, getters, state, getters], options, options),
    moduleGetterContext:
      (args: [any, any, any, any], moduleOptions: any) =>
        getModuleGetterContext(args, moduleOptions, options)
  }
}

export function defineModule<
  O extends WithOptionalState,
  S = StateOf<O>
>(options: O & ModuleOptions<S>): O {
  return options
}

export function defineModules<S>(): (<T>(modules: T & ModulesImpl<S>) => T) {
  return modules => modules
}

export function defineGetters<S>(): (<T>(getters: T & GettersImpl<S>) => T) {
  return getters => getters
}

export function defineMutations<S>(): (<T>(mutations: T & MutationsImpl<S>) => T) {
  return mutations => mutations
}

export function defineActions<T>(actions: T & ActionsImpl): T {
  return actions
}

export const createModule = obsolete(defineModule, "createModule", "defineModule")
export const createModules = obsolete(defineModules, "createModules", "defineModules")
export const createGetters = obsolete(defineGetters, "createGetters", "defineGetters")
export const createMutations = obsolete(defineMutations, "createMutations", "defineMutations")
export const createActions = obsolete(defineActions, "createActions", "defineActions")

function obsolete<T extends (...args: any[]) => any>(fn: T, oldName: string, newName: string): T {
  return ((...args) => {
    // tslint:disable-next-line:no-console
    console.warn(`Function '${oldName}' is obsolete, please use '${newName}'.`)
    return fn(...args)
  }) as T
}

export default {
  createDirectStore, defineModule, defineModules, defineGetters, defineMutations, defineActions,
  createModule, createModules, createGetters, createMutations, createActions
}

// Getters

const gettersCache = new WeakMap<Store<any>["getters"], any>()

function toDirectGetters(options: StoreOrModuleOptions, originalGetters: Store<any>["getters"]) {
  let getters = gettersCache.get(originalGetters)
  // console.log(">> to-getters", getters ? "FROM_CACHE" : "CREATE", options)
  if (!getters) {
    getters = gettersFromOptions({}, options, originalGetters)
    gettersCache.set(originalGetters, getters)
  }
  return getters
}

function gettersFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  originalGetters: Store<any>["getters"],
  hierarchy: string[] = []
): any {
  if (options.getters)
    createDirectGetters(result, options.getters, originalGetters, hierarchy)
  if (options.modules) {
    for (const moduleName of Object.keys(options.modules)) {
      const moduleOptions = options.modules[moduleName]
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

const commitCache = new WeakMap<Store<any>["commit"], any>()

function toDirectCommit(options: StoreOrModuleOptions, originalCommit: Store<any>["commit"]) {
  let commit = commitCache.get(originalCommit)
  // console.log(">> to-commit", commit ? "FROM_CACHE" : "CREATE", options)
  if (!commit) {
    commit = commitFromOptions({}, options, originalCommit)
    commitCache.set(originalCommit, commit)
  }
  return commit
}

const rootCommitCache = new WeakMap<Store<any>["commit"], any>()

function toDirectRootCommit(rootOptions: StoreOptions, originalCommit: Store<any>["commit"]) {
  let commit = rootCommitCache.get(originalCommit)
  // console.log(">> to-rootCommit", commit ? "FROM_CACHE" : "CREATE", rootOptions)
  if (!commit) {
    const origCall = (mutation: string, payload: any) => originalCommit(mutation, payload, { root: true })
    commit = commitFromOptions({}, rootOptions, origCall)
    rootCommitCache.set(originalCommit, commit)
  }
  return commit
}

function commitFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  originalCommitCall: (mutation: string, payload: any) => void,
  hierarchy: string[] = []
): any {
  if (options.mutations)
    createDirectMutations(result, options.mutations, originalCommitCall, hierarchy)
  if (options.modules) {
    for (const moduleName of Object.keys(options.modules)) {
      const moduleOptions = options.modules[moduleName]
      if (moduleOptions.namespaced)
        result[moduleName] = commitFromOptions({}, moduleOptions, originalCommitCall, [...hierarchy, moduleName])
      else
        commitFromOptions(result, moduleOptions, originalCommitCall, hierarchy)
    }
  }
  return result
}

function createDirectMutations(
  result: any,
  mutationsImpl: MutationsImpl,
  originalCommitCall: (mutation: string, payload: any) => void,
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(mutationsImpl))
    result[name] = (payload: any) => originalCommitCall(`${prefix}${name}`, payload)
}

// Actions

const dispatchCache = new WeakMap<Store<any>["dispatch"], any>()

function toDirectDispatch(options: StoreOrModuleOptions, originalDispatch: Store<any>["dispatch"]) {
  let dispatch = dispatchCache.get(originalDispatch)
  // console.log(">> to-dispatch", dispatch ? "FROM_CACHE" : "CREATE", options)
  if (!dispatch) {
    dispatch = dispatchFromOptions({}, options, originalDispatch)
    dispatchCache.set(originalDispatch, dispatch)
  }
  return dispatch
}

const rootDispatchCache = new WeakMap<Store<any>["dispatch"], any>()

function toDirectRootDispatch(rootOptions: StoreOptions, originalDispatch: Store<any>["dispatch"]) {
  let dispatch = rootDispatchCache.get(originalDispatch)
  // console.log(">> to-rootDispatch", dispatch ? "FROM_CACHE" : "CREATE", rootOptions)
  if (!dispatch) {
    const origCall = (mutation: string, payload: any) => originalDispatch(mutation, payload, { root: true })
    dispatch = dispatchFromOptions({}, rootOptions, origCall)
    rootDispatchCache.set(originalDispatch, dispatch)
  }
  return dispatch
}

function dispatchFromOptions(
  result: any,
  options: StoreOrModuleOptions,
  originalDispatchCall: (action: string, payload: any) => any,
  hierarchy: string[] = []
): any {
  if (options.actions)
    createDirectActions(result, options.actions, originalDispatchCall, hierarchy)
  if (options.modules) {
    for (const moduleName of Object.keys(options.modules)) {
      const moduleOptions = options.modules[moduleName]
      if (moduleOptions.namespaced)
        result[moduleName] = dispatchFromOptions({}, moduleOptions, originalDispatchCall, [...hierarchy, moduleName])
      else
        dispatchFromOptions(result, moduleOptions, originalDispatchCall, hierarchy)
    }
  }
  return result
}

function createDirectActions(
  result: any,
  actionsImpl: ActionsImpl,
  originalDispatchCall: (action: string, payload: any) => any,
  hierarchy?: string[]
) {
  const prefix = !hierarchy || hierarchy.length === 0 ? "" : `${hierarchy.join("/")}/`
  for (const name of Object.keys(actionsImpl))
    result[name] = (payload?: any) => originalDispatchCall(`${prefix}${name}`, payload)
}

// ActionContext

const actionContextCache = new WeakMap<any, any>()

function getModuleActionContext(
  originalContext: ActionContext<any, any>,
  options: ModuleOptions,
  rootOptions: StoreOptions
): any {
  let context = actionContextCache.get(originalContext.state)
  // console.log(">> to-actionContext", context ? "FROM_CACHE" : "CREATE", options)
  if (!context) {
    context = {
      get rootState() {
        return originalContext.rootState
      },
      get rootGetters() {
        return toDirectGetters(rootOptions, originalContext.rootGetters)
      },
      get rootCommit() {
        return toDirectRootCommit(rootOptions, originalContext.commit)
      },
      get rootDispatch() {
        return toDirectRootDispatch(rootOptions, originalContext.dispatch)
      },
      get state() {
        return originalContext.state
      },
      get getters() {
        return toDirectGetters(options, originalContext.getters)
      },
      get commit() {
        return toDirectCommit(options, originalContext.commit)
      },
      get dispatch() {
        return toDirectDispatch(options, originalContext.dispatch)
      }
    }
    if (originalContext.state) // Can be undefined in unit tests
      actionContextCache.set(originalContext.state, context)
  }
  return context
}

// GetterContext

const getterContextCache = new WeakMap<any, any>()

function getModuleGetterContext(args: [any, any, any, any], options: ModuleOptions, rootOptions: StoreOptions) {
  const [state, getters, rootState, rootGetters] = args
  let context = actionContextCache.get(state)
  // console.log(">> to-getterContext", context ? "FROM_CACHE" : "CREATE", options)
  if (!context) {
    context = {
      get rootState() {
        return rootState
      },
      get rootGetters() {
        return toDirectGetters(rootOptions, rootGetters)
      },
      get state() {
        return state
      },
      get getters() {
        return toDirectGetters(options, getters)
      }
    }
    if (state) // Can be undefined in unit tests
      getterContextCache.set(state, context)
  }

  return context
}
