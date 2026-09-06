import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import "./App.css";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";


const API_BASE = "/api"; // Kubernetes
// const API_BASE = "https://cloud.manabpokhrel.com.np/api";

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
  "centos-cloud",
];


const IMAGE_FAMILIES: Record<string, string[]> = {
  "debian-cloud": [
    "debian-13",
    "debian-12",
  ],

  "ubuntu-os-cloud": [
    "ubuntu-2604-lts-amd64",
    "ubuntu-2404-lts-amd64",
    "ubuntu-2204-lts",
  ],

  "rocky-linux-cloud": [
    "rocky-linux-10",
    "rocky-linux-10-optimized-gcp",
    "rocky-linux-9",
    "rocky-linux-9-optimized-gcp",
    "rocky-linux-8",
    "rocky-linux-8-optimized-gcp",
  ],

  "rhel-cloud": [
    "rhel-10",
    "rhel-10-lvm",
    "rhel-9",
    "rhel-9-lvm",
    "rhel-8",
    "rhel-8-lvm",
  ],

  "suse-cloud": [
    "sles-16-0-x86-64",
    "sles-15",
  ],

  "windows-cloud": [
    "windows-2025",
    "windows-2025-core",
    "windows-2022",
    "windows-2022-core",
    "windows-2019",
    "windows-2019-core",
    "windows-2016",
    "windows-2016-core",
  ],

  "cos-cloud": [
    "cos-stable",
    "cos-beta",
    "cos-dev",
    "cos-129-lts",
    "cos-125-lts",
    "cos-121-lts",
    "cos-117-lts",
  ],

  "fedora-coreos-cloud": [
    "fedora-coreos-stable",
    "fedora-coreos-testing",
    "fedora-coreos-next",
  ],

  "opensuse-cloud": [
    "opensuse-leap-15-6",
    "opensuse-leap-15-5",
  ],

  "oracle-linux-cloud": [
    "oracle-linux-10",
    "oracle-linux-9",
    "oracle-linux-8",
  ],

  "centos-cloud": [
    "centos-stream-10",
    "centos-stream-9",
  ],
};


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
  public_ip: string;
}


