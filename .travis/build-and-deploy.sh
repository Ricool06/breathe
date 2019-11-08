# Install requirements
source ~/.nvm/nvm.sh
nvm install 11.13.0

# Run builds
(cd projects/web-ui && ./.travis/build.sh)
# (cd projects/prediction-api && ./.travis/build.sh)

# Deploy
(cd projects/infrastructure && ./.travis/deploy.sh)
