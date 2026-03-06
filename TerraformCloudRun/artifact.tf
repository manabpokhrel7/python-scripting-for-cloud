resource "google_artifact_registry_repository" "python-repo" {
  location      = "us-central1"
  repository_id = "python-repository"
  description   = "example docker repository"
  format        = "DOCKER"
}