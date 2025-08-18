export default function StatusIcons({ conditions }: { conditions: string[] }) {
  const iconMap: Record<string, { icon: string; color: string; title: string }> = {
    poisoned: { icon: "☠", color: "text-green-400", title: "Отравлен" },
    stunned: { icon: "⚡", color: "text-yellow-400", title: "Оглушён" },
    paralyzed: { icon: "🧊", color: "text-blue-400", title: "Парализован" },
    charmed: { icon: "💖", color: "text-pink-400", title: "Очарован" },
    frightened: { icon: "😱", color: "text-orange-400", title: "Напуган" },
    unconscious: { icon: "😴", color: "text-gray-400", title: "Без сознания" },
    dead: { icon: "💀", color: "text-red-600", title: "Мёртв" },
    blessed: { icon: "✨", color: "text-yellow-300", title: "Благословён" },
    cursed: { icon: "🌑", color: "text-purple-600", title: "Проклят" },
  };

  if (!conditions.length) return null;

  return (
    <div className="flex gap-1 mt-1 justify-center flex-wrap">
      {conditions.map((condition, index) => {
        const statusInfo = iconMap[condition.toLowerCase()];
        if (!statusInfo) return null;
        
        return (
          <span
            key={`${condition}-${index}`}
            className={`${statusInfo.color} text-sm drop-shadow-md`}
            title={statusInfo.title}
          >
            {statusInfo.icon}
          </span>
        );
      })}
    </div>
  );
}