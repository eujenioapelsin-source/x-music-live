FROM node:20.19.0-slim
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --ignore-engines
COPY . .
RUN npx prisma generate
RUN yarn build
EXPOSE 8080
CMD ["sh", "-c", "yarn start -p 8080 -H 0.0.0.0"]
