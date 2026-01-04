# Frontend Dockerfile optimizado para producción
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivo .env si existe (Vite lo leerá automáticamente)
# También aceptar argumentos de build como fallback
COPY .env* ./

# Argumentos de build (usados si no hay .env)
# Valor por defecto para producción, se sobrescribe en desarrollo
ARG VITE_API_URL=https://backend-flores-mcsf.onrender.com/api
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación (Vite leerá automáticamente las variables VITE_* del .env)
RUN npm run build

# Stage de producción con nginx
FROM nginx:alpine

# Copiar build al nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorios necesarios
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run

# Nginx en Alpine ya corre como usuario no-root (nginx)
# No necesitamos cambiar usuario manualmente

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
