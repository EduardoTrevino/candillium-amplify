"use client";

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import TodoApp from './TodoApp';

Amplify.configure(outputs);

export default function App() {
  return (
    <Authenticator>
      <TodoApp />
    </Authenticator>
  );
}
