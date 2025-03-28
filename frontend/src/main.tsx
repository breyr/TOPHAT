import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ToastContainer from './components/ToastContainer.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import AllUserTopologiesPage from './pages/AllUserTopologiesPage.tsx'
import DeviceInventoryPage from './pages/DeviceInventory.tsx'
import FinishOnboard from './pages/FinishOnboard.tsx'
import IndexPage from './pages/Index.tsx'
import OnboardInventory from './pages/OnboardInventory.tsx'
import UserAdministrationPage from './pages/UserAdministration.tsx'
import UserArchivedTopologiesPage from './pages/UserArchivedTopologies.tsx'
import UserCreatePage from './pages/UserCreate.tsx'
import UserTopologiesPage from './pages/UserTopologies.tsx'
import DashboardLayout from './routes/dashboard.tsx'
import OnboardLayout from './routes/onboard.tsx'
import TopologyPage from './routes/topology.tsx'
import './static/global.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexPage />
  },
  {
    path: "/onboard",
    element: <OnboardLayout />,
    children: [
      {
        path: "users",
        element: <UserCreatePage />
      },
      {
        path: "inventory",
        element: <OnboardInventory />
      },
      {
        path: "finish",
        element: <FinishOnboard />
      }
    ]
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <UserTopologiesPage />
      },
      {
        path: "inventory",
        element: <DeviceInventoryPage />
      },
      {
        path: "users",
        element: <UserAdministrationPage />
      },
      {
        path: "archived",
        element: <UserArchivedTopologiesPage />
      },
      {
        path: "alltopologies",
        element: <AllUserTopologiesPage />
      }
    ]
  },
  {
    path: "/topology/:id",
    element: <TopologyPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
