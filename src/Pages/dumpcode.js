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