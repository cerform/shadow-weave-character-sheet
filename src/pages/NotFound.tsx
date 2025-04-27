export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Страница не найдена</h1>
        <p className="mt-4 text-lg">Похоже, вы заблудились.</p>
        <a
          href="/"
          className="mt-6 inline-block text-primary hover:underline"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
