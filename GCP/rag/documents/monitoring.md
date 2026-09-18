# Monitoring and Observability

Prometheus and Grafana provide monitoring for the Kubernetes platform.

Prometheus collects metrics from Kubernetes and platform components.

Grafana is used to visualize metrics through dashboards.

Hubble provides network observability for Cilium.

Kubernetes liveness probes are used to determine whether containers are healthy.

Kubernetes readiness probes determine whether containers are ready to receive traffic.

The Ollama deployment exposes HTTP port 11434 and uses health probes against the Ollama HTTP server.

Monitoring can later be extended for AI workloads.

Useful AI serving metrics include inference latency, request rate, errors, CPU usage, GPU utilization, memory usage, model loading time, and tokens generated per second.

RAG monitoring can additionally measure retrieval quality and whether relevant document chunks are being returned.
