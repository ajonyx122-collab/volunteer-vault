/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-leaflet's MapContainer isn't safe under Strict Mode's dev-only
  // double-invoked effects (throws "Map container is already initialized").
  // Strict Mode's checks only ever run in dev, so this doesn't change
  // production behavior.
  reactStrictMode: false,
}

export default nextConfig
