FROM node:20-slim
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN npx prisma generate
RUN yarn build
ENV PORT=8080
EXPOSE $PORT
CMD ["sh", "-c", "next start -p $PORT -H 0.0.0.0"]
