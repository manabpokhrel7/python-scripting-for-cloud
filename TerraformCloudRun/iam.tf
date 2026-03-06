resource "google_cloud_run_v2_service_iam_member" "python_invoker" {
  name     = google_cloud_run_v2_service.python.name
  location = google_cloud_run_v2_service.python.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
resource "google_cloud_run_v2_service_iam_member" "react_invoker" {
  name     = google_cloud_run_v2_service.react.name
  location = google_cloud_run_v2_service.react.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}