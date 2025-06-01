# Aback.ai Chatbot Implementation

This document provides information about the chatbot implementation for the Aback.ai website.

## Overview

The chatbot provides website visitors with instant information about Aback.ai's services, capabilities, and contact information. It uses a hybrid approach:

1. **Local Mode**: Answers common questions from a predefined list
2. **Pinecone Assistant API**: For more complex or unique questions, connects to Pinecone's AI assistant

## Files

- `src/assets/js/chatbot.js`: Main JavaScript implementation of the chatbot UI and logic
- `src/assets/css/chatbot.css`: Styling for the chatbot interface
- `api/chat-proxy.php`: Server-side proxy to securely communicate with Pinecone's API
- `api/config.php`: Configuration for Pinecone API keys and settings
- `src/assets/js/web-config.js`: Front-end configuration

## Configuration

The chatbot requires the following environment variables to be set in your server's `.htaccess` file:

```
SetEnv PINECONE_API_KEY "your_api_key_here"
SetEnv PINECONE_ASSISTANT_NAME "your_assistant_name_here"
```

## How It Works

1. When a user sends a message, the chatbot first checks if it matches any predefined questions in the `commonResponses` object.
2. If a match is found and local mode is enabled, the response is displayed immediately.
3. If no match is found or local mode is disabled, the message is sent to the Pinecone Assistant API through the proxy.
4. The response from Pinecone is formatted and displayed in the chat.

## Conversation History

The chatbot maintains a conversation history to provide context for follow-up questions. This history is limited to the last 10 messages to keep requests efficient.

## Local Mode

By default, `useLocalMode` is set to `true`, meaning the chatbot will attempt to answer from the predefined responses first. Set this to `false` in production to have all questions routed through the Pinecone API.

## Formatting

The chatbot supports basic Markdown-style formatting in responses, including:
- Bold text (`**bold**`)
- Italic text (`*italic*`) 
- Links (`[text](url)`)
- Basic headers (`# Header`, `## Header`, `### Header`)
- Bullet points (`* item`)

## Error Handling

The chatbot includes robust error handling to ensure a smooth user experience even when API connections fail.
