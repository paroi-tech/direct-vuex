import { ActionContext } from "vuex"
import { CreatedStore } from "./direct-types"

export function createDirectStore<O extends WithState, S = O["state"]>(options: O & StoreOptions<S>): CreatedStore<O>
export function createModule<O extends WithState, S = O["state"]>(options: O & ModuleOptions<S>): O

export function createModules<S>(): (<T>(modules: T & ModulesImpl<S>) => T)
export function createGetters<S>(): (<T>(getters: T & GettersImpl<S>) => T)
export function createMutations<S>(): (<T>(mutations: T & MutationsImpl<S>) => T)
export function createActions<T>(actions: T & ActionsImpl): T

export interface WithState {
  state?: any | (() => any)
}

/*
 * Types for Vuex Store Options
 */

export interface StoreOrModuleOptions<S = any> {
  state?: (() => S) | S,
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