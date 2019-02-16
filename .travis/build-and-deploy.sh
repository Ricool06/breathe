# Install requirements
source ~/.nvm/nvm.sh
nvm install node

# Run builds
(cd projects/web-ui && ./.travis/build.sh)

# Deploy
(cd projects/infrastructure && ./.travis/deploy.sh)
