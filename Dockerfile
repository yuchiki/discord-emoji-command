FROM oven/bun:1
WORKDIR /work
COPY package.json .
COPY bun.lock .
COPY src/index.ts src/wikipedia.ts src/
RUN bun install --frozen-lockfile

ENTRYPOINT ["bun", "run"]
CMD ["src/index.ts"]
