'use client';

export default function PartyAccountPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Party Account</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Account Statements</h2>
          <div className="flex space-x-2">
            <button className="bg-maroon-500 hover:bg-maroon-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              + New Transaction
            </button>
            <button className="border border-maroon-500 text-maroon-500 hover:bg-maroon-50 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="party-type" className="block text-sm font-medium text-gray-700 mb-1">
                Party Type
              </label>
              <select
                id="party-type"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option value="">All Types</option>
                <option>Supplier</option>
                <option>Buyer</option>
                <option>Shipper</option>
                <option>Transport</option>
              </select>
            </div>
            <div>
              <label htmlFor="party-name" className="block text-sm font-medium text-gray-700 mb-1">
                Party Name
              </label>
              <select
                id="party-name"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              >
                <option value="">Select Party</option>
                <option>JDM Auto Trading</option>
                <option>Tokyo Exports</option>
                <option>Global Auto Shipping</option>
                <option>Premium Cars Ltd</option>
              </select>
            </div>
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="from-date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="to-date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-maroon-500 focus:ring focus:ring-maroon-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-maroon-500 hover:bg-maroon-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              View Account Statement
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-md font-semibold">JDM Auto Trading</h3>
              <p className="text-sm text-gray-600">Supplier</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Statement Period</p>
              <p className="text-sm font-medium">Jan 1, 2025 - Feb 15, 2025</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Opening Balance</p>
              <p className="text-xl font-bold text-gray-800">$12,500.00</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-xl font-bold text-gray-800">$85,750.00</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">Closing Balance</p>
              <p className="text-xl font-bold text-gray-800">$98,250.00</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Opening Balance */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 1, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Opening Balance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  $12,500.00
                </td>
              </tr>

              {/* Sample transactions */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 5, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-maroon-600">
                  PO-2025-1001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Toyota Camry 2025 Purchase
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">$24,500.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  $37,000.00
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 12, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-maroon-600">
                  PAY-2025-052
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Payment to JDM Auto Trading
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">$15,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  $22,000.00
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 18, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-maroon-600">
                  PO-2025-1015
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Honda Accord 2025 Purchase
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">$26,750.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  $48,750.00
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Feb 2, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-maroon-600">
                  PO-2025-1023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Nissan Altima 2025 Purchase
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">$22,500.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  $71,250.00
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Feb 10, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-maroon-600">
                  PAY-2025-078
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Payment to JDM Auto Trading
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">$25,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  $46,250.00
                </td>
              </tr>

              {/* Closing Balance */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Feb 15, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Closing Balance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  $98,250.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
