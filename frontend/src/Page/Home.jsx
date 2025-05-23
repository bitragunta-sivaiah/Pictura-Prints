import React from 'react';
import Hero from '../components/Hero';
import Banner from '../components/Banner';
import CustomerTeam from '../components/CustomerTeam';
import CustomerRatingsPage from '../components/CustomerRatings';
import Services from '../components/Services';
 
import CategoryListedProducts from '../components/CategoryListedProducts';
import LocationPoster from '../components/LocationPoster';
import { useSelector } from 'react-redux';
import AdminHero from './AdminHero';
import DeliveryPartnerHeroProfessional from './DeliveryHero';
 
import BranchHero from './BranchHero';
// import Category from '../components/Category';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {(user?.role === 'user' || !user) && (
        <>
          <main className="mt-24 w-full">
            <Banner position={'homepage_hero_banner'} />
          </main>
       
          <LocationPoster position="homepage_advertisement" />
          <Hero />
           {/* <Category/> */}
          <CategoryListedProducts />
          <Services />
          <CustomerTeam />
          <CustomerRatingsPage />
        </>
      )}

      {
        user?.role === 'admin' && (
          <>
          <main className=''>
             <AdminHero/>
          </main>
          </>
        )
      }

      {
        user?.role === 'deliveryPartner' && (
          <>
          <DeliveryPartnerHeroProfessional/>
          </>
        )
      }

      {
        user?.role === 'branchManager' && (
          <>
          <BranchHero/>
          </>
        )
      }
    </>
  );
};

export default Home;