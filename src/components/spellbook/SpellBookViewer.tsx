
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useSpellbook } from '@/contexts/SpellbookContext';
import SpellImportModal from './SpellImportModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BookOpen as BookOpenIcon, PlusCircle as PlusCircleIcon } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов."
  }),
  level: z.number().min(0).max(9),
  school: z.string().min(2, {
    message: "Школа должна содержать не менее 2 символов."
  }),
  castingTime: z.string().min(2, {
    message: "Время кастинга должно содержать не менее 2 символов."
  }),
  range: z.string().min(2, {
    message: "Дистанция должна содержать не менее 2 символов."
  }),
  components: z.string().min(2, {
    message: "Компоненты должны содержать не менее 2 символов."
  }),
  duration: z.string().min(2, {
    message: "Длительность должна содержать не менее 2 символов."
  }),
  description: z.string().min(10, {
    message: "Описание должно содержать не менее 10 символов."
  }),
  classes: z.string().min(2, {
    message: "Классы должны содержать не менее 2 символов."
  })
});

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-4">
        <BookOpenIcon className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold">Ваша книга заклинаний пуста</h2>
      <p className="text-muted-foreground mt-2 mb-6">
        Добавьте заклинания из базы данных или импортируйте их
      </p>
      <Button>
        <PlusCircleIcon className="mr-2 h-4 w-4" />
        Добавить заклинание
      </Button>
    </div>
  );
};

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { selectedSpells, loadSpells, exportSpells, importSpells } = useSpellbook();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSpells();
  }, [loadSpells]);

  const handleImportSpells = (spells: any) => {
    importSpells(spells);
    setIsImportModalOpen(false);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: 0,
      school: "",
      castingTime: "",
      range: "",
      components: "",
      duration: "",
      description: "",
      classes: ""
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Вы успешно создали заклинание!",
      description: "Вы можете просмотреть его в своей книге заклинаний."
    });
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-3xl font-bold"
          style={{ color: currentTheme.textColor }}
        >
          Книга заклинаний
        </h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={exportSpells}
          >
            Экспорт
          </Button>
          <Button
            onClick={() => setIsImportModalOpen(true)}
          >
            Импорт
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Создать</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Создать новое заклинание</DialogTitle>
                <DialogDescription>
                  Заполните информацию о заклинании. Нажмите сохранить, когда закончите.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Основная информация о заклинании */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название</FormLabel>
                          <FormControl>
                            <Input placeholder="Магическая стрела" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Уровень</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field} 
                              onChange={e => field.onChange(+e.target.value)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Школа и время накладывания */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="school"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Школа</FormLabel>
                          <FormControl>
                            <Input placeholder="Воплощение" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="castingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Время накладывания</FormLabel>
                          <FormControl>
                            <Input placeholder="1 действие" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Дальность, компоненты, длительность */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="range"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дальность</FormLabel>
                          <FormControl>
                            <Input placeholder="120 футов" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="components"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Компоненты</FormLabel>
                          <FormControl>
                            <Input placeholder="В, С" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Длительность</FormLabel>
                          <FormControl>
                            <Input placeholder="Мгновенная" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Описание */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Опишите действие заклинания..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Классы */}
                  <FormField
                    control={form.control}
                    name="classes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Классы</FormLabel>
                        <FormControl>
                          <Input placeholder="Волшебник, Чародей" {...field} />
                        </FormControl>
                        <FormDescription>
                          Перечислите через запятую классы, которые могут использовать это заклинание.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">Создать заклинание</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SpellImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImport={handleImportSpells}
      />

      {selectedSpells.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-card rounded-md shadow">
          <div className="p-4">
            <Input 
              placeholder="Поиск заклинаний..." 
              className="max-w-sm mb-4"
            />
          </div>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Ур.</TableHead>
                  <TableHead>Школа</TableHead>
                  <TableHead>Время накладывания</TableHead>
                  <TableHead>Дистанция</TableHead>
                  <TableHead>Компоненты</TableHead>
                  <TableHead>Длительность</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSpells.map((spell) => (
                  <TableRow 
                    key={spell.id} 
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    <TableCell className="font-medium">{spell.name}</TableCell>
                    <TableCell>{spell.level}</TableCell>
                    <TableCell>{spell.school}</TableCell>
                    <TableCell>{spell.castingTime}</TableCell>
                    <TableCell>{spell.range}</TableCell>
                    <TableCell>{spell.components}</TableCell>
                    <TableCell>{spell.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
