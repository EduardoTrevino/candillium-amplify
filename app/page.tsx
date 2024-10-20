"use client";

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
// Import Amplify Authenticator styles here if needed globally
// import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import Dashboard from '@/app/pages/dashboard';  // Your Dashboard component
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

Amplify.configure(outputs);

export default function App() {

  return (
    <Authenticator>
      {({ user }) =>
        user ? (
          <Dashboard />  // Render dashboard after user authentication
        ) : (
          <div>
            {/* Authentication screen rendering */}
            <p>Signing you in :) ...</p>
          </div>
        )
      }
    </Authenticator>
  );
}
