./.travis/install-terraform.sh
terraform workspace select production
terraform apply -auto-approve deploy-system
