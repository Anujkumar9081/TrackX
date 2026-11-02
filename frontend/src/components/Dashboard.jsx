import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  Truck,
  Fuel,
  UtensilsCrossed,
  AlertTriangle,
  Play,
  Square,
  Wrench,
  FileText,
  ShieldCheck,
  Plus,
  LogOut,
  Navigation,
  Compass,
  ChevronDown,
  Check,
  LayoutGrid,
  Trash2,
  X,
  MapPin,
  ArrowUpDown,
  Receipt,
  Coffee,
  Droplets,
  Coins,
  ChevronsRight,
  ChevronsLeft
} from 'lucide-react';
import '../Style/Dashboard.css';
import { API_URL } from '../config';

// Fix Leaflet marker icons default path in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const LOGISTICS_HUBS = [
  { name: 'Delhi (Transport Nagar)', city: 'Delhi', coords: [28.6139, 77.2090] },
  { name: 'Kanpur (Logistics Hub)', city: 'Kanpur', coords: [26.4499, 80.3319] },
  { name: 'Mumbai (Nhava Sheva Port)', city: 'Mumbai', coords: [18.9499, 72.9510] },
  { name: 'Pune (Chakan Auto Zone)', city: 'Pune', coords: [18.7606, 73.8617] },
  { name: 'Jaipur (VKI Industrial Area)', city: 'Jaipur', coords: [26.9124, 75.7873] },
  { name: 'Ahmedabad (Sanand Cargo Hub)', city: 'Ahmedabad', coords: [22.9868, 72.3800] },
  { name: 'Kolkata (Dankuni Logistics Park)', city: 'Kolkata', coords: [22.6864, 88.2932] },
  { name: 'Bengaluru (Peenya Industrial Estate)', city: 'Bengaluru', coords: [13.0285, 77.5197] },
  { name: 'Chennai (Sriperumbudur Auto Hub)', city: 'Chennai', coords: [12.9696, 79.9406] },
  { name: 'Hyderabad (Shamshabad Cargo)', city: 'Hyderabad', coords: [17.2403, 78.4294] },
  { name: 'Lucknow (Transport Nagar)', city: 'Lucknow', coords: [26.7865, 80.8932] },
  { name: 'Agra (Foundry Nagar)', city: 'Agra', coords: [27.2038, 78.0436] },
  { name: 'Indore (Pithampur Hub)', city: 'Indore', coords: [22.6146, 75.6881] },
  { name: 'Surat (Sachin GIDC Logistics)', city: 'Surat', coords: [21.0858, 72.8710] },
  { name: 'Nagpur (MIHAN Multi-Modal Cargo)', city: 'Nagpur', coords: [21.0583, 79.0558] },
  { name: 'Ludhiana (Dhandari Kalan Hub)', city: 'Ludhiana', coords: [30.8710, 75.9273] },
  { name: 'Chandigarh (Transport Area)', city: 'Chandigarh', coords: [30.7046, 76.8013] },
  { name: 'Patna (Transport Nagar)', city: 'Patna', coords: [25.5941, 85.1376] }
];

const PRESET_CORRIDORS = [
  {
    name: 'Delhi ➔ Kanpur',
    origin: 'Delhi (Transport Nagar)',
    dest: 'Kanpur (Logistics Hub)',
    originCoords: [28.6139, 77.2090],
    destCoords: [26.4499, 80.3319],
    dist: 440,
    toll: 950,
    food: 400,
    water: 100
  },
  {
    name: 'Mumbai ➔ Pune',
    origin: 'Mumbai (Nhava Sheva Port)',
    dest: 'Pune (Chakan Auto Zone)',
    originCoords: [18.9499, 72.9510],
    destCoords: [18.7606, 73.8617],
    dist: 160,
    toll: 320,
    food: 250,
    water: 80
  },
  {
    name: 'Jaipur ➔ Delhi',
    origin: 'Jaipur (VKI Industrial Area)',
    dest: 'Delhi (Transport Nagar)',
    originCoords: [26.9124, 75.7873],
    destCoords: [28.6139, 77.2090],
    dist: 280,
    toll: 580,
    food: 350,
    water: 100
  },
  {
    name: 'Ahmedabad ➔ Mumbai',
    origin: 'Ahmedabad (Sanand Cargo Hub)',
    dest: 'Mumbai (Nhava Sheva Port)',
    originCoords: [22.9868, 72.3800],
    destCoords: [18.9499, 72.9510],
    dist: 530,
    toll: 1100,
    food: 500,
    water: 120
  },
  {
    name: 'Kolkata ➔ Patna',
    origin: 'Kolkata (Dankuni Logistics Park)',
    dest: 'Patna (Transport Nagar)',
    originCoords: [22.6864, 88.2932],
    destCoords: [25.5941, 85.1376],
    dist: 550,
    toll: 1150,
    food: 500,
    water: 120
  }
];

