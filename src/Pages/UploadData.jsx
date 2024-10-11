import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '../Context/FirebaseContext';

const UploadComponent = () => {
    const firebase = useFirebase();
    const [jsonData, setJsonData] = useState(null); // State to hold the JSON data
    const [errorMessage, setErrorMessage] = useState(''); // State to hold error messages

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result); // Parse the JSON file
                    if (Array.isArray(data) && data.length > 0) {
                        console.log("Parsed JSON data:", data); // Log the parsed data
                        setJsonData(data);
                        setErrorMessage(''); // Clear any previous error messages
                    } else {
                        throw new Error("JSON must be an array with at least one object.");
                    }
                } catch (error) {
                    console.error("Error parsing JSON: ", error);
                    setErrorMessage("Error parsing JSON: Invalid format or not an array.");
                }
            };
            reader.readAsText(file); // Read the file as text
        }
    };

    const uploadData = async () => {
        if (!jsonData) {
            setErrorMessage("No JSON data to upload.");
            return;
        }

        try {
            for (const question of jsonData) {
                const questionId = question.QuestionId;
                if (!questionId) {
                    setErrorMessage("QuestionId is missing in one of the questions.");
                    console.error("QuestionId is missing in the JSON data.", question);
                    return;
                }

                // Prepare the data to upload to Firestore
                const uploadData = {
                    QuestionId: questionId,
                    plainQuestion: question.plainQuestion,
                    ProblemText: question.ProblemText,
                    SolutionText: question.SolutionText,
                    optionA: question.optionA,
                    plainTextOptionA: question.plainTextOptionA,
                    optionB: question.optionB,
                    plainTextOptionB: question.plainTextOptionB,
                    optionC: question.optionC,
                    plainTextOptionC: question.plainTextOptionC,
                    optionD: question.optionD,
                    plainTextOptionD: question.plainTextOptionD,
                    optionE: question.optionE,
                    plainTextOptionE: question.plainTextOptionE,
                    optionF: question.optionF,
                    plainTextOptionF: question.plainTextOptionF,
                    optionG: question.optionG,
                    plainTextOptionG: question.plainTextOptionG,
                    optionH: question.optionH,
                    plainTextOptionH: question.plainTextOptionH,
                    answer: question.answer,
                };

                const docRef = doc(firebase.firestoreDb, 'Questions', questionId); // Use QuestionId as document ID
                await setDoc(docRef, uploadData);
                console.log(`Document successfully written to Firestore for QuestionId: ${questionId}`);
            }
            setErrorMessage('All documents successfully written to Firestore!');
        } catch (error) {
            console.error("Error writing document to Firestore: ", error);
            setErrorMessage("Error writing documents to Firestore.");
        }
    };

    return (
        <div>
            <h1>Upload Questions</h1>
            <input 
                type="file" 
                accept=".json" 
                onChange={handleFileChange} 
            />
            <button onClick={uploadData} disabled={!jsonData}>Upload to Firestore</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
        </div>
    );
};

export default UploadComponent;
    