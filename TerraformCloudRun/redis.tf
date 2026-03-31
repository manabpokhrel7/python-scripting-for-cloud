resource "google_redis_instance" "cache" {
  name               = "python-cache"
  tier               = "BASIC"
  memory_size_gb     = 1
  region             = "us-central1"
  redis_version      = "REDIS_7_0"
  authorized_network = "projects/my-personal-terraform/global/networks/default"
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  display_name       = "python-cache"
}

resource "google_vpc_access_connector" "connector" {
  name          = "run-to-redis"
  region        = "us-central1"
  network       = "default"
  ip_cidr_range = "10.8.0.0/28"
}