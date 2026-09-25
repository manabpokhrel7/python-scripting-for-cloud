# Kubernetes Networking & Ingress

CNI and network observability
- Primary CNI: Cilium — provides pod networking, network policies, and eBPF acceleration.
- Observability: Hubble (Cilium component) provides traffic visibility and L3/L4 flow metrics.

Ingress & Gateway
- Envoy Gateway (control plane for Envoy) used for HTTP/HTTPS routing inside the cluster.
- External traffic flow:
  1. External user → Google Cloud regional TCP Load Balancer
  2. Load balancer forwards to worker node(s) on nodePort (80/443)
  3. Nginx (node-level listener) or Envoy handles host ports → Envoy Gateway routes to Kubernetes Services (ClusterIP)
- TLS: cert-manager manages TLS certificates for Envoy Gateway.

Important manifests and scripts
- cilium-config.yml — config for the Cilium agent and Gateway API/Envoy integration.
- nginx is used as a node-level listener in front of Envoy when the Load Balancer is expected to use host ports 80/443.

Network security
- Use Kubernetes NetworkPolicies via Cilium to restrict traffic between namespaces and workloads.
- Leverage eBPF-based policy enforcement to minimize packet processing overhead.
- Hubble allows rapid investigation of denied or unexpected flows.

Load balancer types & roles
- `tcp_loadbalancer` (internal): connects worker nodes to control-plane backend or internal services.
- `loadbalancer` (external): regional TCP load balancer that presents public endpoints and routes traffic to worker nodes.

DNS & service discovery
- Pods and Services use Kubernetes DNS (ClusterIP) for intra-cluster communication. Example:
  - FastAPI → Ollama via `http://ollama.ollama.svc.cluster.local:11434`

Troubleshooting tips
- If traffic doesn’t flow externally:
  - Verify GCE LB health checks against nodePort endpoints.
  - Ensure nginx/Envoy is listening on expected ports on the nodes.
  - Check Cilium & Hubble logs for dropped packets or misapplied NetworkPolicies.
- Common commands:
  - kubectl -n kube-system get pods -l k8s-app=cilium
  - kubectl -n {ns} get services,ingress
  - hubble observe --last 1m (if Hubble CLI available)