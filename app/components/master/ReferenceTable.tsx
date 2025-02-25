'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm,  Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { toast } from '@/app/components/ui/use-toast';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

interface ReferenceTableProps<T extends z.ZodType<any>> {
  title: string;
  endpoint: string;
  schema: T;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TableData {
  id: string;
  [key: string]: any;
}

export default function ReferenceTable<T extends z.ZodType<any>>({ title, endpoint, schema }: ReferenceTableProps<T>) {
  const [data, setData] = useState<TableData[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TableData | null>(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        page: meta.page.toString(),
        limit: meta.limit.toString(),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`${endpoint}?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result.data || result);
      if (result.meta) {
        setMeta(result.meta);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  }, [endpoint, meta.page, meta.limit, sortBy, sortOrder, debouncedSearchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (formData: z.infer<T>) => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      toast({
        title: 'Success',
        description: `Data ${editingItem ? 'updated' : 'saved'} successfully`,
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save data',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (item: TableData) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const primaryKey = Object.keys(item)[0];
      const response = await fetch(`${endpoint}?${primaryKey}=${item[primaryKey]}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete data');

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: TableData) => {
    setEditingItem(item);
    reset(item);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    reset();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setMeta(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const filteredColumns = columns.filter(
    col => !['company_id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(col)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>Add New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add New'} {title}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {filteredColumns.map(column => {
                  const fieldName = column as Path<z.infer<T>>;
                  return (
                    <div key={column} className="space-y-2">
                      <label htmlFor={column} className="text-sm font-medium">
                        {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <Input
                        id={column}
                        {...register(fieldName)}
                        type={column.startsWith('is_') ? 'checkbox' : 'text'}
                      />
                      {errors[fieldName]?.message as string}
                    </div>
                  );
                })}
                <Button type="submit">{editingItem ? 'Update' : 'Save'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {filteredColumns.map(column => (
                <TableHead
                  key={column}
                  className="cursor-pointer"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {sortBy === column && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {filteredColumns.map(key => (
                  <TableCell key={key}>
                    {typeof row[key as keyof TableData] === 'string' || typeof row[key as keyof TableData] === 'number' ? row[key as keyof TableData] : ''}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(row)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(row)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === meta.page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
