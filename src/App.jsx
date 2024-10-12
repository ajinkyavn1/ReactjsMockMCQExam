import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './Pages/Auth/Login'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useFirebase } from './Context/FirebaseContext'
import Dashboard from './Pages/Dashboard'


function App() {
  const [User,setUser]=useState(null);
  const firebase=useFirebase();
  useEffect(()=>{
    onAuthStateChanged(firebase.firebaseauth,(user)=>{
      if(user){
        setUser(user);
      }else{
        setUser(null)
      }
    })
  },[])
  return <>
            {!User?<LoginPage/>:<Dashboard User={User}/>}
            <div className='card rounded-5 p-5 shadow'>Love from &#10084; AJ</div>
    </>
}

export default App
