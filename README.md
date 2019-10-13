# direct-vuex

Just Vuex with typing.

## How to use

### Install

First, add `direct-vuex` to the Vue application:

    npm install direct-vuex

### Create the store

The store is implemented in the same way as usual. But it is necessary to add `as const` on the module options:

    export default {
      namespaced: true,
      // …
    } as const

Then, create the store:

    import Vue from "vue"
    import Vuex from "vuex"
    import { createDirectStore } from "direct-vuex"

    Vue.use(Vuex)

    export default createDirectStore({
      // … store options here …
    } as const)

The classic Vuex store is still accessible through the `store.original` property. We need it to initialize the Vue application:

    import Vue from "vue"
    import store from "./store"

    new Vue({
      store: store.original, // Inject the classic Vuex store
      // …
    }).$mount("#app")

### Use the direct store from Vue components

From a component, import the store.

    import store from "./store"

Then, the old way to call an action:

    store.dispatch("myModule/myAction", myPayload)

… is replaced by the following wrapper:

    store.dispatch.myModule.myAction(myPayload)

… which is fully typed.

Typed getters and mutations are accessible the same way:

    store.getters.myModule.myGetter;
    store.commit.myModule.myMutation(myPayload);

Notice: The underlying Vuex store wan be simultaneously used if you wish, through the injected `this.$store` or `store.original`.

## Limitations

- Modules must be namespaced;
- Actions can't be declared with the object alternative syntax.

## Contribute

With VS Code, our recommanded plugins are:

- **Todo Tree** from Gruntfuggly (`gruntfuggly.todo-tree`)
- **TSLint** from Microsoft (`ms-vscode.vscode-typescript-tslint-plugin`)
