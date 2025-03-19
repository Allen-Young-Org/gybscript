import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
 
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
 
import AuthProvider from './providers/AuthProvider';
 
import SidebarProvider from './providers/SidebarProvider';
 
import { ScaleProvider } from './providers/DetectScaleContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { queryClient } from './api/queryCLient';
 
 

 
const AppLoading = () => (
  <div className="loader-overlay">
    <div className="loader"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
    <ThemeProvider defaultTheme="system" defaultAccentColor="#C09239" storageKey="vite-ui-theme">
      
        <ScaleProvider>
          <SidebarProvider>
            <Suspense fallback={<AppLoading />}>
              <RouterProvider router={router} />
            </Suspense>
             
            </SidebarProvider>
            </ScaleProvider>
       
        </ThemeProvider>
        </AuthProvider>
      {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
}

export default App;