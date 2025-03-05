"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import PurchaseModal from "./PurchaseModal";
import PageTemplate from "@/app/components/PageTemplate";

export default function PurchasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState({});

  const openNewPurchaseModal = () => {
    setIsEditing(false);
    setSelectedPurchase({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <PageTemplate title="Vehicle Purchases">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Vehicle Purchases</h2>
          <button
            onClick={openNewPurchaseModal}
            className="flex items-center gap-2 bg-maroon-600 hover:bg-maroon-700 text-white px-4 py-2 rounded-md"
          >
            <Plus size={16} />
            Add New Purchase
          </button>
        </div>
        
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          {/* Placeholder for purchase list - will be implemented in the future */}
          <div className="p-8 text-center text-gray-500">
            <p>Purchase data will be displayed here.</p>
            <p className="text-sm mt-2">Click the &quot;Add New Purchase&quot; button to create a purchase.</p>
          </div>
        </div>
      </div>
      
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isEditing={isEditing}
        initialData={selectedPurchase}
      />
    </PageTemplate>
  );
}
