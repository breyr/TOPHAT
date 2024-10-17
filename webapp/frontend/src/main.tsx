import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import IndexPage from './pages/index.tsx'
import ModelSelectPage from './pages/ModelSelect.tsx'
import UserCreatePage from './pages/UserCreate.tsx'
import OnboardLayout from './routes/onboard.tsx'
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
        path: "",
        element: <ModelSelectPage />
      },
      {
        path: "users",
        element: <UserCreatePage />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
