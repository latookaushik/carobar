'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import ReferenceTable from '@/app/components/master/ReferenceTable';
import {
  bankSchema,
  colorSchema,
  makerSchema,
  vehicleTypeSchema,
  locationSchema,
  countrySchema,
  fuelTypeSchema,
  invoiceTermsSchema,
} from '@/app/lib/validations/master';

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('banks');

  const tables = [
    { id: 'banks', name: 'Banks', endpoint: '/api/master/banks', schema: bankSchema },
    { id: 'colors', name: 'Colors', endpoint: '/api/master/colors', schema: colorSchema },
    { id: 'makers', name: 'Makers', endpoint: '/api/master/makers', schema: makerSchema },
    { id: 'countries', name: 'Countries', endpoint: '/api/master/countries', schema: countrySchema },
    { id: 'fueltypes', name: 'Fuel Types', endpoint: '/api/master/fueltypes', schema: fuelTypeSchema },
    { id: 'invoiceterms', name: 'Invoice Terms', endpoint: '/api/master/invoiceterms', schema: invoiceTermsSchema },
    { id: 'locations', name: 'Locations', endpoint: '/api/master/locations', schema: locationSchema },
    { id: 'vehicletypes', name: 'Vehicle Types', endpoint: '/api/master/vehicletypes', schema: vehicleTypeSchema },
  ];

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold">Master Data Management</h1>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <TabsTrigger key={table.id} value={table.id}>
                {table.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tables.map((table) => (
            <TabsContent key={table.id} value={table.id}>
              <ReferenceTable 
                title={table.name}
                endpoint={table.endpoint}
                schema={table.schema}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
