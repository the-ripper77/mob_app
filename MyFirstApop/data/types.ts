export type AssetStatus = 'Available' | 'Maintenance' | 'Assigned' | 'Lost' | 'Scrapped';

export type Asset = {
  id: string;
  name: string;
  status: AssetStatus;
  locationId: string;
  locationName: string;
  assignedTo: string | null;
  categoryId: string;
  categoryName: string;
  createdAt: number;
  notes?: string;

  // Additional Lifecycle/Onboarding fields
  purchase_date?: number;
  purchase_price?: number;
  vendor_id?: string;
  current_vendor_name?: string;
  maintenance_count?: number;
  last_known_location?: string;
  details?: FurnitureDetails | ITEquipmentDetails | MachineryDetails | VehicleDetails;
  scrap_reason?: string;
  scrap_price?: number;
};

export type Location = {
  id: string;
  name: string;
  address?: string;
  /** Latitude for map pin (-90 to 90) */
  latitude?: number;
  /** Longitude for map pin (-180 to 180) */
  longitude?: number;
  createdAt: number;
};

/** Individual log entries under assets/{barcode}/logs */
export type AssetLog = {
  id: string;
  date: string;       // ISO date e.g. "2026-02-22"
  type: string;        // e.g. INTAKE, MAINTENANCE, RETURN, SCRAP, STATUS_CHANGE
  note: string;
  createdAt: number;
};

export type Category = {
  id: string;
  name: string;
  createdAt: number;
};

export type ActivityType = 'MAINTENANCE' | 'ASSIGNMENT' | 'SCRAP' | 'INTAKE' | 'STATUS_CHANGE';

export type Activity = {
  id: string;
  type?: ActivityType;         // Optional for backward compatibility
  message: string;
  time: string;
  createdAt: number;

  // New structured fields for advanced reporting
  asset_id?: string;
  cost?: number;
  actor_id?: string;
  target_id?: string;
  metadata?: Record<string, any>;
};

export const ASSET_STATUSES: AssetStatus[] = ['Available', 'Maintenance', 'Assigned', 'Lost', 'Scrapped'];

export const STATUS_COLORS: Record<AssetStatus, string> = {
  Available: '#16A34A',
  Maintenance: '#F59E0B',
  Assigned: '#2563EB',
  Lost: '#DC2626',
  Scrapped: '#94A3B8',
};


export type AssetCategory = 'Furniture' | 'IT Equipment' | 'Machinery' | 'Vehicles';

export const ASSET_CATEGORIES: AssetCategory[] = ['Furniture', 'IT Equipment', 'Machinery', 'Vehicles'];

export type FurnitureDetails = {
  material: 'Wood' | 'Metal' | 'Fabric' | 'Plastic' | '';
  dimensions: string;
  is_assembled: boolean;
};

export type ITEquipmentDetails = {
  brand_model: string;
  serial_number: string;
  specs: { cpu: string; ram: string; storage: string };
  os_version: string;
};

export type MachineryDetails = {
  power_specs: string;
  meter_reading: string;
  safety_cert_date: string;
  emergency_contact: string;
};

export type VehicleDetails = {
  license_plate: string;
  vin: string;
  fuel_type: 'Electric' | 'Diesel' | 'Petrol' | 'Hybrid' | '';
  odometer: string;
};

export type CategoryDetails =
  | ({ category: 'Furniture' } & FurnitureDetails)
  | ({ category: 'IT Equipment' } & ITEquipmentDetails)
  | ({ category: 'Machinery' } & MachineryDetails)
  | ({ category: 'Vehicles' } & VehicleDetails);

export type OnboardingAsset = {
  asset_id: string; // The barcode string
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string;
  purchase_date: number; // Timestamp (ms)
  purchase_price: number;
  vendor_id: string;
  current_vendor_name?: string;
  maintenance_count: number;
  assigned_to: string;
  createdAt: number;
  last_known_location?: string; // Rule 2: required for lost items
  details: FurnitureDetails | ITEquipmentDetails | MachineryDetails | VehicleDetails;
};

export const MATERIAL_OPTIONS = ['Wood', 'Metal', 'Fabric', 'Plastic'] as const;
export const FUEL_TYPE_OPTIONS = ['Electric', 'Diesel', 'Petrol', 'Hybrid'] as const;


export type Employee = {
  id: string; // Firebase key
  employee_id: string; // Unique custom ID
  full_name: string;
  department: string;
  email: string;
  location?: string;
  assigned_assets_count: number;
  createdAt: number;
};

export type VendorTag = 'Seller' | 'Repair' | 'Scrap';
export const VENDOR_TAGS: VendorTag[] = ['Seller', 'Repair', 'Scrap'];

export type Vendor = {
  id: string; // Firebase key
  company_name: string;
  category_tags: VendorTag[];
  contact_email: string;
  phone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location_id?: string;
  location_name?: string;
  createdAt: number;
};
