FROM node:10.15

# Create Directory for the Container
WORKDIR /usr/src/app

# Only copy the package.json and yarn.lock to work directory
COPY package.json .
COPY yarn.lock .
# Install all Packages
RUN yarn install

# Copy all other source code to work directory
ADD . /usr/src/app

EXPOSE 9000

# need to build at runtime because config.ts might be replaced/mounted
CMD yarn build && yarn server
