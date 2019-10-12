import { Store } from "vuex"
import { ToDirectActions, ToDirectGetters, ToDirectMutations, ToDirectStore } from "./direct-types"

export function createDirectStore<O extends StoreOptions>(options: O): ToDirectStore<O>

export function createDirectGetters<T extends GettersImpl>(
  gettersImpl: T,
  original: Store<any>,
  hierarchy?: string[]
): ToDirectGetters<T>

export function createDirectMutations<T extends MutationsImpl>(
  mutationsImpl: T,
  original: Store<any>,
  hierarchy?: string[]
): ToDirectMutations<T>

export function createDirectActions<T extends ActionsImpl>(
  actionsImpl: T,
  original: Store<any>,
  hierarchy?: string[]
): ToDirectActions<T>

/**
 * Types for Vuex Store Options
 */
export interface StoreOptions {
  strict?: boolean
  state?: any,
  getters?: GettersImpl
  mutations?: MutationsImpl
  actions?: ActionsImpl
  modules?: ModulesImpl
  plugins?: PluginImpl[]
}

export type ModuleOptions = Pick<StoreOptions,
  "state" | "getters" | "mutations" | "actions" | "modules"
> & {
  namespaced: true
}

export interface ModulesImpl { [moduleName: string]: ModuleOptions }

export interface GettersImpl {
  [name: string]: GetterImpl
}

export type GetterImpl = (state: any, getters: any, rootState: any, rootGetters: any) => any

export interface MutationsImpl {
  [name: string]: MutationImpl
}

export type MutationImpl = (state: any, payload: any) => any

export interface ActionsImpl {
  [name: string]: ActionImpl
}

export type ActionImpl = (context: any, payload: any) => Promise<any>

export type PluginImpl = (store: any) => any