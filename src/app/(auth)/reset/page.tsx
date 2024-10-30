'use client'

import { useState } from 'react'

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PasswordResetForm() {
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Reset token sent. Use this token to reset your password: ' + data.resetToken)
        setStep(2)
      } else {
        setMessage(data.error || 'Failed to send reset token.')
      }
    } catch (error) {
      setMessage('An error occurred.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Password reset successfully.')
        setStep(1) // Return to first step after successful reset
      } else {
        setMessage(data.error || 'Failed to reset password.')
      }
    } catch (error) {
      setMessage('An error occurred.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {step === 1 
              ? "Enter your email to reset your password."
              : "Enter the reset token and your new password."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Request Reset</Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetToken">Reset Token</Label>
                <Input
                  id="resetToken"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Reset Password</Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {message && (
            <>
              {message.includes('Reset token sent') ? (
                <div className="w-full rounded-lg bg-yellow-100 border border-yellow-200 p-4 text-sm text-yellow-800">
                  <p className="font-medium mb-1">Token Generated Successfully!</p>
                  <p>Please copy your reset token below and paste it in the Reset Token field</p>
                  <code className="mt-2 block w-full bg-yellow-50 p-2 rounded border border-yellow-200 font-mono text-yellow-900">
                    {message.split(': ')[1]}
                  </code>
                  <p className="mt-2 text-xs">
                    Keep this token safe and use it along with your new password in the form above.
                  </p>
                </div>
              ) : message.includes('successfully') ? (
                <div className="w-full rounded-lg bg-green-100 border border-green-200 p-3 text-sm text-green-800">
                  {message}
                </div>
              ) : (
                <div className="w-full rounded-lg bg-red-100 border border-red-200 p-3 text-sm text-red-800">
                  {message}
                </div>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 py-2 px-4",
        className
      )}
      {...props}
    />
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}