import Header from '@/app/components/Layout/Header';
import MainContent from '@/app/components/Layout/MainContent';
import Footer from '@/app/components/Layout/Footer';

export const metadata = {
  title: 'Carobar - Vehicle trade management for Dealers',
  description: 'Carobar is a SaaS application to manage vehicle sale/purchase business cycle',
  icons: {
    icon: '/favicon.ico', // or '/favicon.ico' depending on your project structure.
  },
};

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <MainContent className="flex-grow" />
      <Footer />
    </div>
  );
}
