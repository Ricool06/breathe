Create the following env vars:
```
AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
```

To create the bucket & lock table for remote tfstate:
```
terraform workspace new state
terraform init bootstrap-state-bucket
terraform apply bootstrap-state-bucket
```

Set the __output variables__ from this as __env vars__
Then substitute the placeholders in the backend template file
```
envsubst < "backend.tf.template" > "backend.tf"
```

To create the s3 backend and migrate state files:
```
terraform workspace new production
terraform init
```

To deploy the system:
```
terraform apply deploy-system
```
