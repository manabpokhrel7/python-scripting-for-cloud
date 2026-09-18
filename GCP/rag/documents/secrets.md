# Secrets Management

The platform uses Google Secret Manager for storing sensitive application secrets.

Secrets are synchronized into Kubernetes using External Secrets Operator.

The platform uses Google Cloud Workload Identity Federation rather than storing long-lived Google Cloud service account keys inside Kubernetes.

A Workload Identity Federation pool and provider establish trust between Google Cloud IAM and identities issued by the Kubernetes cluster.

The provider validates Kubernetes-issued identity tokens.

A Kubernetes ServiceAccount is used by External Secrets Operator to authenticate.

Google Cloud IAM grants the required Secret Manager permissions to the federated identity.

External Secrets Operator retrieves authorized secrets from Google Secret Manager and creates or updates Kubernetes Secrets.

Applications consume the resulting Kubernetes Secrets.

This design avoids storing permanent Google Cloud credentials directly inside application containers.
