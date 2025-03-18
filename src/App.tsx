import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
 
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
 
import AuthProvider from './providers/AuthProvider';
 
import SidebarProvider from './providers/SidebarProvider';
 
import { ScaleProvider } from './providers/DetectScaleContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { queryClient } from './api/queryCLient';
 
 

// Loading component
const AppLoading = () => (
  <div className="loader-overlay">
    <div className="loader"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
        <ScaleProvider>
          <SidebarProvider>
            <Suspense fallback={<AppLoading />}>
              <RouterProvider router={router} />
            </Suspense>
             
            </SidebarProvider>
            </ScaleProvider>
        </AuthProvider>
      </ThemeProvider>
      {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
}

export default App;