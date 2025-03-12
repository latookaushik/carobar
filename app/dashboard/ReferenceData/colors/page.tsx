'use client';

/**
 * Color Management Page
 *
 * Provides UI for viewing, adding, editing, and deleting colors
 * for the authenticated user's company.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Role } from '@/app/lib/roles';
import PageTemplate from '@/app/components/PageTemplate';
import { PlusCircle, Edit, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { toast } from '@/app/components/ui/use-toast';

interface Color {
  color: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

// Function to determine if a color is valid CSS color
const isValidColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

// Function to determine if color is light or dark (for text contrast)
const isLightColor = (color: string): boolean => {
  // If not valid color, return true (we'll treat as light)
  if (!isValidColor(color)) return true;

  try {
    // Convert to RGB then calculate luminance
    const s = new Option().style;
    s.color = color;
    // Try to extract RGB values from computed style
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Extract RGB values if format is "rgb(r, g, b)"
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10) / 255;
      const g = parseInt(rgbMatch[2], 10) / 255;
      const b = parseInt(rgbMatch[3], 10) / 255;

      // Calculate luminance
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luminance > 0.5;
    }

    return true; // Default to light if we can't determine
  } catch (error) {
    console.error('Error determining color brightness:', error);
    return true; // Default to light on error
  }
};

export default function ColorsPage() {
  const {} = useAuth();

  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, { first_name: string; last_name: string }>>({});

  const [newColor, setNewColor] = useState('');
  const [addingColor, setAddingColor] = useState(false);

  const [editColorId, setEditColorId] = useState<string | null>(null);
  const [editColorValue, setEditColorValue] = useState('');

  // Load colors and users on component mount
  useEffect(() => {
    fetchColors();
    fetchUsers();
  }, []);

  // Function to fetch users from ref_users.json
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();

      // Create a lookup object with user_id as key and name info as value
      const userMap: Record<string, { first_name: string; last_name: string }> = {};
      if (data.users) {
        data.users.forEach((user: { user_id: string; first_name: string; last_name: string }) => {
          userMap[user.user_id] = {
            first_name: user.first_name,
            last_name: user.last_name,
          };
        });
      }
      setUsers(userMap);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Function to fetch colors from API
  const fetchColors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/colors');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch colors');
      }

      const data = await response.json();
      setColors(data.colors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding a new color
  const handleAddColor = async () => {
    if (!newColor.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Color name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color: newColor.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add color');
      }

      // Refresh colors list and reset form
      await fetchColors();
      setNewColor('');
      setAddingColor(false);

      toast({
        title: 'Success',
        description: 'Color added successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle updating a color
  const handleUpdateColor = async (oldColor: string) => {
    if (!editColorValue.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Color name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Format the request body according to the referenceDataController format
      const requestBody = {
        oldColor: {
          color: oldColor,
        },
        newColor: {
          color: editColorValue.trim(),
        },
      };

      console.log('Sending color update request:', requestBody);

      const response = await fetch('/api/colors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update color');
      }

      // Refresh colors list and reset edit state
      await fetchColors();
      setEditColorId(null);
      setEditColorValue('');

      toast({
        title: 'Success',
        description: 'Color updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Function to handle deleting a color
  const handleDeleteColor = async (color: string) => {
    if (!window.confirm(`Are you sure you want to delete the color "${color}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/colors?color=${encodeURIComponent(color)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete color');
      }

      // Refresh colors list
      await fetchColors();

      toast({
        title: 'Success',
        description: 'Color deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Start editing a color
  const startEditColor = (color: Color) => {
    setEditColorId(color.color);
    setEditColorValue(color.color);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditColorId(null);
    setEditColorValue('');
  };

  // Get a color display element for the provided color name
  const getColorDisplay = (colorName: string) => {
    const isValid = isValidColor(colorName);
    const displayColor = isValid ? colorName : '#e5e7eb'; // Use gray if invalid
    const textColor = isValid && !isLightColor(colorName) ? 'white' : 'black';

    return (
      <div className="flex items-center space-x-2">
        <div
          className="w-6 h-6 rounded border shadow-sm flex items-center justify-center"
          style={{
            backgroundColor: displayColor,
            borderColor: '#ddd',
            color: textColor,
          }}
        >
          {!isValid && '?'}
        </div>
        <span>{colorName}</span>
      </div>
    );
  };

  return (
    <PageTemplate title="Color Management" requiredRoles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Color Management</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchColors}
              className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {!addingColor && (
              <button
                onClick={() => setAddingColor(true)}
                className="flex items-center gap-1 bg-maroon-600 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <PlusCircle size={16} />
                Add New Color
              </button>
            )}
          </div>
        </div>

        {/* Add new color form */}
        {addingColor && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Add New Color</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Name *</label>
                <input
                  type="text"
                  placeholder="Enter color name"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full p-2 border rounded"
                  maxLength={30}
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setAddingColor(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColor}
                className="bg-maroon-600 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add Color
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 my-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Colors table */}
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full bg-white table-auto text-sm">
            <thead className="bg-maroon-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b text-left">Color</th>
                <th className="py-2 px-4 border-b text-left">Updated By</th>
                <th className="py-2 px-4 border-b text-left">Updated At</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading colors...
                    </div>
                  </td>
                </tr>
              ) : colors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No colors found. Add your first color by clicking the &quot;Add New Color&quot;
                    button.
                  </td>
                </tr>
              ) : (
                colors.map((color) => (
                  <tr key={color.color} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {editColorId === color.color ? (
                        <input
                          type="text"
                          value={editColorValue}
                          onChange={(e) => setEditColorValue(e.target.value)}
                          className="w-full p-1 border rounded"
                          maxLength={30}
                        />
                      ) : (
                        getColorDisplay(color.color)
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {users[color.updated_by]
                        ? `${users[color.updated_by].first_name} ${users[color.updated_by].last_name}`
                        : color.updated_by}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(color.updated_at)
                        .toLocaleString('en-GB', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })
                        .replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6')}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {editColorId === color.color ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUpdateColor(color.color)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => startEditColor(color)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteColor(color.color)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTemplate>
  );
}
