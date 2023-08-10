#############
### build ###
#############

# base image
FROM docker-registry.groupclaes.be/node-npm:latest AS build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
ENV NODE_ENV test
RUN npm install --ignore-scripts --legacy-peer-deps
ENV NODE_ENV production

# add app
COPY ./src /app/src
# COPY server.ts /app/server.ts
COPY angular.json /app/angular.json
COPY tsconfig.json /app/tsconfig.json
COPY tsconfig.app.json /app/tsconfig.app.json
COPY tailwind.config.js /app/tailwind.config.js

# run tests
# RUN ng test --watch=false
# RUN ng e2e --port 4202

# generate build
# RUN ng build --configuration production --output-path=dist
RUN ng build --configuration staging --output-path=dist
# RUN ng build --output-path=dist

COPY nginx.conf /app/nginx.conf

############
### prod ###
############

# base image
FROM docker-registry.groupclaes.be/nginx:latest
USER nginx

#remove all content form html
RUN rm -rf /usr/share/nginx/html/*

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80