import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import ArregloDetail from './pages/ArregloDetail';
import MisPedidos from './pages/MisPedidos';
import PedidoDetail from './pages/PedidoDetail';
import FloristaPedidos from './pages/FloristaPedidos';
import FloristaArreglos from './pages/FloristaArreglos';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminArreglos from './pages/AdminArreglos';
import AdminConfiguracion from './pages/AdminConfiguracion';
import GerentePedidos from './pages/GerentePedidos';
import GerenteTiposArreglo from './pages/GerenteTiposArreglo';
import GerenteStock from './pages/GerenteStock';
import AdminPedidos from './pages/AdminPedidos';
import EmpleadoPedidos from './pages/EmpleadoPedidos';
import EmpleadoStock from './pages/EmpleadoStock';
import Contabilidad from './pages/Contabilidad';
import Perfil from './pages/Perfil';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Login />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/arreglo/:id" element={<ArregloDetail />} />
        
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <MisPedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedido/:id"
          element={
            <ProtectedRoute>
              <PedidoDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Florista */}
        <Route
          path="/florista/pedidos"
          element={
            <ProtectedRoute allowedRoles={['FLORISTA', 'ADMIN']}>
              <FloristaPedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/florista/arreglos"
          element={
            <ProtectedRoute allowedRoles={['FLORISTA', 'ADMIN']}>
              <FloristaArreglos />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Gerente */}
        <Route
          path="/gerente/pedidos"
          element={
            <ProtectedRoute allowedRoles={['GERENTE', 'ADMIN']}>
              <GerentePedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerente/tipos"
          element={
            <ProtectedRoute allowedRoles={['GERENTE', 'ADMIN']}>
              <GerenteTiposArreglo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerente/contabilidad"
          element={
            <ProtectedRoute allowedRoles={['GERENTE', 'ADMIN']}>
              <Contabilidad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerente/stock"
          element={
            <ProtectedRoute allowedRoles={['GERENTE', 'ADMIN']}>
              <GerenteStock />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Empleado */}
        <Route
          path="/empleado/pedidos"
          element={
            <ProtectedRoute allowedRoles={['EMPLEADO', 'ADMIN']}>
              <EmpleadoPedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empleado/stock"
          element={
            <ProtectedRoute allowedRoles={['EMPLEADO', 'GERENTE', 'ADMIN']}>
              <EmpleadoStock />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Admin */}
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/arreglos"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminArreglos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contabilidad"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Contabilidad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configuracion"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminConfiguracion />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;

