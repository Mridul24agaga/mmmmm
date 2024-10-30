'use client'

import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart, Skull, X } from "lucide-react"; // Added X import
import confetti from 'canvas-confetti';
import { useCallback, useState } from "react";
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastRootProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

interface ToastProps {
  variant?: "default" | "destructive"
  title?: string
  description?: string
  action?: ToastActionElement
}

const toastStore = {
  toasts: new Set<ToastProps>(),
  listeners: new Set<() => void>(),
  addToast(toast: ToastProps) {
    this.toasts.add(toast)
    this.listeners.forEach((listener) => listener())
    setTimeout(() => {
      this.toasts.delete(toast)
      this.listeners.forEach((listener) => listener())
    }, 5000)
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  React.useEffect(() => {
    return toastStore.subscribe(() => {
      setToasts(Array.from(toastStore.toasts))
    })
  }, [])

  return {
    toasts,
    toast: (props: ToastProps) => {
      toastStore.addToast(props)
    },
    dismiss: (toastId?: string) => {
      // Implementation for dismissing toasts
    }
  }
}

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];
  const [showGhost, setShowGhost] = useState(false);

  const triggerEffects = useCallback(() => {
    // Halloween colors
    const colors = ['#ff6b6b', '#ff8c00', '#4a0404', '#000000'];
    
    // Show ghost animation
    setShowGhost(true);
    setTimeout(() => setShowGhost(false), 2000);
    
    // Confetti burst with Halloween colors
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      shapes: ['circle', 'square'],
    });

    // Spooky side bursts
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        shapes: ['circle'],
        scalar: 2,
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        shapes: ['circle'],
        scalar: 2,
      });
    }, 150);
  }, []);

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      if (!previousState?.isLikedByUser) {
        triggerEffects();
      }

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <>
      <ToastProvider>
        <div className="relative">
          {showGhost && (
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <div className="relative">
                <div className="absolute animate-float-up-right opacity-0">
                  👻
                </div>
                <div className="absolute animate-float-up-left opacity-0">
                  🎃
                </div>
                <div className="absolute animate-float-up opacity-0">
                  💀
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => mutate()} 
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              !data.isLikedByUser && "hover:scale-110 hover:rotate-3",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "group relative"
            )}
            aria-label={data.isLikedByUser ? "Unlike post" : "Like post"}
          >
            {data.isLikedByUser ? (
              <Heart
                className="size-5 fill-red-500 text-red-500 scale-110 animate-pulse"
              />
            ) : (
              <div className="relative">
                <Heart className="size-5 transition-all duration-300 group-hover:opacity-0" />
                <Skull className="size-5 text-orange-500 absolute top-0 left-0 transition-all duration-300 opacity-0 group-hover:opacity-100 animate-wiggle" />
              </div>
            )}
            <span className="text-sm font-medium tabular-nums group-hover:text-orange-500 transition-colors duration-300">
              {data.likes} <span className="hidden sm:inline">likes</span>
            </span>
          </button>
        </div>
        <ToastViewport />
      </ToastProvider>
    </>
  );
}