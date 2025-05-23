import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { HelmetProvider } from "react-helmet-async";
 

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
  <Provider store={store}>
      <RouterProvider router={router} />
  </Provider>
  </HelmetProvider>
);
