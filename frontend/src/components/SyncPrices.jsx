import React, { useState } from 'react';

const SyncPrices = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSync = async (e) => {
        e.preventDefault();
        
        setIsLoading(true);
        setFeedback(null);

        try {
            const payload = {};

            if (start && end) {

                payload.start = new Date(`${start}T00:00:00`).toISOString();
                payload.end = new Date(`${end}T23:59:59`).toISOString();
            }

            const response = await fetch('http://localhost:3001/api/sync/prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setFeedback({ 
                    type: 'success', 
                    message: `Hinnad sünkrooniti edukalt! (Andmebaasi lisati ${data.records_saved} kirjet)` 
                });
            } else {
                if (data.error === "PRICE_API_UNAVAILABLE") {
                    setFeedback({ 
                        type: 'error', 
                        message: 'Eleringi API on hetkel kättesaamatu. Palun proovi hiljem uuesti.' 
                    });
                } else {
                    setFeedback({ 
                        type: 'error', 
                        message: 'Sünkroonimisel tekkis tundmatu viga.' 
                    });
                }
            }
        } catch (error) {
            setFeedback({ 
                type: 'error', 
                message: 'Ei saanud serveriga ühendust. Kontrolli, kas backend töötab.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCleanup = async () => {
        setIsCleaning(true);
        setFeedback(null);

        try {
            const response = await fetch('http://localhost:3001/api/readings?source=UPLOAD', {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                setFeedback({
                    type: 'success',
                    message: data.message || 'Deleted UPLOAD data.'
                });
            } else {
                setFeedback({
                    type: 'error',
                    message: 'Cleanup failed. Please try again.'
                });
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: 'Cleanup failed. Please try again.'
            });
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Sünkroniseeri Elektrihinnad</h2>
            
            <form onSubmit={handleSync} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Algusaeg (Start):</label>
                    <input 
                        type="date" 
                        value={start} 
                        onChange={(e) => setStart(e.target.value)} 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Lõppaeg (End):</label>
                    <input 
                        type="date" 
                        value={end} 
                        onChange={(e) => setEnd(e.target.value)} 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{
                        padding: '10px',
                        backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isLoading ? 'Loading...' : 'Sync Prices'}
                </button>

                <button
                    type="button"
                    onClick={handleCleanup}
                    disabled={isCleaning}
                    style={{
                        padding: '10px',
                        backgroundColor: isCleaning ? '#9ca3af' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isCleaning ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isCleaning ? 'Deleting...' : 'Delete UPLOAD data'}
                </button>
            </form>

            {feedback && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    borderRadius: '4px',
                    backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: feedback.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${feedback.type === 'success' ? '#4ade80' : '#f87171'}`
                }}>
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

export default SyncPrices;