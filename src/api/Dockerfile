FROM node:10-alpine
WORKDIR /app
COPY ../../../dist/api .
RUN npm install
EXPOSE 80
CMD [ "npm start" ]