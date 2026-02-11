import React, { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8000";

export default function App() {
  const [zones, setZones] = useState<string[]>([]);
  const [instances, setInstances] = useState<Record<string, string>>({});

  const [instanceName, setInstanceName] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedDisk, setSelectedDisk] = useState("");
  const [diskTypes, setDiskTypes] = useState<string[]>([]);

  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchZones();
    fetchInstances();
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchZones = async () => {
    const res = await fetch(`${API}/get_zones`);
    const data = await res.json();
    if (Array.isArray(data)) setZones(data);
  };

  const fetchDiskTypes = async (zone: string) => {
    if (!zone) return;
    const res = await fetch(`${API}/disk_types?zone=${zone}`);
    const data = await res.json();
    if (Array.isArray(data)) setDiskTypes(data);
  };

  const fetchInstances = async () => {
    setLoadingMessage("Refreshing instances...");
    try {
      const res = await fetch(`${API}/list_instance`);
      const data = await res.json();
      setInstances(data || {});
    } catch {
      showNotification("Failed to fetch instances.");
    }
    setLoadingMessage(null);
  };

  const createInstance = async () => {
    if (!instanceName || !selectedZone || !selectedDisk) {
      showNotification("Please fill all required fields.");
      return;
    }

    setLoadingMessage("Creating instance... This may take 30 seconds.");

    try {
      const res = await fetch(
        `${API}/create_machine?instance_name=${instanceName}&instance_zone=${selectedZone}&disk_type=${selectedDisk}`,
        { method: "POST" }
      );

      const text = await res.text();
      showNotification(text || "Operation completed.");

      await fetchInstances();
    } catch {
      showNotification("Frontend error during creation.");
    }

    setLoadingMessage(null);
  };

  const deleteInstance = async (name: string, zonePath: string) => {
    setLoadingMessage(`Deleting ${name}...`);

    // Extract actual zone name from "zones/us-central1-c"
    const zoneName = zonePath.split("/").pop();

    try {
      const res = await fetch(
        `${API}/delete_instance?instance_name=${name}&zone_name=${zoneName}`,
        { method: "POST" }
      );

      const text = await res.text();
      showNotification(text || "Instance deleted.");

      await fetchInstances();
    } catch {
      showNotification("Frontend error during deletion.");
    }

    setLoadingMessage(null);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">☁</div>
        <div>
          <h1>Manab's Cloud Instance</h1>
          <p className="subtitle">Google Compute Engine Dashboard</p>
        </div>
      </header>

      {loadingMessage && (
        <div className="progress-wrapper">
          <div className="progress-bar"></div>
          <div className="progress-text">{loadingMessage}</div>
        </div>
      )}

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      {/* CREATE VM */}
      <div className="card">
        <h2>Provision Virtual Machine</h2>

        <input
          type="text"
          placeholder="Instance Name (lowercase only)"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
        />

        <select
          value={selectedZone}
          onChange={(e) => {
            setSelectedZone(e.target.value);
            fetchDiskTypes(e.target.value);
          }}
        >
          <option value="">Select Zone</option>
          {zones.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>

        <select
          value={selectedDisk}
          onChange={(e) => setSelectedDisk(e.target.value)}
        >
          <option value="">Select Disk Type</option>
          {diskTypes.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <button onClick={createInstance} disabled={!!loadingMessage}>
          Create Instance
        </button>
      </div>

      {/* INSTANCES */}
      <div className="card">
        <h2>Active Instances</h2>

        <button onClick={fetchInstances} disabled={!!loadingMessage}>
          Refresh
        </button>

        <div className="scroll-list">
          {Object.entries(instances).length === 0 && !loadingMessage && (
            <div className="empty">No instances found.</div>
          )}

          {Object.entries(instances).map(([name, zone]) => (
            <div key={name} className="instance-row">
              <div className="instance-info">
                <span className="vm-icon">🖥</span>
                <div>
                  <div className="instance-name">{name}</div>
                  <div className="instance-zone">{zone}</div>
                </div>
              </div>

              <button
                className="danger"
                onClick={() => deleteInstance(name, zone)}
                disabled={!!loadingMessage}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}