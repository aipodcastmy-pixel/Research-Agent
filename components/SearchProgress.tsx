import React from 'react';

interface SearchProgressProps {
  queries: string[];
  currentQuery: string | null | undefined;
}

export const Spinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const PendingIcon: React.FC = () => (
    <div className="h-4 w-4 flex items-center justify-center">
       <div className="h-2 w-2 rounded-full bg-slate-600"></div>
    </div>
);


export const SearchProgress: React.FC<SearchProgressProps> = ({ queries, currentQuery }) => {
  const currentIndex = currentQuery ? queries.indexOf(currentQuery) : -1;

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Executing Research Plan...</h3>
        <ul className="space-y-2">
            {queries.map((query, index) => {
                const isCompleted = currentIndex > index;
                const isInProgress = currentIndex === index;

                return (
                    <li key={index} className="flex items-center space-x-3 text-sm">
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            {isInProgress ? <Spinner /> : isCompleted ? <CheckIcon /> : <PendingIcon />}
                        </div>
                        <span className={`transition-colors duration-300 ${
                            isInProgress ? 'text-sky-400' : isCompleted ? 'text-slate-400 line-through' : 'text-slate-500'
                        }`}>
                            {query}
                        </span>
                    </li>
                );
            })}
        </ul>
    </div>
  );
};