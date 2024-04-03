import 'semantic-ui-css/semantic.min.css';
import '../styles/custom.css';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <div className='gradient-background full-screen-size py-3'>
        <Outlet />
      </div>
    </>
  );
}
