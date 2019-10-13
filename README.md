# direct-vuex

Just Vuex with typing.

## How to use

### Install

First, install `direct-vuex`:

    npm install vue vuex direct-vuex

### Create the store

Then, create the store:

    import Vue from "vue"
    import Vuex from "vuex"
    import { createDirectStore } from "direct-vuex"

    Vue.use(Vuex)

    export default createDirectStore({
      // … store options here …
    } as const)

The original Vuex store is still accessible through `store.original`:

    import Vue from "vue"
    import store from "./store"

    new Vue({
      // …
      store: store.original,
      // …
    }).$mount("#app")

### Use the direct store

From a component, import the store.

    import store from "./store"

Then, the following line:

    store.dispatch.myModule.myAction(myPayload)

… replaces the old one:

    store.dispatch("myModule/myAction", myPayload)

Notice: It is still possible to use the injected `this.$store`, which is the original Vuex store.

## Limitations

- Modules must be namespaced;
- Actions must return a `Promise`;
- Actions can't be declared with the object alternative syntax.

## Contribute

With VS Code, our recommanded plugins are:

- **Todo Tree** from Gruntfuggly (`gruntfuggly.todo-tree`)
- **TSLint** from Microsoft (`ms-vscode.vscode-typescript-tslint-plugin`)
