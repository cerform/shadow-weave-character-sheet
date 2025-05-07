
import * as React from "react";
import { type TabsProps, type TabsListProps, type TabsTriggerProps } from "@radix-ui/react-tabs";
import { type SeparatorProps } from "@radix-ui/react-separator";
import { type ScrollAreaProps } from "@radix-ui/react-scroll-area";
import { type DropdownMenuTriggerProps, type DropdownMenuItemProps } from "@radix-ui/react-dropdown-menu";
import { type LabelProps } from "@radix-ui/react-label";
import { type SwitchProps } from "@radix-ui/react-switch";
import { type RadioGroupProps, type RadioGroupItemProps } from "@radix-ui/react-radio-group";
import { VariantProps } from "class-variance-authority";

// Расширяем интерфейсы компонентов shadcn/ui, чтобы они принимали children
declare module '@radix-ui/react-tabs' {
  interface TabsProps {
    children?: React.ReactNode;
  }
  
  interface TabsListProps {
    children?: React.ReactNode;
  }
  
  interface TabsTriggerProps {
    children?: React.ReactNode;
  }
}

declare module '@radix-ui/react-separator' {
  interface SeparatorProps {
    className?: string;
  }
}

declare module '@radix-ui/react-scroll-area' {
  interface ScrollAreaProps {
    children?: React.ReactNode;
  }
}

declare module '@radix-ui/react-dropdown-menu' {
  interface DropdownMenuTriggerProps {
    children?: React.ReactNode;
  }
  
  interface DropdownMenuItemProps {
    children?: React.ReactNode;
  }
}

declare module '@radix-ui/react-label' {
  interface LabelProps {
    children?: React.ReactNode;
  }
}

declare module '@radix-ui/react-switch' {
  interface SwitchProps {
    id?: string;
  }
}

declare module '@radix-ui/react-radio-group' {
  interface RadioGroupProps {
    children?: React.ReactNode;
  }
  
  interface RadioGroupItemProps {
    id?: string;
  }
}

// Расширение для стилей framer-motion
declare module 'framer-motion' {
  export interface MotionStyle extends React.CSSProperties {
    left?: string | number;
    mixBlendMode?: string;
  }
}

// Общее расширение для CSSProperties
declare module 'react' {
  interface CSSProperties {
    mixBlendMode?: string;
  }
}
