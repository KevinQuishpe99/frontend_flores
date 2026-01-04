import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Accordion({ title, children, defaultOpen = false, icon, className = '' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-primary-50 hover:to-white transition-all duration-300 flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600 group-hover:bg-primary-200 transition-colors">
              {icon}
            </div>
          )}
          <span className="font-bold text-gray-900 text-sm sm:text-base">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-primary-50 transition-colors"
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

