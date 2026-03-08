variable "google_client_id" {
  type        = string
  description = "Google OAuth client ID"
  sensitive   = true
}

variable "google_client_secret" {
  type        = string
  description = "Google OAuth client secret"
  sensitive   = true
}

variable "secret_key" {
  type        = string
  description = "FastAPI session SECRET_KEY"
  sensitive   = true
}