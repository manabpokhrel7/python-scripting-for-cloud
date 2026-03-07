resource "google_compute_backend_service" "react_manab" {
  name                  = "react-manab"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.react_manab_neg.id
  }
}
resource "google_compute_backend_service" "python_backend" {
  name                  = "python-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.python_neg.id
  }
}