resource "google_redis_instance" "cache" {
  name               = "python-cache"
  tier               = "BASIC"
  memory_size_gb     = 1
  region             = "us-central1"
  redis_version      = "REDIS_7_0"
  authorized_network = "projects/my-personal-terraform/global/networks/default"
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  reserved_ip_range  = google_compute_global_address.private_service_range.name
  display_name       = "python-cache"

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_compute_global_address" "private_service_range" {
  name          = "google-managed-services-default"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = "projects/my-personal-terraform/global/networks/default"
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = "projects/my-personal-terraform/global/networks/default"
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_range.name]
}

resource "google_project_service" "compute_api" {
  service = "compute.googleapis.com"
}

resource "google_project_service" "service_networking_api" {
  service = "servicenetworking.googleapis.com"
}