# AI Financial Advisor Chat Component

This component provides a conversational interface to interact with Google's Gemini large language model (LLM), specifically tailored for financial advising.

## Features

- **Conversational Memory**: Maintains full conversation history for contextual responses
- **System Prompting**: Uses detailed system prompts to guide the AI's behavior and tone
- **Financial Data Integration**: Automatically extracts financial entities from user queries and fetches relevant data
- **Real-time Market Data**: Displays current stock prices and trends for mentioned symbols
- **Financial News**: Shows relevant news articles based on the conversation context
- **Fallback Mechanisms**: Provides helpful responses even when API connections fail
- **User-friendly Interface**: Clean, responsive design with loading states and error handling

## How It Works

### 1. System Prompting

The component uses a detailed system prompt to define the AI's:
- Role and expertise
- Tone and communication style
- Response guidelines
- Ethical boundaries

This ensures consistent, helpful, and responsible financial advice.

### 2. Conversation Management

- Each message is stored with a unique ID, sender type, timestamp, and content
- The full conversation history is sent with each request to maintain context
- Messages are displayed in a chat-like interface with appropriate styling

### 3. Financial Entity Extraction

The component automatically:
- Identifies potential stock symbols (e.g., AAPL, MSFT)
- Extracts financial topics (e.g., retirement, crypto, investing)
- Uses these entities to fetch relevant financial data

### 4. Data Integration

For each user query, the component:
- Fetches real-time market data for mentioned stock symbols
- Retrieves relevant financial news articles
- Formats this data and includes it in the prompt to the AI
- Displays a summary of this data in the UI

### 5. Error Handling

The component includes multiple fallback mechanisms:
- Fallback responses for common financial topics when the API fails
- Graceful error handling with user-friendly messages
- Automatic retries with fallback data sources

## Implementation Details

### Key Components

1. **Message Interface**: Defines the structure of chat messages
2. **AIAdvisorService**: Handles communication with the Gemini API
3. **Financial Data Hooks**: Custom hooks for fetching market data and news
4. **Entity Extraction**: Functions to identify financial entities in text

### Data Flow

1. User enters a message
2. Financial entities are extracted
3. Relevant market data and news are fetched
4. System prompt, conversation history, and financial data are sent to Gemini
5. AI response is received and displayed
6. Conversation history is updated

## Usage

The chat component can answer questions about:
- Stock performance and recommendations
- Market trends and analysis
- Investment strategies
- Retirement planning
- Debt management
- General financial advice

## Example Prompts

- "How is Apple stock performing today?"
- "What's your opinion on cryptocurrency investments?"
- "Should I pay off my mortgage early or invest more?"
- "What's a good asset allocation for someone nearing retirement?"
- "Explain dollar-cost averaging and its benefits"
- "What are the latest trends in the tech sector?"