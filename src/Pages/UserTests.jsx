import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import './UserTests.css'; // Optional: CSS for styling
import { useFirebase } from '../Context/FirebaseContext';

const UserTests = ({ user }) => {
    const firebase = useFirebase();
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedTestData, setSelectedTestData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [testsPerPage] = useState(2);

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

        return filteredQuestions.map(question => {
            const response = TestDataObject.QuestionResponse[question.QuestionId];
            return {
                questionText: question.ProblemText,
                correctAnswer: question.correctAnswer,
                SolutionText: question.SolutionText,
                selectedAnswer: response ? response.selectedAnswer : null,
                isCorrect: response ? response.isCorrect : null
            };
        });
    };

    const handleTestClick = async (test) => {
        if(selectedTest==test){
            alert("Already Selected Test")
            return ;
        }
        const { questions } = await firebase.fetchQuestions();
        const mergedData = await filterQuestionsWithResponses(test, questions);
        setSelectedTest(test);
        setSelectedTestData(mergedData);
    };

    const [expandedQuestions, setExpandedQuestions] = useState({});
    const toggleQuestionExpand = (questionText) => {
        setExpandedQuestions((prev) => ({
            ...prev,
            [questionText]: !prev[questionText],
        }));
    };

    const renderResultsAccordion = () => {
        if (!selectedTest || !selectedTestData) return null;

        return (
            <div className="results-accordion">
                <div className='p-2 card m-2'>
                    <p><strong>Results for Test ID: </strong>{selectedTest.id}</p>
                    <p><strong>Obtain Marks:</strong>{selectedTestData.filter(question => question.isCorrect === true).length}</p>
                </div>
                {selectedTestData.map((data, index) => {
                    const isCorrect = data.isCorrect;
                    const selectedAnswer = data.selectedAnswer || 'No answer provided';

                    return (
                        <div
                            key={index}
                            className={`accordion-card card ${isCorrect === null ? 'notAttempted' : isCorrect ? 'correct' : 'incorrect'} ${expandedQuestions[data.questionText] ? 'active' : ''}`}
                        >
                            <div className="accordion-header" onClick={() => toggleQuestionExpand(data.questionText)}>
                                <div className={`status-indicator ${isCorrect === null ? 'notAttempted' : isCorrect ? 'correct' : 'incorrect'}`}></div>
                                <p><strong>Question:</strong> <div dangerouslySetInnerHTML={{ __html: data.questionText }} /></p>
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
                                        <p><strong>Explanation:</strong></p>
                                        <div dangerouslySetInnerHTML={{ __html: data.SolutionText }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <button onClick={() => setSelectedTest(null)} className="btn btn-primary">Back to Tests</button>
            </div>
        );
    };

    const indexOfLastTest = currentPage * testsPerPage;
    const indexOfFirstTest = indexOfLastTest - testsPerPage;
    const currentTests = tests.slice(indexOfFirstTest, indexOfLastTest);
    const totalPages = Math.ceil(tests.length / testsPerPage);

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
        <div className="container">
            {
                currentTests.length > 0 ? (
                    <div className='user-tests card rounded-5 m-5 p-5 shadow'>
                        <h3 className='mb-4'>Your Tests</h3>
                        <div className="row tests-grid">
                            {currentTests.map(test => (
                                <div
                                    key={test.id}
                                    className={`col-md-4 col-sm-6 mb-3`}
                                >
                                    <div
                                        className={`test-card ${selectedTest && selectedTest.id === test.id ? 'selected' : ''}`}
                                        onClick={() => handleTestClick(test)}
                                    >
                                        <p><strong>Test ID:</strong> {test.id}</p>
                                        <p><strong>Total Time:</strong> {test.TestConfiguration.TotalTime} seconds</p>
                                        <p><strong>Remaining Time:</strong> {test.TestConfiguration.currentRemainingTime} seconds</p>
                                        <p><strong>Status:</strong> {test.TestConfiguration.isTestEnd ? 'Ended' : 'In Progress'}</p>
                                        <button onClick={() => handleTestClick(test)} className="view-test-data">View Test Data</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pagination d-flex justify-content-between m-5">
                            <button onClick={handlePrevPage} className="btn btn-primary" disabled={currentPage === 1}>
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button onClick={handleNextPage} className='btn btn-primary' disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </div>

                        {renderResultsAccordion()}
                    </div>
                ) : (null)
            }
        </div>
    );
};

export default UserTests;
