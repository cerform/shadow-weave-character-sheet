
import React from 'react';

declare module "@/components/ui/separator" {
  export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    decorative?: boolean;
    orientation?: "horizontal" | "vertical";
    className?: string;
    children?: React.ReactNode;
  }
}

declare module "@/components/ui/tabs" {
  export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    children?: React.ReactNode;
    className?: string;
    key?: string;
  }
  
  export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    children?: React.ReactNode;
    className?: string;
  }
}

declare module "@/components/ui/scroll-area" {
  export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    className?: string;
  }
}

declare module "@/components/ui/popover" {
  export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    children?: React.ReactNode;
  }
}

declare module "@/components/ui/dropdown-menu" {
  export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    children?: React.ReactNode;
  }
  
  export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    inset?: boolean;
    children?: React.ReactNode;
  }
}

declare module "@/components/ui/label" {
  export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children?: React.ReactNode;
    htmlFor?: string;
  }
}

declare module "@/components/ui/switch" {
  export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
  }
}

declare module "@/components/ui/radio-group" {
  export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    id?: string;
    children?: React.ReactNode;
  }
}
