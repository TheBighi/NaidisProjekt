import React, { useState } from 'react';

const SyncPrices = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [location, setLocation] = useState('EE');
    
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSync = async (e) => {
        e.preventDefault();
        
        setIsLoading(true);
        setFeedback(null);

        try {
            const payload = { location };

            if (start && end) {

                payload.start = new Date(`${start}T00:00:00`).toISOString();
                payload.end = new Date(`${end}T23:59:59`).toISOString();
            }

            // Requirement 2: Send POST request to backend
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

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Piirkond:</label>
                    <select 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="EE">EE (Eesti)</option>
                        <option value="LV">LV (Läti)</option>
                        <option value="FI">FI (Soome)</option>
                    </select>
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