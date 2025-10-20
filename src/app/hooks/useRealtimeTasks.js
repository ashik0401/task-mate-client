import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadTasks();
    const subscription = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          handleRealtimeUpdate(payload);
          showNotification(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTasks(data);
    }
  };

  const handleRealtimeUpdate = (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        setTasks(prev => [payload.new, ...prev]);
        break;
      case 'UPDATE':
        setTasks(prev => 
          prev.map(task => 
            task.id === payload.new.id ? payload.new : task
          )
        );
        break;
      case 'DELETE':
        setTasks(prev => 
          prev.filter(task => task.id !== payload.old.id)
        );
        break;
    }
  };

  const showNotification = (payload) => {
    let message = '';
    switch (payload.eventType) {
      case 'INSERT':
        message = `🎯 New task: "${payload.new.title}"`;
        break;
      case 'UPDATE':
        message = `✏️ Task updated: "${payload.new.title}"`;
        break;
      case 'DELETE':
        message = `🗑️ Task deleted`;
        break;
    }

    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  return { tasks, notification, setNotification };
};
