# 🎙️ Vapi Admin Panel

A full-stack application for managing Vapi AI voice assistant configurations and initiating phone calls. Built with Express.js backend and React frontend.

## Features

- 🔧 **Configuration Management**: Set up your Vapi phone number, voice settings, and first message
- 📝 **System Prompt Editor**: Customize your AI assistant's behavior with an easy-to-use prompt editor
- 📞 **Call Initiation**: Make AI-powered phone calls directly from the admin panel
- 📊 **Call History**: Track all initiated calls with timestamps and status
- 🎨 **Modern UI**: Beautiful, responsive interface with gradient design

## Tech Stack

### Backend

- Express.js
- Node.js
- Vapi AI API
- CORS enabled

### Frontend

- React 18
- Axios for API calls
- Modern CSS with gradient design
- Responsive layout

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Vapi account and API key ([Get one here](https://vapi.ai))

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Hooli
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
PORT=3001
```

**Getting Your Vapi Credentials:**

1. Sign up at [vapi.ai](https://vapi.ai)
2. Navigate to your dashboard
3. Copy your API key from the Settings page
4. Create or import a phone number and copy its ID

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001`

For development with auto-reload:

```bash
npm run dev
```

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Usage

### 1. Configure Your Assistant

- **Vapi Phone Number ID**: Enter your Vapi phone number ID from your dashboard
- **First Message**: Set the greeting message for when calls connect
- **Voice ID**: Choose from available voice options (Rachel, Josh, Bella, etc.)
- **System Prompt**: Define how your AI assistant should behave and respond

Click "Save Configuration" to save your settings.

### 2. Update System Prompt

The system prompt determines your AI assistant's personality, knowledge, and behavior. Example prompts:

```
You are a helpful customer service assistant for Acme Corp. Be friendly, professional, and concise. Answer questions about our products and services.
```

```
You are a medical appointment scheduler. Collect the patient's name, preferred date and time, and reason for visit. Be empathetic and professional.
```

### 3. Make a Call

1. Enter the destination phone number (including country code, e.g., +1234567890)
2. Click "Initiate Call"
3. The AI assistant will call the number using your configured settings
4. View call status in the Call History section

## API Endpoints

### Backend API

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `POST /api/config/prompt` - Update system prompt
- `POST /api/call` - Initiate a phone call
- `GET /api/call/:callId` - Get call status
- `GET /health` - Health check

### Example API Call

```bash
# Initiate a call
curl -X POST http://localhost:3001/api/call \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## Project Structure

```
Hooli/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (create this)
├── frontend/
│   ├── public/
│   │   └── index.html    # HTML template
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── ConfigPanel.js
│   │   │   ├── CallPanel.js
│   │   │   └── CallHistory.js
│   │   ├── App.js        # Main App component
│   │   ├── App.css       # App styles
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Global styles
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## Configuration Options

### Voice Options

- **rachel** - Female voice (default)
- **josh** - Male voice
- **bella** - Female voice
- **antoni** - Male voice
- **elli** - Female voice
- **adam** - Male voice

### Model Options

The application uses GPT-4 by default with:

- Provider: OpenAI
- Transcriber: Deepgram Nova-2
- Language: English (US)

You can modify these in `backend/server.js` if needed.

## Troubleshooting

### Backend won't start

- Check that your `.env` file is properly configured
- Ensure port 3001 is not already in use
- Verify your Vapi API key is valid

### Frontend won't connect to backend

- Ensure the backend is running on port 3001
- Check browser console for CORS errors
- Verify the proxy setting in `frontend/package.json`

### Calls fail to initiate

- Verify your Vapi API key is correct
- Check that your phone number ID is valid
- Ensure your Vapi account has sufficient credits
- Check backend logs for detailed error messages

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # Hot reload is enabled by default
```

## Production Deployment

### Backend

1. Set environment variables on your hosting platform
2. Build and deploy the Express app
3. Ensure CORS settings allow your frontend domain

### Frontend

1. Build the production bundle:

```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to your hosting service
3. Update the API_URL in `App.js` to point to your backend URL

## Security Notes

- Never commit `.env` files to version control
- Keep your Vapi API key secure
- Implement authentication for production use
- Add rate limiting to prevent abuse
- Validate and sanitize all user inputs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For Vapi-specific questions, visit [Vapi Documentation](https://docs.vapi.ai)

For issues with this application, please open an issue on GitHub.

---

Built with ❤️ using Vapi AI, Express.js, and React
