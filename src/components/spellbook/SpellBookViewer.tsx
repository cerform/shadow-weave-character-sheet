
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { SpellData } from '@/types/spells';
import { useSpellbook } from '@/contexts/SpellbookContext';
import SpellImportModal from './SpellImportModal';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { BookOpen as BookOpenIcon, PlusCircle as PlusCircleIcon } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов.",
  }),
  level: z.number().min(0).max(9),
  school: z.string().min(2, {
    message: "Школа должна содержать не менее 2 символов.",
  }),
  castingTime: z.string().min(2, {
    message: "Время кастинга должно содержать не менее 2 символов.",
  }),
  range: z.string().min(2, {
    message: "Дистанция должна содержать не менее 2 символов.",
  }),
  components: z.string().min(2, {
    message: "Компоненты должны содержать не менее 2 символов.",
  }),
  duration: z.string().min(2, {
    message: "Длительность должна содержать не менее 2 символов.",
  }),
  description: z.string().min(10, {
    message: "Описание должно содержать не менее 10 символов.",
  }),
  classes: z.string().min(2, {
    message: "Классы должны содержать не менее 2 символов.",
  }),
})

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

  const form = useForm<z.infer<typeof formSchema>>({
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
      classes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Вы успешно создали заклинание!",
      description: "Вы можете просмотреть его в своей книге заклинаний.",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: currentTheme.textColor }}>
          Книга заклинаний
        </h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={exportSpells}>
            Экспорт
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)}>
            Импорт
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Создать</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Создать заклинание</DialogTitle>
                <DialogDescription>
                  Создайте новое заклинание в своей книге заклинаний.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя</FormLabel>
                        <FormControl>
                          <Input placeholder="Имя заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это имя, которое будет отображаться в вашей книге заклинаний.
                        </FormDescription>
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
                          <Input placeholder="Уровень заклинания" type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это уровень заклинания.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Школа</FormLabel>
                        <FormControl>
                          <Input placeholder="Школа заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это школа заклинания.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="castingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время кастинга</FormLabel>
                        <FormControl>
                          <Input placeholder="Время кастинга заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это время кастинга заклинания.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дистанция</FormLabel>
                        <FormControl>
                          <Input placeholder="Дистанция заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это дистанция заклинания.
                        </FormDescription>
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
                          <Input placeholder="Компоненты заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это компоненты заклинания.
                        </FormDescription>
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
                          <Input placeholder="Длительность заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это длительность заклинания.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Input placeholder="Описание заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это описание заклинания.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="classes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Классы</FormLabel>
                        <FormControl>
                          <Input placeholder="Классы заклинания" {...field} />
                        </FormControl>
                        <FormDescription>
                          Это классы, которые могут использовать это заклинание.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Создать</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {selectedSpells.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Имя</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Школа</TableHead>
                <TableHead>Время кастинга</TableHead>
                <TableHead>Дистанция</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSpells.map((spell) => (
                <TableRow key={spell.id}>
                  <TableCell className="font-medium">{spell.name}</TableCell>
                  <TableCell>{spell.level}</TableCell>
                  <TableCell>{spell.school}</TableCell>
                  <TableCell>{spell.castingTime}</TableCell>
                  <TableCell>{spell.range}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
      {isImportModalOpen && (
        <SpellImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportSpells}
        />
      )}
    </div>
  );
};

export default SpellBookViewer;
