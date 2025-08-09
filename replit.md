# OpenAI Assistant Platform

## Overview

This is a full-stack web application for creating, managing, and interacting with OpenAI assistants. The platform provides a user-friendly interface for configuring AI assistants with custom instructions, tools, and file uploads, while also offering a chat playground for real-time conversations. The application is built as a modern single-page application with a REST API backend and supports both assistant management and conversational AI features.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Primary Database**: PostgreSQL with three main entities:
  - Users: Store user profiles, API keys, and preferences
  - Assistants: Store assistant configurations, OpenAI IDs, and metadata
  - Conversations: Store chat history and thread management
- **Object Storage**: Google Cloud Storage for file uploads with custom metadata-based ACL policies
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing

### Authentication and Authorization
- **File Access Control**: Custom ACL system using object metadata for fine-grained access control
- **User Management**: Simple user creation and profile management without complex authentication flows
- **API Key Management**: User-provided OpenAI API key storage and management

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