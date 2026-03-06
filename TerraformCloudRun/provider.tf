provider "google" {
  project     = "thermal-camera-485502-u2"
  region      = "us-central1"
  credentials = file("key.json")
}