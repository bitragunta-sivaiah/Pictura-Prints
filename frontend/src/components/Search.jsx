import { Search } from 'lucide-react';
import React from 'react'

const Searcher = () => {
  return (
    <div className='min-w-xl w-full   px-2 gap-2 border rounded-lg text-gray-400 h-[45px] flex items-center'>
        <div className="text-xl">
            <Search/>
        </div>
       <input type="text" placeholder='Find your Designs...' className='w-full h-full placeholder:text-gray-400 outline-none' />
    </div>
  )
}

export default Searcher