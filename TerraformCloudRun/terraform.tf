terraform {
  cloud {
    organization = "manabpokhrel7"  # Your Terraform Cloud org

    workspaces {
      name = "python-cloud"  # Workspace you want to link
    }
  }
}