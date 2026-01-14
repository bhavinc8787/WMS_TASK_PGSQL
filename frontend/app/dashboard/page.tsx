'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button } from '@mui/material';
import { WarehouseTable } from '@/app/components/WarehouseTable';
import { SearchBar } from '@/app/components/SearchBar';
import { WarehouseData } from '@/types';
import { warehouseAPI } from '@/lib/api';
import { Home, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<WarehouseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 7;
  // Read initial page from URL, default to 1
  const initialPage = Number(searchParams.get('page')) || 1;
  const [page, setPageState] = useState(initialPage);

  // Update URL when page changes
  const setPage = (newPage: number) => {
    setPageState(newPage);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    fetchWarehouses(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchWarehouses = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const res = await warehouseAPI.getAll(currentPage, limit);
      const data = res.data.data || [];
      
      if (data.length === 0 && currentPage > 1) {
        setPage(currentPage - 1);
        return;
      }
      
      setWarehouses(data);
      setFilteredWarehouses(data);

      // Store pagination info from backend
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string | { q?: string; state?: string; city?: string }) => {
    let searchObj: { q?: string; state?: string; city?: string } = {};
    if (typeof query === 'string') {
      if (!query.trim()) {
        setPage(1);
        fetchWarehouses(1);
        return;
      }
      searchObj.q = query;
    } else if (typeof query === 'object') {
      const { q, state, city } = query || {};
      if ((!q || !q.trim()) && !state && !city) {
        setPage(1);
        fetchWarehouses(1);
        return;
      }
      searchObj = { ...query };
    }

    setIsLoading(true);
    try {
      const res = await warehouseAPI.search(searchObj);
      const data = res.data.data || [];
      setFilteredWarehouses(data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(1);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleDeleteWarehouse = async (id: number) => {
  console.log('DELETE CLICKED ID:', id, typeof id);

  setIsLoading(true);
  try {
    await warehouseAPI.deleteWarehouse(id);
    fetchWarehouses(page);
  } catch (err) {
    console.error('DELETE ERROR', err);
  } finally {
    setIsLoading(false);
  }
};


  

  // const handleEditWarehouse = (w: WarehouseData) => {
  //   // navigate to the list-space form in edit mode using app router
  //   const id = w._id || w.warehouseId || '';
  //   router.push(`/dashboard/list-space?id=${id}`);
  // };
 
  const handleEditWarehouse = (w: WarehouseData) => {
  router.push(`/dashboard/list-space?id=${w.id}`);
};

  const visibleWarehouses = filteredWarehouses.filter(
    w => w.status !== 'in_active'
  );

  return (
    <ProtectedRoute>
      <Box>
      {/* Top Bar  */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '16px', fontWeight: 700, color: '#151515' }}>
          <Home size={20} />
          Listed Warehouse
        </Box>

        <Button
          onClick={() => router.push('/dashboard/list-space')}
          variant="contained"
          startIcon={<ShoppingCart size={18} />}
          sx={{
            background: '#1411e4',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '6px',
            px: 2
          }}
        >
          List Your Space
        </Button>
      </Box>

      <SearchBar onSearch={handleSearch} />

      {/* Main content */}
      <WarehouseTable
       warehouses={visibleWarehouses} 
        onEdit={handleEditWarehouse}
        onDelete={handleDeleteWarehouse}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      </Box>
    </ProtectedRoute>
  );
}
