/**
 * Indonesian Regions TanStack Query Hooks
 * Fetches data via backend proxy to avoid CORS issues
 */
import { useQuery } from '@tanstack/react-query';

// Use backend API proxy instead of direct external API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Default query options with longer cache time since region data is static
const defaultQueryOptions = {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Query keys
export const regionKeys = {
    all: ['regions'],
    provinces: () => [...regionKeys.all, 'provinces'],
    regencies: (provinceId) => [...regionKeys.all, 'regencies', provinceId],
    districts: (regencyId) => [...regionKeys.all, 'districts', regencyId],
    villages: (districtId) => [...regionKeys.all, 'villages', districtId],
};

/**
 * Fetch all provinces via backend proxy
 */
async function fetchProvinces() {
    const response = await fetch(`${BASE_URL}/regions/provinces`);
    if (!response.ok) throw new Error('Failed to fetch provinces');
    return response.json();
}

/**
 * Fetch regencies (kabupaten/kota) by province ID via backend proxy
 */
async function fetchRegencies(provinceId) {
    if (!provinceId) return [];
    const response = await fetch(`${BASE_URL}/regions/regencies/${provinceId}`);
    if (!response.ok) throw new Error('Failed to fetch regencies');
    return response.json();
}

/**
 * Fetch districts (kecamatan) by regency ID via backend proxy
 */
async function fetchDistricts(regencyId) {
    if (!regencyId) return [];
    const response = await fetch(`${BASE_URL}/regions/districts/${regencyId}`);
    if (!response.ok) throw new Error('Failed to fetch districts');
    return response.json();
}

/**
 * Fetch villages (kelurahan/desa) by district ID via backend proxy
 */
async function fetchVillages(districtId) {
    if (!districtId) return [];
    const response = await fetch(`${BASE_URL}/regions/villages/${districtId}`);
    if (!response.ok) throw new Error('Failed to fetch villages');
    return response.json();
}

/**
 * Hook to fetch all provinces
 */
export function useProvinces(options = {}) {
    return useQuery({
        queryKey: regionKeys.provinces(),
        queryFn: fetchProvinces,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch regencies by province ID
 * @param {string} provinceId - Province ID
 */
export function useRegencies(provinceId, options = {}) {
    return useQuery({
        queryKey: regionKeys.regencies(provinceId),
        queryFn: () => fetchRegencies(provinceId),
        enabled: !!provinceId,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch districts by regency ID
 * @param {string} regencyId - Regency ID
 */
export function useDistricts(regencyId, options = {}) {
    return useQuery({
        queryKey: regionKeys.districts(regencyId),
        queryFn: () => fetchDistricts(regencyId),
        enabled: !!regencyId,
        ...defaultQueryOptions,
        ...options,
    });
}

/**
 * Hook to fetch villages by district ID
 * @param {string} districtId - District ID
 */
export function useVillages(districtId, options = {}) {
    return useQuery({
        queryKey: regionKeys.villages(districtId),
        queryFn: () => fetchVillages(districtId),
        enabled: !!districtId,
        ...defaultQueryOptions,
        ...options,
    });
}
