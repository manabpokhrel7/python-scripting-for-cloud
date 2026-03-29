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

variable "db_name" {
  type = string
  description = "name of database"
}


variable "db_user" {
  type = string
  description = "The name of db user"
}

variable "db_pass" {
  sensitive = true
  type = string
  description = "Password of the database"
}

variable "OPENAI_API_KEY" {
  sensitive = true
  type = string
  description = "My open AI api key"
}