output "gcp_artifact_registry" {
  value = google_artifact_registry_repository.python-repo.registry_uri
}

output "cloudrun_url" {
	value = google_cloud_run_v2_service.react.urls
}

output "cloudsql_connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "python_cloud_run_service_url" {
  value = google_cloud_run_v2_service.python.uri
}

output "load_balancer_ip" {
  value = google_compute_global_forwarding_rule.http.ip_address
}

output "redis_host" {
  value = google_redis_instance.cache.host
}

output "redis_port" {
  value = google_redis_instance.cache.port
}

# output "first_vm_public_ip" {
#   value = google_compute_instance.default["control1"].network_interface[0].access_config[0].nat_ip
# }
#
# output "second_vm_public_ip" {
#   value = google_compute_instance.default["control2"].network_interface[0].access_config[0].nat_ip
# }
output "vm_public_ip" {
  value = google_compute_instance.default.network_interface[0].access_config[0].nat_ip
}