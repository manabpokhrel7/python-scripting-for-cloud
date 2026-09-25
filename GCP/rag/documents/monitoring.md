# Monitoring & Observability

Core stack
- Prometheus: metric collection and alerting.
- Grafana: dashboards for cluster and application metrics.
- Hubble: network flow observability (Cilium).
- Kubernetes probes: liveness/readiness for container health.

Recommended metrics to collect
- Kubernetes cluster:
  - kube-apiserver, scheduler, controller-manager latencies and error rates.
  - Node CPU, memory, disk I/O, network I/O.
- Ceph:
  - OSD utilization, network throughput, recovery rate, PG health.
- PostgreSQL:
  - connections, replication lag, queries per second, cache hit ratio, slow queries, WAL stats.
- AI workloads (Ollama/FastAPI):
  - request rate, error rate, 95/99th percentile latency, model load/unload events, memory usage, CPU/GPU utilization.
- RAG-specific:
  - embedding latency, retrieval latency, average similarity score, retrieved-chunk count per query.

Dashboards & alerts
- Create dashboards for:
  - Cluster overview (node/Pod health, resource usage).
  - Database dashboard (CloudNativePG metrics).
  - Storage (Rook Ceph health).
  - AI serving dashboard (inference latency, tokens/sec).
- Alerts:
  - Node disk pressure, Ceph degraded state, Postgres replication failure, high inference error rate, slow query spikes.

Instrumentation & tracing
- Instrument FastAPI endpoints with metrics (Prometheus client) and add tracing (OpenTelemetry) for distributed traces.
- Track RAG pipeline execution times (embedding creation, retrieval, generation).

Runbook examples
- High inference latency:
  - Check FastAPI & Ollama pod resource usage.
  - Verify disk IO for model loads (if models are loaded from PVC).
  - Check model concurrency limits and increase replicas if CPU/GPU limited.
- Ceph degraded:
  - kubectl -n rook-ceph get cephclusters
  - Exec into toolbox and run `ceph -s` to inspect OSD/PG states.

Data retention & storage
- Retain Prometheus metrics according to storage capacity; use remote_write if long-term storage needed.