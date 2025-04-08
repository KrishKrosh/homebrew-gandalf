'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { clearClientAuthCookie, getClientAuthStatus } from '@/lib/auth';
import { openBothDoors, ApiErrorType } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDoorOpenDialog, setShowDoorOpenDialog] = useState(false);
  const [doorStatus, setDoorStatus] = useState<'idle' | 'opening' | 'opened'>('idle');
  const [errorDetails, setErrorDetails] = useState<{ visible: boolean; message: string; title: string }>({
    visible: false,
    message: '',
    title: 'Error'
  });
  const [isOffline, setIsOffline] = useState(false);

  // Check authentication on client side (optional secondary check)
  useEffect(() => {
    if (!getClientAuthStatus()) {
      router.push('/login');
    }
  }, [router]);

  // Monitor online/offline status
  useEffect(() => {
    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('You are back online');
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error('You are offline. Door controls will not function until connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sound effect for door opening
  const playDoorSound = () => {
    const audio = new Audio('/sounds/door-open.mp3');
    audio.play().catch(err => console.error('Failed to play sound:', err));
  };

  const handleErrorByType = (error: any) => {
    let title = 'Connection Error';
    let message = 'Failed to connect to the door system. Please try again later.';
    
    if (error.errorType) {
      switch (error.errorType) {
        case ApiErrorType.NETWORK:
          title = 'Network Error';
          message = 'Unable to reach the door controller. Please check your network connection and ensure the controller is online.';
          break;
        case ApiErrorType.TIMEOUT:
          title = 'Request Timeout';
          message = 'The door controller is taking too long to respond. It may be offline or experiencing issues.';
          break;
        case ApiErrorType.UNAUTHORIZED:
          title = 'Authorization Error';
          message = 'Your session is invalid or expired. Please log in again.';
          // Force logout on auth error
          setTimeout(() => {
            clearClientAuthCookie();
            router.push('/login');
          }, 3000);
          break;
        case ApiErrorType.SERVER:
          title = 'Door Controller Error';
          message = 'The door controller reported an error: ' + error.message;
          break;
        default:
          title = 'Unexpected Error';
          message = error.message || 'An unknown error occurred while communicating with the door controller.';
      }
    }
    
    setErrorDetails({
      visible: true,
      title,
      message
    });
  };

  const handleOpenDoors = async () => {
    // Don't even try if offline
    if (isOffline) {
      setErrorDetails({
        visible: true,
        title: 'Offline',
        message: 'You appear to be offline. Please check your connection and try again.'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await openBothDoors();
      
      if (result.success) {
        setDoorStatus('opening');
        setShowDoorOpenDialog(true);
        
        // Play sound effect
        setTimeout(() => {
          playDoorSound();
        }, 500);
        
        // Set to opened after animation completes
        setTimeout(() => {
          setDoorStatus('opened');
        }, 10000);
      } else {
        // Handle error with the error dialog
        handleErrorByType(result);
      }
    } catch (error) {
      console.error('Door open error:', error);
      setErrorDetails({
        visible: true,
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again or contact support.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearClientAuthCookie();
    router.push('/login');
  };

  const closeErrorDialog = () => {
    setErrorDetails(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b border-border py-4 px-6 bg-card">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 coffee-steam">
                <Image 
                  src="/images/coffee-cup.svg" 
                  alt="Homebrew Logo" 
                  width={40} 
                  height={40}
                  className="rounded-full bg-secondary p-1"
                />
              </div>
              <h1 className="text-2xl font-bold text-primary">Homebrew Gandalf</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {isOffline && (
            <Alert variant="destructive" className="mb-6 mx-auto max-w-2xl">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>Offline</AlertTitle>
              <AlertDescription>
                You are currently offline. Door controls will not function until your connection is restored.
              </AlertDescription>
            </Alert>
          )}

          <div className="max-w-2xl mx-auto">
            <Card className="border-border shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Door Control System</CardTitle>
                <CardDescription>
                  Welcome to the Homebrew Gandalf door control system
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 py-6">
                <div className="relative w-32 h-32">
                  <Image 
                    src="/images/door-control.svg" 
                    alt="Door Control" 
                    width={128} 
                    height={128}
                    className="rounded-full bg-secondary/30 p-5"
                  />
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-foreground text-lg">
                    Click the button below to open both doors and allow entry
                  </p>
                  
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 text-lg"
                    onClick={handleOpenDoors}
                    disabled={isLoading || isOffline}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> 
                        Processing...
                      </span>
                    ) : isOffline ? (
                      <span className="flex items-center justify-center">
                        <WifiOff className="w-5 h-5 mr-2" />
                        Offline
                      </span>
                    ) : (
                      'Open Doors'
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
                <p>You will hear a sound when the doors open!</p>
                <p className="mt-2">Contact your resident if there are any issues</p>
              </CardFooter>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-6 bg-card">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>Homebrew Gandalf Door Control System &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>

      {/* Door Opening Dialog */}
      <Dialog open={showDoorOpenDialog} onOpenChange={setShowDoorOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {doorStatus === 'opening' 
                ? 'Opening Doors...' 
                : 'Doors Opened Successfully!'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {doorStatus === 'opening' 
                ? 'Please wait approximately 10 seconds for the doors to fully open. You will hear a sound when the process begins.' 
                : 'The doors have been successfully opened. You may now enter.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center p-6">
            {doorStatus === 'opening' ? (
              <div className="loading-spinner"></div>
            ) : (
              <div className="text-center text-green-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            )}
          </div>

          <DialogFooter className="text-center">
            <p className="w-full text-muted-foreground">
              Contact your resident if there are any issues
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDetails.visible} onOpenChange={closeErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive text-center">
              {errorDetails.title}
            </DialogTitle>
            <DialogDescription className="text-center">
              {errorDetails.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-right" />
    </>
  );
} 