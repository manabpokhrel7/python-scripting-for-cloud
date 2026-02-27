import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";

const API = "http://localhost:8000";
// <script src="https://apis.google.com/js/platform.js" async defer></script>
// <meta name="google-signin-client_id" content="819505409176-fr96mcdv3mlct7msd9f916qhqb9k2t73.apps.googleusercontent.com">
const imageCatalog: Record<string, string[]> = {
  "debian-cloud": ["debian-13", "debian-12", "debian-11"],
  "ubuntu-os-cloud": ["ubuntu-2404-lts-amd64", "ubuntu-2204-lts"],
  "centos-cloud": ["centos-stream-10", "centos-stream-9"],
  "rhel-cloud": ["rhel-10", "rhel-9"],
  "rocky-linux-cloud": ["rocky-linux-10", "rocky-linux-9"],
  "cos-cloud": ["cos-125-lts", "cos-121-lts"],
};

export default function App() {
  const [zones, setZones] = useState<string[]>([]);
  const [diskTypes, setDiskTypes] = useState<string[]>([]);
  const [machineTypeMap, setMachineTypeMap] = useState<Record<string, string>>({});
  const [instances, setInstances] = useState<Record<string, string>>({});

  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingDisk, setLoadingDisk] = useState(false);
  const [loadingMachine, setLoadingMachine] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [instanceName, setInstanceName] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedDisk, setSelectedDisk] = useState("");
  const [selectedMachineType, setSelectedMachineType] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [diskSize, setDiskSize] = useState(10);

  const [notification, setNotification] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; zone: string } | null>(null);

  useEffect(() => {
    fetchZones();
    fetchInstances();
    fetchMachineTypes();
  }, []);

  const fetchZones = async () => {
    setLoadingZones(true);
    try {
      const res = await fetch(`${API}/get_zones`);
      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
    } catch {
      setZones([]);
    }
    setLoadingZones(false);
  };

  const fetchDiskTypes = async (zone: string) => {
    setLoadingDisk(true);
    setSelectedDisk("");
    try {
      const res = await fetch(`${API}/disk_types?zone=${zone}`);
      const data = await res.json();
      setDiskTypes(Array.isArray(data) ? data : []);
    } catch {
      setDiskTypes([]);
    }
    setLoadingDisk(false);
  };

  const fetchMachineTypes = async () => {
    setLoadingMachine(true);
    try {
      const res = await fetch(`${API}/machine_type`, { method: "POST" });
      const data = await res.json();
      setMachineTypeMap(data || {});
    } catch {
      setMachineTypeMap({});
    }
    setLoadingMachine(false);
  };

  const fetchInstances = async () => {
    try {
      const res = await fetch(`${API}/list_instance`);
      const data = await res.json();
      setInstances(data || {});
    } catch {
      setInstances({});
    }
  };

  const filteredMachineTypes = Object.entries(machineTypeMap)
    .filter(([_, zone]) => {
      const cleanZone = zone.replace("zones/", "");
      return cleanZone === selectedZone;
    })
    .map(([type]) => type);

  const createInstance = async () => {
    if (
      !instanceName ||
      !selectedZone ||
      !selectedDisk ||
      !selectedMachineType ||
      !selectedProject ||
      !selectedFamily
    ) {
      setNotification("Please fill all required fields.");
      return;
    }

    setLoadingCreate(true);

    try {
      const res = await fetch(
        `${API}/create_machine?instance_name=${instanceName}&instance_zone=${selectedZone}&disk_type=${selectedDisk}&image_project=${selectedProject}&image_family=${selectedFamily}&machine_type=${selectedMachineType}&disk_size_gb=${diskSize}`,
        { method: "POST" }
      );

      const text = await res.text();
      setNotification(text || "Instance creation started.");
      setTimeout(fetchInstances, 5000);
    } catch {
      setNotification("Error creating instance.");
    }

    setLoadingCreate(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const zoneName = deleteTarget.zone.replace("zones/", "");

    await fetch(
      `${API}/delete_instance?instance_name=${deleteTarget.name}&zone_name=${zoneName}`,
      { method: "POST" }
    );

    setNotification("Delete operation started...");
    setTimeout(fetchInstances, 5000);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f9" }}>
      <AppBar position="static">
        <Toolbar>
          <CloudIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Manab Cloud Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5">Provision Virtual Machine</Typography>

                <TextField
                  fullWidth
                  label="Instance Name"
                  sx={{ mt: 2 }}
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />

                <Select
                  fullWidth
                  displayEmpty
                  sx={{ mt: 2 }}
                  value={selectedZone}
                  onChange={(e) => {
                    const zone = e.target.value;
                    setSelectedZone(zone);
                    fetchDiskTypes(zone);
                  }}
                >
                  <MenuItem value="">
                    {loadingZones ? "Loading Zones..." : "Select Zone"}
                  </MenuItem>
                  {zones.map((z) => (
                    <MenuItem key={z} value={z}>{z}</MenuItem>
                  ))}
                </Select>

                <Select
                  fullWidth
                  displayEmpty
                  sx={{ mt: 2 }}
                  value={selectedDisk}
                  onChange={(e) => setSelectedDisk(e.target.value)}
                >
                  <MenuItem value="">
                    {loadingDisk ? "Loading Disk Types..." : "Select Disk Type"}
                  </MenuItem>
                  {diskTypes.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>

                <TextField
                  type="number"
                  fullWidth
                  sx={{ mt: 2 }}
                  label="Disk Size (GB)"
                  value={diskSize}
                  onChange={(e) => setDiskSize(Number(e.target.value))}
                />

                <Select
                  fullWidth
                  displayEmpty
                  sx={{ mt: 2 }}
                  value={selectedMachineType}
                  disabled={!selectedZone}
                  onChange={(e) => setSelectedMachineType(e.target.value)}
                >
                  <MenuItem value="">
                    {loadingMachine ? "Loading Machine Types..." : "Select Machine Type"}
                  </MenuItem>

                  {filteredMachineTypes.length === 0 && selectedZone && !loadingMachine && (
                    <MenuItem disabled>No machine types available</MenuItem>
                  )}

                  {filteredMachineTypes.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>

                <Select
                  fullWidth
                  displayEmpty
                  sx={{ mt: 2 }}
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <MenuItem value="">Select Image Project</MenuItem>
                  {Object.keys(imageCatalog).map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>

                <Select
                  fullWidth
                  displayEmpty
                  sx={{ mt: 2 }}
                  value={selectedFamily}
                  disabled={!selectedProject}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                >
                  <MenuItem value="">Select Image Family</MenuItem>
                  {(imageCatalog[selectedProject] || []).map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={createInstance}
                  disabled={loadingCreate}
                >
                  {loadingCreate ? <CircularProgress size={24} /> : "Create Instance"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5">Active Instances</Typography>

                {Object.entries(instances).map(([name, zone]) => (
                  <Box key={name} sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Box>
                      <Typography>{name}</Typography>
                      <Typography variant="body2">{zone}</Typography>
                    </Box>
                    <Button color="error" onClick={() => setDeleteTarget({ name, zone })}>
                      Delete
                    </Button>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        message={notification}
        onClose={() => setNotification("")}
      />
    </Box>
  );
}