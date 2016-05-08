FROM nodesource/node:6

# Do 'npm run build' first

ENV NODE_ENV production

ADD package.json package.json
RUN npm install
ADD . .

CMD ["npm","start"]
