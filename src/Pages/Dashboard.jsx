import React, { useCallback, useEffect, useState } from 'react';
import Toolbar from '../Components/Toolbar';
import '../Pages/Dashboard.css';
import { useFirebase } from '../Context/FirebaseContext';
import { collection, getDocs,writeBatch, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';
import UserTests from './UserTests';

export default function Dashboard(props) {
  const firebase = useFirebase();
  const db = getDatabase(firebase.app);
  const [selectedOption, setSelectedOption] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [IsStartTest, setStartTest] = useState(false);
  const [Questions, setQuestions] = useState([]);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testCode, setTestCode] = useState('');
  const [totalMarks, setTotalMarks] = useState(0);
  const [totalTime] = useState(60 * 10); // Total time in seconds (e.g., 10 minutes)
  const [currentRemainingTime, setCurrentRemainingTime] = useState(totalTime);
  const [testInfoRef, setTestInfoRef] = useState(null);
  const [SubmitedAnswers, setSubmittedAnswers] = useState([]);
  // Timer effect
  const [QuestionList,setQuestionIds]=useState(null);
  useEffect(() => {
    let timer;
    if (isTestStarted && currentRemainingTime % 10 === 0) {
      uploadAnswersInBulk(props.User.uid, testInfoRef, SubmitedAnswers);
    }
    if (isTestStarted && currentRemainingTime > 0) {
      timer = setInterval(() => {
        setCurrentRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            confirmSubmitTest(); // Auto-submit test when time is up
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestStarted, currentRemainingTime]);

  // Store user's selected option and answer
  const handleOptionChange = async (event) => {
    const selected = event.target.value;
    setSelectedOption(selected);
  };
 const uploadAnswersInBulk = async (userId, testInfoId, submittedAnswers) => {
  if (!testInfoId) {
      console.error("No test is currently active.");
      return;
  }
  if(submittedAnswers.length==0){
    console.log("No Answers")
    return
  }

  const batch = writeBatch(firebase.firestoreDb); // Create a write batch
  const testRef = doc(firebase.firestoreDb, `TestData/${userId}/TestInfo/${testInfoId}`); // Reference to the test document

  // Prepare updates for the batch
  submittedAnswers.forEach(answer => {
      const questionResponsePath = `QuestionResponse.${answer.QuestionId}`;
      batch.update(testRef, {
          [questionResponsePath]: {
              selectedAnswer: answer.userAnswer,
              isCorrect: answer.isCorrect,
          },
      });
  });
  await setSubmittedAnswers([]);
  try {
      await batch.commit(); // Commit the batch
      console.log("Question responses uploaded successfully!");
  } catch (error) {
      console.error("Error uploading question responses: ", error);
  }
};
  // Move to the next question
  const handleNextClick = () => {
    const currentQuestionData = Questions[currentQuestion];
    const isCorrect = currentQuestionData.correctAnswer === selectedOption;

    // Store the submitted answer locally
    setSubmittedAnswers(prevAnswers => [
      ...prevAnswers,
      {
        QuestionId: currentQuestionData.QuestionId,
        userAnswer: selectedOption,
        isCorrect: isCorrect,
      }
    ]); 
    setSelectedOption('');
    setCurrentQuestion((prev) => prev + 1);
  };

const fetchdata = async () => {
            const { questions, questionIds } = await firebase.fetchQuestions();
            setQuestionIds(questionIds)
            setQuestions(questions);
};
        

  // const fetchdata = async () => {
  //   setLoading(true);
  //   try {
  //     const querySnapshot = await getDocs(collection(firebase.firestoreDb, 'Questions'));
  //     const fetchedQuestions = [];
  //     const questionId = [];

  //     querySnapshot.forEach((doc) => {
  //       const questionData = {
  //         QuestionId: doc.id,
  //         ProblemText: doc.data().ProblemText,
  //         Options: [
  //           { id: 'A', label: doc.data().optionA },
  //           { id: 'B', label: doc.data().optionB },
  //           { id: 'C', label: doc.data().optionC },
  //           { id: 'D', label: doc.data().optionD }
  //         ],
  //         isImage: doc.data().isImage,
  //         ImageUrl: doc.data().Imageurl,
  //         correctAnswer: doc.data().answer,
  //       };
  //       fetchedQuestions.push(questionData);
  //       questionId.push(doc.id); // Add the question ID to the list
  //     });
  //     setQuestionIds(questionId)
  //     setQuestions(fetchedQuestions);
  //   } catch (error) {
  //     console.error("Error fetching questions: ", error);
  //     alert("Failed to load questions. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const IntiateTestData = useCallback(async () => {
    const testData = {
      TestConfiguration: {
        TotalTime: totalTime,
        currentRemainingTime: totalTime,
        isTestEnd: false,
        QuestionsIds:QuestionList
      },
      QuestionResponse: {}
    }
    try {

      const newTestInfoRef = await addDoc(collection(firebase.firestoreDb, `TestData/${props.User.uid}/TestInfo`), testData);
      setTestInfoRef(newTestInfoRef.id); // Save the test info ID for later updates
      console.log("Test started with ID: ", newTestInfoRef.id);
    } catch (error) {
      console.error("Error starting test: ", error);
    }
  })
  // Start the test and initialize test data in Firestore
  const StartTest = useCallback(async () => {
    const uniqueTestCode = Date.now(); // Generate unique test code
    setTestCode(uniqueTestCode);
    setCurrentRemainingTime(totalTime);
    await fetchdata();
    await IntiateTestData();
    setStartTest(true);
    setCurrentQuestion(0);
    setIsTestStarted(true);
    setTotalMarks(0);

  }, [firebase, totalTime]);

  // Submit the test
  const confirmSubmitTest = useCallback(async () => {
    setStartTest(false);
    setIsTestStarted(false);
    setCurrentQuestion(0);
    setTotalMarks(0);
    setTestInfoRef(null);
    alert('Test has been submitted! Your Result being Proceced Soon ');
  }, [testCode, totalMarks, db]);

  return (
    <>
    <div className='container'>
      <Toolbar User={props.User} autoSubmit={confirmSubmitTest} isTestStarted={isTestStarted} />

      {IsStartTest ? (
        <div className="mt-4 border-primary">
          {/* Test Questions Section */}
          <div className="card mb-4 shadow rounded-4">
            <div className="card">
              <h5 className="card-body">
                {loading ? (
                  <p>Loading question...</p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: Questions.length > 0 ? Questions[currentQuestion].ProblemText : 'Loading...' }} />
                )}
                {Questions.length > 0 && Questions[currentQuestion].isImage ? (
                  <div>
                    <img src={Questions[currentQuestion].ImageUrl} width="500px" height="500px" alt="Question related visual" />
                  </div>
                ) : null}
              </h5>
            </div>
          </div>

          {/* Options Section */}
          <div className="card">
            <div className="row g-5">
              {Questions.length > 0 ? Questions[currentQuestion].Options.map((option) => (
                <div className="col-12 col-md-6" key={option.id}>
                  <div
                    className={`card text-center p-4 shadow-sm ${selectedOption === option.label ? 'bg-primary text-white' : ''}`}
                    onClick={() => setSelectedOption(option.label)}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      className="form-check-input"
                      name="Mcqoptions"
                      id={option.id}
                      value={option.label}
                      onChange={handleOptionChange}
                      checked={selectedOption === option.label}
                      style={{ transform: 'scale(1.5)' }}
                    />
                    <label className="card-body" htmlFor={option.id} style={{ fontSize: '1.25rem' }}>
                      <div dangerouslySetInnerHTML={{ __html: option.label }} />
                    </label>
                  </div>
                </div>
              )) : 'Loading...'}
            </div>

            <div className='card m-4 p-1 shadow rounded-5 justify-content-center'>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-primary mt-4 m-2 p-3"
                  onClick={handleNextClick}
                  disabled={currentQuestion === Questions.length - 1}
                >
                  {currentQuestion === Questions.length - 1 ? 'Last Question' : 'Next Question'}
                </button>
                <button className="btn btn-primary mt-4 m-2 p-3" onClick={confirmSubmitTest}>
                  Submit Test
                </button>
              </div>
            </div>
          </div>

          {/* Display Time Remaining */}
          <div className="card mt-4">
            <div className="card-body">
              <h5>Time Remaining: {Math.floor(currentRemainingTime / 60)}:{(currentRemainingTime % 60).toString().padStart(2, '0')}</h5>
              <h5>Total Time: {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</h5>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mt-4">
          <button className="btn btn-primary" onClick={StartTest}>
            Start Test
          </button>
          <UserTests user={props.User} />
        </div>
      )}
      </div>
    </>
  );
}
