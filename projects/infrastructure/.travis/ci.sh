./.travis/install-terraform.sh
terraform init
terraform validate --check-variables=false deploy-system
