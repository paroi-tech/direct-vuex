import { ActionContext, Store } from "vuex"
import { ActionsImpl, GettersImpl, ModuleOptions, ModulesImpl, MutationsImpl, StoreOptions, StoreOrModuleOptions } from "./index"

export interface CreatedStore<R extends StoreOptions> {
  store: ToDirectStore<R>

  rootGetterContext(args: [any, any]): DirectGetterContext<R, R>
  moduleGetterContext<O extends ModuleOptions>(
    args: [any, any, any, any], module: O
  ): DirectGetterContext<R, O>

  rootActionContext(originalContext: ActionContext<any, any>): DirectActionContext<R, R>
  moduleActionContext<O extends ModuleOptions>(
    originalContext: ActionContext<any, any>,
    module: O
  ): DirectActionContext<R, O>
}

export type ToDirectStore<O extends StoreOptions> = ShowContent<{
  readonly state: ShowContent<DirectState<O>>
  getters: ShowContent<DirectGetters<O>>
  commit: ShowContent<DirectMutations<O>>
  dispatch: ShowContent<DirectActions<O>>
  original: VuexStore<O>
}>

export type VuexStore<O extends StoreOptions> = Store<ShowContent<DirectState<O>>> & {
  direct: ToDirectStore<O>
}

// State

type DirectState<O extends StoreOrModuleOptions> =
  ToStateObj<O["state"]>
  & GetStateInModules<OrEmpty<O["modules"]>>

type GetStateInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectState<I[M]>
}

type ToStateObj<T> = T extends (() => any) ? ReturnType<T> : T

// Getters

// export type SelfGetters<T> = ToDirectGetters<OrEmpty<T>>

type DirectGetters<O extends StoreOrModuleOptions> =
  ToDirectGetters<OrEmpty<O["getters"]>>
  & GetGettersInModules<FilterNamespaced<OrEmpty<O["modules"]>>>
  & MergeGettersFromModules<FilterNotNamespaced<OrEmpty<O["modules"]>>>

type GetGettersInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectGetters<I[M]>
}

type ToDirectGetters<T extends GettersImpl> = {
  [K in keyof T]: ReturnType<T[K]>
}

type MergeGettersFromModules<I extends ModulesImpl> =
  UnionToIntersection<ToDirectGetters<OrEmpty<I[keyof I]["getters"]>>>

// Mutations

type DirectMutations<O extends StoreOrModuleOptions> =
  ToDirectMutations<OrEmpty<O["mutations"]>>
  & GetMutationsInModules<FilterNamespaced<OrEmpty<O["modules"]>>>
  & MergeMutationsFromModules<FilterNotNamespaced<OrEmpty<O["modules"]>>>

type GetMutationsInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectMutations<I[M]>
}

type ToDirectMutations<T extends MutationsImpl> = {
  [K in keyof T]: Parameters<T[K]>[1] extends undefined
  ? (() => void)
  : ((payload: Parameters<T[K]>[1]) => void)
}

type MergeMutationsFromModules<I extends ModulesImpl> =
  UnionToIntersection<ToDirectMutations<OrEmpty<I[keyof I]["mutations"]>>>

// Actions

type DirectActions<O extends StoreOrModuleOptions> =
  ToDirectActions<OrEmpty<O["actions"]>>
  & GetActionsInModules<FilterNamespaced<OrEmpty<O["modules"]>>>
  & MergeActionsFromModules<FilterNotNamespaced<OrEmpty<O["modules"]>>>

type GetActionsInModules<I extends ModulesImpl> = {
  [M in keyof I]: DirectActions<I[M]>
}

type ToDirectActions<T extends ActionsImpl> = {
  [K in keyof T]: Parameters<T[K]>[1] extends undefined
  ? (() => PromiseOf<ReturnType<T[K]>>)
  : ((payload: Parameters<T[K]>[1]) => PromiseOf<ReturnType<T[K]>>)
}

type MergeActionsFromModules<I extends ModulesImpl> =
  UnionToIntersection<ToDirectActions<OrEmpty<I[keyof I]["actions"]>>>

// ActionContext

export type DirectActionContext<R, O> = ShowContent<{
  rootState: DirectState<R>
  rootGetters: DirectGetters<R>
  rootCommit: DirectMutations<R>
  rootDispatch: DirectActions<R>
  state: DirectState<O>
  getters: DirectGetters<O>
  commit: DirectMutations<O>
  dispatch: DirectActions<O>
}>

export type DirectGetterContext<R, O> = ShowContent<{
  rootState: DirectState<R>
  rootGetters: DirectGetters<R>
  state: DirectState<O>
  getters: DirectGetters<O>
}>

// Common helpers

type PromiseOf<T> = T extends Promise<any> ? T : Promise<T>

type FilterNamespaced<I extends ModulesImpl> = Pick<I, KeyOfType<I, { namespaced: true }>>
type KeyOfType<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T]

type FilterNotNamespaced<I extends ModulesImpl> = Pick<I, NotKeyOfType<I, { namespaced: true }>>
type NotKeyOfType<T, U> = { [P in keyof T]: T[P] extends U ? never : P }[keyof T]

type OrEmpty<T> = T extends {} ? T : {}

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type ShowContent<T> =
  T extends Function ? T :
  T extends object ?
  T extends infer O ? { [K in keyof O]: ShowContentDepth1<O[K]> } : never
  : T

type ShowContentDepth1<T> =
  T extends Function ? T :
  T extends object ?
  T extends infer O ? { [K in keyof O]: O[K] } : never
  : T
