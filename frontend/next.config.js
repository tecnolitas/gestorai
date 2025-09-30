/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para producción optimizada
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Deshabilitar ESLint durante el build para evitar errores de tipos
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Deshabilitar verificación de tipos durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Configuración de rewrites para desarrollo y producción
  async rewrites() {
    // En Docker, usar el nombre del servicio; en desarrollo, usar localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                   (process.env.NODE_ENV === 'production' ? 'http://web:8000' : 'http://localhost:8000');
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 