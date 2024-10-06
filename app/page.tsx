"use client";

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import TodoApp from '@/app/components/todoapp';

Amplify.configure(outputs);

export default function App() {
  return (
    <Authenticator>
      <TodoApp />
    </Authenticator>
  );
}
