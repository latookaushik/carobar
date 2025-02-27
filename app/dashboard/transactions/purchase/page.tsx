"use client"

export default function PurchasePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Purchase Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Purchases</h2>
          <button className="bg-maroon-500 hover:bg-maroon-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            + New Purchase
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input 
                type="text" 
                id="search" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
                placeholder="Search by reference, supplier..." 
              />
            </div>
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select 
                id="date-range" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option>Last 30 days</option>
                <option>This month</option>
                <option>Last month</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="status" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option>All statuses</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample data */}
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-maroon-600">PO-2025-{1000 + item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-02-{14 + item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">JDM Auto Trading</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Toyota Camry {2020 + item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$24,{500 + (item * 100)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                    <button className="text-maroon-600 hover:text-maroon-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">25</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
