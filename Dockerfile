#############
### build ###
#############

# base image
FROM groupclaes/npm:latest AS build
USER root

# set working directory
WORKDIR /app

# install and cache app dependencies
COPY package.json /app/package.json
COPY .npmrc /app/.npmrc

ENV NODE_ENV=test
RUN npm install --ignore-scripts -g @angular/cli && npm install --ignore-scripts --legacy-peer-deps

# copy required files for build
COPY ./src /app/src
# COPY server.ts /app/server.ts
COPY angular.json /app/angular.json
COPY tsconfig.json /app/tsconfig.json
COPY tsconfig.app.json /app/tsconfig.app.json
COPY tailwind.config.js /app/tailwind.config.js
COPY ngsw-config.json /app/ngsw-config.json
COPY capitalize.d.ts /app/capitalize.d.ts

RUN ng build --configuration production --output-path=dist
COPY nginx.conf /app/nginx.conf

############
### prod ###
############

# base image
FROM groupclaes/nginx:latest

#remove all content form html
RUN rm -rf /usr/share/nginx/html/*

USER nginx

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80
