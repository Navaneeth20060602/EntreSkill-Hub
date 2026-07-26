# Builds and runs the EntreSkill Hub API (server/).
# The client is a static Vite build, meant to be deployed separately
# (Vercel/Netlify) - see docs/DEPLOYMENT.md.

FROM node:20-alpine AS base
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
