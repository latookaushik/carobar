import Features from '@/app/components/Layout/Features';
export default function Hero() {
  return (
    <section className="px-6 py-6  max-w-full mx-auto">
      <h2 className="text-5xl md:text-6xl font-bold mb-6 text-maroon-800">
        Revolutionizing Vehicle Trade Management
      </h2>
      <p className="text-gray-800 text-lg md:text-xl mb-10">
        Streamline your business operations with complete solution to manage procurement, sales,
        shipments, invoicing and accounting.
      </p>
      <Features />
    </section>
  );
}
