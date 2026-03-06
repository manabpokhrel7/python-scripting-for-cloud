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
  name     = "manab"
  password = "strongpass"
}
resource "google_sql_database" "mydb" {
  name     = "mydb"
  instance = google_sql_database_instance.main.name
}