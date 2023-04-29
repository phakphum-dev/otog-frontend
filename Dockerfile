FROM node:16-alpine AS base
RUN npm i -g pnpm
WORKDIR /build

# Prepare for installing dependencies
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base as build
# Copy the rest files
COPY . .
# Build application
RUN pnpm build

FROM base as prod-deps
# Prune unused dependencies
RUN npm prune --production

FROM node:16-alpine AS production
ENV NODE_ENV production
WORKDIR /app
# Copy only necessary file for running app
COPY --from=prod-deps /build/package.json ./package.json
COPY --from=prod-deps /build/node_modules ./node_modules
COPY --from=build /build/.next ./.next
COPY --from=build /build/public ./public
COPY --from=build /build/next.config.js ./next.config.js
COPY --from=build /build/.env.local ./.env.local
COPY --from=build /build/.env.production ./.env.production
# Expose listening port
EXPOSE 3000

# Start script
CMD pnpm start