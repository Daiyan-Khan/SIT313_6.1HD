import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Button from '../Button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "../css/FindQuestion.css";

/**
 * The FindQuestion component fetches and displays a list of questions from Firestore.
 * Users can filter, remove, and reorder questions using drag and drop functionality.
 */
const FindQuestion = () => {
    /**
     * State variable to hold the list of all questions fetched from Firestore.
     */
    const [questions, setQuestions] = useState([]);

    /**
     * State variable for managing filter criteria (title, tag, and date).
     */
    const [filter, setFilter] = useState({ title: '', tag: '', date: '' });

    /**
     * State variable to manage the currently visible list of questions after filtering.
     */
    const [visibleQuestions, setVisibleQuestions] = useState([]);

    /**
     * State variable to track which question is expanded for more details.
     */
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);

    /**
     * Fetches questions from Firestore, stores them in the state,
     * and makes them visible in the UI.
     */
    const fetchQuestions = async () => {
        const questionsCollection = collection(db, 'questions');
        const questionSnapshot = await getDocs(questionsCollection);
        const questionList = questionSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setQuestions(questionList);
        setVisibleQuestions(questionList);
    };

    /**
     * UseEffect hook to fetch questions on component mount.
     */
    useEffect(() => {
        fetchQuestions();
    }, []);

    /**
     * Filters questions based on the title, tags, and date.
     * The questions are filtered dynamically as users update the filter criteria.
     */
    const filteredQuestions = visibleQuestions.filter(question => {
        const titleMatch = filter.title === '' || (question.title && question.title.toLowerCase().includes(filter.title.toLowerCase()));
        const tagMatch = filter.tag === '' || (question.tags && question.tags.some(tag => tag.toLowerCase().includes(filter.tag.toLowerCase())));
        const dateMatch = filter.date === '' || (question.createdAt && new Date(question.createdAt.seconds * 1000).toISOString().split('T')[0] === filter.date);
        return titleMatch && tagMatch && dateMatch;
    });

    /**
     * Removes a question by its id and updates the visible questions list.
     * If the removed question is expanded, collapse the details.
     * @param {string} id - The ID of the question to be removed.
     */
    const removeQuestion = (id) => {
        setVisibleQuestions(prev => prev.filter(question => question.id !== id));
        if (expandedQuestionId === id) {
            setExpandedQuestionId(null);
        }
    };

    /**
     * Toggles the expansion state for a specific question.
     * @param {string} id - The ID of the question to expand or collapse.
     */
    const toggleExpandQuestion = (id) => {
        setExpandedQuestionId(prevId => (prevId === id ? null : id));
    };

    /**
     * Handles the reordering of questions when a drag-and-drop action is completed.
     * @param {object} result - The result of the drag-and-drop action.
     */
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(visibleQuestions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setVisibleQuestions(items);
    };

    return (
        <div className="find-question-page">
            <h1>Find Questions</h1>

            {/* Filter section for filtering questions by title, tag, or date */}
            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Filter by title"
                    value={filter.title}
                    onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Filter by tag"
                    value={filter.tag}
                    onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
                />
                <input
                    type="date"
                    value={filter.date}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                />
            </div>

            {/* DragDropContext for managing draggable question items */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="question-droppable">
                    {(provided) => (
                        <div
                            className="question-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {/* Displaying filtered questions */}
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map((question, index) => (
                                    <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                                        {(provided) => (
                                            <div
                                                className="question-card"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={() => toggleExpandQuestion(question.id)}
                                            >
                                                {/* Button to remove a question */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeQuestion(question.id);
                                                    }}
                                                    className="remove-button"
                                                    title="Remove Question"
                                                >
                                                    &times;
                                                </button>
                                                {/* Displaying question details */}
                                                <h2>{question.title}</h2>
                                                <p>DESCRIPTION: {question.description}</p>
                                                <p><strong>Tags:</strong> {question.tags ? question.tags.join(', ') : 'No tags'}</p>
                                                <p><strong>Date:</strong> {new Date(question.createdAt.seconds * 1000).toLocaleDateString()}</p>
                                                
                                                {/* Expanded details section */}
                                                {expandedQuestionId === question.id && (
                                                    <div className="expanded-details">
                                                        <p><strong>More Details:</strong></p>
                                                        <p>Posted By: {question.userEmail}</p>
                                                        <p>{question.additionalInfo}</p>
                                                        {question.imageUrls && question.imageUrls.length > 0 && (
                                                            <div className="image-gallery">
                                                                {question.imageUrls.map((imageUrl, index) => (
                                                                    <img key={index} src={imageUrl} alt={`Question Image ${index + 1}`} className="question-image" />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="click-to-collapse" onClick={() => toggleExpandQuestion(question.id)}>
                                                            Click to Collapse
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <p>No questions found.</p>
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Link to navigate back to home */}
            <Link to="/">
                <Button text="Home" />
            </Link>
        </div>
    );
};

export default FindQuestion;
