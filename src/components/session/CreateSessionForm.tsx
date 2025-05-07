import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoaderIcon } from 'lucide-react';

interface CreateSessionFormProps {
  onSubmit: (data: { name: string, description: string }) => void;
  isLoading?: boolean;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  });

  const onFormSubmit = (data: { name: string, description: string }) => {
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Название сессии</Label>
          <Input 
            id="name" 
            placeholder="Введите название сессии" 
            {...register("name", { required: 'Название сессии обязательно' })} 
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea 
            id="description" 
            placeholder="Добавьте описание сессии (необязательно)" 
            {...register("description")} 
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isLoading || !isValid}
      >
        {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        Создать сессию
      </Button>
    </form>
  );
};

export default CreateSessionForm;
