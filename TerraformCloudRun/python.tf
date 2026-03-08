resource "google_cloud_run_v2_service" "python" {
  name     = "python-api"
  location = "us-central1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = false

  template {

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
      min_instance_count = 0
    }

    containers {
      name  = "python-container"
      image = "us-central1-docker.pkg.dev/thermal-camera-485502-u2/python-repository/python-cloud:v9"

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
        value = "super-secret-key"
      }

      # ===== RABBITMQ (CloudAMQP – managed) =====
#       env {
#         name  = "RABBITMQ_HOST"
#         value = "woodpecker.rmq.cloudamqp.com"
#       }
#
#       env {
#         name  = "RABBITMQ_PORT"
#         value = "5672"   # TLS port
#       }
#
#       env {
#         name  = "RABBITMQ_USER"
#         value = "amluser"
#       }
#
#       env {
#         name  = "RABBITMQ_PASSWORD"
#         value = "amlpassword"
#       }
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

  template {
    containers {
      name  = "react-container"
      image = "us-central1-docker.pkg.dev/thermal-camera-485502-u2/python-repository/react-manab:latest"

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