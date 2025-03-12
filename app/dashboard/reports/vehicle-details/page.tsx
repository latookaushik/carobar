'use client';

export default function VehicleDetailsReportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Vehicle Details Report</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="maker" className="block text-sm font-medium text-gray-700 mb-1">
                Maker
              </label>
              <select
                id="maker"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option value="">All Makers</option>
                <option>Toyota</option>
                <option>Honda</option>
                <option>Nissan</option>
                <option>Mazda</option>
                <option>Subaru</option>
              </select>
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                id="model"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
                placeholder="Enter model name"
              />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="year"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option value="">All Years</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                id="color"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option value="">All Colors</option>
                <option>Black</option>
                <option>White</option>
                <option>Silver</option>
                <option>Blue</option>
                <option>Red</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option value="">All Statuses</option>
                <option>In Stock</option>
                <option>Sold</option>
                <option>In Transit</option>
                <option>Reserved</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="bg-maroon-500 hover:bg-maroon-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full">
                Generate Report
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chassis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample data */}
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-maroon-600">
                    ST-{10000 + item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Toyota</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Camry</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {2020 + item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">White</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    JTDBE3{2020 + item}
                    {100000 + item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {12000 + item * 5000} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Warehouse A</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span>{' '}
            of <span className="font-medium">32</span> results
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
