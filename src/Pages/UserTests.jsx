import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import './UserTests.css'; // Optional: CSS for styling
import { useFirebase } from '../Context/FirebaseContext';

const UserTests = ({ user }) => {
    const firebase = useFirebase();
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    
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
                console.log("testQuery",testsQuery)
                console.log("testsData",testsData)
                console.log("testsCollection",testsCollection)
                setTests(testsData);
            });
        };

        fetchTests();
    }, [user.uid, firebase.firestoreDb]);

    // Handle test card click to show results and highlight the selected test card
    const handleTestClick = (test) => {
        console.log(test)
        setSelectedTest(test);
    };

    // Toggle accordion for each question
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleQuestionExpand = (questionId) => {
        setExpandedQuestions((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    };

    // Render the results accordion for the selected test
    const renderResultsAccordion = () => {
        if (!selectedTest) return null;
    
        const questionResponses = selectedTest.QuestionResponse;
    
        return (
            <div className="results-accordion">
                <h3>Results for Test ID: {selectedTest.id}</h3>
                {Object.keys(questionResponses).map((questionId) => {
                    const isCorrect = questionResponses[questionId].isCorrect;
                    const selectedAnswer = questionResponses[questionId].selectedAnswer || 'No answer provided';
    
                    return (
                        <div 
                            key={questionId} 
                            className={`accordion-card ${isCorrect ? 'correct' : 'incorrect'} ${expandedQuestions[questionId] ? 'active' : ''}`}
                        >
                            <div 
                                className="accordion-header" 
                                onClick={() => toggleQuestionExpand(questionId)}
                            >
                                <div className={`status-indicator ${isCorrect ? 'correct' : 'incorrect'}`}></div>
                                <p><strong>Question ID:</strong> {questionId}</p>
                                <button className="toggle-button">{expandedQuestions[questionId] ? '-' : '+'}</button>
                            </div>
                            {expandedQuestions[questionId] && (
                                <div className="accordion-content">
                                    <p><strong>Your Answer:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: selectedAnswer }} />
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
        <div className="user-tests card rounded-5 m-5 p-5 align-content-center shadow">
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
        </div>
    );
};

export default UserTests;
