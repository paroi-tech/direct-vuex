# direct-vuex

Just Vuex with typing. Compatible with the Vue 3 composition API.

## How to use

### Install

First, add `direct-vuex` to a Vue application:

    npm install direct-vuex

### Create the store

The store is implemented almost in the same way as usual (ie. without typing). However, **it is necessary to append `as const` at the end of store and module implementation objects**. It will help direct-vuex to better infer types.

Create the store:

    import Vue from "vue"
    import Vuex from "vuex"
    import { createDirectStore } from "direct-vuex"

    Vue.use(Vuex)

    const store = createDirectStore({
      // … store implementation here …
    } as const)

    export default store
    export type AppStore = typeof store

    declare module "vuex" {
      interface Store<S> {
        direct: AppStore
      }
    }

The classic Vuex store is still accessible through the `store.original` property. We need it to initialize the Vue application:

    import Vue from "vue"
    import store from "./store"

    new Vue({
      store: store.original, // Inject the classic Vuex store
      // …
    }).$mount("#app")

### Use typed wrappers from outside the store

From a component, the direct store is accessible through the `direct` property of the classic store:

    const store = this.$store.direct

Or, you can just import it:

    import store from "./store"

Then, the old way to call an action:

    store.dispatch("myModule/myAction", myPayload)

… is replaced by the following wrapper:

    store.dispatch.myModule.myAction(myPayload)

… which is fully typed.

Typed getters and mutations are accessible the same way:

    store.getters.myModule.myGetter
    store.commit.myModule.myMutation(myPayload)

Notice: The underlying Vuex store can be used simultaneously if you wish, through the injected `this.$store` or `store.original`.

### Use typed wrappers from action implementations

In the file where the store is created, add this line:

    export const directActionContext = store.directActionContext;

Here is an example on how to do in a module:

    import { directActionContext } from "./store"
    const myModule = {
      actions: {
        async myAction(context, payload) {
          const { commit, state } = directActionContext(myModule, context)
          // … Here, 'commit' and 'state' are typed.
        }
      }
    }
    export default myModule

## Contribute

With VS Code, our recommanded plugin is:

- **TSLint** from Microsoft (`ms-vscode.vscode-typescript-tslint-plugin`)
