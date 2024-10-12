import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import './UserTests.css'; // Optional: CSS for styling
import { useFirebase } from '../Context/FirebaseContext';

const UserTests = ({ user }) => {
    const firebase = useFirebase();
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedTestData, setSelectedTestData] = useState(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [testsPerPage] = useState(3); // Change this value to adjust the number of tests per page

    // Fetch user tests from Firestore
    useEffect(() => {
        const fetchTests = async () => {
            const testsCollection = collection(firebase.firestoreDb, `TestData/${user.uid}/TestInfo`);
            const testsQuery = query(testsCollection);

            onSnapshot(testsQuery, (snapshot) => {
                const testsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTests(testsData);
            });
        };

        fetchTests();
    }, [user.uid, firebase.firestoreDb]);

    const filterQuestionsWithResponses = (TestDataObject, QuestionDataArray) => {
        const questionIds = TestDataObject.TestConfiguration.QuestionsIds;
        const filteredQuestions = QuestionDataArray.filter(question =>
            questionIds.includes(question.QuestionId)
        );

        const mergedData = filteredQuestions.map(question => {
            const response = TestDataObject.QuestionResponse[question.QuestionId]; // Get response if exists
            return {
                questionText: question.ProblemText, // The question text
                correctAnswer: question.correctAnswer, // The correct answer from QuestionDataArray
                SolutionText: question.SolutionText,
                selectedAnswer: response ? response.selectedAnswer : null, // User's selected answer, or null if not answered
                isCorrect: response ? response.isCorrect : null // Whether the answer is correct, or null if not answered
            };
        });

        const unansweredQuestions = questionIds
            .filter(id => !QuestionDataArray.some(question => question.QuestionId === id))
            .map(id => ({
                questionText: "Question not available", // Placeholder text for unavailable questions
                correctAnswer: null,
                selectedAnswer: null, // No answer available
                isCorrect: null // No correctness information available
            }));

        return [...mergedData, ...unansweredQuestions];
    };

    const handleTestClick = async (test) => {
        const { questions } = await firebase.fetchQuestions();
        const mergedData = await filterQuestionsWithResponses(test, questions);
        setSelectedTest(test);
        setSelectedTestData(mergedData); // Store the merged data for rendering
    };

    // Toggle accordion for each question
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleQuestionExpand = (questionText) => {
        setExpandedQuestions((prev) => ({
            ...prev,
            [questionText]: !prev[questionText],
        }));
    };

    // Render the results accordion for the selected test
    const renderResultsAccordion = () => {
        if (!selectedTest || !selectedTestData) return null;

        return (
            <div className="results-accordion">
                <h3>Results for Test ID: {selectedTest.id}</h3>
                {selectedTestData.map((data, index) => {
                    const isCorrect = data.isCorrect;
                    const selectedAnswer = data.selectedAnswer || 'No answer provided';

                    return (
                        <div
                            key={index}
                            className={`accordion-card card ${isCorrect === null ? 'notAttempted' : isCorrect ? 'correct' : 'incorrect'} ${expandedQuestions[data.questionText] ? 'active' : ''}`}
                        >
                            <div
                                className="accordion-header"
                                onClick={() => toggleQuestionExpand(data.questionText)}
                            >
                                <div className={`status-indicator ${isCorrect === null ? 'notAttempted' : isCorrect ? 'correct' : 'incorrect'}`}></div>
                                <p><strong>Question:</strong>   <div dangerouslySetInnerHTML={{ __html: data.questionText }} /></p>

                                <button className="toggle-button">{expandedQuestions[data.questionText] ? '-' : '+'}</button>
                            </div>
                            {expandedQuestions[data.questionText] && (
                                <div className="accordion-content card">
                                    <div className='card shadow rounded-5 m-3 p-2'>
                                        <p><strong>Your Answer:</strong></p>
                                        <div dangerouslySetInnerHTML={{ __html: selectedAnswer }} />
                                        <p><strong>Correct Answer:</strong></p>
                                        <div dangerouslySetInnerHTML={{ __html: data.correctAnswer }} />
                                    </div>
                                    <div className='card shadow rounded-5 m-3 p-2'>
                                        <p><strong>Explaination</strong></p><div dangerouslySetInnerHTML={{ __html: data.SolutionText }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <button onClick={() => setSelectedTest(null)}>Back to Tests</button>
            </div>
        );
    };

    // Calculate the current tests to display
    const indexOfLastTest = currentPage * testsPerPage;
    const indexOfFirstTest = indexOfLastTest - testsPerPage;
    const currentTests = tests.slice(indexOfFirstTest, indexOfLastTest);

    // Calculate total pages
    const totalPages = Math.ceil(tests.length / testsPerPage);

    // Pagination controls
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            {
                currentTests.length > 0 ? (<div className='user-tests card rounded-5 m-5 p-5 align-content-center shadow'>
                      <h3 className='mb-4'>Your Tests</h3>
                    <div className="tests-grid">
                        {currentTests.map(test => (
                            <div
                                key={test.id}
                                className={`test-card ${selectedTest && selectedTest.id === test.id ? 'selected' : ''}`}
                                onClick={() => handleTestClick(test)}
                            >
                                <p><strong>Test ID:</strong> {test.id}</p>
                                <p><strong>Total Time:</strong> {test.TestConfiguration.TotalTime} seconds</p>
                                <p><strong>Remaining Time:</strong> {test.TestConfiguration.currentRemainingTime} seconds</p>
                                <p><strong>Status:</strong> {test.TestConfiguration.isTestEnd ? 'Ended' : 'In Progress'}</p>
                                <button onClick={() => handleTestClick(test)} className="view-test-data">View Test Data</button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination controls */}
                    <div className="pagination m-5">
                        <button onClick={handlePrevPage} className="view-test-data" disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNextPage} className='view-test-data' disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>

                    {renderResultsAccordion()}
                </div>)
                    : (null)
            }
        </div>
    );
};

export default UserTests;
