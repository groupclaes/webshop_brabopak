# ---- Build ----
FROM groupclaes/yarn AS build

# set current user to node
USER node

# change the working directory to new exclusive app folder
WORKDIR /usr/src/app

# copy package file
COPY package.json ./

# install node packages
RUN yarn

# copy project
COPY dist/index.min.js ./

# from base image node
FROM groupclaes/node AS release

# set current user to node
USER node

# change the working directory to new exclusive app folder
WORKDIR /usr/src/app

# copy file from build
COPY --from=build /usr/src/app ./

# command to run when intantiate an image
CMD ["node","index.min.js"]