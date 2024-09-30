import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Button from '../Button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "../css/FindQuestion.css"; // You can modify or create a separate CSS file for articles

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [filter, setFilter] = useState({ title: '', author: '', date: '' });
    const [visibleArticles, setVisibleArticles] = useState([]);
    const [expandedArticleId, setExpandedArticleId] = useState(null);
    
    const navigate = useNavigate(); // Define navigate function

    const fetchArticles = async () => {
        const articlesCollection = collection(db, 'posts'); // Updated to 'posts' collection
        const articleSnapshot = await getDocs(articlesCollection);
        const articleList = articleSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setArticles(articleList);
        setVisibleArticles(articleList);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const filteredArticles = visibleArticles.filter(article => {
        const titleMatch = filter.title === '' || (article.title && article.title.toLowerCase().includes(filter.title.toLowerCase()));
        const authorMatch = filter.author === '' || (article.author && article.author.toLowerCase().includes(filter.author.toLowerCase()));
        const dateMatch = filter.date === '' || (article.createdAt && new Date(article.createdAt.seconds * 1000).toISOString().split('T')[0] === filter.date);
        return titleMatch && authorMatch && dateMatch;
    });

    const removeArticle = (id) => {
        setVisibleArticles(prev => prev.filter(article => article.id !== id));
        if (expandedArticleId === id) {
            setExpandedArticleId(null);
        }
    };

    const toggleExpandArticle = (id) => {
        setExpandedArticleId(prevId => (prevId === id ? null : id));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(visibleArticles);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setVisibleArticles(items);
    };

    return (
        <div className="find-question-page">
            <h1>Find Articles</h1>

            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Filter by title"
                    value={filter.title}
                    onChange={(e) => setFilter({ ...filter, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Filter by author"
                    value={filter.author}
                    onChange={(e) => setFilter({ ...filter, author: e.target.value })}
                />
                <input
                    type="date"
                    value={filter.date}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="article-droppable">
                    {(provided) => (
                        <div
                            className="question-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map((article, index) => (
                                    <Draggable key={article.id} draggableId={article.id.toString()} index={index}>
                                        {(provided) => (
                                            <div
                                                className="question-card"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={() => toggleExpandArticle(article.id)}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeArticle(article.id);
                                                    }}
                                                    className="remove-button"
                                                    title="Remove Article"
                                                >
                                                    &times;
                                                </button>
                                                <h2>{article.title}</h2>
                                                <p>DESCRIPTION: {article.description}</p>
                                                <p><strong>Author:</strong> {article.author}</p>
                                                <p><strong>Date:</strong> {new Date(article.createdAt.seconds * 1000).toLocaleDateString()}</p>
                                                

                                                {expandedArticleId === article.id && (
                                                    <div className="expanded-details">
                                                        <p><strong>More Details:</strong></p>
                                                        <p>Posted By: {article.author}</p>
                                                        <p>{article.content}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <p>No articles found.</p>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Button text="Back to Home" onClick={() => navigate('/')} />
        </div>
    );
};

export default ArticlesPage;