const calculateRoadDistance = (coordsA, coordsB) => {
  if (!coordsA || !coordsB) return 400;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coordsB[0] - coordsA[0]);
  const dLon = toRad(coordsB[1] - coordsA[1]);
  const lat1 = toRad(coordsA[0]);
  const lat2 = toRad(coordsB[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  return Math.max(20, Math.round(straightKm * 1.25));
};

const NEARBY_PUMPS = [
  { name: 'Indian Oil Highway Care', coords: [28.3800, 77.4000], dist: '2.4 km', dieselRate: '₹89.80/L' },
  { name: 'Bharat Petroleum Mega Oasis', coords: [28.1500, 77.5800], dist: '6.8 km', dieselRate: '₹89.65/L' },
  { name: 'HP Commercial Fuel Stop', coords: [27.8500, 77.8200], dist: '14.2 km', dieselRate: '₹89.70/L' }
];

const NEARBY_DHABAS = [
  { name: 'Murthal King Dhaba', coords: [28.4500, 77.3200], dist: '3.1 km', rating: '4.7 ★', features: 'Truck Parking, AC Hall' },
  { name: 'Puran Singh Ka Highway Dhaba', coords: [28.0500, 77.6800], dist: '8.5 km', rating: '4.5 ★', features: '24/7 Hot Food, Rest Area' },
  { name: 'Shree Ram Driver Rest & Dhaba', coords: [27.7000, 77.9500], dist: '12.0 km', rating: '4.3 ★', features: 'Shower & Rest, Desi Ghee' }
];

const Dashboard = () => {
  const navigate = useNavigate();

  // User & Active Truck Details
  const [userRole, setUserRole] = useState('owner');
  const [userName, setUserName] = useState('Anuj Kumar');
  const [activeTruck, setActiveTruck] = useState({
    Truck_num: 'UP82AB1234',
    Truck_brand: 'Tata',
    Truck_model: 'Signa 4825',
    Milage: 4.0,
    Driver_name: 'Rajesh Kumar'
  });

  // Fleet of Trucks (Registered & Available)
  const [fleetTrucks, setFleetTrucks] = useState([
    {
      Truck_num: 'UP82AB1234',
      Truck_brand: 'Tata',
      Truck_model: 'Signa 4825',
      Milage: 4.0,
      Driver_name: 'Rajesh Kumar',
      kmSinceLastService: 8850,
      status: 'AVAILABLE'
    },
    {
      Truck_num: 'HR55AB9921',
      Truck_brand: 'BharatBenz',
      Truck_model: '3528C Heavy',
      Milage: 3.8,
      Driver_name: 'Suresh Yadav',
      kmSinceLastService: 10450,
      serviceDueAlert: true,
      status: 'AVAILABLE'
    },
    {
      Truck_num: 'DL1AA7741',
      Truck_brand: 'Ashok Leyland',
      Truck_model: '4220 Haulage',
      Milage: 4.2,
      Driver_name: 'Amit Sharma',
      kmSinceLastService: 3200,
      status: 'AVAILABLE'
    }
  ]);

  const [isFleetDropdownOpen, setIsFleetDropdownOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);

  // Maintenance State (10,000 km Tracker)
  const [kmSinceLastService, setKmSinceLastService] = useState(8850);
  const [serviceDueAlert, setServiceDueAlert] = useState(false);

  // Google Maps Style Navigation & Route States
  const [originName, setOriginName] = useState('Delhi (Transport Nagar)');
  const [originCoords, setOriginCoords] = useState([28.6139, 77.2090]);
  const [destinationName, setDestinationName] = useState('Kanpur (Logistics Hub)');
  const [destCoords, setDestCoords] = useState([26.4499, 80.3319]);
  const [distanceKm, setDistanceKm] = useState(440);

  // Multi-Expense States (Fuel, Toll Tax, Food, Water)
  const [tollTax, setTollTax] = useState(950);
  const [foodExpense, setFoodExpense] = useState(400);
  const [waterExpense, setWaterExpense] = useState(100);

  // Trip Status & Metrics
  const [tripState, setTripState] = useState('IDLE'); // 'IDLE' | 'IN_PROGRESS' | 'COMPLETED'
  const [startOdo, setStartOdo] = useState(42000);
  const [tripStartTime, setTripStartTime] = useState(null);

  // End Trip Modal & Settlement States
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [finalOdometerInput, setFinalOdometerInput] = useState('');
  const [actualFuelInput, setActualFuelInput] = useState('');
  const [actualTollInput, setActualTollInput] = useState('');
  const [actualFoodInput, setActualFoodInput] = useState('');
  const [actualWaterInput, setActualWaterInput] = useState('');
  const [choriReport, setChoriReport] = useState(null);

  // Map Filter Toggles (Driver Amenities) & Persistent Horizontal Expansion
  const [showPumps, setShowPumps] = useState(true);
  const [showDhabas, setShowDhabas] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(() => {
    try {
      return localStorage.getItem('trackx_map_expanded') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleMapExpand = () => {
    setIsMapExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trackx_map_expanded', String(next));
      } catch (e) {
        // storage disabled fallback
      }
      return next;
    });
  };

  // Document Vault Active Tab
  const [docTab, setDocTab] = useState('TRUCK');

  // Document Vault State
  const INITIAL_DOCS = {
    TRUCK: [
      { id: 't1', name: 'Registration Certificate (RC)', info: 'Truck RC', status: 'VERIFIED', fileUrl: null },
      { id: 't2', name: 'Vehicle Insurance', info: 'Valid till Dec 2027', status: 'VERIFIED', fileUrl: null },
      { id: 't3', name: 'Fitness Certificate', info: 'Emission & Roadworthiness', status: 'VERIFIED', fileUrl: null },
      { id: 't4', name: 'Pollution Under Control (PUC)', info: 'Emission Standard OK', status: 'VERIFIED', fileUrl: null },
      { id: 't5', name: 'Goods Vehicle Permit', info: 'All India National Permit', status: 'VERIFIED', fileUrl: null },
      { id: 't6', name: 'Motor Vehicle Tax Proof', info: 'Road Tax Clearance', status: 'PENDING', fileUrl: null },
    ],
    DRIVER: [
      { id: 'd1', name: 'Driving Licence (DL)', info: 'Heavy Vehicle Licence', status: 'VERIFIED', fileUrl: null },
      { id: 'd2', name: 'Aadhaar Card', info: 'Identity Proof', status: 'VERIFIED', fileUrl: null },
      { id: 'd3', name: 'PAN Card', info: 'Tax Identification', status: 'VERIFIED', fileUrl: null },
      { id: 'd4', name: 'Passport / Voter ID', info: 'Additional Identity', status: 'PENDING', fileUrl: null },
      { id: 'd5', name: 'Medical Fitness Certificate', info: 'Driver Health Clearance', status: 'PENDING', fileUrl: null },
    ],
    JOURNEY: [
      { id: 'j1', name: 'E-Way Bill', info: 'Cargo Transit Permit', status: 'VERIFIED', fileUrl: null },
      { id: 'j2', name: 'Commercial Tax Invoice', info: 'Consignment Value: ₹4,20,000', status: 'VERIFIED', fileUrl: null },
      { id: 'j3', name: 'Goods Receipt (Bilty / LR)', info: 'Logistics Receipt #9842', status: 'VERIFIED', fileUrl: null },
      { id: 'j4', name: 'Delivery Challan', info: 'Pending Consignee Stamp', status: 'PENDING', fileUrl: null },
      { id: 'j5', name: 'Loading / Unloading Slip', info: 'Weight & Goods Declaration', status: 'PENDING', fileUrl: null },
    ]
  };

  const [vaultDocs, setVaultDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('trackx_vault_docs');
      return saved ? JSON.parse(saved) : INITIAL_DOCS;
    } catch (e) {
      return INITIAL_DOCS;
    }
  });

  const saveVaultDocs = (updated) => {
    setVaultDocs(updated);
    try {
      localStorage.setItem('trackx_vault_docs', JSON.stringify(updated));
    } catch (e) {
      // storage full fallback
    }
  };

  // Document Viewer State
  const [viewingDoc, setViewingDoc] = useState(null); // { name, fileUrl, info, status }

  // Add Document Modal State
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [addDocCategory, setAddDocCategory] = useState('TRUCK');
  const [addDocName, setAddDocName] = useState('');
  const [addDocCustomName, setAddDocCustomName] = useState('');
  const [addDocInfo, setAddDocInfo] = useState('');
  const [addDocFile, setAddDocFile] = useState(null);   // base64 data URL
  const [addDocFileName, setAddDocFileName] = useState('');
  const [addDocSaving, setAddDocSaving] = useState(false);

  const DOC_PRESETS = {
    TRUCK: [
      'Registration Certificate (RC)', 'Vehicle Insurance', 'Fitness Certificate',
      'Pollution Under Control (PUC)', 'Goods Vehicle Permit', 'Motor Vehicle Tax Proof',
      'National Permit', 'State Permit', 'Other Truck Document'
    ],
    DRIVER: [
      'Driving Licence (DL)', 'Aadhaar Card', 'PAN Card', 'Passport',
      'Voter ID', 'Medical Fitness Certificate', 'Bank Passbook / Cheque',
      'Employee ID', 'Other Personal Document'
    ],
    JOURNEY: [
      'E-Way Bill', 'Commercial Tax Invoice', 'Goods Receipt (Bilty / LR)',
      'Delivery Challan', 'Loading / Unloading Slip', 'Weighment Slip',
      'Export / Import Document', 'Other Journey Document'
    ]
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAddDocFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAddDocFile(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocSave = () => {
    const finalName = addDocName === 'Other Truck Document' || addDocName === 'Other Personal Document' || addDocName === 'Other Journey Document' || !addDocName
      ? (addDocCustomName.trim() || addDocName || 'Unnamed Document')
      : addDocName;
    if (!finalName) return;
    setAddDocSaving(true);
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: finalName,
      info: addDocInfo.trim() || 'Custom Document',
      status: addDocFile ? 'VERIFIED' : 'PENDING',
      fileUrl: addDocFile || null,
      fileName: addDocFileName || null,
    };
    const updated = {
      ...vaultDocs,
      [addDocCategory]: [...(vaultDocs[addDocCategory] || []), newDoc]
    };
    saveVaultDocs(updated);
    setAddDocSaving(false);
    setIsAddDocOpen(false);
    setAddDocName('');
    setAddDocCustomName('');
    setAddDocInfo('');
    setAddDocFile(null);
    setAddDocFileName('');
    setDocTab(addDocCategory);
  };

  const handleDeleteDoc = (category, id) => {
    const updated = {
      ...vaultDocs,
      [category]: vaultDocs[category].filter((d) => d.id !== id)
    };
    saveVaultDocs(updated);
  };

  const handleUploadToExisting = (category, id, fileDataUrl, fileName) => {
    const updated = {
      ...vaultDocs,
      [category]: vaultDocs[category].map((d) =>
        d.id === id
          ? { ...d, fileUrl: fileDataUrl, fileName, status: 'VERIFIED' }
          : d
      )
    };
    saveVaultDocs(updated);
  };

  // Dropdown Ref for closing on outside click
  const dropdownRef = useRef(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const amenitiesLayerRef = useRef(null);
  const truckMarkerRef = useRef(null);

  // 1. Initial Setup: Check auth and load saved truck data & full fleet
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'owner';
    setUserRole(role);

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setUserName(u.name);
        if (u.role) setUserRole(u.role);
      } catch (e) {
        console.error(e);
      }
    }

    const savedTruck = localStorage.getItem('activeTruck');
    if (savedTruck) {
      try {
        const t = JSON.parse(savedTruck);
        if (t.Truck_num) {
          setActiveTruck((prev) => ({
            ...prev,
            ...t,
            Milage: parseFloat(t.Milage) || 4.0
          }));
          if (t.kmSinceLastService !== undefined) {
            setKmSinceLastService(t.kmSinceLastService);
            setServiceDueAlert(t.kmSinceLastService >= 10000 || t.serviceDueAlert);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch live registered fleet from backend
    if (token) {
      fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.trucks && data.trucks.length > 0) {
            setFleetTrucks(data.trucks);
            const first = data.trucks[0];
            setActiveTruck((prev) => ({
              ...prev,
              ...first,
              Milage: parseFloat(first.Milage) || 4.0
            }));
            if (first.kmSinceLastService !== undefined) {
              setKmSinceLastService(first.kmSinceLastService);
              setServiceDueAlert(first.kmSinceLastService >= 10000 || first.serviceDueAlert);
            }
          }
        })
        .catch((err) => console.warn('Could not fetch backend trucks:', err));
    }
  }, []);

  // Switch Active Truck
  const handleSelectTruck = (truck) => {
    setActiveTruck({
      ...truck,
      Milage: parseFloat(truck.Milage) || 4.0
    });
    const km = truck.kmSinceLastService !== undefined ? truck.kmSinceLastService : 1084;
    setKmSinceLastService(km);
    setServiceDueAlert(km >= 10000 || truck.serviceDueAlert || false);
    localStorage.setItem('activeTruck', JSON.stringify(truck));
    setIsFleetDropdownOpen(false);
    setIsFleetModalOpen(false);
  };

  // DELETE TRUCK (Fleet Management)
  const handleDeleteTruck = async (e, truckNumber) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (!window.confirm(`Are you sure you want to delete truck ${truckNumber} from your fleet?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/trucks/${truckNumber}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn('Backend delete truck error:', err);
      }
    }

    const updated = fleetTrucks.filter((t) => t.Truck_num !== truckNumber);
    setFleetTrucks(updated);

    // If active truck was deleted, switch to the first remaining truck
    if (activeTruck.Truck_num === truckNumber && updated.length > 0) {
      const nextTrk = updated[0];
      setActiveTruck({
        ...nextTrk,
        Milage: parseFloat(nextTrk.Milage) || 4.0
      });
      const km = nextTrk.kmSinceLastService !== undefined ? nextTrk.kmSinceLastService : 1084;
      setKmSinceLastService(km);
      setServiceDueAlert(km >= 10000 || nextTrk.serviceDueAlert);
      localStorage.setItem(
        'activeTruck',
        JSON.stringify({
          ...nextTrk,
          Milage: parseFloat(nextTrk.Milage) || 4.0
        })
      );
    }

    alert(`Truck ${truckNumber} has been successfully removed from your fleet.`);
  };

  // Toggle Role between Owner and Driver for easy testing
  const toggleRole = () => {
    const nextRole = userRole === 'owner' ? 'driver' : 'owner';
    setUserRole(nextRole);
    localStorage.setItem('role', nextRole);
  };

  // Close Fleet Dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFleetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Location Handlers (Google Maps Style Routing)
  const handleOriginChange = (val) => {
    setOriginName(val);
    const matched = LOGISTICS_HUBS.find(
      (h) =>
        h.name.toLowerCase().includes(val.toLowerCase()) ||
        h.city.toLowerCase() === val.toLowerCase().trim()
    );
    if (matched) {
      setOriginCoords(matched.coords);
      const newDist = calculateRoadDistance(matched.coords, destCoords);
      setDistanceKm(newDist);
      setTollTax(Math.round(newDist * 2.2));
    }
  };

  const handleDestinationChange = (val) => {
    setDestinationName(val);
    const matched = LOGISTICS_HUBS.find(
      (h) =>
        h.name.toLowerCase().includes(val.toLowerCase()) ||
        h.city.toLowerCase() === val.toLowerCase().trim()
    );
    if (matched) {
      setDestCoords(matched.coords);
      const newDist = calculateRoadDistance(originCoords, matched.coords);
      setDistanceKm(newDist);
      setTollTax(Math.round(newDist * 2.2));
    }
  };

  const handleSwapLocations = () => {
    if (tripState === 'IN_PROGRESS') return;
    const tempName = originName;
    const tempCoords = originCoords;
    setOriginName(destinationName);
    setOriginCoords(destCoords);
    setDestinationName(tempName);
    setDestCoords(tempCoords);
  };

  const handleSelectCorridor = (c) => {
    if (tripState === 'IN_PROGRESS') return;
    setOriginName(c.origin);
    setOriginCoords(c.originCoords);
    setDestinationName(c.dest);
    setDestCoords(c.destCoords);
    setDistanceKm(c.dist);
    setTollTax(c.toll);
    setFoodExpense(c.food);
    setWaterExpense(c.water);
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.0, 78.5],
        zoom: 7
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      routeLayerRef.current = L.layerGroup().addTo(map);
      amenitiesLayerRef.current = L.layerGroup().addTo(map);

      // Handle initial load with saved expanded state on refresh
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    updateMapVisuals();
  }, [originCoords, destCoords, showPumps, showDhabas, tripState, activeTruck]);

  // Observe map container resize and auto-invalidate Leaflet sizing
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // When expanding/collapsing map horizontally, invalidate size & re-center route
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (originCoords && destCoords) {
          const bounds = L.latLngBounds([originCoords, destCoords]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [isMapExpanded, originCoords, destCoords]);

  // 3. Render Route, Truck Marker, and Roadside Amenities (Petrol Pumps & Dhabas)
  const updateMapVisuals = () => {
    const map = mapInstanceRef.current;
    if (!map || !routeLayerRef.current || !amenitiesLayerRef.current) return;

    routeLayerRef.current.clearLayers();
    amenitiesLayerRef.current.clearLayers();

    // Draw route line
    const routeLine = L.polyline([originCoords, destCoords], {
      color: '#2563eb',
      weight: 5,
      opacity: 0.85,
      dashArray: tripState === 'IN_PROGRESS' ? '10, 10' : undefined
    }).addTo(routeLayerRef.current);

    // Origin Marker (Point A - Green Pin)
    const originIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background:#22c55e; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(34,197,94,0.4); border:2.5px solid #ffffff; font-weight:800; font-size:13px;">
          A
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(originCoords, { icon: originIcon })
      .bindPopup(`<b>🟢 Point A (Origin / Starting Hub):</b><br>${originName}`)
      .addTo(routeLayerRef.current);

    // Destination Marker (Point B - Red Pin)
    const destIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background:#ef4444; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(239,68,68,0.4); border:2.5px solid #ffffff; font-weight:800; font-size:13px;">
          B
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(destCoords, { icon: destIcon })
      .bindPopup(`<b>🔴 Point B (Destination Hub):</b><br>${destinationName}`)
      .addTo(routeLayerRef.current);

    // Truck Live Location Marker
    const truckCurrentPos =
      tripState === 'IN_PROGRESS'
        ? [
            (originCoords[0] + destCoords[0]) / 2,
            (originCoords[1] + destCoords[1]) / 2
          ]
        : originCoords;

    const truckIconHtml = L.divIcon({
      className: 'truck-map-marker',
      html: `
        <div style="background:#0f172a; color:#fff; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.35); border:2.5px solid #22c55e; font-size:18px;">
          🚚
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    truckMarkerRef.current = L.marker(truckCurrentPos, { icon: truckIconHtml })
      .bindPopup(
        `<b>🚛 ${activeTruck.Truck_num} (${activeTruck.Truck_model || 'Truck'})</b><br>` +
        `Driver: ${activeTruck.Driver_name || 'Driver'}<br>` +
        `Route: ${originName} ➔ ${destinationName}<br>` +
        `Status: ${tripState === 'IN_PROGRESS' ? '🟢 In Transit' : '⚪ Ready at Origin'}`
      )
      .addTo(routeLayerRef.current);

    // Amenities: Nearest Petrol Pumps
    if (showPumps) {
      NEARBY_PUMPS.forEach((pump) => {
        const pumpIcon = L.divIcon({
          className: 'pump-marker',
          html: `
            <div style="background:#2563eb; color:#fff; border-radius:12px; padding:2px 8px; font-size:10px; font-weight:700; display:flex; align-items:center; gap:3px; box-shadow:0 2px 5px rgba(0,0,0,0.2); white-space:nowrap;">
              ⛽ ${pump.dist}
            </div>
          `,
          iconSize: [75, 24]
        });

        L.marker(pump.coords, { icon: pumpIcon })
          .bindPopup(
            `<b>⛽ ${pump.name}</b><br>` +
            `Distance: ${pump.dist}<br>` +
            `Diesel: ${pump.dieselRate}`
          )
          .addTo(amenitiesLayerRef.current);
      });
    }

    // Amenities: Nearest Dhabas (Highway Diners)
    if (showDhabas) {
      NEARBY_DHABAS.forEach((dhaba) => {
        const dhabaIcon = L.divIcon({
          className: 'dhaba-marker',
          html: `
            <div style="background:#ea580c; color:#fff; border-radius:12px; padding:2px 8px; font-size:10px; font-weight:700; display:flex; align-items:center; gap:3px; box-shadow:0 2px 5px rgba(0,0,0,0.2); white-space:nowrap;">
              🍲 ${dhaba.name.split(' ')[0]} (${dhaba.dist})
            </div>
          `,
          iconSize: [95, 24]
        });

        L.marker(dhaba.coords, { icon: dhabaIcon })
          .bindPopup(
            `<b>🍲 ${dhaba.name}</b><br>` +
            `Rating: ${dhaba.rating}<br>` +
            `Distance: ${dhaba.dist}<br>` +
            `Amenities: ${dhaba.features}`
          )
          .addTo(amenitiesLayerRef.current);
      });
    }

    try {
      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    } catch (e) {
      // bounds error fallback
    }
  };

  // Calculations for Route & Multi-Expense Breakdown
  const standardMileage = activeTruck.Milage || 4.0;
  const expectedFuelLiters = Number((distanceKm / standardMileage).toFixed(1));
  const expectedFuelCost = Math.round(expectedFuelLiters * 90);
  const totalEstimatedExpense =
    expectedFuelCost + Number(tollTax || 0) + Number(foodExpense || 0) + Number(waterExpense || 0);
  const costPerKm = distanceKm > 0 ? (totalEstimatedExpense / distanceKm).toFixed(1) : 0;

  // START TRIP (Connected to Backend POST /trips/start)
  const handleStartTrip = async () => {
    setTripState('IN_PROGRESS');
    setTripStartTime(new Date());
    setChoriReport(null);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/trips/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            truckNumber: activeTruck.Truck_num,
            driverName: activeTruck.Driver_name,
            origin: { name: originName, coords: originCoords },
            destination: { name: destinationName, coords: destCoords },
            plannedDistanceKm: distanceKm,
            standardMileage: standardMileage,
            startOdometer: startOdo,
            tollTax: Number(tollTax || 0),
            food: Number(foodExpense || 0),
            water: Number(waterExpense || 0)
          })
        });
      } catch (err) {
        console.warn('Backend start trip sync:', err);
      }
    }
  };

  // END TRIP: Confirm and Compute "Petrol Chori" & Full Expense Settlement
  const handleConfirmEndTrip = async () => {
    let endOdo = parseFloat(finalOdometerInput);
    if (!endOdo || isNaN(endOdo) || endOdo <= startOdo) {
      endOdo = startOdo + distanceKm;
    }

    let actualFuel = parseFloat(actualFuelInput);
    if (!actualFuel || isNaN(actualFuel) || actualFuel <= 0) {
      actualFuel = expectedFuelLiters;
    }

    const actualDist = Math.max(1, endOdo - startOdo);
    const actualMileageAchieved = Number((actualDist / actualFuel).toFixed(2));
    const fuelDiscrepancy = Number((actualFuel - expectedFuelLiters).toFixed(1));

    // Petrol Chori Flag: If actual fuel is 10% higher than expected
    const isTheftSuspected = fuelDiscrepancy > expectedFuelLiters * 0.1;

    // Actual Settlement Expenses
    const actToll = actualTollInput !== '' ? parseFloat(actualTollInput) : Number(tollTax || 0);
    const actFood = actualFoodInput !== '' ? parseFloat(actualFoodInput) : Number(foodExpense || 0);
    const actWater = actualWaterInput !== '' ? parseFloat(actualWaterInput) : Number(waterExpense || 0);
    const actFuelCost = Math.round(actualFuel * 90);
    const totalActualExpense = actFuelCost + actToll + actFood + actWater;

    setChoriReport({
      actualDist,
      actualFuel,
      actualMileageAchieved,
      fuelDiscrepancy,
      isTheftSuspected,
      expenses: {
        fuelCost: actFuelCost,
        tollTax: actToll,
        food: actFood,
        water: actWater,
        totalActualExpense,
        plannedBudget: totalEstimatedExpense
      }
    });

    // Update 10,000 km Maintenance Counter
    const newKmSinceService = kmSinceLastService + actualDist;
    setKmSinceLastService(newKmSinceService);
    if (newKmSinceService >= 10000) {
      setServiceDueAlert(true);
    }

    // Call Backend API
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/trips/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            truckNumber: activeTruck.Truck_num,
            endOdometer: endOdo,
            actualFuelUsedLiters: actualFuel,
            tollTax: actToll,
            food: actFood,
            water: actWater
          })
        });
        const data = await res.json();
        if (data && data.maintenance) {
          setKmSinceLastService(data.maintenance.kmSinceLastService);
          setServiceDueAlert(data.maintenance.serviceDueAlert);
        }
      } catch (err) {
        console.warn('Backend end trip sync:', err);
      }
    }

    // Reset Trip State
    setStartOdo(endOdo);
    setTripState('COMPLETED');
    setIsEndModalOpen(false);
  };

  // Reset Maintenance Counter after service
  const handleResetService = async () => {
    const token = localStorage.getItem('token');
    if (token && activeTruck.Truck_num) {
      try {
        await fetch(`${API_URL}/trucks/${activeTruck.Truck_num}/reset-service`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn('Reset service backend sync:', err);
      }
    }
    setKmSinceLastService(0);
    setServiceDueAlert(false);
    alert(`Truck ${activeTruck.Truck_num} service logged! 10,000 km counter has been reset to 0 km.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="trackx-dashboard">
      {/* 1. TOP NAVBAR */}
      <nav className="dashboard-nav">
        <div className="brand-section">
          <a href="#home" className="brand-title">
            Track<span>X</span>
          </a>
          <span
            className={`role-badge-pill ${
              userRole === 'owner' ? 'role-owner' : 'role-driver'
            }`}
            onClick={toggleRole}
            title="Click to switch role (Owner / Driver)"
          >
            {userRole === 'owner' ? '👑 Fleet Owner Portal' : '🚚 Driver Road Assistant'}
            <span style={{ fontSize: '10px', opacity: 0.7 }}>(Switch)</span>
          </span>
        </div>

        <div className="nav-right-controls">
          {/* Interactive Fleet Switcher Dropdown */}
          <div className="fleet-switcher-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="fleet-switcher-btn"
              onClick={() => setIsFleetDropdownOpen(!isFleetDropdownOpen)}
              title="Click to see or switch trucks"
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={15} color="#2563eb" />
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{activeTruck.Truck_num}</span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>
                ({activeTruck.Truck_model || 'Heavy Truck'}) • {activeTruck.Milage} km/L
              </span>
              <ChevronDown
                size={14}
                color="#64748b"
                style={{
                  transform: isFleetDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s'
                }}
              />
            </button>

            {isFleetDropdownOpen && (
              <div className="fleet-dropdown-box">
                <div className="fleet-dropdown-header">
                  <span className="fleet-dropdown-title">
                    Fleet Trucks ({fleetTrucks.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFleetDropdownOpen(false);
                      setIsFleetModalOpen(true);
                    }}
                    style={{
                      background: 'transparent',
                      color: '#2563eb',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View All Grid ➔
                  </button>
                </div>

                <div className="fleet-list-items">
                  {fleetTrucks.map((trk, i) => {
                    const isSelected = trk.Truck_num === activeTruck.Truck_num;
                    const isAlert = trk.serviceDueAlert || (trk.kmSinceLastService && trk.kmSinceLastService >= 10000);

                    return (
                      <div
                        key={i}
                        className={`fleet-item-row ${isSelected ? 'selected-truck' : ''}`}
                        onClick={() => handleSelectTruck(trk)}
                      >
                        <div className="fleet-item-info">
                          <span className="fleet-item-plate">
                            🚛 {trk.Truck_num}
                            {isSelected && <Check size={14} color="#2563eb" />}
                          </span>
                          <span className="fleet-item-sub">
                            {trk.Truck_brand} {trk.Truck_model} • Driver: {trk.Driver_name || 'Assigned'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="status-badge"
                            style={{
                              fontSize: '10px',
                              padding: '2px 8px',
                              background: isAlert ? '#fee2e2' : '#ecfdf5',
                              color: isAlert ? '#dc2626' : '#059669'
                            }}
                          >
                            {isAlert ? '⚠️ 10K Alert' : `${trk.Milage} km/L`}
                          </span>

                          {/* Delete Truck Action (Owner Only) */}
                          {userRole === 'owner' && (
                            <button
                              type="button"
                              title={`Delete ${trk.Truck_num} from fleet`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTruck(e, trk.Truck_num);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Trash2 size={13} color="#ef4444" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dropdown footer: "+ Add Another Truck" (OWNER ONLY) */}
                {userRole === 'owner' && (
                  <div className="fleet-dropdown-footer">
                    <button
                      type="button"
                      className="btn-dropdown-action btn-green"
                      onClick={() => navigate('/register-truck')}
                    >
                      <Plus size={14} />
                      + Add Another Truck
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* "+ Add Another Truck" Button (OWNER ONLY) */}
          {userRole === 'owner' && (
            <button
              type="button"
              className="btn-nav-action btn-green"
              onClick={() => navigate('/register-truck')}
              title="Register another truck to your fleet"
            >
              <Plus size={16} />
              + Add Another Truck
            </button>
          )}

          {/* "See Other Trucks" Button */}
          <button
            type="button"
            className="btn-nav-action"
            style={{
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1'
            }}
            onClick={() => setIsFleetModalOpen(true)}
            title="View all fleet trucks in grid"
          >
            <LayoutGrid size={15} />
            See Other Trucks
          </button>

          <button
            type="button"
            className="btn-nav-action btn-outline-red"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <div className="dashboard-body">
        {/* 10,000 KM MAINTENANCE BANNER */}
        <div
          className={`maintenance-banner ${
            kmSinceLastService >= 10000 ? 'maintenance-alert-active' : ''
          }`}
        >
          <div className="maint-info">
            <div
              className={`maint-icon-box ${
                kmSinceLastService >= 10000
                  ? 'maint-icon-alert'
                  : 'maint-icon-ok'
              }`}
            >
              {kmSinceLastService >= 10000 ? (
                <AlertTriangle size={24} />
              ) : (
                <Wrench size={22} />
              )}
            </div>
            <div>
              <div className="maint-title">
                {kmSinceLastService >= 10000
                  ? '⚠️ 10,000 KM Service Due Alert!'
                  : 'Vehicle Health & 10,000 KM Service Tracker'}
              </div>
              <div className="maint-desc">
                {kmSinceLastService >= 10000
                  ? `Truck has run ${kmSinceLastService} km since last service. Schedule immediate engine oil and brake check.`
                  : `Traveled ${kmSinceLastService} km of 10,000 km threshold. Vehicle in good operating condition.`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="maint-progress-wrap">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                <span>{kmSinceLastService} km</span>
                <span>10,000 km limit</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, (kmSinceLastService / 10000) * 100)}%`,
                    backgroundColor:
                      kmSinceLastService >= 10000 ? '#dc2626' : '#2563eb'
                  }}
                ></div>
              </div>
            </div>

            {kmSinceLastService >= 10000 && (
              <button
                type="button"
                className="btn-nav-action btn-green"
                onClick={handleResetService}
              >
                Mark Serviced
              </button>
            )}
          </div>
        </div>

        {/* 3. TWO-COLUMN GRID: MAP + TRIP CONTROL CENTER */}
        <div className={`dashboard-main-grid ${isMapExpanded ? 'map-expanded' : ''}`}>
          {/* LEFT: INTERACTIVE LIVE MAP */}
          <div className="map-card-container">
            <div className="map-card-header">
              <div className="map-title-row">
                <Navigation size={17} color="#2563eb" style={{ flexShrink: 0 }} />
                <span className="map-title-text">Live Route & Truck Location</span>
                {tripState === 'IN_PROGRESS' && (
                  <span className="live-indicator">
                    <span className="live-pulse"></span> IN TRANSIT
                  </span>
                )}
              </div>

              {/* Highway Amenities Toggle + Horizontal Expand Arrow */}
              <div className="map-filter-toggles">
                <button
                  type="button"
                  className={`map-toggle-btn ${showPumps ? 'active' : ''}`}
                  onClick={() => setShowPumps(!showPumps)}
                  title="Toggle Petrol Pumps on Route"
                >
                  <Fuel size={13} />
                  <span>Petrol</span>
                </button>

                <button
                  type="button"
                  className={`map-toggle-btn ${showDhabas ? 'active' : ''}`}
                  onClick={() => setShowDhabas(!showDhabas)}
                  title="Toggle Highway Dhabas on Route"
                >
                  <UtensilsCrossed size={13} />
                  <span>Dhabas</span>
                </button>

                {/* Horizontal Expansion Arrow Button */}
                <button
                  type="button"
                  className={`map-toggle-btn map-expand-btn ${isMapExpanded ? 'active' : ''}`}
                  onClick={toggleMapExpand}
                  title={isMapExpanded ? 'Collapse map to normal width' : 'Expand map horizontally (full width)'}
                  aria-label={isMapExpanded ? 'Collapse map' : 'Expand map'}
                >
                  {isMapExpanded ? (
                    <>
                      <ChevronsLeft size={15} />
                      <span>Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronsRight size={15} />
                      <span>Expand</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Leaflet Map Div */}
            <div ref={mapContainerRef} className="leaflet-map-canvas"></div>

            {/* Map Bottom Status Bar (fills card cleanly, fixes blank space) */}
            <div className="map-card-footer">
              <div className="map-footer-info-item">
                <span className="map-footer-label">Active Route</span>
                <span className="map-footer-val">
                  {originName ? originName.split('(')[0].trim() : 'Delhi'} ➔ {destinationName ? destinationName.split('(')[0].trim() : 'Kanpur'}
                </span>
              </div>
              <div className="map-footer-info-item">
                <span className="map-footer-label">Road Distance</span>
                <span className="map-footer-val">{distanceKm} km</span>
              </div>
              <div className="map-footer-info-item">
                <span className="map-footer-label">Est. Fuel</span>
                <span className="map-footer-val">{expectedFuelLiters} L</span>
              </div>
              <div className="map-footer-info-item">
                <span className="map-footer-label">Amenities Active</span>
                <span className="map-footer-val">
                  {showPumps ? '3 Pumps' : 'Pumps Off'} • {showDhabas ? '3 Dhabas' : 'Dhabas Off'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: TRIP CONTROLLER & "PETROL CHORI" ENGINE */}
          <div className="trip-control-card">
            <div className="card-title-bar">
              <span className="card-title-text">
                <Compass size={19} color="#009951" />
                Trip Controller (A to B)
              </span>
              <span
                className={`trip-status-badge ${
                  tripState === 'IN_PROGRESS'
                    ? 'trip-status-running'
                    : 'trip-status-idle'
                }`}
              >
                {tripState === 'IN_PROGRESS' ? 'Running Trip' : 'Trip Ready'}
              </span>
            </div>

            {/* Google Maps Style Route Inputs */}
            <div className="gmaps-route-card">
              <div className="gmaps-route-header">
                <span className="gmaps-route-header-title">
                  <MapPin size={16} color="#2563eb" />
                  Journey Navigation (Point A ➔ Point B)
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  Interactive Google Maps Routing
                </span>
              </div>

              {/* Connected A & B Inputs */}
              <div className="gmaps-inputs-wrapper">
                <div className="gmaps-pins-connector">
                  <div className="pin-dot-origin" title="Starting Point A (Origin)"></div>
                  <div className="pin-connector-line"></div>
                  <div className="pin-dot-destination" title="Destination Point B"></div>
                </div>

                <div className="gmaps-fields-col">
                  {/* Location A (Origin) */}
                  <div className="gmaps-input-row">
                    <span className="gmaps-input-prefix-icon">
                      <span style={{ fontSize: '13px' }}>🟢</span>
                    </span>
                    <input
                      type="text"
                      className="gmaps-input"
                      placeholder="Location A: Origin Hub / City (e.g. Delhi)"
                      value={originName}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      disabled={tripState === 'IN_PROGRESS'}
                      list="hubs-origin-list"
                    />
                    <datalist id="hubs-origin-list">
                      {LOGISTICS_HUBS.map((h, i) => (
                        <option key={i} value={h.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Location B (Destination) */}
                  <div className="gmaps-input-row">
                    <span className="gmaps-input-prefix-icon">
                      <span style={{ fontSize: '13px' }}>🔴</span>
                    </span>
                    <input
                      type="text"
                      className="gmaps-input"
                      placeholder="Location B: Destination Hub / City (e.g. Kanpur)"
                      value={destinationName}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      disabled={tripState === 'IN_PROGRESS'}
                      list="hubs-dest-list"
                    />
                    <datalist id="hubs-dest-list">
                      {LOGISTICS_HUBS.map((h, i) => (
                        <option key={i} value={h.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Swap A & B Button */}
                <button
                  type="button"
                  className="gmaps-swap-btn"
                  title="Reverse Origin & Destination"
                  onClick={handleSwapLocations}
                  disabled={tripState === 'IN_PROGRESS'}
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>

              {/* Popular Logistics Corridor Quick Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  Popular Logistics Corridors:
                </span>
                <div className="corridor-chips-bar">
                  {PRESET_CORRIDORS.map((c, i) => {
                    const isActive = originName === c.origin && destinationName === c.dest;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`corridor-chip-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectCorridor(c)}
                        disabled={tripState === 'IN_PROGRESS'}
                      >
                        {c.name} ({c.dist} km)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Distance Bar */}
              <div className="route-distance-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={14} color="#2563eb" />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Total Road Distance:</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => {
                      const d = Math.max(1, parseInt(e.target.value) || 0);
                      setDistanceKm(d);
                      setTollTax(Math.round(d * 2.2));
                    }}
                    disabled={tripState === 'IN_PROGRESS'}
                    style={{
                      width: '80px',
                      height: '28px',
                      padding: '2px 8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontWeight: 800,
                      textAlign: 'center',
                      fontSize: '13px'
                    }}
                  />
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>km</span>
                </div>
              </div>
            </div>

            {/* Multi-Expense Breakdown Columns (Fuel, Toll Tax, Food, Water, and Total) */}
            <div className="expenses-card-section">
              <div className="expenses-header-row">
                <span className="expenses-header-title">
                  <Coins size={16} color="#009951" />
                  Trip Budget & Expense Breakdown
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Editable Trip Costs
                </span>
              </div>

              <div className="expenses-grid-4cols">
                {/* 1. Fuel Expense */}
                <div className="expense-item-card">
                  <span className="expense-col-title">
                    <Fuel size={13} color="#2563eb" />
                    Fuel Cost
                  </span>
                  <div className="expense-input-wrapper">
                    <span className="expense-currency-symbol">₹</span>
                    <input
                      type="text"
                      className="expense-number-input"
                      value={expectedFuelCost.toLocaleString()}
                      readOnly
                      title="Auto-calculated from distance & truck mileage"
                      style={{ background: '#f1f5f9', cursor: 'default' }}
                    />
                  </div>
                  <span className="expense-sub-text">
                    {expectedFuelLiters} L @ ₹90/L
                  </span>
                </div>

                {/* 2. Toll Tax */}
                <div className="expense-item-card">
                  <span className="expense-col-title">
                    <Receipt size={13} color="#f59e0b" />
                    Toll Tax
                  </span>
                  <div className="expense-input-wrapper">
                    <span className="expense-currency-symbol">₹</span>
                    <input
                      type="number"
                      className="expense-number-input"
                      value={tollTax}
                      onChange={(e) => setTollTax(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={tripState === 'IN_PROGRESS'}
                      placeholder="e.g. 950"
                    />
                  </div>
                  <span className="expense-sub-text">
                    Highway Fastag
                  </span>
                </div>

                {/* 3. Food / Meals */}
                <div className="expense-item-card">
                  <span className="expense-col-title">
                    <Coffee size={13} color="#ea580c" />
                    Food / Meals
                  </span>
                  <div className="expense-input-wrapper">
                    <span className="expense-currency-symbol">₹</span>
                    <input
                      type="number"
                      className="expense-number-input"
                      value={foodExpense}
                      onChange={(e) => setFoodExpense(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={tripState === 'IN_PROGRESS'}
                      placeholder="e.g. 400"
                    />
                  </div>
                  <span className="expense-sub-text">
                    Driver Meals
                  </span>
                </div>

                {/* 4. Water / Refreshments */}
                <div className="expense-item-card">
                  <span className="expense-col-title">
                    <Droplets size={13} color="#06b6d4" />
                    Water / Misc
                  </span>
                  <div className="expense-input-wrapper">
                    <span className="expense-currency-symbol">₹</span>
                    <input
                      type="number"
                      className="expense-number-input"
                      value={waterExpense}
                      onChange={(e) => setWaterExpense(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={tripState === 'IN_PROGRESS'}
                      placeholder="e.g. 100"
                    />
                  </div>
                  <span className="expense-sub-text">
                    Driver Refreshment
                  </span>
                </div>
              </div>

              {/* Total Expense Banner */}
              <div className="expense-total-banner">
                <div>
                  <div className="expense-total-label">Total Estimated Trip Budget</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    ₹{costPerKm}/km across {distanceKm} km
                  </div>
                </div>
                <div className="expense-total-value">
                  ₹{totalEstimatedExpense.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Interactive START / END TRIP Action Buttons */}
            <div>
              {tripState !== 'IN_PROGRESS' ? (
                <button
                  type="button"
                  className="btn-start-trip"
                  onClick={handleStartTrip}
                >
                  <Play size={18} fill="#ffffff" />
                  START TRIP NOW
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-end-trip"
                  onClick={() => setIsEndModalOpen(true)}
                >
                  <Square size={18} fill="#ffffff" />
                  END TRIP & AUDIT FUEL
                </button>
              )}
            </div>

            {/* PETROL CHORI (FUEL THEFT / CONSUMPTION) REPORT & EXPENSES AUDIT */}
            {choriReport ? (
              <div
                className={`petrol-chori-card ${
                  choriReport.isTheftSuspected
                    ? 'chori-alert-triggered'
                    : 'chori-normal'
                }`}
              >
                <div className="chori-header">
                  {choriReport.isTheftSuspected ? (
                    <AlertTriangle size={20} color="#dc2626" />
                  ) : (
                    <ShieldCheck size={20} color="#059669" />
                  )}
                  <span
                    className="chori-heading"
                    style={{
                      color: choriReport.isTheftSuspected ? '#dc2626' : '#059669'
                    }}
                  >
                    {choriReport.isTheftSuspected
                      ? '⚠️ Suspected Petrol Chori (Fuel Theft)'
                      : '✅ Fuel Consumption Normal'}
                  </span>
                </div>
                <p className="chori-text">
                  Distance: <b>{choriReport.actualDist} km</b> | Fuel Consumed:{' '}
                  <b>{choriReport.actualFuel} L</b> | Actual Mileage:{' '}
                  <b>{choriReport.actualMileageAchieved} km/L</b> (Expected: {standardMileage} km/L).
                </p>
                {choriReport.isTheftSuspected && (
                  <p
                    className="chori-text"
                    style={{ color: '#991b1b', marginTop: '6px', fontWeight: 600 }}
                  >
                    Discrepancy: +{choriReport.fuelDiscrepancy} Liters extra consumed! Check driver fuel bills and GPS detour logs.
                  </p>
                )}
                {choriReport.expenses && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Settled Trip Expenses:
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: '#475569' }}>
                      <span>Fuel: <b>₹{choriReport.expenses.fuelCost}</b></span>
                      <span>Toll: <b>₹{choriReport.expenses.tollTax}</b></span>
                      <span>Food: <b>₹{choriReport.expenses.food}</b></span>
                      <span>Water: <b>₹{choriReport.expenses.water}</b></span>
                      <span style={{ color: '#0f172a' }}>Total: <b style={{ color: '#009951' }}>₹{choriReport.expenses.totalActualExpense}</b> (Budgeted: ₹{choriReport.expenses.plannedBudget})</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="petrol-chori-card chori-normal">
                <div className="chori-header">
                  <ShieldCheck size={18} color="#059669" />
                  <span className="chori-heading" style={{ color: '#059669' }}>
                    Anti-Theft ("Petrol Chori") Engine Active
                  </span>
                </div>
                <p className="chori-text">
                  The system will automatically compare fuel consumed against baseline mileage ({standardMileage} km/L) when the trip ends.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. DIGITAL DOCUMENT VAULT */}
        <div className="doc-locker-section">
          {/* Vault Header */}
          <div className="doc-vault-header">
            <div>
              <h2 className="doc-vault-title">
                <FileText size={20} color="#2563eb" />
                Digital Document Vault
              </h2>
              <p className="doc-vault-sub">Store, manage and view all truck, driver & journey documents in one place</p>
            </div>
            <button
              type="button"
              className="doc-add-btn"
              onClick={() => setIsAddDocOpen(true)}
            >
              <Plus size={16} />
              Add Document
            </button>
          </div>

          {/* Category Tabs */}
          <div className="doc-tabs-bar">
            {[
              { key: 'TRUCK',   label: '🚛 Truck Documents',           sub: 'RC, Insurance, PUC, Permit' },
              { key: 'DRIVER',  label: '👤 Driver / Personal Docs',    sub: 'DL, Aadhaar, PAN, Medical' },
              { key: 'JOURNEY', label: '📋 Journey Documents',         sub: 'E-Way Bill, Invoice, Bilty' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`doc-tab-btn ${docTab === tab.key ? 'active' : ''}`}
                onClick={() => setDocTab(tab.key)}
              >
                <span className="doc-tab-label">{tab.label}</span>
                <span className="doc-tab-count">{(vaultDocs[tab.key] || []).length} docs</span>
              </button>
            ))}
          </div>

          {/* Document Cards Grid */}
          <div className="doc-cards-grid">
            {(vaultDocs[docTab] || []).map((doc) => (
              <div key={doc.id} className={`doc-file-card ${doc.fileUrl ? 'has-file' : ''}`}>
                {/* Left: Icon + Info */}
                <div className="doc-card-left">
                  <div className="doc-card-icon">
                    {doc.fileUrl
                      ? (doc.fileUrl.startsWith('data:application/pdf') || (doc.fileName && doc.fileName.endsWith('.pdf')))
                        ? '📄'
                        : '🖼️'
                      : '📁'
                    }
                  </div>
                  <div className="doc-card-text">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-tag">{doc.info}</div>
                    {doc.fileName && <div className="doc-filename">{doc.fileName}</div>}
                  </div>
                </div>

                {/* Right: Status + Actions */}
                <div className="doc-card-right">
                  <span
                    className="doc-status-badge"
                    style={doc.status === 'PENDING'
                      ? { background: '#fef3c7', color: '#b45309' }
                      : { background: '#ecfdf5', color: '#059669' }
                    }
                  >
                    {doc.status === 'PENDING' ? 'Pending' : 'Verified'}
                  </span>

                  <div className="doc-card-actions">
                    {/* View button (only if file uploaded) */}
                    {doc.fileUrl ? (
                      <button
                        type="button"
                        className="doc-action-btn doc-view-btn"
                        title="View Document"
                        onClick={() => setViewingDoc(doc)}
                      >
                        👁 View
                      </button>
                    ) : (
                      <label className="doc-action-btn doc-upload-label" title="Upload PDF / Image">
                        ⬆ Upload
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              handleUploadToExisting(docTab, doc.id, ev.target.result, file.name);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}

                    <button
                      type="button"
                      className="doc-action-btn doc-delete-btn"
                      title="Remove Document"
                      onClick={() => handleDeleteDoc(docTab, doc.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {(vaultDocs[docTab] || []).length === 0 && (
              <div className="doc-empty-state">
                <div className="doc-empty-icon">📂</div>
                <div className="doc-empty-title">No documents yet</div>
                <div className="doc-empty-sub">Click "Add Document" to upload your first document in this category.</div>
                <button
                  type="button"
                  className="doc-add-btn"
                  style={{ marginTop: '12px' }}
                  onClick={() => { setAddDocCategory(docTab); setIsAddDocOpen(true); }}
                >
                  <Plus size={14} /> Add Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT VIEWER MODAL */}
      {viewingDoc && (
        <div className="modal-overlay" onClick={() => setViewingDoc(null)}>
          <div className="doc-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="doc-viewer-header">
              <div className="doc-viewer-title">{viewingDoc.name}</div>
              <div className="doc-viewer-meta">{viewingDoc.info}</div>
              <div className="doc-viewer-actions">
                <a
                  href={viewingDoc.fileUrl}
                  download={viewingDoc.fileName || viewingDoc.name}
                  className="doc-viewer-download"
                >
                  ⬇ Download
                </a>
                <button
                  type="button"
                  className="doc-viewer-close"
                  onClick={() => setViewingDoc(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="doc-viewer-body">
              {viewingDoc.fileUrl && (
                (viewingDoc.fileUrl.startsWith('data:application/pdf') || (viewingDoc.fileName && viewingDoc.fileName.endsWith('.pdf')))
                  ? (
                    <iframe
                      src={viewingDoc.fileUrl}
                      title={viewingDoc.name}
                      className="doc-viewer-iframe"
                    />
                  ) : (
                    <img
                      src={viewingDoc.fileUrl}
                      alt={viewingDoc.name}
                      className="doc-viewer-img"
                    />
                  )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD DOCUMENT MODAL */}
      {isAddDocOpen && (
        <div className="modal-overlay" onClick={() => setIsAddDocOpen(false)}>
          <div className="modal-card add-doc-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 className="modal-header">Add New Document</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Upload a PDF or image to your vault</p>
              </div>
              <button type="button" onClick={() => setIsAddDocOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Category Selector */}
            <div className="add-doc-field">
              <label className="add-doc-label">Document Category</label>
              <div className="add-doc-category-pills">
                {[
                  { key: 'TRUCK',   icon: '🚛', label: 'Truck' },
                  { key: 'DRIVER',  icon: '👤', label: 'Driver / Personal' },
                  { key: 'JOURNEY', icon: '📋', label: 'Journey' },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`add-doc-pill ${addDocCategory === c.key ? 'active' : ''}`}
                    onClick={() => { setAddDocCategory(c.key); setAddDocName(''); }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Type Dropdown */}
            <div className="add-doc-field">
              <label className="add-doc-label">Document Type</label>
              <select
                className="add-doc-select"
                value={addDocName}
                onChange={(e) => setAddDocName(e.target.value)}
              >
                <option value="">-- Select document type --</option>
                {(DOC_PRESETS[addDocCategory] || []).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Custom name if "Other" */}
            {(addDocName.startsWith('Other') || !addDocName) && (
              <div className="add-doc-field">
                <label className="add-doc-label">Custom Document Name</label>
                <input
                  type="text"
                  className="add-doc-input"
                  placeholder="e.g. National Permit Renewal 2025"
                  value={addDocCustomName}
                  onChange={(e) => setAddDocCustomName(e.target.value)}
                />
              </div>
            )}

            {/* Additional Info */}
            <div className="add-doc-field">
              <label className="add-doc-label">Additional Info <span style={{ color: '#94a3b8' }}>(optional)</span></label>
              <input
                type="text"
                className="add-doc-input"
                placeholder="e.g. Valid till Dec 2026, Truck No. UP82AB1234"
                value={addDocInfo}
                onChange={(e) => setAddDocInfo(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div className="add-doc-field">
              <label className="add-doc-label">Upload File <span style={{ color: '#94a3b8' }}>(PDF or Image)</span></label>
              <label className="add-doc-file-zone">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                {addDocFile ? (
                  <div className="add-doc-file-preview">
                    <span style={{ fontSize: '24px' }}>{addDocFileName.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{addDocFileName}</div>
                      <div style={{ fontSize: '11px', color: '#059669' }}>✓ File selected — ready to save</div>
                    </div>
                    <button type="button" onClick={(e) => { e.preventDefault(); setAddDocFile(null); setAddDocFileName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="add-doc-file-placeholder">
                    <span style={{ fontSize: '28px' }}>📁</span>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>Click to choose PDF or image</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>PDF, JPG, PNG, WEBP supported</div>
                  </div>
                )}
              </label>
            </div>

            {/* Save Button */}
            <button
              type="button"
              className="btn-start-trip"
              style={{ marginTop: '4px', height: '46px', fontSize: '14px' }}
              onClick={handleAddDocSave}
              disabled={addDocSaving || (!addDocName && !addDocCustomName.trim())}
            >
              {addDocSaving ? 'Saving...' : '✓ Save Document to Vault'}
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: END TRIP INPUTS (Final Odometer & Fuel Consumed) */}
      {isEndModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-header">End Journey & Audit Trip</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Enter the odometer reading and total fuel consumed to calculate actual mileage and audit for petrol chori.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Starting Odometer
                </label>
                <input
                  type="text"
                  className="form-input disabled-input"
                  value={`${startOdo} km`}
                  disabled
                  style={{ width: '100%', height: '40px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Ending Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  placeholder={`e.g. ${startOdo + distanceKm}`}
                  value={finalOdometerInput}
                  onChange={(e) => setFinalOdometerInput(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Total Fuel Consumed / Refilled (Liters) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder={`Expected: ${expectedFuelLiters} L`}
                  value={actualFuelInput}
                  onChange={(e) => setActualFuelInput(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>

              {/* Journey Expenses Settlement */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  Actual Journey Expenses Settlement:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Toll Tax (₹)</label>
                    <input
                      type="number"
                      placeholder={`₹${tollTax}`}
                      value={actualTollInput}
                      onChange={(e) => setActualTollInput(e.target.value)}
                      style={{ width: '100%', height: '34px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Food (₹)</label>
                    <input
                      type="number"
                      placeholder={`₹${foodExpense}`}
                      value={actualFoodInput}
                      onChange={(e) => setActualFoodInput(e.target.value)}
                      style={{ width: '100%', height: '34px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Water / Misc (₹)</label>
                    <input
                      type="number"
                      placeholder={`₹${waterExpense}`}
                      value={actualWaterInput}
                      onChange={(e) => setActualWaterInput(e.target.value)}
                      style={{ width: '100%', height: '34px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsEndModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary-register"
                onClick={handleConfirmEndTrip}
              >
                Confirm & Compute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: SEE OTHER TRUCKS (FLEET OVERVIEW) */}
      {isFleetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFleetModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '860px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 className="modal-header" style={{ margin: 0 }}>
                    {userRole === 'owner'
                      ? `🚚 My Fleet Vehicles (${fleetTrucks.length})`
                      : `🚚 Available Fleet Vehicles (${fleetTrucks.length})`}
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: userRole === 'owner' ? '#ecfdf5' : '#eff6ff',
                      color: userRole === 'owner' ? '#009951' : '#2563eb',
                      border: userRole === 'owner' ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
                    }}
                  >
                    {userRole === 'owner' ? '👑 Fleet Owner Portal' : '🚚 Driver Mode'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  {userRole === 'owner'
                    ? 'Switch between vehicles to monitor their route, mileage, and maintenance health.'
                    : 'Choose your assigned vehicle to activate road navigation, highway amenities, and journey expenses.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFleetModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  padding: '6px',
                  borderRadius: '50%',
                  color: '#64748b',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Empty Fleet State */}
            {fleetTrucks.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px dashed #cbd5e1',
                  margin: '16px 0'
                }}
              >
                <Truck size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#1e293b' }}>No Trucks Found in Fleet</h4>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                  {userRole === 'owner'
                    ? 'You have not registered any trucks yet. Add your first vehicle to start tracking.'
                    : 'No trucks are registered in the company fleet yet. Please contact your Fleet Owner.'}
                </p>
                {userRole === 'owner' && (
                  <button
                    type="button"
                    className="btn-dropdown-action btn-green"
                    style={{ margin: '0 auto', display: 'inline-flex' }}
                    onClick={() => {
                      setIsFleetModalOpen(false);
                      navigate('/register-truck');
                    }}
                  >
                    <Plus size={15} />
                    + Register First Truck
                  </button>
                )}
              </div>
            ) : (
              <div className="fleet-modal-grid">
                {fleetTrucks.map((trk, idx) => {
                  const isSelected = trk.Truck_num === activeTruck.Truck_num;
                  const km = trk.kmSinceLastService !== undefined ? trk.kmSinceLastService : 1084;
                  const isAlert = trk.serviceDueAlert || km >= 10000;

                  return (
                    <div
                      key={idx}
                      className={`fleet-overview-card ${isSelected ? 'active-card' : ''}`}
                      onClick={() => handleSelectTruck(trk)}
                    >
                      <div>
                        {/* Top Plate & Status */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px'
                          }}
                        >
                          <span className="truck-plate">
                            {trk.Truck_num}
                          </span>

                          <span
                            className="status-badge"
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              background: isAlert ? '#fee2e2' : '#ecfdf5',
                              color: isAlert ? '#dc2626' : '#059669',
                              border: isAlert ? '1px solid #fecaca' : '1px solid #a7f3d0'
                            }}
                          >
                            {isAlert ? '⚠️ 10K Service Due' : '✓ Active'}
                          </span>
                        </div>

                        {/* Brand & Model */}
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                          {trk.Truck_brand} {trk.Truck_model}
                        </div>

                        {/* Driver & Mileage */}
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                          Driver: <b style={{ color: '#334155' }}>{trk.Driver_name || 'Assigned Driver'}</b> • {trk.Milage} km/L
                        </div>

                        {/* 10,000 km Service Progress */}
                        <div style={{ marginBottom: '14px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: '#64748b',
                              marginBottom: '4px'
                            }}
                          >
                            <span>Service Meter</span>
                            <span style={{ fontWeight: 600, color: isAlert ? '#dc2626' : '#334155' }}>
                              {km.toLocaleString()} / 10,000 km
                            </span>
                          </div>
                          <div className="progress-track" style={{ height: '6px' }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(100, (km / 10000) * 100)}%`,
                                backgroundColor: isAlert ? '#dc2626' : '#2563eb'
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Tailored to Role */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        {userRole === 'driver' ? (
                          /* Driver gets a clean, full-width action button */
                          <button
                            type="button"
                            className={`btn-dropdown-action ${isSelected ? 'btn-green' : ''}`}
                            style={{
                              width: '100%',
                              background: isSelected ? '#009951' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#1e293b',
                              padding: '9px 14px',
                              borderRadius: '8px',
                              border: isSelected ? 'none' : '1px solid #cbd5e1',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTruck(trk);
                            }}
                          >
                            {isSelected ? '✓ Currently Driving & Tracking' : '🚚 Select & Drive This Truck'}
                          </button>
                        ) : (
                          /* Owner gets Select & Track + Red Delete Button */
                          <>
                            <button
                              type="button"
                              className={`btn-dropdown-action ${isSelected ? 'btn-green' : ''}`}
                              style={{
                                flex: 1,
                                background: isSelected ? '#009951' : '#f1f5f9',
                                color: isSelected ? '#ffffff' : '#1e293b',
                                padding: '8px 12px',
                                borderRadius: '7px',
                                border: isSelected ? 'none' : '1px solid #cbd5e1',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTruck(trk);
                              }}
                            >
                              {isSelected ? '✓ Tracking on Map' : 'Select & Track'}
                            </button>

                            <button
                              type="button"
                              className="btn-delete-truck-card"
                              title={`Delete ${trk.Truck_num} from fleet`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTruck(e, trk.Truck_num);
                              }}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '8px 12px',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                fontSize: '12px',
                                fontWeight: 600,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Trash2 size={13} color="#dc2626" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add New Truck Dashed Card (OWNER ONLY) */}
                {userRole === 'owner' && (
                  <div
                    className="add-truck-dashed-card"
                    onClick={() => {
                      setIsFleetModalOpen(false);
                      navigate('/register-truck');
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px'
                      }}
                    >
                      <Plus size={22} color="#009951" />
                    </div>
                    <span style={{ fontWeight: 700, color: '#009951', fontSize: '13px' }}>
                      + Register Another Truck
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Add new vehicle & driver
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '16px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '12px'
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing <b>{fleetTrucks.length}</b> registered vehicle{fleetTrucks.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsFleetModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
