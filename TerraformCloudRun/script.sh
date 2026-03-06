#!/bin/bash
#gcrane copy manabpokhrel7/react-springboot:latest us-central1-docker.pkg.dev/thermal-camera-485502-u2/my-repository/react-springboot:latest
#gcrane copy manabpokhrel7/java-springboot:latest us-central1-docker.pkg.dev/thermal-camera-485502-u2/my-repository/java-springboot:latest
gcloud iam service-accounts keys create key.json --iam-account=aml-service-account@thermal-camera-485502-u2.iam.gserviceaccount.com
sleep 10
terraform apply --auto-approve