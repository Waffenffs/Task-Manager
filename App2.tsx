import { useState, useEffect, Fragment } from "react";
import { firebaseConfig } from "./firebaseConfig";
import { initializeApp} from 'firebase/app'
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore'

// initialize app
const app = initializeApp(firebaseConfig)

// initialize firestore
const db = getFirestore(app)

export default function App(){
  // start first by getting data from a database
  const [todoInput, setTodoInput] = useState('')

  interface ToDo {
    todo_title: string,
    status: 'active' | 'completed' | 'inactive'
  }

  const [todoContainer, setTodoContainer] = useState<Array<ToDo>>([])
  const [loading, setLoading] = useState<boolean>(true)

  // initialize state in first render
  useEffect(() => {
    const queryTodoData = async () => {
      const querySnapshot = await getDocs(collection(db, "todos"));

      // iterate for each document in query
      querySnapshot.forEach((doc) => {
        const todoObject: ToDo = {
          todo_title: doc.data().todo_title,
          status: doc.data().status
        }

        setTodoContainer((previousContainer) => [...previousContainer, todoObject])
      })
    }

    queryTodoData()
    setLoading(false)
  }, [])

  const addNewToDo = async (input: string) => {
    const todoObject: ToDo = {
      todo_title: input,
      status: 'active'
    }

    // add todo to database
    const docRef = doc(collection(db, "todos"))
    await setDoc(docRef, todoObject)

    // update local state with the todo object
    setTodoContainer((previousContainer) => [...previousContainer, todoObject])
  }

  // display todo elements on the dom
  const todoElem = todoContainer.map((todo) => {
    return <Fragment>Title: {todo.todo_title}, Status: {todo.status}</Fragment>
  })

  return(
    <Fragment>
      {loading && <div>Loading...</div>}
      {!loading && todoElem}
      <input type="text" value={todoInput} onChange={(e) => setTodoInput(e.target.value)} />
      <button onClick={() => addNewToDo(todoInput)}>Add new todo</button>
    </Fragment>
  )
}