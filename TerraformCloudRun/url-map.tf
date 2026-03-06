resource "google_compute_url_map" "main" {
  name = "cloudrun-url-map"

  default_service = google_compute_backend_service.react_backend.id

  host_rule {
    hosts        = ["cloud.manabpokhrel.com.np"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.react_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.python_backend.id
    }
  }
}

resource "google_compute_managed_ssl_certificate" "app_cert" {
  name = "app-managed-cert"

  managed {
    domains = ["cloud.manabpokhrel.com.np"]
  }
}

resource "google_compute_target_https_proxy" "https" {
  name             = "cloudrun-https-proxy"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [
    google_compute_managed_ssl_certificate.app_cert.id
  ]
}

resource "google_compute_global_forwarding_rule" "https" {
  name       = "cloudrun-https-forwarding-rule"
  port_range = "443"
  target     = google_compute_target_https_proxy.https.id
  ip_address = google_compute_global_address.lb_ip.address
}

resource "google_compute_url_map" "http_redirect" {
  name = "http-to-https-redirect"

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "http-redirect-proxy"
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name       = "http-redirect-rule"
  port_range = "80"
  target     = google_compute_target_http_proxy.http_redirect.id
  ip_address = google_compute_global_address.lb_ip.address
}