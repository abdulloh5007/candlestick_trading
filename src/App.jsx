import { Route, Routes } from 'react-router-dom'
import './App.css'
import Crypto from './components/Crypto'
import Profile from './components/Profile'

import { AuthorizeUser, ProtectRoute } from './middleware/auth';
import Password from './components/Password';
import Register from './components/Register';
import Recovery from './components/Recovery';
import Username from './components/Username';
import Reset from './components/Reset';


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Crypto />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/profile' element={<AuthorizeUser><Profile /></AuthorizeUser>}/>
        <Route path='/password' element={<ProtectRoute><Password /></ProtectRoute>}/>
        <Route path='/recovery' element={<Recovery />}/>
        <Route path='/username' element={<Username />}/>
        <Route path='/reset' element={<Reset />}/>
      </Routes>
    </>
  )
}

export default App
