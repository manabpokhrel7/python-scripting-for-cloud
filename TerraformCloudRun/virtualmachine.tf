# ### creating multi vars
# locals {
# 	nodes = {
# 		control = { computer_name = "control1" }
# 		worker  = { computer_name = "control2" }
# 	}
# }


resource "google_compute_instance" "default" {
#   for_each = local.nodes
  name         = "my-ubuntu-vm"
  machine_type = "e2-medium"
  zone         = "us-central1-c"
  tags = ["ssh-access"]
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
    }
  }
  network_interface {
    network       = "default"
    access_config {}  # gives public IP
  }
  metadata = {
    ssh-keys = "manabpokhrel7:${var.ssh_public_key}"
  }
}

