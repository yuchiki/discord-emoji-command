FROM oven/bun:1
WORKDIR /work
RUN apt-get update && apt-get install -y fonts-noto-cjk && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY fonts/ fonts/
COPY src/ src/
ENV FONTCONFIG_FILE=/work/fonts/fonts.conf

ENTRYPOINT ["bun", "run"]
CMD ["src/index.ts"]
