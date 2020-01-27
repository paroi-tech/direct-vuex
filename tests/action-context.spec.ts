import Vue from "vue"
import Vuex from "vuex"
import { defineDirectStore, defineModule } from "../src/direct-vuex"

Vue.use(Vuex)

describe("Action Contexts", () => {

  test("Use 'dispatch' and 'rootDispatch' from action implementation", async () => {
    const mod1 = defineModule({
      namespaced: true,
      actions: {
        async a2(context: any, payload: { p2: number }) {
          const { dispatch, rootDispatch } = mod1ActionContext(context)

          const p3: number = await dispatch.a3({ p3: 123 })
          expect(p3).toBe(123)

          const p3bis: number = await rootDispatch.mod1.a3({ p3: 123 })
          expect(p3bis).toBe(123)
        },
        async a3(context: any, payload: { p3: number }) {
          return payload.p3
        }
      }
    })
    const mod1ActionContext = (context: any) => moduleActionContext(context, mod1)

    const { store, rootActionContext, moduleActionContext } = defineDirectStore({
      actions: {
        async a1(context: any, payload: { p1: string }) {
          const { dispatch, rootDispatch } = rootActionContext(context)

          expect(dispatch.a1).toBeDefined()
          expect(rootDispatch.a1).toBeDefined()

          return payload.p1
        }
      },
      modules: {
        mod1
      }
    })

    await store.dispatch.a1({ p1: "abc" })
    await store.dispatch.mod1.a2({ p2: 123 })
  })
})