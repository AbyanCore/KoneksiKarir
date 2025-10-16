# stage 1
FROM node:20-alpine3.19 AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate

RUN npm run build

# copy static files to standlone build folder
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/
# copy public files to standlone build folder
RUN mkdir -p .next/standalone/public && \
    cp -r public/* .next/standalone/public/

# stage 2
FROM node:20-alpine3.19 AS PRODUCTION

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/.next/standalone ./

EXPOSE 3000

CMD ["node", "server.js"]