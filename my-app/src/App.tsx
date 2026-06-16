import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "/api"; //For Kubernetes
// const API_BASE = "https://cloud.manabpokhrel.com.np/api"; //For cloud Run
// const API_BASE = "http://localhost:8000/api";

const IMAGE_PROJECTS = [
  "debian-cloud",
  "ubuntu-os-cloud",
  "rocky-linux-cloud",
  "rhel-cloud",
  "suse-cloud",
  "windows-cloud",
  "cos-cloud",
  "fedora-coreos-cloud",
  "opensuse-cloud",
  "oracle-linux-cloud",
  "centos-cloud"
];

interface FormData {
  project_id: string;
  zone: string;
  instance_name: string;
  machine_type: string;
  image_project: string;
  image_family: string;
  disk_type: string;
  disk_size_gb: number;
}

interface Instance {
  name: string;
  zone: string;
  machine_type: string;
  status: string;
}

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [sub, setSub] = useState("");

  const [form, setForm] = useState<FormData>({
    project_id: "",
    zone: "",
    instance_name: "",
    machine_type: "",
    image_project: "debian-cloud",
    image_family: "debian-12",
    disk_type: "",
    disk_size_gb: 20,
  });

  const [projects, setProjects] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [machineTypes, setMachineTypes] = useState<{ [key: string]: string }>({});
  const [diskTypes, setDiskTypes] = useState<string[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInstances, setLoadingInstances] = useState(false);
  const [loadingMachineTypes, setLoadingMachineTypes] = useState(false);

  // AI states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_BASE}/check_login`, {
          credentials: "include",
        });
        const data = await res.json();
        setLoggedIn(data.logged_in);
        setSub(data.sub || "");
        if (data.logged_in) {
          fetchProjects();
        }
      } catch (e) {
        console.error("Login check failed", e);
      }
    };

    checkLogin();
  }, []);

  const handleLogin = () => {
    window.location.href = `${API_BASE}/login`;
  };

  const handleLogout = () => {
    window.location.href = `${API_BASE}/logout`;
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/cloud/get_projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!res.ok) return;

      const data = await res.json();
      setProjects(data.project_name || []);
    } catch (e) {
      console.warn("Projects fetch error ignored:", e);
    }
  };

  const fetchZones = async (projectId: string) => {
    try {
      const res = await fetch(`${API_BASE}/cloud/get_zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!res.ok) return;

      const data = await res.json();
      setZones(data.zone_name || []);
    } catch (e) {
      console.warn("Zones fetch error ignored:", e);
    }
  };

  const fetchMachineTypes = async (projectId: string) => {
    setLoadingMachineTypes(true);
    try {
      const res = await fetch(`${API_BASE}/cloud/machine_type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!res.ok) {
        setMachineTypes({});
        return;
      }

      const data = await res.json();
      setMachineTypes(data.machine_name || {});
    } catch (e) {
      console.warn("Machine types fetch error ignored:", e);
      setMachineTypes({});
    } finally {
      setLoadingMachineTypes(false);
    }
  };

  const fetchDiskTypes = async (projectId: string, zone: string) => {
    try {
      const res = await fetch(`${API_BASE}/cloud/disk_types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_id: projectId, zone }),
      });

      if (!res.ok) return;

      const data = await res.json();
      setDiskTypes(data.disk_name || []);
    } catch (e) {
      console.warn("Disk types fetch error ignored:", e);
    }
  };

  const fetchInstances = async () => {
    if (!form.project_id) {
      setMessage("Please select a project first to list instances");
      return;
    }

    try {
      setLoadingInstances(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/cloud/list_instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_id: form.project_id }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      const instancesArr: Instance[] = (
        Object.entries(data.instance_name || {}) as [string, string][]
      ).map(([name, zoneValue]) => ({
        name,
        zone: zoneValue.replace("zones/", ""),
        machine_type: "",
        status: "Unknown",
      }));

      setInstances(instancesArr);
      setMessage("Instances fetched successfully");
    } catch (e: any) {
      setMessage(e.message || "Failed to fetch instances");
    } finally {
      setLoadingInstances(false);
    }
  };

  const handleDelete = async (instanceName: string, zone: string) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/cloud/delete_instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          instance_name: instanceName,
          zone,
          project_id: form.project_id,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setMessage(data.delete_details || "Instance deleted");

      setInstances((prev) => prev.filter((i) => i.name !== instanceName));
    } catch (e: any) {
      setMessage(e.message || "Failed to delete instance");
    } finally {
      setLoading(false);
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

    if (name === "project_id") {
      setForm((prev) => ({
        ...prev,
        project_id: value,
        zone: "",
        machine_type: "",
        disk_type: "",
      }));
      fetchZones(value);
      fetchMachineTypes(value);
      setDiskTypes([]);
    }

    if (name === "zone") {
      setForm((prev) => ({
        ...prev,
        zone: value,
        disk_type: "",
      }));
      fetchDiskTypes(form.project_id, value);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/cloud/create_machine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      setMessage(`Created instance "${form.instance_name}"`);
      setForm((prev) => ({ ...prev, instance_name: "" }));
    } catch (e: any) {
      setMessage(e.message || "Failed to create instance");
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aiPrompt.trim()) return;

    try {
      setAiLoading(true);
      setAiResponse("");

      const res = await fetch(`${API_BASE}/ai/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input_text: aiPrompt }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setAiResponse(data.response || "No response received");
    } catch (e: any) {
      setAiResponse(`Error: ${e.message || "AI request failed"}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="centered">
        <div className="login-card">
          <h1>Cloud Manager By Manab</h1>
          <p className="subtext">
            Argocd 2
          </p>
          <a
            href="https://cloud.google.com/"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            Need a GCP account? Create one here
          </a>
          <button onClick={handleLogin} className="btn-primary">
            Login with Google
          </button>
          {message && <p className="message error">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>argocd change 1</h1>
          <p className="subtext">argocd change 1</p>
        </div>

        <div className="header-right">
          <span className="user-chip">User: {sub}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="main-grid">
        <section className="panel">
          <form onSubmit={handleCreate} className="form">
            <h2>Create VM</h2>

            <label>Project</label>
            <select
              name="project_id"
              value={form.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <label>Zone</label>
            <select
              name="zone"
              value={form.zone}
              onChange={handleChange}
              required
              disabled={!form.project_id}
            >
              <option value="">Select zone</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            <label>Machine Type</label>
            <select
              name="machine_type"
              value={form.machine_type}
              onChange={handleChange}
              required
              disabled={!form.project_id || loadingMachineTypes}
            >
              <option value="">
                {loadingMachineTypes ? "Loading machine types..." : "Select machine"}
              </option>
              {Object.keys(machineTypes).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <label>Disk Type</label>
            <select
              name="disk_type"
              value={form.disk_type}
              onChange={handleChange}
              required
              disabled={!form.zone}
            >
              <option value="">Select disk</option>
              {diskTypes.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label>Instance Name</label>
            <input
              name="instance_name"
              value={form.instance_name}
              onChange={handleChange}
              required
              placeholder="my-vm-instance"
            />

            <label>Image Project</label>
            <select
              name="image_project"
              value={form.image_project}
              onChange={handleChange}
              required
            >
              {IMAGE_PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <label>Image Family</label>
            <input
              name="image_family"
              value={form.image_family}
              onChange={handleChange}
              required
              placeholder="debian-12"
            />

            <label>Disk Size (GB)</label>
            <input
              type="number"
              name="disk_size_gb"
              value={form.disk_size_gb}
              onChange={handleChange}
              min={10}
            />

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating..." : "Create VM"}
            </button>
          </form>

          <div className="divider" />

          <button
            type="button"
            onClick={fetchInstances}
            disabled={loadingInstances}
            className="btn-primary full-width"
          >
            {loadingInstances ? "Fetching Instances..." : "List Instances"}
          </button>

          {instances.length > 0 && (
            <div className="instances-container">
              <h2>Instances</h2>
              {instances.map((inst) => (
                <div key={`${inst.name}-${inst.zone}`} className="instance-card">
                  <div>
                    <strong>{inst.name}</strong>
                    <br />
                    Zone: {inst.zone}
                    <br />
                    Machine: {inst.machine_type || "N/A"}
                    <br />
                    Status: {inst.status}
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(inst.name, inst.zone)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className={`message ${message.toLowerCase().includes("fail") || message.toLowerCase().includes("error") ? "error" : "success"}`}>
              {message}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>AI Assistant</h2>
          <p className="subtext">
            Ask your app anything. You can later connect this to cloud actions too.
          </p>

          <form onSubmit={handleAskAI} className="ai-form">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask something..."
              rows={8}
            />
            <button type="submit" className="btn-primary" disabled={aiLoading}>
              {aiLoading ? "Thinking..." : "Ask AI"}
            </button>
          </form>

          <div className="ai-response-box">
            <h3>Response</h3>
            <div className="ai-response">
              {aiResponse ? aiResponse : "AI response will appear here."}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
// };
//
// export default App;