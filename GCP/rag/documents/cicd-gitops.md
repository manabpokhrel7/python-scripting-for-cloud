# CI/CD & GitOps

Principles
- CI produces artifacts (container images) and verifies code through tests/build steps.
- GitOps (Argo CD) keeps Kubernetes clusters in sync with Git — Git is the single source of truth for declarative cluster state.

CI pipeline (build & push)
- Build steps:
  - Unit tests and linters.
  - Build container images.
  - Push images to container registry (e.g., GCR, Artifact Registry).
  - Optionally update deployment manifests or image tags in a GitOps repo via automated commit.
- Useful artifacts:
  - Image name + tag
  - SBOM (software bill of materials)
  - Build logs

Argo CD (GitOps)
- Argo CD watches a Git repository or directory with Kubernetes manifests/Helm charts.
- When manifests change (e.g., updated image tag), Argo CD synchronizes the cluster to match the desired state.
- Example pattern:
  - CI builds image and opens/updates a PR in `manifests/` with the new image tag.
  - Argo CD detects the commit and applies the change.

Repository & automation pointers
- In Kubeadm repo:
  - `argocd/` directory (contains Argo CD app definitions).
  - `automation-setup.yml` and scripts for initial cluster app installs.
- Use GitHub Actions or other CI to run tests and build images; commit desired manifest updates to the GitOps repo.

Deployment flow example
1. Developer pushes feature branch.
2. CI runs, builds image `gcr.io/project/app:sha-xxxx`.
3. CI opens PR updating image tag in GitOps manifest.
4. After PR merge, Argo CD syncs the manifest and deploys the new image.

Secrets & credentials in CI
- CI should not store long-lived GCP SA keys. Use short-lived credentials or Workload Identity where possible.
- CI pipeline may authenticate to GCP via OIDC and exchange token for permissions to push images or interact with GCP APIs.

Rollbacks & policies
- Argo CD supports automated rollbacks and health checks; configure `syncPolicy` with automated pruning and self-heal as needed.
- Protect branches (e.g., `main`) and require PR reviews for GitOps repo changes.