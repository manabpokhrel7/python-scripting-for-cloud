# CI/CD and GitOps

The platform uses Git-based deployment workflows.

Application source code and Kubernetes configuration are version controlled.

CI pipelines can build and test application changes and produce container images.

Argo CD provides GitOps-based Kubernetes deployment.

Argo CD watches the desired Kubernetes configuration stored in Git.

When the desired configuration changes, Argo CD synchronizes the Kubernetes cluster with the state defined in Git.

This separates CI responsibilities from Kubernetes deployment responsibilities.

A CI pipeline can build and publish an application image and update the desired image version in the GitOps repository.

Argo CD detects the Git change and performs the Kubernetes deployment.

This approach keeps Git as the source of truth for application deployment configuration.
