import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
process.chdir(projectRoot)

// Translate the vite-style flags launch.json passes (--port N --strictPort,
// optionally a leading "preview") into next's CLI flags (-p N), then run
// next directly — keeps launch.json's configurations working unchanged
// after the Vite -> Next.js migration.
const args = process.argv.slice(2)
const isPreview = args[0] === 'preview'
const rest = isPreview ? args.slice(1) : args
const portIndex = rest.indexOf('--port')
const port = portIndex !== -1 ? rest[portIndex + 1] : null

process.argv = [
  process.argv[0],
  process.argv[1],
  isPreview ? 'start' : 'dev',
  ...(port ? ['-p', port] : []),
]

await import(pathToFileURL(path.join(projectRoot, 'node_modules/next/dist/bin/next')))
