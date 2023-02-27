import { getFirestore, getDocs, collection, addDoc, updateDoc, doc, deleteDoc} from 'firebase/firestore'
import { app } from '../App'
import { useState, useEffect, Fragment } from 'react'
import {HiUserCircle} from 'react-icons/hi'
import {GiLion} from 'react-icons/gi'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import {RiCheckboxBlankCircleFill} from 'react-icons/ri'
import {AiOutlineCloseCircle} from 'react-icons/ai'
import {TiDelete} from 'react-icons/ti'
import {MdModeEdit} from 'react-icons/md'
import '../App.css'

export default function Dashboard(props: any){
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

        SHORT TODO:
        1. Add the option to delete/edit todos
            - Update database in delete/edit events
    */

    const navigate = useNavigate()

    interface UserObject {
        email: string
    }

    type status = 'active' | 'inactive' | 'completed' | undefined

    interface ToDo {
        todo_title?: string,
        status?: status,
        description?: string,
        id?: number
    }

    // get access to firestore database
    const db = getFirestore(app)

    // user data
    const [userObject, setUserObject] = useState<UserObject | null>(null)
    const [userTodos, setUserTodos] = useState<Array<ToDo> | []>([])
    const [loading, setLoading] = useState(true)
    const [showUi, setShowUi] = useState<boolean>(false)
    const [taskTitle, setTaskTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [taskStatus, setTaskStatus] = useState<status>('active')
    const [edit, setEdit] = useState<boolean>(false)
    const [editDetails, setEditDetails] = useState<ToDo>({})
    const [hideEdit, setHideEdit] = useState(false)

    // set userObject to props.user in initialization
    // get todos during initialization
    useEffect(() => {
        const userObject: UserObject = {
            email: props.user.email
        }

        const getToDos = async () => {
            const thisTodos = new Array()

            const querySnapshot = await getDocs(collection(props.db, `users/${props.user.email.split('@')[0]}/todos`))
            querySnapshot.forEach((doc) => {
                thisTodos.push(doc.data())
            })

            setUserTodos(thisTodos)
        }
        
        setUserObject(userObject)
        getToDos()
        setLoading(false)
    }, [])
    
    const handleLogoutButton = () => {
        signOut(props.auth)
            .then(() => {
                // navigate user back to login screen
                
                setTimeout(() => {
                    setUserTodos([])
                    navigate('/')
                }, 1000);
            })
    }

    const handleEdit = (todoObject: ToDo) => {
        setEdit(true)

        setEditDetails(todoObject)
    }

    // iterate through usertodos; only return active todos
    const activeTodos = userTodos?.map((todo) => {
        // when mouse hovers over, show edit delete options

        if(todo.status === 'active'){
            return(
                <section className='todoCard'>
                    <div className="optionContainer">
                        <TiDelete className='deleteToDo' onClick={() => handleDeleteTodo(todo)}/>
                        {!hideEdit && <MdModeEdit className='editToDo' onClick={() => handleEdit(todo)} />}
                    </div>
                    <h1 className='todoCardTitle'>{todo.todo_title}</h1>
                    <p className='todoCardDescription'>{todo.description}</p>
                </section>
            )
        }
    }).filter(_ => _ !== undefined)

    // iterate through activetodos; only return inactive todos
    const inactiveTodos = userTodos?.map((todo) => {
        if(todo.status === 'inactive'){
            return(
                <section className='todoCard'>
                    <div className="optionContainer">
                        <TiDelete className='deleteToDo' onClick={() => handleDeleteTodo(todo)}/>
                        {!hideEdit && <MdModeEdit className='editToDo' onClick={() => {
                            handleEdit(todo)
                            setHideEdit(true)
                        }} />}
                    </div>
                    <h1 className='todoCardTitle'>{todo.todo_title}</h1>
                    <p className='todoCardDescription'>{todo.description}</p>
                </section>
            )
        }
    }).filter(_ => _ !== undefined)

    // iterate through completedtodos; only return completed todos
    const completedTodos = userTodos?.map((todo) => {
        if(todo.status === 'completed'){
            return(
                <section className='todoCard'>
                    <div className="optionContainer">
                        <TiDelete className='deleteToDo' onClick={() => handleDeleteTodo(todo)}/>
                        {!hideEdit && <MdModeEdit className='editToDo' onClick={() => handleEdit(todo)} />}
                    </div>
                    <h1 className='todoCardTitle'>{todo.todo_title}</h1>
                    <p className='todoCardDescription'>{todo.description}</p>
                </section>
            )
        }
    }).filter(_ => _ !== undefined)

    const handleAddTask = async (toDoObject: ToDo) => {
        // sets toDoObject to localState and updates database
        setUserTodos(prevState => [...prevState, toDoObject])
        await addDoc(collection(props.db, `users/${props.user.email.split('@')[0]}/todos`), toDoObject)

        // reset ui states
        setTaskStatus('active')
        setTaskTitle('')
        setDescription('')
        setShowUi(false)
    }

    const handleEditTitle = (value: string) => {
        const newToDo: ToDo = {
            todo_title: value,
            description: editDetails?.description,
            status: editDetails?.status,
            id: editDetails.id
        }

        setEditDetails(newToDo)
    }

    const handleEditDescription = (value: string) => {
        const newToDo: ToDo = {
            todo_title: editDetails?.todo_title,
            description: value,
            status: editDetails?.status,
            id: editDetails.id
        }

        setEditDetails(newToDo)
    }

    const handleEditStatus = (value: status) => {
        const newToDo: ToDo = {
            todo_title: editDetails?.todo_title,
            description: editDetails?.description,
            status: value,
            id: editDetails.id
        }

        setEditDetails(newToDo)
    }

    const handleEditTask = async (todoObject: any) => {
        // filters through userTodos and replaces identical todo.id with todoObject
        const filteredUserTodos = userTodos.map((todo) => {
            if(todo.id === todoObject.id){
                return todoObject
            } else {
                return todo
            }
        })

        setUserTodos(filteredUserTodos)
        setHideEdit(false)

        // update database where todo.id matches with todooject.id
        let documentId = ''
        
        const querySnapshot = await getDocs(collection(props.db, `users/${props.user.email.split('@')[0]}/todos`))
        querySnapshot.forEach((doc) => {
            if(doc.data().id === todoObject.id){
                documentId = doc.id
            }
        })
        
        await updateDoc(doc(props.db, `users/${props.user.email.split('@')[0]}/todos`, documentId), todoObject)

        setEdit(false)
    }

    const handleDeleteTodo = async (todoObject: any) => {
        const filteredUserTodos = userTodos.filter((todo) => todo.id !== todoObject.id)

        let documentId = ''

        const querySnapshot = await getDocs(collection(props.db, `users/${props.user.email.split('@')[0]}/todos`))
        querySnapshot.forEach((doc) => {
            if(doc.data().id === todoObject.id){
                documentId = doc.id
            }
        })

        await deleteDoc(doc(props.db, `users/${props.user.email.split('@')[0]}/todos`, documentId))

        setUserTodos(filteredUserTodos)
    }

    return(
        <Fragment>
            {loading && <div>Loading...</div>}
            {!loading &&
            <div className="dashboardContainer">
                <nav className="leftside">
                    <div className="logoIconContainer">
                        <GiLion />
                    </div>
                    <div className="userProfile">
                        <HiUserCircle className='userIcon'/>
                        <h1 className="userEmail">{userObject?.email}</h1>
                    </div>
                    <div className="bottomNav">
                        <div className="logoutButtonContainer">
                            <button onClick={handleLogoutButton}>Logout</button>
                        </div>
                    </div>
                </nav>

                <div className="contentContainer">
                    <nav className="upperSide">
                        <div className="addTaskContainer">
                            <button className='addTaskButton' onClick={() => setShowUi(true)}>+ Add Task</button>
                        </div>
                    </nav>
                    <main>
                        {showUi === true &&
                            <article className='ui'>
                                <div className='uiForm'>
                                    <div className="xContainer">
                                        <AiOutlineCloseCircle className='closeButton' onClick={() => {
                                            setShowUi(false)
                                            setTaskTitle('')
                                            setDescription('')
                                            setTaskStatus('active')
                                        }}/>
                                    </div>
                                    <div className="uiTitle">
                                        <h1>Title</h1>
                                        <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder='Enter task name here...' className='uiInput'/>
                                    </div>
                                    <div className="checkboxContainer">
                                        <div className="activeCheckbox" style={{ scale: taskStatus === 'active' ? '0.9' : '1', transition: '0.2s'}} onClick={() => setTaskStatus('active')}>
                                            <span>Active</span>
                                        </div>
                                        <div className="inactiveCheckbox" style={{ scale: taskStatus === 'inactive' ? '0.9' : '1', transition: '0.2s'}} onClick={() => setTaskStatus('inactive')}>
                                            <span>Inactive</span>
                                        </div>
                                        <div className="completedCheckbox" style={{ scale: taskStatus === 'completed' ? '0.9' : '1', transition: '0.2s'}} onClick={() => setTaskStatus('completed')}>
                                            <span>Completed</span>
                                        </div>
                                    </div>
                                    <div className="uiDescription">
                                        <h1>Description</h1>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Enter task description here...' className='textarea' rows={10} cols={40}/>
                                    </div>
                                    <div className="uiButtonContainer">
                                    <button className='uiButton' onClick={() => handleAddTask({todo_title: taskTitle, status: taskStatus, description: description, id: userTodos.length})}>Edit task</button>
                                    </div>
                                </div>
                            </article>
                        }
                        {edit &&
                            <article className='ui'>
                                <div className='uiForm'>
                                    <div className="xContainer">
                                        <AiOutlineCloseCircle className='closeButton' onClick={() => {
                                            setEdit(false)
                                            setHideEdit(false)
                                        }}/>
                                    </div>
                                    <div className="uiTitle">
                                        <h1>Task Title</h1>
                                        <input type="text" value={editDetails?.todo_title} onChange={(e) => handleEditTitle(e.target.value)} placeholder='Enter task name here...' className='uiInput'/>
                                    </div>
                                    <div className="checkboxContainer">
                                        <div className="activeCheckbox" onClick={() => handleEditStatus('active')} style={{ scale: editDetails?.status === 'active' ? '0.9' : '1', transition: '0.2s'}}>
                                            <span>Active</span>
                                        </div>
                                        <div className="inactiveCheckbox" onClick={() => handleEditStatus('inactive')} style={{ scale: editDetails?.status === 'inactive' ? '0.9' : '1', transition: '0.2s'}}>
                                            <span>Inactive</span>
                                        </div>
                                        <div className="completedCheckbox" onClick={() => handleEditStatus('completed')} style={{ scale: editDetails?.status === 'completed' ? '0.9' : '1', transition: '0.2s'}}>
                                            <span>Completed</span>
                                        </div>
                                    </div>
                                    <div className="uiDescription">
                                        <h1>Description</h1>
                                        <textarea value={editDetails?.description} onChange={(e) => handleEditDescription(e.target.value)} placeholder='Enter task description here...' className='textarea' rows={10} cols={40}/>
                                    </div>
                                    <div className="uiButtonContainer">
                                        <button className='uiButton' onClick={() => handleEditTask(editDetails)}>Add task</button>
                                    </div>
                                </div>
                            </article>
                        }
                        <div className="columns">
                            <div className="column active">
                                <div className="title">
                                    <span><RiCheckboxBlankCircleFill style={{ color: '#59c0df'}} /> Active ({`${activeTodos?.length}`})</span>
                                </div>
                                {activeTodos !== undefined && activeTodos}
                            </div>
                            <div className="column inactive">
                                <div className="title">
                                    <span><RiCheckboxBlankCircleFill style={{ color: '#8273d8'}} /> Inactive ({`${inactiveTodos?.length}`})</span>
                                </div>
                                {inactiveTodos !== undefined && inactiveTodos}
                            </div>
                            <div className="column completed">
                                <div className="title">
                                    <span><RiCheckboxBlankCircleFill style={{ color: '#7cccb2'}} /> Completed ({`${completedTodos?.length}`})</span>
                                </div>
                                {completedTodos !== undefined && completedTodos}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            }
        </Fragment>
    )
}