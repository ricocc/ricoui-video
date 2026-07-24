# Coolify builds this image. Debian (bookworm) — NOT Alpine — because Remotion's
# headless Chromium needs glibc. Single stage; the Chrome Headless Shell and the
# pre-bundled Remotion serveUrl are baked in so renders start fast at boot.
FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    PORT=3000

# Chromium runtime libraries + base fonts needed by @remotion/renderer.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libcups2 \
      libdbus-1-3 \
      libdrm2 \
      libgbm1 \
      libgtk-3-0 \
      libnss3 \
      libpango-1.0-0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxkbcommon0 \
      libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

# pnpm (the repo's package manager) — activated via corepack, which ships with Node.
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Install deps first for better layer caching. Requires pnpm-lock.yaml to match
# package.json — run `pnpm install` locally after dependency changes and commit
# the updated lockfile before building.
# --prod=false: NODE_ENV=production is set above, but the build needs devDeps.
# --ignore-scripts: source isn't copied yet; dep build scripts run in `pnpm rebuild`
# below and the root postinstall (fumadocs-mdx) needs source.config.ts.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts

# App source + build.
COPY . .
RUN pnpm rebuild && pnpm run postinstall
RUN pnpm run build

# Bake the Chrome Headless Shell into the image (no slow runtime download).
# Uses @remotion/renderer's ensureBrowser() — the `remotion` pkg has no CLI bin
# (that's @remotion/cli, which we don't install), so `npx remotion ...` fails.
RUN pnpm run remotion:browser

# Pre-bundle the Remotion entry → .remotion-bundle/ (serveUrl ready at boot).
RUN pnpm run bundle:remotion

EXPOSE 3000

# next start (matches `pnpm run start` in package.json).
CMD ["pnpm", "run", "start"]
