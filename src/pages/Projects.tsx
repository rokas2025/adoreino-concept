import React, { useState } from 'react'
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline'

export function Projects() {
  const [projects] = useState([
    {
      id: '1',
      name: 'My Portfolio Site',
      type: 'github',
      status: 'active',
      lastAnalyzed: '2 hours ago',
      description: 'Personal portfolio website built with React',
    },
    {
      id: '2',
      name: 'E-commerce Store',
      type: 'wordpress',
      status: 'active',
      lastAnalyzed: '1 day ago',
      description: 'WooCommerce online store for selling handmade crafts',
    },
    {
      id: '3',
      name: 'Company Blog',
      type: 'zip',
      status: 'paused',
      lastAnalyzed: '1 week ago',
      description: 'Corporate blog with multiple authors',
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-600">Manage your website projects and analyses</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <FolderIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                    <span className="capitalize">{project.type}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    <span>•</span>
                    <span>Last analyzed {project.lastAnalyzed}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn-outline text-sm">Analyze</button>
                <button className="btn-secondary text-sm">Configure</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 