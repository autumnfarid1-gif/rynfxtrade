const API_KEY = "AIzaSyCawK1HVDaRJzyB6rxQbZdL7mTg4cPcB-o"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Deteksi input buat nyalain tombol
userInput.addEventListener('input', () => {
    sendBtn.classList.toggle('active', userInput.value.trim() !== "");
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    
    const avatarChar = sender === 'user' ? 'U' : 'A';
    
    messageDiv.innerHTML = `
        <div class="avatar">${avatarChar}</div>
        <div class="text">${text}</div>
    `;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function getAIResponse(userText) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Nama kamu Aufar AI. " + userText }] }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "Error: Koneksi terputus.";
    }
}

async function handleSend() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, 'user');
    userInput.value = "";
    sendBtn.classList.remove('active');

    const response = await getAIResponse(message);
    addMessage(response, 'ai');
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});