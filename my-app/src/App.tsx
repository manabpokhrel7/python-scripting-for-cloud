import React, { useEffect, useState } from "react";
import "./App.css";

interface CreateInstanceForm {
  instance_name: string;
  instance_zone: string;
  disk_type: string;
  image_project: string;
  image_family: string;
  machine_type: string;
  disk_size_gb: number;
  project_id: string;
}

interface Option {
  id: string;
  name: string;
}

const API_BASE = "http://localhost:8000";

// If your router is APIRouter(prefix="/cloud") and you include it with
// app.include_router(cloud, prefix="/cloud"), keep this as "/cloud/cloud".
// If you fix your backend to have only one /cloud, change this to "/cloud".
const CLOUD_PREFIX = "/cloud/cloud";

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [sub, setSub] = useState<string | null>(null);

  const [form, setForm] = useState<CreateInstanceForm>({
    instance_name: "",
    instance_zone: "",
    disk_type: "",
    image_project: "",
    image_family: "",
    machine_type: "",
    disk_size_gb: 10,
    project_id: "",
  });

  const [projects, setProjects] = useState<Option[]>([]);
  const [zones, setZones] = useState<Option[]>([]);
  const [machineTypes, setMachineTypes] = useState<Option[]>([]);
  const [diskTypes, setDiskTypes] = useState<Option[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingMachineTypes, setLoadingMachineTypes] = useState(false);
  const [loadingDiskTypes, setLoadingDiskTypes] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchProjects();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (form.project_id) {
      fetchZones(form.project_id);
      fetchMachineTypes(form.project_id);
    } else {
      setZones([]);
      setMachineTypes([]);
      setDiskTypes([]);
      setForm((prev) => ({
        ...prev,
        instance_zone: "",
        machine_type: "",
        disk_type: "",
      }));
    }
  }, [form.project_id]);

  useEffect(() => {
    if (form.project_id && form.instance_zone) {
      fetchDiskTypes(form.instance_zone, form.project_id);
    } else {
      setDiskTypes([]);
      setForm((prev) => ({ ...prev, disk_type: "" }));
    }
  }, [form.instance_zone, form.project_id]);

  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/check_login`, {
        credentials: "include",
      });
      const data = await res.json();
      setLoggedIn(data.logged_in);
      setSub(data.sub || null);
    } catch (err) {
      console.error("Error checking login", err);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_BASE}/login`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { credentials: "include" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setLoggedIn(false);
      setSub(null);
      setProjects([]);
      setZones([]);
      setMachineTypes([]);
      setDiskTypes([]);
      window.location.href = "http://localhost:5173";
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch(`${API_BASE}${CLOUD_PREFIX}/get_projects`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        console.error("get_projects failed:", await res.text());
        return;
      }
      const data = await res.json();
      // Adjust mapping based on actual response from get_projects
      const arr = Array.isArray(data) ? data : data.items ?? [];
      const options: Option[] = arr.map((p: any) => ({
        id: p.project_id ?? p.id ?? String(p),
        name: p.name ?? p.project_id ?? p.id ?? String(p),
      }));
      setProjects(options);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchZones = async (projectId: string) => {
    try {
      setLoadingZones(true);
      const res = await fetch(
        `${API_BASE}${CLOUD_PREFIX}/get_zones?project_id=${encodeURIComponent(
          projectId
        )}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        console.error("get_zones failed:", await res.text());
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.items ?? [];
      const options: Option[] = arr.map((z: any) => ({
        id: z.id ?? z.zone ?? z.name ?? String(z),
        name: z.name ?? z.zone ?? z.id ?? String(z),
      }));
      setZones(options);
    } catch (err) {
      console.error("Error fetching zones", err);
    } finally {
      setLoadingZones(false);
    }
  };

  const fetchMachineTypes = async (projectId: string) => {
    try {
      setLoadingMachineTypes(true);
      const res = await fetch(
        `${API_BASE}${CLOUD_PREFIX}/machine_type?project_id=${encodeURIComponent(
          projectId
        )}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("machine_type failed:", await res.text());
        return;
      }
      const data = await res.json();
      console.log("machine_type response:", data);
      // If your backend returns { "items": [...] } change to data.items
      const arr = Array.isArray(data) ? data : data.items ?? [];
      const options: Option[] = arr.map((m: any) => ({
        id: m.id ?? m.machine_type ?? m.name ?? String(m),
        name: m.name ?? m.machine_type ?? m.id ?? String(m),
      }));
      setMachineTypes(options);
    } catch (err) {
      console.error("Error fetching machine types", err);
    } finally {
      setLoadingMachineTypes(false);
    }
  };

  const fetchDiskTypes = async (zone: string, projectId: string) => {
    try {
      setLoadingDiskTypes(true);
      const res = await fetch(
        `${API_BASE}${CLOUD_PREFIX}/disk_types?zone=${encodeURIComponent(
          zone
        )}&project_id=${encodeURIComponent(projectId)}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        console.error("disk_types failed:", await res.text());
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.items ?? [];
      const options: Option[] = arr.map((d: any) => ({
        id: d.id ?? d.disk_type ?? d.name ?? String(d),
        name: d.name ?? d.disk_type ?? d.id ?? String(d),
      }));
      setDiskTypes(options);
    } catch (err) {
      console.error("Error fetching disk types", err);
    } finally {
      setLoadingDiskTypes(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "disk_size_gb" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const params = new URLSearchParams({
        instance_name: form.instance_name,
        instance_zone: form.instance_zone,
        disk_type: form.disk_type,
        image_project: form.image_project,
        image_family: form.image_family,
        machine_type: form.machine_type,
        disk_size_gb: form.disk_size_gb.toString(),
        project_id: form.project_id,
      });

      const res = await fetch(
        `${API_BASE}${CLOUD_PREFIX}/create_machine?${params.toString()}`,
        { method: "POST", credentials: "include" }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create instance");
      }

      const data = await res.json();
      setMessage(
        typeof data === "string" ? data : "Instance created successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage("Error creating instance.");
    }
  };

  return (
    <div className="app">
      <h1>Cloud Manager</h1>

      {!loggedIn ? (
        <div className="login-box">
          <p>Please log in with Google to continue.</p>
          <button onClick={handleLogin} className="login-btn">
            Login with Google
          </button>
        </div>
      ) : (
        <div className="dashboard">
          <div className="top-bar">
            <p>
              Logged in as: <strong>{sub}</strong>
            </p>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>

          <h2>Create Cloud Instance</h2>

          <form onSubmit={handleSubmit} className="instance-form">
            <label>
              Project:
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  {loadingProjects ? "Loading projects..." : "Select project"}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Zone:
              <select
                name="instance_zone"
                value={form.instance_zone}
                onChange={handleChange}
                disabled={!form.project_id || loadingZones}
                required
              >
                <option value="">
                  {loadingZones ? "Loading zones..." : "Select zone"}
                </option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Machine Type:
              <select
                name="machine_type"
                value={form.machine_type}
                onChange={handleChange}
                disabled={!form.project_id || loadingMachineTypes}
                required
              >
                <option value="">
                  {loadingMachineTypes
                    ? "Loading machine types..."
                    : "Select machine type"}
                </option>
                {machineTypes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Disk Type:
              <select
                name="disk_type"
                value={form.disk_type}
                onChange={handleChange}
                disabled={
                  !form.project_id ||
                  !form.instance_zone ||
                  loadingDiskTypes
                }
                required
              >
                <option value="">
                  {loadingDiskTypes
                    ? "Loading disk types..."
                    : "Select disk type"}
                </option>
                {diskTypes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="image-info">
              <p>
                For valid <strong>image project</strong> and{" "}
                <strong>image family</strong> values, see the Google Cloud{" "}
                <a
                  href="https://docs.cloud.google.com/compute/docs/images/os-details"
                  target="_blank"
                  rel="noreferrer"
                >
                  Operating system details
                </a>{" "}
                page.
              </p>
            </div>

            <label>
              Image Project:
              <input
                name="image_project"
                value={form.image_project}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Image Family:
              <input
                name="image_family"
                value={form.image_family}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Instance Name:
              <input
                name="instance_name"
                value={form.instance_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Disk Size (GB):
              <input
                name="disk_size_gb"
                type="number"
                min={10}
                value={form.disk_size_gb}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="create-btn">
              Create Instance
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default App;
