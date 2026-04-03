resource "google_cloud_run_v2_service" "python" {
  name     = "python-api"
  location = "us-central1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false

  template {
    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"
      network_interfaces {
        network    = "default"
        subnetwork = "default"
      }
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [
          google_sql_database_instance.main.connection_name
        ]
      }
    }

    scaling {
      max_instance_count = 10
      min_instance_count = 1
    }

    containers {
      name  = "python-container"
      image = "us-central1-docker.pkg.dev/my-personal-terraform/python-repository/python-cloud:v9"

      ports {
        container_port = 8000
      }

      resources {
        limits = {
          memory = "1Gi"
          cpu    = "1"
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      # ===== DATABASE (Cloud SQL socket) =====
      env {
        name  = "DB_USER"
        value = google_sql_user.db_user.name
      }

      env {
        name  = "DB_PASS"
        value = google_sql_user.db_user.password
      }

      env {
        name  = "DB_NAME"
        value = google_sql_database.mydb.name
      }

      env {
        name  = "DB_HOST"
        value = "/cloudsql/${google_sql_database_instance.main.connection_name}"
      }

      env {
        name  = "DB_PORT"
        value = "5432"
      }

      env {
        name  = "SECRET_KEY"
        value = var.secret_key
      }

      env {
        name  = "CLOUD_SQL_INSTANCE"
        value = google_sql_database_instance.main.connection_name
      }

      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
        }

      env {
        name  = "GOOGLE_CLIENT_SECRET"
        value = var.google_client_secret
      }

      env {
        name  = "SECRET_KEY"
        value = var.secret_key
      }

      env {
        name = "OPENAI_API_KEY"
        value = var.OPENAI_API_KEY
      }

      # ===== Redis=====
      env {
        name  = "REDIS_HOST"
        value = google_redis_instance.cache.host
      }

      env {
        name  = "REDIS_PORT"
        value = tostring(google_redis_instance.cache.port)
      }
#
    }
  }
  lifecycle {
    ignore_changes = [
      client,
      client_version,
    ]
  }
}

resource "google_cloud_run_v2_service" "react" {
  name     = "react-manab"
  location = "us-central1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false
  template {
    scaling {
      max_instance_count = 10
      min_instance_count = 1
    }
    containers {
      name  = "react-container"
      image = "us-central1-docker.pkg.dev/my-personal-terraform/python-repository/react-manab:v9"

      ports {
        container_port = 80
      }
    }
  }
  lifecycle {
    ignore_changes = [
      client,
      client_version,
    ]
  }
}