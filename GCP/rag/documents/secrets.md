# Secrets Management

Design goals
- Keep secrets out of container images and Git.
- Use Google Secret Manager as the central secrets store.
- Provide in-cluster access using short-lived identities via Workload Identity Federation (WIF).
- Synchronize secrets into Kubernetes as native `Secret` resources using External Secrets Operator.

Components
- Google Secret Manager: holds production secrets (DB passwords, API keys, TLS certs if desired).
- External Secrets Operator (ESO): in-cluster operator that fetches secrets from Google Secret Manager and creates/updates Kubernetes Secrets.
- Workload Identity Federation (WIF): map K8s ServiceAccount to a GCP Identity for secure, auditable access without long-lived keys.

Configuration pieces (repo pointers)
- `WIF.yml` — Ansible/manifest examples to set up Workload Identity Federation.
- Ansible playbooks or manifests should include the GCP project id and IAM bindings for the federated identity.

ServiceAccount → Google role mapping
- Create a K8s ServiceAccount (e.g., `external-secrets-sa`) and annotate it for WIF.
- Grant the federated identity minimum IAM permissions required to read secrets (roles/secretmanager.secretAccessor).
- ESO uses the mapped identity to call Secret Manager and populate Kubernetes Secrets.

ExternalSecret example
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: my-db-secret
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: gcp-secretstore
    kind: ClusterSecretStore
  target:
    name: my-db-secret
  data:
    - secretKey: password
      remoteRef:
        key: projects/<project>/secrets/db-password/versions/latest

Security best practices
- Give the ESO/federated identity the least privilege (only access to required secrets).
- Rotate secrets regularly in Secret Manager.
- Use Kubernetes RBAC to limit who can read `Secret` objects in-cluster.
- Consider using KMS-wrapped secrets in Secret Manager and role restrictions for higher assurance.

Operational notes
- Test WIF mapping and ESO access with a temporary ServiceAccount and a non-critical secret.
- Monitor ESO logs and Secret Manager audit logs for access anomalies.