import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
  runTransaction,
  type DatabaseReference,
} from 'firebase/database';

import type { OnboardingAsset, AssetLog } from '@/data/types';

import { getFirebaseDatabase } from '@/lib/firebase';

import type { Activity, Asset, Category, Location, Employee, Vendor } from '@/data/types';

const db = () => getFirebaseDatabase();

function assetsRef(): DatabaseReference {
  return ref(db(), 'assets');
}

function assetRef(id: string): DatabaseReference {
  return ref(db(), `assets/${id}`);
}

function locationsRef(): DatabaseReference {
  return ref(db(), 'locations');
}

function locationRef(id: string): DatabaseReference {
  return ref(db(), `locations/${id}`);
}

function categoriesRef(): DatabaseReference {
  return ref(db(), 'categories');
}

function categoryRef(id: string): DatabaseReference {
  return ref(db(), `categories/${id}`);
}

function activitiesRef(): DatabaseReference {
  return ref(db(), 'activities');
}

function employeesRef(): DatabaseReference {
  return ref(db(), 'employees');
}

function employeeRef(id: string): DatabaseReference {
  return ref(db(), `employees/${id}`);
}

function vendorsRef(): DatabaseReference {
  return ref(db(), 'vendors');
}

function vendorRef(id: string): DatabaseReference {
  return ref(db(), `vendors/${id}`);
}

