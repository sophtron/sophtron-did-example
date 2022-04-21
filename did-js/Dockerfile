FROM node:14

# Create app directory
WORKDIR /app

COPY ./application ./
#COPY ./dist ./views

RUN npm install
#COPY --from=build-frontend /app/dist ./views

ENV Env prod

EXPOSE 8080
CMD node ./server.js