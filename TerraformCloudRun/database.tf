resource "google_sql_database_instance" "main" {
  name             = "python-instance"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  deletion_protection= false
  settings {
    # Second-generation instance tiers are based on the machine
    # type. See argument reference below.
    tier = "db-f1-micro"
  }
}
resource "google_sql_user" "db_user" {
  instance = google_sql_database_instance.main.name
  name     = var.db_user
  password = var.db_pass
}
resource "google_sql_database" "mydb" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}