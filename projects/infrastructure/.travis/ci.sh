wget https://releases.hashicorp.com/terraform/0.11.11/terraform_0.11.11_linux_amd64.zip
unzip terraform_0.11.11_linux_amd64.zip
mv terraform /usr/local/bin
rm terraform && rm terraform_0.11.11_linux_amd64.zip
terraform init
terraform validate deploy-system
