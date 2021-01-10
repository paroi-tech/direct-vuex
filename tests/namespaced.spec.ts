import { createDirectStore } from "../src/direct-vuex"

describe("Namespaced Modules", () => {

  test("Access to namespaced action", async () => {
    const { store } = createDirectStore({
      actions: {
        a1: async (context, payload: { p1: string }) => payload.p1
      },
      modules: {
        mod1: {
          namespaced: true,
          actions: {
            a2: async (context, payload: { p2: number }) => payload.p2
          }
        }
      }
    })

    const p1: string = await store.dispatch.a1({ p1: "abc" })
    expect(p1).toBe("abc")

    const p2: number = await store.dispatch.mod1.a2({ p2: 123 })
    expect(p2).toBe(123)
  })

  test("Access to namespaced mutation", async () => {
    const { store } = createDirectStore({
      mutations: {
        mu1: (state, payload: { p1: string }) => { }
      },
      modules: {
        mod1: {
          namespaced: true,
          mutations: {
            mu2: (state, payload: { p2: number }) => { }
          }
        }
      }
    })

    store.commit.mu1({ p1: "abc" })
    store.commit.mod1.mu2({ p2: 123 })
  })

  test("Access to namespaced getter", async () => {
    const { store } = createDirectStore({
      getters: {
        g1: (state) => "abc"
      },
      modules: {
        mod1: {
          namespaced: true,
          getters: {
            g2: (state: any) => 123
          }
        }
      }
    })

    const g1: string = store.getters.g1
    expect(g1).toBe("abc")
    const g2: number = store.getters.mod1.g2
    expect(g2).toBe(123)
  })

  test("Access to namespaced getter with parameter", async () => {
    const { store } = createDirectStore({
      getters: {
        hello: state => (name: string) => `Hello, ${name}!`
      },
    })

    const g1: string = store.getters.hello("John")
    expect(g1).toBe("Hello, John!")
  })
})