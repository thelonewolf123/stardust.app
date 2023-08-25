FROM node:16-alpine

ARG GITHUB_TOKEN
ARG BRANCH

ENV NODE_ENV=development

WORKDIR /app
RUN apk add --no-cache git
RUN git clone -b $BRANCH https://oauth:$GITHUB_TOKEN@github.com/thelonewolf123/soul-forge /app
RUN yarn install --frozen-lockfile
RUN yarn build

ENV NODE_ENV=production

CMD [ "node", "dist/backend.bundle.js" ]
