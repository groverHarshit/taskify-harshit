import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Clock, Calendar, List } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Tasks', value: '24', icon: <List className="h-6 w-6 text-blue-500" /> },
    { name: 'Completed', value: '16', icon: <CheckSquare className="h-6 w-6 text-green-500" /> },
    { name: 'In Progress', value: '8', icon: <Clock className="h-6 w-6 text-yellow-500" /> },
    { name: 'Upcoming', value: '5', icon: <Calendar className="h-6 w-6 text-purple-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.username}! Here's your task overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                {stat.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-5 border-t border-gray-200 pt-5">
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                    index % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {index % 2 === 0 ? 'Completed task' : 'Created new task'}: Example Task {index + 1}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(Date.now() - (index * 86400000)).toLocaleDateString()} at {
                        new Date(Date.now() - (index * 3600000)).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;