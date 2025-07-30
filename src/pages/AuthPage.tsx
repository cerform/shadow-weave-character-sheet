
import React from 'react';

console.log('AuthPage: Файл загружается');

const AuthPage = () => {
  console.log('AuthPage: Компонент рендерится');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          marginBottom: '20px', 
          textAlign: 'center',
          color: '#333'
        }}>
          Страница Авторизации
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#666'
        }}>
          Эта страница работает правильно
        </p>
        
        <button 
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => {
            console.log('Кнопка нажата');
            window.location.href = '/';
          }}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

console.log('AuthPage: Экспорт компонента');

export default AuthPage;
