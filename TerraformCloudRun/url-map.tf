resource "google_compute_url_map" "main" {
  name = "manab-cloudrun-url-map"

  default_service = google_compute_backend_service.react_manab.id

  host_rule {
    hosts        = ["cloud.manabpokhrel.com.np"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.react_manab.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.python_backend.id
    }
#     path_rule {
#       paths   = ["/check_login/*"]
#       service = google_compute_backend_service.python_backend.id
#     }
#     path_rule {
#       paths   = ["/login/*"]
#       service = google_compute_backend_service.python_backend.id
#     }
#     path_rule {
#       paths   = ["/logout/*"]
#       service = google_compute_backend_service.python_backend.id
#     }
  }
}

resource "google_compute_managed_ssl_certificate" "app_cert" {
  name = "manab-app-managed-cert"

  managed {
    domains = ["cloud.manabpokhrel.com.np"]
  }
}

resource "google_compute_target_https_proxy" "https" {
  name             = "manab-cloudrun-https-proxy"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [
    google_compute_managed_ssl_certificate.app_cert.id
  ]
}

resource "google_compute_global_forwarding_rule" "https" {
  name       = "manab-cloudrun-https-forwarding-rule"
  port_range = "443"
  target     = google_compute_target_https_proxy.https.id
  ip_address = google_compute_global_address.lb_ip.address
}

resource "google_compute_url_map" "http_redirect" {
  name = "manab-http-to-https-redirect"

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "manab-http-redirect-proxy"
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name       = "manab-http-redirect-rule"
  port_range = "80"
  target     = google_compute_target_http_proxy.http_redirect.id
  ip_address = google_compute_global_address.lb_ip.address
}