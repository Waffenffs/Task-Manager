import './App.css'
import { firebaseConfig } from './firebaseConfig'
import { initializeApp } from 'firebase/app'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Signin from './pages/Signin'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect, Fragment } from 'react'
import { getFirestore } from 'firebase/firestore'

// initialize firebase
export const app = initializeApp(firebaseConfig)

// initialize auth
const auth = getAuth(app)

// initialize db
const db = getFirestore(app)

export default function App(){
  /* 
      #############
      #   TO-DO   #
      #############

      1. Create Dashboard
          - Implement CRUD capabilities with todos (Create, Update, Delete, Read)
              - Fetch data from database (user/todos) in first-render
              - Update database (user/todos)
          - Light/dark mode implementations
      2. Add animations
          - Use Framer Motion
  */

  const [thisUser, setThisUser] = useState({})
  const navigate = useNavigate()

  // check if user is signed-in in first render
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(user){
        // signed in
        setThisUser(user)
        
        // navigate user to dashboard page
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        // signed out
        console.log('Signed out')
      }
    })
  }, [])

  return(
    <Fragment>
      <Routes>
        <Route path='/' element={ <Signin auth={auth} db={db} /> } />
        <Route path='/register' element={ <Register auth={auth} /> }/>
        <Route path='/dashboard' element={ <Dashboard user={thisUser} auth={auth} db={db} /> }/>
      </Routes>
    </Fragment>
  )
}