import { ToDirectStore } from "./direct-types"

export function createDirectStore<O extends StoreOptions>(options: O): ToDirectStore<O>

/*
 * Types for Vuex Store Options
 */

export interface StoreOrModuleOptions {
  state?: any,
  getters?: GettersImpl
  mutations?: MutationsImpl
  actions?: ActionsImpl
  modules?: ModulesImpl
  plugins?: PluginImpl[]
}

export interface StoreOptions extends StoreOrModuleOptions {
  strict?: boolean
}

export interface ModuleOptions extends StoreOrModuleOptions {
  namespaced?: boolean
}

export interface ModulesImpl { [moduleName: string]: ModuleOptions }

export interface GettersImpl {
  [name: string]: GetterImpl
}

export type GetterImpl = (state: any, getters: any, rootState: any, rootGetters: any) => any

export interface MutationsImpl {
  [name: string]: MutationImpl
}

export type MutationImpl = (state: any, payload: any) => void

export interface ActionsImpl {
  [name: string]: ActionImpl
}

export type ActionImpl = (context: any, payload: any) => Promise<any>

export type PluginImpl = (store: any) => any