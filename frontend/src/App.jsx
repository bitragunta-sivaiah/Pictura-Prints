import React, { useEffect } from 'react'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { getUserProfile, selectAuthUser } from './store/userSlice'

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken'); // Assuming your token key is 'userToken'
    if (storedToken && !user) {
        // If a token exists and the user is not logged in, fetch the user profile
        dispatch(getUserProfile());
    }
}, [dispatch, user]);
  return (
    <>
      <Header/>
    <main>
    <Outlet/>
    </main>
    <Toaster/>
    <Footer/>
    </>
  )
}

export default App