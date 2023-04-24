FROM node:19
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

ARG ENV
# https://www.reddit.com/r/docker/comments/hn3e1o/conditional_statement_with_arg_in_dockerfile/
ENV ENV ${ENV}
CMD if [ "$ENV" = "production" ] ; then npm run start ; else npm run dev ; fi