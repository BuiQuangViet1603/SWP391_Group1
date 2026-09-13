import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './DeckDetails.css';

const DeckDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Card Form State
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [example, setExample] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDeckData = async () => {
      try {
        const [deckRes, cardsRes] = await Promise.all([
          api.get(`http://localhost:8080/api/decks/${id}`),
          api.get(`http://localhost:8080/api/decks/${id}/flashcards`)
        ]);
        setDeck(deckRes.data);
        setFlashcards(cardsRes.data);
      } catch (error) {
        console.error("Failed to fetch deck details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeckData();
  }, [id]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) {
      setFormError('Term and Definition are required.');
      return;
    }
    
    setSubmitting(true);
    setFormError('');
    
    try {
      const response = await api.post(`http://localhost:8080/api/decks/${id}/flashcards`, {
        vocabulary: term,
        meaning: definition,
        phonetic: phonetic,
        exampleSentence: example
      });
      
      setFlashcards([...flashcards, response.data]);
      
      // Reset form
      setTerm('');
      setDefinition('');
      setPhonetic('');
      setExample('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add card:', err);
      setFormError('Failed to save the card. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="details-container animate-fade-in" style={{ justifyContent: 'center' }}>
        <h2>Loading deck...</h2>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="details-container animate-fade-in" style={{ justifyContent: 'center' }}>
        <h2>Deck not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="details-container animate-fade-in">
      <div className="details-header">
        <button className="btn btn-glass back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="deck-info">
          <h1>{deck.name}</h1>
          {deck.description && <p className="deck-desc">{deck.description}</p>}
          <span className="card-count-badge">{flashcards.length} terms</span>
        </div>
        <button 
          className="btn btn-primary study-btn-large" 
          onClick={() => navigate(`/study/${id}`)}
          disabled={flashcards.length === 0}
        >
          Study Now
        </button>
      </div>

      <div className="cards-section">
        <div className="section-header">
          <h2>Terms in this set</h2>
          <button className="btn btn-glass" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'Cancel' : '+ Add Card'}
          </button>
        </div>
        
        {isAdding && (
          <form onSubmit={handleAddCard} className="add-card-form glass-panel animate-fade-in">
            <h3>Add a New Card</h3>
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Term (Vocabulary) *</label>
                <input 
                  type="text" 
                  value={term} 
                  onChange={(e) => setTerm(e.target.value)} 
                  className="glass-input" 
                  placeholder="e.g. Obfuscate"
                  autoFocus
                />
              </div>
              <div className="form-group flex-1">
                <label>Definition (Meaning) *</label>
                <input 
                  type="text" 
                  value={definition} 
                  onChange={(e) => setDefinition(e.target.value)} 
                  className="glass-input" 
                  placeholder="e.g. Make obscure, unclear, or unintelligible"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Phonetic (Optional)</label>
                <input 
                  type="text" 
                  value={phonetic} 
                  onChange={(e) => setPhonetic(e.target.value)} 
                  className="glass-input" 
                  placeholder="e.g. /əbˈfʌs.keɪt/"
                />
              </div>
              <div className="form-group flex-2">
                <label>Example Sentence (Optional)</label>
                <input 
                  type="text" 
                  value={example} 
                  onChange={(e) => setExample(e.target.value)} 
                  className="glass-input" 
                  placeholder="e.g. The spelling changes will obfuscate the original intent."
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </form>
        )}

        <div className="cards-list">
          {flashcards.length === 0 && !isAdding ? (
            <div className="empty-state glass-panel">
              <p>This deck has no cards yet.</p>
              <button className="btn btn-primary" onClick={() => setIsAdding(true)}>Add your first card</button>
            </div>
          ) : (
            flashcards.map((card, index) => (
              <div key={card.id} className="list-card glass-panel">
                <div className="list-card-number">{index + 1}</div>
                <div className="list-card-term">
                  <h4>{card.vocabulary}</h4>
                  {card.phonetic && <span className="phonetic">{card.phonetic}</span>}
                </div>
                <div className="list-card-divider"></div>
                <div className="list-card-def">
                  <p>{card.meaning}</p>
                  {card.exampleSentence && <p className="example">"{card.exampleSentence}"</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckDetails;
