resource "google_compute_region_network_endpoint_group" "react_manab_neg" {
  name                  = "react-manab-neg"
  region                = "us-central1"
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.react.name
  }
}

resource "google_compute_region_network_endpoint_group" "python_neg" {
  name                  = "python-neg"
  region                = "us-central1"
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.python.name
  }
}