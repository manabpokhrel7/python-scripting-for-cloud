import React, { useEffect, useState, useCallback } from "react";
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

interface Instance {
  name: string;
  zone: string;
  status: string;
}

const API_BASE = "http://localhost:8000";
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
  const [instances, setInstances] = useState<Instance[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingMachineTypes, setLoadingMachineTypes] = useState(false);
  const [loadingDiskTypes, setLoadingDiskTypes] = useState(false);
  const [creatingInstance, setCreatingInstance] = useState(false);
  const [loadingInstances, setLoadingInstances] = useState(false);
  const [deletingInstance, setDeletingInstance] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  // Check login status
  useEffect(() => {
    checkLogin();
  }, []);

  // Load projects when logged in
  useEffect(() => {
    if (loggedIn) {
      fetchProjects();
    }
  }, [loggedIn]);

  // Cascade dropdown dependencies
  useEffect(() => {
    if (form.project_id) {
      fetchZones(form.project_id);
      fetchMachineTypes(form.project_id);
    } else {
      setZones([]);
      setMachineTypes([]);
      setDiskTypes([]);
      setInstances([]);
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

  // Load instances when project changes
  useEffect(() => {
    if (loggedIn && form.project_id) {
      fetchInstances(form.project_id);
    }
  }, [loggedIn, form.project_id]);

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
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.items ?? Object.values(data);
      const options: Option[] = arr.map((p: any) => ({
        id: p.project_id ?? p.id ?? p.name ?? String(p),
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
        `${API_BASE}${CLOUD_PREFIX}/get_zones?project_id=${encodeURIComponent(projectId)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.items ?? [];
      const options: Option[] = arr.map((z: any) => ({
        id: z.name ?? z.zone ?? z.id ?? String(z),
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
        `${API_BASE}${CLOUD_PREFIX}/machine_type?project_id=${encodeURIComponent(projectId)}`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const entries = Object.entries<string>(data);
      const options: Option[] = entries.map(([machineName, zone]) => ({
        id: machineName,
        name: `${machineName}`,
      }));
      setMachineTypes(options.slice(0, 50)); // Limit to first 50 for UI
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
        `${API_BASE}${CLOUD_PREFIX}/disk_types?zone=${encodeURIComponent(zone)}&project_id=${encodeURIComponent(projectId)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.items ?? data.diskTypes ?? [];
      const options: Option[] = arr.map((d: any) => ({
        id: d.name ?? d.id ?? String(d),
        name: d.name ?? d.id ?? String(d),
      }));
      setDiskTypes(options);
    } catch (err) {
      console.error("Error fetching disk types", err);
    } finally {
      setLoadingDiskTypes(false);
    }
  };

  const fetchInstances = async (projectId: string) => {
    try {
      setLoadingInstances(true);
      const res = await fetch(
        `${API_BASE}${CLOUD_PREFIX}/list_instance?project_name=${encodeURIComponent(projectId)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;

      const data = await res.json();
      console.log("Raw instances response:", data);

      const instancesList: Instance[] = [];

      // Handle GCP aggregatedList format
      if (data?.items) {
        Object.entries(data.items).forEach(([zoneKey, zoneData]: [string, any]) => {
          const zoneName = zoneKey.replace(/^zones\//, "");
          if (zoneData?.instances?.length) {
            zoneData.instances.forEach((inst: any) => {
              if (inst.name) {
                instancesList.push({
                  name: inst.name,
                  zone: zoneName,
                  status: inst.status || "RUNNING",
                });
              }
            });
          }
        });
      }

      console.log(`Parsed ${instancesList.length} instances`);
      setInstances(instancesList);
    } catch (err) {
      console.error("Error fetching instances:", err);
    } finally {
      setLoadingInstances(false);
    }
  };

  const deleteInstance = async (instanceName: string, zone: string) => {
    if (!form.project_id) return;

    try {
      setDeletingInstance(instanceName);
      const body = {
        instance_name: instanceName,
        zone_name: zone,
        project_name: form.project_id,
      };

      const res = await fetch(`${API_BASE}${CLOUD_PREFIX}/delete_instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());
      setMessage(`Instance ${instanceName} deleted!`);
      fetchInstances(form.project_id);
    } catch (error) {
      setMessage(`Delete failed: ${error}`);
    } finally {
      setDeletingInstance(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "disk_size_gb" ? Number(value) || 10 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!form.project_id) {
      setMessage("Please select a project first.");
      return;
    }

    try {
      setCreatingInstance(true);

      // Send as JSON body, not query params (your backend expects path params)
      const createBody = {
        instance_name: form.instance_name,
        instance_zone: form.instance_zone,
        disk_type: form.disk_type,
        image_project: form.image_project,
        image_family: form.image_family,
        machine_type: form.machine_type,
        disk_size_gb: form.disk_size_gb,
        project_id: form.project_id,
      };

      console.log("Creating instance with:", createBody);

      const res = await fetch(`${API_BASE}${CLOUD_PREFIX}/create_machine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createBody),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Create failed:", errorText);
        throw new Error(errorText || "Failed to create instance");
      }

      const data = await res.json();
      setMessage(`Instance "${form.instance_name}" created successfully!`);

      // Refresh instances list
      setTimeout(() => fetchInstances(form.project_id!), 2000);

      // Reset form
      setForm(prev => ({ ...prev, instance_name: "" }));
    } catch (error: any) {
      console.error("Create error:", error);
      setMessage(`Create failed: ${error.message}`);
    } finally {
      setCreatingInstance(false);
    }
  };

  return (
    <div className="app">
      <h1>🌐 Cloud Manager</h1>

      {!loggedIn ? (
        <div className="login-box">
          <p>🔐 Please log in with Google to manage cloud instances</p>
          <button onClick={handleLogin} className="login-btn">
            Login with Google
          </button>
        </div>
      ) : (
        <div className="dashboard">
          <div className="top-bar">
            <p>👤 Logged in as: <strong>{sub}</strong></p>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>

          <div className="content">
            <div className="form-section">
              <h2>➕ Create Instance</h2>
              <form onSubmit={handleSubmit} className="instance-form">
                <label>
                  📁 Project:
                  <select
                    name="project_id"
                    value={form.project_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{loadingProjects ? "⏳ Loading..." : "Choose project"}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  🌍 Zone:
                  <select
                    name="instance_zone"
                    value={form.instance_zone}
                    onChange={handleChange}
                    disabled={!form.project_id || loadingZones}
                    required
                  >
                    <option value="">{loadingZones ? "⏳ Loading..." : "Choose zone"}</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  💻 Machine Type:
                  <select
                    name="machine_type"
                    value={form.machine_type}
                    onChange={handleChange}
                    disabled={!form.project_id || loadingMachineTypes}
                    required
                  >
                    <option value="">{loadingMachineTypes ? "⏳ Loading..." : "Choose type"}</option>
                    {machineTypes.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  💾 Disk Type:
                  <select
                    name="disk_type"
                    value={form.disk_type}
                    onChange={handleChange}
                    disabled={!form.project_id || !form.instance_zone || loadingDiskTypes}
                    required
                  >
                    <option value="">{loadingDiskTypes ? "⏳ Loading..." : "Choose disk"}</option>
                    {diskTypes.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>

                <div className="image-info">
                  <p>
                    📚 Need <strong>image project</strong> and <strong>image family</strong>? See Google Cloud's{" "}
                    <a href="https://docs.cloud.google.com/compute/docs/images/os-details" target="_blank" rel="noreferrer">
                      OS Details
                    </a>
                  </p>
                </div>

                <label>
                  🖼️ Image Project:
                  <input name="image_project" value={form.image_project} onChange={handleChange} required />
                </label>

                <label>
                  🖼️ Image Family:
                  <input name="image_family" value={form.image_family} onChange={handleChange} required />
                </label>

                <label>
                  🆔 Instance Name:
                  <input name="instance_name" value={form.instance_name} onChange={handleChange} required />
                </label>

                <label>
                  📏 Disk Size (GB):
                  <input
                    name="disk_size_gb"
                    type="number"
                    min="10"
                    max="1000"
                    value={form.disk_size_gb}
                    onChange={handleChange}
                  />
                </label>

                <button type="submit" className="create-btn" disabled={creatingInstance}>
                  {creatingInstance ? (
                    <>
                      <span className="spinner"></span>
                      Creating Instance...
                    </>
                  ) : (
                    "🚀 Create Instance"
                  )}
                </button>
              </form>
            </div>

            {form.project_id && (
              <div className="instances-section">
                <h2>📋 Instances ({instances.length}) {loadingInstances && <span className="spinner small"></span>}</h2>
                {loadingInstances ? (
                  <p>⏳ Loading instances...</p>
                ) : instances.length === 0 ? (
                  <p>👻 No instances found in this project</p>
                ) : (
                  <div className="instances-table">
                    <div className="table-header">
                      <span>Instance</span>
                      <span>Zone</span>
                      <span>Status</span>
                      <span>Action</span>
                    </div>
                    {instances.map((instance) => (
                      <div key={instance.name} className="table-row">
                        <span>{instance.name}</span>
                        <span>{instance.zone}</span>
                        <span className={`status ${instance.status.toLowerCase()}`}>
                          {instance.status}
                        </span>
                        <button
                          className="delete-btn"
                          onClick={() => deleteInstance(instance.name, instance.zone)}
                          disabled={deletingInstance === instance.name}
                        >
                          {deletingInstance === instance.name ? (
                            <>
                              <span className="spinner tiny"></span>
                              Deleting...
                            </>
                          ) : (
                            "🗑️ Delete"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
