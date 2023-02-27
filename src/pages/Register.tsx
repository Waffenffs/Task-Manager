import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function Register(props: any){
    const [registerEmail, setRegisterEmail] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [bothPasswordMatches, setBothPasswordMatches] = useState(true)
    // if password doesn't match, then show error password text
    // use state
    const navigate = useNavigate();

    const handleSignUp = (e: any) => {
        // if password doesn't match, then show error password text
        // else, register that account.
        e.preventDefault()

        if(repeatPassword.split('').join('') !== registerPassword.split('').join('')){
            setBothPasswordMatches(false)
        } else {
            if(registerEmail.split('').length !== 0 && registerPassword.split('').length !== 0){
            setBothPasswordMatches(true)

            createUserWithEmailAndPassword(props.auth, registerEmail, registerPassword)
            setTimeout(() => {
                navigate('/')
            }, 1000)
            }
        }
    }

    return(
        <div className="signinForm">
            <form onSubmit={handleSignUp}>
                <div className="formContainer">
                    <div className="textContainer">
                        <h1 className='majorTitle'>Welcome to Lion</h1>
                        <div className="paraContainer">
                            <p className='para'>Sign up with your email and preferred password!</p>
                        </div>
                    </div>
                    <div className="inputContainer">
                        <h1 className='inputTitle'>Email *</h1>
                        <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder='Your email here' className='input-signin'/>
                    </div>
                    <div className="inputContainer">
                        <h1 className='inputTitle'>Password *</h1>
                        <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder='Your password here' className='input-signin'/>
                    </div>
                    <div className="inputContainer">
                        <h1 className="inputTitle">Repeat Password *</h1>
                        <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} placeholder="Repeat your password here" className="input-signin" />
                        {!bothPasswordMatches && <span style={{ marginTop: '10px', color: 'crimson'}}>Password doesn't match!</span>}
                    </div>
                    <div className="signinButtonContainer">
                        <button className='form-button'>Sign up</button>
                    </div>
                </div>
            </form>
        </div>
    )
}