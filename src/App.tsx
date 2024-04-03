/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import './styles/bootstrap.min.css';
import './styles/custom.css';
import './styles/App.css';
import 'semantic-ui-css/semantic.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loading from './pages/Loading';
import Dashboard from './pages/Dashboard';
import Layout from './pages/Layout';
// import Login from './pages/Login';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Loading />} />
            {/* <Route path='login' element={<Login />} /> */}
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
