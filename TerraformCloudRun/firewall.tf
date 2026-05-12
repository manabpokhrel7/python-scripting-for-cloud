resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22" , "80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]  # allow from anywhere (you can restrict later)
  target_tags   = ["ssh-http-https-access"]
}