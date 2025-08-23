import React from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export function ContentAnalyst() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <DocumentTextIcon className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Content Analyst</h1>
          <p className="text-gray-600">Analyze content for grammar, readability, and SEO optimization</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Analysis</h3>
        <p className="text-gray-600">Content analysis features coming soon...</p>
      </div>
    </div>
  )
} 