const App: React.FC = () => {

  // ------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [sub, setSub] =
    useState("");


  // ------------------------------------------------------------
  // VM FORM
  // ------------------------------------------------------------

  const [form, setForm] =
    useState<FormData>({
      project_id: "",
      zone: "",
      instance_name: "",
      machine_type: "n2-standard-2",
      image_project: "debian-cloud",
      image_family: "debian-12",
      disk_type: "pd-standard",
      disk_size_gb: 20,
    });


  const [projects, setProjects] =
    useState<string[]>([]);

  const [zones, setZones] =
    useState<string[]>([]);

  const [machineTypes, setMachineTypes] =
    useState<{ [key: string]: string }>({});

  const [diskTypes, setDiskTypes] =
    useState<string[]>([]);

  const [instances, setInstances] =
    useState<Instance[]>([]);


  // ------------------------------------------------------------
  // UI STATES
  // ------------------------------------------------------------

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    loadingInstances,
    setLoadingInstances,
  ] = useState(false);

  const [
    loadingMachineTypes,
    setLoadingMachineTypes,
  ] = useState(false);


  // ------------------------------------------------------------
  // AI
  // ------------------------------------------------------------

  const [aiPrompt, setAiPrompt] =
    useState("");

  const [aiResponse, setAiResponse] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiOpen, setAiOpen] =
    useState(false);


  // ------------------------------------------------------------
  // SSH
  // ------------------------------------------------------------

  const [wsStatus, setWsStatus] =
    useState("Disconnected");

  const [
    selectedSshInstance,
    setSelectedSshInstance,
  ] = useState<Instance | null>(null);


  // ------------------------------------------------------------
  // XTERM REFS
  // ------------------------------------------------------------

  const terminalContainerRef =
    useRef<HTMLDivElement | null>(null);

  const terminalRef =
    useRef<Terminal | null>(null);

  const fitAddonRef =
    useRef<FitAddon | null>(null);


  // ------------------------------------------------------------
  // WEBSOCKET
  // ------------------------------------------------------------

  const wsRef =
    useRef<WebSocket | null>(null);


  // ------------------------------------------------------------
  // PRIVATE KEY FILE INPUT
  // ------------------------------------------------------------

  const privateKeyInputRef =
    useRef<HTMLInputElement | null>(null);

  const pendingInstanceRef =
    useRef<Instance | null>(null);


  // ============================================================
  // LOGIN CHECK
  // ============================================================

  useEffect(() => {

    const checkLogin = async () => {

      try {

        const res = await fetch(
          `${API_BASE}/check_login`,
          {
            credentials: "include",
          }
        );

        const data =
          await res.json();

        setLoggedIn(
          data.logged_in
        );

        setSub(
          data.sub || ""
        );

        if (data.logged_in) {
          fetchProjects();
        }

      } catch (error) {

        console.error(
          "Login check failed:",
          error
        );

      }

    };

    checkLogin();

  }, []);


  // ============================================================
  // XTERM INITIALIZATION
  // ============================================================

  useEffect(() => {

    if (!loggedIn) {
      return;
    }

    if (
      !terminalContainerRef.current
    ) {
      return;
    }

    if (terminalRef.current) {
      return;
    }


    const terminal =
      new Terminal({
        cursorBlink: true,
        fontSize: 14,
        scrollback: 5000,
        convertEol: true,
      });


    const fitAddon =
      new FitAddon();


    terminal.loadAddon(
      fitAddon
    );


    terminal.open(
      terminalContainerRef.current
    );


    fitAddon.fit();


    terminalRef.current =
      terminal;

    fitAddonRef.current =
      fitAddon;


    terminal.writeln(
      "Cloud Manager SSH Console"
    );

    terminal.writeln(
      "Select a running instance and click SSH."
    );

    terminal.writeln("");


    // ----------------------------------------------------------
    // RAW XTERM KEYBOARD INPUT -> WEBSOCKET
    // ----------------------------------------------------------

    const disposable =
      terminal.onData((data) => {

        const socket =
          wsRef.current;

        if (
          socket &&
          socket.readyState ===
            WebSocket.OPEN
        ) {
          socket.send(data);
        }

      });


    // ----------------------------------------------------------
    // TERMINAL RESIZE
    // ----------------------------------------------------------

    const handleResize =
      () => {

        try {
          fitAddon.fit();
        } catch {
          // ignore resize errors
        }

      };


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {

      disposable.dispose();

      window.removeEventListener(
        "resize",
        handleResize
      );


      if (wsRef.current) {

        wsRef.current.close();

        wsRef.current =
          null;
      }


      terminal.dispose();

      terminalRef.current =
        null;

      fitAddonRef.current =
        null;

    };

  }, [loggedIn]);


  // ============================================================
  // LOGIN / LOGOUT
  // ============================================================

  const handleLogin = () => {

    window.location.href =
      `${API_BASE}/login`;

  };


  const handleLogout = () => {

    window.location.href =
      `${API_BASE}/logout`;

  };


  // ============================================================
  // FETCH PROJECTS
  // ============================================================

  const fetchProjects =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/cloud/get_projects`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify(
                {}
              ),
            }
          );


        if (!res.ok) {
          return;
        }


        const data =
          await res.json();


        setProjects(
          data.project_name || []
        );

      } catch (error) {

        console.warn(
          "Projects fetch error:",
          error
        );

      }

    };


  // ============================================================
  // FETCH ZONES
  // ============================================================

  const fetchZones =
    async (
      projectId: string
    ) => {

      try {

        const res =
          await fetch(
            `${API_BASE}/cloud/get_zones`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                project_id:
                  projectId,
              }),
            }
          );


        if (!res.ok) {
          return;
        }


        const data =
          await res.json();


        setZones(
          data.zone_name || []
        );

      } catch (error) {

        console.warn(
          "Zones fetch error:",
          error
        );

      }

    };


  // ============================================================
  // FETCH MACHINE TYPES
  // ============================================================

  const fetchMachineTypes =
    async (
      projectId: string
    ) => {

      setLoadingMachineTypes(
        true
      );


      try {

        const res =
          await fetch(
            `${API_BASE}/cloud/machine_type`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                project_id:
                  projectId,
              }),
            }
          );


        if (!res.ok) {

          setMachineTypes(
            {}
          );

          return;
        }


        const data =
          await res.json();


        setMachineTypes(
          data.machine_name || {}
        );

      } catch (error) {

        console.warn(
          "Machine type error:",
          error
        );

        setMachineTypes({});

      } finally {

        setLoadingMachineTypes(
          false
        );

      }

    };


  // ============================================================
  // FETCH DISK TYPES
  // ============================================================

  const fetchDiskTypes =
    async (
      projectId: string,
      zone: string
    ) => {

      try {

        const res =
          await fetch(
            `${API_BASE}/cloud/disk_types`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                project_id:
                  projectId,

                zone,
              }),
            }
          );


        if (!res.ok) {
          return;
        }


        const data =
          await res.json();


        setDiskTypes(
          data.disk_name || []
        );

      } catch (error) {

        console.warn(
          "Disk types error:",
          error
        );

      }

    };


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
    } = e.target;


    setForm((prev) => ({
      ...prev,

      [name]:
        name ===
        "disk_size_gb"
          ? Number(value)
          : value,
    }));


    // ----------------------------------------------------------
    // PROJECT CHANGED
    // ----------------------------------------------------------

    if (
      name === "project_id"
    ) {

      setForm((prev) => ({
        ...prev,

        project_id: value,

        zone: "",

        machine_type:
          "n2-standard-2",

        disk_type:
          "pd-standard",
      }));


      fetchZones(value);

      fetchMachineTypes(
        value
      );

      setDiskTypes([]);

    }


    // ----------------------------------------------------------
    // ZONE CHANGED
    // ----------------------------------------------------------

    if (
      name === "zone"
    ) {

      setForm((prev) => ({
        ...prev,

        zone: value,

        disk_type:
          "pd-standard",
      }));


      fetchDiskTypes(
        form.project_id,
        value
      );

    }


    // ----------------------------------------------------------
    // IMAGE PROJECT CHANGED
    // ----------------------------------------------------------

    if (
      name === "image_project"
    ) {

      const families =
        IMAGE_FAMILIES[value] || [];

      setForm((prev) => ({
        ...prev,

        image_project:
          value,

        image_family:
          families.length > 0
            ? families[0]
            : "",
      }));

    }

  };


  // ============================================================
  // CREATE VM
  // ============================================================

  const handleCreate =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();


      try {

        setLoading(true);

        setMessage("");


        const res =
          await fetch(
            `${API_BASE}/cloud/create_machine`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify(
                form
              ),
            }
          );


        if (!res.ok) {

          throw new Error(
            await res.text()
          );

        }


        const data =
          await res.json();


        const vmName =
          data.vm_name;

        const privateKey =
          data.private_key;

        const publicIp =
          data.public_ip;


        if (!privateKey) {

          throw new Error(
            "VM created but private SSH key was not returned"
          );

        }


        // ------------------------------------------------------
        // DOWNLOAD PRIVATE KEY
        // ------------------------------------------------------

        const blob =
          new Blob(
            [privateKey],
            {
              type:
                "application/x-pem-file",
            }
          );


        const downloadUrl =
          URL.createObjectURL(
            blob
          );


        const downloadLink =
          document.createElement(
            "a"
          );


        downloadLink.href =
          downloadUrl;


        downloadLink.download =
          `${vmName}_private_key.pem`;


        document.body.appendChild(
          downloadLink
        );


        downloadLink.click();


        document.body.removeChild(
          downloadLink
        );


        URL.revokeObjectURL(
          downloadUrl
        );


        setMessage(
          `Created ${vmName}. Public IP: ${publicIp}. Private key downloaded.`
        );


        setForm((prev) => ({
          ...prev,
          instance_name: "",
        }));


        await fetchInstances();

      } catch (error: any) {

        setMessage(
          error.message ||
          "Failed to create instance"
        );

      } finally {

        setLoading(false);

      }

    };


  // ============================================================
  // FETCH INSTANCES
  // ============================================================

  const fetchInstances =
    async () => {

      if (
        !form.project_id
      ) {

        setMessage(
          "Select a project first."
        );

        return;
      }


      try {

        setLoadingInstances(
          true
        );

        setMessage("");


        const res =
          await fetch(
            `${API_BASE}/cloud/list_instance`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                project_id:
                  form.project_id,
              }),
            }
          );


        if (!res.ok) {

          throw new Error(
            await res.text()
          );

        }


        const data =
          await res.json();


        const instancesArr:
          Instance[] =
          Object.entries(
            data.instance_name ||
              {}
          ).map(
            (
              [name, value]:
              [string, any]
            ) => {

              if (
                typeof value ===
                "string"
              ) {

                return {
                  name,

                  zone:
                    value.replace(
                      "zones/",
                      ""
                    ),

                  machine_type: "",

                  status:
                    "Unknown",

                  public_ip: "",
                };

              }


              return {

                name,

                zone:
                  (
                    value.zone ||
                    ""
                  ).replace(
                    "zones/",
                    ""
                  ),

                machine_type:
                  value.machine_type ||
                  "",

                status:
                  value.status ||
                  "Unknown",

                public_ip:
                  value.public_ip ||
                  "",
              };

            }
          );


        setInstances(
          instancesArr
        );


      } catch (error: any) {

        setMessage(
          error.message ||
          "Failed to fetch instances"
        );

      } finally {

        setLoadingInstances(
          false
        );

      }

    };


  // ============================================================
  // DELETE VM
  // ============================================================

  const handleDelete =
    async (
      instanceName: string,
      zone: string
    ) => {

      try {

        setLoading(true);

        setMessage("");


        const res =
          await fetch(
            `${API_BASE}/cloud/delete_instance`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                instance_name:
                  instanceName,

                zone,

                project_id:
                  form.project_id,
              }),
            }
          );


        if (!res.ok) {

          throw new Error(
            await res.text()
          );

        }


        setMessage(
          `${instanceName} deleted successfully.`
        );


        setInstances(
          (previous) =>
            previous.filter(
              (instance) =>
                instance.name !==
                instanceName
            )
        );


      } catch (error: any) {

        setMessage(
          error.message ||
          "Failed to delete instance"
        );

      } finally {

        setLoading(false);

      }

    };


  // ============================================================
  // AI
  // ============================================================

  const handleAskAI =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();


      if (
        !aiPrompt.trim()
      ) {
        return;
      }


      try {

        setAiLoading(true);

        setAiResponse("");


        const res =
          await fetch(
            `${API_BASE}/ai/response`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                input_text:
                  aiPrompt,
              }),
            }
          );


        if (!res.ok) {

          throw new Error(
            await res.text()
          );

        }


        const data =
          await res.json();


        setAiResponse(
          data.response ||
          "No response received."
        );


      } catch (error: any) {

        setAiResponse(
          `Error: ${
            error.message ||
            "AI request failed"
          }`
        );

      } finally {

        setAiLoading(false);

      }

    };


  // ============================================================
  // CONNECT SSH BUTTON
  // ============================================================

  const handleConnectSsh =
    (
      instance: Instance
    ) => {

      if (
        !instance.public_ip
      ) {

        setMessage(
          `${instance.name} has no external IP.`
        );

        return;
      }


      if (
        instance.status !==
        "RUNNING"
      ) {

        setMessage(
          `${instance.name} is not running.`
        );

        return;
      }


      pendingInstanceRef.current =
        instance;


      setSelectedSshInstance(
        instance
      );


      privateKeyInputRef
        .current
        ?.click();

    };


  // ============================================================
  // PRIVATE KEY SELECTED
  // ============================================================

  const handlePrivateKeySelected =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        e.target.files?.[0];


      const instance =
        pendingInstanceRef.current;


      if (
        !file ||
        !instance
      ) {

        return;
      }


      try {

        const privateKey =
          await file.text();


        startSshConnection(
          instance,
          privateKey
        );


      } catch (error) {

        console.error(
          "Private key read failed:",
          error
        );


        setWsStatus(
          "Key read failed"
        );

      } finally {

        e.target.value =
          "";

      }

    };


  // ============================================================
  // START SSH CONNECTION
  // ============================================================

  const startSshConnection =
    (
      instance: Instance,
      privateKey: string
    ) => {

      const terminal =
        terminalRef.current;


      if (!terminal) {
        return;
      }


      if (
        wsRef.current
      ) {

        wsRef.current.close();

        wsRef.current =
          null;
      }


      setSelectedSshInstance(
        instance
      );


      terminal.clear();


      terminal.writeln(
        `Connecting to ${instance.name}...`
      );

      terminal.writeln(
        `Host: ${instance.public_ip}`
      );

      terminal.writeln(
        "User: python"
      );

      terminal.writeln("");


      setWsStatus(
        "Connecting"
      );


      const socket =
        new WebSocket(
          "ws://localhost:8000/ws"
        );


      wsRef.current =
        socket;


      socket.onopen =
        () => {

          setWsStatus(
            "Connected"
          );


          terminal.writeln(
            "WebSocket connected."
          );


          terminal.writeln(
            "Starting SSH session..."
          );


          socket.send(
            JSON.stringify({
              host:
                instance.public_ip,

              username:
                "python",

              client_keys:
                privateKey,
            })
          );


          terminal.writeln("");

        };


      socket.onmessage =
        (event) => {

          terminal.write(
            String(
              event.data
            )
          );

        };


      socket.onerror =
        () => {

          setWsStatus(
            "Error"
          );


          terminal.writeln(
            ""
          );


          terminal.writeln(
            "SSH / WebSocket connection error."
          );

        };


      socket.onclose =
        () => {

          setWsStatus(
            "Disconnected"
          );


          if (
            wsRef.current ===
            socket
          ) {

            wsRef.current =
              null;

          }


          terminal.writeln(
            ""
          );


          terminal.writeln(
            "SSH connection closed."
          );

        };

    };


  // ============================================================
  // DISCONNECT SSH
  // ============================================================

  const disconnectSsh =
    () => {

      if (
        wsRef.current
      ) {

        wsRef.current.close();

        wsRef.current =
          null;

      }


      setWsStatus(
        "Disconnected"
      );


      terminalRef.current?.writeln(
        ""
      );


      terminalRef.current?.writeln(
        "Disconnected from SSH."
      );

    };


  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!loggedIn) {

    return (

      <div className="login-page">

        <div className="login-panel">

          <div className="login-logo">
            M
          </div>

          <h1>
            Cloud Manager
          </h1>

          <p>
            Manage Google Cloud infrastructure
            from one dashboard.
          </p>


          <button
            onClick={
              handleLogin
            }
            className="primary-button login-button"
          >
            Continue with Google
          </button>


          {message && (

            <div className="status-message error-message">

              {message}

            </div>

          )}

        </div>

      </div>

    );

  }


  // ============================================================
  // MAIN APP
  // ============================================================

  return (

    <div className="app-shell">


      <input
        ref={
          privateKeyInputRef
        }
        type="file"
        accept=".pem,.key"
        onChange={
          handlePrivateKeySelected
        }
        style={{
          display: "none",
        }}
      />


      <header className="topbar">

        <div className="brand">

          <div className="brand-logo">
            M
          </div>

          <div className="brand-text">

            <h1>
              Cloud Manager
            </h1>

            <span>
              Google Cloud Platform
            </span>

          </div>

        </div>


        <div className="topbar-right">

          <div className="user-pill">

            <span className="user-dot" />

            <span className="user-text">
              {sub}
            </span>

          </div>


          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </header>


      <main className="dashboard">


        <aside className="left-panel">


          <section className="dashboard-card create-vm-card">

            <div className="card-heading">

              <div>

                <h2>
                  Create VM
                </h2>

                <p>
                  Launch a Compute Engine instance
                </p>

              </div>

            </div>


            <form
              className="compact-form"
              onSubmit={
                handleCreate
              }
            >


              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Project
                  </label>

                  <select
                    name="project_id"
                    value={
                      form.project_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select project
                    </option>

                    {projects.map(
                      (project) => (

                        <option
                          key={
                            project
                          }
                          value={
                            project
                          }
                        >
                          {project}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="form-field">

                  <label>
                    Zone
                  </label>

                  <select
                    name="zone"
                    value={
                      form.zone
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      !form.project_id
                    }
                  >

                    <option value="">
                      Select zone
                    </option>

                    {zones.map(
                      (zone) => (

                        <option
                          key={
                            zone
                          }
                          value={
                            zone
                          }
                        >
                          {zone}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="form-field">

                <label>
                  Instance Name
                </label>

                <input
                  name="instance_name"
                  value={
                    form.instance_name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="example-vm"
                />

              </div>


              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Machine
                  </label>

                  <select
                    name="machine_type"
                    value={
                      form.machine_type
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      !form.project_id ||
                      loadingMachineTypes
                    }
                  >

                    <option value="">

                      {loadingMachineTypes
                        ? "Loading..."
                        : "Select machine"}

                    </option>


                    {Object.keys(
                      machineTypes
                    ).map(
                      (machine) => (

                        <option
                          key={
                            machine
                          }
                          value={
                            machine
                          }
                        >
                          {machine}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="form-field">

                  <label>
                    Disk
                  </label>

                  <select
                    name="disk_type"
                    value={
                      form.disk_type
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      !form.zone
                    }
                  >

                    <option value="">
                      Select disk
                    </option>


                    {diskTypes.map(
                      (disk) => (

                        <option
                          key={
                            disk
                          }
                          value={
                            disk
                          }
                        >
                          {disk}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Image
                  </label>

                  <select
                    name="image_project"
                    value={
                      form.image_project
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    {IMAGE_PROJECTS.map(
                      (project) => (

                        <option
                          key={
                            project
                          }
                          value={
                            project
                          }
                        >
                          {project}
                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="form-field">

                  <label>
                    Family
                  </label>

                  <select
                    name="image_family"
                    value={
                      form.image_family
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    {(IMAGE_FAMILIES[
                      form.image_project
                    ] || []).map(
                      (family) => (

                        <option
                          key={
                            family
                          }
                          value={
                            family
                          }
                        >
                          {family}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="form-field">

                <label>
                  Disk Size
                </label>

                <div className="disk-size-input">

                  <input
                    type="number"
                    name="disk_size_gb"
                    value={
                      form.disk_size_gb
                    }
                    onChange={
                      handleChange
                    }
                    min={10}
                  />

                  <span>
                    GB
                  </span>

                </div>

              </div>


              <button
                type="submit"
                className="primary-button create-button"
                disabled={
                  loading
                }
              >

                {loading
                  ? "Creating..."
                  : "Create Instance"}

              </button>

            </form>

          </section>


          <section className="dashboard-card instances-card">

            <div className="instances-heading">

              <div>

                <h2>
                  Instances
                </h2>

                <p>
                  {instances.length} loaded
                </p>

              </div>


              <button
                className="secondary-button refresh-button"
                onClick={
                  fetchInstances
                }
                disabled={
                  loadingInstances
                }
              >

                {loadingInstances
                  ? "Loading..."
                  : "Refresh"}

              </button>

            </div>


            <div className="instance-list">


              {instances.length ===
                0 && (

                <div className="empty-instances">

                  <div className="empty-icon">
                    ☁
                  </div>

                  <p>
                    No instances loaded
                  </p>

                  <span>
                    Select a project and click Refresh.
                  </span>

                </div>

              )}


              {instances.map(
                (instance) => (

                  <div
                    className="instance-row"
                    key={`${instance.name}-${instance.zone}`}
                  >

                    <div className="instance-info">

                      <div className="instance-title-row">

                        <span
                          className={`status-indicator ${
                            instance.status ===
                            "RUNNING"
                              ? "running"
                              : ""
                          }`}
                        />

                        <strong className="instance-name">
                          {instance.name}
                        </strong>

                      </div>


                      <div className="instance-meta">

                        <span>
                          {instance.public_ip ||
                            "No external IP"}
                        </span>

                        <span>
                          {
                            instance.machine_type
                          }
                        </span>

                      </div>


                      <div className="instance-zone">

                        {instance.zone}

                      </div>

                    </div>


                    <div className="instance-actions">

                      <button
                        className="ssh-button"
                        onClick={() =>
                          handleConnectSsh(
                            instance
                          )
                        }
                        disabled={
                          !instance.public_ip ||
                          instance.status !==
                            "RUNNING"
                        }
                      >
                        SSH
                      </button>


                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            instance.name,
                            instance.zone
                          )
                        }
                        disabled={
                          loading
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {message && (

            <div className="status-message">

              {message}

            </div>

          )}

        </aside>


        <section className="terminal-panel">

          <div className="terminal-header">

            <div className="terminal-title">

              <div className="terminal-icon">
                &gt;_
              </div>

              <div>

                <h2>
                  SSH Terminal
                </h2>

                <p>

                  {selectedSshInstance
                    ? `${selectedSshInstance.name} • ${selectedSshInstance.public_ip}`
                    : "No instance connected"}

                </p>

              </div>

            </div>


            <div className="terminal-controls">

              <div
                className={`connection-badge ${
                  wsStatus ===
                  "Connected"
                    ? "connected"
                    : ""
                }`}
              >

                <span />

                {wsStatus}

              </div>


              <button
                className="disconnect-button"
                onClick={
                  disconnectSsh
                }
                disabled={
                  wsStatus ===
                  "Disconnected"
                }
              >
                Disconnect
              </button>

            </div>

          </div>


          <div className="terminal-body">

            <div
              ref={
                terminalContainerRef
              }
              className="xterm-container"
            />

          </div>


          <div className="terminal-footer">

            <span>
              xterm.js
            </span>

            <span>
              WebSocket → FastAPI → AsyncSSH → GCP
            </span>

          </div>

        </section>

      </main>


      {aiOpen && (

        <div className="ai-chat-window">

          <div className="ai-chat-header">

            <div className="ai-chat-heading">

              <div className="ai-avatar">
                AI
              </div>

              <div>

                <strong>
                  Cloud Assistant
                </strong>

                <span>
                  Online
                </span>

              </div>

            </div>


            <button
              className="ai-close-button"
              onClick={() =>
                setAiOpen(false)
              }
            >
              ×
            </button>

          </div>


          <div className="ai-chat-body">

            {!aiResponse && (

              <div className="assistant-message">

                <div className="small-ai-avatar">
                  AI
                </div>

                <div className="chat-bubble assistant">

                  Ask me about your cloud platform,
                  GCP infrastructure, VMs, Linux,
                  or DevOps.

                </div>

              </div>

            )}


            {aiPrompt &&
              aiResponse && (

              <div className="user-message">

                <div className="chat-bubble user">

                  {aiPrompt}

                </div>

              </div>

            )}


            {aiResponse && (

              <div className="assistant-message">

                <div className="small-ai-avatar">
                  AI
                </div>

                <div className="chat-bubble assistant">

                  {aiResponse}

                </div>

              </div>

            )}


            {aiLoading && (

              <div className="assistant-message">

                <div className="small-ai-avatar">
                  AI
                </div>

                <div className="chat-bubble assistant typing">

                  Thinking...

                </div>

              </div>

            )}

          </div>


          <form
            className="ai-chat-input"
            onSubmit={
              handleAskAI
            }
          >

            <textarea
              value={
                aiPrompt
              }
              onChange={(e) =>
                setAiPrompt(
                  e.target.value
                )
              }
              placeholder="Ask your cloud assistant..."
              rows={1}
            />


            <button
              type="submit"
              disabled={
                aiLoading
              }
            >
              ➤
            </button>

          </form>

        </div>

      )}


      {!aiOpen && (

        <button
          className="floating-ai-button"
          onClick={() =>
            setAiOpen(true)
          }
          aria-label="Open AI Assistant"
        >

          <span className="floating-ai-icon">
            ✦
          </span>

          <span>
            AI
          </span>

        </button>

      )}

    </div>

  );

};


export default App;