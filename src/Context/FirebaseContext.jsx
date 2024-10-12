import {createContext, useContext, useState} from 'react';
import { initializeApp } from 'firebase/app';
import {getAuth, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import firebaseConfig from '../Utils/FirebaseApp';
import { collection, getDocs,writeBatch, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'
const firebaseApp=initializeApp(firebaseConfig);
export const firebaseauth=getAuth(firebaseApp);
const firebaseSignInwithGoogle=new GoogleAuthProvider();
const FirebaseContext=createContext(null);
export const useFirebase=()=>useContext(FirebaseContext);
export const User=null;
export const firestoreDb=getFirestore(firebaseApp)
export const realtimeDb=getDatabase(firebaseApp);

const FirebaseProvider=(props)=>{
    const signinWithGoogle=()=>{
        signInWithPopup(firebaseauth,firebaseSignInwithGoogle).then((value)=>{
           console.log("Redirecting") 
        });
    }
    const [questions, setQuestions] = useState(null);  // Cache questions
    const [questionIds, setQuestionIds] = useState([]); // Cache question IDs
    const fetchQuestions = async () => {
        if (questions) {
            // If questions are already fetched, no need to fetch again
            return { questions, questionIds };
        }
        try {
            const querySnapshot = await getDocs(collection(firestoreDb, 'Questions'));
            const fetchedQuestions = [];
            const fetchedQuestionIds = [];

            querySnapshot.forEach((doc) => {
                const questionData = {
                    QuestionId: doc.id,
                    ProblemText: doc.data().ProblemText,
                    Options: [
                        { id: 'A', label: doc.data().optionA },
                        { id: 'B', label: doc.data().optionB },
                        { id: 'C', label: doc.data().optionC },
                        { id: 'D', label: doc.data().optionD }
                    ],
                    isImage: doc.data().isImage,
                    ImageUrl: doc.data().Imageurl,
                    correctAnswer: doc.data().answer,
                    SolutionText:doc.data().SolutionText,
                };
                fetchedQuestions.push(questionData);
                fetchedQuestionIds.push(doc.id);
            });

            // Cache the fetched questions and question IDs
            setQuestions(fetchedQuestions);
            setQuestionIds(fetchedQuestionIds);

            return { questions: fetchedQuestions, questionIds: fetchedQuestionIds };
        } catch (error) {
            console.error("Error fetching questions: ", error);
            alert("Failed to load questions. Please try again.");
            return { questions: [], questionIds: [] };
        } finally {
          
        }
    };
    return <FirebaseContext.Provider value={{signinWithGoogle,firebaseauth,firestoreDb,fetchQuestions}}>
        {props.children}
    </FirebaseContext.Provider>
};

export  default FirebaseProvider;