
# Builds an image containing Node and the libraries necessary to run Puppeteer.
# (The bundled Chromium that Puppeteer installs is missing the necessary shared library dependencies).

# Taken from https://hub.docker.com/r/buildkite/puppeteer/dockerfile

# The version of Node should match that used in the backend Dockerfile.
# If you change this then update the version tag in cloudbuild.yaml.
FROM node:14.16.1

RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
    # && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
    # && chmod +x /usr/sbin/wait-for-it.sh
    # If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
    # uncomment the following lines to have `dumb-init` as PID 1
#     && https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init

# RUN chmod +x /usr/local/bin/dumb-init

# ENTRYPOINT ["dumb-init", "--"]
