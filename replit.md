# OpenAI Assistant Platform

## Overview

This is a full-stack web application for creating, managing, and interacting with OpenAI assistants. The platform provides a user-friendly interface for configuring AI assistants with custom instructions, tools, and file uploads, while also offering a chat playground for real-time conversations. The application is built as a modern single-page application with a REST API backend and supports both assistant management and conversational AI features.

## User Preferences

Preferred communication style: Simple, everyday language.
Primary language: Russian (Русский язык)
Assistant Configuration: 
- Always include database update algorithm in system instructions
- System prompts are stored separately from user-visible instructions
- System prompts automatically execute on each assistant activation

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **File Uploads**: Uppy with AWS S3 integration for handling file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **File Storage**: Google Cloud Storage with custom ACL (Access Control List) system
- **AI Integration**: OpenAI API for assistant creation and conversation management

### Data Storage Solutions
- **Primary Database**: PostgreSQL with comprehensive data protection:
  - Users: Store user profiles, API keys, and preferences
  - Assistants: Store assistant configurations, OpenAI IDs, and metadata with automatic restoration
  - Conversations: Store chat history and thread management
  - Google Docs Documents: Store indexed document metadata and content
- **Object Storage**: Google Cloud Storage for file uploads with custom metadata-based ACL policies
- **Data Protection**: Automatic database initialization with demo data and assistant recovery on startup
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing

### Authentication and Authorization
- **File Access Control**: Custom ACL system using object metadata for fine-grained access control
- **User Management**: Simple user creation and profile management without complex authentication flows
- **API Key Management**: User-provided OpenAI API key storage and management

### Data Integrity and Protection
- **Automatic Database Initialization**: Creates demo user and sample assistants on each startup
- **Assistant Recovery System**: Automatically restores OpenAI assistant connections if IDs are lost
- **Data Persistence**: Comprehensive protection against accidental data deletion
- **Startup Validation**: Verifies and repairs data integrity on application startup
- **Backup Integration**: All assistants are automatically recreated in OpenAI if lost
- **File Attachment System**: Fixed file upload and attachment to assistants with proper OpenAI API integration
- **UI Layout Protection**: Implemented overflow controls and proper constraints to prevent content from going off-screen
- **Google Docs Integration**: Automatic context loading from Google Docs when creating new conversations
- **Instruction Templates**: Built-in algorithm templates for database updates and document checking
- **System Prompt Separation**: System prompts stored separately from user instructions for automatic execution
- **URL-Based Document Checking**: Support for specific Google Docs URLs in system prompts for targeted updates

## External Dependencies

### Core Services
- **OpenAI API**: Assistant creation, thread management, and conversation handling
- **Google Cloud Storage**: File storage with Replit sidecar authentication
- **Neon Database**: PostgreSQL hosting with serverless capabilities

### Development Tools
- **Replit Integration**: Development environment with cartographer plugin and runtime error overlay
- **Vite Plugins**: Hot module replacement and development tooling
- **Drizzle Kit**: Database migration and schema management

### UI and UX Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Uppy**: File upload handling with dashboard interface and AWS S3 support
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date formatting and manipulation utilities

### Type Safety and Validation
- **Zod**: Runtime type validation and schema definition
- **TypeScript**: Static type checking across the full stack
- **Drizzle-Zod**: Integration between database schema and runtime validation