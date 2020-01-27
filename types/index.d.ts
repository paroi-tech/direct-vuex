import { ActionContext } from "vuex"
import { CreatedStore } from "./direct-types"

export function defineDirectStore<
  O extends WithOptionalState,
  S = StateOf<O>
>(options: O & StoreOptions<S>): CreatedStore<O>

export function defineModule<
  O extends WithOptionalState,
  S = StateOf<O>
>(options: O & ModuleOptions<S>): O

export function defineModules<S>(): (<T>(modules: T & ModulesImpl<S>) => T)
export function defineGetters<S>(): (<T>(getters: T & GettersImpl<S>) => T)
export function defineMutations<S>(): (<T>(mutations: T & MutationsImpl<S>) => T)
export function defineActions<T>(actions: T & ActionsImpl): T


/**
 * @deprecated Use `defineDirectStore`.
 */
export function createDirectStore<
  O extends WithOptionalState,
  S = StateOf<O>
>(options: O & StoreOptions<S>): CreatedStore<O>

/**
 * @deprecated Use `defineModule`.
 */
export function createModule<
  O extends WithOptionalState,
  S = StateOf<O>
>(options: O & ModuleOptions<S>): O

/**
 * @deprecated Use `defineModules`.
 */
export function createModules<S>(): (<T>(modules: T & ModulesImpl<S>) => T)
/**
 * @deprecated Use `defineGetters`.
 */
export function createGetters<S>(): (<T>(getters: T & GettersImpl<S>) => T)
/**
 * @deprecated Use `defineMutations`.
 */
export function createMutations<S>(): (<T>(mutations: T & MutationsImpl<S>) => T)
/**
 * @deprecated Use `defineActions`.
 */
export function createActions<T>(actions: T & ActionsImpl): T


export type WithOptionalState = { state: StateDeclaration } | {}
export type StateOf<O> = O extends { state: StateDeclaration } ? O["state"] : {}
type StateDeclaration = any | (() => any)

/*
 * Types for Vuex Store Options
 */

export interface StoreOrModuleOptions<S = any> {
  state?: S extends object ? ((() => S) | S) : never,
  getters?: GettersImpl<S>
  mutations?: MutationsImpl<S>
  actions?: ActionsImpl
  modules?: ModulesImpl
  plugins?: PluginImpl[]
}

export interface StoreOptions<S = any> extends StoreOrModuleOptions<S> {
  strict?: boolean
}

export interface ModuleOptions<S = any> extends StoreOrModuleOptions<S> {
  namespaced?: boolean
}

export interface ModulesImpl<S = any> { [moduleName: string]: ModuleOptions<S> }

export interface GettersImpl<S = any, G = any> {
  [name: string]: GetterImpl<S, G>
}

export type GetterImpl<S = any, G = any> = (state: S, getters: G, rootState: any, rootGetters: any) => any

export interface MutationsImpl<S = any> {
  [name: string]: MutationImpl<S>
}

export type MutationImpl<S = any> = (state: S, payload: any) => void

export interface ActionsImpl {
  [name: string]: ActionImpl
}

export type ActionImpl = (context: ActionContext<any, any>, payload: any) => any

export type PluginImpl = (store: any) => any