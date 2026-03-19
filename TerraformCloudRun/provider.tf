provider "google" {
  project     = "my-personal-terraform"
  region      = "us-central1"
  credentials = file("key.json")
}