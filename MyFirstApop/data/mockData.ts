export const KPI = {
  totalAssets: 248,
  inUse: 182,
  inMaintenance: 36,
  available: 18,
  lost: 7,
  scrap: 5,
} as const;

export type AssetStatus = 'Active' | 'Maintenance' | 'Assigned' | 'Offline';

export const STATUS_COLORS: Record<AssetStatus, string> = {
  Active: '#16A34A',
  Maintenance: '#F59E0B',
  Assigned: '#2563EB',
  Offline: '#DC2626',
};

export const statusBreakdown: { x: AssetStatus; y: number }[] = [
  { x: 'Active', y: 142 },
  { x: 'Maintenance', y: 36 },
  { x: 'Assigned', y: 58 },
  { x: 'Offline', y: 12 },
];

export type AssetCategory = {
  id: number;
  name: string;
  count: number;
};

export const categories: AssetCategory[] = [
  { id: 1, name: 'IT Equipment', count: 52 },
  { id: 2, name: 'Vehicles', count: 29 },
  { id: 3, name: 'Machinery', count: 18 },
  { id: 4, name: 'Furniture', count: 8 },
];

export type Activity = {
  id: string;
  message: string;
  time: string;
};

export const activities: Activity[] = [
  {
    id: '1',
    message: 'Laptop Dell XPS assigned to John Doe',
    time: '15 mins ago',
  },
  {
    id: '2',
    message: 'Printer HP LaserJet moved to HQ Office',
    time: '1 hour ago',
  },
  {
    id: '3',
    message: 'Forklift tires replaced',
    time: '3 hours ago',
  },
];

export type Asset = {
  id: string;
  name: string;
  status: AssetStatus;
  location: string;
  assignedTo: string | null;
};

export const assets: Asset[] = [
  {
    id: 'A12345',
    name: 'Dell XPS 15',
    status: 'Active',
    location: 'HQ Office',
    assignedTo: 'John Doe',
  },
  {
    id: 'B67890',
    name: 'HP LaserJet 400',
    status: 'Maintenance',
    location: 'Warehouse',
    assignedTo: null,
  },
];

