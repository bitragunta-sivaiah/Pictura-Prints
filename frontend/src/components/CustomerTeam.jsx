import React from 'react'
import Customer1 from '../assets/customer-1.webp'
import Customer2 from '../assets/customer-2.webp'
import Customer3 from '../assets/customer-3.webp'
import Customer4 from '../assets/customer-4.webp'
const CustomerTeam = () => {
  return (
    <div className='w-full h-full p-4 max-w-[1200px] mx-auto mt-5 mb-10'>
        <div className="flex flex-col items-center justify-center">
            {/* top part */}
         <div className="p-2 px-4 bg-green-200 rounded-full text-green-800 font-bold text-sm">
            Our Custom Team
         </div>
         <h1 className="text-5xl mt-5 heading">
         Join 1,000,000+ 
         </h1>
         <h1 className="text-3xl md:text-4xl mt-5 heading">
         happy customers today
         </h1>
         <div className="flex flex-col items-center  gap-5 justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full mt-10">
                <div className="w-full   h-full">
                  <img src={Customer1} className='w-full h-full object-cover' alt="" />
                </div>
                <div className="w-full  h-full">
                  <img src={Customer2} className='w-full h-full object-cover' alt="" />
                </div>
              
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full mt-5">
                <div className="w-full   h-full">
                  <img src={Customer3} className='w-full h-full object-cover' alt="" />
                </div>
                <div className="w-full  h-full">
                  <img src={Customer4} className='w-full h-full object-cover' alt="" />
                </div>
              
            </div>
         </div>
        </div>
    </div>
  )
}

export default CustomerTeam