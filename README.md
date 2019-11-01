# direct-vuex

[![Build Status](https://travis-ci.com/paleo/direct-vuex.svg?branch=master)](https://travis-ci.com/paleo/direct-vuex)
[![dependencies Status](https://david-dm.org/paleo/direct-vuex/status.svg)](https://david-dm.org/paleo/direct-vuex)
[![codebeat badge](https://codebeat.co/badges/17e153d2-1fca-470e-8ef2-e444827a5729)](https://codebeat.co/projects/github-com-paleo-direct-vuex-master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c62abca7334941b5ac75e713cd60a0a4)](https://www.codacy.com/manual/paleo/direct-vuex?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=paleo/direct-vuex&amp;utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/dm/direct-vuex)](https://www.npmjs.com/package/direct-vuex)
![npm type definitions](https://img.shields.io/npm/types/direct-vuex)
![GitHub](https://img.shields.io/github/license/paleo/direct-vuex)

Use and implement your Vuex store with TypeScript types. Direct-vuex doesn't require classes, therefore it is compatible with the Vue 3 composition API.

## How to use

### Install

First, add `direct-vuex` to a Vue application:

```sh
npm install direct-vuex
```

### Create the store

The store can be implemented almost in the same way as usual. However, **it is necessary to append `as const` at the end of store and module implementation objects**. It will allow direct-vuex to correctly infer types.

Create the store:

```ts
import Vue from "vue"
import Vuex from "vuex"
import { createDirectStore } from "direct-vuex"

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
  // … store implementation here …
} as const)

// Export the direct-store instead of the classic Vuex store.
export default store

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext }

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store
declare module "vuex" {
  interface Store<S> {
    direct: AppStore
  }
}
```

The classic Vuex store is still accessible through the `store.original` property. We need it to initialize the Vue application:

```ts
import Vue from "vue"
import store from "./store"

new Vue({
  store: store.original, // Inject the classic Vuex store.
  // …
}).$mount("#app")
```

### Use typed wrappers from outside the store

From a component, the direct store is accessible through the `direct` property of the classic store:

```ts
const store = context.root.$store.direct // or: this.$store.direct
```

Or, you can just import it:

```ts
import store from "./store"
```

Then, the old way to call an action:

```ts
store.dispatch("myModule/myAction", myPayload)
```

… is replaced by the following wrapper:

```ts
store.dispatch.myModule.myAction(myPayload)
```

… which is fully typed.

Typed getters and mutations are accessible the same way:

```ts
store.getters.myModule.myGetter
store.commit.myModule.myMutation(myPayload)
```

Notice: The underlying Vuex store can be used simultaneously if you wish, through the injected `$store` or `store.original`.

### Use typed wrappers in implementation of actions

Here is an example on how to do in a Vuex module:

```ts
import { moduleActionContext } from "./store"
const myModule = {
  actions: {
    async myAction(context, payload) {
      const { commit, state } = myModuleActionContext(context)
      // … Here, 'commit' and 'state' are typed.
    }
  }
} as const
export default myModule
export const myModuleActionContext = context => moduleActionContext(context, myModule)
```

And the same example, but in the root store:

```ts
  actions: {
    async myAction(context, payload) {
      const { commit, state } = rootActionContext(context)
      // … Here, 'commit' and 'state' are typed.
    }
  }
```

Warning: Types in the context of actions implies that TypeScript should never infer the return type of an action from the context of the action. Indeed, this kind of typing would be recursive, since the context includes the return value of the action. When this happens, TypeScript passes the whole context to `any`. _Tl;dr; Declare the return type of actions where it exists!_

## Contribute

With VS Code, our recommanded plugin is:

* **TSLint** from Microsoft (`ms-vscode.vscode-typescript-tslint-plugin`)
