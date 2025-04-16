# InstantLegal AI – Legal Document Generator

A modern web application that generates professional legal documents using OpenAI's GPT-4 API and iTextSharp for PDF generation.

## Features

- AI-powered legal document generation
- Multiple document types (NDA, Terms of Service, Privacy Policy, etc.)
- Customization based on business type, industry, and state
- PDF generation and download
- Responsive web interface
- Stripe payment integration

## Tech Stack

- **Backend**: C#, ASP.NET Core
- **AI**: OpenAI GPT-4 API
- **PDF Generation**: iTextSharp
- **Frontend**: React, TypeScript
- **Payment Processing**: Stripe
- **Security**: CORS protection

## Installation

### Prerequisites

- .NET 7.0 SDK
- Node.js 16+
- Stripe API key
- OpenAI API key

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/StephanFWard/InstantLegalDoc.git
   cd instantlegal-ai/app
   
2. **Configure settings:**

Copy example.settings.json to appsettings.json in the backend project directory.

2. **Fill in your API keys:**

{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Stripe": {
    "SecretKey": "your_stripe_secret_key_here",
    "PublishableKey": "your_stripe_publishable_key_here"
  },
  "OpenAI": {
    "ApiKey": "your_openai_api_key_here"
  }
}

3. **Replace the placeholder values with your actual Stripe and OpenAI API keys.**

4. **Restore and build dependencies:**

   ```bash
   dotnet restore
   dotnet build
  
5. **Run the backend:**

   ```bash
   dotnet run
  
The API will be available at https://localhost:5001 (or as configured).

6. **Frontend Setup**

   ```bash
   cd ../client
  
7. **Install dependencies:**

   ```bash
   npm install
  
8. **Start the frontend:**

   ```bash
   npm start
  
The React app will be available at http://localhost:3000 by default.

**Deployment**

Environment Variables:

1. Ensure your production environment has the following variables set (or in appsettings.json):

2. Stripe:SecretKey

3. Stripe:PublishableKey

4. OpenAI:ApiKey

5. Set ASPNETCORE_ENVIRONMENT to Production for production deployments.

**Backend Deployment**

Deploy the ASP.NET Core backend to your preferred cloud provider (Azure App Service, AWS Elastic Beanstalk, etc.).

Ensure the Documents directory is writable by the application for PDF generation.

Expose the necessary ports and configure HTTPS.

**Frontend Deployment**

Deploy the contents of the build directory to your static hosting provider (Vercel, Netlify, AWS S3, etc.).

Stripe and OpenAI Configuration
Make sure your Stripe and OpenAI API keys are valid and have the necessary permissions.

Build the React app for production:

   ```bash
   npm run build
