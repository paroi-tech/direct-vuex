import Vue from "vue"
import Vuex from "vuex"
import { createDirectStore } from "../src/direct-vuex"

Vue.use(Vuex)

describe("Non-Namespaced Modules", () => {

  test("Merge module action in the root store", async () => {
    const { store } = createDirectStore({
      actions: {
        a1: async (context: any, payload: { p1: string }) => payload.p1
      },
      modules: {
        mod1: {
          namespaced: false,
          actions: {
            a2: async (context: any, payload: { p2: number }) => payload.p2
          }
        }
      }
    } as const)

    const p1: string = await store.dispatch.a1({ p1: "abc" })
    expect(p1).toBe("abc")

    const p2: number = await store.dispatch.a2({ p2: 123 })
    expect(p2).toBe(123)
  })

  test("Merge module action: omit the 'namespaced' property", async () => {
    const { store } = createDirectStore({
      actions: {
        a1: async (context: any, payload: { p1: string }) => payload.p1
      },
      modules: {
        mod1: {
          actions: {
            a2: async (context: any, payload: { p2: number }) => payload.p2
          }
        }
      }
    } as const)

    const p1: string = await store.dispatch.a1({ p1: "abc" })
    expect(p1).toBe("abc")

    const p2: number = await store.dispatch.a2({ p2: 123 })
    expect(p2).toBe(123)
  })

  test("Merge module mutation in the root store", async () => {
    const { store } = createDirectStore({
      mutations: {
        mu1: (state: any, payload: { p1: string }) => { }
      },
      modules: {
        mod1: {
          namespaced: false,
          mutations: {
            mu2: (state: any, payload: { p2: number }) => { }
          }
        }
      }
    } as const)

    store.commit.mu1({ p1: "abc" })
    store.commit.mu2({ p2: 123 })
  })

  test("Merge module getter in the root store", async () => {
    const { store } = createDirectStore({
      getters: {
        g1: (state: any) => "abc"
      },
      modules: {
        mod1: {
          namespaced: false,
          getters: {
            g2: (state: any) => 123
          }
        }
      }
    } as const)

    const g1: string = store.getters.g1
    expect(g1).toBe("abc")
    const g2: number = store.getters.g2
    expect(g2).toBe(123)
  })
})