# The base image needs to be ARM6 compatible
FROM node:slim
WORKDIR /opt/app
COPY package.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start" ]