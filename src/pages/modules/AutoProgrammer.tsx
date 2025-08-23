import React from 'react'
import { CommandLineIcon } from '@heroicons/react/24/outline'

export function AutoProgrammer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CommandLineIcon className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Auto Programmer</h1>
          <p className="text-gray-600">Chat-based feature requests and automatic code generation</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Auto Programming</h3>
        <p className="text-gray-600">Auto programming features coming soon...</p>
      </div>
    </div>
  )
} 