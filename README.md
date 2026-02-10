# GCP Compute Engine Automation API (FastAPI)

This repository exposes a **FastAPI-based REST service** that automates common **Google Compute Engine VM operations** using the **Google Cloud Python SDK**.

The implementation is already complete. This README only explains **how to run the application**, **how to call each API endpoint**, and **what inputs mean**.

---

## What This App Does

Through simple HTTP endpoints, you can:

- Discover available GCP zones
- List public OS images
- List disk types per zone
- Create Compute Engine VM instances
- List existing VM instances across zones
- Delete VM instances safely

This mirrors real-world **DevOps automation workflows** where logic sits *above* raw CLI or Terraform.

---

## Project Structure

```
GCP/
├── app.py                # FastAPI entrypoint
├── create_instance.py    # VM creation logic
├── delete_instance.py    # VM deletion logic
├── list_instances.py     # List VMs across zones
├── list_images.py        # List public OS images
├── disk_type.py          # Disk type discovery
├── zones.py              # Zone discovery
├── logger.py             # Logging setup
├── requirements.txt
```

---

## Prerequisites

- Python 3.10+
- Google Cloud SDK installed
- A GCP project with **Compute Engine API enabled**

---

## Authentication & Project Setup

This application uses **Application Default Credentials (ADC)**.

Run the following commands **before starting the API**:

```bash
gcloud auth application-default login
gcloud init
```

Make sure the correct project is selected.

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run the API Server

```bash
uvicorn app:app --reload
```

By default, the API will be available at:

```
http://127.0.0.1:8000
```

Swagger UI (recommended way to use this API):
```
http://127.0.0.1:8000/docs
```
http://127.0.0.1:8000/docs
```

---

## API Endpoints

### 1. Get Available Zones

**Endpoint**
```
GET /get_zones
```

**Description**  
Returns all Compute Engine zones available for the currently selected project.

**Example Response**
```json
[
  "asia-southeast1-b",
  "us-central1-a"
]
```

---

### 2. List OS Images

**Endpoint**
```
GET /get_Images
```

**Query Parameters**

| Name | Description |
|----|----|
| image_project_id | Public image project |

Allowed values:

- `debian-cloud`
- `ubuntu-os-cloud`
- `cos-cloud`
- `windows-cloud`

**Example**
```
/get_Images?image_project_id=debian-cloud
```

---

### 3. List Disk Types

**Endpoint**
```
GET /disk_types
```

**Query Parameters**

| Name | Description |
|----|----|
| zone | Zone name from `/get_zones` |

**Example**
```
/disk_types?zone=asia-southeast1-b
```

**Example Response**
```json
[
  "pd-standard",
  "pd-ssd",
  "pd-balanced"
]
```

---

### 4. Create a VM Instance

**Endpoint**
```
POST /create_machine
```

**Query Parameters**

| Name | Description |
|----|----|
| instance_name | Name of the VM instance |
| instance_zone | Zone to create the VM in |
| disk_type | Disk type (from `/disk_types`) |

**Notes**

- Uses **Debian 12** from `debian-cloud`
- Disk size: **10 GB**
- Uses default VPC network
- External IP is disabled by default

**Example**
```
/create_machine?instance_name=manab&instance_zone=asia-southeast1-b&disk_type=pd-standard
```

---

### 5. List All VM Instances

**Endpoint**
```
GET /list_instance
```

**Description**  
Lists all VM instances across all zones in the project.

**Example Response**
```json
{
  "manab": "zones/asia-southeast1-b"
}
```

---

### 6. Delete a VM Instance

**Endpoint**
```
POST /delete_instance
```

**Query Parameters**

| Name | Description |
|----|----|
| instance_name | Name of the VM |
| zone_name | Zone where the VM exists |

**Example**
```
/delete_instance?instance_name=manab&zone_name=asia-southeast1-b
```

---

## Typical Usage Flow

1. Authenticate with GCP
2. Call `/get_zones`
3. Call `/disk_types` using a zone
4. Call `/create_machine`
5. Call `/list_instance`
6. Call `/delete_instance` when done

---

## Important Notes

- VM creation may fail if a zone is temporarily exhausted
- Instance names must be unique per zone
- Always list instances before deleting

---

## Using Swagger UI (No Frontend Required)

This project intentionally **does not include a frontend UI**.

The API is designed to be used via **Swagger UI**, which FastAPI generates automatically. This keeps the focus on **backend automation and DevOps workflows**, not frontend development.

After starting the server, open:

```
http://127.0.0.1:8000/docs
```

From Swagger UI you can:

- Explore all available endpoints
- See required inputs and parameter types
- Execute requests directly from the browser
- View live responses from Google Cloud APIs

This approach reflects how many internal DevOps tools are actually used in real teams.

---

## Why This Is Useful

This project demonstrates:

- Python-driven infrastructure automation
- API-first DevOps tooling
- Using Swagger as an operational interface
- Focus on backend systems over UI polish

It was built deliberately by a DevOps engineer learning **backend Python**, not frontend frameworks.

Perfect as a **DevOps portfolio project** or internal automation service.

---

## Next Enhancements (Optional)

- Authentication on API endpoints
- Support for custom images
- Network interface selection
- Startup scripts & metadata
- Async job tracking

