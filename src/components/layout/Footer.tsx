const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="bg-[#C09239] dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-white dark:text-gray-400">
                &copy; {currentYear} GYB Script. All rights reserved.
              </p>
            </div>

            <div className="flex space-x-6">
              <a
                href="#"
                className="text-white dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-white dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;