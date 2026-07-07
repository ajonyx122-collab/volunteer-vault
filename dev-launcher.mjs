import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
process.chdir(projectRoot)
await import(pathToFileURL(path.join(projectRoot, 'node_modules/vite/bin/vite.js')))
