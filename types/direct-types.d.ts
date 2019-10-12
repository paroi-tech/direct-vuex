import { Store } from "vuex"
import { ActionsImpl, GettersImpl, ModulesImpl, MutationsImpl, StoreOptions, StoreOrModuleOptions } from "./index"

export interface ToDirectStore<O extends StoreOptions> {
  original: Store<DirectState<O>>,
  state: DirectState<O>
  getters: DirectGetters<O>
  commit: DirectMutations<O>
  dispatch: DirectActions<O>
}

// State

export type DirectState<O extends StoreOrModuleOptions> = O["state"] & GetStateInModulesOrEmpty<O>

export type GetStateInModulesOrEmpty<O extends StoreOrModuleOptions> =
  O["modules"] extends ModulesImpl ? GetStateInModules<O["modules"]> : {}

export type GetStateInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectState<I[M]>
}

// Getters

export type DirectGetters<O extends StoreOrModuleOptions> =
  (O["getters"] extends GettersImpl ? ToDirectGetters<O["getters"]> : {})
  & GetGettersInModulesOrEmpty<O>

export type GetGettersInModulesOrEmpty<O extends StoreOrModuleOptions> =
  O["modules"] extends ModulesImpl ? GetGettersInModules<O["modules"]> : {}

export type GetGettersInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectGetters<I[M]>
}

export type ToDirectGetters<T extends GettersImpl> = {
  [K in keyof T]: ReturnType<T[K]>
}

// Mutations

export type DirectMutations<O extends StoreOrModuleOptions> =
  (O["mutations"] extends MutationsImpl ? ToDirectMutations<O["mutations"]> : {})
  & GetMutationsInModulesOrEmpty<O>

export type GetMutationsInModulesOrEmpty<O extends StoreOrModuleOptions> =
  O["modules"] extends ModulesImpl ? GetMutationsInModules<O["modules"]> : {}

export type GetMutationsInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectMutations<I[M]>
}

export type ToDirectMutations<T extends MutationsImpl> = {
  [K in keyof T]: Parameters<T[K]>[1] extends undefined
  ? (() => ReturnType<T[K]>)
  : ((payload: Parameters<T[K]>[1]) => ReturnType<T[K]>)
}

// Actions

export type DirectActions<O extends StoreOrModuleOptions> =
  (O["actions"] extends ActionsImpl ? ToDirectActions<O["actions"]> : {})
  & GetActionsInModulesOrEmpty<O>

export type GetActionsInModulesOrEmpty<O extends StoreOrModuleOptions> =
  O["modules"] extends ModulesImpl ? GetActionsInModules<O["modules"]> : {}

export type GetActionsInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectActions<I[M]>
}

export type ToDirectActions<T extends ActionsImpl> = {
  [K in keyof T]: Parameters<T[K]>[1] extends undefined
  ? (() => ReturnType<T[K]>)
  : ((payload: Parameters<T[K]>[1]) => ReturnType<T[K]>)
}
