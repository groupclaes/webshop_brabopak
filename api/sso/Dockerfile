# ---- Base ----
FROM alpine:3.15 AS base

# add nodejs, create group node, create user node, create folder to run app in and give exlusive rights to new node user
RUN apk add --no-cache --update nodejs curl tzdata && addgroup -S node && adduser -S node -G node && mkdir -p /usr/src/app && chown node:node /usr/src/app && rm -vrf /var/cache/apk/*

# set timezone to local time
ENV TZ=Europe/Brussels
# Set Node Environment to production (this will change the way yarn installs dependencies)
ENV NODE_ENV=production

# set working directory
WORKDIR /usr/src/app


# ---- Build ----
FROM base as build

# install yarn
RUN apk add --update yarn

# copy project file
COPY package.json ./src ./

# install node packages
RUN yarn

# copy project
COPY dist/index.min.js ./

# ---- Final ----
FROM base

# set current user to node
USER node

# change the working directory to new exclusive app folder
WORKDIR /usr/src/app

# copy production node_modules
COPY --chown=node:node --from=build /usr/src/app ./

# command to run when intantiate an image
CMD ["node","index.min.js"]