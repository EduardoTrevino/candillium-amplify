"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

export default function TodoApp() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    if (user) {
      subscription = client.models.Todo.observeQuery().subscribe({
        next: ({ items }) => setTodos(items),
        error: (error) => console.error('Subscription error:', error),
      });
    } else {
      // Clear todos when user signs out
      setTodos([]);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt('Todo content'),
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Todos</h1>
      <button onClick={createTodo}>+ New Todo</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
            {todo.content}
          </li>
        ))}
      </ul>
      <button onClick={signOut}>Sign Out</button>
    </main>
  );
}
