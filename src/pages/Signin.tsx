import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { setDoc, doc } from 'firebase/firestore'
import '../App.css'
import {Link} from 'react-router-dom'

export default function Signin(props: any){
    interface ToDo { 
        todo_title: string,
        status: 'active' | 'completed' | 'inactive',
        description: string
    }

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    // sign in user
    const handleSubmit = (e: any) => {
        e.preventDefault()
        
        signInWithEmailAndPassword(props.auth, email, password)
            .then((user) => {
                console.log("Signed in:", user)

                // auto generate todo
                const autoGeneratedToDo: ToDo = {
                    todo_title: 'Auto-generated task',
                    status: 'inactive',
                    description: 'This is an auto generated text'
                }
                
                setDoc(doc(props.db, `users/${email.split('@')[0]}/todos`, "auto"), autoGeneratedToDo)

                // navigate user to dashboard
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000);
            })
            .catch((err) => {
                console.log('Error: ', err)
            
                setEmail('')
                setPassword('')
            })
    }
    
    return(
        <div className="signinForm">
            <form onSubmit={handleSubmit}>
                <div className="formContainer">
                    <div className="textContainer">
                        <h1 className='majorTitle'>Welcome to Lion</h1>
                        <div className="paraContainer">
                            <p className='para'>Sign in with your account! We're pleased to have you back. And if you're just visiting, hello!</p>
                        </div>
                    </div>
                    <div className="inputContainer">
                        <h1 className='inputTitle'>Email *</h1>
                        <input type="email" placeholder='Your email here' value={email} onChange={(e) => setEmail(e.target.value)} className='input-signin'/>
                    </div>
                    <div className="inputContainer">
                        <h1 className='inputTitle'>Password *</h1>
                        <input type="password" placeholder='Your password here' value={password} onChange={((e) => setPassword(e.target.value))} className='input-signin'/>
                    </div>
                    <div className="signinButtonContainer">
                        <button className='form-button'>Sign in</button>
                        <div className="signup">
                            Don't have an account?
                            <Link to="/register" style={{ textDecoration: 'none'}}>
                                <span className='signup-text'>Sign up!</span>
                            </Link> 
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}