// ——— Assets ———
export function subscribeAssets(callback: (list: Asset[]) => void): () => void {
  const r = assetsRef();
  const handler = (snap: { val(): Record<string, any> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val).map(([id, a]: [string, any]) => ({
      ...a,
      id,
      // Normalize legacy field names written by createAssetWithBarcode
      categoryName: a.categoryName ?? a.category ?? '',
      locationName: a.locationName ?? a.location ?? '',
    })) as Asset[];
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

export async function createAsset(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<string> {
  const r = push(assetsRef());
  const id = r.key!;
  await set(r, {
    ...asset,
    createdAt: Date.now(),
  });
  return id;
}

/** Two-phase onboarding: barcode string becomes the Realtime DB key */
export async function createAssetWithBarcode(
  barcode: string,
  asset: Omit<OnboardingAsset, 'asset_id' | 'createdAt'>
): Promise<void> {
  const r = ref(getFirebaseDatabase(), `assets/${barcode}`);
  await set(r, {
    ...asset,
    asset_id: barcode,
    createdAt: Date.now(),
  });
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<void> {
  await update(assetRef(id), data);
}

export async function deleteAsset(id: string): Promise<void> {
  await remove(assetRef(id));
}

// ——— Locations ———
export function subscribeLocations(callback: (list: Location[]) => void): () => void {
  const r = locationsRef();
  const handler = (snap: { val(): Record<string, Location> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val).map(([id, loc]) => ({ ...loc, id }));
    list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

export async function createLocation(loc: Omit<Location, 'id' | 'createdAt'>): Promise<string> {
  const r = push(locationsRef());
  const id = r.key!;
  await set(r, { ...loc, createdAt: Date.now() });
  return id;
}

/** Quick inline location creation (name only) used from LocationPicker */
export async function createLocationQuick(name: string): Promise<{ id: string; name: string }> {
  const r = push(locationsRef());
  const id = r.key!;
  await set(r, { name, createdAt: Date.now() });
  return { id, name };
}

export async function updateLocation(id: string, data: Partial<Location>): Promise<void> {
  await update(locationRef(id), data);
}

export async function deleteLocation(id: string): Promise<void> {
  await remove(locationRef(id));
}

// ——— Categories ———
export function subscribeCategories(callback: (list: Category[]) => void): () => void {
  const r = categoriesRef();
  const handler = (snap: { val(): Record<string, Category> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val).map(([id, c]) => ({ ...c, id }));
    list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

const DEFAULT_CATEGORIES = ['IT Equipment', 'Vehicles', 'Machinery', 'Furniture'];

export async function ensureDefaultCategories(): Promise<void> {
  const snap = await get(categoriesRef());
  if (snap.val() && Object.keys(snap.val()).length > 0) return;
  const now = Date.now();
  for (const name of DEFAULT_CATEGORIES) {
    const r = push(categoriesRef());
    await set(r, { name, createdAt: now });
  }
}

// ——— Activities ———
export function subscribeActivities(callback: (list: Activity[]) => void, limit = 20): () => void {
  const r = activitiesRef();
  const handler = (snap: { val(): Record<string, Activity> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val)
      .map(([id, a]) => ({ ...a, id }))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, limit);
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

export async function logActivity(
  message: string,
  extra?: Omit<Partial<Activity>, 'message' | 'time' | 'createdAt' | 'id'>
): Promise<void> {
  const r = push(activitiesRef());
  const data: Partial<Activity> = {
    message,
    time: new Date().toISOString(),
    createdAt: Date.now(),
    ...extra,
  };
  await set(r, data);
}

// ——— Employees ———
export function subscribeEmployees(callback: (list: Employee[]) => void): () => void {
  const r = employeesRef();
  const handler = (snap: { val(): Record<string, Employee> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val).map(([id, e]) => ({ ...e, id }));
    list.sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? ''));
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

export async function createEmployee(emp: Omit<Employee, 'id' | 'createdAt'>): Promise<string> {
  const r = push(employeesRef());
  const id = r.key!;
  await set(r, { ...emp, createdAt: Date.now() });
  return id;
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
  await update(employeeRef(id), data);
}

// ——— Vendors ———
export function subscribeVendors(callback: (list: Vendor[]) => void): () => void {
  const r = vendorsRef();
  const handler = (snap: { val(): Record<string, Vendor> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val).map(([id, v]) => ({ ...v, id }));
    list.sort((a, b) => (a.company_name ?? '').localeCompare(b.company_name ?? ''));
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

export async function createVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<string> {
  const r = push(vendorsRef());
  const id = r.key!;
  await set(r, { ...vendor, createdAt: Date.now() });
  return id;
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<void> {
  await update(vendorRef(id), data);
}

export async function assignAssetToEmployee(barcode: string, employee: Employee): Promise<void> {
  const empRef = employeeRef(employee.id);
  const astRef = assetRef(barcode);
  const now = Date.now();

  // 1. Transaction to increment count safely
  await runTransaction(empRef, (currentData) => {
    if (currentData) {
      if (!currentData.assigned_assets_count) {
        currentData.assigned_assets_count = 0;
      }
      currentData.assigned_assets_count++;
    }
    return currentData;
  });

  // 2. Update asset status, assignee, location, and date
  const employeeLocation = employee.location ?? employee.department;
  await update(astRef, {
    status: 'Assigned',
    assignedTo: employee.full_name,
    assigned_to: employee.full_name,
    location: employeeLocation,
    locationName: employeeLocation,
    last_assigned_date: now,
  });

  // 3. Activity log
  await logActivity(`Assigned asset ${barcode} to ${employee.full_name}`, {
    type: 'ASSIGNMENT',
    asset_id: barcode,
    target_id: employee.id,
    metadata: { target_name: employee.full_name }
  });
}

/** Return / unassign an asset — sets status to Available, clears assignee */
export async function unassignAsset(assetId: string, employeeId?: string): Promise<void> {
  const astRef = assetRef(assetId);

  // Get current asset to find who it's assigned to (for activity log)
  const snap = await get(astRef);
  const assetData = snap.val() as Asset | null;
  const assigneeName = assetData?.assignedTo ?? 'unknown';

  // 1. Update asset
  await update(astRef, {
    status: 'Available',
    assignedTo: null,
  });

  // 2. Decrement employee count if we know which employee
  const empId = employeeId;
  if (empId) {
    const empRef = employeeRef(empId);
    await runTransaction(empRef, (currentData) => {
      if (currentData && currentData.assigned_assets_count > 0) {
        currentData.assigned_assets_count--;
      }
      return currentData;
    });
  }

  // 3. Activity log
  await logActivity(`Asset ${assetId} returned from ${assigneeName}`, {
    type: 'ASSIGNMENT',
    asset_id: assetId,
    metadata: { action: 'unassign', previous_assignee: assigneeName },
  });
}

// ——— Asset Logs (per-asset sub-collection) ———

function assetLogsRef(assetId: string): DatabaseReference {
  return ref(db(), `assets/${assetId}/logs`);
}

/** Subscribe to the last N log entries for a specific asset */
export function subscribeAssetLogs(
  assetId: string,
  callback: (logs: AssetLog[]) => void,
  limit = 10
): () => void {
  const r = assetLogsRef(assetId);
  const handler = (snap: { val(): Record<string, AssetLog> | null }) => {
    const val = snap.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.entries(val)
      .map(([id, log]) => ({ ...log, id }))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, limit);
    callback(list);
  };
  onValue(r, handler);
  return () => off(r);
}

/** Push a log entry to an asset's logs sub-collection */
export async function addAssetLog(
  assetId: string,
  logEntry: Omit<AssetLog, 'id' | 'createdAt'>
): Promise<void> {
  const r = push(assetLogsRef(assetId));
  await set(r, { ...logEntry, createdAt: Date.now() });
}

// ——— Asset Lifecycle Actions ———

/** Move asset to maintenance — update location to vendor's location, set status, increment count, add log */
export async function moveToMaintenance(
  assetId: string,
  vendor: Vendor,
  cost: number = 0
): Promise<void> {
  const astRef = assetRef(assetId);
  const snap = await get(astRef);
  const assetData = snap.val();
  const prevLocation = assetData?.location ?? assetData?.locationName ?? 'unknown';

  // 1. Update asset
  await update(astRef, {
    status: 'Maintenance',
    location: vendor.location_name ?? vendor.company_name,
    locationName: vendor.location_name ?? vendor.company_name,
    current_vendor_name: vendor.company_name,
  });

  // 2. Increment maintenance_count via transaction
  await runTransaction(astRef, (data) => {
    if (data) {
      data.maintenance_count = (data.maintenance_count ?? 0) + 1;
    }
    return data;
  });

  // 3. Add log to asset's logs sub-collection
  const today = new Date().toISOString().split('T')[0];
  await addAssetLog(assetId, {
    date: today,
    type: 'MAINTENANCE',
    note: `Sent to ${vendor.company_name} (Cost: NPR ${cost}). Loc: ${vendor.location_name ?? 'N/A'}. Prev loc: ${prevLocation}`,
  });

  // 4. Activity log
  await logActivity(`Asset ${assetId} sent to maintenance at ${vendor.company_name}`, {
    type: 'MAINTENANCE',
    asset_id: assetId,
    target_id: vendor.id,
    cost: cost,
    metadata: { vendor: vendor.company_name, previous_location: prevLocation, cost: cost },
  });
}

/** Return asset from maintenance/assignment to a new internal location */
export async function returnToBase(
  assetId: string,
  newLocation: string
): Promise<void> {
  const astRef = assetRef(assetId);
  const snap = await get(astRef);
  const assetData = snap.val();
  const prevLocation = assetData?.location ?? assetData?.locationName ?? 'unknown';
  const prevStatus = assetData?.status ?? 'unknown';

  // 1. Update asset
  await update(astRef, {
    status: 'Available',
    location: newLocation,
    locationName: newLocation,
    current_vendor_name: null,
  });

  // 2. Add log
  const today = new Date().toISOString().split('T')[0];
  await addAssetLog(assetId, {
    date: today,
    type: 'RETURN',
    note: `Returned to "${newLocation}" from ${prevStatus} (was at: ${prevLocation})`,
  });

  // 3. Activity log
  await logActivity(`Asset ${assetId} returned to ${newLocation}`, {
    type: 'STATUS_CHANGE',
    asset_id: assetId,
    metadata: { previous_status: prevStatus, new_status: 'Available', new_location: newLocation },
  });
}

/** Scrap an asset — soft-delete: mark as Scrapped, add log with reason + price */
export async function scrapAsset(
  assetId: string,
  reason: string,
  scrapPrice: number,
  scrapVendorId?: string
): Promise<void> {
  const astRef = assetRef(assetId);
  const snap = await get(astRef);
  const assetData = snap.val();
  const prevStatus = assetData?.status ?? 'unknown';

  // 1. Update status
  let vendorName = null;
  if (scrapVendorId) {
    const vendorSnap = await get(vendorRef(scrapVendorId));
    if (vendorSnap.exists()) {
      vendorName = vendorSnap.val().company_name;
    }
  }

  await update(astRef, {
    status: 'Scrapped',
    scrap_reason: reason,
    scrap_price: scrapPrice,
    current_vendor_name: vendorName,
  });

  // 2. Add log
  const today = new Date().toISOString().split('T')[0];
  const vendorContext = vendorName ? ` to ${vendorName}` : '';
  await addAssetLog(assetId, {
    date: today,
    type: 'SCRAP',
    note: `Scrapped${vendorContext}: "${reason}" (value: ${scrapPrice}). Previous status: ${prevStatus}`,
  });

  // 3. Activity log
  await logActivity(`Asset ${assetId} scrapped${vendorContext}: ${reason}`, {
    type: 'SCRAP',
    asset_id: assetId,
    cost: scrapPrice,
    metadata: { reason, previous_status: prevStatus, scrap_vendor: vendorName },
  });
}

/** Mark an asset as Lost */
export async function markAsLost(assetId: string): Promise<void> {
  const astRef = assetRef(assetId);
  const snap = await get(astRef);
  const assetData = snap.val();
  const prevStatus = assetData?.status ?? 'unknown';

  // 1. Update status
  await update(astRef, {
    status: 'Lost',
  });

  // 2. Add log
  const today = new Date().toISOString().split('T')[0];
  await addAssetLog(assetId, {
    date: today,
    type: 'STATUS_CHANGE',
    note: `Marked as Lost. Previous status: ${prevStatus}`,
  });

  // 3. Activity log
  await logActivity(`Asset ${assetId} marked as Lost`, {
    type: 'STATUS_CHANGE',
    asset_id: assetId,
    metadata: { previous_status: prevStatus, new_status: 'Lost' },
  });
}
