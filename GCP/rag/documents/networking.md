# Kubernetes Networking

Cilium is used as the Container Network Interface for the Kubernetes cluster.

Cilium provides networking between Kubernetes workloads.

Hubble provides network observability for Cilium.

Envoy Gateway is used for HTTP and HTTPS application routing.

Applications expose Kubernetes Services internally.

Envoy Gateway routes external application traffic to the appropriate Kubernetes Services.

A Google Cloud regional TCP load balancer forwards external traffic to Kubernetes worker nodes.

External HTTP and HTTPS traffic reaches the worker nodes and is then handled by Envoy Gateway.

TLS certificates are managed using cert-manager.

Applications can communicate internally using Kubernetes DNS and ClusterIP Services.

For example, the FastAPI backend communicates with Ollama through the internal service address:

http://ollama.ollama.svc.cluster.local:11434

This allows FastAPI to access Ollama without exposing Ollama directly to the public internet.
