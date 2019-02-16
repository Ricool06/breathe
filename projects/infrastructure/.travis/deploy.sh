./.travis/install-terraform.sh
terraform init -force-copy
terraform workspace select production
terraform apply -auto-approve deploy-system
