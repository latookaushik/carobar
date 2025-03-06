import Head from 'next/head';
import Header from '@/app/components/Layout/Header';
import MainContent from '@/app/components/Layout/MainContent';
import Footer from '@/app/components/Layout/Footer';

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Head>
        <title>Carobar - Vehicle trade management for Dealers</title>
        <meta
          name="description"
          content="Carobar is a SaaS application to manage  vehicle sale/purchase business cycle"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <MainContent className="flex-grow" />

      <Footer />
    </div>
  );
}
