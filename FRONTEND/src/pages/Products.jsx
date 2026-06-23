import React from 'react';
import UrlScanner from '../features/tools/UrlScanner';
import EmailScanner from '../features/tools/EmailScanner';
import MetadataFetcher from '../features/tools/MetadataFetcher';
import TakedownRequest from '../features/tools/TakedownRequest';

export default function Products({ tools, onSelect, selectedTool, onBack, urlInput, setUrlInput, emailFile, setEmailFile, typoDomain, setTypoDomain, takedownDomain, setTakedownDomain, takedownReason, setTakedownReason }) {
    const toolsMap = Object.fromEntries(tools.map(t => [t.id, t]));

    if (!selectedTool) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto py-12 relative z-50">
                {tools.map(tool => (
                    <div
                        key={tool.id}
                        className="p-6 rounded-xl shadow hover:shadow-lg bg-white cursor-pointer transition transform hover:scale-105 flex flex-col items-center text-center"
                        onClick={() => onSelect(tool.id)}
                    >
                        <div className="text-4xl mb-4 text-purple-700">{tool.icon}</div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900">{tool.title}</h3>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                ))}
            </div>
        );
    }

    // detailed view for a selected tool
    const tool = toolsMap[selectedTool];

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start max-w-6xl mx-auto py-12 px-4">
            <div className="md:col-span-2 flex flex-col items-start self-start">
                <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">← Back to Tools</button>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{tool.title}</h2>
                <p className="text-lg text-gray-700 mb-6">{tool.description}</p>
                <div className="text-6xl text-purple-700">{tool.icon}</div>
            </div>
            <div className="md:col-span-3 p-6 bg-white rounded-xl shadow flex flex-col items-center w-full">
                {selectedTool === 'url' && (
                    <UrlScanner urlInput={urlInput} setUrlInput={setUrlInput} />
                )}
                {selectedTool === 'email' && (
                    <EmailScanner setEmailFile={setEmailFile} />
                )}
                {selectedTool === 'metadata' && (
                    <MetadataFetcher typoDomain={typoDomain} setTypoDomain={setTypoDomain} />
                )}
                {selectedTool === 'takedown' && (
                    <TakedownRequest
                        takedownDomain={takedownDomain}
                        setTakedownDomain={setTakedownDomain}
                        takedownReason={takedownReason}
                        setTakedownReason={setTakedownReason}
                    />
                )}
            </div>
        </div>
    );
}
