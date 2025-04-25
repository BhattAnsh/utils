'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = React.forwardRef<HTMLFormElement, React.HTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn('space-y-6', className)}
      {...props}
    />
  )
);
Form.displayName = 'Form';

const FormGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('space-y-2', className)}
    {...props}
  />
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="relative space-y-1">
      <input
        ref={ref}
        className={cn(
          'peer h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          error ? 'border-destructive' : 'border-input',
          className
        )}
        placeholder={label}
        {...props}
      />
      <label
        className={cn(
          'pointer-events-none absolute left-3 top-2 px-1 text-sm transition-all duration-200',
          'peer-placeholder-shown:top-2 peer-placeholder-shown:text-base',
          'peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary',
          'bg-background -top-3 text-sm text-muted-foreground',
          error ? 'text-destructive' : ''
        )}
      >
        {label}
      </label>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
);
FormInput.displayName = 'FormInput';

const FormFieldContext = React.createContext({
  name: '',
});

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  return {
    name: fieldContext.name,
    ...fieldState,
  };
};

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error } = useFormField();

  return (
    <Slot
      ref={ref}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  );
});
FormItem.displayName = 'FormItem';

export {
  Form,
  FormGroup,
  FormInput,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormItem,
  useFormField,
};
