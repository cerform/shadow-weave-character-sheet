# Правила использования React Hooks

## ⚠️ Основные правила (Rules of Hooks)

### 1. Хуки можно вызывать только на верхнем уровне

❌ **НЕПРАВИЛЬНО:**
```tsx
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(0); // ОШИБКА!
  }
  
  items.map(item => {
    const [selected, setSelected] = useState(false); // ОШИБКА!
    return <div>{item.name}</div>;
  });
}
```

✅ **ПРАВИЛЬНО:**
```tsx
function MyComponent() {
  const [state, setState] = useState(0);
  const [selections, setSelections] = useState<Record<string, boolean>>({});
  
  if (condition) {
    setState(1); // Используем состояние
  }
  
  return items.map(item => (
    <div 
      key={item.id}
      onClick={() => setSelections(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }))}
    >
      {item.name}
    </div>
  ));
}
```

### 2. Хуки можно вызывать только в React-компонентах или кастомных хуках

❌ **НЕПРАВИЛЬНО:**
```tsx
// Обычная функция
function formatData(data) {
  const [formatted, setFormatted] = useState(data); // ОШИБКА!
  return formatted;
}
```

✅ **ПРАВИЛЬНО:**
```tsx
// React компонент
function DataFormatter({ data }) {
  const [formatted, setFormatted] = useState(data);
  return <div>{formatted}</div>;
}

// Или кастомный хук
function useFormattedData(data) {
  const [formatted, setFormatted] = useState(data);
  return formatted;
}
```

## 🔧 Типичные сценарии и решения

### Сценарий 1: Состояние для каждого элемента списка

❌ **НЕПРАВИЛЬНО:**
```tsx
function List({ items }) {
  return items.map(item => {
    const [isOpen, setIsOpen] = useState(false); // ОШИБКА!
    return (
      <div onClick={() => setIsOpen(!isOpen)}>
        {item.name}
      </div>
    );
  });
}
```

✅ **РЕШЕНИЕ 1: Словарь состояний**
```tsx
function List({ items }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  return items.map(item => (
    <div 
      key={item.id}
      onClick={() => setOpenItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }))}
    >
      {item.name} {openItems[item.id] && '(открыт)'}
    </div>
  ));
}
```

✅ **РЕШЕНИЕ 2: Отдельный компонент**
```tsx
function ListItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div onClick={() => setIsOpen(!isOpen)}>
      {item.name} {isOpen && '(открыт)'}
    </div>
  );
}

function List({ items }) {
  return items.map(item => (
    <ListItem key={item.id} item={item} />
  ));
}
```

### Сценарий 2: Условное использование хука

❌ **НЕПРАВИЛЬНО:**
```tsx
function Component({ shouldFetch }) {
  if (shouldFetch) {
    const data = useFetch('/api/data'); // ОШИБКА!
  }
}
```

✅ **ПРАВИЛЬНО:**
```tsx
function Component({ shouldFetch }) {
  const data = useFetch(shouldFetch ? '/api/data' : null);
  
  // Или с условием внутри хука
  const data = useFetch('/api/data', { enabled: shouldFetch });
}
```

### Сценарий 3: useEffect внутри .map()

❌ **НЕПРАВИЛЬНО:**
```tsx
function Tokens({ tokens }) {
  return tokens.map(token => {
    useEffect(() => { // ОШИБКА!
      console.log('Token updated:', token.id);
    }, [token]);
    
    return <Token data={token} />;
  });
}
```

✅ **РЕШЕНИЕ 1: Отдельный компонент**
```tsx
function TokenItem({ token }) {
  useEffect(() => {
    console.log('Token updated:', token.id);
  }, [token]);
  
  return <Token data={token} />;
}

function Tokens({ tokens }) {
  return tokens.map(token => (
    <TokenItem key={token.id} token={token} />
  ));
}
```

✅ **РЕШЕНИЕ 2: Один useEffect для всех**
```tsx
function Tokens({ tokens }) {
  useEffect(() => {
    tokens.forEach(token => {
      console.log('Token updated:', token.id);
    });
  }, [tokens]);
  
  return tokens.map(token => (
    <Token key={token.id} data={token} />
  ));
}
```

### Сценарий 4: Циклы и хуки

❌ **НЕПРАВИЛЬНО:**
```tsx
function Component() {
  for (let i = 0; i < 5; i++) {
    const [value, setValue] = useState(i); // ОШИБКА!
  }
}
```

✅ **ПРАВИЛЬНО:**
```tsx
function Component() {
  const [values, setValues] = useState<number[]>([0, 1, 2, 3, 4]);
  
  // Работаем с массивом значений
  return values.map((value, i) => (
    <div key={i}>
      <input 
        value={value}
        onChange={e => {
          const newValues = [...values];
          newValues[i] = Number(e.target.value);
          setValues(newValues);
        }}
      />
    </div>
  ));
}
```

## 🎯 React Three Fiber: useFrame

### Проблема с useFrame в .map()

❌ **НЕПРАВИЛЬНО:**
```tsx
function Scene({ tokens }) {
  return tokens.map(token => {
    useFrame(() => { // ОШИБКА! Количество хуков меняется при изменении tokens
      // анимация
    });
    return <mesh />;
  });
}
```

✅ **РЕШЕНИЕ 1: Стабилизация массива**
```tsx
function Scene({ tokens }) {
  // Стабилизируем массив с useMemo
  const stableTokens = useMemo(() => {
    return tokens.filter(t => t && t.id);
  }, [tokens]);
  
  return stableTokens.map(token => (
    <AnimatedToken key={token.id} token={token} />
  ));
}

function AnimatedToken({ token }) {
  useFrame(() => {
    // анимация для одного токена
  });
  return <mesh />;
}
```

✅ **РЕШЕНИЕ 2: Один useFrame для всех**
```tsx
function Scene({ tokens }) {
  const meshRefs = useRef<Record<string, THREE.Mesh>>({});
  
  useFrame(() => {
    tokens.forEach(token => {
      const mesh = meshRefs.current[token.id];
      if (mesh) {
        // анимация
      }
    });
  });
  
  return tokens.map(token => (
    <mesh 
      key={token.id}
      ref={ref => {
        if (ref) meshRefs.current[token.id] = ref;
      }}
    />
  ));
}
```

## 📚 Дополнительные ресурсы

- [Rules of Hooks - React Documentation](https://react.dev/reference/rules/rules-of-hooks)
- [ESLint Plugin: eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [React Three Fiber Best Practices](https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls)
