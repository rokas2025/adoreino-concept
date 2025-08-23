import React from 'react'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

export function ContentCreator() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <PlusCircleIcon className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Content Creator</h1>
          <p className="text-gray-600">Generate new content with SEO optimization and multilingual support</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Creation</h3>
        <p className="text-gray-600">Content creation features coming soon...</p>
      </div>
    </div>
  )
} 