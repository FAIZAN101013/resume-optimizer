import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

/**
 * Runs the `api/` serverless functions during `npm run dev`.
 *
 * Vite only serves the client, so /api/* used to fall through to index.html
 * and every AI feature failed locally until you remembered `vercel dev`.
 * This mounts the same handlers on the dev server with a minimal shim of the
 * req/res shape Vercel provides.
 *
 * Dev only — in production Vercel runs these files itself.
 */
function apiRoutes() {
  return {
    name: 'jobz-api-dev',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const route = req.url.split('?')[0].replace(/^\/api\//, '')
        // Underscore-prefixed files are shared helpers, not routes — the same
        // rule Vercel applies.
        const file = path.resolve(__dirname, 'api', `${route}.js`)

        if (route.startsWith('_') || !fs.existsSync(file)) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: `No API route for /api/${route}` }))
        }

        try {
          const body = await readJsonBody(req)
          const mod = await server.ssrLoadModule(file)

          await mod.default(
            Object.assign(req, { body, query: {} }),
            createResponseShim(res),
          )
        } catch (err) {
          server.config.logger.error(`[api] /api/${route} failed: ${err.stack || err}`)

          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'API route threw.' }))
          }
        }
      })
    },
  }
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
      return resolve({})
    }

    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

/** The slice of the Vercel response API these handlers actually use. */
function createResponseShim(res) {
  const shim = {
    statusCode: 200,
    status(code) {
      shim.statusCode = code
      res.statusCode = code
      return shim
    },
    json(payload) {
      res.statusCode = shim.statusCode
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(payload))
      return shim
    },
    send(payload) {
      res.statusCode = shim.statusCode
      res.end(typeof payload === 'string' ? payload : JSON.stringify(payload))
      return shim
    },
    setHeader: (...args) => res.setHeader(...args),
    end: (...args) => res.end(...args),
  }
  return shim
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars, and only to the client. The API
  // handlers read process.env.GEMINI_API_KEY and friends, so load the rest
  // into process.env here.
  //
  // This runs in the Node config, never in the browser bundle. These values
  // are deliberately NOT passed to `define`, which would inline the secrets
  // into the client JavaScript.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith('VITE_') && !process.env[key]) process.env[key] = value
  }

  return {
    plugins: [react(), tailwindcss(), apiRoutes()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  }
})
