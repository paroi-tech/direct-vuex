import { Store } from "vuex"
import { ActionsImpl, GettersImpl, ModulesImpl, MutationsImpl, StoreOptions } from "./index"

export interface ToDirectStore<O extends StoreOptions> {
  original: Store<DirectState<O>>,
  state: DirectState<O>
  getters: DirectGetters<O>
  commit: DirectMutations<O>
  dispatch: DirectActions<O>
}

// State

export type DirectState<O extends StoreOptions> = O["state"] & GetStateInModulesOrEmpty<O>

export type GetStateInModulesOrEmpty<O extends StoreOptions> =
  O["modules"] extends ModulesImpl ? GetStateInModules<O["modules"]> : {}

export type GetStateInModules<MO extends ModulesImpl> = {
  [M in keyof MO]: DirectState<MO[M]>
}

// Getters

export type DirectGetters<O extends StoreOptions> =
  (O["getters"] extends GettersImpl ? ToDirectGetters<O["getters"]> : {})
  & GetGettersInModulesOrEmpty<O>

export type GetGettersInModulesOrEmpty<O extends StoreOptions> =
  O["modules"] extends ModulesImpl ? GetGettersInModules<O["modules"]> : {}

export type GetGettersInModules<MO extends ModulesImpl> = {
  [M in keyof MO]: DirectGetters<MO[M]>
}

export type ToDirectGetters<T extends GettersImpl> = {
  [K in keyof T]: ReturnType<T[K]>
}

// Mutations

export type DirectMutations<O extends StoreOptions> =
  (O["mutations"] extends MutationsImpl ? ToDirectMutations<O["mutations"]> : {})
  & GetMutationsInModulesOrEmpty<O>

export type GetMutationsInModulesOrEmpty<O extends StoreOptions> =
  O["modules"] extends ModulesImpl ? GetMutationsInModules<O["modules"]> : {}

export type GetMutationsInModules<MO extends ModulesImpl> = {
  [M in keyof MO]: DirectMutations<MO[M]>
}

export type ToDirectMutations<T extends MutationsImpl> = {
  [K in keyof T]: Parameters<T[K]>[1] extends undefined
  ? (() => ReturnType<T[K]>)
  : ((payload: Parameters<T[K]>[1]) => ReturnType<T[K]>)
}

// Actions

export type DirectActions<O extends StoreOptions> =
  (O["actions"] extends ActionsImpl ? ToDirectActions<O["actions"]> : {})
  & GetActionsInModulesOrEmpty<O>

export type GetActionsInModulesOrEmpty<O extends StoreOptions> =
  O["modules"] extends ModulesImpl ? GetActionsInModules<O["modules"]> : {}

export type GetActionsInModules<MO extends ModulesImpl> = {
  [M in keyof MO]: DirectActions<MO[M]>
}

export type ToDirectActions<T extends ActionsImpl> = {
  [K in keyof T]: Parameters<T[K]>[1] extends undefined
  ? (() => ReturnType<T[K]>)
  : ((payload: Parameters<T[K]>[1]) => ReturnType<T[K]>)
}
