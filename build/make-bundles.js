const { existsSync } = require("fs")
const { readFile, writeFile, mkdir } = require("fs").promises
const { join, resolve } = require("path")
const terser = require("terser")

const packagePath = resolve(__dirname, "..")
const compiledEsmPath = join(__dirname, "compiled-esm")
const compiledUmdPath = join(__dirname, "compiled-umd")
const distNpmPath = join(packagePath, "dist")

async function build() {
  if (!existsSync(distNpmPath))
    await mkdir(distNpmPath)
  await buildMainFile(join(compiledEsmPath, "direct-vuex.js"), "direct-vuex.esm")
  await buildMainFile(join(compiledUmdPath, "direct-vuex.js"), "direct-vuex.umd")
}

async function buildMainFile(mainFile, bundleName) {
  const bundleCode = await readFile(mainFile, "utf-8")
  const minified = terser.minify({
    bundle: bundleCode
  })
  if (minified.error)
    throw minified.error

  await writeFile(join(distNpmPath, `${bundleName}.min.js`), minified.code)
  await writeFile(join(distNpmPath, `${bundleName}.js`), bundleCode)
}

build().catch(err => console.log(err.message, err.stack))
