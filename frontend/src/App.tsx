import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HDDs } from './pages/HDDs';
import { Projects } from './pages/Projects';
import { ProjectNew } from './pages/ProjectNew';
import { ProjectDetail } from './pages/ProjectDetail';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<ProjectNew />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="hdds" element={<HDDs />} />
              
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="team" element={<Users />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
