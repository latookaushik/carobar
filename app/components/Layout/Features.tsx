export default function Features() {
    return (
      <section className="mt-20 bg-white py-16">
        <h3 className="text-4xl font-bold mb-10 text-maroon-800">Features</h3>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
          {featureData.map(({ title, description }) => (
            <Feature key={title} title={title} description={description} />
          ))}
        </div>
      </section>
    );
  }
  
  const featureData = [
    { title: "Purchase Management", description: "Manage vehicle purchases with detailed records and reports." },
    { title: "Sales Tracking", description: "Track sales with comprehensive analytics and insights." },
    { title: "Shipment Coordination", description: "Coordinate shipments with ease and efficiency." },
    { title: "Invoicing Solutions", description: "Generate invoices quickly and manage with ease." },
  ];
  
  function Feature({ title, description }: { title: string; description: string }) {
    return (
      <div className="bg-maroon-100 p-8 rounded-lg shadow-md hover:shadow-xl transition">
        <h4 className="text-2xl font-bold mb-3 text-maroon-800">{title}</h4>
        <p className="text-gray-800">{description}</p>
      </div>
    );
  }